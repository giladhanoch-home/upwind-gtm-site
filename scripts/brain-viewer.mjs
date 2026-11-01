// Builds the read-only GTM Brain viewer (plain HTML, later sealed by build.mjs).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SKIP = new Set(['.git', '.github', 'site', 'node_modules']);
const SKIP_FILES = new Set(['.DS_Store', '.gitignore', 'brief.md']);

function walk(dir, root, out) {
  for (const n of readdirSync(dir).sort()) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) { if (!SKIP.has(n)) walk(p, root, out); continue; }
    if (SKIP_FILES.has(n) || !/\.(md|html)$/.test(n)) continue;
    out[relative(root, p).split('\\').join('/')] = readFileSync(p, 'utf8');
  }
  return out;
}

export function brainViewer(brainDir, { style, fonts, sprite, presentationUrl }) {
  const files = walk(brainDir, brainDir, {});
  const data = JSON.stringify(files).replace(/</g, '\\u003c');
  return `<title>Upwind GTM Brain · Gilad Hanoch</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fonts}
${style}
<style>
body{background:#fff}
.bv-top{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--line-2)}
.bv-top .in{display:flex;align-items:center;gap:16px;padding:14px 24px;max-width:1440px;margin:0 auto}
.bv-top .brand svg{height:24px;width:auto;color:var(--ink);display:block}
.bv-top .ttl{font:600 15px var(--f-sans);color:var(--ink);display:flex;align-items:center;gap:8px}
.bv-top .ttl i{width:1px;height:18px;background:var(--line);display:inline-block}
.bv-top .ttl small{font:500 12px var(--f-sans);color:var(--violet);background:var(--vio-bg);border:1px solid var(--vio-bd);border-radius:999px;padding:2px 9px}
.bv-top .back{margin-left:auto;font:600 13.5px var(--f-sans);color:#fff;background:var(--ink);border-radius:999px;padding:8px 16px;text-decoration:none}
.bv{display:grid;grid-template-columns:300px minmax(0,1fr);max-width:1440px;margin:0 auto;min-height:calc(100vh - 60px)}
.bv-side{border-right:1px solid var(--line-2);padding:18px 12px 40px;position:sticky;top:60px;height:calc(100vh - 60px);overflow:auto;background:#FAFBFD}
.bv-side .hint{font:500 12px var(--f-sans);color:var(--muted);padding:0 10px 12px;line-height:1.5}
.bv-tree{list-style:none;margin:0;padding:0}
.bv-tree ul{list-style:none;margin:0;padding-left:14px;border-left:1px solid var(--line-2);margin-left:9px}
.bv-tree .dir{font:600 12.5px var(--f-sans);color:var(--ink);padding:6px 8px 4px;display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none}
.bv-tree .dir::before{content:"▾";font-size:10px;color:var(--muted);width:10px;transition:transform .2s}
.bv-tree li.shut>.dir::before{transform:rotate(-90deg)}
.bv-tree li.shut>ul{display:none}
.bv-tree a{display:block;font:500 13px var(--f-sans);color:var(--text-2);text-decoration:none;padding:4px 8px;border-radius:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bv-tree a:hover{background:var(--soft);color:var(--ink)}
.bv-tree a.on{background:var(--vio-bg);color:var(--violet);font-weight:600}
.bv-main{padding:28px 48px 80px;min-width:0}
.bv-path{font:500 12.5px var(--f-mono);color:var(--muted);margin-bottom:14px;word-break:break-all}
.bv-path b{color:var(--ink);font-weight:500}
.bv-meta{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 18px}
.bv-meta span{font:500 12px var(--f-sans);color:var(--text-2);background:var(--soft);border:1px solid var(--line-2);border-radius:999px;padding:3px 10px}
.bv-meta span b{color:var(--ink);font-weight:600;margin-right:4px}
.md{max-width:880px;font:400 15.5px/1.7 var(--f-sans);color:var(--text-2)}
.md h1,.md h2,.md h3,.md h4{color:var(--ink);font-family:var(--f-sans);letter-spacing:-.01em;line-height:1.25}
.md h1{font-size:32px;font-weight:500;margin:0 0 18px}
.md h2{font-size:22px;font-weight:600;margin:34px 0 12px;padding-top:14px;border-top:1px solid var(--line-2)}
.md h3{font-size:17px;font-weight:600;margin:26px 0 8px}
.md h4{font-size:15px;font-weight:700;margin:20px 0 6px}
.md p{margin:0 0 12px}
.md ul,.md ol{margin:0 0 14px;padding-left:22px}
.md li{margin:3px 0}
.md strong{color:var(--ink)}
.md a{color:var(--blue);text-decoration:none;border-bottom:1px solid rgba(30,113,237,.3)}
.md a:hover{border-bottom-color:var(--blue)}
.md code{font:500 13px var(--f-mono);background:var(--soft);border:1px solid var(--line-2);border-radius:5px;padding:1px 5px;color:var(--ink)}
.md pre{background:#0F1729;color:#E6EAF2;border-radius:10px;padding:14px 16px;overflow:auto;margin:0 0 16px}
.md pre code{background:none;border:0;color:inherit;padding:0;font-size:12.5px}
.md table{border-collapse:collapse;width:100%;margin:6px 0 18px;font-size:14px;display:block;overflow-x:auto}
.md th,.md td{border:1px solid var(--line-2);padding:8px 10px;text-align:left;vertical-align:top}
.md th{background:var(--soft);color:var(--ink);font-weight:700}
.md blockquote{margin:0 0 14px;padding:8px 16px;border-left:3px solid var(--violet);background:var(--vio-bg);color:var(--ink);border-radius:0 8px 8px 0}
.md hr{border:0;border-top:1px solid var(--line-2);margin:24px 0}
.md .mermaid svg{max-width:100%;height:auto}
.md .mermaid .label,.md .mermaid .edgeLabel{font:400 14px var(--f-sans)!important;text-transform:none!important;letter-spacing:0!important;color:var(--ink)!important;padding:0!important}
.md td code{white-space:nowrap}
.md .mermaid{background:#fff;border:1px solid var(--line-2);border-radius:12px;padding:16px;margin:0 0 18px;overflow:auto;text-align:center}
.bv-html{width:100%;height:760px;border:1px solid var(--line-2);border-radius:12px;background:#fff}
.bv-tabs{display:flex;gap:8px;margin-bottom:12px}
.bv-tabs button{font:600 13px var(--f-sans);border:1px solid var(--line);background:#fff;border-radius:999px;padding:6px 14px;cursor:pointer;color:var(--text-2)}
.bv-tabs button.on{background:var(--ink);color:#fff;border-color:var(--ink)}
@media (max-width:860px){.bv{grid-template-columns:1fr}.bv-side{position:static;height:auto;border-right:0;border-bottom:1px solid var(--line-2)}.bv-main{padding:22px 18px 60px}.bv-top .ttl small{display:none}}
</style>
${sprite}
<div class="topline" aria-hidden="true"></div>
<header class="bv-top"><div class="in">
  <a class="brand" href="#/README.md" aria-label="Upwind GTM Brain home"><svg viewBox="0 0 217 66" aria-hidden="true"><use href="#logo"/></svg></a>
  <span class="ttl"><i></i>GTM Brain <small>16 skills · read-only</small></span>
  <a class="back" href="${presentationUrl}">← Presentation</a>
</div></header>
<div class="bv">
  <aside class="bv-side"><p class="hint">The source behind the presentation. Every rule lives in one markdown file that people and AI agents read from.</p><ul class="bv-tree" id="tree"></ul></aside>
  <main class="bv-main"><div class="bv-path" id="path"></div><div class="bv-meta" id="meta"></div><div id="doc" class="md"></div></main>
</div>
<script id="brain-files" type="application/json">${data}</script>
<script>${readFileSync(new URL('./vendor/marked.min.js', import.meta.url), 'utf8')}</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.9.1/mermaid.min.js"></script>
<script>
(function(){
  var F=JSON.parse(document.getElementById('brain-files').textContent),paths=Object.keys(F);
  var order=['README.md','CLAUDE.md','assignment','domains','references'];
  function rank(n){var i=order.indexOf(n);return i<0?99:i}
  var root={};paths.forEach(function(p){var parts=p.split('/'),n=root;parts.forEach(function(x,i){if(i===parts.length-1){(n.__f=n.__f||[]).push(p)}else{n[x]=n[x]||{};n=n[x]}})});
  function build(n,ul){
    var dirs=Object.keys(n).filter(function(k){return k!=='__f'}).sort(function(a,b){return rank(a)-rank(b)||a.localeCompare(b)});
    var files=(n.__f||[]).slice().sort(function(a,b){var x=a.split('/').pop(),y=b.split('/').pop();return rank(x)-rank(y)||x.localeCompare(y)});
    var put=function(p){var li=document.createElement('li'),a=document.createElement('a');a.href='#/'+p;a.dataset.p=p;var nm=p.split('/').pop();
      if(nm==='SKILL.md'){var seg=p.split('/');nm=seg[seg.length-2]+' / SKILL.md'}a.textContent=nm;a.title=p;li.appendChild(a);ul.appendChild(li)};
    if(ul===T){files.forEach(put)}
    dirs.forEach(function(d){var li=document.createElement('li'),s=document.createElement('div'),sub=document.createElement('ul');s.className='dir';s.textContent=d;
      s.addEventListener('click',function(){li.classList.toggle('shut')});li.appendChild(s);li.appendChild(sub);ul.appendChild(li);build(n[d],sub)});
    if(ul!==T){files.forEach(put)}
  }
  var T=document.getElementById('tree');build(root,T);
  if(window.mermaid){mermaid.initialize({startOnLoad:false,flowchart:{useMaxWidth:false,htmlLabels:true},theme:'base',themeVariables:{fontFamily:'Hanken Grotesk, sans-serif',primaryColor:'#F7F5FF',primaryBorderColor:'#9214C4',primaryTextColor:'#18202D',lineColor:'#6A7385',secondaryColor:'#EEF4FE',tertiaryColor:'#FFF4F1'}})}
  function norm(base,href){var parts=base.split('/');parts.pop();href.split('/').forEach(function(x){if(x==='..')parts.pop();else if(x&&x!=='.')parts.push(x)});return parts.join('/')}
  function front(src){var m=src.match(/^---\\n([\\s\\S]*?)\\n---\\n?/);if(!m)return{meta:null,body:src};var meta=[];m[1].split('\\n').forEach(function(l){var i=l.indexOf(':');if(i>0)meta.push([l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')])});return{meta:meta,body:src.slice(m[0].length)}}
  function esc(s){return s.replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var n=0;
  function show(p){if(!F[p])p='README.md';var src=F[p],doc=document.getElementById('doc'),meta=document.getElementById('meta');
    document.getElementById('path').innerHTML=esc(p.split('/').slice(0,-1).join(' / ')+(p.indexOf('/')>0?' / ':''))+'<b>'+esc(p.split('/').pop())+'</b>';
    [].forEach.call(T.querySelectorAll('a'),function(a){a.classList.toggle('on',a.dataset.p===p)});
    meta.innerHTML='';
    if(/\\.html$/.test(p)){doc.innerHTML='<div class="bv-tabs"><button class="on" data-v="pv">Preview</button><button data-v="src">Source</button></div><div id="hv"></div>';
      var hv=doc.querySelector('#hv');function pv(){hv.innerHTML='';var f=document.createElement('iframe');f.className='bv-html';f.setAttribute('sandbox','');f.srcdoc=src;hv.appendChild(f)}
      function sc(){hv.innerHTML='<pre><code>'+esc(src)+'</code></pre>'}pv();
      [].forEach.call(doc.querySelectorAll('.bv-tabs button'),function(b){b.addEventListener('click',function(){[].forEach.call(doc.querySelectorAll('.bv-tabs button'),function(x){x.classList.toggle('on',x===b)});b.dataset.v==='pv'?pv():sc()})});}
    else{var fm=front(src);if(fm.meta){meta.innerHTML=fm.meta.filter(function(m){return m[0]!=='description'}).map(function(m){return '<span><b>'+esc(m[0])+'</b>'+esc(m[1])+'</span>'}).join('');if(fm.meta.some(function(m){return m[0]==='description'})){var d=fm.meta.filter(function(m){return m[0]==='description'})[0][1];meta.innerHTML+='<span style="flex-basis:100%;border-radius:10px;background:var(--vio-bg);border-color:var(--vio-bd)"><b>description</b>'+esc(d)+'</span>'}}
      doc.innerHTML=window.marked?marked.parse(fm.body):'<pre>'+esc(fm.body)+'</pre>';
      [].forEach.call(doc.querySelectorAll('pre code.language-mermaid'),function(c){var dv=document.createElement('div');dv.className='mermaid';dv.id='mm'+(++n);dv.textContent=c.textContent;c.parentNode.replaceWith(dv)});
      [].forEach.call(doc.querySelectorAll('a[href]'),function(a){var h=a.getAttribute('href');if(/^(https?:|mailto:|#)/.test(h)){if(/^https?:/.test(h)){a.target='_blank';a.rel='noopener'}return}
        var t=norm(p,h.split('#')[0]);if(F[t])a.setAttribute('href','#/'+t);else if(F[t+'/SKILL.md'])a.setAttribute('href','#/'+t+'/SKILL.md');else{a.removeAttribute('href');a.style.borderBottom='0'}});
      if(window.mermaid){var ms=doc.querySelectorAll('.mermaid');if(ms.length)mermaid.run({nodes:ms}).catch(function(){})}}
    window.scrollTo(0,0);document.title=p.split('/').pop()+' · Upwind GTM Brain'}
  function route(){show(decodeURIComponent(location.hash.replace(/^#\\/?/,''))||'README.md')}
  window.addEventListener('hashchange',route);route();
})();
</script>
`;
}
