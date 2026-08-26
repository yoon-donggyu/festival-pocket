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
# 일본/동남아에 한정하지 않고 한국 출발 특가 가능성이 있는 주요 국제 목적지를 폭넓게 탐색한다.
DESTINATIONS = {
    # 일본
    "KIX":"오사카","NRT":"도쿄","HND":"도쿄/하네다","FUK":"후쿠오카","CTS":"삿포로","OKA":"오키나와","NGO":"나고야","MMY":"미야코지마",
    # 중화권/동남아/몽골
    "TPE":"타이베이","KHH":"가오슝","HKG":"홍콩","MFM":"마카오","BKK":"방콕","CNX":"치앙마이","HKT":"푸켓","SIN":"싱가포르","KUL":"쿠알라룸푸르","BKI":"코타키나발루","DPS":"발리","DAD":"다낭","CXR":"나트랑","HAN":"하노이","SGN":"호치민","PQC":"푸꾸옥","CEB":"세부","MNL":"마닐라","MPH":"보라카이","ULN":"울란바토르",
    # 중국
    "PVG":"상하이","PEK":"베이징","PKX":"베이징/다싱","TAO":"칭다오","CAN":"광저우","SZX":"선전","XIY":"시안","CTU":"청두",
    # 중앙아시아/중동
    "ALA":"알마티","TAS":"타슈켄트","DXB":"두바이","AUH":"아부다비","DOH":"도하","IST":"이스탄불",
    # 유럽
    "LHR":"런던","CDG":"파리","FCO":"로마","MXP":"밀라노","FRA":"프랑크푸르트","MUC":"뮌헨","AMS":"암스테르담","MAD":"마드리드","BCN":"바르셀로나","VIE":"빈","PRG":"프라하","BUD":"부다페스트","ZRH":"취리히","HEL":"헬싱키","WAW":"바르샤바",
    # 미주/대양주
    "LAX":"로스앤젤레스","SFO":"샌프란시스코","SEA":"시애틀","JFK":"뉴욕","YVR":"밴쿠버","YYZ":"토론토","HNL":"호놀룰루","GUM":"괌","SPN":"사이판","SYD":"시드니","MEL":"멜버른","BNE":"브리즈번","AKL":"오클랜드",
}
MONTHS = ["2026-09", "2026-10", "2026-11", "2026-12"]
OUTPUT = Path("data/travelpayouts_fares.json")
RAW_OUTPUT = Path("data/travelpayouts_raw_summary.json")


def parse_dt(value):
    if not value: return None
    try: return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        try: return datetime.strptime(value[:10], "%Y-%m-%d").replace(tzinfo=timezone.utc)
        except ValueError: return None


def fetch(params):
    req = Request(f"{API_URL}?{urlencode(params)}", headers={"X-Access-Token":TOKEN,"Accept":"application/json","User-Agent":"TravelPocket/1.0"})
    with urlopen(req, timeout=30) as resp: return json.loads(resp.read().decode("utf-8"))


def normalize(item, origin, destination, month):
    dep, ret = parse_dt(item.get("departure_at")), parse_dt(item.get("return_at"))
    nights = (ret.date()-dep.date()).days if dep and ret else None
    price = item.get("price")
    if not isinstance(price,(int,float)) or price <= 0: return None
    link = item.get("link") or ""
    if link.startswith("/"): link = "https://www.aviasales.com" + link
    return {"source":"Travelpayouts/Aviasales Data API","trust":"cached_search_price","origin":origin,"destination":destination,"destination_name":DESTINATIONS[destination],"search_month":month,"departure_at":item.get("departure_at"),"return_at":item.get("return_at"),"nights":nights,"price_krw":int(round(price)),"airline":item.get("airline"),"flight_number":item.get("flight_number"),"transfers":item.get("transfers"),"return_transfers":item.get("return_transfers"),"duration":item.get("duration"),"link":link,"gate":item.get("gate"),"found_at":item.get("found_at")}


def main():
    if not TOKEN:
        print("TRAVELPAYOUTS_TOKEN secret is missing", file=sys.stderr); sys.exit(2)
    deals, stats, failures = [], [], []
    for origin in ORIGINS:
        for destination in DESTINATIONS:
            if origin == destination: continue
            for month in MONTHS:
                params={"origin":origin,"destination":destination,"departure_at":month,"return_at":month,"one_way":"false","direct":"false","currency":"krw","market":"kr","sorting":"price","limit":100,"page":1}
                try:
                    payload=fetch(params); rows=payload.get("data") or []; accepted=0
                    for row in rows:
                        n=normalize(row,origin,destination,month)
                        if not n: continue
                        # 단거리뿐 아니라 장거리 특가도 포함. 2~14박까지 허용한다.
                        if n["nights"] is not None and not (2 <= n["nights"] <= 14): continue
                        deals.append(n); accepted += 1
                    stats.append({"origin":origin,"destination":destination,"month":month,"returned":len(rows),"accepted_2to14_nights":accepted})
                    time.sleep(0.12)
                except (HTTPError,URLError,TimeoutError,json.JSONDecodeError) as e:
                    failures.append({"origin":origin,"destination":destination,"month":month,"error":str(e)})
                    print(f"WARN {origin}->{destination} {month}: {e}",file=sys.stderr); time.sleep(0.5)
    unique={}
    for d in deals:
        key=(d["origin"],d["destination"],d["departure_at"],d["return_at"],d["airline"],d["flight_number"],d["price_krw"]); unique[key]=d
    deals=list(unique.values()); deals.sort(key=lambda x:(x["price_krw"],x["destination_name"],x.get("departure_at") or ""))
    top100=deals[:100]
    best={}
    for d in deals:
        if d["destination"] not in best: best[d["destination"]]=d
    now=datetime.now(timezone.utc).isoformat()
    output={"generated_at_utc":now,"note":"Travelpayouts Data API 가격은 Aviasales 사용자 검색 이력 기반 캐시 가격이며 실시간 전체 재고가 아닙니다. 실제 결제 전 재확인이 필요합니다.","origins":ORIGINS,"months":MONTHS,"deal_count":len(deals),"top100":top100,"top50":top100[:50],"best_by_destination":list(best.values()),"all_2to14_night_deals":deals,"all_2to7_night_deals":deals}
    OUTPUT.parent.mkdir(parents=True,exist_ok=True); OUTPUT.write_text(json.dumps(output,ensure_ascii=False,indent=2),encoding="utf-8")
    RAW_OUTPUT.write_text(json.dumps({"generated_at_utc":now,"requests":len(stats)+len(failures),"successful_requests":len(stats),"failed_requests":len(failures),"stats":stats,"failures":failures},ensure_ascii=False,indent=2),encoding="utf-8")
    print(f"Collected {len(deals)} usable deals; TOP100={len(top100)}; failures={len(failures)}")

if __name__ == "__main__": main()
