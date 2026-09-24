const questions = [...document.querySelectorAll(".question")];
const form = document.getElementById("quizForm");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const progressBar = document.getElementById("progressBar");
const counter = document.getElementById("questionCounter");
const resultBox = document.getElementById("result");
let current = 0;

function updateQuiz(){
  questions.forEach((q,i)=>q.classList.toggle("active",i===current));
  progressBar.style.width = `${((current+1)/questions.length)*100}%`;
  counter.textContent = `Pergunta ${current+1} de ${questions.length}`;
  prevBtn.disabled = current===0;
  nextBtn.textContent = current===questions.length-1 ? "Ver meu resultado ✦" : "Próxima →";
}
function selected(){
  return document.querySelector(`input[name="q${current+1}"]:checked`);
}
nextBtn.addEventListener("click",()=>{
  if(!selected()){ alert("Escolha uma alternativa para continuar."); return; }
  if(current < questions.length-1){ current++; updateQuiz(); }
  else showResult();
});
prevBtn.addEventListener("click",()=>{ if(current>0){current--;updateQuiz();} });

function showResult(){
  const scores = {determinado:0,explorador:0,transformacao:0,descobrindo:0};
  for(let i=1;i<=questions.length;i++){
    const answer=document.querySelector(`input[name="q${i}"]:checked`);
    if(answer) scores[answer.value]++;
  }
  const profile = Object.entries(scores).sort((a,b)=>b[1]-a[1])[0][0];
  const data = {
    determinado:{name:"Planejador",emoji:"🎯",desc:"Você já possui objetivos relativamente claros e gosta de pensar em direção e planejamento.",color:"Objetivos"},
    explorador:{name:"Explorador",emoji:"🔍",desc:"Você está aberto a possibilidades e quer conhecer diferentes caminhos antes de decidir.",color:"Interesses"},
    transformacao:{name:"Em transformação",emoji:"🔄",desc:"Sua visão de futuro está mudando junto com suas experiências, e isso faz parte do processo.",color:"Experiências"},
    descobrindo:{name:"Descobrindo possibilidades",emoji:"🌱",desc:"Você ainda está construindo sua visão de futuro e pode se beneficiar de conhecer novas opções.",color:"Descobertas"}
  }[profile];

  const date = new Date().toLocaleDateString("pt-BR");
  const history = JSON.parse(localStorage.getItem("entreFuturosHistory") || "[]");
  history.push({date,profile:data.name});
  localStorage.setItem("entreFuturosHistory",JSON.stringify(history.slice(-8)));

  resultBox.innerHTML = `
    <span class="eyebrow">SEU RESULTADO</span>
    <h2>${data.emoji} ${data.name}</h2>
    <p class="profile">${data.desc}</p>
    <div class="result-score">
      <div class="score"><span>Planejamento</span><b>${Math.round(scores.determinado/8*100)}%</b><i><em style="width:${scores.determinado/8*100}%"></em></i></div>
      <div class="score"><span>Exploração</span><b>${Math.round(scores.explorador/8*100)}%</b><i><em style="width:${scores.explorador/8*100}%"></em></i></div>
      <div class="score"><span>Mudança</span><b>${Math.round(scores.transformacao/8*100)}%</b><i><em style="width:${scores.transformacao/8*100}%"></em></i></div>
      <div class="score"><span>Descoberta</span><b>${Math.round(scores.descobrindo/8*100)}%</b><i><em style="width:${scores.descobrindo/8*100}%"></em></i></div>
    </div>
    <p style="margin-top:18px;color:#69708b;font-size:13px">Este resultado representa o seu momento atual, não define seu futuro. Você pode refazer o teste depois e comparar sua evolução.</p>
  `;
  resultBox.classList.remove("hidden");
  form.classList.add("hidden");
  renderHistory();
  resultBox.scrollIntoView({behavior:"smooth",block:"center"});
}

function renderHistory(){
  const history = JSON.parse(localStorage.getItem("entreFuturosHistory") || "[]");
  const box = document.getElementById("history");
  if(!history.length){
    box.innerHTML = '<p style="color:#69708b;font-size:13px">Você ainda não realizou o teste.</p>';
    return;
  }
  box.innerHTML = history.slice().reverse().map((item,i)=>`
    <div class="history-item"><div><strong>${item.profile}</strong><small>${item.date}</small></div><span>${i===0?"Atual":"Anterior"}</span></div>
  `).join("");
}
document.getElementById("clearHistory").addEventListener("click",()=>{
  localStorage.removeItem("entreFuturosHistory");
  renderHistory();
});

const pathInfo = {
  "Faculdade":"Pode ampliar conhecimentos acadêmicos e abrir portas para diversas carreiras. Pesquise cursos, instituições, duração, formas de ingresso e possibilidades profissionais.",
  "Curso técnico":"Pode oferecer uma formação profissional mais prática e direcionada. Compare áreas, duração, instituições e possibilidades de estágio ou trabalho.",
  "Trabalho":"Entrar no mercado pode ajudar a adquirir experiência e conhecer melhor diferentes áreas. Também é possível continuar estudando enquanto trabalha.",
  "Empreendedorismo":"Criar um projeto pode ser uma forma de transformar uma ideia em solução. É importante estudar público, custos, planejamento, riscos e sustentabilidade."
};
function showPath(name){
  const box=document.getElementById("pathDetails");
  box.innerHTML=`<h3>${name}</h3><p style="margin-top:8px;color:#69708b">${pathInfo[name]}</p>`;
  box.classList.remove("hidden");
  box.scrollIntoView({behavior:"smooth",block:"center"});
}

const defaultMessages=[
  ["Tenho medo de escolher errado, mas quero conhecer mais possibilidades.","Estudante do 2º ano"],
  ["Queria que a escola mostrasse mais opções de carreira.","Estudante do 1º ano"],
  ["Minha ideia de futuro mudou bastante desde que entrei no ensino médio.","Estudante do 3º ano"]
];
function renderWall(){
  const custom=JSON.parse(localStorage.getItem("entreFuturosWall")||"[]");
  const all=[...custom,...defaultMessages];
  document.getElementById("wall").innerHTML=all.map(m=>`<article class="message"><p>“${escapeHtml(m[0])}”</p><small>${m[1]}</small></article>`).join("");
}
function escapeHtml(text){
  const div=document.createElement("div"); div.textContent=text; return div.innerHTML;
}
document.getElementById("wallForm").addEventListener("submit",e=>{
  e.preventDefault();
  const text=document.getElementById("wallText").value.trim();
  if(!text)return;
  const messages=JSON.parse(localStorage.getItem("entreFuturosWall")||"[]");
  messages.unshift([text,"Mensagem anônima"]);
  localStorage.setItem("entreFuturosWall",JSON.stringify(messages.slice(0,10)));
  e.target.reset(); renderWall();
});

updateQuiz();
renderHistory();
renderWall();
