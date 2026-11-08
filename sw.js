const C='mmomap-v4';
const FONTS='https://fonts.googleapis.com/css2?family=Poppins:wght@500;600&family=Roboto:wght@400;500&display=swap';
const A=['./','index.html','manifest.webmanifest','https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'];
async function cacheFonts(c){
  try{
    const r=await fetch(FONTS);await c.put(FONTS,r.clone());
    const css=await r.text();
    const urls=css.split('/* ').filter(b=>/^latin(-ext)? \*\//.test(b)).flatMap(b=>[...b.matchAll(/url\((https:[^)]+)\)/g)].map(m=>m[1]));
    await Promise.all(urls.map(u=>c.add(u).catch(()=>{})));
  }catch(e){}
}
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(async c=>{await c.addAll(A);await cacheFonts(c)}).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url),same=u.origin===location.origin,font=/^fonts\.(googleapis|gstatic)\.com$/.test(u.host);
  e.respondWith(caches.match(e.request,{ignoreSearch:same}).then(r=>r||fetch(e.request).then(res=>{
    if(font&&res.ok){const copy=res.clone();caches.open(C).then(c=>c.put(e.request,copy))}
    return res;
  })));
});
