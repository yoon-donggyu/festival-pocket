// Festival Pocket monthly dataset refresh · 2026-09-01
// Sources prioritised: Seoul/FUN SEOUL, Seoul city, Hanwha official.
(function(){
  try{
    const removeIds=new Set([1,2]); // ended in August: Songdo Beer Festival, Dongdaemun Beer Festival
    for(let i=festivals.length-1;i>=0;i--){
      if(removeIds.has(festivals[i].id)) festivals.splice(i,1);
    }

    const patch=(id,data)=>{const f=festivals.find(x=>x.id===id); if(f) Object.assign(f,data);};

    // Seoul Sculpture Festival: main festival ends 9/4, exhibition continues through 11/30.
    patch(3,{
      end:"2026-11-30",
      dateText:"메인 8.29 – 9.4 · 전시 8.29 – 11.30",
      status:"확정",
      desc:"메인 축제는 9월 4일까지이며, 조각 전시는 11월 30일까지 이어집니다. 열린송현녹지광장과 뚝섬한강공원 일대에서 산책하듯 관람하기 좋습니다.",
      source:"https://festival.seoul.go.kr/festival/year/loadMap.do"
    });

    // Seoul Art Week official 2026 venue list expanded to 135 visual-art spaces.
    patch(4,{
      status:"확정",
      place:"뉴스뮤지엄·서울시립미술관·서울공예박물관·코엑스 등 시각예술공간 135개소",
      search:"코엑스",
      desc:"서울 전역 135개 시각예술공간을 연결하는 아트 주간. 프리즈·키아프 시즌과 연계해 미술관·갤러리·문화공간을 폭넓게 둘러보기 좋습니다.",
      source:"https://festival.seoul.go.kr/festival/main/festivalMain.do"
    });

    // Hanwha official: 9/5 main fireworks; Seoul calendar also lists 9/4 eve programme.
    patch(5,{
      start:"2026-09-04",
      end:"2026-09-05",
      dateText:"9.4 전야 프로그램 · 9.5(토) 메인 불꽃쇼",
      status:"확정",
      place:"여의도한강공원(메인) · 노들섬 오렌지플레이존",
      search:"여의도한강공원",
      source:"https://www.hanwhafireworks.com/"
    });

    // 2026 Seoul Street Arts Festival official location is Ttukseom Hangang Park.
    patch(27,{
      district:"광진구",
      place:"뚝섬한강공원",
      search:"뚝섬한강공원",
      source:"https://festival.seoul.go.kr/festival/main/festivalMain.do"
    });

    // Reconfirm official drone-show dates and venue.
    patch(28,{
      dateText:"9.12 · 10.9 · 10.31 · 드론쇼 20:30–20:45",
      place:"뚝섬한강공원",
      status:"확정",
      source:"https://hangang.seoul.go.kr/www/eventMng/detail.do?evntSn=445&mid=538"
    });

    const additions=[
      {id:30,name:"서울라이트 DDP 2026 가을",start:"2026-09-03",end:"2026-09-13",dateText:"9.3 – 9.13 · 19:30–22:30",month:9,region:"서울",district:"중구",place:"동대문디자인플라자(DDP) 전면부 및 일대",search:"동대문디자인플라자",lat:37.5665,lng:127.0092,type:"빛·야간",pin:"light",icon:"✨",format:"미디어파사드형 · 빛+예술+라이브",rating:4.9,status:"확정",fee:"무료",crowd:"매우 혼잡",desc:"DDP 외벽 전체를 활용하는 대형 미디어아트 축제. 2026 가을 테마는 DAYBREAKER이며 백남준·유영국 작품과 레이저·라이브 퍼포먼스가 결합됩니다.",tags:["미디어아트","야경","사진","데이트","무료"],source:"https://news.seoul.go.kr/culture/archives/534071",scope:0},
      {id:31,name:"2026 서리풀뮤직페스티벌",start:"2026-09-19",end:"2026-09-20",dateText:"9.19 – 9.20",month:9,region:"서울",district:"서초구",place:"반포대로 일대",search:"반포대로",lat:37.4919,lng:127.0078,type:"도심종합",pin:"city",icon:"🎵",format:"도심 음악축제형 · 공연+거리축제",rating:4.7,status:"확정",fee:"프로그램별 상이",crowd:"매우 혼잡",desc:"반포대로 일대를 무대로 열리는 서초 대표 음악축제. 대형 야외공연과 거리 프로그램을 함께 즐기기 좋습니다.",tags:["음악","공연","거리축제","데이트"],source:"https://festival.seoul.go.kr/festival/main/festivalMain.do",scope:0},
      {id:32,name:"2026 용산 국가유산 야행",start:"2026-09-11",end:"2026-09-12",dateText:"9.11 – 9.12",month:9,region:"서울",district:"용산구",place:"효창공원 일대",search:"효창공원",lat:37.5452,lng:126.9599,type:"역사·전통",pin:"history",icon:"🌙",format:"야간 문화유산형 · 산책+체험",rating:4.5,status:"확정",fee:"세부 프로그램별 상이",crowd:"혼잡",desc:"효창공원 일대의 국가유산과 지역 역사를 밤에 즐기는 야행형 행사. 산책과 문화 체험을 함께 하기 좋은 프로그램입니다.",tags:["야행","문화유산","역사","산책","데이트"],source:"https://festival.seoul.go.kr/festival/main/festivalMain.do",scope:0},
      {id:33,name:"2026 서울청년주간",start:"2026-09-18",end:"2026-09-19",dateText:"9.18 15:00–22:00 · 9.19 13:00–22:00",month:9,region:"서울",district:"서초구",place:"반포한강공원 달빛광장 일대",search:"반포한강공원 달빛광장",lat:37.5096,lng:126.9958,type:"도심종합",pin:"city",icon:"🌃",format:"한강 피크닉형 · 청년행사+공연+박람회",rating:4.5,status:"확정",fee:"무료 프로그램 중심",crowd:"혼잡",desc:"청년의 날 기념식, 성장 박람회, 나이트 피크닉과 민관협력 프로그램을 반포한강공원에서 즐기는 이틀간의 행사입니다.",tags:["한강","피크닉","공연","청년","무료"],source:"https://news.seoul.go.kr/gov/archives/580419",scope:0},
      {id:34,name:"2026 서울바비큐페스티벌",start:"2026-10-24",end:"2026-10-25",dateText:"10.24 – 10.25 · 세부일정 미공개",month:10,region:"서울",district:"서울",place:"세부장소 미공개",search:"서울",lat:37.5665,lng:126.9780,type:"도심종합",pin:"city",icon:"🥩",format:"미식축제형 · K-BBQ+체험",rating:4.6,status:"예정",fee:"세부 프로그램별 상이",crowd:"매우 혼잡",desc:"서울시 2026 축제 일정에 10월 24~25일로 공개된 K-BBQ 미식축제. 현재 세부 장소와 프로그램은 미공개라 공식 공지 업데이트가 필요합니다.",tags:["바비큐","먹거리","미식","체험"],source:"https://festival.seoul.go.kr/festival/main/festivalMain.do",scope:0}
    ];

    // De-duplicate by id and normalized name before adding.
    const norm=s=>String(s||'').replace(/\s+/g,'').replace(/2026/g,'').toLowerCase();
    for(const a of additions){
      const idx=festivals.findIndex(f=>f.id===a.id || norm(f.name)===norm(a.name));
      if(idx>=0) Object.assign(festivals[idx],a); else festivals.push(a);
    }

    Object.assign(extras,{
      30:{parking:"DDP 주차장이 있으나 야간 미디어아트 행사 시간대 혼잡할 수 있어 지하철 이용 권장.",parkingLevel:4,warn:"19:30~22:30 운영. 우천·현장 사정에 따라 일부 퍼포먼스가 조정될 수 있습니다.",scores:{date:5.0,food:4.2,photo:5.0,family:4.7,value:5.0}},
      31:{parking:"반포대로 행사 구간은 교통통제와 주차 혼잡 가능성이 높아 대중교통 권장.",parkingLevel:5,warn:"대형 야외공연은 시간대별 인파가 집중될 수 있습니다.",scores:{date:4.8,food:4.3,photo:4.5,family:4.6,value:4.8}},
      32:{parking:"효창공원 주변 주차공간이 제한적이므로 효창공원앞역 등 대중교통 이용 권장.",parkingLevel:4,warn:"야간 행사이므로 세부 프로그램별 운영시간을 당일 확인하세요.",scores:{date:4.7,food:3.8,photo:4.7,family:4.6,value:4.8}},
      33:{parking:"반포한강공원 주차장은 행사일 혼잡 가능성이 높습니다. 대중교통 이용 권장.",parkingLevel:4,warn:"일부 프로그램은 대상·사전신청 조건이 있을 수 있습니다.",scores:{date:4.6,food:4.3,photo:4.5,family:3.8,value:4.9}},
      34:{parking:"장소가 아직 미공개라 주차정보도 확정되지 않았습니다.",parkingLevel:3,warn:"현재는 날짜만 공개된 예정 행사입니다. 장소·시간·예약 여부는 추후 공식 공지를 확인하세요.",scores:{date:4.5,food:5.0,photo:4.2,family:4.6,value:4.3}}
    });

    if(typeof mapPos!=="undefined") Object.assign(mapPos,{
      30:[246,188],31:[220,282],32:[198,226],33:[236,270],34:[230,235]
    });

    // Final safety de-dupe by id; keeps first occurrence and preserves all existing UI integrations.
    const seenIds=new Set();
    for(let i=festivals.length-1;i>=0;i--){
      const id=festivals[i].id;
      if(seenIds.has(id)) festivals.splice(i,1); else seenIds.add(id);
    }

    if(typeof renderAll==='function') renderAll();
    if(typeof renderPreference==='function') renderPreference();
    if(typeof renderSelectionList==='function' && document.querySelector('#selectionList')) renderSelectionList();
  }catch(e){
    console.error('Festival Pocket 2026-09 monthly update error',e);
  }
})();
