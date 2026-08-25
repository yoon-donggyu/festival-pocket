// Festival Pocket performance hotfix · 2026-08-25
(function(){
  'use strict';

  const perfState={
    listKey:'',
    mapKey:'',
    mapLayout:new Map(),
    searchTimer:0,
    zoomRaf:0,
    pendingZoom:null
  };

  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  const manualWeatherText='날씨는 「날씨 새로고침」으로 확인';

  function baseMapPoint(f){
    if(typeof mapPos!=='undefined' && mapPos[f.id]){
      return {x:mapPos[f.id][0],y:mapPos[f.id][1]};
    }
    const x=45+clamp((Number(f.lng)-126.45)/(129.55-126.45),0,1)*340;
    const y=92+clamp((38.05-Number(f.lat))/(38.05-34.75),0,1)*420;
    return {x,y};
  }

  function spreadPointsFast(arr){
    const key=arr.map(f=>f.id).sort((a,b)=>a-b).join(',');
    const cached=perfState.mapLayout.get(key);
    if(cached){
      return arr.map(f=>{
        const p=cached.get(f.id)||baseMapPoint(f);
        return {f,x:p.x,y:p.y};
      });
    }

    const pts=arr.map(f=>({f,...baseMapPoint(f)}));
    for(let iter=0;iter<7;iter++){
      for(let i=0;i<pts.length;i++){
        for(let j=i+1;j<pts.length;j++){
          const a=pts[i],b=pts[j];
          const dx=b.x-a.x,dy=b.y-a.y;
          const dist=Math.hypot(dx,dy);
          const min=27;
          if(dist<min){
            const ux=dist?dx/dist:1,uy=dist?dy/dist:0;
            const push=(min-dist)/2;
            a.x=clamp(a.x-ux*push,24,406);
            a.y=clamp(a.y-uy*push,78,532);
            b.x=clamp(b.x+ux*push,24,406);
            b.y=clamp(b.y+uy*push,78,532);
          }
        }
      }
    }
    const layout=new Map(pts.map(p=>[p.f.id,{x:p.x,y:p.y}]));
    perfState.mapLayout.set(key,layout);
    if(perfState.mapLayout.size>20){
      const first=perfState.mapLayout.keys().next().value;
      perfState.mapLayout.delete(first);
    }
    return pts;
  }

  function renderMapFast(arr){
    const g=qs('#mapPins');
    if(!g)return;
    const ids=arr.map(f=>f.id).sort((a,b)=>a-b).join(',');
    if(perfState.mapKey===ids && g.childElementCount===arr.length)return;
    perfState.mapKey=ids;

    const pts=spreadPointsFast(arr);
    g.innerHTML=pts.map(({f,x,y})=>`<g class="map-pin ${f.pin}" data-map-id="${f.id}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="15"></circle><foreignObject x="-8" y="-8" width="16" height="16"><div xmlns="http://www.w3.org/1999/xhtml">${iconFor(f,'pin')}</div></foreignObject></g>`).join('');

    if(!g.dataset.fpDelegated){
      g.dataset.fpDelegated='1';
      g.addEventListener('click',e=>{
        const target=e.target && e.target.closest ? e.target.closest('[data-map-id]') : null;
        if(!target)return;
        const f=festivals.find(x=>x.id===Number(target.dataset.mapId));
        if(f)showMapInfo(f);
      });
    }
  }

  try{
    spreadPoints=spreadPointsFast;
    renderMap=renderMapFast;
    setMapZoom=function(z){
      perfState.pendingZoom=clamp(Number(z)||1,.75,2.4);
      if(perfState.zoomRaf)return;
      perfState.zoomRaf=requestAnimationFrame(()=>{
        perfState.zoomRaf=0;
        state.mapZoom=perfState.pendingZoom;
        const svg=qs('#festivalMap');
        if(!svg)return;
        const w=430/state.mapZoom,h=560/state.mapZoom,cx=215,cy=280;
        svg.setAttribute('viewBox',`${cx-w/2} ${cy-h/2} ${w} ${h}`);
      });
    };
  }catch(e){console.warn('map optimization unavailable',e);}

  function applyManualWeatherLabels(root){
    (root||document).querySelectorAll('[data-weather-id]').forEach(el=>{
      if(el.dataset.fpWeatherReady==='1')return;
      el.dataset.fpWeatherReady='1';
      el.className='weather-summary';
      el.innerHTML=`<span class="weather-dot"></span><span>${manualWeatherText}</span>`;
    });
    (root||document).querySelectorAll('[id^="weather-detail-"]').forEach(el=>{
      if(el.dataset.fpWeatherDetailReady==='1')return;
      el.dataset.fpWeatherDetailReady='1';
      el.innerHTML='<div class="event-forecast">실시간 날씨는 상단 「날씨 새로고침」을 눌러 확인하세요.</div>';
    });
  }

  function listRenderKey(arr){
    const fav=[...state.favorites].sort((a,b)=>a-b).join(',');
    const exp=[...state.expandedCards].sort((a,b)=>a-b).join(',');
    const loc=state.userLoc?`${state.userLoc.lat.toFixed(4)},${state.userLoc.lng.toFixed(4)}`:'-';
    return [state.view,state.chip,state.query,state.sort,state.showSelectedOnly?'1':'0',arr.map(f=>f.id).join(','),fav,exp,loc].join('|');
  }

  try{
    renderListAndMap=function(){
      renderChips();
      const arr=filtered();
      const titles={all:'전체 축제',schedule:'일정별 축제',region:'지역별 축제',type:'유형별 축제',favorites:'찜한 축제'};
      const listTitle=qs('#listTitle');
      const resultText=qs('#resultText');
      if(listTitle)listTitle.textContent=titles[state.view]||'축제';
      if(resultText)resultText.textContent=`${arr.length}개${state.showSelectedOnly?' · 선택 보기':''}`;
      const selectedBtn=qs('#showSelectedBtn');
      if(selectedBtn){
        selectedBtn.classList.toggle('active',state.showSelectedOnly);
        selectedBtn.textContent=state.showSelectedOnly?`선택 보기 해제`:`선택한 축제만${state.selectedFestivals.size?` (${state.selectedFestivals.size})`:''}`;
      }

      const key=listRenderKey(arr);
      const grid=qs('#grid');
      if(grid && perfState.listKey!==key){
        perfState.listKey=key;
        grid.innerHTML=arr.map(card).join('');
        applyManualWeatherLabels(grid);
        requestAnimationFrame(()=>document.dispatchEvent(new CustomEvent('fp:list-rendered')));
      }
      const empty=qs('#empty');
      if(empty)empty.style.display=arr.length?'none':'block';
      renderMap(arr);

      qsa('#segments button').forEach(b=>b.classList.toggle('on',b.dataset.view===state.view));
      qsa('.bottom-nav button').forEach(b=>b.classList.toggle('on',b.dataset.bview===state.view));
    };
  }catch(e){console.warn('list optimization unavailable',e);}

  try{
    renderHero=function(){
      const f=topRecommended(),e=extras[f.id],d=distanceText(f);
      const hero=qs('#recommendHero');
      if(!hero)return;
      hero.innerHTML=`
        <div class="top"><span class="rec-badge">맞춤 추천</span><span class="rec-badge">${eventStatus(f).txt}</span></div>
        <h3>${iconFor(f,'small')} <span>${f.name}</span></h3>
        <p>${f.dateText}<br>${f.place}${d?` · 내 위치에서 ${d}`:''}</p>
        <div class="weather-summary" id="hero-weather" style="color:inherit;opacity:.72"><span class="weather-dot"></span><span>${manualWeatherText}</span></div>
        <div class="rec-badges">
          <span class="rec-badge">재미 ${f.rating.toFixed(1)}</span>
          <span class="rec-badge">데이트 ${e.scores.date.toFixed(1)}</span>
          <span class="rec-badge">사진 ${e.scores.photo.toFixed(1)}</span>
          <span class="rec-badge">먹거리 ${e.scores.food.toFixed(1)}</span>
        </div>
        <div class="rec-actions">
          <button class="main" onclick="tmapSearch('${f.search.replaceAll("'","\\'")}')">길찾기</button>
          <button onclick="toggleFav(${f.id})">${state.favorites.has(f.id)?'찜됨':'찜'}</button>
          <button onclick="addCalendar(${f.id})">일정 추가</button>
        </div>`;
    };
  }catch(e){console.warn('hero optimization unavailable',e);}

  try{
    const search=qs('#search');
    if(search){
      search.addEventListener('input',e=>{
        e.stopImmediatePropagation();
        const value=e.target.value;
        clearTimeout(perfState.searchTimer);
        perfState.searchTimer=setTimeout(()=>{
          state.query=value;
          renderListAndMap();
        },220);
      },true);
    }
  }catch(e){console.warn('search debounce unavailable',e);}

  async function refreshWeatherOptimized(){
    const btn=qs('#refreshWeatherBtn');
    if(btn){btn.classList.add('weather-loading');btn.textContent='기상청 갱신 중';btn.disabled=true;}
    try{
      clearWeatherCache();
      const visible=filtered().slice(0,8);
      const groups=new Map();
      visible.forEach(f=>{
        const key=weatherCacheKey(f);
        if(!groups.has(key))groups.set(key,[]);
        groups.get(key).push(f);
      });
      const jobs=[...groups.values()];
      let cursor=0;
      const worker=async()=>{
        while(cursor<jobs.length){
          const group=jobs[cursor++];
          const representative=group[0];
          try{
            const data=await fetchFestivalWeather(representative,true);
            group.slice(1).forEach(f=>{
              putWeatherCache(f,data);
              renderWeatherSummary(f,data);
              renderWeatherDetail(f,data);
            });
          }catch(e){}
        }
      };
      await Promise.all([worker(),worker()]);
      toast('화면의 기상청 날씨를 갱신했습니다');
    }finally{
      if(btn){btn.classList.remove('weather-loading');btn.textContent='날씨 새로고침';btn.disabled=false;}
    }
  }
  try{
    const weatherBtn=qs('#refreshWeatherBtn');
    if(weatherBtn)weatherBtn.onclick=refreshWeatherOptimized;
    refreshVisibleWeather=refreshWeatherOptimized;
  }catch(e){console.warn('weather refresh optimization unavailable',e);}

  try{
    toggleFav=function(id){
      state.favorites.has(id)?state.favorites.delete(id):state.favorites.add(id);
      saveFav();
      renderSummary();
      renderHero();
      perfState.listKey='';
      renderListAndMap();
      toast(state.favorites.has(id)?'찜에 저장했어요':'찜에서 삭제했어요');
    };
    window.toggleFav=toggleFav;
  }catch(e){console.warn('favorite optimization unavailable',e);}

  applyManualWeatherLabels(document);
  document.documentElement.classList.add('fp-performance-ready');
})();
