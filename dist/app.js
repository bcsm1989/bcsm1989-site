(()=>{
// Languages: Thai (default), English, Chinese (Simplified), Japanese.
// Priority: ?lang= in the address > the visitor's saved choice > a Chinese or Japanese browser > Thai.
const LANGS=['th','en','zh','ja'];
const root=document.documentElement;
let lang='th';
try{const saved=localStorage.getItem('bcsm-lang');if(LANGS.includes(saved))lang=saved;else{const pref=(navigator.languages||[navigator.language||''])[0].toLowerCase();if(pref.startsWith('zh'))lang='zh';else if(pref.startsWith('ja'))lang='ja';}}catch{}
const q=new URLSearchParams(location.search).get('lang');if(LANGS.includes(q))lang=q;
root.lang=lang;
const pick=(o,l=root.lang)=>o[l]??o.en;
const STATUS={th:n=>`แสดง ${n} ภาพ`,en:n=>`Showing ${n} photographs`,zh:n=>`显示 ${n} 张照片`,ja:n=>`${n}枚の写真を表示中`};
const cap=l=>l.charAt(0).toUpperCase()+l.slice(1);
document.addEventListener('DOMContentLoaded',()=>{
const langBtn=document.getElementById('langBtn'),langMenu=document.getElementById('langMenu'),menu=document.getElementById('menuBtn'),nav=document.getElementById('mainNav');
const filters=[...document.querySelectorAll('[data-filter]')],items=[...document.querySelectorAll('.gallery-item')],dialog=document.getElementById('galleryDialog'),modalImg=document.getElementById('modalImg'),caption=document.getElementById('modalCaption');let current=0,lastFocus=null;
const sceneButtons=[...document.querySelectorAll('[data-render]')],sceneImage=document.getElementById('designRender');
function sceneAlt(b){return b.dataset['alt'+cap(root.lang)]||b.dataset.altEn}
function updateCaption(){if(!items.length||!caption)return;const item=items[current];const text=item.dataset[root.lang]||item.dataset.en;caption.textContent=text;modalImg.alt=text}
function updateStatus(){const status=document.getElementById('galleryStatus');if(status&&filters.length)status.textContent=pick(STATUS)(items.filter(i=>!i.hidden).length)}
function setLang(l,save){
  if(!LANGS.includes(l))return;root.lang=l;
  if(save){try{localStorage.setItem('bcsm-lang',l)}catch{}}
  const title=document.querySelector(`meta[name="bcsm:title:${l}"]`);if(title)document.title=title.content;
  langMenu?.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-current',String(b.dataset.lang===l)));
  const pressed=sceneButtons.find(b=>b.getAttribute('aria-pressed')==='true');if(pressed&&sceneImage)sceneImage.alt=sceneAlt(pressed);
  updateCaption();if(document.getElementById('galleryStatus')?.textContent)updateStatus();
  document.dispatchEvent(new CustomEvent('bcsm:lang',{detail:l}));
}
// Language menu
const closeLang=(focus)=>{if(!langMenu||langMenu.hidden)return;langMenu.hidden=true;langBtn.setAttribute('aria-expanded','false');if(focus)langBtn.focus()};
langBtn?.addEventListener('click',e=>{e.stopPropagation();const open=langMenu.hidden;langMenu.hidden=!open;langBtn.setAttribute('aria-expanded',String(open));if(open)(langMenu.querySelector('[aria-current=true]')||langMenu.querySelector('button'))?.focus()});
langMenu?.addEventListener('click',e=>{const b=e.target.closest('[data-lang]');if(!b)return;setLang(b.dataset.lang,true);closeLang(true)});
langMenu?.addEventListener('keydown',e=>{const opts=[...langMenu.querySelectorAll('button')],i=opts.indexOf(document.activeElement);if(e.key==='ArrowDown'){e.preventDefault();opts[(i+1)%opts.length].focus()}if(e.key==='ArrowUp'){e.preventDefault();opts[(i-1+opts.length)%opts.length].focus()}if(e.key==='Tab')closeLang(false)});
// Mobile navigation
const closeMenu=()=>{nav?.classList.remove('open');menu?.setAttribute('aria-expanded','false')};
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});
nav?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();closeLang(true)}});
document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();if(!e.target.closest('.lang-switch'))closeLang(false)});
window.matchMedia('(min-width:1001px)').addEventListener('change',e=>{if(e.matches)closeMenu()});
// Day / evening rendering
sceneButtons.forEach(b=>b.addEventListener('click',()=>{sceneButtons.forEach(other=>other.setAttribute('aria-pressed',String(other===b)));sceneImage.src=b.dataset.render;sceneImage.alt=sceneAlt(b)}));
// Gallery
filters.forEach(filter=>filter.addEventListener('click',()=>{filters.forEach(f=>f.setAttribute('aria-pressed',String(f===filter)));items.forEach(item=>item.hidden=filter.dataset.filter!=='all'&&item.dataset.category!==filter.dataset.filter);updateStatus()}));
function show(index){if(!dialog)return;current=(index+items.length)%items.length;modalImg.src=items[current].dataset.src;updateCaption()}
items.forEach((item,index)=>item.addEventListener('click',()=>{lastFocus=item;show(index);dialog.showModal();document.body.style.overflow='hidden'}));document.getElementById('modalClose')?.addEventListener('click',()=>dialog.close());document.getElementById('modalPrev')?.addEventListener('click',()=>show(current-1));document.getElementById('modalNext')?.addEventListener('click',()=>show(current+1));dialog?.addEventListener('close',()=>{document.body.style.overflow='';lastFocus?.focus()});dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});dialog?.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();show(current-1)}if(e.key==='ArrowRight'){e.preventDefault();show(current+1)}});
setLang(root.lang,false);
});})();
