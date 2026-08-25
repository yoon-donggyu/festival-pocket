// Festival Pocket loader: force light appearance + manual-only weather loading
(function(){
  const style=document.createElement('style');
  style.id='festival-pocket-force-light';
  style.textContent=`
    :root{color-scheme:light !important;--bg:#f5f5f3 !important;--card:#fff !important;--card2:#f7f7f5 !important;--text:#121212 !important;--muted:#777775 !important;--line:rgba(17,17,17,.09) !important;}
    html,body{color-scheme:light !important;background:#f5f5f3 !important;color:#121212 !important;}
    body{background:#f5f5f3 !important;color:#121212 !important;}
    .hero h1,.head h2,.rec-card h3,.mini-event h4,.month-item b,.map-info h4,.cover h3,.summary b,.metric b,.weather-condition,.event-day-box .main,.pick-title{color:#121212 !important;}
    .hero p,.subtle,.head small,.summary span,.mini-event p,.pref-title,.pref-result,.month-item span,.info-line,.pick-meta,.weather-updated,.event-day-box .sub,.weather-source{color:#777775 !important;}
    .summary,.pill,.search,.icon-btn,.mini-event,.pref-card,.month-card,.map-shell,.card,.empty,.selection-sheet,.map-info,.map-title,.map-tools button,.rec-card{background:#fff !important;color:#121212 !important;border-color:rgba(17,17,17,.08) !important;}
    .sticky{background:rgba(245,245,243,.88) !important;border-bottom:1px solid rgba(17,17,17,.06) !important;}
    .seg{background:rgba(118,118,128,.12) !important;border-color:transparent !important;}
    .seg button{background:transparent !important;color:#6f6f74 !important;}
    .seg button.on,.chip.on,.choice.on,.pill.primary,.pill.blue,.rec-actions button.main,.card-actions .tmap,.quick-actions .primary,.list-tools button.active,.sheet-actions .apply,.bottom-nav button.on{background:#111 !important;color:#fff !important;}
    .chip,.choice,.badge,.score-box,.parking,.card-actions button,.card-actions a,.more-actions button,.card-toggle,.quick-actions button,.list-tools button,.sheet-head button,.sheet-actions button,.sheet-search input,.kma-badge,.hour-cell,.event-day-box,.weather-warning{background:#f3f3f1 !important;color:#555 !important;border-color:rgba(17,17,17,.06) !important;}
    .metric,.weather-stat{background:#fff !important;color:#121212 !important;}
    .cover{background:#f1f1ef !important;color:#111 !important;border-color:rgba(17,17,17,.06) !important;}
    .cover h3,.cover .line-icon,.line-icon{color:#151515 !important;}
    .cover .heart{background:#fff !important;color:#6f6f6c !important;}.cover .heart.on{background:#111 !important;color:#fff !important;}
    .live-weather,.weather,.weather.good,.weather.warn{background:#f6f6f4 !important;color:#575754 !important;border-color:rgba(17,17,17,.06) !important;}
    .warnbox{background:#fff2f3 !important;color:#92424b !important;}.parking{background:#f7f7f9 !important;color:#5e5e64 !important;}
    .map-panel{background:#f0f1ef !important;}.land{fill:#e3e5e2 !important;stroke:#a8aba6 !important;}.road{stroke:#d2d4d0 !important;}.river{stroke:#b8c5cf !important;}.label{fill:#777b76 !important;}
    .map-info-actions button{background:#f2f2f7 !important;color:#121212 !important;}.map-info-actions .go{background:#111 !important;color:#fff !important;}
    .selection-sheet{border-top:1px solid rgba(17,17,17,.08) !important;}.sheet-head{border-bottom-color:rgba(17,17,17,.08) !important;}.sheet-handle{background:#d0d0cf !important;}
    .bottom-nav{background:rgba(255,255,255,.92) !important;border-color:rgba(255,255,255,.98) !important;box-shadow:0 12px 38px rgba(0,0,0,.14) !important;}.bottom-nav button{background:transparent !important;color:#8e8e93 !important;}
    input,select,textarea,button{color-scheme:light !important;}
  `;
  document.head.appendChild(style);

  // Prevent the weather IntersectionObserver from making network requests automatically.
  const NativeIntersectionObserver=window.IntersectionObserver;
  if(NativeIntersectionObserver){
    window.IntersectionObserver=function(callback,options){
      const io=new NativeIntersectionObserver((entries,observer)=>{
        const keep=entries.filter(en=>!(en.target&&en.target.dataset&&en.target.dataset.weatherId));
        if(keep.length) callback(keep,observer);
      },options);
      const nativeObserve=io.observe.bind(io);
      io.observe=function(target){
        if(target&&target.dataset&&target.dataset.weatherId) return;
        return nativeObserve(target);
      };
      return io;
    };
    window.IntersectionObserver.prototype=NativeIntersectionObserver.prototype;
  }

  const core=document.createElement('script');
  core.src='app-core.js?v=20260825-manualweather1';
  core.onload=function(){
    // Future renders must also avoid automatic weather loading.
    try{
      window.setupWeatherObserver=function(){};
      window.loadWeather=function(f){
        const sum=document.querySelector('#weather-summary-'+f.id);
        if(sum){
          sum.className='weather-summary';
          sum.innerHTML='<span class="weather-dot"></span><span>날씨는 「날씨 새로고침」으로 확인</span>';
        }
        const det=document.querySelector('#weather-detail-'+f.id);
        if(det) det.innerHTML='<div class="event-forecast">실시간 날씨는 상단 「날씨 새로고침」을 눌러 확인하세요.</div>';
        return Promise.resolve(null);
      };
      document.querySelectorAll('[data-weather-id]').forEach(el=>{
        el.className='weather-summary';
        el.innerHTML='<span class="weather-dot"></span><span>날씨는 「날씨 새로고침」으로 확인</span>';
      });
    }catch(e){console.warn('manual weather mode setup failed',e);}

    const extra=document.createElement('script');
    extra.src='festival-extra.js?v=20260825-manualweather1';
    document.body.appendChild(extra);
  };
  core.onerror=function(){console.error('Festival Pocket core load failed');};
  document.body.appendChild(core);
})();
