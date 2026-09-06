// Single-screen mobile tabs. Existing sections and their data stay intact;
// this controller only decides which product surface is visible.
(() => {
  'use strict';
  const $=s=>document.querySelector(s);
  const allSections=['#top','#heroRec','#weekend','#preferences','#calendar','#mapSection','#favorites','main.wrap > .section:last-child'];
  const titles={home:['Festival Pocket','오늘 갈 축제를 빠르게 골라보세요'],map:['축제 지도','위치와 거리를 보며 축제를 선택하세요'],festivals:['전체 축제','검색과 필터로 원하는 축제를 찾아보세요'],calendar:['축제 일정','월별로 예정된 축제를 확인하세요'],favorites:['찜한 축제','저장한 축제만 모아봅니다']};
  let active='home';

  const pageHeader=document.createElement('header');
  pageHeader.id='tabPageHeader';pageHeader.className='tab-page-header fp-tab-hidden';
  pageHeader.innerHTML='<div class="eyebrow">FESTIVAL POCKET</div><h1></h1><p></p>';
  $('.safe')?.insertBefore(pageHeader,$('.safe')?.firstChild||null);

  const nav=$('.bottom-nav');
  if(nav)nav.innerHTML=`
    <button type="button" data-tab="home"><span class="ico">⌂</span>홈</button>
    <button type="button" data-tab="map"><span class="ico">⌖</span>지도</button>
    <button type="button" data-tab="festivals"><span class="ico">▦</span>축제</button>
    <button type="button" data-tab="calendar"><span class="ico">◷</span>일정</button>
    <button type="button" data-tab="favorites"><span class="ico">♡</span>찜</button>`;

  function syncNav(){nav?.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('on',b.dataset.tab===active))}
  const baseRenderList=window.renderListAndMap;
  if(typeof baseRenderList==='function')window.renderListAndMap=function(){const result=baseRenderList.apply(this,arguments);syncNav();return result};

  function hideAll(){allSections.forEach(s=>$(s)?.classList.add('fp-tab-hidden'));$('.sticky')?.classList.add('fp-tab-hidden')}
  function show(selector){$(selector)?.classList.remove('fp-tab-hidden')}
  function setListView(view){
    if(typeof state!=='undefined'){state.view=view;state.chip='전체'}
    if(typeof renderListAndMap==='function')renderListAndMap();
  }
  function setTab(tab,{scroll=true}={}){
    active=titles[tab]?tab:'home';hideAll();
    pageHeader.classList.toggle('fp-tab-hidden',active==='home');
    if(active==='home'){['#top','#heroRec','#weekend','#preferences'].forEach(show)}
    if(active==='map'){show('#mapSection');setTimeout(()=>window.resizeFestivalMap?.(),80)}
    if(active==='calendar')show('#calendar');
    if(active==='festivals'){show('.sticky');show('#favorites');show('main.wrap > .section:last-child');setListView('all')}
    if(active==='favorites'){show('.sticky');show('#favorites');show('main.wrap > .section:last-child');setListView('favorites')}
    if(active!=='home'){pageHeader.querySelector('h1').textContent=titles[active][0];pageHeader.querySelector('p').textContent=titles[active][1]}
    syncNav();
    document.body.dataset.appTab=active;
    try{sessionStorage.setItem('festivalPocketTab',active)}catch{}
    if(scroll)window.scrollTo({top:0,behavior:'auto'});
  }
  window.setFestivalTab=setTab;
  nav?.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));

  document.querySelectorAll('[data-jump="mapSection"]').forEach(b=>b.onclick=()=>setTab('map'));
  document.querySelectorAll('[data-jump="favorites"]').forEach(b=>b.onclick=()=>setTab('favorites'));
  document.querySelectorAll('[data-jump="weekend"],[data-jump="preferences"]').forEach(b=>{const target=b.dataset.jump;b.onclick=()=>{setTab('home',{scroll:false});setTimeout(()=>document.getElementById(target)?.scrollIntoView({behavior:'smooth',block:'start'}),0)}});

  const oldFocus=window.focusFestival;
  if(typeof oldFocus==='function')window.focusFestival=id=>{setTab('festivals');setTimeout(()=>oldFocus(id),20)};
  setTab('home',{scroll:false});
})();
