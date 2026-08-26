#!/usr/bin/env python3
import json, os, re, sys, time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

KEY=os.environ.get('DATA_GO_KR_API_KEY','').strip()
IIAC_BASE='https://apis.data.go.kr/B551177/StatusOfPaxFltSched'
KAC_SCHED_BASE='https://apis.data.go.kr/B551178/flight-schedule'
KAC_SEARCH_BASE='https://apis.data.go.kr/B551178/flight-search'
FARES=Path('data/travelpayouts_fares.json'); OUT=Path('data/airport_schedule_probe.json')
TIMEOUT_SECONDS=35; MAX_ATTEMPTS=2; BACKOFF_SECONDS=[0,2]; MAX_WORKERS=8

def request_once(url,params):
 q=dict(params); q['serviceKey']=KEY
 req=Request(url+'?'+urlencode(q),headers={'Accept':'application/json, application/xml;q=0.9, */*;q=0.8','User-Agent':'Mozilla/5.0 TravelPocket/1.3'})
 try:
  with urlopen(req,timeout=TIMEOUT_SECONDS) as r:
   body=r.read().decode('utf-8',errors='replace'); return {'ok':True,'status':r.status,'content_type':r.headers.get('content-type'),'body_preview':body[:50000]}
 except HTTPError as e: return {'ok':False,'status':e.code,'body_preview':e.read().decode('utf-8',errors='replace')[:10000]}
 except (URLError,TimeoutError) as e: return {'ok':False,'status':None,'body_preview':str(e)}

def request_with_retry(url,params):
 attempts=[]; final={}
 for attempt in range(1,MAX_ATTEMPTS+1):
  if BACKOFF_SECONDS[attempt-1]: time.sleep(BACKOFF_SECONDS[attempt-1])
  res=request_once(url,params); final=res
  attempts.append({'attempt':attempt,'ok':res.get('ok',False),'status':res.get('status'),'error_or_preview':res.get('body_preview','')[:500]})
  if res.get('ok') or (isinstance(res.get('status'),int) and 400<=res['status']<500): break
 final=dict(final); final['attempts']=attempts; final['attempt_count']=len(attempts); return final

def body_text(res): return (res.get('body_preview') or '').upper().replace(' ','')
def flight_code(a,n):
 a=(a or '').strip().upper(); n=str(n or '').strip().upper().replace(' ','')
 if not n:return ''
 return n if re.match(r'^[A-Z0-9]{2,3}\d',n) else (a+n if a else n)
def iso_date(v): return str(v)[:10].replace('-','') if v else ''

def probe_health():
 probes=[('IIAC_DEPARTURES',IIAC_BASE+'/getPaxFltSchedDeparturesDeOdp',{'pageNo':'1','numOfRows':'30','type':'json','airport':'KIX','lang':'K'}),('IIAC_ARRIVALS',IIAC_BASE+'/getPaxFltSchedArrivalsDeOdp',{'pageNo':'1','numOfRows':'30','type':'json','airport':'KIX','lang':'K'}),('KAC_INT',KAC_SCHED_BASE+'/int',{'pageNo':'1','numOfRows':'30','schDate':'20260901','schDeptCityCode':'GMP','schArrvCityCode':'HND','type':'json'}),('KAC_DOM',KAC_SCHED_BASE+'/dom',{'pageNo':'1','numOfRows':'30','schDate':'20260901','schDeptCityCode':'GMP','schArrvCityCode':'PUS','type':'json'}),('KAC_FLIGHT_SEARCH',KAC_SEARCH_BASE+'/info',{'schLineType':'I','schIOType':'O','schAirCode':'GMP','schStTime':'0600','schEdTime':'2359','type':'json'})]
 results=[]
 with ThreadPoolExecutor(max_workers=5) as ex:
  fut={ex.submit(request_with_retry,u,p):(name,u,p) for name,u,p in probes}
  for f in as_completed(fut):
   name,u,p=fut[f]; res=f.result(); results.append({'provider':name,'endpoint':u,'params_without_key':p,**res}); print(name,'=>',res.get('status'),'OK' if res.get('ok') else 'FAIL')
 return results

def verify_top50(health):
 if not FARES.exists():return []
 try: top=(json.loads(FARES.read_text(encoding='utf-8')).get('top50') or [])
 except Exception as e: print('Could not read fares:',e,file=sys.stderr); return []
 health_map={r['provider']:bool(r.get('ok')) for r in health}; specs=[]
 for idx,d in enumerate(top,1):
  o=(d.get('origin') or '').upper(); dest=(d.get('destination') or '').upper(); date=iso_date(d.get('departure_at')); airline=(d.get('airline') or '').upper(); fc=flight_code(airline,d.get('flight_number'))
  if o=='GMP' and date and dest:
   u=KAC_SCHED_BASE+'/int'; p={'pageNo':'1','numOfRows':'200','schDate':date,'schDeptCityCode':'GMP','schArrvCityCode':dest,'type':'json'}; provider='KAC_SCHEDULE_MATCH'; mode='date_route_flight'; cachekey=(u,date,o,dest)
  elif o=='ICN' and dest:
   u=IIAC_BASE+'/getPaxFltSchedDeparturesDeOdp'; p={'pageNo':'1','numOfRows':'1000','type':'json','airport':dest,'lang':'K'}; provider='IIAC_SCHEDULE_MATCH'; mode='route_flight_schedule'; cachekey=(u,dest)
  else: u='';p={};provider='';mode='';cachekey=('unsupported',o,dest,date)
  specs.append((idx,d,o,dest,airline,fc,u,p,provider,mode,cachekey))
 # One API call per unique route/date query; shared by all matching TOP50 rows.
 unique={s[10]:(s[6],s[7]) for s in specs if s[6]}
 cache={}
 with ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
  fut={ex.submit(request_with_retry,u,p):k for k,(u,p) in unique.items()}
  for f in as_completed(fut):
   k=fut[f]
   try: cache[k]=f.result()
   except Exception as e: cache[k]={'ok':False,'status':None,'body_preview':str(e)}
 print('VERIFY API calls:',len(unique),'for',len(specs),'fares')
 out=[]
 for idx,d,o,dest,airline,fc,u,p,provider,mode,k in specs:
  res=cache.get(k,{'ok':False,'status':None,'body_preview':'Unsupported origin/route'}); text=body_text(res)
  route=bool(res.get('ok')) and (dest in text or o in text); flight=bool(fc) and fc.replace('-','') in text.replace('-',''); score=(8 if res.get('ok') else 0)+(7 if route else 0)+(10 if flight else 0)
  out.append({'rank':idx,'key':f"{o}-{dest}-{d.get('departure_at','')}-{d.get('return_at','')}-{airline}-{d.get('flight_number','')}",'origin':o,'destination':dest,'departure_at':d.get('departure_at'),'return_at':d.get('return_at'),'airline':airline,'flight_number':d.get('flight_number'),'flight_code':fc,'provider':provider,'verification_mode':mode,'api_ok':bool(res.get('ok')),'http_status':res.get('status'),'route_match':route,'flight_match':flight,'official_operation_score_25':score,'live_flight_search_api_ok':health_map.get('KAC_FLIGHT_SEARCH',False),'limitations':('IIAC timetable has no requested travel date; match confirms the route/flight exists in the published regular timetable, not current sale availability.') if o=='ICN' else ('KAC schedule is queried with the fare departure date. Live flight-search is a service-health signal for future dates.'),'params_without_key':p})
  print('VERIFY',idx,o,dest,fc,'=>',res.get('status'),'route',route,'flight',flight)
 return out

def main():
 if not KEY: print('DATA_GO_KR_API_KEY secret is missing',file=sys.stderr);sys.exit(2)
 started=time.time(); health=probe_health(); ver=verify_top50(health); OUT.parent.mkdir(parents=True,exist_ok=True)
 OUT.write_text(json.dumps({'generated_at_utc':datetime.now(timezone.utc).isoformat(),'elapsed_seconds':round(time.time()-started,2),'timeout_seconds':TIMEOUT_SECONDS,'max_attempts':MAX_ATTEMPTS,'max_workers':MAX_WORKERS,'results':health,'top50_verifications':ver,'trust_model':{'price_freshness':30,'official_operation_match':25,'current_sale_price_confirmation':25,'cross_source_match':10,'baggage_tax_confirmation':10,'note':'Current-sale and baggage/tax confirmation remain 0 until a live offer/booking source is connected. Scores are intentionally conservative.'}},ensure_ascii=False,indent=2),encoding='utf-8')
 print('DONE in',round(time.time()-started,2),'seconds')
if __name__=='__main__':main()
