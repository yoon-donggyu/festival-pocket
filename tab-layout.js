// Single-screen mobile tabs. Existing sections and their data stay intact;
// this controller only decides which product surface is visible.
(() => {
  'use strict';
  const $=s=>document.querySelector(s);
  const allSections=['#top','#heroRec','#weekend','#preferences','#calendar','#mapSection','#favorites','main.wrap > .section:last-child'];
  const titles={all:['전체 축제','모든 축제를 한눈에 확인하세요'],schedule:['축제 일정','월별로 예정된 축제만 확인하세요'],map:['축제 지도','지도에서 축제 위치만 확인하세요'],type:['유형별 축제','유형을 골라 해당 축제만 확인하세요'],favorites:['찜한 축제','저장한 축제만 모아봅니다']};
  let active='all';

  const navStyle=document.createElement('style');
  navStyle.textContent='.bottom-nav{display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important}.bottom-nav button{min-width:0!important;padding-left:2px!important;padding-right:2px!important;font-size:10px!important}.bottom-nav button .ico{font-size:17px!important}';
  document.head.appendChild(navStyle);

  const pageHeader=document.createElement('header');
  pageHeader.id='tabPageHeader';pageHeader.className='tab-page-header fp-tab-hidden';
  pageHeader.innerHTML='<div class="eyebrow">FESTIVAL POCKET</div><h1></h1><p></p>';
  $('.safe')?.insertBefore(pageHeader,$('.safe')?.firstChild||null);

  const nav=$('.bottom-nav');
  if(nav)nav.innerHTML=`
    <button type="button" data-tab="all"><span class="ico">⌂</span>전체</button>
    <button type="button" data-tab="schedule"><span class="ico">◷</span>일정</button>
    <button type="button" data-tab="map"><span class="ico">⌖</span>지도</button>
    <button type="button" data-tab="map3d"><span class="ico">★</span>전체3D</button>
    <button type="button" data-tab="type"><span class="ico">◇</span>유형</button>
    <button type="button" data-tab="favorites"><span class="ico">♡</span>찜</button>`;

  function syncNav(){nav?.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('on',b.dataset.tab===active))}
  const baseRenderList=window.renderListAndMap;
  if(typeof baseRenderList==='function')window.renderListAndMap=function(){const result=baseRenderList.apply(this,arguments);syncNav();return result};

  function hideAll(){allSections.forEach(s=>$(s)?.classList.add('fp-tab-hidden'));$('.sticky')?.classList.add('fp-tab-hidden')}
  function show(selector){$(selector)?.classList.remove('fp-tab-hidden')}
  function setListView(view){
    if(typeof state!=='undefined'){state.view=view;state.chip='전체';state.dateChip='전체 일정'}
    if(typeof renderListAndMap==='function')renderListAndMap();
  }
  function setTab(tab,{scroll=true}={}){
    if(tab==='map3d'){location.href='festival-3d-all.html';return;}
    active=titles[tab]?tab:'all';hideAll();
    pageHeader.classList.remove('fp-tab-hidden');
    if(active==='all'){show('.sticky');show('#favorites');show('main.wrap > .section:last-child');setListView('all')}
    if(active==='schedule')show('#calendar');
    if(active==='map'){show('#mapSection');setTimeout(()=>window.resizeFestivalMap?.(),80)}
    if(active==='type'){show('.sticky');show('#favorites');show('main.wrap > .section:last-child');setListView('type')}
    if(active==='favorites'){show('.sticky');show('#favorites');show('main.wrap > .section:last-child');setListView('favorites')}
    pageHeader.querySelector('h1').textContent=titles[active][0];pageHeader.querySelector('p').textContent=titles[active][1];
    syncNav();
    document.body.dataset.appTab=active;
    try{sessionStorage.setItem('festivalPocketTab',active)}catch{}
    if(scroll)window.scrollTo({top:0,behavior:'auto'});
  }
  window.setFestivalTab=setTab;
  nav?.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));

  document.querySelectorAll('[data-jump="mapSection"]').forEach(b=>b.onclick=()=>setTab('map'));
  document.querySelectorAll('[data-jump="favorites"]').forEach(b=>b.onclick=()=>setTab('favorites'));
  document.querySelectorAll('[data-jump="weekend"],[data-jump="preferences"]').forEach(b=>b.onclick=()=>setTab('all'));

  const oldFocus=window.focusFestival;
  if(typeof oldFocus==='function')window.focusFestival=id=>{setTab('all');setTimeout(()=>oldFocus(id),20)};
  const requested=new URLSearchParams(location.search).get('tab');
  setTab(titles[requested]?requested:'all',{scroll:false});

  // Load reusable 3D venue + festival comparison controls after the core app is ready.
  const fp3d=document.createElement('script');
  fp3d.src='festival-3d-entry.js?v=20260909-3dall2';
  fp3d.defer=true;
  document.body.appendChild(fp3d);
})();
