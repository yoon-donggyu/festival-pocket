#!/usr/bin/env python3
import json, os, re, sys, time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

KEY = os.environ.get('DATA_GO_KR_API_KEY','').strip()
IIAC_BASE = 'https://apis.data.go.kr/B551177/StatusOfPaxFltSched'
KAC_SCHED_BASE = 'https://apis.data.go.kr/B551178/flight-schedule'
KAC_SEARCH_BASE = 'https://apis.data.go.kr/B551178/flight-search'
FARES = Path('data/travelpayouts_fares.json')
OUT = Path('data/airport_schedule_probe.json')

TIMEOUT_SECONDS = 90
MAX_ATTEMPTS = 3
BACKOFF_SECONDS = [0, 3, 8]


def request_once(url, params):
    q = dict(params)
    q['serviceKey'] = KEY
    req = Request(url + '?' + urlencode(q), headers={
        'Accept':'application/json, application/xml;q=0.9, */*;q=0.8',
        'User-Agent':'Mozilla/5.0 TravelPocket/1.2'
    })
    try:
        with urlopen(req, timeout=TIMEOUT_SECONDS) as r:
            body = r.read().decode('utf-8', errors='replace')
            return {'ok': True, 'status': r.status,
                    'content_type': r.headers.get('content-type'),
                    'body_preview': body[:50000]}
    except HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        return {'ok': False, 'status': e.code, 'body_preview': body[:10000]}
    except (URLError, TimeoutError) as e:
        return {'ok': False, 'status': None, 'body_preview': str(e)}


def request_with_retry(url, params):
    attempts=[]; final=None
    for attempt in range(1, MAX_ATTEMPTS+1):
        delay=BACKOFF_SECONDS[attempt-1]
        if delay: time.sleep(delay)
        res=request_once(url, params)
        attempts.append({'attempt':attempt,'ok':res.get('ok',False),
                         'status':res.get('status'),
                         'error_or_preview':res.get('body_preview','')[:1000]})
        final=res
        if res.get('ok'): break
        if isinstance(res.get('status'),int) and 400 <= res['status'] < 500: break
    final=dict(final or {})
    final['attempts']=attempts
    final['attempt_count']=len(attempts)
    return final


def body_text(res):
    return (res.get('body_preview') or '').upper().replace(' ', '')


def flight_code(airline, number):
    a=(airline or '').strip().upper()
    n=str(number or '').strip().upper().replace(' ','')
    if not n: return ''
    if re.match(r'^[A-Z0-9]{2,3}\d', n): return n
    return a+n if a else n


def iso_date(value):
    if not value: return ''
    return str(value)[:10].replace('-','')


def probe_health():
    probes=[
        ('IIAC_DEPARTURES', IIAC_BASE+'/getPaxFltSchedDeparturesDeOdp',
         {'pageNo':'1','numOfRows':'30','type':'json','airport':'KIX','lang':'K'}),
        ('IIAC_ARRIVALS', IIAC_BASE+'/getPaxFltSchedArrivalsDeOdp',
         {'pageNo':'1','numOfRows':'30','type':'json','airport':'KIX','lang':'K'}),
        ('KAC_INT', KAC_SCHED_BASE+'/int',
         {'pageNo':'1','numOfRows':'30','schDate':'20260901','schDeptCityCode':'GMP','schArrvCityCode':'HND','type':'json'}),
        ('KAC_DOM', KAC_SCHED_BASE+'/dom',
         {'pageNo':'1','numOfRows':'30','schDate':'20260901','schDeptCityCode':'GMP','schArrvCityCode':'PUS','type':'json'}),
        ('KAC_FLIGHT_SEARCH', KAC_SEARCH_BASE+'/info',
         {'schLineType':'I','schIOType':'O','schAirCode':'GMP','schStTime':'0600','schEdTime':'2359','type':'json'}),
    ]
    results=[]
    for provider,url,params in probes:
        res=request_with_retry(url,params)
        results.append({'provider':provider,'endpoint':url,'params_without_key':params,**res})
        print(provider,'=>',res.get('status'),'OK' if res.get('ok') else 'FAIL')
        time.sleep(1.5)
    return results


def verify_top50(health):
    if not FARES.exists(): return []
    try:
        payload=json.loads(FARES.read_text(encoding='utf-8'))
    except Exception as e:
        print('Could not read fares:',e,file=sys.stderr); return []
    top=payload.get('top50') or []
    cache={}
    health_map={r['provider']:bool(r.get('ok')) for r in health}
    out=[]

    for idx,d in enumerate(top,1):
        origin=(d.get('origin') or '').upper()
        dest=(d.get('destination') or '').upper()
        depdate=iso_date(d.get('departure_at'))
        airline=(d.get('airline') or '').upper()
        fcode=flight_code(airline,d.get('flight_number'))
        params={}; provider=''; url=''; mode=''

        if origin=='GMP' and depdate and dest:
            provider='KAC_SCHEDULE_MATCH'; mode='date_route_flight'
            params={'pageNo':'1','numOfRows':'200','schDate':depdate,
                    'schDeptCityCode':'GMP','schArrvCityCode':dest,'type':'json'}
            if airline: params['schAirLine']=airline
            if fcode: params['schFlightNum']=fcode
            url=KAC_SCHED_BASE+'/int'
            key=(url,tuple(sorted(params.items())))
            if key not in cache:
                cache[key]=request_with_retry(url,params); time.sleep(0.8)
            res=cache[key]
        elif origin=='ICN' and dest:
            provider='IIAC_SCHEDULE_MATCH'; mode='route_flight_schedule'
            # IIAC endpoint is a regular-flight timetable. It has no search-date parameter,
            # so it verifies that the route/flight exists in the published timetable, not that
            # a cached fare is currently purchasable.
            params={'pageNo':'1','numOfRows':'1000','type':'json','airport':dest,'lang':'K'}
            url=IIAC_BASE+'/getPaxFltSchedDeparturesDeOdp'
            key=(url,dest)
            if key not in cache:
                cache[key]=request_with_retry(url,params); time.sleep(0.8)
            res=cache[key]
        else:
            res={'ok':False,'status':None,'body_preview':'Unsupported origin/route'}

        text=body_text(res)
        route_match=bool(res.get('ok')) and (dest in text or origin in text)
        flight_match=bool(fcode) and fcode.replace('-','') in text.replace('-','')
        official_score=0
        if res.get('ok'): official_score += 8
        if route_match: official_score += 7
        if flight_match: official_score += 10

        # KAC live flight-search is useful as a provider-health / same-day operation source,
        # but it cannot prove a future Sep-Dec fare is currently operating on that future date.
        live_api_ok=health_map.get('KAC_FLIGHT_SEARCH',False)

        out.append({
            'rank':idx,
            'key':f"{origin}-{dest}-{d.get('departure_at','')}-{d.get('return_at','')}-{airline}-{d.get('flight_number','')}",
            'origin':origin,'destination':dest,'departure_at':d.get('departure_at'),
            'return_at':d.get('return_at'),'airline':airline,
            'flight_number':d.get('flight_number'),'flight_code':fcode,
            'provider':provider,'verification_mode':mode,
            'api_ok':bool(res.get('ok')),'http_status':res.get('status'),
            'route_match':route_match,'flight_match':flight_match,
            'official_operation_score_25':official_score,
            'live_flight_search_api_ok':live_api_ok,
            'limitations':('IIAC timetable has no requested travel date; match means the route/flight '
                           'exists in the published regular timetable, not that the cached fare is still on sale.')
                          if origin=='ICN' else
                          ('KAC schedule is queried with the fare departure date. Live flight-search is '
                           'used only as a service-health signal for future travel dates.'),
            'params_without_key':params
        })
        print('VERIFY',idx,origin,dest,fcode,'=>',res.get('status'),
              'route',route_match,'flight',flight_match)
    return out


def main():
    if not KEY:
        print('DATA_GO_KR_API_KEY secret is missing',file=sys.stderr); sys.exit(2)
    health=probe_health()
    verifications=verify_top50(health)
    OUT.parent.mkdir(parents=True,exist_ok=True)
    OUT.write_text(json.dumps({
        'generated_at_utc':datetime.now(timezone.utc).isoformat(),
        'timeout_seconds':TIMEOUT_SECONDS,'max_attempts':MAX_ATTEMPTS,
        'results':health,'top50_verifications':verifications,
        'trust_model':{
            'price_freshness':30,
            'official_operation_match':25,
            'current_sale_price_confirmation':25,
            'cross_source_match':10,
            'baggage_tax_confirmation':10,
            'note':'Current-sale and baggage/tax confirmation remain 0 until a live offer/booking source is connected. Scores are intentionally conservative.'
        }
    },ensure_ascii=False,indent=2),encoding='utf-8')

if __name__=='__main__': main()
