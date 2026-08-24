// Additional recommended festivals · updated 2026-08-24
// Official-source correction: Seoul Autumn Festa
const autumnFesta=festivals.find(f=>f.id===6);
if(autumnFesta){
  Object.assign(autumnFesta,{
    name:"2026 서울어텀페스타",
    start:"2026-09-18",
    end:"2026-11-29",
    dateText:"9.18 – 11.29",
    status:"확정",
    place:"서울 전역의 실내외 공연장·한강공원 일대",
    search:"뚝섬한강공원",
    lat:37.5292,
    lng:127.0699,
    desc:"서울 전역의 공연과 축제를 하나의 브랜드로 연결하는 73일간의 공연예술 페스타. 9월 18일 뚝섬한강공원 개막공연을 시작으로 서울거리예술축제 등 다양한 프로그램이 이어집니다.",
    source:"https://culture.seoul.go.kr/culture/culture/cultureEvent/view.do?cultcode=159120&menuNo=200010"
  });
}

festivals.push(
{id:19,name:"2026 경복궁 별빛야행",start:"2026-09-02",end:"2026-10-24",dateText:"9.2 – 10.24 · 회차제",month:9,region:"서울",district:"종로구",place:"경복궁",search:"경복궁",lat:37.5796,lng:126.9770,type:"역사·전통",pin:"history",icon:"🏯",format:"궁궐 야간체험형 · 공연+궁중음식",rating:4.9,status:"확정",fee:"유료 · 회차별 예매",crowd:"매우 혼잡",desc:"경복궁의 야간 동선과 공연, 궁중음식 체험을 함께 즐기는 예약형 프로그램. 일반 축제보다 인원 제한이 있어 예매 일정 확인이 중요합니다.",tags:["궁궐","야간","데이트","공연","사진"],source:"https://www.kh.or.kr/",scope:0},
{id:20,name:"2026 수원화성 미디어아트",start:"2026-09-19",end:"2026-10-06",dateText:"9.19 – 10.6 · 야간",month:9,region:"경기",district:"수원시",place:"수원화성 화서문·장안문 일대",search:"수원화성 화서문",lat:37.2841,lng:127.0097,type:"빛·야간",pin:"light",icon:"✨",format:"야간 미디어아트형 · 성곽+빛",rating:4.9,status:"확정",fee:"무료 관람 중심",crowd:"매우 혼잡",desc:"수원화성 성곽을 대형 미디어아트 무대로 사용하는 야간 행사. 사진과 산책 목적의 데이트 코스로 특히 좋습니다.",tags:["미디어아트","야경","사진","데이트","무료"],source:"https://www.swcf.or.kr/",scope:0},
{id:21,name:"2026 차 없는 잠수교 뚜벅뚜벅 축제",start:"2026-09-06",end:"2026-10-25",dateText:"9.6 – 10.25 · 매주 일요일",month:9,region:"서울",district:"서초·용산",place:"잠수교·반포한강공원",search:"잠수교",lat:37.5121,lng:126.9965,type:"도심종합",pin:"city",icon:"🚶",format:"한강 보행형 · 피크닉+공연+먹거리",rating:4.7,status:"확정",fee:"무료 입장 · 구매 별도",crowd:"매우 혼잡",desc:"차량 통제된 잠수교를 걸으며 공연, 플리마켓, 푸드트럭과 한강 피크닉을 함께 즐기는 주말형 행사입니다.",tags:["한강","피크닉","공연","먹거리","데이트"],source:"https://www.seoul.go.kr/",scope:0},
{id:22,name:"제63회 수원화성문화제",start:"2026-10-04",end:"2026-10-11",dateText:"10.4 – 10.11",month:10,region:"경기",district:"수원시",place:"수원화성·행궁광장 일대",search:"화성행궁",lat:37.2829,lng:127.0144,type:"역사·전통",pin:"history",icon:"🏯",format:"대형 역사문화형 · 공연+체험+퍼레이드",rating:4.7,status:"확정",fee:"무료 프로그램 중심",crowd:"매우 혼잡",desc:"수원화성 전체를 무대로 공연, 퍼레이드, 전통 체험을 즐기는 대형 역사문화 축제. 반나절 이상 머물기 좋은 편입니다.",tags:["수원화성","퍼레이드","공연","체험","가족"],source:"https://www.visitsuwon.or.kr/",scope:0},
{id:23,name:"2026 안동국제탈춤페스티벌",start:"2026-09-24",end:"2026-10-04",dateText:"9.24 – 10.4",month:9,region:"경북",district:"안동시",place:"안동 탈춤공원·구도심 일대",search:"안동탈춤공원",lat:36.5575,lng:128.7307,type:"역사·전통",pin:"history",icon:"🎭",format:"전통 공연형 · 세계탈춤+퍼레이드",rating:4.8,status:"확정",fee:"프로그램별 상이",crowd:"매우 혼잡",desc:"국내외 탈춤 공연과 퍼레이드, 먹거리, 체험을 함께 즐기는 대표 전통축제. 수도권에서는 1박 원정형으로 추천합니다.",tags:["탈춤","전통","공연","먹거리","1박추천"],source:"https://www.maskdance.com/",scope:2},
{id:24,name:"2026 구미라면축제",start:"2026-11-06",end:"2026-11-08",dateText:"11.6 – 11.8",month:11,region:"경북",district:"구미시",place:"구미역 일대",search:"구미역",lat:36.1280,lng:128.3308,type:"도심종합",pin:"city",icon:"🍜",format:"먹거리 테마형 · 라면+공연+체험",rating:4.6,status:"예정",fee:"무료 입장 · 음식 구매 별도",crowd:"매우 혼잡",desc:"라면을 테마로 시식, 레시피 콘텐츠, 공연과 체험을 결합한 이색 먹거리 축제. 기존 목록과 성격이 겹치지 않는 편입니다.",tags:["라면","먹거리","체험","공연","1박추천"],source:"https://www.gumi.go.kr/",scope:2},
{id:25,name:"2026 포항국제불빛축제",start:"2026-11-20",end:"2026-11-22",dateText:"11.20 – 11.22",month:11,region:"경북",district:"포항시",place:"영일대해수욕장 일대",search:"영일대해수욕장",lat:36.0574,lng:129.3785,type:"불꽃",pin:"fire",icon:"🎆",format:"해상 불꽃형 · 국제불꽃+야간공연",rating:4.9,status:"예정",fee:"무료 관람 중심",crowd:"극심",desc:"영일대 바다를 배경으로 국제 불꽃쇼와 야간 공연을 즐기는 대형 행사. 늦가을 1박 여행 코스로 넣기 좋습니다.",tags:["불꽃","바다","야경","사진","1박추천"],source:"https://festival.phcf.or.kr/",scope:2},
{id:26,name:"2026 노원수제맥주축제",start:"2026-09-12",end:"2026-09-13",dateText:"9.12 – 9.13 · 12:00–21:00",month:9,region:"서울",district:"노원구",place:"화랑대 철도공원 일원",search:"화랑대 철도공원",lat:37.6230,lng:127.0907,type:"맥주",pin:"beer",icon:"🍺",format:"공원형 · 수제맥주+공연+먹거리",rating:4.8,status:"확정",fee:"무료 입장 · 음식/맥주 구매 별도",crowd:"매우 혼잡",desc:"전국 34개 브루어리의 약 200종 수제맥주와 서울뮤직위크 공연, 지역 먹거리를 함께 즐기는 대형 맥주축제입니다.",tags:["맥주","공연","먹거리","데이트"],source:"https://festival.seoul.go.kr/festival/main/festivalView.do?festacode=533",scope:0},
{id:27,name:"서울거리예술축제 2026",start:"2026-09-19",end:"2026-09-20",dateText:"9.19 – 9.20",month:9,region:"서울",district:"광진·성동",place:"뚝섬한강공원·서울숲",search:"뚝섬한강공원",lat:37.5292,lng:127.0699,type:"전시·예술",pin:"art",icon:"🎭",format:"야외 공연예술형 · 거리공연+전시+체험",rating:4.8,status:"확정",fee:"무료 관람 중심",crowd:"매우 혼잡",desc:"뚝섬한강공원과 서울숲에서 국내외 거리예술 공연, 전시, 시민참여 프로그램을 즐기는 서울 대표 야외공연예술축제입니다.",tags:["공연","거리예술","전시","한강","데이트"],source:"https://festival.seoul.go.kr/festival/main/festivalView.do?festacode=382",scope:0},
{id:28,name:"2026 한강 드론라이트쇼 · 하반기",start:"2026-09-12",end:"2026-10-31",dateText:"9.12 · 10.9 · 10.31 · 20:30",month:9,region:"서울",district:"광진구",place:"뚝섬한강공원",search:"뚝섬한강공원",lat:37.5292,lng:127.0699,type:"빛·야간",pin:"light",icon:"✨",format:"회차형 야간공연 · 드론쇼+문화공연",rating:4.9,status:"확정",fee:"무료",crowd:"극심",desc:"하반기 총 3회 열리는 한강 드론 라이트 쇼. 드론 본 공연은 20:30~20:45이며, 10월 31일은 2,000대 규모의 마블 테마 특별공연이 예정되어 있습니다.",tags:["드론","야경","한강","사진","데이트","회차형"],source:"https://hangang.seoul.go.kr/www/eventMng/detail.do?evntSn=445&mid=538",scope:0},
{id:29,name:"종로K축제(종로한복축제)",start:"2026-09-10",end:"2026-09-19",dateText:"9.10 – 9.19 (예정)",month:9,region:"서울",district:"종로구",place:"광화문광장·종로구 일원",search:"광화문광장",lat:37.5724,lng:126.9769,type:"역사·전통",pin:"history",icon:"👘",format:"전통문화 종합형 · 한복+한식+국악+공예",rating:4.6,status:"예정",fee:"무료 프로그램 중심",crowd:"혼잡",desc:"종로한복축제 10주년을 기념해 한복·한식·한글·국악·공예 등 우리문화 TOP10을 폭넓게 다루는 전통문화 축제입니다.",tags:["한복","한식","국악","공예","전통","사진"],source:"https://festival.seoul.go.kr/festival/main/festivalView.do?festacode=655",scope:0}
);

Object.assign(extras,{
19:{parking:"경복궁·광화문 일대 주차비와 혼잡도가 높아 대중교통 권장.",parkingLevel:4,warn:"회차제 예약 행사입니다. 입장시간과 예매내역을 반드시 확인하세요.",scores:{date:5.0,food:4.2,photo:5.0,family:4.2,value:4.1}},
20:{parking:"화서문·장안문 주변 공영주차장 이용 가능하나 주말 야간 만차 가능성이 높습니다.",parkingLevel:4,warn:"야간 관람객이 집중되므로 일몰 전 도착이 편합니다.",scores:{date:5.0,food:3.8,photo:5.0,family:4.5,value:5.0}},
21:{parking:"반포한강공원 주차장은 행사일 혼잡 가능성이 큽니다. 지하철 이용 권장.",parkingLevel:5,warn:"매주 일요일 중심 행사라 실제 운영일과 우천 취소 공지를 확인하세요.",scores:{date:4.9,food:4.6,photo:4.7,family:4.6,value:5.0}},
22:{parking:"행궁·수원화성 주변 공영주차장 이용 가능하나 축제 기간 만차 가능성이 높습니다.",parkingLevel:4,warn:"프로그램별 장소와 시간이 달라 당일 시간표 확인이 필요합니다.",scores:{date:4.6,food:4.3,photo:4.8,family:4.9,value:4.9}},
23:{parking:"축제장 주변 임시주차장·셔틀 운영 여부를 공식 안내에서 확인 권장.",parkingLevel:4,warn:"주말에는 숙박과 주차 수요가 큽니다. 1박 방문이면 미리 예약하는 편이 좋습니다.",scores:{date:4.5,food:4.6,photo:4.8,family:4.8,value:4.7}},
24:{parking:"구미역 인근 공영주차장 이용 가능하나 행사 시간대 혼잡 예상.",parkingLevel:4,warn:"인기 먹거리 부스는 대기시간이 길 수 있습니다.",scores:{date:4.3,food:5.0,photo:4.0,family:4.7,value:4.8}},
25:{parking:"영일대해수욕장 주변 주차난과 교통통제 가능성이 높아 외곽 주차 후 이동 권장.",parkingLevel:5,warn:"불꽃 메인 시간 전후 초대형 인파가 몰릴 수 있어 귀가 동선을 미리 정하세요.",scores:{date:5.0,food:4.4,photo:5.0,family:4.1,value:4.8}},
26:{parking:"화랑대 철도공원 주변 주차공간이 제한적입니다. 공식 안내에서도 대중교통 이용을 권장합니다.",parkingLevel:4,warn:"주류 행사이므로 음주 예정이면 차량 이용을 피하세요. 텀블러·돗자리 준비 권장.",scores:{date:4.7,food:4.8,photo:4.2,family:3.8,value:4.8}},
27:{parking:"뚝섬한강공원·서울숲 주변은 주말 혼잡이 심해 지하철 이용 권장.",parkingLevel:5,warn:"야외 공연이 많아 우천 시 프로그램 변경 가능성을 확인하세요.",scores:{date:4.8,food:3.8,photo:4.9,family:4.7,value:5.0}},
28:{parking:"뚝섬한강공원 주차장은 공연일 매우 혼잡합니다. 자양역 등 대중교통 이용을 강력 권장.",parkingLevel:5,warn:"실제 공연일은 9/12·10/9·10/31 세 차례입니다. 우천·강풍 시 지연 또는 취소될 수 있습니다.",scores:{date:5.0,food:3.8,photo:5.0,family:4.8,value:5.0}},
29:{parking:"광화문광장 주변 주차비와 혼잡도가 높아 대중교통 권장.",parkingLevel:4,warn:"현재 서울시 표기는 예정 일정입니다. 본행사와 세부 프로그램 일정은 공식 공지를 재확인하세요.",scores:{date:4.6,food:4.6,photo:4.9,family:4.8,value:5.0}}
});

if(!filters.region.includes("경기")) filters.region.splice(filters.region.length-2,0,"경기");
if(!filters.region.includes("경북")) filters.region.splice(filters.region.length-2,0,"경북");

// Give added events distinct positions on the schematic map.
if(typeof mapPos!=="undefined") Object.assign(mapPos,{
19:[205,150],20:[245,318],21:[226,242],22:[258,330],23:[305,405],24:[292,438],25:[340,454],
26:[326,165],27:[302,220],28:[334,230],29:[218,162]
});

// Re-render after extending/correcting the dataset so filters, map, counts, recommendations and weather use all 29 festivals.
try{
  renderAll();
  if(typeof renderPreference==='function') renderPreference();
  if(typeof renderSelectionList==='function' && document.querySelector('#selectionList')) renderSelectionList();
}catch(e){console.error('Festival Pocket extra dataset render error',e);}
