# Festival Pocket · Web 배포용

이 버전은 **화면은 GitHub Pages**, **날씨는 기존 Google Apps Script**로 분리한 구조입니다.

## 파일
- `index.html` : 화면 구조 + 축제 18개 기본 데이터
- `styles.css` : 모바일/다크모드 UI
- `app.js` : 필터, 접기, 찜, 지도, T맵, 기상청 날씨
- `manifest.webmanifest` / `icon.svg` : 홈 화면 추가용

## 날씨 서버
현재 연결 주소:
`https://script.google.com/macros/s/AKfycbxjq6tyDI5iHyXHChKhd4wvsNf42QvBqFI6DNl6oYc1CAEbVFaD5NOSvO2cZoXX856oiw/exec`

기상청 API 키는 웹페이지에 직접 들어있지 않고 Apps Script에서 처리합니다.

## GitHub Pages 올리는 방법
1. GitHub에서 새 저장소를 만듭니다. 예: `festival-pocket`
2. 이 폴더의 5개 파일을 저장소 루트에 업로드합니다.
3. 저장소의 **Settings → Pages**로 이동합니다.
4. **Source: Deploy from a branch** 선택
5. **Branch: main / Folder: /(root)** 선택 후 Save
6. 1~3분 뒤 주소가 생성됩니다.
   `https://내아이디.github.io/festival-pocket/`
7. 그 링크를 카카오톡으로 공유하면 됩니다.

## 장점
- Apps Script iframe 제약 없음
- iPhone Safari / Chrome / 카카오톡 링크에서 일반 웹페이지처럼 실행
- localStorage 기반 찜/선택 저장 정상
- 축제 기본 목록은 HTML에 미리 포함되어 JS가 일부 실패해도 빈 화면이 되지 않음
- 날씨 API 서버는 지금 정상 확인한 Apps Script 그대로 재사용

## 수정할 때
축제 화면 수정은 GitHub의 `index.html`, `styles.css`, `app.js`만 업데이트하면 됩니다.
Apps Script는 날씨 API가 바뀌지 않는 한 건드릴 필요 없습니다.
