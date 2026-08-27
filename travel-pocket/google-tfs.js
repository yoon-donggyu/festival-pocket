// Local Google Flights tfs encoder. No SerpApi/API token is used.
(function(){
  const VARINT=0,LEN=2;
  function vi(v){const a=[];v=v>>>0;while(v>127){a.push((v&127)|128);v>>>=7}a.push(v&127);return a}
  function tag(n,w){return vi((n<<3)|w)}
  function str(n,v){const e=new TextEncoder().encode(v);return [...tag(n,LEN),...vi(e.length),...e]}
  function vf(n,v){return [...tag(n,VARINT),...vi(v)]}
  function msg(n,c){return [...tag(n,LEN),...vi(c.length),...c]}
  function airport(code){return str(2,code)}
  function leg(date,from,to){const b=[];b.push(...str(2,date));b.push(...msg(13,airport(from)));b.push(...msg(14,airport(to)));return b}
  function tfs(origin,dest,dep,ret){const b=[];b.push(...msg(3,leg(dep,origin,dest)));b.push(...msg(3,leg(ret,dest,origin)));b.push(...vf(8,1));b.push(...vf(9,1));b.push(...vf(19,1));let bin='';for(const x of new Uint8Array(b))bin+=String.fromCharCode(x);return btoa(bin)}
  window.freeGoogleUrl=function(d){const o=d.origin||'GMP',dest=d.destination||'CJU',dep=(d.departure_at||'').slice(0,10),ret=(d.return_at||'').slice(0,10);if(!dep||!ret)return 'https://www.google.com/travel/flights?hl=ko&curr=KRW';return `https://www.google.com/travel/flights/search?tfs=${encodeURIComponent(tfs(o,dest,dep,ret))}&hl=ko&curr=KRW&gl=kr`};
})();
