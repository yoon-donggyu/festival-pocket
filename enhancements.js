// Festival Pocket convenience features · compact action UI
(function(){
  'use strict';
  const KEY_STATUS='festivalPocket.visitStatus.v1';
  const KEY_NOTES='festivalPocket.notes.v1';
  const feature={today:false,free:false};
  const read=(k)=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch(e){return {}}};
  const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
  let visitStatus=read(KEY_STATUS);
  let notes=read(KEY_NOTES);
  let enhancing=false;
  let scheduled=false;

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
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  try{
    if(!window.__fpConvenienceFilteredPatched){
      const baseFiltered=filtered;
      filtered=function(){
        let arr=baseFiltered();
        if(feature.today)arr=arr.filter(isTodayFestival);
        if(feature.free)arr=arr.filter(isFree);
        return arr;
      };
      window.__fpConvenienceFilteredPatched=true;
    }
  }catch(e){console.warn('Festival Pocket filter extension unavailable',e);}

  function urgency(f){
    const now=localYmd();
    if(f.end<now)return '';
    if(f.start<=now&&f.end>=now){
      const left=dayDiff(now,f.end);
      if(left===0)return '오늘 종료';
      if(left<=3)return `종료 D-${left}`;
      return '오늘 진행';
    }
    return '';
  }

  function addFeatureStyles(){
    if(document.getElementById('fp-convenience-style'))return;
    const s=document.createElement('style');
    s.id='fp-convenience-style';
    s.textContent=`
      .fp-filter-row{display:flex;gap:6px;overflow-x:auto;flex-wrap:nowrap;scrollbar-width:none;margin:0 0 12px;padding-bottom:1px}
      .fp-filter-row::-webkit-scrollbar,.fp-action-strip::-webkit-scrollbar,.top-actions::-webkit-scrollbar,.choice-row::-webkit-scrollbar,.list-tools::-webkit-scrollbar{display:none}
      .fp-filter-row button{flex:0 0 auto;min-height:34px;border:0;border-radius:11px;padding:7px 10px;background:#fff;color:#555;font-size:10px;font-weight:800;box-shadow:none;white-space:nowrap}
      .fp-filter-row button.on{background:#111!important;color:#fff!important}

      .quick-actions.fp-action-strip{display:flex!important;align-items:center;gap:6px!important;overflow-x:auto;overflow-y:hidden;flex-wrap:nowrap!important;scrollbar-width:none;margin-top:9px!important;padding:1px 0 2px;-webkit-overflow-scrolling:touch}
      .quick-actions.fp-action-strip>button,
      .quick-actions.fp-action-strip .fp-status-row>button{flex:0 0 auto!important;min-height:34px!important;border-radius:10px!important;padding:7px 9px!important;font-size:10px!important;font-weight:800!important;line-height:1!important;white-space:nowrap!important;box-shadow:none!important}
      .fp-action-strip .fp-status-row{display:contents}
      .fp-status-row{display:flex;gap:6px;align-items:center;margin-top:8px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}
      .fp-status-row button{flex:0 0 auto;border:0;border-radius:10px;padding:7px 9px;min-height:34px;background:#f3f3f1;color:#555;font-size:10px;font-weight:800;white-space:nowrap}
      .fp-status-row button.on{background:#111!important;color:#fff!important}
      .fp-note-preview{width:100%;font-size:10px;color:#777;line-height:1.45;padding:5px 2px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .fp-urgency{display:inline-flex;margin-left:6px;padding:3px 6px;border-radius:999px;background:#111;color:#fff;font-size:9px;font-weight:850;vertical-align:1px}

      .top-actions,.choice-row,.list-tools{flex-wrap:nowrap!important;overflow-x:auto!important;scrollbar-width:none}
      .top-actions button,.choice-row button,.list-tools button{flex:0 0 auto;white-space:nowrap}

      @media(max-width:430px){
        .quick-actions.fp-action-strip{gap:5px!important}
        .quick-actions.fp-action-strip>button,
        .quick-actions.fp-action-strip .fp-status-row>button{min-height:33px!important;padding:7px 8px!important;font-size:10px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function ensureFilterButtons(){
    if(document.getElementById('fpFilterRow'))return;
    const grid=document.getElementById('grid');
    if(!grid||!grid.parentElement)return;
    const row=document.createElement('div');
    row.id='fpFilterRow';
    row.className='fp-filter-row';
    row.innerHTML='<button id="fpTodayBtn">오늘만 보기</button><button id="fpFreeBtn">무료만 보기</button>';
    grid.parentElement.insertBefore(row,grid);
    document.getElementById('fpTodayBtn').onclick=()=>{
      feature.today=!feature.today;
      document.getElementById('fpTodayBtn').classList.toggle('on',feature.today);
      renderListAndMap();
    };
    document.getElementById('fpFreeBtn').onclick=()=>{
      feature.free=!feature.free;
      document.getElementById('fpFreeBtn').classList.toggle('on',feature.free);
      renderListAndMap();
    };
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
    if(visitStatus[id]===status)delete visitStatus[id];else visitStatus[id]=status;
    write(KEY_STATUS,visitStatus);
    enhanceCards();
  }

  function editNote(id){
    const f=typeof festivals!=='undefined'?festivals.find(x=>x.id===id):null;
    const current=notes[id]||'';
    const v=prompt(`${f?f.name:'축제'} 메모`,current);
    if(v===null)return;
    const t=v.trim();
    if(t)notes[id]=t;else delete notes[id];
    write(KEY_NOTES,notes);
    enhanceCards();
  }

  window.fpSetVisit=setVisit;
  window.fpEditNote=editNote;

  function enhanceCards(){
    if(enhancing||typeof festivals==='undefined')return;
    enhancing=true;
    try{
      const festivalById=new Map(festivals.map(f=>[f.id,f]));
      document.querySelectorAll('article[id^="festival-"]').forEach(el=>{
        const id=Number(el.id.replace('festival-',''));
        const f=festivalById.get(id);
        if(!f)return;

        const meta=el.querySelector('.card-summary-meta');
        const u=urgency(f);
        if(meta){
          let badge=meta.querySelector('.fp-urgency');
          if(u){
            if(!badge){badge=document.createElement('span');badge.className='fp-urgency';meta.appendChild(badge);}
            if(badge.textContent!==u)badge.textContent=u;
          }else if(badge){badge.remove();}
        }

        const quick=el.querySelector('.quick-actions');
        if(quick)quick.classList.add('fp-action-strip');

        let row=el.querySelector('.fp-status-row');
        if(!row){
          row=document.createElement('div');
          row.className='fp-status-row';
          if(quick)quick.appendChild(row);else el.appendChild(row);
        }else if(quick&&row.parentElement!==quick){
          quick.appendChild(row);
        }

        const embeddedPreview=row.querySelector('.fp-note-preview');
        if(embeddedPreview)embeddedPreview.remove();

        const st=visitStatus[id]||'';
        const note=notes[id]||'';
        const sig=`${st}|${note}`;
        if(row.dataset.fpSig!==sig||row.querySelectorAll('button').length!==3){
          row.dataset.fpSig=sig;
          row.innerHTML=`
            <button class="${st==='plan'?'on':''}" onclick="event.stopPropagation();fpSetVisit(${id},'plan')">갈 예정</button>
            <button class="${st==='done'?'on':''}" onclick="event.stopPropagation();fpSetVisit(${id},'done')">다녀옴</button>
            <button onclick="event.stopPropagation();fpEditNote(${id})">${note?'메모 수정':'내 메모'}</button>`;
        }

        let preview=el.querySelector('.fp-note-preview');
        if(note){
          if(!preview){
            preview=document.createElement('div');
            preview.className='fp-note-preview';
            if(quick)quick.insertAdjacentElement('afterend',preview);else row.insertAdjacentElement('afterend',preview);
          }
          preview.innerHTML=esc(note);
        }else if(preview){
          preview.remove();
        }
      });
      applyFallbackFilter();
    }finally{
      enhancing=false;
    }
  }

  function scheduleEnhance(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      ensureFilterButtons();
      enhanceCards();
    });
  }

  addFeatureStyles();
  ensureFilterButtons();
  enhanceCards();

  const grid=document.getElementById('grid');
  if(grid){
    const mo=new MutationObserver(mutations=>{
      if(enhancing)return;
      if(mutations.some(m=>m.type==='childList'&&m.target===grid))scheduleEnhance();
    });
    mo.observe(grid,{childList:true,subtree:false});
  }
  document.addEventListener('fp:list-rendered',scheduleEnhance);
})();
