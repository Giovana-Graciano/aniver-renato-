const $ = (selector) => document.querySelector(selector);

const enterBtn = $("#enterBtn");
const intro = $("#intro");
const wall = $("#wall");
const modal = $("#modal");
const modalBox = $("#modalBox");
const animation = $("#animation");
const message = $("#message");
const closeBtn = $("#closeBtn");
const progressEl = $("#progress");
const scoreEl = $("#score");
const allUnlocked = $("#allUnlocked");
const finalCard = $("#finalCard");
const worldStart = $("#worldStart");
const worldStartSmall = $("#worldStartSmall");
const worldStartTitle = $("#worldStartTitle");
const coinsEl = $("#coins");
const starsCollectedEl = $("#starsCollected");
const worldProgressFill = $("#worldProgressFill");
const levelClear = $("#levelClear");
const sparkleLayer = $("#sparkleLayer");

const STORAGE_KEY = "renatinho-birthday-unlocked-v1";
const TOTAL_CARDS = 6;
let audioCtx = null;
let opened = new Set(loadOpened());

/*
 * ============================================================
 * CARTÕES — EDITE ESTA ÁREA QUANDO OS AMIGOS ENTREGAREM O MATERIAL
 * ============================================================
 * Cada cartão segue a estrutura:
 * { id, nome, titulo, tipoDeAnimacao, mensagem, fotos, musica }
 *
 * fotos e musica ficam como campos preparados para uso futuro.
 */
const cards = [
  {
    id:"fluminense",
    nome:"AMIGO 1",
    titulo:"STADIUM MODE",
    icon:"⚽",
    hint:"MATCH START • TRICOLOR POWER",
    tipoDeAnimacao:"stadium",
    mensagem:"Aqui entra a mensagem real do amigo. Você pode colocar histórias de futebol, provocações carinhosas, fotos de vocês e qualquer lembrança que tenha a cara do Renatinho.",
    fotos:[],
    musica:""
  },
  {
    id:"dino",
    nome:"AMIGO 2",
    titulo:"JURASSIC MODE",
    icon:"🦖",
    hint:"FOSSIL FOUND • LEVEL: CHILDHOOD",
    tipoDeAnimacao:"dino",
    mensagem:"Uma mensagem jurássica para lembrar o Renatinho que amava dinossauros. Aqui entram fotos antigas, histórias de infância e a descoberta científica de qual dinossauro ele seria.",
    fotos:[],
    musica:""
  },
  {
    id:"onepiece",
    nome:"AMIGO 3",
    titulo:"PIRATE MODE",
    icon:"☠️",
    hint:"QUEST START • NEW ADVENTURE",
    tipoDeAnimacao:"pirate",
    mensagem:"Uma aventura começa! Este espaço pode virar um mapa do tesouro com memórias, histórias, viagens, amizades e referências genéricas ao espírito pirata que ele curte.",
    fotos:[],
    musica:""
  },
  {
    id:"music",
    nome:"AMIGO 4",
    titulo:"MUSIC MODE",
    icon:"♫",
    hint:"PRESS PLAY • TRACK FOUND",
    tipoDeAnimacao:"music",
    mensagem:"Dê o play: este cartão pode receber uma dedicatória musical, uma capa de álbum, fotos, lembranças e uma música escolhida pelo amigo.",
    fotos:[],
    musica:""
  },
  {
    id:"books",
    nome:"AMIGO 5",
    titulo:"BOOK MODE",
    icon:"📖",
    hint:"CHAPTER FOUND • TURN PAGE",
    tipoDeAnimacao:"books",
    mensagem:"CAPÍTULO ESPECIAL: aqui entra uma homenagem em forma de livro — dedicatória, capítulos de memórias, histórias e a última página com a mensagem final.",
    fotos:[],
    musica:""
  },
  {
    id:"secret",
    nome:"AMIGO 6",
    titulo:"SECRET MODE",
    icon:"★",
    hint:"ACCESSING SECRET FILE…",
    tipoDeAnimacao:"secret",
    mensagem:"PASSWORD ACCEPTED. Este arquivo está reservado para uma mensagem que ainda é segredo.",
    fotos:[],
    musica:""
  }
];

function loadOpened(){
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch { return []; }
}

function saveOpened(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...opened]));
}

function padScore(value){
  return String(value * 1000).padStart(6,"0");
}

function updateProgress(){
  const count = [...opened].filter(id => cards.some(c => c.id === id)).length;
  progressEl.textContent = `${count}/${TOTAL_CARDS}`;
  scoreEl.textContent = padScore(count);
  if(coinsEl) coinsEl.textContent = String(count * 3).padStart(2,"0");
  if(starsCollectedEl) starsCollectedEl.textContent = String(count).padStart(2,"0");
  if(worldProgressFill) worldProgressFill.style.width = `${(count / TOTAL_CARDS) * 100}%`;
  document.querySelectorAll(".card").forEach(btn=>{
    btn.classList.toggle("unlocked", opened.has(btn.dataset.card));
  });
  if(count >= TOTAL_CARDS){
    allUnlocked.classList.remove("hidden");
    levelClear?.classList.remove("hidden");
    finalCard.classList.remove("hidden");
    finalCard.setAttribute("aria-hidden","false");
  }
}

function renderCards(){
  const grid = $("#cardsGrid");
  grid.innerHTML = cards.map((c, i) => `
    <button class="card c${i+1}" data-card="${c.id}" type="button" aria-label="Abrir ${c.titulo}">
      <span class="world-number">WORLD ${String(i+1).padStart(2,"0")} • AREA ${String(i+1).padStart(2,"0")}</span>
      <span class="card-icon" aria-hidden="true">${c.icon}</span>
      <strong>${c.titulo}</strong>
      <small>${c.nome} • ${c.hint}</small>
      <span class="enter-label">[ PRESS A / ENTER ]</span>
    </button>
  `).join("");

  grid.querySelectorAll(".card").forEach(btn=>{
    btn.addEventListener("mouseenter", ()=>playTone("hover"));
    btn.addEventListener("focus", ()=>playTone("hover"));
    btn.addEventListener("click", ()=>openCard(btn.dataset.card));
  });
  updateProgress();
}

function initAudio(){
  if(!audioCtx){
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if(Ctx) audioCtx = new Ctx();
  }
  if(audioCtx?.state === "suspended") audioCtx.resume();
}

function tone(freq=440, duration=.08, type="square", volume=.035, when=0){
  if(!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime + when);
  gain.gain.setValueAtTime(0.0001, audioCtx.currentTime + when);
  gain.gain.exponentialRampToValueAtTime(volume, audioCtx.currentTime + when + .008);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + when + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(audioCtx.currentTime + when);
  osc.stop(audioCtx.currentTime + when + duration + .02);
}

function playTone(kind){
  initAudio();
  if(!audioCtx) return;
  if(kind==="hover") tone(880,.045,"square",.018);
  if(kind==="click"){ tone(520,.07,"square",.03); tone(780,.06,"square",.02,.055); }
  if(kind==="unlock"){ tone(330,.09,"square",.03); tone(494,.09,"square",.03,.08); tone(659,.16,"square",.035,.16); }
  if(kind==="start"){ tone(220,.12,"sawtooth",.025); tone(330,.12,"square",.03,.11); tone(440,.12,"square",.035,.22); tone(660,.25,"square",.04,.33); }
  if(kind==="stadium"){ tone(130,.12,"sawtooth",.035); tone(196,.12,"square",.03,.13); tone(392,.2,"square",.035,.26); }
  if(kind==="dino"){ tone(90,.18,"sawtooth",.04); tone(72,.25,"sawtooth",.03,.19); tone(220,.15,"square",.025,.45); }
  if(kind==="pirate"){ tone(294,.1,"triangle",.03); tone(392,.1,"triangle",.03,.11); tone(523,.18,"triangle",.035,.22); }
  if(kind==="music"){ tone(440,.1,"square",.025); tone(554,.1,"square",.025,.11); tone(659,.18,"square",.03,.22); }
  if(kind==="books"){ tone(392,.1,"triangle",.025); tone(494,.1,"triangle",.025,.12); tone(587,.22,"triangle",.03,.24); }
  if(kind==="secret"){ tone(110,.12,"square",.03); tone(220,.12,"square",.03,.15); tone(440,.22,"square",.03,.3); }
  if(kind==="final"){ tone(261,.12,"square",.03); tone(329,.12,"square",.03,.12); tone(392,.12,"square",.03,.24); tone(523,.4,"square",.04,.36); }
}

function spawnSparkles(count=14){
  for(let i=0;i<count;i++){
    const s=document.createElement("span");
    s.className="spark";
    s.textContent=["✦","★","✧","·"][Math.floor(Math.random()*4)];
    s.style.left=(35+Math.random()*30)+"%";
    s.style.top=(35+Math.random()*30)+"%";
    s.style.setProperty("--dx",`${(Math.random()-.5)*260}px`);
    s.style.setProperty("--dy",`${(Math.random()-.5)*220}px`);
    s.style.fontSize=(10+Math.random()*20)+"px";
    sparkleLayer.appendChild(s);
    setTimeout(()=>s.remove(),800);
  }
}

function openCard(id){
  const c=cards.find(x=>x.id===id);
  if(!c) return;
  openPreview(c);
}

function openPreview(c){
  initAudio();
  playTone("click");
  const world = String(cards.findIndex(x=>x.id===c.id)+1).padStart(2,"0");
  animation.className=`anim-wrap anim-preview preview-${c.tipoDeAnimacao}`;
  $("#modalFile").textContent=`PREVIEW_${c.id.toUpperCase()}.HTML`;
  animation.innerHTML=`
    <div class="preview-envelope" aria-hidden="true">
      <div class="preview-stamp">★</div>
      <div class="preview-icon">${c.icon}</div>
      <div class="preview-postmark">WORLD ${world}</div>
    </div>`;
  message.innerHTML=`
    <div class="preview-kicker">★ VOCÊ RECEBEU UM CARTÃO VIRTUAL ★</div>
    <h3 id="modalTitle">${escapeHtml(c.titulo)}</h3>
    <div class="preview-from">DE: <b>${escapeHtml(c.nome)}</b> &nbsp; • &nbsp; ASSUNTO: ${escapeHtml(c.hint)}</div>
    <p class="preview-copy">Uma pequena prévia foi carregada. O cartão de aniversário deste amigo está esperando para ser aberto.</p>
    <button class="open-friend-card" type="button" data-open-card="${escapeHtml(c.id)}">✉ ABRIR CARTÃO DO AMIGO ✉</button>
    <button class="back-btn preview-back" type="button" onclick="closeCard()">↩ VOLTAR AOS CARTÕES</button>`;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
  setTimeout(()=>$(".open-friend-card")?.focus(),80);
}

function revealCard(id){
  const c=cards.find(x=>x.id===id);
  if(!c) return;
  initAudio();
  playTone(c.tipoDeAnimacao==="stadium"?"stadium":c.tipoDeAnimacao==="dino"?"dino":c.tipoDeAnimacao==="pirate"?"pirate":c.tipoDeAnimacao==="music"?"music":c.tipoDeAnimacao==="books"?"books":"secret");
  const world = String(cards.findIndex(x=>x.id===id)+1).padStart(2,"0");
  showWorldStart(world, c.titulo);
  if(!opened.has(id)){
    opened.add(id);
    saveOpened();
    updateProgress();
  }
  setTimeout(()=>{
  animation.className=`anim-wrap anim-${c.tipoDeAnimacao}`;
  $("#modalFile").textContent=`${id.toUpperCase()}.EXE`;
  animation.innerHTML=`<div class="fake-photo" aria-hidden="true">${c.icon}</div>`;
  message.innerHTML = buildMessage(c);
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
  spawnSparkles(c.tipoDeAnimacao==="secret"?24:12);
  setTimeout(()=>$(".back-btn")?.focus(),80);
  }, 760);
}

function showWorldStart(world,title){
  if(!worldStart) return;
  worldStartSmall.textContent=`WORLD ${world}`;
  worldStartTitle.textContent=title;
  worldStart.classList.remove("hidden");
  worldStart.setAttribute("aria-hidden","false");
  worldStart.style.animation="none";
  void worldStart.offsetWidth;
  worldStart.style.animation="worldFade .95s ease forwards";
}

function buildMessage(c){
  const extra = c.tipoDeAnimacao==="secret"
    ? `<div class="terminal-lines"><div>&gt; ACCESSING SECRET FILE...</div><div>&gt; ████████████████████</div><div>&gt; PASSWORD ACCEPTED</div><div>&gt; MEMORY DECRYPTED ✓</div></div><div class="reveal">★ ${escapeHtml(c.titulo)} ★</div>`
    : c.tipoDeAnimacao==="stadium"
    ? `<div class="progress-line">MATCH START ★ HOME 00 : 00 AWAY</div>`
    : c.tipoDeAnimacao==="pirate"
    ? `<div class="progress-line">🧭 QUEST START • TREASURE MAP LOADED</div>`
    : c.tipoDeAnimacao==="music"
    ? `<div class="progress-line">♫ TRACK FOUND • PRESS PLAY (MÚSICA REAL ENTRA DEPOIS)</div>`
    : c.tipoDeAnimacao==="books"
    ? `<div class="progress-line">CHAPTER 01 → CHAPTER 02 → SPECIAL ENDING</div>`
    : `<div class="progress-line">FOSSIL / MEMORY / DISCOVERY FOUND ✓</div>`;

  return `<h3 id="modalTitle">${escapeHtml(c.titulo)}</h3>${extra}<p>${escapeHtml(c.mensagem)}</p>
    <button class="back-btn" type="button" onclick="closeCard()">↩ VOLTAR AOS CARTÕES</button>`;
}

function openFinal(){
  if(opened.size < TOTAL_CARDS) return;
  initAudio();
  playTone("final");
  animation.className="anim-wrap anim-final";
  $("#modalFile").textContent="CREATOR_FINAL.EXE";
  animation.innerHTML=`<div class="fake-photo" aria-hidden="true">♥</div>`;
  message.innerHTML=`<h3 id="modalTitle">★ CONGRATULATIONS, RENATINHO! ★</h3>
    <div class="reveal">ALL MEMORIES UNLOCKED</div>
    <p>Se você chegou até aqui, completou a missão. Este arquivo é da pessoa que montou tudo isso só para te desejar um feliz aniversário.</p>
    <p><b>FELIZ ANIVERSÁRIO, RENATINHO!!!</b><br>Que nunca faltem histórias para contar, músicas para ouvir, livros para escrever, aventuras para viver e pessoas para dividir tudo isso.</p>
    <button class="back-btn" type="button" onclick="closeCard()">★ MISSÃO CONCLUÍDA ★</button>`;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
  spawnSparkles(35);
}

function closeCard(){
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden","true");
  document.body.style.overflow="";
  animation.innerHTML="";
}

function escapeHtml(text){
  return String(text).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

enterBtn.addEventListener("click",()=>{
  initAudio();
  playTone("start");
  playTone("click");
  spawnSparkles(25);
  intro.classList.add("hidden");
  wall.classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
});

modal.addEventListener("click", (e)=>{
  const btn=e.target.closest(".open-friend-card");
  if(!btn) return;
  playTone("unlock");
  revealCard(btn.dataset.openCard);
});

$("#finalCard").addEventListener("click",openFinal);
closeBtn.addEventListener("click",()=>{playTone("click");closeCard()});
document.querySelector(".modal-backdrop").addEventListener("click",closeCard);
document.addEventListener("keydown",e=>{
  if(e.key==="Escape" && !modal.classList.contains("hidden")) closeCard();
});

renderCards();
