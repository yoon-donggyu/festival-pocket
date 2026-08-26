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

PROBES = [
    ('IIAC_DEPARTURES', IIAC_BASE + '/getPaxFltSchedDeparturesDeOdp', {
        'pageNo':'1','numOfRows':'30','type':'json','airport':'KIX','lang':'K'
    }),
    ('IIAC_ARRIVALS', IIAC_BASE + '/getPaxFltSchedArrivalsDeOdp', {
        'pageNo':'1','numOfRows':'30','type':'json','airport':'KIX','lang':'K'
    }),
    ('KAC_INT', KAC_BASE + '/int', {
        'pageNo':'1','numOfRows':'30','schDate':'20260901',
        'schDeptCityCode':'GMP','schArrvCityCode':'HND','type':'json'
    }),
    ('KAC_DOM', KAC_BASE + '/dom', {
        'pageNo':'1','numOfRows':'30','schDate':'20260901',
        'schDeptCityCode':'GMP','schArrvCityCode':'PUS','type':'json'
    }),
]

def request(url, params):
    q = dict(params)
    q['serviceKey'] = KEY
    req = Request(url + '?' + urlencode(q), headers={
        'Accept':'application/json',
        'User-Agent':'TravelPocket/1.0'
    })
    try:
        with urlopen(req, timeout=25) as r:
            body = r.read().decode('utf-8', errors='replace')
            return {
                'ok': True,
                'status': r.status,
                'content_type': r.headers.get('content-type'),
                'body_preview': body[:6000]
            }
    except HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        return {'ok': False, 'status': e.code, 'body_preview': body[:3000]}
    except (URLError, TimeoutError) as e:
        return {'ok': False, 'status': None, 'body_preview': str(e)}

def main():
    if not KEY:
        print('DATA_GO_KR_API_KEY secret is missing', file=sys.stderr)
        sys.exit(2)

    results = []
    for provider, url, params in PROBES:
        res = request(url, params)
        results.append({
            'provider': provider,
            'endpoint': url,
            'params_without_key': params,
            **res
        })
        print(provider, '=>', res.get('status'), 'OK' if res.get('ok') else 'FAIL')

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        'generated_at_utc': datetime.now(timezone.utc).isoformat(),
        'results': results
    }, ensure_ascii=False, indent=2), encoding='utf-8')

if __name__ == '__main__':
    main()
