#!/usr/bin/env python3
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from statistics import median
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

API_URL = "https://serpapi.com/search.json"
KEY = os.environ.get("SERPAPI_KEY", "").strip()
FARES_PATH = Path("data/travelpayouts_fares.json")
OUT_PATH = Path("data/serpapi_google_flights.json")
MAX_QUERIES = 6
RECHECK_HOURS = 18

REGIONS = {
    "JP": {"KIX","NRT","HND","FUK","CTS","OKA","NGO","MMY"},
    "SEA": {"TPE","KHH","HKG","MFM","BKK","CNX","HKT","SIN","KUL","BKI","DPS","DAD","CXR","HAN","SGN","PQC","CEB","MNL","MPH"},
    "CN_CENTRAL": {"ULN","PVG","PEK","PKX","TAO","CAN","SZX","XIY","CTU","ALA","TAS"},
    "EU_ME": {"DXB","AUH","DOH","IST","LHR","CDG","FCO","MXP","FRA","MUC","AMS","MAD","BCN","VIE","PRG","BUD","ZRH","HEL","WAW"},
    "AMERICAS": {"LAX","SFO","SEA","JFK","YVR","YYZ","HNL"},
    "OCEANIA": {"GUM","SPN","SYD","MEL","BNE","AKL"},
}

def region(code):
    for name, codes in REGIONS.items():
        if code in codes:
            return name
    return "OTHER"

def parse_dt(s):
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except Exception:
        return None

def date_only(s):
    d = parse_dt(s)
    return d.date().isoformat() if d else (s or "")[:10]

def key_for(d):
    return "|".join([
        str(d.get("origin") or ""), str(d.get("destination") or ""),
        date_only(d.get("departure_at")), date_only(d.get("return_at")),
        str(d.get("airline") or ""), str(d.get("flight_number") or "")
    ])

def load_json(path, default):
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default

def call_serp(d):
    params = {
        "engine": "google_flights",
        "departure_id": d["origin"],
        "arrival_id": d["destination"],
        "outbound_date": date_only(d.get("departure_at")),
        "return_date": date_only(d.get("return_at")),
        "currency": "KRW",
        "hl": "ko",
        "api_key": KEY,
    }
    req = Request(API_URL + "?" + urlencode(params), headers={"User-Agent":"TravelPocket/1.0","Accept":"application/json"})
    with urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))

def choose_candidates(top100, previous):
    now = datetime.now(timezone.utc)
    by_dest = {}
    for d in top100:
        by_dest.setdefault(d.get("destination"), []).append(int(d.get("price_krw") or 0))
    medians = {k: median([p for p in v if p > 0]) for k,v in by_dest.items() if any(p > 0 for p in v)}

    scored = []
    for rank, d in enumerate(top100, start=1):
        if not d.get("origin") or not d.get("destination") or not d.get("departure_at") or not d.get("return_at"):
            continue
        k = key_for(d)
        prev = previous.get(k) or {}
        last = parse_dt(prev.get("checked_at_utc"))
        hours = (now-last).total_seconds()/3600 if last else 9999
        old_tp = int(prev.get("travelpayouts_price_krw") or 0)
        cur = int(d.get("price_krw") or 0)
        moved = abs(cur-old_tp)/old_tp if old_tp > 0 and cur > 0 else 0
        # 같은 항공권은 18시간 이내에는 원칙적으로 재조회하지 않되, 가격이 5% 이상 변하면 예외.
        if hours < RECHECK_HOURS and moved < 0.05:
            continue

        score = 0.0
        reasons = []
        if not prev:
            score += 40; reasons.append("신규/미검증")
        if moved >= 0.05:
            score += min(35, 20 + moved*50); reasons.append(f"가격변동 {moved*100:.1f}%")
        elif hours >= 24:
            score += 15; reasons.append("검증 24시간 경과")
        med = medians.get(d.get("destination")) or 0
        if med and cur:
            discount = max(0, (med-cur)/med)
            if discount > 0:
                score += min(35, discount*100); reasons.append(f"목적지내 저가 {discount*100:.0f}%")
        score += max(0, 21-rank)  # 상위 20위 우대
        if rank <= 20:
            reasons.append(f"TOP{rank}")
        # 공식 운항 검증이 이미 된 후보라면 Google 가격 검증 가치가 더 높음
        v = d.get("official_verification") or d.get("verification") or d.get("airport_verification") or {}
        if bool(v.get("verified") or v.get("flight_match") or v.get("route_match") or d.get("official_verified")):
            score += 10; reasons.append("공식운항 확인")
        scored.append((score, rank, d, reasons))

    scored.sort(key=lambda x: (-x[0], x[1], int(x[2].get("price_krw") or 10**12)))

    picked = []
    used_dest = set()
    region_count = {}
    # 1차: 목적지 중복 금지 + 지역별 최대 2건으로 다양성 확보
    for row in scored:
        d = row[2]; dest=d.get("destination"); reg=region(dest)
        if dest in used_dest or region_count.get(reg,0) >= 2:
            continue
        picked.append(row); used_dest.add(dest); region_count[reg]=region_count.get(reg,0)+1
        if len(picked) >= MAX_QUERIES:
            break
    # 2차: 6건 미만이면 지역 상한만 풀되 목적지 중복은 계속 금지
    if len(picked) < MAX_QUERIES:
        already = {key_for(x[2]) for x in picked}
        for row in scored:
            d=row[2]; dest=d.get("destination")
            if key_for(d) in already or dest in used_dest:
                continue
            picked.append(row); used_dest.add(dest)
            if len(picked) >= MAX_QUERIES:
                break
    return picked

def main():
    if not KEY:
        print("SERPAPI_KEY secret is missing", file=sys.stderr); sys.exit(2)
    fares = load_json(FARES_PATH, {})
    top100 = fares.get("top100") or fares.get("top50") or []
    old = load_json(OUT_PATH, {"results": []})
    previous = {r.get("candidate_key"): r for r in old.get("results", []) if r.get("candidate_key")}
    selected = choose_candidates(top100, previous)

    results = dict(previous)
    run_rows = []
    now = datetime.now(timezone.utc).isoformat()
    for priority, rank, d, reasons in selected:
        k = key_for(d)
        row = {
            "candidate_key": k,
            "checked_at_utc": now,
            "rank_at_check": rank,
            "selection_priority": round(priority,2),
            "selection_reasons": reasons,
            "origin": d.get("origin"), "destination": d.get("destination"), "destination_name": d.get("destination_name"),
            "departure_date": date_only(d.get("departure_at")), "return_date": date_only(d.get("return_at")),
            "travelpayouts_price_krw": int(d.get("price_krw") or 0),
            "travelpayouts_airline": d.get("airline"), "travelpayouts_flight_number": d.get("flight_number"),
        }
        try:
            data = call_serp(d)
            groups = (data.get("best_flights") or []) + (data.get("other_flights") or [])
            prices = [int(g.get("price")) for g in groups if isinstance(g.get("price"),(int,float)) and g.get("price") > 0]
            google_min = min(prices) if prices else None
            target_fn = str(d.get("flight_number") or "").replace(" ", "").upper()
            exact = []
            for g in groups:
                for leg in g.get("flights") or []:
                    fn = str(leg.get("flight_number") or "").replace(" ", "").upper()
                    if target_fn and fn == target_fn:
                        exact.append({"price": g.get("price"), "airline": leg.get("airline"), "flight_number": leg.get("flight_number"), "departure": (leg.get("departure_airport") or {}).get("time"), "arrival": (leg.get("arrival_airport") or {}).get("time")})
            exact_prices = [int(x["price"]) for x in exact if isinstance(x.get("price"),(int,float)) and x.get("price") > 0]
            google_exact = min(exact_prices) if exact_prices else None
            compare_price = google_exact or google_min
            delta = ((compare_price-row["travelpayouts_price_krw"])/row["travelpayouts_price_krw"]*100) if compare_price and row["travelpayouts_price_krw"] else None
            row.update({
                "ok": True,
                "serpapi_status": (data.get("search_metadata") or {}).get("status"),
                "google_flight_groups": len(groups),
                "google_min_price_krw": google_min,
                "exact_flight_match": bool(exact),
                "google_exact_flight_price_krw": google_exact,
                "price_delta_pct": round(delta,2) if delta is not None else None,
                "price_match_level": "close" if delta is not None and abs(delta) <= 5 else ("changed" if delta is not None and abs(delta) <= 15 else ("far" if delta is not None else "unknown")),
                "matched_examples": exact[:3],
            })
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as e:
            row.update({"ok": False, "error": str(e)})
        results[k] = row
        run_rows.append(row)
        print(f"SERP {d.get('origin')}->{d.get('destination')} {row.get('departure_date')} TP={row.get('travelpayouts_price_krw')} Google={row.get('google_exact_flight_price_krw') or row.get('google_min_price_krw')} exact={row.get('exact_flight_match')} reasons={','.join(reasons)}")

    # 최근 검증 우선으로 최대 500건 보관
    kept = sorted(results.values(), key=lambda r:r.get("checked_at_utc") or "", reverse=True)[:500]
    out = {
        "generated_at_utc": now,
        "quota_policy": {"runs_per_day":2,"queries_per_run":MAX_QUERIES,"approx_monthly_30d":MAX_QUERIES*2*30,"recheck_hours":RECHECK_HOURS},
        "selection_policy": [
            "신규 또는 Google 미검증 후보 우선",
            "Travelpayouts 가격이 이전 검증 대비 5% 이상 변한 후보 우선",
            "같은 목적지 후보들 중 상대적으로 유난히 싼 가격 우선",
            "TOP100 상위권 우대",
            "공식 공항 운항정보가 확인된 후보 우대",
            "같은 목적지는 회당 1건, 1차 선정에서 같은 지역 최대 2건으로 지역 다양성 확보",
            "18시간 이내 동일 후보는 가격 5% 이상 변동이 없으면 재조회하지 않음"
        ],
        "queries_this_run": len(run_rows),
        "run_results": run_rows,
        "results": kept,
    }
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"SerpApi cross-check complete: {len(run_rows)} queries")

if __name__ == "__main__":
    main()
