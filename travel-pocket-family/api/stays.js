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
  return Math.min(max, Math.max(min, Number(n) || min));
}

function parsePlatforms(value) {
  const allowed = new Set(['airbnb', 'booking', 'vrbo', 'google']);
  const list = String(value || 'airbnb,booking').split(',').map(v => v.trim()).filter(v => allowed.has(v));
  return list.length ? [...new Set(list)] : ['airbnb', 'booking'];
}

function pickPhoto(item) {
  if (Array.isArray(item?.images) && item.images.length) {
    const first = item.images[0];
    return typeof first === 'string' ? first : (first?.url || first?.src || '');
  }
  return item?.image || item?.thumbnail || '';
}

function normalizeRating(item) {
  const rating = Number(item?.guestRating || item?.rating || 0) || null;
  const scale = Number(item?.ratingScale || 0) || (rating && rating <= 5 ? 5 : 10);
  const normalized = rating && scale ? Math.round((rating / scale) * 100) / 10 : 0;
  return { rating, ratingScale: scale, ratingNormalized: normalized };
}

function normalize(item, region) {
  const price = item?.price || {};
  const total = Number(price?.totalPrice || price?.total || item?.totalPrice || 0) || 0;
  const nightly = Number(price?.nightlyPrice || price?.nightly || item?.nightlyPrice || 0) || 0;
  const currency = price?.currency || item?.currency || 'KRW';
  const loc = item?.location || {};
  const address = item?.address || [loc?.city, loc?.region].filter(Boolean).join(', ') || region;
  const amenities = Array.isArray(item?.amenities) ? item.amenities : [];
  const pool = amenities.some(a => String(a).toLowerCase().includes('pool')) || /pool/i.test(String(item?.description || ''));
  const { rating, ratingScale, ratingNormalized } = normalizeRating(item);
  return {
    id: String(item?.id || `${item?.platform || 'stay'}-${item?.platformListingId || Math.random()}`),
    provider: String(item?.platform || item?.provider || 'stayingapi'),
    region,
    name: item?.name || item?.title || '숙소',
    address,
    price: Math.round(total || nightly),
    nightlyPrice: Math.round(nightly || total),
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
    url: item?.url || item?.deeplink || '',
  };
}

function demoItems(region) {
  const base = [319000, 358000, 397000, 429000, 468000];
  const providers = ['airbnb', 'booking', 'airbnb', 'booking', 'google'];
  return base.map((price, i) => ({
    id: `demo-${i + 1}`, provider: providers[i], region,
    name: `${region} StayingAPI 샘플 ${String.fromCharCode(65 + i)}`,
    address: `${region} 지역 · 샘플 데이터`, price, nightlyPrice: price, currency: 'KRW',
    rating: [4.8, 9.1, 4.7, 8.8, 4.5][i], ratingScale: [5,10,5,10,5][i],
    ratingNormalized: [9.6,9.1,9.4,8.8,9.0][i], reviews: [83,142,51,218,37][i],
    type: i < 3 ? 'villa' : 'house', typeLabel: i < 3 ? '빌라/풀빌라' : '독채',
    cancellation: i % 2 === 0 ? '무료취소 여부 확인' : '', pool: i < 4,
    bedrooms: i < 3 ? 3 : 2, bathrooms: 2, maxOccupancy: 7,
    amenities: ['pool', 'wifi', 'kitchen'], photo: '', url: '', demo: true,
  }));
}

async function stayingGet(path, apiKey) {
  const response = await fetch(`https://api.stayingapi.com${path}`, {
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' },
  });
  const retryAfter = Number(response.headers.get('retry-after') || 0) || null;
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!response.ok && response.status !== 202) {
    const err = new Error(data?.error?.message || data?.message || `StayingAPI ${response.status}`);
    err.status = response.status; err.payload = data; throw err;
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

function resultResponse(payload, region, started, fromJob = false) {
  const rows = rowsFromEnvelope(payload, fromJob);
  const items = rows.map(x => normalize(x, region)).filter(x => x.price > 0).sort((a,b) => a.price - b.price);
  return {
    ok: true, mode: 'live', provider: 'StayingAPI', count: items.length, items,
    creditsCharged: Number(payload?.meta?.creditsCharged || 0),
    partial: Boolean(payload?.meta?.partial), warnings: payload?.meta?.warnings || [],
    elapsed_ms: Date.now() - started,
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const started = Date.now();
  const apiKey = process.env.STAYING_API_KEY || '';
  const live = Boolean(apiKey);

  if (String(req.query?.health || '') === '1') {
    return res.status(200).json({ ok: true, live, mode: live ? 'live' : 'demo', provider: 'StayingAPI' });
  }

  const region = String(req.query?.region || '가평');
  if (!live) {
    return res.status(200).json({ ok: true, mode: 'demo', provider: 'StayingAPI', items: demoItems(region), warning: 'STAYING_API_KEY가 없어 샘플 데이터를 반환했습니다.' });
  }

  const jobId = String(req.query?.jobId || '').trim();
  if (jobId) {
    try {
      const result = await stayingGet(`/v1/jobs/${encodeURIComponent(jobId)}`, apiKey);
      const payload = result.data;
      const status = payload?.data?.status;
      if (status === 'pending' || status === 'running') {
        return res.status(200).json({ ok: true, mode: 'live', pending: true, jobId, jobStatus: status, retryAfter: result.retryAfter || 3, estimatedSeconds: payload?.data?.estimatedSeconds || null });
      }
      if (status === 'failed') return res.status(502).json({ ok: false, error: payload?.data?.error?.message || 'StayingAPI 검색 작업 실패' });
      if (status === 'completed') return res.status(200).json(resultResponse(payload, region, started, true));
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
  const rooms = clamp(req.query?.rooms || 1, 1, 10);
  const limit = clamp(req.query?.limit || 5, 1, 20);
  const type = String(req.query?.type || 'family');
  const platforms = parsePlatforms(req.query?.platforms);
  const location = REGION_LOCATION[region] || `${region}, South Korea`;

  const params = new URLSearchParams();
  params.set('location', location); params.set('checkIn', checkin); params.set('checkOut', checkout);
  params.set('adults', String(adults)); params.set('children', String(children)); params.set('rooms', String(rooms));
  if (children > 0) for (let i = 0; i < children; i++) params.append('childAges[]', String(childAge));
  params.set('platforms', platforms.join(',')); params.set('limit', String(limit)); params.set('sort', 'price_asc'); params.set('currency', 'KRW');
  if (type === 'villa') params.append('propertyType[]', 'villa');
  else if (type === 'house') params.append('propertyType[]', 'house');
  else if (type === 'family') ['villa','house','cottage'].forEach(t => params.append('propertyType[]', t));

  try {
    const result = await stayingGet(`/v1/search?${params.toString()}`, apiKey);
    const payload = result.data;
    if (result.status === 202) {
      const newJobId = payload?.data?.jobId;
      if (!newJobId) throw new Error('StayingAPI가 작업 ID 없이 202를 반환했습니다.');
      return res.status(202).json({ ok: true, mode: 'live', pending: true, jobId: newJobId, retryAfter: result.retryAfter || 3, estimatedSeconds: payload?.data?.estimatedSeconds || null });
    }
    return res.status(200).json({ ...resultResponse(payload, region, started, false), query: { region, checkin, checkout, adults, children, childAge, rooms, type, platforms, limit } });
  } catch (error) {
    const status = Number(error?.status) || 502;
    return res.status(status >= 400 && status < 600 ? status : 502).json({ ok: false, mode: 'live', provider: 'StayingAPI', error: error?.message || 'StayingAPI 요청 실패' });
  }
};
