#!/usr/bin/env python3
import json, os, sys, time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
API_URL="https://api.travelpayouts.com/aviasales/v3/prices_for_dates"; TOKEN=os.environ.get("TRAVELPAYOUTS_TOKEN","").strip()
ORIGINS=["ICN","GMP"]; JEJU_ORIGINS=["ICN","GMP"]
DESTINATIONS={"KIX":"오사카","NRT":"도쿄","HND":"도쿄/하네다","FUK":"후쿠오카","CTS":"삿포로","OKA":"오키나와","NGO":"나고야","MMY":"미야코지마","TPE":"타이베이","KHH":"가오슝","HKG":"홍콩","MFM":"마카오","BKK":"방콕","CNX":"치앙마이","HKT":"푸켓","SIN":"싱가포르","KUL":"쿠알라룸푸르","BKI":"코타키나발루","DPS":"발리","DAD":"다낭","CXR":"나트랑","HAN":"하노이","SGN":"호치민","PQC":"푸꾸옥","CEB":"세부","MNL":"마닐라","MPH":"보라카이","ULN":"울란바토르","PVG":"상하이","PEK":"베이징","PKX":"베이징/다싱","TAO":"칭다오","CAN":"광저우","SZX":"선전","XIY":"시안","CTU":"청두","ALA":"알마티","TAS":"타슈켄트","DXB":"두바이","AUH":"아부다비","DOH":"도하","IST":"이스탄불","LHR":"런던","CDG":"파리","FCO":"로마","MXP":"밀라노","FRA":"프랑크푸르트","MUC":"뮌헨","AMS":"암스테르담","MAD":"마드리드","BCN":"바르셀로나","VIE":"빈","PRG":"프라하","BUD":"부다페스트","ZRH":"취리히","HEL":"헬싱키","WAW":"바르샤바","LAX":"로스앤젤레스","SFO":"샌프란시스코","SEA":"시애틀","JFK":"뉴욕","YVR":"밴쿠버","YYZ":"토론토","HNL":"호놀룰루","GUM":"괌","SPN":"사이판","SYD":"시드니","MEL":"멜버른","BNE":"브리즈번","AKL":"오클랜드","CJU":"제주도"}
MONTHS=["2026-09","2026-10","2026-11","2026-12"]; OUTPUT=Path("data/travelpayouts_fares.json"); RAW_OUTPUT=Path("data/travelpayouts_raw_summary.json")
def parse_dt(v):
 if not v:return None
 try:return datetime.fromisoformat(v.replace("Z","+00:00"))
 except:
  try:return datetime.strptime(v[:10],"%Y-%m-%d").replace(tzinfo=timezone.utc)
  except:return None
def fetch(params):
 req=Request(f"{API_URL}?{urlencode(params)}",headers={"X-Access-Token":TOKEN,"Accept":"application/json","User-Agent":"TravelPocket/1.0"})
 with urlopen(req,timeout=30) as r:return json.loads(r.read().decode("utf-8"))
def normalize(item,o,d,m):
 dep,ret=parse_dt(item.get("departure_at")),parse_dt(item.get("return_at")); nights=(ret.date()-dep.date()).days if dep and ret else None; price=item.get("price")
 if not isinstance(price,(int,float)) or price<=0:return None
 link=item.get("link") or ""; link="https://www.aviasales.com"+link if link.startswith("/") else link
 return {"source":"Travelpayouts/Aviasales Data API","trust":"cached_search_price","origin":o,"destination":d,"destination_name":DESTINATIONS[d],"domestic":d=="CJU","search_month":m,"departure_at":item.get("departure_at"),"return_at":item.get("return_at"),"nights":nights,"price_krw":int(round(price)),"airline":item.get("airline"),"flight_number":item.get("flight_number"),"transfers":item.get("transfers"),"return_transfers":item.get("return_transfers"),"duration":item.get("duration"),"link":link,"gate":item.get("gate"),"found_at":item.get("found_at")}
def main():
 if not TOKEN:print("TRAVELPAYOUTS_TOKEN secret is missing",file=sys.stderr);sys.exit(2)
 deals=[];stats=[];failures=[]; routes=[(o,d) for o in ORIGINS for d in DESTINATIONS if d!="CJU"]+[(o,"CJU") for o in JEJU_ORIGINS]
 for o,d in routes:
  for m in MONTHS:
   p={"origin":o,"destination":d,"departure_at":m,"return_at":m,"one_way":"false","direct":"false","currency":"krw","market":"kr","sorting":"price","limit":100,"page":1}
   try:
    rows=(fetch(p).get("data") or []);accepted=0
    for row in rows:
     n=normalize(row,o,d,m)
     if not n:continue
     if n["nights"] is not None and ((d=="CJU" and not 1<=n["nights"]<=7) or (d!="CJU" and not 2<=n["nights"]<=14)):continue
     deals.append(n);accepted+=1
    stats.append({"origin":o,"destination":d,"month":m,"returned":len(rows),"accepted":accepted});time.sleep(.12)
   except (HTTPError,URLError,TimeoutError,json.JSONDecodeError) as e:failures.append({"origin":o,"destination":d,"month":m,"error":str(e)});time.sleep(.5)
 unique={}
 for d in deals:unique[(d["origin"],d["destination"],d["departure_at"],d["return_at"],d["airline"],d["flight_number"],d["price_krw"])]=d
 deals=list(unique.values()); intl=sorted([d for d in deals if d["destination"]!="CJU"],key=lambda x:(x["price_krw"],x["destination_name"],x.get("departure_at") or "")); jeju=sorted([d for d in deals if d["destination"]=="CJU"],key=lambda x:(x["price_krw"],x.get("departure_at") or ""))
 top100=intl[:100]; jeju_top10=jeju[:10]; now=datetime.now(timezone.utc).isoformat()
 output={"generated_at_utc":now,"note":"국제선 TOP100과 제주 TOP10을 분리합니다. 제주 노선은 SerpApi/Google 검증 대상에서 제외합니다.","origins":ORIGINS,"jeju_origins":JEJU_ORIGINS,"months":MONTHS,"deal_count":len(intl)+len(jeju),"international_deal_count":len(intl),"jeju_deal_count":len(jeju),"top100":top100,"top50":top100[:50],"jeju_top10":jeju_top10,"all_international_deals":intl,"all_jeju_deals":jeju}
 OUTPUT.parent.mkdir(parents=True,exist_ok=True);OUTPUT.write_text(json.dumps(output,ensure_ascii=False,indent=2),encoding="utf-8");RAW_OUTPUT.write_text(json.dumps({"generated_at_utc":now,"requests":len(stats)+len(failures),"successful_requests":len(stats),"failed_requests":len(failures),"stats":stats,"failures":failures},ensure_ascii=False,indent=2),encoding="utf-8");print(f"International TOP100={len(top100)}; Jeju TOP10={len(jeju_top10)}")
if __name__=="__main__":main()
