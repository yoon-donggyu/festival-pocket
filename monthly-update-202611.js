// Festival Pocket monthly update · 2026-11-01
// Applied after September and October updates; existing UI and weather modules remain unchanged.
(function(){
  try {
    const now="2026-11-01";
    // Keep historical events that span November; remove only events whose recorded end precedes November.
    const removed=festivals.filter(f=>f.end && f.end<now);
    for(let i=festivals.length-1;i>=0;i--) if(festivals[i].end && festivals[i].end<now) festivals.splice(i,1);
    const patch=(id,obj)=>{const f=festivals.find(x=>x.id===id);if(f)Object.assign(f,obj);};
    // Official Pohang Culture Foundation event detail states 11/19-21, main fireworks planned 11/21.
    // Its event-list landing page currently conflicts (11/18-20); explicitly flag the discrepancy.
    patch(25,{start:"2026-11-19",end:"2026-11-21",month:11,dateText:"11.19(목) – 11.21(토) · 국제불꽃쇼 11.21 예정",place:"영일대해수욕장 일원",search:"영일대해수욕장",status:"예정",desc:"포항문화재단 축제 상세는 11월 19~21일(21일 국제불꽃쇼 예정)로 안내하지만, 재단 행사 목록에는 11월 18~20일로 표시되어 일정이 상충합니다. 방문 전 주최 측 최종 공지를 확인하세요.",source:"https://phcf.or.kr/phcf/festival_detail/view.do?festivalId=FST_LIGHT_2026_001&tab=program"});
    patch(14,{start:"2026-11-07",end:"2026-11-07",dateText:"11.7(토) · 교통통제 예정",status:"확정",source:"https://www.busan.go.kr/nbnews/1761578"});
    patch(24,{start:"2026-11-06",end:"2026-11-08",dateText:"11.6(금) – 11.8(일)",place:"구미역·역전로 일대",search:"구미역",status:"확정",source:"https://www.gumiramyun.com/"});
    const additions=[
      {id:40,name:"제25회 서울카페쇼 2026",start:"2026-11-11",end:"2026-11-14",dateText:"11.11(수) – 11.14(토) · 일반 관람 11.13–14",month:11,region:"서울",district:"강남구",place:"코엑스 A–D홀 전관",search:"코엑스",lat:37.5117,lng:127.0592,type:"전시·예술",pin:"art",icon:"☕",format:"커피·디저트 박람회 · 전시+시음",rating:4.7,status:"확정",fee:"유료 · 예매 조건별 상이",crowd:"매우 혼잡",desc:"11월 11~12일은 업계 대상 비즈니스데이, 13~14일은 일반 참관객 입장 가능. 커피·차·베이커리·장비 전시.",tags:["커피","디저트","실내","데이트","전시"],source:"https://kor.cafeshow.com/kor/cafeshow/summary.asp",scope:0},
      {id:41,name:"2026 포항국제음악제",start:"2026-11-06",end:"2026-11-12",dateText:"11.6 – 11.12 · 공연별 시간 상이",month:11,region:"경북",district:"포항시",place:"포항문화예술회관 및 포항시 일원",search:"포항문화예술회관",lat:36.0196,lng:129.3432,type:"전시·예술",pin:"art",icon:"🎻",format:"클래식 음악제 · 공연+실내",rating:4.5,status:"확정",fee:"공연별 상이",crowd:"보통",desc:"포항문화재단 공식 대표축제 목록에 안내된 11월 음악제. 공연별 일정·티켓은 주최 측 공지 확인.",tags:["클래식","공연","음악","실내"],source:"https://phcf.or.kr/phcf/current_festivals/view.do",scope:2}
    ];
    const norm=s=>String(s||"").replace(/2026|제\d+회|\s+/g,"").toLowerCase();
    for(const a of additions){
      const old=festivals.find(f=>f.id===a.id||norm(f.name)===norm(a.name));
      if(old)Object.assign(old,a);else festivals.push(a);
    }
    Object.assign(extras,{
      40:{parking:"코엑스 주차 혼잡. 대중교통 권장.",parkingLevel:4,warn:"11.11~12 비즈니스데이: 일반 참관은 11.13~14.",scores:{date:4.8,food:5,photo:4.5,family:4.2,value:4}},
      41:{parking:"공연장별 주차·이동 경로 확인.",parkingLevel:3,warn:"공연별 장소와 입장권이 다를 수 있습니다.",scores:{date:4.4,food:3.8,photo:4.1,family:4.2,value:4.1}}
    });
    if(typeof mapPos!=="undefined")Object.assign(mapPos,{40:[270,280],41:[330,410]});
    const seen=new Set(),seenNames=new Set();
    for(let i=festivals.length-1;i>=0;i--){const f=festivals[i],name=norm(f.name);if(seen.has(f.id)||seenNames.has(name))festivals.splice(i,1);else{seen.add(f.id);seenNames.add(name);}}
    if(typeof renderAll==="function")renderAll();
    if(typeof renderPreference==="function")renderPreference();
    if(typeof renderSelectionList==="function"&&document.querySelector("#selectionList"))renderSelectionList();
    console.info("Festival Pocket November update", {removed:removed.length,added:additions.length,total:festivals.length});
  }catch(e){console.error("Festival Pocket November update error",e);}
})();