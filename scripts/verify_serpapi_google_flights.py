#!/usr/bin/env python3
import json, os, sys
from datetime import datetime, timezone
from pathlib import Path
from statistics import median
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
API_URL='https://serpapi.com/search.json';KEY=os.environ.get('SERPAPI_KEY','').strip();FARES_PATH=Path('data/travelpayouts_fares.json');OUT_PATH=Path('data/serpapi_google_flights.json');MAX_QUERIES=6;RECHECK_HOURS=18
REGIONS={'JP':{'KIX','NRT','HND','FUK','CTS','OKA','NGO','MMY'},'SEA':{'TPE','KHH','HKG','MFM','BKK','CNX','HKT','SIN','KUL','BKI','DPS','DAD','CXR','HAN','SGN','PQC','CEB','MNL','MPH'},'CN_CENTRAL':{'ULN','PVG','PEK','PKX','TAO','CAN','SZX','XIY','CTU','ALA','TAS'},'EU_ME':{'DXB','AUH','DOH','IST','LHR','CDG','FCO','MXP','FRA','MUC','AMS','MAD','BCN','VIE','PRG','BUD','ZRH','HEL','WAW'},'AMERICAS':{'LAX','SFO','SEA','JFK','YVR','YYZ','HNL'},'OCEANIA':{'GUM','SPN','SYD','MEL','BNE','AKL'}}
def region(c):
 for n,cs in REGIONS.items():
  if c in cs:return n
 return 'OTHER'
def parse_dt(s):
 try:return datetime.fromisoformat((s or '').replace('Z','+00:00'))
 except:return None
def date_only(s):
 d=parse_dt(s);return d.date().isoformat() if d else (s or '')[:10]
def key_for(d):return '|'.join([str(d.get('origin')or''),str(d.get('destination')or''),date_only(d.get('departure_at')),date_only(d.get('return_at')),str(d.get('airline')or''),str(d.get('flight_number')or'')])
def load_json(p,default):
 try:return json.loads(p.read_text(encoding='utf-8')) if p.exists() else default
 except:return default
def call_serp(d):
 params={'engine':'google_flights','departure_id':d['origin'],'arrival_id':d['destination'],'outbound_date':date_only(d.get('departure_at')),'return_date':date_only(d.get('return_at')),'currency':'KRW','hl':'ko','gl':'kr','api_key':KEY}
 req=Request(API_URL+'?'+urlencode(params),headers={'User-Agent':'TravelPocket/1.0','Accept':'application/json'})
 with urlopen(req,timeout=60) as r:return json.loads(r.read().decode())
def choose_candidates(top100,previous):
 # 국내 제주(CJU)는 유료 SerpApi 검증 쿼터를 사용하지 않는다.
 top100=[d for d in top100 if d.get('destination')!='CJU' and not d.get('domestic')];now=datetime.now(timezone.utc);by_dest={}
 for d in top100:by_dest.setdefault(d.get('destination'),[]).append(int(d.get('price_krw')or 0))
 meds={k:median([p for p in v if p>0]) for k,v in by_dest.items() if any(p>0 for p in v)};scored=[]
 for rank,d in enumerate(top100,1):
  if not all([d.get('origin'),d.get('destination'),d.get('departure_at'),d.get('return_at')]):continue
  k=key_for(d);prev=previous.get(k)or{};last=parse_dt(prev.get('checked_at_utc'));hours=(now-last).total_seconds()/3600 if last else 9999;old=int(prev.get('travelpayouts_price_krw')or 0);cur=int(d.get('price_krw')or 0);moved=abs(cur-old)/old if old>0 and cur>0 else 0
  if hours<RECHECK_HOURS and moved<.05:continue
  score=40 if not prev else 0;reasons=['신규/미검증'] if not prev else []
  if moved>=.05:score+=min(35,20+moved*50);reasons.append(f'가격변동 {moved*100:.1f}%')
  elif hours>=24:score+=15;reasons.append('검증 24시간 경과')
  med=meds.get(d.get('destination'))or 0
  if med and cur:
   disc=max(0,(med-cur)/med)
   if disc>0:score+=min(35,disc*100);reasons.append(f'목적지내 저가 {disc*100:.0f}%')
  score+=max(0,21-rank);scored.append((score,rank,d,reasons))
 scored.sort(key=lambda x:(-x[0],x[1],int(x[2].get('price_krw')or 10**12)));picked=[];used=set();rc={}
 for row in scored:
  dest=row[2].get('destination');reg=region(dest)
  if dest in used or rc.get(reg,0)>=2:continue
  picked.append(row);used.add(dest);rc[reg]=rc.get(reg,0)+1
  if len(picked)>=MAX_QUERIES:break
 if len(picked)<MAX_QUERIES:
  already={key_for(x[2]) for x in picked}
  for row in scored:
   dest=row[2].get('destination')
   if key_for(row[2]) in already or dest in used:continue
   picked.append(row);used.add(dest)
   if len(picked)>=MAX_QUERIES:break
 return picked
def main():
 if not KEY:print('SERPAPI_KEY secret is missing',file=sys.stderr);sys.exit(2)
 fares=load_json(FARES_PATH,{});top=fares.get('top100')or[];old=load_json(OUT_PATH,{'results':[]});previous={r.get('candidate_key'):r for r in old.get('results',[]) if r.get('candidate_key')};selected=choose_candidates(top,previous);results=dict(previous);run=[];now=datetime.now(timezone.utc).isoformat()
 for priority,rank,d,reasons in selected:
  k=key_for(d);row={'candidate_key':k,'checked_at_utc':now,'rank_at_check':rank,'selection_priority':round(priority,2),'selection_reasons':reasons,'origin':d.get('origin'),'destination':d.get('destination'),'destination_name':d.get('destination_name'),'departure_date':date_only(d.get('departure_at')),'return_date':date_only(d.get('return_at')),'travelpayouts_price_krw':int(d.get('price_krw')or 0),'travelpayouts_airline':d.get('airline'),'travelpayouts_flight_number':d.get('flight_number')}
  try:
   data=call_serp(d);meta=data.get('search_metadata')or{};groups=(data.get('best_flights')or[])+(data.get('other_flights')or[]);prices=[int(g['price']) for g in groups if isinstance(g.get('price'),(int,float)) and g['price']>0];gmin=min(prices) if prices else None;target=str(d.get('flight_number')or'').replace(' ','').upper();exact=[]
   for g in groups:
    for leg in g.get('flights')or[]:
     if target and str(leg.get('flight_number')or'').replace(' ','').upper()==target:exact.append({'price':g.get('price'),'airline':leg.get('airline'),'flight_number':leg.get('flight_number')})
   ep=[int(x['price']) for x in exact if isinstance(x.get('price'),(int,float)) and x['price']>0];gexact=min(ep) if ep else None;cp=gexact or gmin;delta=((cp-row['travelpayouts_price_krw'])/row['travelpayouts_price_krw']*100) if cp and row['travelpayouts_price_krw'] else None
   row.update({'ok':True,'serpapi_status':meta.get('status'),'google_flights_url':meta.get('google_flights_url'),'google_flight_groups':len(groups),'google_min_price_krw':gmin,'exact_flight_match':bool(exact),'google_exact_flight_price_krw':gexact,'price_delta_pct':round(delta,2) if delta is not None else None,'price_match_level':'close' if delta is not None and abs(delta)<=5 else ('changed' if delta is not None and abs(delta)<=15 else ('far' if delta is not None else 'unknown')),'matched_examples':exact[:3]})
  except (HTTPError,URLError,TimeoutError,json.JSONDecodeError) as e:row.update({'ok':False,'error':str(e)})
  results[k]=row;run.append(row)
 kept=sorted(results.values(),key=lambda r:r.get('checked_at_utc')or'',reverse=True)[:500];OUT_PATH.parent.mkdir(parents=True,exist_ok=True);OUT_PATH.write_text(json.dumps({'generated_at_utc':now,'quota_policy':{'runs_per_day':2,'queries_per_run':MAX_QUERIES,'approx_monthly_30d':MAX_QUERIES*60,'jeju_serpapi_queries':0},'queries_this_run':len(run),'run_results':run,'results':kept},ensure_ascii=False,indent=2),encoding='utf-8');print(f'SerpApi international cross-check complete: {len(run)} queries; Jeju=0')
if __name__=='__main__':main()
