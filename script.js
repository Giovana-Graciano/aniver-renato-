const enterBtn=document.getElementById("enterBtn");
const intro=document.getElementById("intro");
const wall=document.getElementById("wall");
const modal=document.getElementById("modal");
const modalBox=document.getElementById("modalBox");
const animation=document.getElementById("animation");
const message=document.getElementById("message");
const closeBtn=document.getElementById("closeBtn");
const opened=new Set();

enterBtn.addEventListener("click",()=>{
  intro.classList.add("hidden");
  wall.classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
});

const cards={
  fluminense:{
    cls:"anim-flu", icon:"⚽", title:"Um cartão em clima de estádio",
    text:"Aqui entra a mensagem do amigo. Dá para colocar fotos, histórias de futebol, uma provocação carinhosa e até uma música de arquibancada."
  },
  dino:{
    cls:"anim-dino", icon:"🦖", title:"Uma mensagem jurássica",
    text:"Este cartão pode brincar com a infância: dinossauros, fotos antigas, fósseis, descobertas e aquela pergunta fundamental: qual dinossauro ele seria?"
  },
  onepiece:{
    cls:"anim-pirate", icon:"☠️", title:"A aventura começa!",
    text:"Aqui o amigo pode transformar a mensagem numa pequena aventura: mapa, tripulação, recompensa, ilha misteriosa e referências de One Piece."
  },
  music:{
    cls:"anim-music", icon:"🎵", title:"Dê o play",
    text:"Este pode virar um mini clipe: capa de álbum, letra, fotos e uma música escolhida pelo amigo. O botão de áudio pode ser colocado aqui."
  },
  books:{
    cls:"anim-books", icon:"📖", title:"Capítulo especial",
    text:"Uma homenagem em forma de livro: capa, dedicatória, capítulos com memórias e uma última página com a mensagem final."
  },
  secret:{
    cls:"anim-secret", icon:"✨", title:"Ainda é segredo...",
    text:"Este espaço pode ficar reservado para o cartão de alguém ou para a surpresa final. Podemos trocar por uma animação completamente diferente."
  }
};

document.querySelectorAll(".card").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const key=btn.dataset.card, c=cards[key];
    opened.add(key);
    animation.className="";
    animation.classList.add(c.cls);
    animation.innerHTML=`<div class="fake-photo">${c.icon}</div>`;
    message.innerHTML=`<h3>${c.title}</h3><p>${c.text}</p><button class="back-btn" onclick="closeCard()">↩ voltar aos cartões</button>`;
    modal.classList.remove("hidden");
  });
});
function closeCard(){modal.classList.add("hidden");}
closeBtn.addEventListener("click",closeCard);
document.querySelector(".modal-backdrop").addEventListener("click",closeCard);
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeCard()});
