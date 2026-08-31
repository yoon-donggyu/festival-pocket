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
  const list = String(value || 'airbnb,booking').split(',').map(v => v.trim()).filter(v => allowed.has(v));
  return list.length ? [...new Set(list)] : ['airbnb', 'booking'];
}

function pickPhoto(item) {
  if (Array.isArray(item?.images) && item.images.length) {
    const first = item.images[0];
    return typeof first === 'string' ? first : (first?.url || first?.src || first?.original || first?.thumbnail || '');
  }
  return item?.image || item?.thumbnail || '';
}

function validHttpUrl(value) {
  try {
    const u = new URL(String(value || ''));
    return /^https?:$/.test(u.protocol) ? u.toString() : '';
  } catch { return ''; }
}

function isKoreaLocation(loc) {
  const country = String(loc?.country || '').trim().toUpperCase();
  if (country === 'KR' || country === 'KOR' || country.includes('KOREA')) return true;
  const lat = Number(loc?.lat), lng = Number(loc?.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= 33 && lat <= 39.7 && lng >= 124 && lng <= 132;
}

function normalizeRating(item) {
  const rating = Number(item?.guestRating || item?.rating || 0) || null;
  const scale = Number(item?.ratingScale || 0) || (rating && rating <= 5 ? 5 : 10);
  const normalized = rating && scale ? Math.round((rating / scale) * 100) / 10 : 0;
  return { rating, ratingScale: scale, ratingNormalized: normalized };
}

function normalize(item, region) {
  const price = item?.price || {};
  const total = Number(price?.totalPrice ?? price?.total ?? item?.totalPrice ?? 0) || 0;
  const nightly = Number(price?.nightlyPrice ?? price?.nightly ?? item?.nightlyPrice ?? 0) || 0;
  const nights = Number(price?.nights || 0) || null;
  const currency = String(price?.currency || item?.currency || '').toUpperCase() || null;
  const loc = item?.location || {};
  const address = item?.address || [loc?.city, loc?.region, loc?.country].filter(Boolean).join(', ') || region;
  const amenities = Array.isArray(item?.amenities) ? item.amenities : [];
  const pool = amenities.some(a => String(a).toLowerCase().includes('pool')) || /pool|수영장/i.test(String(item?.description || ''));
  const { rating, ratingScale, ratingNormalized } = normalizeRating(item);
  return {
    id: String(item?.id || `${item?.platform || 'stay'}-${item?.platformListingId || Math.random()}`),
    provider: String(item?.platform || item?.provider || 'stayingapi'),
    platformListingId: item?.platformListingId || null,
    region,
    country: String(loc?.country || ''),
    lat: Number(loc?.lat) || null,
    lng: Number(loc?.lng) || null,
    name: item?.name || item?.title || '숙소',
    address,
    price: Math.round(total || nightly),
    nightlyPrice: Math.round(nightly || total),
    nights,
    currency,
    rating,
    ratingScale,
    ratingNormalized,
    reviews: Number(item?.reviewCount || item?.reviews || 0) || null,
    type: item?.propertyType || 'other',
    typeLabel: TYPE_LABEL[item?.propertyType] || '숙박',
    cancellation: amenities.includes('free_cancellation') ? '무료취소' : '',
    pool,
    bedrooms: Number(item?.bedrooms || 0) || null,
    bathrooms: Number(item?.bathrooms || 0) || null,
    maxOccupancy: Number(item?.maxOccupancy || item?.guests || 0) || null,
    amenities,
    photo: pickPhoto(item),
    url: validHttpUrl(item?.url || item?.identity?.canonicalUrl || item?.deeplink || ''),
    isKorea: isKoreaLocation(loc),
  };
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
    const err = new Error(data?.error?.message || data?.message || `StayingAPI ${response.status}`);
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
    if (Array.isArray(result?.results)) return result.results;
    return [];
  }
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  return [];
}

function typeMatches(x, type) {
  if (type === 'all') return true;
  if (type === 'villa') return x.type === 'villa';
  if (type === 'house') return x.type === 'house';
  if (type === 'family') return ['villa', 'house', 'cottage', 'apartment', 'other'].includes(x.type);
  return true;
}

function resultResponse(payload, region, type, started, fromJob = false) {
  const rows = rowsFromEnvelope(payload, fromJob);
  const normalized = rows.map(x => normalize(x, region));
  const korean = normalized.filter(x => x.isKorea && x.price > 0 && typeMatches(x, type));
  const currencyOk = korean.filter(x => x.currency === 'KRW');
  const items = (currencyOk.length ? currencyOk : korean).sort((a, b) => a.price - b.price);
  return {
    ok: true,
    mode: 'live',
    keyType: 'live',
    provider: 'StayingAPI',
    count: items.length,
    items,
    filteredForeign: normalized.filter(x => !x.isKorea).length,
    creditsCharged: Number(payload?.meta?.creditsCharged || 0),
    partial: Boolean(payload?.meta?.partial),
    warnings: payload?.meta?.warnings || [],
    elapsed_ms: Date.now() - started,
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const started = Date.now();
  const apiKey = process.env.STAYING_API_KEY || '';
  const kt = keyType(apiKey);

  if (String(req.query?.health || '') === '1') {
    return res.status(200).json({
      ok: true,
      live: kt === 'live',
      keyType: kt,
      mode: kt === 'live' ? 'live' : kt === 'test' ? 'test' : 'demo',
      provider: 'StayingAPI',
    });
  }

  if (kt === 'none' || kt === 'unknown') {
    return res.status(503).json({ ok: false, mode: 'demo', keyType: kt, error: 'STAYING_API_KEY가 없거나 StayingAPI 키 형식이 아닙니다.' });
  }

  if (kt === 'test') {
    return res.status(200).json({
      ok: true,
      mode: 'test',
      keyType: 'test',
      provider: 'StayingAPI',
      items: [],
      message: '현재 stay_test_ 샌드박스 키입니다. 실제 가평 숙소/가격을 조회하려면 stay_live_ 키로 교체하세요.',
    });
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
        return res.status(200).json({ ok: true, mode: 'live', pending: true, jobId, jobStatus: status, retryAfter: result.retryAfter || 3 });
      }
      if (status === 'failed') return res.status(502).json({ ok: false, error: payload?.data?.error?.message || 'StayingAPI 검색 작업 실패' });
      if (status === 'completed') return res.status(200).json(resultResponse(payload, region, type, started, true));
      return res.status(502).json({ ok: false, error: '알 수 없는 StayingAPI 작업 상태입니다.' });
    } catch (error) {
      return res.status(Number(error?.status) || 502).json({ ok: false, error: error?.message || '작업 조회 실패' });
    }
  }

  const checkin = String(req.query?.checkin || '2026-09-22');
  const checkout = String(req.query?.checkout || '2026-09-23');
  const adults = clamp(req.query?.adults || 6, 1, 30);
  const children = clamp(req.query?.children || 1, 0, 10);
  const childAge = clamp(req.query?.childAge || 2, 0, 17);
  const limit = clamp(req.query?.limit || 5, 5, 20);
  const platforms = parsePlatforms(req.query?.platforms);
  const location = REGION_LOCATION[region] || `${region}, South Korea`;

  const params = new URLSearchParams();
  params.set('location', location);
  params.set('checkIn', checkin);
  params.set('checkOut', checkout);
  params.set('adults', String(adults));
  params.set('children', String(children));
  if (children > 0) for (let i = 0; i < children; i++) params.append('childAges[]', String(childAge));
  params.set('platforms', platforms.join(','));
  params.set('limit', String(limit));
  params.set('currency', 'KRW');

  try {
    const result = await stayingGet(`/v1/search?${params.toString()}`, apiKey);
    const payload = result.data;
    if (result.status === 202) {
      const newJobId = payload?.data?.jobId;
      if (!newJobId) throw new Error('StayingAPI가 작업 ID 없이 202를 반환했습니다.');
      return res.status(202).json({ ok: true, mode: 'live', pending: true, jobId: newJobId, retryAfter: result.retryAfter || 3 });
    }
    return res.status(200).json({
      ...resultResponse(payload, region, type, started, false),
      query: { region, checkin, checkout, adults, children, childAge, type, platforms, limit, currency: 'KRW' },
    });
  } catch (error) {
    const status = Number(error?.status) || 502;
    return res.status(status >= 400 && status < 600 ? status : 502).json({ ok: false, mode: 'live', provider: 'StayingAPI', error: error?.message || 'StayingAPI 요청 실패' });
  }
};
