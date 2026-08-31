const REGION_LOCATION = {
  '가평': 'Gapyeong-gun, Gyeonggi-do, South Korea',
  '양평': 'Yangpyeong-gun, Gyeonggi-do, South Korea',
  '포천': 'Pocheon-si, Gyeonggi-do, South Korea',
  '춘천': 'Chuncheon-si, Gangwon-do, South Korea',
  '홍천': 'Hongcheon-gun, Gangwon-do, South Korea',
  '남양주': 'Namyangju-si, Gyeonggi-do, South Korea',
  '강화': 'Ganghwa-gun, Incheon, South Korea',
  '서울': 'Seoul, South Korea',
};

const TYPE_LABEL = {
  hotel: '호텔', apartment: '아파트/레지던스', house: '독채',
  villa: '빌라/풀빌라', cottage: '코티지/펜션', other: '숙박',
};

function clamp(n, min, max) {
  const v = Number(n);
  return Math.min(max, Math.max(min, Number.isFinite(v) ? v : min));
}

function keyType(key) {
  if (/^stay_live_/i.test(key)) return 'live';
  if (/^stay_test_/i.test(key)) return 'test';
  return key ? 'unknown' : 'none';
}

function parsePlatforms(value) {
  const allowed = new Set(['airbnb', 'booking', 'vrbo', 'google']);
  const list = String(value || 'airbnb,booking')
    .split(',').map(v => v.trim()).filter(v => allowed.has(v));
  return list.length ? [...new Set(list)] : ['airbnb', 'booking'];
}

function validHttpUrl(value) {
  try {
    const u = new URL(String(value || ''));
    return /^https?:$/.test(u.protocol) ? u.toString() : '';
  } catch { return ''; }
}

function pickPhoto(item) {
  if (Array.isArray(item?.images) && item.images.length) {
    const first = item.images[0];
    return typeof first === 'string' ? first : (first?.url || first?.src || '');
  }
  return item?.image || item?.thumbnail || '';
}

function isKorea(loc) {
  const country = String(loc?.country || '').trim().toUpperCase();
  if (['KR', 'KOR'].includes(country) || country.includes('KOREA')) return true;
  const lat = Number(loc?.lat), lng = Number(loc?.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= 33 && lat <= 39.7 && lng >= 124 && lng <= 132;
}

function normalize(item, region) {
  const p = item?.price || {};
  const total = Number(p?.totalPrice ?? item?.totalPrice ?? 0) || 0;
  const nightly = Number(p?.nightlyPrice ?? item?.nightlyPrice ?? 0) || 0;
  const loc = item?.location || {};
  const amenities = Array.isArray(item?.amenities) ? item.amenities : [];
  const rating = Number(item?.guestRating ?? item?.rating ?? 0) || null;
  const ratingScale = Number(item?.ratingScale || 0) || (rating && rating <= 5 ? 5 : 10);
  const type = item?.propertyType || 'other';
  return {
    id: String(item?.id || `${item?.platform || 'stay'}-${item?.platformListingId || Math.random()}`),
    provider: String(item?.platform || 'stayingapi'),
    region,
    name: item?.name || item?.title || '숙소',
    address: item?.address || [loc?.city, loc?.region, loc?.country].filter(Boolean).join(', ') || region,
    country: String(loc?.country || ''),
    price: Math.round(total || nightly),
    nightlyPrice: Math.round(nightly || total),
    currency: String(p?.currency || item?.currency || '').toUpperCase() || 'USD',
    nights: Number(p?.nights || 0) || null,
    rating,
    ratingScale,
    ratingNormalized: rating && ratingScale ? (rating / ratingScale) * 10 : 0,
    reviews: Number(item?.reviewCount || 0) || null,
    type,
    typeLabel: TYPE_LABEL[type] || '숙박',
    pool: amenities.some(a => /pool/i.test(String(a))),
    bedrooms: Number(item?.bedrooms || 0) || null,
    bathrooms: Number(item?.bathrooms || 0) || null,
    maxOccupancy: Number(item?.maxOccupancy || 0) || null,
    amenities,
    photo: pickPhoto(item),
    url: validHttpUrl(item?.url || item?.identity?.canonicalUrl || ''),
    isKorea: isKorea(loc),
  };
}

function typeMatches(x, type) {
  if (type === 'all') return true;
  if (type === 'villa') return x.type === 'villa';
  if (type === 'house') return x.type === 'house';
  if (type === 'family') return ['villa', 'house', 'cottage', 'apartment', 'other'].includes(x.type);
  return true;
}

async function stayingGet(path, apiKey) {
  const response = await fetch(`https://api.stayingapi.com${path}`, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
  });
  const retryAfter = Number(response.headers.get('retry-after') || 0) || null;
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!response.ok && response.status !== 202) {
    const message = data?.error?.message || data?.error || data?.message || data?.raw || `StayingAPI HTTP ${response.status}`;
    const err = new Error(typeof message === 'string' ? message : JSON.stringify(message));
    err.status = response.status;
    throw err;
  }
  return { status: response.status, data, retryAfter };
}

function rowsFromEnvelope(payload, fromJob = false) {
  if (fromJob) {
    const result = payload?.data?.result;
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.data)) return result.data;
    return [];
  }
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function resultResponse(payload, region, type, started, fromJob = false) {
  const all = rowsFromEnvelope(payload, fromJob).map(x => normalize(x, region));
  const items = all.filter(x => x.isKorea && x.price > 0 && typeMatches(x, type))
    .sort((a, b) => a.price - b.price);
  const meta = fromJob ? (payload?.meta || {}) : (payload?.meta || {});
  return {
    ok: true, mode: 'live', keyType: 'live', provider: 'StayingAPI',
    count: items.length, items,
    filteredForeign: all.filter(x => !x.isKorea).length,
    creditsCharged: Number(meta?.creditsCharged || 0),
    partial: Boolean(meta?.partial), warnings: meta?.warnings || [],
    elapsed_ms: Date.now() - started,
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const started = Date.now();
  const apiKey = String(process.env.STAYING_API_KEY || '').trim();
  const kt = keyType(apiKey);

  if (String(req.query?.health || '') === '1') {
    return res.status(200).json({ ok: true, live: kt === 'live', keyType: kt, provider: 'StayingAPI' });
  }

  if (kt === 'none') {
    return res.status(503).json({ ok: false, keyType: kt, error: 'STAYING_API_KEY가 등록되지 않았습니다.' });
  }
  if (kt === 'unknown') {
    return res.status(503).json({ ok: false, keyType: kt, error: 'STAYING_API_KEY 형식이 StayingAPI 키가 아닙니다. Live 키는 stay_live_ 로 시작해야 합니다.' });
  }
  if (kt === 'test') {
    return res.status(200).json({ ok: true, mode: 'test', keyType: kt, items: [], message: 'stay_test_ 샌드박스 키입니다.' });
  }

  const region = String(req.query?.region || '가평');
  const type = String(req.query?.type || 'family');
  const jobId = String(req.query?.jobId || '').trim();

  if (jobId) {
    try {
      const result = await stayingGet(`/v1/jobs/${encodeURIComponent(jobId)}`, apiKey);
      const payload = result.data;
      const status = payload?.data?.status;
      if (status === 'pending' || status === 'running') {
        return res.status(200).json({ ok: true, mode: 'live', pending: true, jobId, retryAfter: result.retryAfter || 3 });
      }
      if (status === 'failed') {
        return res.status(502).json({ ok: false, error: payload?.data?.error?.message || payload?.data?.error || 'StayingAPI 작업 실패' });
      }
      if (status === 'completed') return res.status(200).json(resultResponse(payload, region, type, started, true));
      return res.status(502).json({ ok: false, error: `알 수 없는 작업 상태: ${status || '없음'}` });
    } catch (error) {
      return res.status(Number(error?.status) || 502).json({ ok: false, error: error?.message || '작업 조회 실패' });
    }
  }

  const checkin = String(req.query?.checkin || '2026-09-22');
  const checkout = String(req.query?.checkout || '2026-09-23');
  const adults = clamp(req.query?.adults || 6, 1, 30);
  const children = clamp(req.query?.children || 1, 0, 10);
  const limit = clamp(req.query?.limit || 5, 5, 20);
  const platforms = parsePlatforms(req.query?.platforms);
  const location = REGION_LOCATION[region] || `${region}, South Korea`;

  // Keep the live call intentionally minimal and aligned with StayingAPI's documented /v1/search examples.
  const params = new URLSearchParams({
    location,
    checkIn: checkin,
    checkOut: checkout,
    adults: String(adults),
    children: String(children),
    platforms: platforms.join(','),
    limit: String(limit),
  });

  try {
    const result = await stayingGet(`/v1/search?${params.toString()}`, apiKey);
    const payload = result.data;
    if (result.status === 202) {
      const newJobId = payload?.data?.jobId;
      if (!newJobId) throw new Error('StayingAPI가 202를 반환했지만 jobId가 없습니다.');
      return res.status(202).json({ ok: true, mode: 'live', pending: true, jobId: newJobId, retryAfter: result.retryAfter || 3 });
    }
    return res.status(200).json({
      ...resultResponse(payload, region, type, started, false),
      query: { region, location, checkin, checkout, adults, children, platforms, limit },
    });
  } catch (error) {
    const status = Number(error?.status) || 502;
    return res.status(status >= 400 && status < 600 ? status : 502).json({
      ok: false, mode: 'live', provider: 'StayingAPI', status,
      error: error?.message || 'StayingAPI 요청 실패',
      hint: status === 401 ? 'Live API 키가 맞는지 확인하세요.' : status === 429 ? '요청 한도 또는 크레딧을 확인하세요.' : '',
    });
  }
};
