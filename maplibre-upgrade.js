// Festival Pocket MapLibre adapter
// 18 records are intentionally kept as GeoJSON. When the dataset reaches a few
// thousand points, replace only the source with MVT/PMTiles + bbox API loading.
(() => {
  'use strict';
  const root=document.getElementById('festivalMap');
  if(!root||!window.maplibregl||typeof festivals==='undefined')return;
  const typeColors={'불꽃':'#f04444','빛·야간':'#7c5cff','맥주·푸드':'#e28a18','자연·경관':'#2c9b63','크리스마스':'#cc3f71','역사·전통':'#8c684d','도심종합':'#2563eb','예술·전시':'#637083'};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const style={version:8,sources:{osm:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,attribution:'© OpenStreetMap contributors'}},layers:[{id:'osm',type:'raster',source:'osm'}]};
  let map=null,lastIds='',selectedId=null;

  const shell=root.closest('.map-shell');
  root.replaceWith(Object.assign(document.createElement('div'),{id:'festivalMap',className:'festival-maplibre'}));
  const container=document.getElementById('festivalMap');
  shell?.querySelector('.map-title')?.remove();
  shell?.querySelector('.map-tools')?.remove();
  const oldInfo=document.getElementById('mapInfo');if(oldInfo)oldInfo.remove();
  const status=document.createElement('div');status.className='map-live-status';status.innerHTML='<b>축제 지도</b><span>지도를 움직이거나 핀을 눌러보세요</span>';shell?.appendChild(status);
  const sheet=document.createElement('section');sheet.id='festivalMapSheet';sheet.className='festival-map-sheet';sheet.setAttribute('aria-live','polite');sheet.innerHTML='<div class="sheet-handle"></div><div class="map-sheet-empty"><b>축제를 선택하세요</b><span>가까이 확대하면 개별 축제를 확인할 수 있습니다.</span></div>';shell?.appendChild(sheet);

  function feature(f){return{type:'Feature',geometry:{type:'Point',coordinates:[Number(f.lng),Number(f.lat)]},properties:{id:f.id,name:f.name,dateText:f.dateText,place:f.place,type:f.type,rating:f.rating,color:typeColors[f.type]||'#34363b'}}}
  function collection(arr){return{type:'FeatureCollection',features:arr.filter(f=>Number.isFinite(Number(f.lat))&&Number.isFinite(Number(f.lng))).map(feature)}}
  function fallback(){container.innerHTML='<div class="festival-map-fallback"><b>이 기기에서는 지도를 표시할 수 없습니다.</b><span>그래픽 가속을 사용할 수 없어 축제 목록으로 안내합니다.</span><button type="button">축제 목록 보기</button></div>';container.querySelector('button').onclick=()=>document.getElementById('favorites')?.scrollIntoView({behavior:'smooth'})}
  function showSheet(id){
    const f=festivals.find(x=>Number(x.id)===Number(id));if(!f)return;selectedId=f.id;
    sheet.classList.add('open');sheet.innerHTML=`<div class="sheet-handle"></div><div class="festival-sheet-head"><div><span>${esc(f.region)} · ${esc(f.district)}</span><h3>${esc(f.name)}</h3></div><button type="button" data-map-close aria-label="닫기">×</button></div><p>${esc(f.dateText)}<br>${esc(f.place)}</p><div class="festival-sheet-badges"><span>${esc(f.type)}</span><span>재미 ${Number(f.rating).toFixed(1)}</span><span>${esc(f.crowd)}</span></div><div class="festival-sheet-actions"><button class="primary" data-map-route>T맵 길찾기</button><button data-map-detail>상세 보기</button><button data-map-fav>${state.favorites.has(f.id)?'♥ 찜됨':'♡ 찜'}</button></div>`;
    sheet.querySelector('[data-map-close]').onclick=()=>sheet.classList.remove('open');
    sheet.querySelector('[data-map-route]').onclick=()=>window.tmapSearch(f.search);
    sheet.querySelector('[data-map-detail]').onclick=()=>window.focusFestival(f.id);
    sheet.querySelector('[data-map-fav]').onclick=()=>{window.toggleFav(f.id);showSheet(f.id)};
  }
  function init(){
    if(map)return true;
    if(typeof maplibregl.supported==='function'&&!maplibregl.supported()){fallback();return false}
    try{map=new maplibregl.Map({container,style,center:[127.25,36.7],zoom:6.45,minZoom:5,maxZoom:18,attributionControl:false});}
    catch(e){fallback();return false}
    map.addControl(new maplibregl.NavigationControl({showCompass:false}),'bottom-right');map.addControl(new maplibregl.AttributionControl({compact:true}),'top-right');
    map.on('load',()=>{
      map.addSource('festivals',{type:'geojson',data:collection(festivals),cluster:true,clusterRadius:48,clusterMaxZoom:13});
      map.addLayer({id:'festival-clusters',type:'circle',source:'festivals',filter:['has','point_count'],paint:{'circle-color':'#17181b','circle-radius':['step',['get','point_count'],19,5,24,12,30],'circle-stroke-color':'#fff','circle-stroke-width':3}});
      map.addLayer({id:'festival-cluster-count',type:'symbol',source:'festivals',filter:['has','point_count'],layout:{'text-field':['get','point_count_abbreviated'],'text-size':13},paint:{'text-color':'#fff'}});
      map.addLayer({id:'festival-points',type:'circle',source:'festivals',filter:['!',['has','point_count']],paint:{'circle-color':['get','color'],'circle-radius':['interpolate',['linear'],['zoom'],6,8,13,12],'circle-stroke-color':'#fff','circle-stroke-width':3}});
      map.addLayer({id:'festival-labels',type:'symbol',source:'festivals',minzoom:10,filter:['!',['has','point_count']],layout:{'text-field':['get','name'],'text-size':12,'text-offset':[0,1.35],'text-anchor':'top','text-allow-overlap':false},paint:{'text-color':'#17181b','text-halo-color':'#fff','text-halo-width':2}});
      map.on('click','festival-clusters',e=>{const f=e.features?.[0],src=map.getSource('festivals');src.getClusterExpansionZoom(f.properties.cluster_id).then(z=>map.easeTo({center:f.geometry.coordinates,zoom:z}))});
      map.on('click','festival-points',e=>{const p=e.features?.[0]?.properties;if(p){showSheet(p.id);map.easeTo({center:e.features[0].geometry.coordinates,zoom:Math.max(map.getZoom(),11)})}});
      ['festival-clusters','festival-points'].forEach(id=>{map.on('mouseenter',id,()=>map.getCanvas().style.cursor='pointer');map.on('mouseleave',id,()=>map.getCanvas().style.cursor='')});
      renderMap(typeof filtered==='function'?filtered():festivals);
    });
    map.on('error',e=>{if(!map?.loaded()&&e?.error?.message?.includes('WebGL'))fallback()});
    return true;
  }
  window.renderMap=function(arr){
    const ids=arr.map(f=>f.id).sort((a,b)=>a-b).join(',');if(ids===lastIds)return;lastIds=ids;
    if(!map&& !init())return;
    const source=map?.getSource('festivals');if(source)source.setData(collection(arr));
    status.querySelector('span').textContent=`현재 조건 ${arr.length}개 · 확대하면 이름 표시`;
    if(selectedId&&!arr.some(f=>f.id===selectedId))sheet.classList.remove('open');
  };
  window.setMapZoom=z=>{if(map)map.easeTo({zoom:Math.max(5,Math.min(18,map.getZoom()+(Number(z)>1?1:-1)))})};
  window.resizeFestivalMap=()=>map?.resize();
  const mapNav=document.querySelector('.bottom-nav [data-bview="region"]');
  if(mapNav)mapNav.onclick=()=>{document.getElementById('mapSection')?.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>map?.resize(),350)};
  init();
})();
