window.addEventListener("error",function(e){
  console.error("Festival Pocket runtime error",e.error||e.message);
});
window.addEventListener("unhandledrejection",function(e){
  console.error("Festival Pocket promise error",e.reason);
});


const festivals = [
{id:1,name:"2026 송도맥주축제",start:"2026-08-22",end:"2026-08-30",dateText:"8.22(토) – 8.30(일)",month:8,region:"인천",district:"연수구",place:"송도달빛축제공원",search:"송도달빛축제공원",lat:37.4074,lng:126.6339,type:"맥주",pin:"beer",icon:"🍺",format:"야외 테마파크형 · 음악+맥주",rating:4.9,status:"확정",fee:"일반·유료존 혼합",crowd:"매우 혼잡",desc:"9일간 공원이 ‘BEER LAND’로 변신. 메인무대, EDM, 라이브, 불꽃놀이, 패밀리존까지 있어 체류형 축제에 가깝습니다.",tags:["공연","맥주","불꽃","먹거리","야간"],source:"https://songdobeer.com/",scope:1},
{id:2,name:"2026 동대문구 맥주축제",start:"2026-08-28",end:"2026-08-29",dateText:"8.28(금) – 8.29(토) · 17:00–22:00",month:8,region:"서울",district:"동대문구",place:"장안1 수변공원",search:"장안1수변공원",lat:37.5678,lng:127.0732,type:"맥주",pin:"beer",icon:"🍻",format:"도심 야시장형 · 맥주+푸드+공연",rating:4.3,status:"확정",fee:"무료 입장",crowd:"혼잡",desc:"수제맥주·푸드트럭·돗자리존·재즈·DJ 공연과 음악영화가 결합된 소규모 도심형 축제.",tags:["맥주","푸드트럭","DJ","데이트"],source:"https://festival.seoul.go.kr/festival/main/festivalView.do?festacode=515",scope:0},
{id:3,name:"제3회 서울조각페스티벌",start:"2026-08-29",end:"2026-09-04",dateText:"메인 8.29 – 9.4 · 전시 일부 11.30까지",month:8,region:"서울",district:"종로·광진",place:"열린송현녹지광장·뚝섬한강공원",search:"열린송현녹지광장",lat:37.5761,lng:126.9821,type:"전시·예술",pin:"art",icon:"🗿",format:"야외 전시장형 · 조각+체험",rating:4.0,status:"확정",fee:"무료",crowd:"보통",desc:"도심 녹지와 한강을 전시장처럼 쓰는 야외 조각 축제. 전시·거리공연·체험을 산책하듯 즐기기 좋습니다.",tags:["조각","전시","산책","무료"],source:"https://festival.seoul.go.kr/festival/main/festivalView.do?festacode=393",scope:0},
{id:4,name:"2026 서울아트위크",start:"2026-08-31",end:"2026-09-06",dateText:"8.31 – 9.6 (예정)",month:9,region:"서울",district:"서울 전역",place:"미술관·갤러리·문화공간 일대",search:"코엑스",lat:37.5117,lng:127.0592,type:"전시·예술",pin:"art",icon:"🎨",format:"도시 분산형 · 미술전시",rating:4.1,status:"예정",fee:"공간별 상이",crowd:"보통",desc:"프리즈·키아프 시즌과 맞물려 서울 곳곳의 미술관·갤러리·문화공간을 연계해 즐기는 아트 주간.",tags:["미술","전시","갤러리","실내"],source:"https://festival.seoul.go.kr/festival/year/loadMap.do",scope:0},
{id:5,name:"한화 서울세계불꽃축제 2026",start:"2026-09-05",end:"2026-09-05",dateText:"9.5(토)",month:9,region:"서울",district:"영등포구",place:"여의도한강공원",search:"여의도한강공원",lat:37.5285,lng:126.9330,type:"불꽃",pin:"fire",icon:"🎆",format:"초대형 관람형 · 불꽃쇼",rating:5.0,status:"확정",fee:"일반 관람 무료 · 유료존 별도",crowd:"극심",desc:"한국·영국·미국 불꽃팀이 참여하는 서울 대표 초대형 야간 행사. 스케일과 희소성은 이 기간 최상위.",tags:["불꽃","한강","야간","대형행사"],source:"https://www.hanwhafireworks.com/",scope:0},
{id:6,name:"서울 어텀 페스타",start:"2026-09-19",end:"2026-11-09",dateText:"9.19 – 11.9",month:9,region:"서울",district:"서울 전역",place:"서울 주요 문화공간·도심",search:"서울광장",lat:37.5664,lng:126.9780,type:"도심종합",pin:"city",icon:"🎭",format:"도시 분산형 · 공연+문화",rating:4.2,status:"확정",fee:"프로그램별 상이",crowd:"보통",desc:"서울의 가을 문화행사를 한 시즌으로 묶어 즐기는 종합형 페스타. 특정 하루보다 여러 프로그램 골라보기 좋은 타입.",tags:["공연","문화","도심","가을"],source:"https://festival.seoul.go.kr/festival/year/loadMap.do",scope:0},
{id:7,name:"한성백제문화제",start:"2026-09-26",end:"2026-09-28",dateText:"9.26 – 9.28",month:9,region:"서울",district:"송파구",place:"올림픽공원 일대",search:"올림픽공원 평화의광장",lat:37.5209,lng:127.1215,type:"역사·전통",pin:"history",icon:"🏺",format:"역사 테마파크형 · 체험+공연",rating:4.2,status:"확정",fee:"대부분 무료",crowd:"혼잡",desc:"백제 역사 콘텐츠를 퍼레이드·공연·체험으로 풀어낸 송파 대표 축제. 가족·데이트 모두 무난합니다.",tags:["백제","체험","공연","가족"],source:"https://festival.seoul.go.kr/festival/year/loadMap.do",scope:0},
{id:8,name:"강남페스티벌",start:"2026-10-02",end:"2026-10-05",dateText:"10.2 – 10.5 (예정)",month:10,region:"서울",district:"강남구",place:"영동대로·코엑스 일대",search:"코엑스",lat:37.5117,lng:127.0592,type:"도심종합",pin:"city",icon:"🎤",format:"도심 공연형 · K-컬처",rating:4.4,status:"예정",fee:"프로그램별 상이",crowd:"매우 혼잡",desc:"강남 도심을 무대로 K-POP·공연·패션·푸드 등을 묶는 대형 도시 축제형 행사.",tags:["KPOP","공연","도심","먹거리"],source:"https://festival.seoul.go.kr/festival/year/loadMap.do",scope:0},
{id:9,name:"2026 진주남강유등축제",start:"2026-10-03",end:"2026-10-18",dateText:"10.3(토) – 10.18(일)",month:10,region:"경남",district:"진주시",place:"진주성·진주 남강 일원",search:"진주성",lat:35.1897,lng:128.0804,type:"빛·야간",pin:"light",icon:"🏮",format:"야간 경관 테마파크형 · 유등",rating:4.9,status:"확정",fee:"일부 체험 유료",crowd:"매우 혼잡",desc:"남강 전체를 수많은 유등과 빛으로 채우는 대형 야간 축제. 수도권에서 멀지만 1박할 가치가 큰 편.",tags:["유등","야경","사진","1박추천"],source:"https://yudeung.com/",scope:2},
{id:10,name:"정조대왕 능행차",start:"2026-10-04",end:"2026-10-04",dateText:"10.4(일) (예정)",month:10,region:"서울",district:"도심·남부권",place:"서울 도심~수원 방면 일부 구간",search:"서울광장",lat:37.5664,lng:126.9780,type:"역사·전통",pin:"history",icon:"👑",format:"대형 퍼레이드 관람형 · 역사재현",rating:4.3,status:"예정",fee:"무료 관람 중심",crowd:"혼잡",desc:"정조의 능행차를 대규모 행렬로 재현하는 역사 퍼레이드. 움직이는 축제라 관람 지점 선택이 중요합니다.",tags:["퍼레이드","역사","사진","전통"],source:"https://festival.seoul.go.kr/festival/year/loadMap.do",scope:0},
{id:11,name:"강동선사문화축제",start:"2026-10-16",end:"2026-10-18",dateText:"10.16 – 10.18 (예정)",month:10,region:"서울",district:"강동구",place:"서울 암사동 유적 일대",search:"서울 암사동 유적",lat:37.5609,lng:127.1304,type:"역사·전통",pin:"history",icon:"🪨",format:"역사 체험 테마파크형 · 선사시대",rating:4.2,status:"예정",fee:"대부분 무료",crowd:"혼잡",desc:"암사동 선사유적을 배경으로 체험·퍼레이드·공연을 즐기는 지역 대표 역사축제. 동부권 접근성이 좋습니다.",tags:["선사시대","체험","가족","공연"],source:"https://festival.seoul.go.kr/festival/year/loadMap.do",scope:0},
{id:12,name:"제25회 서울억새축제",start:"2026-10-17",end:"2026-10-23",dateText:"10.17 – 10.23",month:10,region:"서울",district:"마포구",place:"월드컵공원 하늘공원",search:"하늘공원",lat:37.5685,lng:126.8857,type:"자연·경관",pin:"nature",icon:"🌾",format:"자연 경관형 · 산책+라이팅",rating:4.7,status:"확정",fee:"무료",crowd:"매우 혼잡",desc:"억새·노을·야간 라이팅을 함께 즐기는 서울 가을 데이트 강자. 포토존·체험·버스킹도 운영됩니다.",tags:["억새","노을","야경","데이트","사진"],source:"https://festival.seoul.go.kr/festival/main/festivalView.do?festacode=683",scope:0},
{id:13,name:"정동야행",start:"2026-10-29",end:"2026-10-31",dateText:"10.29 – 10.31",month:10,region:"서울",district:"중구",place:"정동·덕수궁 돌담길 일대",search:"정동길",lat:37.5658,lng:126.9722,type:"빛·야간",pin:"light",icon:"🌙",format:"야간 문화유산 탐방형 · 산책",rating:4.6,status:"확정",fee:"대부분 무료",crowd:"혼잡",desc:"정동의 근대문화유산과 야간 개방, 공연·전시를 묶은 감성 산책형 축제. 짧은 데이트 코스로 특히 좋습니다.",tags:["야행","문화유산","산책","데이트"],source:"https://festival.seoul.go.kr/festival/year/loadMap.do",scope:0},
{id:14,name:"제21회 부산불꽃축제",start:"2026-11-07",end:"2026-11-07",dateText:"11.7(토)",month:11,region:"부산",district:"수영구",place:"광안리해수욕장·이기대·동백섬",search:"광안리해수욕장",lat:35.1532,lng:129.1187,type:"불꽃",pin:"fire",icon:"🎇",format:"초대형 관람형 · 해상 불꽃쇼",rating:5.0,status:"확정",fee:"무료 관람 · 유료 지정석 별도",crowd:"극심",desc:"광안대교와 바다 전체를 무대로 쓰는 초대형 불꽃쇼. 서울 불꽃과 또 다른 스케일이라 1박 원정 가치가 높습니다.",tags:["불꽃","광안대교","야경","1박추천"],source:"https://www.busanfireworks.com/",scope:2},
{id:15,name:"2026 서울윈터페스타",start:"2026-12-04",end:"2027-01-31",dateText:"12.4 – 2027.1.31",month:12,region:"서울",district:"도심",place:"광화문광장 외 6곳",search:"광화문광장",lat:37.5724,lng:126.9769,type:"도심종합",pin:"city",icon:"❄️",format:"도심 분산형 · 겨울 종합 테마",rating:4.7,status:"확정",fee:"행사별 상이",crowd:"매우 혼잡",desc:"광화문·청계천·DDP 등 서울 랜드마크를 묶는 겨울 시즌 페스타. 하루에 여러 행사를 이어보기 좋습니다.",tags:["겨울","미디어아트","도심","야경"],source:"https://festival.seoul.go.kr/festival/main/festivalView.do?festacode=309",scope:0},
{id:16,name:"2026 서울라이트 광화문",start:"2026-12-11",end:"2027-01-03",dateText:"12.11 – 2027.1.3 · 17:30–22:00",month:12,region:"서울",district:"종로구",place:"광화문광장",search:"광화문광장",lat:37.5724,lng:126.9769,type:"빛·야간",pin:"light",icon:"✨",format:"미디어아트 전시장형 · 빛+음악",rating:4.7,status:"확정",fee:"무료 관람 중심",crowd:"매우 혼잡",desc:"광화문을 대형 스크린처럼 사용하는 미디어파사드 전시. 겨울 밤 산책과 사진 목적에 잘 맞습니다.",tags:["미디어아트","빛","야경","데이트"],source:"https://festival.seoul.go.kr/festival/main/festivalView.do?festacode=372",scope:0},
{id:17,name:"2026 서울빛초롱축제",start:"2026-12-01",end:"2026-12-31",dateText:"12월 · 세부일정 미공개",month:12,region:"서울",district:"중구",place:"청계천 일대",search:"청계광장",lat:37.5690,lng:126.9785,type:"빛·야간",pin:"light",icon:"💡",format:"야간 산책 전시장형 · 빛 조형물",rating:4.6,status:"예정",fee:"무료 관람 중심",crowd:"매우 혼잡",desc:"청계천을 따라 빛 조형물·미디어 콘텐츠를 보며 걷는 대표 겨울 야간축제. 광화문과 묶기 좋습니다.",tags:["빛","청계천","산책","사진"],source:"https://festival.seoul.go.kr/festival/main/festivalView.do?festacode=360",scope:0},
{id:18,name:"2026 광화문 마켓",start:"2026-12-01",end:"2026-12-31",dateText:"12월 · 세부일정 미공개",month:12,region:"서울",district:"종로구",place:"광화문광장",search:"광화문광장",lat:37.5724,lng:126.9769,type:"크리스마스",pin:"xmas",icon:"🎄",format:"유럽형 크리스마스 마켓 · 쇼핑+먹거리",rating:4.6,status:"예정",fee:"무료 입장 · 구매 별도",crowd:"매우 혼잡",desc:"유럽 크리스마스 마켓을 모티브로 한 겨울 마켓. 소상공인 부스·먹거리·수공예품·포토존·체험존 중심.",tags:["크리스마스","마켓","먹거리","데이트"],source:"https://festival.seoul.go.kr/festival/main/festivalView.do?festacode=361",scope:0}
];

// ---- Extra festival metadata for V5 ----
const extras = {
1:{parking:"행사장 인근 혼잡 예상. 대중교통 권장 · 차량 이용 시 송도달빛축제공원 인근 공영주차장 검색",parkingLevel:4,warn:"귀가 시간대 교통 혼잡이 매우 큽니다. 유료존·출입정책은 당일 공식 공지 확인.",scores:{date:4.8,food:4.8,photo:4.4,family:4.1,value:4.5}},
2:{parking:"장안동 수변공원 주변 주차공간이 제한적입니다. 장안동 공영주차장 검색 권장.",parkingLevel:4,warn:"저녁 시간 수변공원 주변 혼잡 예상. 음주 예정이면 대중교통 권장.",scores:{date:4.5,food:4.4,photo:3.8,family:3.9,value:4.7}},
3:{parking:"종로·뚝섬 모두 대중교통이 편합니다. 장소별 인근 공영주차장 검색 권장.",parkingLevel:3,warn:"행사장이 분산되어 있으므로 방문 장소를 먼저 정하는 것이 좋습니다.",scores:{date:4.1,food:3.2,photo:4.6,family:4.1,value:4.8}},
4:{parking:"공간별 상이. 코엑스 방문 시 코엑스 주차장 사용 가능하나 비용이 높습니다.",parkingLevel:3,warn:"행사장이 서울 전역에 분산됩니다. 원하는 전시·갤러리 운영시간을 개별 확인.",scores:{date:4.2,food:3.6,photo:4.7,family:3.6,value:4.0}},
5:{parking:"여의도 일대 교통통제 가능성이 높아 차량 접근 비추천. 대중교통 이용 강력 권장.",parkingLevel:5,warn:"초대형 인파·교통통제. 귀가 동선과 화장실 위치를 미리 잡는 것이 좋습니다.",scores:{date:5.0,food:3.5,photo:5.0,family:4.1,value:5.0}},
6:{parking:"프로그램 장소별 상이. 도심 행사장은 가급적 대중교통 권장.",parkingLevel:3,warn:"기간이 긴 종합행사라 날짜별 프로그램 차이가 큽니다.",scores:{date:4.1,food:3.7,photo:4.3,family:4.2,value:4.4}},
7:{parking:"올림픽공원 주차장 이용 가능하나 축제 시간대 만차 가능성 높음.",parkingLevel:4,warn:"공연 종료 직후 주차장 출차 지연 가능.",scores:{date:4.2,food:4.0,photo:4.2,family:4.8,value:4.6}},
8:{parking:"코엑스·탄천주차장 등 이용 가능. 행사 당일 영동대로 주변 통제 가능성 확인.",parkingLevel:4,warn:"대형 공연 시 교통 통제가 있을 수 있습니다.",scores:{date:4.4,food:4.4,photo:4.5,family:3.8,value:4.2}},
9:{parking:"진주성·남강 주변 임시주차장 및 셔틀 운영 여부를 공식 공지에서 확인 권장.",parkingLevel:5,warn:"주말 야간 방문객이 집중됩니다. 숙박과 주차를 미리 정해두는 편이 좋습니다.",scores:{date:4.9,food:4.3,photo:5.0,family:4.7,value:4.6}},
10:{parking:"행렬 구간이 이동하므로 관람 지점 인근 공영주차장 또는 대중교통 권장.",parkingLevel:4,warn:"고정 행사장이 아니라 이동형 퍼레이드입니다. 당일 동선·통제구간 확인 필수.",scores:{date:4.1,food:3.3,photo:4.6,family:4.5,value:4.8}},
11:{parking:"암사동 유적 주차장 규모가 제한적일 수 있어 대중교통 권장.",parkingLevel:4,warn:"체험 프로그램은 현장 접수·회차 제한이 있을 수 있습니다.",scores:{date:4.0,food:3.9,photo:4.0,family:4.9,value:4.8}},
12:{parking:"하늘공원 자체 차량 접근이 제한적. 월드컵공원·난지천공원 주변 주차 후 이동 권장.",parkingLevel:5,warn:"주말 일몰 시간대 매우 혼잡. 경사·계단 이동이 있어 편한 신발 추천.",scores:{date:5.0,food:3.2,photo:5.0,family:4.2,value:5.0}},
13:{parking:"정동·시청 주변 공영주차장 이용 가능하지만 요금·혼잡도가 높아 대중교통 권장.",parkingLevel:4,warn:"야간 개방 시설은 입장 마감 시간이 각각 다를 수 있습니다.",scores:{date:5.0,food:4.0,photo:4.8,family:4.1,value:4.8}},
14:{parking:"광안리 일대 차량 통제·주차난이 매우 심합니다. 지하철 이용 강력 권장.",parkingLevel:5,warn:"광안리 중심부는 초대형 인파가 몰립니다. 숙박·귀가편을 미리 확보하세요.",scores:{date:5.0,food:4.5,photo:5.0,family:4.0,value:4.7}},
15:{parking:"광화문·청계천·DDP 등 장소별 상이. 도심 대중교통 이용 권장.",parkingLevel:4,warn:"여러 행사장을 묶어 운영하므로 원하는 프로그램 날짜·장소 확인 필요.",scores:{date:4.8,food:4.4,photo:4.9,family:4.7,value:4.8}},
16:{parking:"광화문광장 인근 주차비가 높고 주말 혼잡. 지하철 이용 권장.",parkingLevel:4,warn:"야간 체감온도가 낮을 수 있어 방한 준비 권장.",scores:{date:4.9,food:3.7,photo:5.0,family:4.5,value:5.0}},
17:{parking:"청계천 주변 공영·민영주차장 다수 있으나 연말 매우 혼잡.",parkingLevel:4,warn:"주말 저녁과 크리스마스 전후 방문객이 집중됩니다.",scores:{date:4.9,food:4.0,photo:5.0,family:4.6,value:5.0}},
18:{parking:"광화문광장 인근 주차는 혼잡·비용 부담이 큼. 대중교통 권장.",parkingLevel:4,warn:"인기 판매 부스는 대기줄이 길 수 있고 일부 상품 조기 품절 가능.",scores:{date:4.9,food:4.8,photo:4.8,family:4.6,value:4.5}}
};

const palettes={
 beer:["#ff9f0a","#ff6b00"],fire:["#ff453a","#ff2d55"],art:["#bf5af2","#5e5ce6"],history:["#a66c42","#7d4f2f"],
 nature:["#30d158","#169b45"],light:["#0a84ff","#5e5ce6"],city:["#ff375f","#bf5af2"],xmas:["#ff2d55","#c51b45"]
};

const typeIcons={
  "불꽃":`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v5M12 16v5M3 12h5M16 12h5M5.6 5.6l3.5 3.5M14.9 14.9l3.5 3.5M18.4 5.6l-3.5 3.5M9.1 14.9l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  "맥주":`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 6h8v12H7zM15 9h2a3 3 0 0 1 0 6h-2M8.5 3.8c.4.6.4 1.2 0 1.8M11 3.8c.4.6.4 1.2 0 1.8M13.5 3.8c.4.6.4 1.2 0 1.8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  "전시·예술":`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19h14M7 19V9l5-4 5 4v10M9.5 12h5M9.5 15h5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  "역사·전통":`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16M6 9l6-5 6 5M6 20V9M18 20V9M10 20v-6h4v6M4 20h16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  "자연·경관":`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V8M12 13c-4 0-6-2-6-5 4 0 6 2 6 5ZM12 10c0-4 2-6 5-6 0 4-2 6-5 6Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  "빛·야간":`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.8 4.2A8 8 0 1 0 19.8 16 7 7 0 0 1 15.8 4.2Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  "도심종합":`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20V8h5v12M10 20V4h5v16M15 20v-9h4v9M3 20h18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  "크리스마스":`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 4 5h-2l4 5h-3l3 4H6l3-4H6l4-5H8l4-5ZM12 17v4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
};
function iconFor(f, cls=""){
  return `<span class="line-icon ${cls}">${typeIcons[f.type]||typeIcons["도심종합"]}</span>`;
}


// Apps Script iframe / private browser / file preview에서도 앱이 멈추지 않도록 안전 저장소 사용
const SafeStore={
  get(key,fallback=null){
    try{
      const v=window.localStorage.getItem(key);
      return v===null?fallback:v;
    }catch(e){
      return fallback;
    }
  },
  set(key,value){
    try{
      window.localStorage.setItem(key,value);
      return true;
    }catch(e){
      return false;
    }
  },
  removePrefix(prefix){
    try{
      Object.keys(window.localStorage)
        .filter(k=>k.startsWith(prefix))
        .forEach(k=>window.localStorage.removeItem(k));
    }catch(e){}
  }
};
function safeJson(raw,fallback){
  try{return JSON.parse(raw)}catch(e){return fallback}
}

const state={
 view:"all", chip:"전체", query:"", sort:"date", showSelectedOnly:false,
 favorites:new Set(safeJson(SafeStore.get("festivalFavs","[]"),[])),
 selectedFestivals:new Set(safeJson(SafeStore.get("festivalSelected","[]"),[])),
 expandedCards:new Set(),
 companion:SafeStore.get("festivalCompanion","연인")||"연인",
 interests:new Set(safeJson(SafeStore.get("festivalInterests",'["사진","먹거리"]'),["사진","먹거리"])),
 userLoc:null, mapZoom:1
};
const filters={
 all:["전체","이번 주말","진행중","4.7+","수도권","1박추천"],
 schedule:["전체","8월","9월","10월","11월","12월"],
 region:["전체","서울","인천","경남","부산"],
 type:["전체","불꽃","맥주","전시·예술","역사·전통","자연·경관","빛·야간","도심종합","크리스마스"],
 favorites:["전체"]
};

function qs(s){return document.querySelector(s)}
function qsa(s){return [...document.querySelectorAll(s)]}
function toast(msg){const t=qs("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1700)}
function today(){const d=new Date(); d.setHours(0,0,0,0); return d}
function parseDate(s){const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)}
function fmtDate(d){return `${d.getMonth()+1}/${d.getDate()}`}
function daysBetween(a,b){return Math.round((b-a)/86400000)}
function weekendRange(){
  const d=today(), day=d.getDay();
  let sat=new Date(d);
  const delta=day===6?0:day===0?-1:6-day;
  sat.setDate(d.getDate()+delta);
  const sun=new Date(sat);sun.setDate(sat.getDate()+1);
  return [sat,sun];
}
function overlaps(f,a,b){return parseDate(f.end)>=a && parseDate(f.start)<=b}
function eventStatus(f){
  const t=today(), s=parseDate(f.start), e=parseDate(f.end);
  if(t>e)return {txt:"종료",cls:"end"};
  if(t>=s&&t<=e)return {txt:"진행중",cls:"live"};
  const d=daysBetween(t,s);
  if(d<=7)return {txt:`D-${d}`,cls:"soon"};
  return {txt:`${f.month}월`,cls:""};
}
function hav(lat1,lon1,lat2,lon2){
  const R=6371,toRad=x=>x*Math.PI/180;
  const dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1);
  const a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function distanceText(f){
  if(!state.userLoc)return "";
  const km=hav(state.userLoc.lat,state.userLoc.lng,f.lat,f.lng);
  return km<1?`직선 ${Math.round(km*1000)}m`:km<100?`직선 ${km.toFixed(1)}km`:`직선 ${Math.round(km)}km`;
}
function tmapSearch(name){
  const app=`tmap://search?name=${encodeURIComponent(name)}`;
  const web=`https://www.tmap.co.kr/tmap2/mobile/search.do?searchKeyword=${encodeURIComponent(name)}`;
  location.href=app;
  setTimeout(()=>{ if(document.visibilityState==="visible") window.open(web,"_blank"); },800);
}
window.tmapSearch=tmapSearch;

function saveFav(){SafeStore.set("festivalFavs",JSON.stringify([...state.favorites]))}

function saveSelected(){
  SafeStore.set("festivalSelected",JSON.stringify([...state.selectedFestivals]));
}
function renderSelectionList(query=""){
  const q=(query||"").trim().toLowerCase();
  const arr=festivals.filter(f=>!q || [f.name,f.region,f.district,f.place,f.type].join(" ").toLowerCase().includes(q));
  qs("#selectionList").innerHTML=arr.map(f=>`
    <label class="pick-row">
      <input class="pick-check" type="checkbox" data-pick="${f.id}" ${state.selectedFestivals.has(f.id)?"checked":""}>
      <div class="pick-info">
        <div class="pick-title">${f.name}</div>
        <div class="pick-meta">${f.region} · ${f.type} · ${f.dateText}</div>
      </div>
      <div class="pick-score">${f.rating.toFixed(1)}</div>
    </label>
  `).join("");
}
function openSelection(){
  renderSelectionList(qs("#selectionSearch")?.value||"");
  qs("#selectionBackdrop").classList.add("show");
  qs("#selectionSheet").classList.add("show");
  document.body.style.overflow="hidden";
}
function closeSelection(){
  qs("#selectionBackdrop").classList.remove("show");
  qs("#selectionSheet").classList.remove("show");
  document.body.style.overflow="";
}
function syncPickedFromSheet(){
  qsa("[data-pick]").forEach(ch=>{
    const id=Number(ch.dataset.pick);
    if(ch.checked) state.selectedFestivals.add(id);
    else state.selectedFestivals.delete(id);
  });
  saveSelected();
}

function toggleFav(id){
  state.favorites.has(id)?state.favorites.delete(id):state.favorites.add(id);
  saveFav(); renderAll(); toast(state.favorites.has(id)?"찜에 저장했어요":"찜에서 삭제했어요");
}
window.toggleFav=toggleFav;

function preferenceScore(f){
  let score=f.rating*10;
  const s=extras[f.id].scores;
  if(state.companion==="연인")score+=s.date*4;
  if(state.companion==="가족")score+=s.family*4;
  if(state.companion==="친구")score+=(s.food+f.rating)*2;
  if(state.companion==="혼자")score+=(s.photo+s.value)*2;
  const map={
    "불꽃":"불꽃","맥주":"맥주","자연":"자연·경관","공연":"도심종합","사진":"photo","먹거리":"food","빛":"빛·야간","전시":"전시·예술"
  };
  for(const i of state.interests){
    const k=map[i];
    if(k==="photo")score+=s.photo*4;
    else if(k==="food")score+=s.food*4;
    else if(f.type===k || f.tags.some(t=>t.includes(i)))score+=16;
  }
  if(state.userLoc){
    const km=hav(state.userLoc.lat,state.userLoc.lng,f.lat,f.lng);
    score+=Math.max(0,25-km/4);
  }
  const st=eventStatus(f);if(st.txt==="종료")score-=80;if(st.txt==="진행중")score+=15;
  return score;
}
function topRecommended(){return [...festivals].sort((a,b)=>preferenceScore(b)-preferenceScore(a))[0]}

function renderHero(){
  const f=topRecommended(), e=extras[f.id], d=distanceText(f);
  qs("#recommendHero").innerHTML=`
    <div class="top"><span class="rec-badge">맞춤 추천</span><span class="rec-badge">${eventStatus(f).txt}</span></div>
    <h3>${iconFor(f,"small")} <span>${f.name}</span></h3>
    <p>${f.dateText}<br>${f.place}${d?` · 내 위치에서 ${d}`:""}</p>
    <div class="weather-summary loading" id="hero-weather" style="color:inherit;opacity:.72"><span class="weather-dot"></span><span>추천지 현지 날씨 확인 중</span></div>
    <div class="rec-badges">
      <span class="rec-badge">재미 ${f.rating.toFixed(1)}</span>
      <span class="rec-badge">데이트 ${e.scores.date.toFixed(1)}</span>
      <span class="rec-badge">사진 ${e.scores.photo.toFixed(1)}</span>
      <span class="rec-badge">먹거리 ${e.scores.food.toFixed(1)}</span>
    </div>
    <div class="rec-actions">
      <button class="main" onclick="tmapSearch('${f.search.replaceAll("'","\\'")}')">길찾기</button>
      <button onclick="toggleFav(${f.id})">${state.favorites.has(f.id)?"찜됨":"찜"}</button>
      <button onclick="addCalendar(${f.id})">일정 추가</button>
    </div>`;
  setTimeout(()=>{
    fetchFestivalWeather(f).then(data=>{
      const h=qs("#hero-weather");if(!h)return;
      const c=data.current||{};
      h.className="weather-summary "+(weatherIsRain(data)?"rain":"live");
      h.innerHTML=`<span class="weather-dot"></span><span>현지 현재 ${c.temp!=null?Math.round(Number(c.temp))+"°":"-"} · ${c.condition||"실황"}</span>`;
    }).catch(()=>{});
  },0);
}

function renderWeekend(){
  const [sat,sun]=weekendRange();qs("#weekendLabel").textContent=`${fmtDate(sat)}–${fmtDate(sun)}`;
  const arr=festivals.filter(f=>overlaps(f,sat,sun));
  qs("#sumWeekend").textContent=arr.length;
  qs("#weekendGrid").innerHTML=arr.length?arr.map(f=>`
    <div class="mini-event" onclick="focusFestival(${f.id})">
      <div class="row"><div><h4>${iconFor(f,"small")} <span>${f.name}</span></h4><p>${f.place}${distanceText(f)?` · ${distanceText(f)}`:""}</p></div>
      <span class="status ${eventStatus(f).cls}">${eventStatus(f).txt}</span></div>
    </div>`).join(""):`<div class="mini-event"><div class="row"><div><h4>이번 주말 시작하는 축제는 없어요</h4><p>대신 가까운 날짜의 축제를 아래에서 확인해보세요.</p></div></div></div>`;
}

function renderPreferences(){
  const companions=["연인","가족","친구","혼자"];
  qs("#companionChoices").innerHTML=companions.map(x=>{
    const val=x;
    return `<button class="choice ${state.companion===val?"on":""}" onclick="setCompanion('${val}')">${x}</button>`;
  }).join("");
  const ints=["불꽃","맥주","자연","공연","사진","먹거리","빛","전시"];
  qs("#interestChoices").innerHTML=ints.map(x=>{
    const val=x;
    return `<button class="choice ${state.interests.has(val)?"on":""}" onclick="toggleInterest('${val}')">${x}</button>`;
  }).join("");
  const tops=[...festivals].sort((a,b)=>preferenceScore(b)-preferenceScore(a)).slice(0,3);
  qs("#prefResult").innerHTML=`<b>${state.companion} 기준 추천 TOP 3</b><br>${tops.map((f,i)=>`${i+1}. ${f.name}`).join(" · ")}`;
}
window.setCompanion=v=>{state.companion=v;SafeStore.set("festivalCompanion",v);renderAll();};
window.toggleInterest=v=>{state.interests.has(v)?state.interests.delete(v):state.interests.add(v);SafeStore.set("festivalInterests",JSON.stringify([...state.interests]));renderAll();};

function renderMonths(){
  qs("#monthSwipe").innerHTML=[8,9,10,11,12].map(m=>{
    const arr=festivals.filter(f=>f.month===m).sort((a,b)=>a.start.localeCompare(b.start));
    return `<div class="month-card"><div class="month">${m}월</div><small>${arr.length}개 축제</small>
      <div class="month-list">${arr.map(f=>`<div class="month-item" onclick="focusFestival(${f.id})"><b>${iconFor(f,"small")} <span>${f.name}</span></b><span>${f.dateText}</span></div>`).join("")}</div>
    </div>`;
  }).join("");
}

function renderChips(){
  const list=filters[state.view]||["전체"];
  qs("#chips").innerHTML=list.map(c=>`<button class="chip ${state.chip===c?"on":""}" onclick="setChip('${c}')">${c}</button>`).join("");
}
window.setChip=c=>{state.chip=c;renderListAndMap();};

function filtered(){
  let arr=[...festivals], c=state.chip, t=today(), [sat,sun]=weekendRange();
  if(state.showSelectedOnly){
    arr=arr.filter(f=>state.selectedFestivals.has(f.id));
  }
  if(state.view==="favorites")arr=arr.filter(f=>state.favorites.has(f.id));
  if(state.view==="schedule"&&c!=="전체")arr=arr.filter(f=>f.month===Number(c.replace("월","")));
  if(state.view==="region"&&c!=="전체")arr=arr.filter(f=>f.region===c);
  if(state.view==="type"&&c!=="전체")arr=arr.filter(f=>f.type===c);
  if(state.view==="all"){
    if(c==="이번 주말")arr=arr.filter(f=>overlaps(f,sat,sun));
    if(c==="진행중")arr=arr.filter(f=>parseDate(f.start)<=t&&parseDate(f.end)>=t);
    if(c==="4.7+")arr=arr.filter(f=>f.rating>=4.7);
    if(c==="수도권")arr=arr.filter(f=>f.scope<=1);
    if(c==="1박추천")arr=arr.filter(f=>f.scope===2||f.tags.includes("1박추천"));
  }
  const q=state.query.trim().toLowerCase();
  if(q)arr=arr.filter(f=>[f.name,f.region,f.district,f.place,f.type,f.format,...f.tags].join(" ").toLowerCase().includes(q));
  if(state.sort==="rating")arr.sort((a,b)=>b.rating-a.rating);
  else if(state.sort==="near"&&state.userLoc)arr.sort((a,b)=>hav(state.userLoc.lat,state.userLoc.lng,a.lat,a.lng)-hav(state.userLoc.lat,state.userLoc.lng,b.lat,b.lng));
  else if(state.sort==="recommend")arr.sort((a,b)=>preferenceScore(b)-preferenceScore(a));
  else arr.sort((a,b)=>a.start.localeCompare(b.start));
  return arr;
}



// ===== FESTIVAL POCKET FINAL · KMA 3-WAY WEATHER =====
// 기존 Google Apps Script 웹앱 URL.
// 아래 Final Code.gs를 같은 프로젝트에 새 버전으로 배포하면 URL 변경 없이 동작합니다.
const KMA_WEATHER_PROXY_URL='https://script.google.com/macros/s/AKfycbxjq6tyDI5iHyXHChKhd4wvsNf42QvBqFI6DNl6oYc1CAEbVFaD5NOSvO2cZoXX856oiw/exec';
const WEATHER_BROWSER_CACHE_MS=10*60*1000;

const weatherMemory=new Map();
let weatherObserver=null;
let weatherJsonpSeq=0;

function weatherCacheKey(f){
  return `${f.lat.toFixed(3)},${f.lng.toFixed(3)}`;
}
function getWeatherCache(f){
  const key=weatherCacheKey(f);
  const mem=weatherMemory.get(key);
  if(mem && Date.now()-mem.savedAt<WEATHER_BROWSER_CACHE_MS)return mem.data;
  try{
    const raw=SafeStore.get('festivalWeatherFinal:'+key,null);
    if(!raw)return null;
    const v=JSON.parse(raw);
    if(Date.now()-v.savedAt<WEATHER_BROWSER_CACHE_MS){
      weatherMemory.set(key,v);
      return v.data;
    }
  }catch(e){}
  return null;
}
function putWeatherCache(f,data){
  const key=weatherCacheKey(f),v={savedAt:Date.now(),data};
  weatherMemory.set(key,v);
  SafeStore.set('festivalWeatherFinal:'+key,JSON.stringify(v));
}
function clearWeatherCache(){
  weatherMemory.clear();
  SafeStore.removePrefix('festivalWeatherFinal:');
}

function jsonpKmaWeather(f){
  return new Promise((resolve,reject)=>{
    const cb='festivalKmaFinal_'+Date.now()+'_'+(++weatherJsonpSeq);
    const sc=document.createElement('script');
    let done=false;
    const cleanup=()=>{
      if(done)return;
      done=true;
      clearTimeout(timer);
      try{delete window[cb]}catch(e){window[cb]=undefined}
      sc.remove();
    };
    window[cb]=payload=>{
      cleanup();
      if(payload && payload.ok && payload.current)resolve(payload);
      else reject(new Error(payload&&payload.message?payload.message:'KMA 응답 오류'));
    };
    sc.onerror=()=>{cleanup();reject(new Error('KMA 중계 연결 실패'))};
    const timer=setTimeout(()=>{cleanup();reject(new Error('KMA 응답 시간 초과'))},12000);
    sc.src=KMA_WEATHER_PROXY_URL+
      (KMA_WEATHER_PROXY_URL.includes('?')?'&':'?')+
      'action=weather&lat='+encodeURIComponent(f.lat)+
      '&lon='+encodeURIComponent(f.lng)+
      '&callback='+encodeURIComponent(cb)+
      '&_='+(Date.now());
    document.head.appendChild(sc);
  });
}

function fmtHour(t){
  if(!t)return '';
  const m=String(t).match(/(\d{2}):?(\d{2})/);
  if(!m)return t;
  return `${Number(m[1])}시`;
}
function weatherClass(condition){
  if(/비|눈|뇌우|강수/.test(condition||''))return 'rain';
  return 'ok';
}
function eventWeatherAdvice(ev){
  if(!ev)return '';
  const max=Number(ev.maxTemp ?? ev.max);
  const min=Number(ev.minTemp ?? ev.min);
  const pop=Number(ev.maxPop ?? ev.pop);
  const cond=String(ev.condition||ev.sky||'');
  if(Number.isFinite(pop) && pop>=60)return 'rain|우천 가능성이 높습니다. 우산과 실내 대체 동선을 준비하세요.';
  if(/비|눈/.test(cond))return 'rain|강수 가능성이 있습니다. 행사 운영 공지를 당일 다시 확인하세요.';
  if(Number.isFinite(max) && max>=32)return 'hot|한낮 더위가 강할 수 있습니다. 물과 휴식 시간을 챙기세요.';
  if(Number.isFinite(min) && min<=5)return 'cold|아침·저녁 체감온도가 낮을 수 있습니다. 겉옷을 준비하세요.';
  return 'good|야외축제를 즐기기 무난한 예보입니다.';
}
function findEventForecast(f,data){
  if(Array.isArray(data.daily)){
    const d=data.daily.find(x=>x.date===f.start);
    if(d)return d;
  }
  if(Array.isArray(data.shortForecast)){
    const rows=data.shortForecast.filter(x=>x.date===f.start);
    if(rows.length){
      const temps=rows.map(x=>Number(x.temp)).filter(Number.isFinite);
      const pops=rows.map(x=>Number(x.pop)).filter(Number.isFinite);
      const conditions=rows.map(x=>x.sky).filter(Boolean);
      return {
        date:f.start,
        minTemp:temps.length?Math.min(...temps):null,
        maxTemp:temps.length?Math.max(...temps):null,
        maxPop:pops.length?Math.max(...pops):null,
        condition:conditions[0]||''
      };
    }
  }
  return null;
}

function weatherIsRain(data){
  const c=(data&&data.current&&data.current.condition)||"";
  const rain=Number(data&&data.current&&data.current.precipitation);
  return /비|눈|뇌우|강수/.test(c) || (Number.isFinite(rain)&&rain>0);
}

function renderWeatherSummary(f,data){
  const el=qs(`#weather-summary-${f.id}`);
  if(!el)return;
  const c=data.current||{};
  const temp=Number(c.temp);
  const ultra=Array.isArray(data.ultraForecast)?data.ultraForecast:[];
  const nextRain=ultra.find(x=>Number(x.pop)>=50 || /비|눈/.test(x.sky||''));
  const suffix=nextRain?` · ${fmtHour(nextRain.time)} 강수 ${nextRain.pop!=null?nextRain.pop+'%':nextRain.sky}`:'';
  el.className='weather-summary '+weatherClass(c.condition);
  el.innerHTML=`<span class="weather-dot"></span><span>현재 ${Number.isFinite(temp)?Math.round(temp)+'°':'-'} · ${c.condition||'실황'}${suffix}</span>`;
}
function renderHourlyUltra(data){
  const rows=Array.isArray(data.ultraForecast)?data.ultraForecast.slice(0,8):[];
  if(!rows.length)return `<div class="event-forecast">초단기예보 데이터가 없습니다.</div>`;
  return `<div class="hourly-strip">${rows.map(r=>`
    <div class="hour-cell">
      <div class="t">${fmtHour(r.time)}</div>
      <div class="temp">${r.temp!=null?Math.round(Number(r.temp))+'°':'-'}</div>
      <div class="sky">${r.sky||'예보'}</div>
      <div class="pop">${r.pop!=null?'비 '+Math.round(Number(r.pop))+'%':''}</div>
    </div>`).join('')}</div>`;
}
function renderEventDay(f,data){
  const ev=findEventForecast(f,data);
  if(ev){
    const min=ev.minTemp ?? ev.min;
    const max=ev.maxTemp ?? ev.max;
    const pop=ev.maxPop ?? ev.pop;
    const cond=ev.condition||ev.sky||'예보';
    const advice=eventWeatherAdvice(ev);
    const [cls,msg]=advice.split('|');
    return `
      <div class="event-day-box">
        <div class="label">축제 시작일 · ${f.start}</div>
        <div class="main">${cond}${min!=null&&max!=null?` · ${Math.round(Number(min))}–${Math.round(Number(max))}°`:''}</div>
        <div class="sub">${pop!=null?`최대 강수확률 ${Math.round(Number(pop))}%`:'강수확률 확인 중'}</div>
      </div>
      <div class="weather-warning ${cls}">${msg}</div>`;
  }
  const diff=daysBetween(today(),parseDate(f.start));
  return `<div class="event-day-box">
    <div class="label">축제 시작일 · ${f.start}</div>
    <div class="main">아직 단기예보 범위 밖</div>
    <div class="sub">${diff>0?`D-${diff} · 날짜가 가까워지면 기상청 예보가 자동 표시됩니다.`:'행사일 상세예보가 아직 없습니다.'}</div>
  </div>`;
}
function renderWeatherDetail(f,data){
  const el=qs(`#weather-detail-${f.id}`);
  if(!el)return;
  const c=data.current||{};
  const temp=Number(c.temp),hum=Number(c.humidity),wind=Number(c.windSpeed);
  const rain=c.precipitation;
  el.innerHTML=`
    <div class="live-weather-head">
      <div class="kma-badge ok">기상청 APIHub</div>
      <button onclick="event.stopPropagation();refreshFestivalWeather(${f.id})">새로고침</button>
    </div>
    <div class="weather-main">
      <div class="weather-temp">${Number.isFinite(temp)?Math.round(temp)+'°':'-'}</div>
      <div>
        <div class="weather-condition">${c.condition||'실황'}</div>
        <div class="weather-updated">${c.observedAt?String(c.observedAt).replace('T',' '):'최신 관측'}</div>
      </div>
    </div>
    <div class="weather-stats">
      <div class="weather-stat"><small>습도</small><b>${Number.isFinite(hum)?Math.round(hum)+'%':'-'}</b></div>
      <div class="weather-stat"><small>풍속</small><b>${Number.isFinite(wind)?wind.toFixed(1)+' m/s':'-'}</b></div>
      <div class="weather-stat"><small>강수</small><b>${rain!=null?rain+' mm':'-'}</b></div>
    </div>
    <div class="kma-status-line"><span class="kma-badge ok">앞으로 몇 시간</span><span>초단기예보</span></div>
    ${renderHourlyUltra(data)}
    ${renderEventDay(f,data)}
    <div class="weather-source">기상청 초단기실황 + 초단기예보 + 단기예보 · ${data.queriedAt||'최신 조회'} · 10분 캐시</div>`;
}
async function fetchFestivalWeather(f,force=false){
  if(!force){
    const cached=getWeatherCache(f);
    if(cached){
      renderWeatherSummary(f,cached);
      renderWeatherDetail(f,cached);
      return cached;
    }
  }
  const sum=qs(`#weather-summary-${f.id}`);
  if(sum){
    sum.className='weather-summary loading';
    sum.innerHTML='<span class="weather-dot"></span><span>기상청 날씨 갱신 중</span>';
  }
  const det=qs(`#weather-detail-${f.id}`);
  if(det)det.innerHTML='<div class="weather-loading-skeleton"></div>';
  try{
    const data=await jsonpKmaWeather(f);
    putWeatherCache(f,data);
    renderWeatherSummary(f,data);
    renderWeatherDetail(f,data);
    return data;
  }catch(err){
    if(sum){
      sum.className='weather-summary';
      sum.innerHTML='<span class="weather-dot"></span><span>기상청 날씨 조회 실패</span>';
    }
    if(det)det.innerHTML=`<div class="event-forecast">기상청 연결 실패 · ${String(err.message||err)}</div>`;
    throw err;
  }
}
window.refreshFestivalWeather=id=>{
  const f=festivals.find(x=>x.id===id);
  if(!f)return;
  fetchFestivalWeather(f,true)
    .then(()=>toast('기상청 최신 날씨로 갱신했습니다'))
    .catch(()=>toast('기상청 날씨 조회에 실패했습니다'));
};
function setupWeatherObserver(){
  if(weatherObserver)weatherObserver.disconnect();
  if(!('IntersectionObserver' in window)){
    filtered().slice(0,6).forEach(f=>fetchFestivalWeather(f).catch(()=>{}));
    return;
  }
  weatherObserver=new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(!en.isIntersecting)return;
      const id=Number(en.target.dataset.weatherId);
      const f=festivals.find(x=>x.id===id);
      if(f)fetchFestivalWeather(f).catch(()=>{});
      weatherObserver.unobserve(en.target);
    });
  },{rootMargin:'280px 0px'});
  qsa('[data-weather-id]').forEach(el=>weatherObserver.observe(el));
}
async function refreshVisibleWeather(){
  const btn=qs('#refreshWeatherBtn');
  if(btn){
    btn.classList.add('weather-loading');
    btn.textContent='기상청 갱신 중';
  }
  clearWeatherCache();
  const arr=filtered().slice(0,10);
  await Promise.allSettled(arr.map(f=>fetchFestivalWeather(f,true)));
  if(btn){
    btn.classList.remove('weather-loading');
    btn.textContent='날씨 새로고침';
  }
  toast('화면의 기상청 날씨를 갱신했습니다');
}
async function loadWeather(f){
  return fetchFestivalWeather(f).catch(()=>null);
}

function weatherText(f){
  const box=`<div class="weather" id="weather-${f.id}">날씨 · 행사일이 가까워지면 자동 확인</div>`;
  return box;
}



function card(f){
  const e=extras[f.id], pal=palettes[f.pin]||["#007aff","#5e5ce6"], d=distanceText(f), fav=state.favorites.has(f.id);
  const ps="●".repeat(e.parkingLevel)+"○".repeat(5-e.parkingLevel);
  const open=state.expandedCards.has(f.id);
  return `<article class="card compact ${open?"open":""}" id="festival-${f.id}">
    <div class="card-summary" onclick="toggleCard(${f.id})">
      <div class="card-summary-main">
        <div class="card-summary-title">
          ${iconFor(f,"small")}
          <span>${f.name}</span>
        </div>
        <div class="card-summary-meta">${f.dateText} · ${f.region} · 재미 ${f.rating.toFixed(1)}${d?` · ${d}`:""}</div>
        <div class="weather-summary loading" id="weather-summary-${f.id}" data-weather-id="${f.id}">
          <span class="weather-dot"></span><span>현지 날씨 불러오는 중</span>
        </div>
      </div>
      <button class="card-toggle" aria-label="상세보기" onclick="event.stopPropagation();toggleCard(${f.id})">⌄</button>
    </div>

    <div class="quick-actions">
      <button class="primary" onclick="event.stopPropagation();tmapSearch('${f.search.replaceAll("'","\\'")}')">T맵</button>
      <button onclick="event.stopPropagation();toggleFav(${f.id})">${fav?"찜됨":"찜"}</button>
      <button onclick="event.stopPropagation();addCalendar(${f.id})">일정</button>
    </div>

    <div class="card-body">
      <div class="card-body-inner">
        <div class="cover">
          <button class="heart ${fav?"on":""}" onclick="event.stopPropagation();toggleFav(${f.id})">${fav?"♥":"♡"}</button>
          <div class="emoji">${iconFor(f)}</div>
          <div><h3>${f.name}</h3></div>
        </div>
        <div class="meta">
          <span class="badge blue">${f.type}</span>
          <span class="badge ${f.status==="확정"?"green":"orange"}">${f.status}</span>
          <span class="badge">${eventStatus(f).txt}</span>
          ${d?`<span class="badge">${d}</span>`:""}
        </div>
        <div class="info-line">${f.dateText}<br>${f.place}<br>${f.format}</div>
        <div class="score-box">
          <div class="score-main"><b>재미도 ${f.rating.toFixed(1)}</b><span>★★★★★</span></div>
          <div class="metrics">
            <div class="metric"><small>데이트</small><b>${e.scores.date.toFixed(1)}</b></div>
            <div class="metric"><small>사진</small><b>${e.scores.photo.toFixed(1)}</b></div>
            <div class="metric"><small>먹거리</small><b>${e.scores.food.toFixed(1)}</b></div>
            <div class="metric"><small>가족</small><b>${e.scores.family.toFixed(1)}</b></div>
            <div class="metric"><small>가성비</small><b>${e.scores.value.toFixed(1)}</b></div>
            <div class="metric"><small>주차 난이도</small><b>${e.parkingLevel}/5</b></div>
          </div>
        </div>
        <div class="live-weather" id="live-weather-${f.id}">
          <div id="weather-detail-${f.id}" class="weather-updated">카드를 열면 최신 기상청 날씨를 불러옵니다.</div>
        </div>
        <div class="parking"><b>주차</b><br>${e.parking}<br><span style="color:#a78434">혼잡도 ${ps}</span></div>
        <div class="warnbox"><b>가기 전 확인</b><br>${e.warn}</div>
        <div class="card-actions">
          <button class="tmap" onclick="tmapSearch('${f.search.replaceAll("'","\\'")}')">T맵 길찾기</button>
          <button onclick="addCalendar(${f.id})">일정 저장</button>
          <a href="${f.source}" target="_blank" rel="noopener">공식정보 ↗</a>
        </div>
        <div class="more-actions">
          <button onclick="tmapSearch('${("주차장 "+f.search).replaceAll("'","\\'")}')">주변 주차장</button>
          <button onclick="shareFestival(${f.id})">공유</button>
        </div>
      </div>
    </div>
  </article>`;
}


window.toggleCard=id=>{
  state.expandedCards.has(id)?state.expandedCards.delete(id):state.expandedCards.add(id);
  const el=qs(`#festival-${id}`);
  if(el){
    el.classList.toggle("open",state.expandedCards.has(id));
    if(state.expandedCards.has(id)) loadWeather(festivals.find(f=>f.id===id));
  }
};
function collapseAll(){
  state.expandedCards.clear();
  qsa(".card").forEach(c=>c.classList.remove("open"));
}
function expandVisible(){
  const arr=filtered();
  arr.forEach(f=>state.expandedCards.add(f.id));
  renderListAndMap();
}

function renderListAndMap(){
  renderChips();
  const arr=filtered();
  const titles={all:"전체 축제",schedule:"일정별 축제",region:"지역별 축제",type:"유형별 축제",favorites:"찜한 축제"};
  qs("#listTitle").textContent=titles[state.view];
  qs("#resultText").textContent=`${arr.length}개${state.showSelectedOnly?` · 선택 보기`:""}`;
  const selectedBtn=qs("#showSelectedBtn");
  if(selectedBtn){
    selectedBtn.classList.toggle("active",state.showSelectedOnly);
    selectedBtn.textContent=state.showSelectedOnly?`선택 보기 해제`:`선택한 축제만${state.selectedFestivals.size?` (${state.selectedFestivals.size})`:""}`;
  }
  qs("#grid").innerHTML=arr.map(card).join("");
  qs("#empty").style.display=arr.length?"none":"block";
  renderMap(arr);
  arr.filter(f=>state.expandedCards.has(f.id)).forEach(loadWeather);
  setTimeout(setupWeatherObserver,0);
  qsa("#segments button").forEach(b=>b.classList.toggle("on",b.dataset.view===state.view));
  qsa(".bottom-nav button").forEach(b=>b.classList.toggle("on",b.dataset.bview===state.view));
}

const mapPos={
1:[68,245],2:[319,235],3:[201,145],4:[276,296],5:[150,230],6:[205,190],7:[337,268],8:[286,316],
9:[210,454],10:[216,201],11:[375,239],12:[103,182],13:[184,198],14:[245,478],15:[205,170],16:[225,157],17:[226,190],18:[242,171]
};
function spreadPoints(arr){
  const pts=arr.map(f=>({f,x:(mapPos[f.id]||[210,220])[0],y:(mapPos[f.id]||[210,220])[1]}));
  for(let iter=0;iter<22;iter++){
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
      const a=pts[i],b=pts[j],dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy),min=28+(state.mapZoom-1)*12;
      if(dist<min){
        const ux=dist?dx/dist:1,uy=dist?dy/dist:0,p=(min-dist)/2;
        a.x-=ux*p;a.y-=uy*p;b.x+=ux*p;b.y+=uy*p;
      }
    }
  } return pts;
}
function renderMap(arr){
  const g=qs("#mapPins");g.innerHTML="";
  const ns="http://www.w3.org/2000/svg";
  spreadPoints(arr).forEach(({f,x,y})=>{
    const node=document.createElementNS(ns,"g");node.setAttribute("class",`map-pin ${f.pin}`);node.setAttribute("transform",`translate(${x} ${y})`);
    const c=document.createElementNS(ns,"circle");c.setAttribute("r","15");
    const fo=document.createElementNS(ns,"foreignObject");
    fo.setAttribute("x","-8");fo.setAttribute("y","-8");fo.setAttribute("width","16");fo.setAttribute("height","16");
    const wrap=document.createElement("div");wrap.setAttribute("xmlns","http://www.w3.org/1999/xhtml");
    wrap.innerHTML=iconFor(f,"pin");fo.appendChild(wrap);
    node.append(c,fo);
    node.addEventListener("click",()=>showMapInfo(f));g.appendChild(node);
  });
}
function showMapInfo(f){
  const e=extras[f.id],info=qs("#mapInfo");info.classList.add("show");
  info.innerHTML=`<h4>${iconFor(f,"small")} <span>${f.name}</span></h4><p>${f.dateText}<br>${f.place}<br>재미 ${f.rating.toFixed(1)} · 데이트 ${e.scores.date.toFixed(1)}</p>
  <div class="map-info-actions"><button class="go" onclick="tmapSearch('${f.search.replaceAll("'","\\'")}')">T맵</button><button onclick="focusFestival(${f.id})">축제 보기 ↓</button></div>`;
}
function setMapZoom(z){
  state.mapZoom=Math.min(2.4,Math.max(.75,z));
  const svg=qs("#festivalMap"),w=430/state.mapZoom,h=560/state.mapZoom,cx=215,cy=280;
  svg.setAttribute("viewBox",`${cx-w/2} ${cy-h/2} ${w} ${h}`);
  renderMap(filtered());
}
qs("#zoomIn").onclick=()=>setMapZoom(state.mapZoom*1.25);
qs("#zoomOut").onclick=()=>setMapZoom(state.mapZoom/1.25);
qs("#zoomReset").onclick=()=>setMapZoom(1);
qs("#festivalMap").addEventListener("dblclick",()=>setMapZoom(state.mapZoom*1.25));
let pinchStart=null;
qs("#festivalMap").addEventListener("touchstart",e=>{if(e.touches.length===2)pinchStart=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY)},{passive:true});
qs("#festivalMap").addEventListener("touchend",e=>{pinchStart=null},{passive:true});
qs("#festivalMap").addEventListener("touchmove",e=>{
  if(e.touches.length===2&&pinchStart){
    const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
    if(Math.abs(d-pinchStart)>25){setMapZoom(state.mapZoom*(d>pinchStart?1.12:.89));pinchStart=d}
  }
},{passive:true});

window.focusFestival=id=>{
  if(!qs(`#festival-${id}`)){state.view="all";state.chip="전체";renderListAndMap();}
  state.expandedCards.add(id);
  setTimeout(()=>{const el=qs(`#festival-${id}`);if(el){el.classList.add("open");loadWeather(festivals.find(f=>f.id===id));el.scrollIntoView({behavior:"smooth",block:"center"});el.classList.add("highlight");setTimeout(()=>el.classList.remove("highlight"),1200)}},40);
};

window.addCalendar=id=>{
  const f=festivals.find(x=>x.id===id);
  const ymd=s=>s.replaceAll("-","");
  const dtStart=ymd(f.start), end=parseDate(f.end);end.setDate(end.getDate()+1);
  const dtEnd=`${end.getFullYear()}${String(end.getMonth()+1).padStart(2,"0")}${String(end.getDate()).padStart(2,"0")}`;
  const ics=`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Festival Pocket//KO\r\nBEGIN:VEVENT\r\nUID:festival-${f.id}-2026@festivalpocket\r\nDTSTART;VALUE=DATE:${dtStart}\r\nDTEND;VALUE=DATE:${dtEnd}\r\nSUMMARY:${f.name}\r\nLOCATION:${f.place}\r\nDESCRIPTION:${f.format}\r\nEND:VEVENT\r\nEND:VCALENDAR`;
  const blob=new Blob([ics],{type:"text/calendar;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=`${f.name}.ics`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast("캘린더 파일을 만들었어요");
};
window.shareFestival=async id=>{
  const f=festivals.find(x=>x.id===id),text=`${f.name}\n${f.dateText}\n${f.place}`;
  if(navigator.share){try{await navigator.share({title:f.name,text});return}catch(e){}}
  await navigator.clipboard?.writeText(text);toast("축제 정보를 복사했어요");
};

function renderSummary(){
  qs("#sumAll").textContent=festivals.length;qs("#sumFav").textContent=state.favorites.size;
  if(state.userLoc){
    const arr=[...festivals].sort((a,b)=>hav(state.userLoc.lat,state.userLoc.lng,a.lat,a.lng)-hav(state.userLoc.lat,state.userLoc.lng,b.lat,b.lng));
    qs("#sumNear").textContent=distanceText(arr[0]);
  }else qs("#sumNear").textContent="-";
}
function renderAll(){renderSummary();renderHero();renderWeekend();renderPreferences();renderMonths();renderListAndMap();}

qsa("#segments button").forEach(b=>b.onclick=()=>{state.view=b.dataset.view;state.chip="전체";renderListAndMap();qs("#favorites").scrollIntoView({behavior:"smooth",block:"start"});});
qsa(".bottom-nav button").forEach(b=>b.onclick=()=>{state.view=b.dataset.bview;state.chip="전체";renderListAndMap();qs("#favorites").scrollIntoView({behavior:"smooth",block:"start"});});
qsa("[data-jump]").forEach(b=>b.onclick=()=>{const t=b.dataset.jump;if(t==="favorites"){state.view="favorites";state.chip="전체";renderListAndMap();}qs(`#${t}`).scrollIntoView({behavior:"smooth",block:"start"});});
qs("#search").addEventListener("input",e=>{state.query=e.target.value;renderListAndMap()});
qs("#sortBtn").onclick=()=>{
  const modes=["date","rating","recommend",...(state.userLoc?["near"]:[])],labels={date:"일정순",rating:"재미순",recommend:"추천순",near:"거리순"};
  state.sort=modes[(modes.indexOf(state.sort)+1)%modes.length];toast(`정렬: ${labels[state.sort]}`);renderListAndMap();
};
qs("#locBtn").onclick=()=>{
  if(!navigator.geolocation){toast("이 브라우저에서는 위치를 사용할 수 없어요");return;}
  qs("#locBtn").textContent="위치 확인 중...";
  navigator.geolocation.getCurrentPosition(p=>{
    state.userLoc={lat:p.coords.latitude,lng:p.coords.longitude};qs("#locBtn").textContent="내 위치 연결됨";state.sort="near";renderAll();toast("가까운 축제 순으로 볼 수 있어요");
  },()=>{qs("#locBtn").textContent="내 위치 사용";toast("위치 권한을 허용해 주세요")},{enableHighAccuracy:false,timeout:8000});
};


qs("#refreshWeatherBtn").onclick=refreshVisibleWeather;
qs("#festivalPickerBtn").onclick=openSelection;
qs("#topFestivalPickerBtn").onclick=openSelection;
qs("#closeSelectionBtn").onclick=closeSelection;
qs("#selectionBackdrop").onclick=closeSelection;
qs("#selectionSearch").addEventListener("input",e=>renderSelectionList(e.target.value));
qs("#selectAllBtn").onclick=()=>{
  qsa("[data-pick]").forEach(x=>x.checked=true);
};
qs("#clearSelectionBtn").onclick=()=>{
  qsa("[data-pick]").forEach(x=>x.checked=false);
};
qs("#applySelectionBtn").onclick=()=>{
  syncPickedFromSheet();
  state.showSelectedOnly=state.selectedFestivals.size>0;
  closeSelection();
  renderListAndMap();
  toast(state.selectedFestivals.size?`${state.selectedFestivals.size}개 축제만 표시합니다`:"선택된 축제가 없습니다");
};
qs("#collapseAllBtn").onclick=()=>{collapseAll();toast("모든 축제를 접었습니다")};
qs("#expandAllBtn").onclick=()=>{expandVisible();toast("현재 축제를 펼쳤습니다")};
qs("#showSelectedBtn").onclick=()=>{
  if(!state.selectedFestivals.size){openSelection();return;}
  state.showSelectedOnly=!state.showSelectedOnly;
  renderListAndMap();
};

try{
  renderAll();
  document.body.classList.add("js-ready");
  const mapFallback=document.getElementById("mapFallbackList");
  if(mapFallback)mapFallback.style.display="none";
}catch(err){
  console.error("Festival Pocket 초기화 오류",err);
  const grid=document.getElementById("grid");
  const empty=document.getElementById("empty");
  const hero=document.querySelector(".hero");
  if(hero){
    const note=document.createElement("div");
    note.className="notice";
    note.style.marginTop="10px";
    note.textContent="일부 기능이 제한되어 기본 축제 목록으로 표시 중입니다.";
    hero.appendChild(note);
  }
  if(empty) empty.style.display="none";
}
