#!/usr/bin/env python3
import json, os, sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

KEY = os.environ.get('DATA_GO_KR_API_KEY','').strip()
IIAC_BASE = 'https://apis.data.go.kr/B551177/StatusOfPaxFltSched'
KAC_BASE = 'https://apis.data.go.kr/B551178/flight-schedule'
OUT = Path('data/airport_schedule_probe.json')

# Operation paths are intentionally probed because data.go.kr gateway operation names
# are not present in the supplied endpoint screenshot. Known ICN operation is included;
# KAC candidates are tested without fabricating user-facing schedule data.
PROBES = [
    ('IIAC', IIAC_BASE + '/getPaxFltSched', {'type':'json','numOfRows':'10','pageNo':'1'}),
    ('IIAC', IIAC_BASE + '/getPaxFltSchedList', {'type':'json','numOfRows':'10','pageNo':'1'}),
    ('KAC', KAC_BASE + '/getFlightSchedule', {'type':'json','numOfRows':'10','pageNo':'1'}),
    ('KAC', KAC_BASE + '/getFlightScheduleList', {'type':'json','numOfRows':'10','pageNo':'1'}),
    ('KAC', KAC_BASE + '/v1', {'type':'json','numOfRows':'10','pageNo':'1'}),
]

def request(url, params):
    q = dict(params)
    q['serviceKey'] = KEY
    req = Request(url + '?' + urlencode(q), headers={'Accept':'application/json','User-Agent':'TravelPocket/1.0'})
    try:
        with urlopen(req, timeout=25) as r:
            body = r.read().decode('utf-8', errors='replace')
            return {'ok': True, 'status': r.status, 'content_type': r.headers.get('content-type'), 'body_preview': body[:4000]}
    except HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        return {'ok': False, 'status': e.code, 'body_preview': body[:2000]}
    except (URLError, TimeoutError) as e:
        return {'ok': False, 'status': None, 'body_preview': str(e)}

def main():
    if not KEY:
        print('DATA_GO_KR_API_KEY secret is missing', file=sys.stderr)
        sys.exit(2)
    results=[]
    for provider,url,params in PROBES:
        res=request(url,params)
        # Never persist the key or the request query string.
        results.append({'provider':provider,'endpoint':url,**res})
        print(provider, url, '=>', res.get('status'), 'OK' if res.get('ok') else 'FAIL')
    OUT.parent.mkdir(parents=True,exist_ok=True)
    OUT.write_text(json.dumps({'generated_at_utc':datetime.now(timezone.utc).isoformat(),'results':results},ensure_ascii=False,indent=2),encoding='utf-8')
    # Probe failures are allowed: output tells us the exact live gateway response.

if __name__=='__main__':
    main()
