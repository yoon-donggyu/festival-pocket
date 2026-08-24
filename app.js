// Festival Pocket loader: core app + additional festival dataset
(function(){
  const core=document.createElement('script');
  core.src='app-core.js?v=20260824-1';
  core.onload=function(){
    const extra=document.createElement('script');
    extra.src='festival-extra.js?v=20260824-1';
    document.body.appendChild(extra);
  };
  core.onerror=function(){console.error('Festival Pocket core load failed');};
  document.body.appendChild(core);
})();
