#!/usr/bin/env python3
import json, os, sys, time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

KEY = os.environ.get('DATA_GO_KR_API_KEY','').strip()
IIAC_BASE = 'https://apis.data.go.kr/B551177/StatusOfPaxFltSched'
KAC_SCHEDULE_BASE = 'https://apis.data.go.kr/B551178/flight-schedule'
KAC_SEARCH_BASE = 'https://apis.data.go.kr/B551178/flight-search'
OUT = Path('data/airport_schedule_probe.json')

# 공공데이터포털에서 승인된 실제 상세기능 경로 기준.
PROBES = [
    ('IIAC_DEPARTURES', IIAC_BASE + '/getPaxFltSchedDeparturesDeOdp', {
        'pageNo':'1','numOfRows':'30','type':'json','airport':'KIX','lang':'K'
    }),
    ('IIAC_ARRIVALS', IIAC_BASE + '/getPaxFltSchedArrivalsDeOdp', {
        'pageNo':'1','numOfRows':'30','type':'json','airport':'KIX','lang':'K'
    }),
    ('KAC_INT_SCHEDULE', KAC_SCHEDULE_BASE + '/int', {
        'pageNo':'1','numOfRows':'30','schDate':'20260901',
        'schDeptCityCode':'GMP','schArrvCityCode':'HND','type':'json'
    }),
    ('KAC_DOM_SCHEDULE', KAC_SCHEDULE_BASE + '/dom', {
        'pageNo':'1','numOfRows':'30','schDate':'20260901',
        'schDeptCityCode':'GMP','schArrvCityCode':'PUS','type':'json'
    }),
    # 한국공항공사 항공기 운항정보 항공편 검색 /info
    # schLineType: D 국내 / I 국제, schIOType: I 도착 / O 출발
    ('KAC_FLIGHT_SEARCH', KAC_SEARCH_BASE + '/info', {
        'schLineType':'I','schIOType':'O','schAirCode':'GMP',
        'schStTime':'0600','schEdTime':'2359','type':'json'
    }),
]

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
            return {
                'ok': True,
                'status': r.status,
                'content_type': r.headers.get('content-type'),
                'body_preview': body[:12000]
            }
    except HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        return {'ok': False, 'status': e.code, 'body_preview': body[:6000]}
    except (URLError, TimeoutError) as e:
        return {'ok': False, 'status': None, 'body_preview': str(e)}


def request_with_retry(url, params):
    attempts = []
    final = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        delay = BACKOFF_SECONDS[attempt - 1]
        if delay:
            time.sleep(delay)
        res = request_once(url, params)
        attempts.append({
            'attempt': attempt,
            'ok': res.get('ok', False),
            'status': res.get('status'),
            'error_or_preview': res.get('body_preview', '')[:1000]
        })
        final = res
        if res.get('ok'):
            break
        if isinstance(res.get('status'), int) and 400 <= res['status'] < 500:
            break
    final = dict(final or {})
    final['attempts'] = attempts
    final['attempt_count'] = len(attempts)
    return final


def main():
    if not KEY:
        print('DATA_GO_KR_API_KEY secret is missing', file=sys.stderr)
        sys.exit(2)

    results = []
    for provider, url, params in PROBES:
        res = request_with_retry(url, params)
        results.append({
            'provider': provider,
            'endpoint': url,
            'params_without_key': params,
            **res
        })
        print(provider, '=>', res.get('status'),
              'OK' if res.get('ok') else 'FAIL',
              f"attempts={res.get('attempt_count')}")
        time.sleep(2)

    ok_count = sum(1 for r in results if r.get('ok'))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        'generated_at_utc': datetime.now(timezone.utc).isoformat(),
        'timeout_seconds': TIMEOUT_SECONDS,
        'max_attempts': MAX_ATTEMPTS,
        'ok_count': ok_count,
        'total_count': len(results),
        'results': results
    }, ensure_ascii=False, indent=2), encoding='utf-8')

if __name__ == '__main__':
    main()
