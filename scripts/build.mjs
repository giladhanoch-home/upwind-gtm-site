// Builds the public index.html: a welcome gate that looks like the hero, with the full
// presentation inside it, encrypted with the content key (AES-GCM).
// Usage: CONTENT_KEY=... node scripts/build.mjs <path-to-presentation.html>
// The plain presentation never goes into this repo.
import { readFileSync, writeFileSync } from 'node:fs';
import { seal } from './crypto.mjs';
import { brainViewer } from './brain-viewer.mjs';

const src = process.argv[2], brainDir = process.argv[3], ck = process.env.CONTENT_KEY;
if (!src || !brainDir || !ck) { console.error('Usage: CONTENT_KEY=... node scripts/build.mjs page.html path/to/brain'); process.exit(1); }
const page = readFileSync(src, 'utf8');

const between = (s, a, b, from = 0) => { const i = s.indexOf(a, from); if (i < 0) throw new Error('not found: ' + a); const j = s.indexOf(b, i + a.length); if (j < 0) throw new Error('not found: ' + b); return s.slice(i, j + b.length); };
const style = between(page, '<style>', '</style>');
const fonts = page.match(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]+>/)[0];
const sprite = between(page, '<svg width="0" height="0"', '</svg>');
let hero = between(page, '<section class="hero"', '</section>');
hero = hero.replace(/<a class="brain-link"[\s\S]*?<\/a>\s*/, '');
hero = hero.replace(/<div class="ctas">[\s\S]*?<\/div>/, `<form class="gate" id="gate" autocomplete="off" novalidate>
          <label class="gate-sr" for="pw">Password</label>
          <div class="gate-row"><input id="pw" name="pw" type="password" placeholder="Enter the password" autocomplete="current-password" required><button class="btn light" type="submit" id="gbtn">Enter →</button></div>
          <p class="gate-msg" id="gmsg" role="status" aria-live="polite"></p>
        </form>`);
const waveStart = page.indexOf('/* ---------- hero wave ---------- */');
const waveEnd = page.indexOf('})();\n</script>', waveStart);
const wave = page.slice(waveStart, waveEnd);

const head = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">`;


const gateCss = `<style>
.gate{margin-top:24px;display:flex;flex-direction:column;align-items:center;gap:10px}
.gate-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.gate-row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.gate input{font:500 15px var(--f-sans);color:#fff;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.35);border-radius:10px;padding:11px 16px;width:260px;outline:none;backdrop-filter:blur(6px);transition:border-color .2s,background .2s}
.gate input::placeholder{color:rgba(255,255,255,.65)}
.gate input:focus{border-color:#fff;background:rgba(255,255,255,.16)}
.gate .btn{cursor:pointer;border:0;background:#fff;color:#101B3A;border-radius:10px;padding:11px 22px;font:600 15px var(--f-sans);transition:transform .15s,box-shadow .2s}
.gate .btn:hover{transform:translateY(-1px);box-shadow:0 8px 22px rgba(0,0,0,.25)}
.gate .btn[disabled]{opacity:.7;cursor:progress}
.gate-msg{min-height:20px;font-size:14px;color:#FFD0C4}
.gate.bad .gate-row{animation:gshake .35s}
@keyframes gshake{25%{transform:translateX(-6px)}50%{transform:translateX(6px)}75%{transform:translateX(-3px)}}
.nav .menu{display:none}
body.unlocking .hero-in{opacity:.4;transition:opacity .3s}
</style>`;

const gateJs = `<script>
(function(){
  var S=window.crypto&&crypto.subtle,F=document.getElementById('gate'),I=document.getElementById('pw'),B=document.getElementById('gbtn'),M=document.getElementById('gmsg'),D=document.getElementById('sealed');
  var LS='upwind-gtm-access';
  function u8(b){var s=atob(b),a=new Uint8Array(s.length);for(var i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return a}
  function b64(a){var s='';for(var i=0;i<a.length;i+=8192)s+=String.fromCharCode.apply(null,a.subarray(i,i+8192));return btoa(s)}
  function get(){try{return JSON.parse(localStorage.getItem(LS)||'null')}catch(e){return null}}
  function put(v){try{localStorage.setItem(LS,JSON.stringify(v))}catch(e){}}
  function forget(){try{localStorage.removeItem(LS)}catch(e){}}
  var K=null;
  function keyJson(){if(K)return Promise.resolve(K);return fetch('key.json?t='+Date.now(),{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('key');return r.json()}).then(function(j){K=j;return j})}
  function unwrap(pw,k){return S.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']).then(function(base){
      return S.deriveKey({name:'PBKDF2',salt:u8(k.salt),iterations:k.iter,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['decrypt'])})
    .then(function(pk){return S.decrypt({name:'AES-GCM',iv:u8(k.iv)},pk,u8(k.wrapped))}).then(function(raw){return new Uint8Array(raw)})}
  function open(raw,v){return S.importKey('raw',raw,'AES-GCM',false,['decrypt']).then(function(ck){
      return S.decrypt({name:'AES-GCM',iv:u8(D.getAttribute('data-iv'))},ck,u8(D.textContent.trim()))})
    .then(function(buf){var html=new TextDecoder().decode(buf);put({v:v,k:b64(raw)});var h=location.hash;
      document.open();document.write(html);document.close();
      if(h){setTimeout(function(){var t=document.getElementById(h.slice(1));if(t)t.scrollIntoView()},300)}})}
  function msg(t,bad){M.textContent=t;F.classList.toggle('bad',!!bad);if(bad)setTimeout(function(){F.classList.remove('bad')},400)}
  if(!S){msg('This browser can’t open the page. Try a recent Chrome, Safari, Edge or Firefox.',true);B.disabled=true;return}
  keyJson().then(function(k){var r=get();if(r&&r.v===k.v&&r.k){document.body.classList.add('unlocking');return open(u8(r.k),k.v).catch(function(){forget();document.body.classList.remove('unlocking')})}if(r)forget()}).catch(function(){});
  setTimeout(function(){if(!document.body.classList.contains('unlocking'))I.focus()},50);
  F.addEventListener('submit',function(e){e.preventDefault();var pw=I.value;if(!pw){msg('Enter the password to continue.',true);return}
    B.disabled=true;msg('Opening…');document.body.classList.add('unlocking');
    keyJson().then(function(k){return unwrap(pw,k).then(function(raw){return open(raw,k.v)})})
      .catch(function(){B.disabled=false;document.body.classList.remove('unlocking');msg('That password didn’t work. Try again.',true);I.select()})});
})();
</script>`;

async function gate(inner, title) {
const sealed = await seal(head + '\n' + inner + '\n</html>\n', ck);
return `${head}
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fonts}
${style}
${gateCss}
</head>
<body>
${sprite}
<div class="topline" aria-hidden="true"></div>
<header class="nav" id="nav"><div class="wrap nav-in"><a class="brand" href="./" aria-label="Upwind"><svg viewBox="0 0 217 66" aria-hidden="true"><use href="#logo"/></svg></a></div></header>
<main id="top">
${hero}
</main>
<script type="application/octet-stream" id="sealed" data-iv="${sealed.iv}">
${sealed.ct}
</script>
<script>
(function(){
${wave}
})();
</script>
${gateJs}
</body>
</html>
`;
}
const site = 'https://giladhanoch-home.github.io/upwind-gtm-site/';
const outs = {
  'index.html': await gate(page, 'Upwind MOps Home Assignment · Gilad Hanoch'),
  'brain.html': await gate(brainViewer(brainDir, { style, fonts, sprite, presentationUrl: './' }), 'Upwind GTM Brain · Gilad Hanoch'),
};
for (const [f, html] of Object.entries(outs)) {
  writeFileSync(new URL('../' + f, import.meta.url), html);
  console.log(f, 'written:', (html.length / 1024).toFixed(0) + ' KB');
}
