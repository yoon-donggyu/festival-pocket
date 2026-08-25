// Festival Pocket convenience features · 2026-08-25
(function(){
  const KEY_STATUS='festivalPocket.visitStatus.v1';
  const KEY_NOTES='festivalPocket.notes.v1';
  const feature={today:false,free:false};
  const read=(k)=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch(e){return {}}};
  const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
  let visitStatus=read(KEY_STATUS);
  let notes=read(KEY_NOTES);

  const localYmd=()=>{
    const d=new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };
  const ymdDate=s=>{
    const [y,m,d]=String(s).split('-').map(Number);
    return new Date(y,m-1,d,12,0,0,0);
  };
  const dayDiff=(a,b)=>Math.round((ymdDate(b)-ymdDate(a))/86400000);
  const isTodayFestival=f=>f.start<=localYmd()&&f.end>=localYmd();
  const isFree=f=>/무료/.test(String(f.fee||''));

  // Apply the new filters to the app's existing filtering pipeline so list + map stay synchronized.
  try{
    const baseFiltered=filtered;
    filtered=function(){
      let arr=baseFiltered();
      if(feature.today) arr=arr.filter(isTodayFestival);
      if(feature.free) arr=arr.filter(isFree);
      return arr;
    };
  }catch(e){console.warn('Festival Pocket filter extension unavailable',e);}

  function urgency(f){
    const now=localYmd();
    if(f.end<now) return '';
    if(f.start<=now&&f.end>=now){
      const left=dayDiff(now,f.end);
      if(left===0) return '오늘 종료';
      if(left<=3) return `종료 D-${left}`;
      return '오늘 진행';
    }
    return '';
  }

  function addFeatureStyles(){
    if(document.getElementById('fp-convenience-style')) return;
    const s=document.createElement('style');
    s.id='fp-convenience-style';
    s.textContent=`
      .fp-filter-row{display:flex;gap:7px;overflow:auto;scrollbar-width:none;margin:0 0 12px}.fp-filter-row::-webkit-scrollbar{display:none}
      .fp-filter-row button{flex:0 0 auto;border:0;border-radius:999px;padding:9px 12px;background:#fff;color:#555;font-size:11px;font-weight:800;box-shadow:0 4px 14px rgba(0,0,0,.04)}
      .fp-filter-row button.on{background:#111!important;color:#fff!important}
      .fp-status-row{display:flex;gap:7px;align-items:center;margin-top:8px;flex-wrap:wrap}
      .fp-status-row button{border:0;border-radius:11px;padding:8px 10px;background:#f3f3f1;color:#555;font-size:10px;font-weight:800}
      .fp-status-row button.on{background:#111!important;color:#fff!important}
      .fp-note-preview{width:100%;font-size:10px;color:#777;line-height:1.45;padding:2px 2px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .fp-urgency{display:inline-flex;margin-left:6px;padding:3px 6px;border-radius:999px;background:#111;color:#fff;font-size:9px;font-weight:850;vertical-align:1px}
    `;
    document.head.appendChild(s);
  }

  function ensureFilterButtons(){
    if(document.getElementById('fpFilterRow')) return;
    const grid=document.getElementById('grid');
    if(!grid||!grid.parentElement) return;
    const row=document.createElement('div');
    row.id='fpFilterRow';
    row.className='fp-filter-row';
    row.innerHTML=`<button id="fpTodayBtn">오늘만 보기</button><button id="fpFreeBtn">무료만 보기</button>`;
    grid.parentElement.insertBefore(row,grid);
    const todayBtn=document.getElementById('fpTodayBtn');
    const freeBtn=document.getElementById('fpFreeBtn');
    todayBtn.onclick=()=>{feature.today=!feature.today;todayBtn.classList.toggle('on',feature.today);try{renderListAndMap()}catch(e){applyFallbackFilter()}};
    freeBtn.onclick=()=>{feature.free=!feature.free;freeBtn.classList.toggle('on',feature.free);try{renderListAndMap()}catch(e){applyFallbackFilter()}};
  }

  function applyFallbackFilter(){
    document.querySelectorAll('article[id^="festival-"]').forEach(el=>{
      const id=Number(el.id.replace('festival-',''));
      const f=typeof festivals!=='undefined'?festivals.find(x=>x.id===id):null;
      if(!f)return;
      el.style.display=((!feature.today||isTodayFestival(f))&&(!feature.free||isFree(f)))?'':'none';
    });
  }

  function setVisit(id,status){
    if(visitStatus[id]===status) delete visitStatus[id]; else visitStatus[id]=status;
    write(KEY_STATUS,visitStatus);
    enhanceCards();
  }
  function editNote(id){
    const f=typeof festivals!=='undefined'?festivals.find(x=>x.id===id):null;
    const current=notes[id]||'';
    const v=prompt(`${f?f.name:'축제'} 메모`,current);
    if(v===null)return;
    const t=v.trim();
    if(t) notes[id]=t; else delete notes[id];
    write(KEY_NOTES,notes);
    enhanceCards();
  }
  window.fpSetVisit=setVisit;
  window.fpEditNote=editNote;

  function enhanceCards(){
    if(typeof festivals==='undefined') return;
    document.querySelectorAll('article[id^="festival-"]').forEach(el=>{
      const id=Number(el.id.replace('festival-',''));
      const f=festivals.find(x=>x.id===id);
      if(!f)return;
      const meta=el.querySelector('.card-summary-meta');
      const u=urgency(f);
      if(meta){
        const old=meta.querySelector('.fp-urgency'); if(old)old.remove();
        if(u){const b=document.createElement('span');b.className='fp-urgency';b.textContent=u;meta.appendChild(b);}
      }
      let row=el.querySelector('.fp-status-row');
      if(!row){
        row=document.createElement('div');row.className='fp-status-row';
        const quick=el.querySelector('.quick-actions');
        if(quick)quick.insertAdjacentElement('afterend',row);else el.appendChild(row);
      }
      const st=visitStatus[id]||'';
      const note=notes[id]||'';
      row.innerHTML=`
        <button class="${st==='plan'?'on':''}" onclick="event.stopPropagation();fpSetVisit(${id},'plan')">갈 예정</button>
        <button class="${st==='done'?'on':''}" onclick="event.stopPropagation();fpSetVisit(${id},'done')">다녀옴</button>
        <button onclick="event.stopPropagation();fpEditNote(${id})">${note?'메모 수정':'내 메모'}</button>
        ${note?`<div class="fp-note-preview">${note.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</div>`:''}`;
    });
    applyFallbackFilter();
  }

  addFeatureStyles();
  ensureFilterButtons();
  enhanceCards();
  const grid=document.getElementById('grid');
  if(grid){
    const mo=new MutationObserver(()=>{ensureFilterButtons();enhanceCards();});
    mo.observe(grid,{childList:true,subtree:true});
  }
})();
