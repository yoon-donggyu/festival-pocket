# Travel Pocket Family

가족 국내여행용 StayingAPI 숙박 가격 비교 앱입니다.

## Vercel 배포
1. Vercel → Add New → Project
2. GitHub 저장소 `yoon-donggyu/festival-pocket` 선택 후 Import
3. Project Name: `travel-pocket-family`
4. Root Directory에서 `Edit` → `travel-pocket-family` 선택
5. Environment Variables에 아래 값을 추가
   - Name: `STAYING_API_KEY`
   - Value: StayingAPI에서 발급받은 키
6. Deploy

## 기본 검색 조건
- 2026-09-22 ~ 2026-09-23
- 성인 6명 + 2세 아동 1명
- 가평
- Airbnb + Booking
- 플랫폼당 5개 결과

API 키는 브라우저 HTML에 저장되지 않고 `/api/stays` Vercel 서버 함수에서만 사용됩니다.
