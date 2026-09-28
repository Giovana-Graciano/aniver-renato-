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
const audioPlayer = $("#audioPlayer");
const playlistList = $("#playlistList");
const nowPlaying = $("#nowPlaying");
const nowPlayingFriend = $("#nowPlayingFriend");
const playlistProgress = $("#playlistProgress");
let currentTrack = null;

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
let cards = [
  {
    id:"fluminense",
    nome:"AMIGO 1",
    titulo:"STADIUM MODE",
    icon:"⚽",
    hint:"MATCH START • TRICOLOR POWER",
    tipoDeAnimacao:"stadium",
    mensagem:"Aqui entra a mensagem real do amigo. Você pode colocar histórias de futebol, provocações carinhosas, fotos de vocês e qualquer lembrança que tenha a cara do Renatinho.",
    fotos:[],
    musica:"",
    musicaNome:""
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
    musica:"",
    musicaNome:""
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
    musica:"",
    musicaNome:""
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
    musica:"",
    musicaNome:""
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
    musica:"",
    musicaNome:""
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

function renderPlaylist(){
  if(!playlistList) return;
  const tracks = cards.filter(c => c.musica);
  if(!tracks.length){
    playlistList.innerHTML=`<div class="playlist-empty">♪ NENHUMA MÚSICA ADICIONADA AINDA.<br><small>Preencha o campo <b>musica</b> de cada amigo para montar a playlist.</small></div>`;
    return;
  }
  playlistList.innerHTML=tracks.map((c,i)=>`<button class="playlist-track" type="button" data-track-id="${escapeHtml(c.id)}">
    <span class="track-number">${String(i+1).padStart(2,"0")}</span><span class="track-note">♫</span><span class="track-info"><b>${escapeHtml(c.musicaNome || c.titulo)}</b><small>${escapeHtml(c.nome)}</small></span><span class="track-play">▶</span>
  </button>`).join("");
  playlistList.querySelectorAll(".playlist-track").forEach(btn=>btn.addEventListener("click",()=>playFriendMusic(btn.dataset.trackId)));
}

function playFriendMusic(id){
  const c=cards.find(x=>x.id===id);
  if(!c?.musica || !audioPlayer) return;
  initAudio();
  playTone("music");
  currentTrack=c;
  audioPlayer.src=c.musica;
  audioPlayer.play().catch(()=>{});
  if(nowPlaying) nowPlaying.textContent=`♫ ${c.musicaNome || c.titulo}`;
  if(nowPlayingFriend) nowPlayingFriend.textContent=`DE: ${c.nome}`;
  document.querySelectorAll(".playlist-track").forEach(btn=>btn.classList.toggle("playing",btn.dataset.trackId===id));
}

function attachMusicMarkup(c){
  if(!c.musica) return "";
  return `<div class="friend-music"><div class="friend-music-label">♫ MÚSICA DO AMIGO</div><button class="music-inline" type="button" data-music-id="${escapeHtml(c.id)}">▶ OUVIR: ${escapeHtml(c.musicaNome || c.titulo)}</button></div>`;
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

  return `<h3 id="modalTitle">${escapeHtml(c.titulo)}</h3>${extra}<p>${escapeHtml(c.mensagem)}</p>${attachMusicMarkup(c)}
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
  const openBtn=e.target.closest(".open-friend-card");
  if(openBtn){ playTone("unlock"); revealCard(openBtn.dataset.openCard); return; }
  const musicBtn=e.target.closest(".music-inline");
  if(musicBtn){ playFriendMusic(musicBtn.dataset.musicId); }
});

$("#finalCard").addEventListener("click",openFinal);
closeBtn.addEventListener("click",()=>{playTone("click");closeCard()});
document.querySelector(".modal-backdrop").addEventListener("click",closeCard);
document.addEventListener("keydown",e=>{
  if(e.key==="Escape" && !modal.classList.contains("hidden")) closeCard();
});

async function loadSavedCards(){
  try{
    const res=await fetch('./cards/cards.json',{cache:'no-store'});
    if(res.ok){ const external=await res.json(); if(Array.isArray(external) && external.length) cards=external; }
  }catch(e){}
  renderCards(); renderPlaylist();
}
loadSavedCards();

playlistList?.addEventListener("click", (e)=>{
  const track=e.target.closest(".playlist-track");
  if(track) playFriendMusic(track.dataset.trackId);
});
playlistList?.addEventListener("keydown", (e)=>{ if(e.key==="Enter" || e.key===" "){ const track=e.target.closest(".playlist-track"); if(track){ e.preventDefault(); playFriendMusic(track.dataset.trackId); } } });
$("#playlistPlay")?.addEventListener("click",()=>{ initAudio(); audioPlayer?.play().catch(()=>{}); playTone("click"); });
$("#playlistPause")?.addEventListener("click",()=>{ audioPlayer?.pause(); playTone("click"); });
$("#playlistStop")?.addEventListener("click",()=>{ if(audioPlayer){ audioPlayer.pause(); audioPlayer.currentTime=0; } playTone("click"); });
audioPlayer?.addEventListener("timeupdate",()=>{ if(audioPlayer.duration && playlistProgress) playlistProgress.style.width=`${(audioPlayer.currentTime/audioPlayer.duration)*100}%`; });
audioPlayer?.addEventListener("ended",()=>{ document.querySelectorAll(".playlist-track").forEach(btn=>btn.classList.remove("playing")); if(playlistProgress) playlistProgress.style.width="0%"; });


/* ==========================================================
   V3 — RENATINHO CARD FACTORY
   ========================================================== */
const makerModal = $("#makerModal");
const openMakerBtn = $("#openMakerBtn");
const closeMakerBtn = $("#closeMakerBtn");
const mkName = $("#mkName"), mkTitle = $("#mkTitle"), mkMessage = $("#mkMessage");
const mkTheme = $("#mkTheme"), mkAnim = $("#mkAnim"), mkMusicType = $("#mkMusicType");
const mkMusicUrl = $("#mkMusicUrl"), mkMusicFile = $("#mkMusicFile"), mkMusicFileLabel = $("#mkMusicFileLabel");
const previewTitle = $("#previewTitle"), previewFrom = $("#previewFrom"), previewMessage = $("#previewMessage");
const previewMusic = $("#previewMusic"), previewEmojis = $("#previewEmojis"), makerPreview = $("#makerPreview"), makerStatus = $("#makerStatus");
const emojiPicks = $("#emojiPicks");
const mkFont = $("#mkFont"), mkAlign = $("#mkAlign"), mkImage = $("#mkImage"), mkEmojiMotion = $("#mkEmojiMotion");
const makerPhoto = $("#makerPhoto");
let makerEmojis = ["✨","💚","⭐"];
let makerImageData = "";


const themeMap = {
  green:["#42ce78","#0b5734","#30050e"], red:["#ff5165","#8e0d1e","#160006"],
  gold:["#ffe27a","#9b6c10","#251600"], purple:["#b56dff","#54227e","#13051e"],
  blue:["#64c8ff","#13588a","#031322"], pink:["#ff86c8","#9a2269","#260317"]
};

function makerVal(el){ return (el?.value || "").trim(); }

function updateMaker(){
  if(!makerModal) return;
  const name = makerVal(mkName) || "AMIGO";
  const title = makerVal(mkTitle) || "MEU CARTÃO";
  const msg = makerVal(mkMessage) || "Sua mensagem aparece aqui.";
  previewTitle.textContent = title; previewFrom.textContent = `DE: ${name}`; previewMessage.textContent = msg;
  previewEmojis.textContent = makerEmojis.join("  ");
  makerPreview.classList.remove("font-pixel","font-typewriter","font-bubble","font-hand","align-left","align-right","fx-rainbow","fx-matrix","fx-bubbles","fx-confetti","motion-spin","motion-fall","motion-pulse","motion-mouse");
  makerPreview.classList.add(`font-${mkFont?.value||"pixel"}`);
  if(mkAlign?.value!=="center") makerPreview.classList.add(`align-${mkAlign.value}`);
  if($("#fxRainbow")?.checked) makerPreview.classList.add("fx-rainbow");
  if($("#fxMatrix")?.checked) makerPreview.classList.add("fx-matrix");
  if($("#fxBubbles")?.checked) makerPreview.classList.add("fx-bubbles");
  if($("#fxConfetti")?.checked) makerPreview.classList.add("fx-confetti");
  if(mkEmojiMotion?.value && mkEmojiMotion.value!=="float") makerPreview.classList.add(`motion-${mkEmojiMotion.value}`);
  if(makerPhoto){ makerPhoto.classList.toggle("show",!!makerImageData); if(makerImageData) makerPhoto.src=makerImageData; const st=document.querySelector('input[name="imgStyle"]:checked')?.value||"polaroid"; makerPhoto.className=`maker-photo show ${st}`; }

  const t = themeMap[mkTheme.value] || themeMap.green;
  makerPreview.style.background = `radial-gradient(circle at 50% 15%,${t[0]},${t[1]} 55%,${t[2]})`;
  const icons = {powerpoint:"★",glitter:"✨",bounce:"💥",terminal:"⌨️",vinyl:"💿",dino:"🦖"};
  $("#previewIcon").textContent = icons[mkAnim.value] || "★";
  const mt = mkMusicType.value;
  previewMusic.textContent = mt==="none" ? "♫ NO MUSIC SELECTED" :
    mt==="file" ? `♫ LOCAL AUDIO: ${mkMusicFile.files?.[0]?.name || "ESCOLHA UM ARQUIVO"}` :
    mt==="youtube" ? "▶ YOUTUBE PLAYER READY" : "♫ SPOTIFY PLAYER READY";
  const embed=$("#makerEmbedPreview");
  if(embed){ embed.innerHTML=""; embed.classList.remove("show"); const u=makerVal(mkMusicUrl);
    if(mt==="youtube" && u){ const m=u.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/); if(m){ embed.innerHTML=`<iframe src="https://www.youtube.com/embed/${m[1]}?rel=0" title="YouTube preview" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`; embed.classList.add("show"); }}
    if(mt==="spotify" && u){ const m=u.match(/open\.spotify\.com\/(?:intl-[^/]+\/)?([^?]+)/); if(m){ embed.innerHTML=`<iframe src="https://open.spotify.com/embed/${m[1]}" title="Spotify preview" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`; embed.classList.add("show"); }}
  }
  mkMusicUrl.classList.toggle("hidden", !(mt==="youtube" || mt==="spotify"));
  mkMusicFileLabel.classList.toggle("hidden", mt!=="file");
  makerStatus.textContent = `● LIVE • ${name.toUpperCase()} • ${title.toUpperCase()}`;
}

[mkName,mkTitle,mkMessage,mkTheme,mkAnim,mkMusicType,mkMusicUrl,mkMusicFile,mkFont,mkAlign,mkEmojiMotion].forEach(el=>el?.addEventListener("input",updateMaker));
[mkTheme,mkAnim,mkMusicType,mkFont,mkAlign,mkEmojiMotion].forEach(el=>el?.addEventListener("change",updateMaker));
document.querySelectorAll('.effect-picks input,.image-style-picks input').forEach(el=>el.addEventListener('change',updateMaker));
mkImage?.addEventListener('change',()=>{ const f=mkImage.files?.[0]; if(!f){makerImageData="";updateMaker();return;} const r=new FileReader(); r.onload=()=>{makerImageData=String(r.result||"");updateMaker()}; r.readAsDataURL(f); });

emojiPicks?.querySelectorAll("button").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const e=btn.dataset.emoji;
    if(makerEmojis.includes(e)){ makerEmojis=makerEmojis.filter(x=>x!==e); btn.classList.remove("selected"); }
    else { makerEmojis.push(e); btn.classList.add("selected"); }
    updateMaker(); if(typeof playTone==="function") playTone("click");
  });
});
emojiPicks?.querySelectorAll("button").forEach(btn=>{ if(makerEmojis.includes(btn.dataset.emoji)) btn.classList.add("selected"); });

function openMaker(){
  if(typeof initAudio==="function") initAudio();
  if(typeof playTone==="function") playTone("click");
  makerModal.classList.remove("hidden"); makerModal.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden"; updateMaker();
}
function closeMaker(){
  makerModal.classList.add("hidden"); makerModal.setAttribute("aria-hidden","true"); document.body.style.overflow="";
}
openMakerBtn?.addEventListener("click",openMaker); closeMakerBtn?.addEventListener("click",closeMaker);
document.querySelector(".maker-backdrop")?.addEventListener("click",closeMaker);

function makerRandom(){
  const names=["AMIGO","MIGUXO","THE LEGEND","COMPANHEIRO","BFF","PLAYER 02"];
  const titles=["★ BEST MEMORIES ★","A MESSAGE FOR RENATINHO","LEVEL UP!","PRESS PLAY!","SECRET INTERNET FILE","BIRTHDAY 2000"];
  const msgs=[
    "Renatinho, que seu novo nível venha cheio de histórias absurdas, músicas boas e momentos que merecem virar memória.",
    "Feliz aniversário! Obrigado por todas as risadas, conversas e aventuras. Que essa fase seja inesquecível.",
    "Arquivo recuperado com sucesso: uma amizade incrível. Parabéns, Renatinho! Que nunca faltem motivos para comemorar."
  ];
  mkName.value=names[Math.floor(Math.random()*names.length)];
  mkTitle.value=titles[Math.floor(Math.random()*titles.length)];
  mkMessage.value=msgs[Math.floor(Math.random()*msgs.length)];
  mkTheme.value=Object.keys(themeMap)[Math.floor(Math.random()*6)];
  mkAnim.value=["powerpoint","glitter","bounce","terminal","vinyl","dino"][Math.floor(Math.random()*6)];
  makerEmojis=["✨","⭐","💚","❤️","🦖","⚽","🎵","💿","📖","🦋","💥","☠️"].sort(()=>Math.random()-.5).slice(0,3);
  emojiPicks?.querySelectorAll("button").forEach(b=>b.classList.toggle("selected",makerEmojis.includes(b.dataset.emoji)));
  updateMaker(); if(typeof playTone==="function") playTone("unlock");
}
$("#randomMakerBtn")?.addEventListener("click",makerRandom);

function getMakerData(){
  return {version:"renatinho-card-v3.5",name:makerVal(mkName)||"AMIGO",title:makerVal(mkTitle)||"MEU CARTÃO",message:makerVal(mkMessage)||"",theme:mkTheme.value,animation:mkAnim.value,icon:({powerpoint:"★",glitter:"✨",bounce:"💥",terminal:"⌨️",vinyl:"💿",dino:"🦖"}[mkAnim.value]||"★"),emojis:makerEmojis,style:{font:mkFont?.value||"pixel",align:mkAlign?.value||"center",imageStyle:document.querySelector('input[name="imgStyle"]:checked')?.value||"polaroid"},image:{dataUrl:makerImageData||"",file:mkImage?.files?.[0]?.name||""},effects:{glitter:$("#fxGlitter")?.checked,sparkle:$("#fxSparkle")?.checked,floatingEmojis:$("#fxFloat")?.checked,scanlines:$("#fxScan")?.checked,confetti:$("#fxConfetti")?.checked,bubbles:$("#fxBubbles")?.checked,rainbow:$("#fxRainbow")?.checked,matrix:$("#fxMatrix")?.checked,emojiMotion:mkEmojiMotion?.value||"float"},music:{type:mkMusicType.value,url:makerVal(mkMusicUrl),file:mkMusicFile.files?.[0]?.name||""},exportedAt:new Date().toISOString()};
}
async function copyMaker(){ const data=getMakerData(); try{await navigator.clipboard.writeText(JSON.stringify(data,null,2));makerStatus.textContent="★ JSON COPIED! SEND IT TO THE SITE ADMIN ★";makerStatus.classList.add("copy-ok");playTone("unlock");}catch{makerStatus.textContent="COPY BLOCKED — USE EXPORT CARD";} }
$("#copyMakerBtn")?.addEventListener("click",copyMaker);

function exportMaker(){
  const data=getMakerData();
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
  a.download=`cartao-${(data.name||"amigo").toLowerCase().replace(/[^a-z0-9áéíóúãõç_-]+/gi,"-")}.json`; a.click();
  URL.revokeObjectURL(a.href); makerStatus.textContent="★ CARD EXPORTED! MANDE O .JSON ★";
  playTone("unlock"); if(typeof spawnSparkles==="function") spawnSparkles(22);
}
$("#exportMakerBtn")?.addEventListener("click",exportMaker);

document.addEventListener("keydown",e=>{ if(e.key==="Escape" && makerModal && !makerModal.classList.contains("hidden")) closeMaker(); });

(function createSkyEmojis(){
  const sky=$("#emojiSky"); if(!sky) return;
  const pool=["✨","⭐","💚","❤️","💿","🦖","⚽","🎵","📖","🦋","💥"];
  for(let i=0;i<18;i++){
    const s=document.createElement("span"); s.className="sky-emoji"; s.textContent=pool[i%pool.length];
    s.style.setProperty("--x",`${3+Math.random()*94}%`); s.style.setProperty("--y",`${5+Math.random()*88}%`);
    s.style.setProperty("--size",`${12+Math.random()*24}px`); s.style.setProperty("--dur",`${3+Math.random()*5}s`);
    s.style.setProperty("--delay",`${-Math.random()*5}s`); s.style.setProperty("--mx",`${(Math.random()-.5)*45}px`);
    s.style.setProperty("--my",`${(Math.random()-.5)*35}px`); sky.appendChild(s);
  }
})();

updateMaker();


/* ADMIN: import a friend's exported JSON into the current browser for review */
const adminImportBtn=$("#adminImportBtn"), adminImportFile=$("#adminImportFile");
adminImportBtn?.addEventListener("click",()=>adminImportFile?.click());
adminImportFile?.addEventListener("change",()=>{ const f=adminImportFile.files?.[0]; if(!f)return; const r=new FileReader(); r.onload=()=>{ try{ const d=JSON.parse(r.result); const id=(d.name||"friend").toLowerCase().replace(/[^a-z0-9]+/g,"-")+"-"+Date.now().toString(36); const card={id,nome:d.name||"AMIGO",titulo:d.title||"NOVO CARTÃO",icon:d.icon||"★",hint:"CARD FACTORY • IMPORTED",tipoDeAnimacao:d.animation||"glitter",mensagem:d.message||"",fotos:d.image?.dataUrl?[d.image.dataUrl]:[],musica:d.music?.type==="file"?"":d.music?.url||"",musicaNome:d.music?.type==="youtube"?"YouTube":d.music?.type==="spotify"?"Spotify":d.music?.file||"",cardConfig:d}; cards.push(card); localStorage.setItem("renatinho-imported-"+id,JSON.stringify(card)); renderCards(); renderPlaylist(); makerStatus && (makerStatus.textContent="★ IMPORTED INTO THIS BROWSER ★"); playTone("unlock"); }catch{alert("CARD.JSON inválido.");} }; r.readAsText(f); });
