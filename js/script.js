/* ===== ЗВУК (Web Audio, без файлов) ===== */
let actx=null, soundOn=true;
function beep(freq=440,dur=0.07,type="square",vol=0.04){
  if(!soundOn) return;
  try{
    actx = actx || new (window.AudioContext||window.webkitAudioContext)();
    const o=actx.createOscillator(), g=actx.createGain();
    o.type=type; o.frequency.value=freq; g.gain.value=vol;
    o.connect(g); g.connect(actx.destination); o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime+dur);
    o.stop(actx.currentTime+dur);
  }catch(e){}
}
const clickSnd=()=>beep(220,0.05,"square");
const errSnd =()=>{beep(180,0.12,"sawtooth");setTimeout(()=>beep(120,0.18,"sawtooth"),110);};
const openSnd=()=>{beep(520,0.05);setTimeout(()=>beep(680,0.06),60);};
document.getElementById("snd").addEventListener("click",function(){
  soundOn=!soundOn; this.textContent = soundOn ? "ЗВУК: ВКЛ" : "ЗВУК: ВЫКЛ"; if(soundOn) openSnd();
});

/* ===== ПЕРЕТАСКИВАНИЕ (окна за заголовок, папка целиком) ===== */
let z=300;
function makeDraggable(el, handle){
  let sx,sy,ox,oy,drag=false;
  handle.addEventListener("pointerdown",e=>{
    if(e.target.classList.contains("x")||e.target.classList.contains("ok")) return;
    drag=true; el.classList.add("dragging"); el.style.zIndex=100+(++z%90);
    sx=e.clientX; sy=e.clientY;
    const r=el.getBoundingClientRect(); ox=r.left; oy=r.top;
    el.style.position="fixed"; el.style.left=ox+"px"; el.style.top=oy+"px"; el.style.right="auto"; el.style.bottom="auto";
    handle.setPointerCapture(e.pointerId); clickSnd();
  });
  handle.addEventListener("pointermove",e=>{ if(!drag) return;
    el.style.left=(ox+e.clientX-sx)+"px"; el.style.top=(oy+e.clientY-sy)+"px"; });
  const stop=()=>{ if(drag){drag=false; el.classList.remove("dragging");} };
  handle.addEventListener("pointerup",stop); handle.addEventListener("pointercancel",stop);
}
document.querySelectorAll(".win").forEach(w=>makeDraggable(w, w.querySelector(".bar")));
document.querySelectorAll(".folder").forEach(f=>{
  if(f.id==="about-folder"){ dragWithin(f,f); } else { makeDraggable(f,f); }
  let last=0;
  f.addEventListener("pointerup",()=>{ const now=Date.now();
    if(now-last<350){ if(f.id==="about-folder"){ openAboutInfo(); } else { openChildhood(); } } last=now; });
});

/* двойной клик по папке -> окошко */
function spawnInfo(name){
  const w=document.createElement("div"); w.className="win";
  w.style.cssText=`left:${280+Math.random()*260}px;top:${260+Math.random()*120}px;width:240px;z-index:${100+(++z%90)};`;
  w.innerHTML=`<div class="bar"><span>${name}</span><span class="x">✕</span></div>
    <div class="body" style="font-size:12px;color:#000;">Папка «${name}» пуста.<br>Файлы перенесены в [архивные версии].</div>`;
  document.querySelector(".desktop").appendChild(w);
  makeDraggable(w,w.querySelector(".bar"));
  w.querySelector(".x").addEventListener("click",()=>{errSnd();w.remove();});
}

/* ===== ЗАКРЫТИЕ ОКОН ===== */
document.querySelectorAll(".win .x").forEach(x=> x.addEventListener("click",e=>{
  e.stopPropagation(); errSnd(); const w=x.closest(".win");
  w.style.transition="transform .15s,opacity .15s"; w.style.transform="scale(.85)"; w.style.opacity="0";
  setTimeout(()=>w.style.display="none",150);
}));
document.querySelector("#alert .ok").addEventListener("click",()=>{
  clickSnd(); const w=document.getElementById("alert");
  w.style.transition="opacity .15s"; w.style.opacity="0"; setTimeout(()=>w.style.display="none",150);
});

/* ===== СТИХ — печатная машинка ===== */
const poem=["<< И ветер закружит листвой","Над раненой моей землёй...","Мы будем молча говорить","О том, как детство не убить.>>"];
const pt=document.getElementById("poemtext"); let pi=0,ci=0,buf="";
function type(){
  if(pi>=poem.length){ pt.innerHTML=buf+'<span class="cursorblink">_</span>'; return; }
  if(ci<poem[pi].length){ buf+=poem[pi][ci]; ci++; pt.innerHTML=buf+'<span class="cursorblink">_</span>'; }
  else{ buf+="<br>"; pi++; ci=0; }
  setTimeout(type, 38+Math.random()*40);
}
type();

/* ===== КУРСОР-ШЛЕЙФ ===== */
const chars=["★","✦","✧","✺","✶","❉"]; let lastStar=0;
document.addEventListener("pointermove",e=>{
  const now=Date.now(); if(now-lastStar<45) return; lastStar=now;
  const s=document.createElement("div"); s.className="star";
  s.textContent=chars[Math.floor(Math.random()*chars.length)];
  s.style.left=e.clientX+"px"; s.style.top=e.clientY+"px";
  s.style.color=`hsl(${Math.random()*360},100%,80%)`;
  document.body.appendChild(s); setTimeout(()=>s.remove(),1000);
});

/* меню/нижняя панель — звуки */
document.querySelectorAll(".menu a").forEach(a=> a.addEventListener("click",e=>{e.preventDefault();clickSnd();}));
document.querySelector(".bar-right").addEventListener("click",openBrowser);

/* ===== ВИД О НАС ===== */
const aboutView=document.getElementById("about-view");
const barLeft=document.querySelector(".bar-left");
let hiddenHome=[];
let viewOpen=false;
function hideHome(){ if(viewOpen) return; hiddenHome=[]; document.querySelectorAll(".win, .folder").forEach(el=>{ if(el.closest(".viewscreen")) return; if(getComputedStyle(el).display!=="none"){ hiddenHome.push(el); el.style.display="none"; } }); }
function clearViews(){ document.querySelectorAll(".viewscreen").forEach(v=>{ v.classList.remove("open"); v.querySelectorAll(".shopwin").forEach(w=>w.remove()); }); }
function enterView(el,code){ hideHome(); clearViews(); el.classList.add("open"); if(barLeft) barLeft.textContent=code; viewOpen=true; openSnd(); y2kEnter(el); }
function exitView(){ clearViews(); hiddenHome.forEach(el=> el.style.display=""); hiddenHome=[]; if(barLeft) barLeft.textContent="[0.1]"; viewOpen=false; errSnd(); }
function openAbout(){ enterView(aboutView,"[0.2]"); }
function closeAbout(){ exitView(); }
const aboutLink=document.querySelector('.menu a[href="#about"]');
if(aboutLink){ aboutLink.addEventListener("click",e=>{ e.preventDefault(); openAbout(); }); }
const aboutClose=document.getElementById("about-close");
if(aboutClose){ aboutClose.addEventListener("click", closeAbout); }

/* ===== ОКНО-БРАУЗЕР ===== */
const browser=document.getElementById("browser");
const bImgs=[...document.querySelectorAll("#browser .b-img")];
const bTabs=[...document.querySelectorAll("#browser .tab")];
const bAddr=document.getElementById("b-addr");
const bStatusTxt=document.querySelector("#b-status span:last-child");
const bUrls=["http://web.archive.org/дехроно/v1.0/index.html","http://web.archive.org/дехроно/v2.0/index.html"];
function showTab(i){
  bTabs.forEach((t,k)=>t.classList.toggle("active",k===i));
  bImgs.forEach((im,k)=> im.style.display = k===i?"block":"none");
  bAddr.textContent=bUrls[i];
  document.getElementById("b-page").scrollTop=0;
  if(bStatusTxt) bStatusTxt.textContent="Загрузка...";
  clickSnd();
  setTimeout(()=>{ if(bStatusTxt) bStatusTxt.textContent="Готово"; }, 480);
}
bTabs.forEach((t,k)=> t.addEventListener("click",()=>showTab(k)));
makeDraggable(browser, browser.querySelector(".bar"));
function openBrowser(){
  browser.style.display="flex"; browser.style.transform=""; browser.style.opacity="";
  browser.style.zIndex=100+(++z%90); showTab(0); openSnd();
}

/* ===== ПАПКА «ДЕТСТВО» + ОКНА-ФОТО ===== */
const PHOTOS=[{"t": "сумочка.jpg", "s": "assets/images/childhood-bag.jpg"}, {"t": "rave_girl.jpg", "s": "assets/images/childhood-rave-girl.jpg"}, {"t": "крылья_феи.jpg", "s": "assets/images/childhood-fairy-wings.jpg"}, {"t": "слаймы.jpg", "s": "assets/images/childhood-slime.jpg"}, {"t": "радуга.jpg", "s": "assets/images/childhood-rainbow.jpg"}, {"t": "жуки.jpg", "s": "assets/images/childhood-bugs.jpg"}, {"t": "мелки.jpg", "s": "assets/images/childhood-crayons.jpg"}, {"t": "глазки.jpg", "s": "assets/images/childhood-eyes-sticker.jpg"}, {"t": "мячики.jpg", "s": "assets/images/childhood-balls.jpg"}, {"t": "часики.jpg", "s": "assets/images/childhood-watch.jpg"}, {"t": "слинки.jpg", "s": "assets/images/childhood-slinky.jpg"}];
const childhood=document.getElementById("childhood");
const cgrid=document.getElementById("c-grid");
PHOTOS.forEach(p=>{
  const it=document.createElement("div"); it.className="fitem";
  it.innerHTML='<img src="'+p.s+'" alt=""><span>'+p.t+'</span>';
  it.addEventListener("click",()=>openPhoto(p));
  cgrid.appendChild(it);
});
function openChildhood(){
  childhood.style.display="flex"; childhood.style.transform=""; childhood.style.opacity="";
  childhood.style.zIndex=100+(++z%90); openSnd();
}
function openPhoto(p){
  const w=document.createElement("div"); w.className="win photo";
  w.style.cssText="left:"+(240+Math.random()*300)+"px;top:"+(150+Math.random()*170)+"px;width:auto;z-index:"+(100+(++z%90))+";";
  w.innerHTML='<div class="bar"><span>'+p.t+'</span><span class="x">✕</span></div>'+
    '<div class="pbody"><img src="'+p.s+'" alt="'+p.t+'"></div>'+
    '<div class="pcap">★ архив // детство</div>';
  document.querySelector(".desktop").appendChild(w);
  makeDraggable(w,w.querySelector(".bar"));
  w.querySelector(".x").addEventListener("click",()=>{errSnd();w.remove();});
  clickSnd();
}

/* ===== ВИД ШАРМЫ ===== */
const CHARMS=[{"id": "charm1", "t": "Розовая муха", "sub": "PINK FLY · жук в смоле", "price": 1990, "badge": "NEW", "s": "assets/images/charm-1-pink-fly.png"}, {"id": "charm2", "t": "Жук-полночь", "sub": "BLACK BEETLE · ночная серия", "price": 2490, "badge": "", "s": "assets/images/charm-2-black-beetle.png"}, {"id": "charm3", "t": "Синий хром", "sub": "BLUE HOLO · с голографией", "price": 2790, "badge": "NEW", "s": "assets/images/charm-3-blue-holo.png"}, {"id": "charm4", "t": "Капля солнца", "sub": "YELLOW DROP · смола", "price": 1490, "badge": "SALE", "s": "assets/images/charm-4-yellow-drop.png"}, {"id": "charm5", "t": "Кислотное сердце", "sub": "ACID HEART · y2k", "price": 1690, "badge": "", "s": "assets/images/charm-5-acid-heart.png"}, {"id": "charm6", "t": "Поцелуй", "sub": "KISS · губы в рамке", "price": 1890, "badge": "HOT", "s": "assets/images/charm-6-kiss.png"}];
const charmsView=document.getElementById("charms-view");
const charmGrid=document.getElementById("charm-grid");
let cart=[];
const updCart=()=>{document.querySelectorAll(".cart-count").forEach(e=>e.textContent=cart.length);};
function addToCart(c){ cart.push({t:c.t,price:salePrice(c)}); updCart(); toast("+1 ♥ "+c.t+" в корзине"); clickSnd(); }
const fmt=n=>n.toLocaleString("ru-RU");
const salePrice=c=>c.badge==="SALE"?Math.round(c.price*0.8):c.price;
CHARMS.forEach(c=>{
  const el=document.createElement("div"); el.className="charm";
  const cls=c.badge==="SALE"?"sale":c.badge==="HOT"?"hot":"";
  const badge=c.badge?'<div class="badge '+cls+'">'+c.badge+'</div>':"";
  el.innerHTML=badge+'<div class="spark"></div><img src="'+c.s+'" alt="'+c.t+'"><div class="nm">'+c.t+'</div><div class="pr">'+fmt(salePrice(c))+' ₽</div>';
  el.addEventListener("click",()=>openShop(c));
  charmGrid.appendChild(el);
});
function openCharms(){ enterView(charmsView,"[0.3]"); }
function closeCharms(){ exitView(); }
let shopZ=20;
function dragWithin(el,handle){
  let d=false,sx,sy,ox,oy;
  handle.addEventListener("pointerdown",e=>{
    if(e.target.closest(".x")||e.target.closest(".btn")) return;
    d=true; el.style.zIndex=++shopZ; sx=e.clientX;sy=e.clientY; ox=el.offsetLeft;oy=el.offsetTop;
    try{handle.setPointerCapture(e.pointerId);}catch(_){} e.preventDefault();
  });
  handle.addEventListener("pointermove",e=>{ if(!d)return; el.style.left=(ox+e.clientX-sx)+"px"; el.style.top=(oy+e.clientY-sy)+"px"; });
  const s=()=>d=false; handle.addEventListener("pointerup",s); handle.addEventListener("pointercancel",s);
}
let toastT;
function toast(msg){ const t=document.getElementById("cart-toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("show"),1500); }
function openShop(c,container){
  const sale=c.badge==="SALE", price=salePrice(c);
  const w=document.createElement("div"); w.className="shopwin";
  w.style.left=(40+Math.random()*120)+"px"; w.style.top=(54+Math.random()*90)+"px"; w.style.zIndex=++shopZ;
  w.innerHTML='<div class="bar"><span>★ '+c.t+'.exe</span><span class="x">✕</span></div>'+
    '<div class="sw-body"><div class="sw-pic"><img src="'+c.s+'" alt=""></div>'+
    '<div class="sw-info"><h3>'+c.t+'</h3><div class="s">'+c.sub+'</div><div class="stars">★★★★★</div>'+
    '<div class="price">'+(sale?'<span class="old">'+fmt(c.price)+'</span>':'')+fmt(price)+' ₽</div>'+
    '<div class="btn add">★ В КОРЗИНУ</div><div class="btn buy">КУПИТЬ СЕЙЧАС</div></div></div>'+
    '<div class="sw-foot">⏳ доставка 2–4 дня · серебро 925 · смола</div>';
  (container||charmsView).appendChild(w);
  dragWithin(w,w.querySelector(".bar"));
  w.querySelector(".x").addEventListener("click",()=>{errSnd();w.remove();});
  w.querySelector(".add").addEventListener("click",()=>addToCart(c));
  w.querySelector(".buy").addEventListener("click",()=>{addToCart(c);openCart();});
  openSnd();
}
function openCart(){
  let w=document.getElementById("cart-win"); if(w) w.remove();
  w=document.createElement("div"); w.className="shopwin"; w.id="cart-win"; w.style.width="340px";
  w.style.left="56px"; w.style.top="34px"; w.style.zIndex=++shopZ;
  (document.querySelector(".viewscreen.open")||charmsView).appendChild(w); renderCart(w); openSnd();
}
function renderCart(w){
  const total=cart.reduce((s,i)=>s+i.price,0);
  const rows = cart.length ? cart.map((i,k)=>'<div class="cart-row"><span>'+i.t+'</span><span>'+fmt(i.price)+' \u20bd<span class="rm" data-k="'+k+'">\u2715</span></span></div>').join('') : '<div style="text-align:center;color:#888;padding:16px 0;">корзина пуста :(</div>';
  w.innerHTML='<div class="bar"><span>\ud83d\uded2 Корзина \u00b7 ДЕХРОНО</span><span class="x">\u2715</span></div>'+
    '<div class="sw-scroll"><div class="cart-list">'+rows+'</div>'+
    '<div class="total">Итого: '+fmt(total)+' \u20bd</div>'+
    (cart.length?('<div style="font:bold 12px var(--win-font);margin:8px 0;color:#0a246a;">\u2605 ОФОРМЛЕНИЕ ЗАКАЗА \u2605</div>'+
      '<div class="field"><label>Имя *</label><input id="f-name" placeholder="как тебя зовут"></div>'+
      '<div class="field"><label>Телефон или e-mail *</label><input id="f-contact" placeholder="для связи"></div>'+
      '<div class="field"><label>Адрес доставки *</label><input id="f-addr" placeholder="город, улица, дом"></div>'+
      '<div class="field"><label>Комментарий</label><textarea id="f-note" rows="2" placeholder="необязательно"></textarea></div>'+
      '<div class="btn buy" id="f-submit">ОФОРМИТЬ ЗАКАЗ \u25b8</div>'):'')+
    '</div>';
  w.querySelector(".x").addEventListener("click",()=>{errSnd();w.remove();});
  w.querySelectorAll(".rm").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();cart.splice(+b.dataset.k,1);updCart();renderCart(w);errSnd();}));
  const sb=w.querySelector("#f-submit"); if(sb) sb.addEventListener("click",()=>submitOrder(w));
  dragWithin(w,w.querySelector(".bar"));
}
function submitOrder(w){
  const g=id=>{const el=w.querySelector(id);return el?el.value.trim():"";};
  const name=g("#f-name"), contact=g("#f-contact"), addr=g("#f-addr");
  if(!name||!contact||!addr){ toast("заполни поля со звёздочкой *"); errSnd(); return; }
  const num=Math.floor(1000+Math.random()*9000), total=cart.reduce((s,i)=>s+i.price,0);
  const list=cart.map(i=>"\u2022 "+i.t).join("<br>");
  w.innerHTML='<div class="bar"><span>\u2713 заказ \u2116'+num+'</span><span class="x">\u2715</span></div>'+
    '<div class="sw-scroll" style="text-align:center;">'+
    '<div style="font:26px VT323,monospace;color:#0a246a;line-height:1.1;">\u2665 СПАСИБО,<br>'+name.toUpperCase()+' \u2665</div>'+
    '<p style="font:12px var(--win-font);margin:10px 0;line-height:1.5;color:#000;">Заказ <b>\u2116'+num+'</b> принят!<br>'+list+'<br><b>Итого: '+fmt(total)+' \u20bd</b></p>'+
    '<p style="font:13px VT323,monospace;color:#0a246a;line-height:1.4;">доставим: '+addr+'<br>напишем: '+contact+' \ud83d\udcbe</p>'+
    '<div class="btn buy" id="f-ok" style="margin-top:10px;">ОК</div></div>';
  cart=[]; updCart(); openSnd();
  w.querySelector(".x").addEventListener("click",()=>w.remove());
  w.querySelector("#f-ok").addEventListener("click",()=>{clickSnd();w.remove();});
  dragWithin(w,w.querySelector(".bar"));
}
const charmsLink=document.querySelector('.menu a[href="#charms"]');
if(charmsLink){ charmsLink.addEventListener("click",e=>{e.preventDefault();openCharms();}); }
const charmsCloseBtn=document.getElementById("charms-close");
if(charmsCloseBtn){ charmsCloseBtn.addEventListener("click",closeCharms); }
const JEW={"products": {"p7": {"t": "Ключ-браслет", "sub": "KEY CUFF · сталь 925", "price": 3490, "s": "assets/images/jewelry-key-cuff.jpg"}, "p8": {"t": "Доллар-браслет", "sub": "MONEY CUFF · смола + купюра", "price": 2990, "s": "assets/images/jewelry-money-cuff.jpg"}, "p9": {"t": "Серьги-ключи", "sub": "KEY DROPS · пара", "price": 2490, "s": "assets/images/jewelry-key-drops.jpg"}}, "slides": [{"life": "assets/images/jewelry-key-cuff-slide-1.jpg", "prod": "p7"}, {"life": "assets/images/jewelry-key-cuff-slide-2.jpg", "prod": "p7"}, {"life": "assets/images/jewelry-money-cuff-slide-1.jpg", "prod": "p8"}, {"life": "assets/images/jewelry-money-cuff-slide-2.jpg", "prod": "p8"}, {"life": "assets/images/jewelry-key-drops-slide-1.jpg", "prod": "p9"}, {"life": "assets/images/jewelry-key-drops-slide-2.jpg", "prod": "p9"}]};
const jewelryView=document.getElementById("jewelry-view");
const jwPhoto=document.getElementById("jw-photo");
const jwCount=document.getElementById("jw-count");
let jwI=0;
function jwShow(i){ jwI=(i+JEW.slides.length)%JEW.slides.length; jwPhoto.src=JEW.slides[jwI].life; jwCount.textContent=(jwI+1)+" / "+JEW.slides.length; }
document.getElementById("jw-prev").addEventListener("click",e=>{ e.stopPropagation(); jwShow(jwI-1); clickSnd(); });
document.getElementById("jw-next").addEventListener("click",e=>{ e.stopPropagation(); jwShow(jwI+1); clickSnd(); });
jwPhoto.addEventListener("click",()=>{ const p=JEW.products[JEW.slides[jwI].prod]; openShop({t:p.t,sub:p.sub,price:p.price,badge:"",s:p.s}, jewelryView); });
const jewLink=document.querySelector('.menu a[href="#jewelry"]');
if(jewLink){ jewLink.addEventListener("click",e=>{ e.preventDefault(); enterView(jewelryView,"[0.4]"); jwShow(0); }); }
const jewClose=document.getElementById("jewelry-close");
if(jewClose){ jewClose.addEventListener("click", exitView); }
const cartBtn2=document.getElementById("cart-btn2");
if(cartBtn2){ cartBtn2.addEventListener("click",()=>{ openCart(); clickSnd(); }); }
const cartBtn=document.getElementById("cart-btn");
if(cartBtn){ cartBtn.addEventListener("click",()=>{ openCart(); clickSnd(); }); }

const POSTERS=["assets/images/poster-1.jpg", "assets/images/poster-2.jpg", "assets/images/poster-3.jpg", "assets/images/poster-4.jpg", "assets/images/poster-5.jpg", "assets/images/poster-6.jpg", "assets/images/poster-7.jpg", "assets/images/poster-8.jpg", "assets/images/poster-9.jpg"];
const BUILDINGS=["assets/images/building-1.jpg", "assets/images/building-2.jpg", "assets/images/building-3.jpg", "assets/images/building-4.jpg", "assets/images/building-5.jpg", "assets/images/building-6.jpg", "assets/images/building-7.jpg", "assets/images/building-8.jpg", "assets/images/building-9.jpg"];
const INTERIORS=["assets/images/interior-1.jpg", "assets/images/interior-2.jpg", "assets/images/interior-3.jpg"];
const MAGAZINE=["assets/images/magazine-1.jpg", "assets/images/magazine-2.jpg", "assets/images/magazine-3.jpg", "assets/images/magazine-4.jpg", "assets/images/magazine-5.jpg", "assets/images/magazine-6.jpg", "assets/images/magazine-7.jpg", "assets/images/magazine-8.jpg", "assets/images/magazine-9.jpg", "assets/images/magazine-10.jpg", "assets/images/magazine-11.jpg", "assets/images/magazine-12.jpg", "assets/images/magazine-13.jpg", "assets/images/magazine-14.jpg", "assets/images/magazine-15.jpg", "assets/images/magazine-16.jpg", "assets/images/magazine-17.jpg", "assets/images/magazine-18.jpg", "assets/images/magazine-19.jpg", "assets/images/magazine-20.jpg", "assets/images/magazine-21.jpg", "assets/images/magazine-22.jpg"];
const MERCH=["assets/images/merch-1.jpg", "assets/images/merch-2.jpg", "assets/images/merch-3.jpg", "assets/images/merch-4.jpg", "assets/images/merch-5.jpg", "assets/images/merch-6.jpg"];
function openAboutInfo(){
  if(document.getElementById("about-info")) return;
  const w=document.createElement("div"); w.className="win"; w.id="about-info";
  w.style.cssText="position:absolute;left:40px;top:58px;width:250px;z-index:50;";
  w.innerHTML='<div class="bar"><span>&#128193; Подробная информация</span><span class="x">✕</span></div>'+
    '<div class="ai-body">'+
      '<div class="fitem" data-g="posters"><img src="'+POSTERS[0]+'" alt=""><span>афиша.exe</span></div>'+
      '<div class="fitem" data-g="buildings"><img src="'+BUILDINGS[0]+'" alt=""><span>здание.exe</span></div>'+
      '<div class="fitem" data-g="interior"><img src="'+INTERIORS[0]+'" alt=""><span>интерьер.exe</span></div>'+
      '<div class="fitem" data-g="magazine"><img src="'+MAGAZINE[0]+'" alt=""><span>журнал.exe</span></div>'+
      '<div class="fitem" data-g="merch"><img src="'+MERCH[0]+'" alt=""><span>мерч.exe</span></div>'+
    '</div>';
  aboutView.appendChild(w);
  dragWithin(w, w.querySelector(".bar"));
  w.querySelector(".x").addEventListener("click",()=>{ errSnd(); w.remove(); });
  w.querySelectorAll(".fitem").forEach(it=>it.addEventListener("click",()=>{
    if(it.dataset.g==="posters") openGallery("афиша","posters-view",POSTERS);
    else if(it.dataset.g==="buildings") openGallery("здание","buildings-view",BUILDINGS);
    else if(it.dataset.g==="interior") openGallery("интерьер","interior-view",INTERIORS);
    else if(it.dataset.g==="magazine") openGallery("журнал","magazine-view",MAGAZINE,560);
    else openGallery("мерч","merch-view",MERCH,440);
  }));
  openSnd();
}
function openGallery(name,vid,arr,ww){
  ww=ww||300;
  let v=document.getElementById(vid);
  if(v){ v.style.zIndex=60; return; }
  v=document.createElement("div"); v.className="win pvwin"; v.id=vid;
  v.style.cssText="position:absolute;left:"+(ww>360?30:78)+"px;top:32px;width:"+ww+"px;z-index:60;";
  v.innerHTML='<div class="bar"><span class="pv-title">'+name+' — 1/'+arr.length+'</span><span class="x">✕</span></div>'+
    '<div class="pv-body"><img class="pv-img" src="'+arr[0]+'" alt="">'+
    '<button class="pv-arr pv-prev"><span class="ar"></span></button>'+
    '<button class="pv-arr pv-next"><span class="ar"></span></button></div>';
  aboutView.appendChild(v);
  dragWithin(v, v.querySelector(".bar"));
  let pi=0; const img=v.querySelector(".pv-img"), title=v.querySelector(".pv-title");
  function show(n){ pi=(n+arr.length)%arr.length; img.src=arr[pi]; title.textContent=name+" — "+(pi+1)+"/"+arr.length; }
  v.querySelector(".pv-prev").addEventListener("click",e=>{ e.stopPropagation(); show(pi-1); clickSnd(); });
  v.querySelector(".pv-next").addEventListener("click",e=>{ e.stopPropagation(); show(pi+1); clickSnd(); });
  v.querySelector(".x").addEventListener("click",()=>{ errSnd(); v.remove(); });
  openSnd();
}

/* ===================== Y2K ANIMATION PACK (logic) ===================== */
function chFlash(){var s=document.getElementById('chstatic'); if(!s)return; s.classList.remove('on'); void s.offsetWidth; s.classList.add('on');}
var _abTypeIv;
function typeAbout(){
  var el=document.querySelector('#about-view .ab-typed'); if(!el)return;
  var msg="ДЕХРОНО > управление субъективным временем · серебро 925 · жемчуг · est.2004";
  clearInterval(_abTypeIv); el.textContent=''; var i=0;
  _abTypeIv=setInterval(function(){ el.textContent=msg.slice(0,i); i++; if(i>msg.length) clearInterval(_abTypeIv); },45);
}
function y2kEnter(el){ chFlash(); if(el&&el.id==='about-view') typeAbout(); }

/* 1. boot */
(function(){ var b=document.getElementById('boot'); if(!b)return;
  var lines=["INITIALIZING DEHRONO OS v1.0...","MEMORY CHECK ......... 640K OK","LOADING TIME MODULE .. OK","MOUNTING /pearl ....... OK","CALIBRATING CHRONOS .. OK","READY."];
  var el=b.querySelector('.blines'), i=0; b.classList.add('run');
  (function step(){ if(i<lines.length){ el.textContent+=lines[i]+"\n"; i++; setTimeout(step,360);} })();
  setTimeout(function(){ b.classList.add('flash'); },2350);
  setTimeout(function(){ b.classList.remove('flash'); b.classList.add('gone'); setTimeout(function(){ if(b.parentNode) b.remove(); },650); },2520);
})();

/* 5. reverse clock */
(function(){ var c=document.getElementById('rclock'); if(!c)return; var t=new Date();
  function p(x){return (x<10?'0':'')+x;}
  function tick(){ c.textContent=p(t.getHours())+':'+p(t.getMinutes())+':'+p(t.getSeconds()); t=new Date(t.getTime()-1000);} tick();
  setInterval(tick,1000);
})();

/* 8. visitor counter */
(function(){ var v=document.getElementById('visit'); if(!v)return;
  var target=13407+Math.floor(Math.random()*900), cur=target-1100;
  function p(x){ x=''+x; while(x.length<8) x='0'+x; return x; }
  var iv=setInterval(function(){ cur+=Math.ceil((target-cur)/7); v.textContent=p(cur); if(cur>=target){ clearInterval(iv); v.textContent=p(target);
      setInterval(function(){ if(Math.random()<.5){ target++; v.textContent=p(target);} },4500); } },45);
})();

/* 7. DVD screensaver */
(function(){ var d=document.getElementById('dvd'); if(!d)return; var fly=d.querySelector('.fly');
  var idle, x=90,y=90,dx=1.5,dy=1.2,raf, colors=['#03e732','#3a9bff','#dd2c29','#ffe08a','#ff5ad6','#ffffff'];
  function loop(){ var w=window.innerWidth-fly.offsetWidth, hh=window.innerHeight-fly.offsetHeight, b=false;
    x+=dx; y+=dy; if(x<=0||x>=w){dx=-dx;b=true;} if(y<=0||y>=hh){dy=-dy;b=true;}
    if(b) fly.style.color=colors[Math.floor(Math.random()*colors.length)];
    x=Math.max(0,Math.min(w,x)); y=Math.max(0,Math.min(hh,y));
    fly.style.transform='translate('+x+'px,'+y+'px)'; raf=requestAnimationFrame(loop); }
  function start(){ d.classList.add('on'); cancelAnimationFrame(raf); loop(); }
  function stop(){ d.classList.remove('on'); cancelAnimationFrame(raf); }
  function reset(){ if(d.classList.contains('on')) stop(); clearTimeout(idle); idle=setTimeout(start,25000); }
  ['mousemove','mousedown','keydown','touchstart','wheel'].forEach(function(e){ window.addEventListener(e,reset,{passive:true}); });
  reset();
})();

/* 10. glitch hover menu */
(function(){ var chars="АБВГ#@%&01ХРОНО*/<>•"; 
  document.querySelectorAll('.menu a').forEach(function(a){
    var t=a.firstChild; if(!t||t.nodeType!==3)return; var orig=t.nodeValue, iv;
    a.addEventListener('mouseenter',function(){ var n=0; clearInterval(iv);
      iv=setInterval(function(){ n++; t.nodeValue=orig.split('').map(function(ch,k){ return ch===' '?' ':(k<n/2?ch:chars[Math.floor(Math.random()*chars.length)]); }).join('');
        if(n/2>=orig.length){ clearInterval(iv); t.nodeValue=orig; } },28); });
    a.addEventListener('mouseleave',function(){ clearInterval(iv); t.nodeValue=orig; });
  });
})();

