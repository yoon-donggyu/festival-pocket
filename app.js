// Festival Pocket loader: force light mode + core app + additional festival dataset
(function(){
  // Keep the site bright even when the phone/browser uses dark mode.
  let meta=document.querySelector('meta[name="color-scheme"]');
  if(!meta){
    meta=document.createElement('meta');
    meta.name='color-scheme';
    document.head.appendChild(meta);
  }
  meta.content='light';

  const light=document.createElement('link');
  light.rel='stylesheet';
  light.href='light-mode.css?v=20260825-1';
  document.head.appendChild(light);

  const core=document.createElement('script');
  core.src='app-core.js?v=20260825-1';
  core.onload=function(){
    const extra=document.createElement('script');
    extra.src='festival-extra.js?v=20260825-1';
    document.body.appendChild(extra);
  };
  core.onerror=function(){console.error('Festival Pocket core load failed');};
  document.body.appendChild(core);
})();
