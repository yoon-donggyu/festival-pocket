#!/usr/bin/env python3
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

API_URL = "https://api.travelpayouts.com/aviasales/v3/prices_for_dates"
TOKEN = os.environ.get("TRAVELPAYOUTS_TOKEN", "").strip()

ORIGINS = ["ICN", "GMP"]
DESTINATIONS = {
    "KIX": "오사카",
    "NRT": "도쿄",
    "FUK": "후쿠오카",
    "CTS": "삿포로",
    "MMY": "미야코지마",
    "TPE": "타이베이",
    "HKG": "홍콩",
    "SIN": "싱가포르",
    "BKK": "방콕",
    "CNX": "치앙마이",
    "DPS": "발리",
    "ULN": "몽골/울란바토르",
    "DAD": "다낭",
    "CXR": "나트랑",
    "MPH": "보라카이",
    "CEB": "세부",
    "HAN": "하노이",
    "SGN": "호치민",
    "PQC": "푸꾸옥",
    "BKI": "코타키나발루",
    "HKT": "푸켓",
    "KUL": "쿠알라룸푸르",
}
MONTHS = ["2026-09", "2026-10", "2026-11", "2026-12"]
OUTPUT = Path("data/travelpayouts_fares.json")
RAW_OUTPUT = Path("data/travelpayouts_raw_summary.json")


def parse_dt(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        try:
            return datetime.strptime(value[:10], "%Y-%m-%d").replace(tzinfo=timezone.utc)
        except ValueError:
            return None


def fetch(params):
    query = urlencode(params)
    req = Request(
        f"{API_URL}?{query}",
        headers={
            "X-Access-Token": TOKEN,
            "Accept": "application/json",
            "User-Agent": "TravelPocket/1.0",
        },
    )
    with urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def normalize(item, origin, destination, month):
    dep = parse_dt(item.get("departure_at"))
    ret = parse_dt(item.get("return_at"))
    nights = None
    if dep and ret:
        nights = (ret.date() - dep.date()).days
    price = item.get("price")
    if not isinstance(price, (int, float)) or price <= 0:
        return None

    link = item.get("link") or ""
    if link.startswith("/"):
        link = "https://www.aviasales.com" + link

    return {
        "source": "Travelpayouts/Aviasales Data API",
        "trust": "cached_search_price",
        "origin": origin,
        "destination": destination,
        "destination_name": DESTINATIONS[destination],
        "search_month": month,
        "departure_at": item.get("departure_at"),
        "return_at": item.get("return_at"),
        "nights": nights,
        "price_krw": int(round(price)),
        "airline": item.get("airline"),
        "flight_number": item.get("flight_number"),
        "transfers": item.get("transfers"),
        "return_transfers": item.get("return_transfers"),
        "duration": item.get("duration"),
        "link": link,
        "gate": item.get("gate"),
        "found_at": item.get("found_at"),
    }


def main():
    if not TOKEN:
        print("TRAVELPAYOUTS_TOKEN secret is missing", file=sys.stderr)
        sys.exit(2)

    deals = []
    stats = []
    failures = []

    for origin in ORIGINS:
        for destination in DESTINATIONS:
            if origin == destination:
                continue
            for month in MONTHS:
                params = {
                    "origin": origin,
                    "destination": destination,
                    "departure_at": month,
                    "return_at": month,
                    "one_way": "false",
                    "direct": "false",
                    "currency": "krw",
                    "market": "kr",
                    "sorting": "price",
                    "limit": 100,
                    "page": 1,
                }
                try:
                    payload = fetch(params)
                    rows = payload.get("data") or []
                    accepted = 0
                    for row in rows:
                        n = normalize(row, origin, destination, month)
                        if not n:
                            continue
                        # 실제 여행용으로 2~6박을 우선 수집. 야간 시차 때문에 7일로 계산되는 경우도 허용.
                        if n["nights"] is not None and not (2 <= n["nights"] <= 7):
                            continue
                        deals.append(n)
                        accepted += 1
                    stats.append({
                        "origin": origin,
                        "destination": destination,
                        "month": month,
                        "returned": len(rows),
                        "accepted_2to7_nights": accepted,
                    })
                    time.sleep(0.12)
                except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as e:
                    failures.append({
                        "origin": origin,
                        "destination": destination,
                        "month": month,
                        "error": str(e),
                    })
                    print(f"WARN {origin}->{destination} {month}: {e}", file=sys.stderr)
                    time.sleep(0.5)

    # 동일 일정/항공사 중복 제거
    unique = {}
    for d in deals:
        key = (
            d["origin"], d["destination"], d["departure_at"], d["return_at"],
            d["airline"], d["flight_number"], d["price_krw"]
        )
        unique[key] = d
    deals = list(unique.values())
    deals.sort(key=lambda x: (x["price_krw"], x["destination_name"], x.get("departure_at") or ""))

    # 전체 최저 TOP50 + 목적지별 최저도 별도 제공
    top50 = deals[:50]
    best_by_destination = {}
    for d in deals:
        code = d["destination"]
        if code not in best_by_destination:
            best_by_destination[code] = d

    now = datetime.now(timezone.utc).isoformat()
    output = {
        "generated_at_utc": now,
        "note": "Travelpayouts Data API 가격은 Aviasales 사용자 검색 이력 기반 캐시 가격이며 실시간 전체 재고가 아닙니다. 실제 결제 전 메타검색/OTA에서 재확인해야 합니다.",
        "origins": ORIGINS,
        "months": MONTHS,
        "deal_count": len(deals),
        "top50": top50,
        "best_by_destination": list(best_by_destination.values()),
        "all_2to7_night_deals": deals,
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    RAW_OUTPUT.write_text(json.dumps({
        "generated_at_utc": now,
        "requests": len(stats) + len(failures),
        "successful_requests": len(stats),
        "failed_requests": len(failures),
        "stats": stats,
        "failures": failures,
    }, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Collected {len(deals)} usable deals; TOP50={len(top50)}; failures={len(failures)}")


if __name__ == "__main__":
    main()
