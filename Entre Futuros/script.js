// ==========================
// TESTE DE PERSPECTIVA
// ==========================

const perguntas = document.querySelectorAll(".question");
const proximo = document.getElementById("nextBtn");
const voltar = document.getElementById("prevBtn");
const barra = document.getElementById("progressBar");
const contador = document.getElementById("questionCounter");
const resultado = document.getElementById("result");
const formulario = document.getElementById("quizForm");

let atual = 0;


// Mostra a pergunta atual
function atualizarTeste() {

    perguntas.forEach(function(pergunta, index) {
        pergunta.classList.toggle("active", index === atual);
    });

    barra.style.width =
        ((atual + 1) / perguntas.length) * 100 + "%";

    contador.textContent =
        "Pergunta " + (atual + 1) + " de " + perguntas.length;

    voltar.disabled = atual === 0;

    if (atual === perguntas.length - 1) {
        proximo.textContent = "Ver meu resultado ✦";
    } else {
        proximo.textContent = "Próxima →";
    }
}


// Verifica a resposta
function respostaSelecionada() {

    return document.querySelector(
        'input[name="q' + (atual + 1) + '"]:checked'
    );
}


// Botão próxima
proximo.addEventListener("click", function() {

    if (!respostaSelecionada()) {
        alert("Escolha uma alternativa para continuar.");
        return;
    }

    if (atual < perguntas.length - 1) {

        atual++;
        atualizarTeste();

    } else {

        mostrarResultado();

    }

});


// Botão voltar
voltar.addEventListener("click", function() {

    if (atual > 0) {
        atual--;
        atualizarTeste();
    }

});


// ==========================
// RESULTADO
// ==========================

function mostrarResultado() {

    let pontos = {
        determinado: 0,
        explorador: 0,
        transformacao: 0,
        descobrindo: 0
    };


    for (let i = 1; i <= perguntas.length; i++) {

        let resposta = document.querySelector(
            'input[name="q' + i + '"]:checked'
        );

        if (resposta) {
            pontos[resposta.value]++;
        }

    }


    let maior = Object.keys(pontos).sort(function(a, b) {
        return pontos[b] - pontos[a];
    })[0];


    let perfis = {

        determinado: {
            nome: "Planejador 🎯",
            texto: "Você já possui objetivos relativamente claros e gosta de pensar em direção e planejamento."
        },

        explorador: {
            nome: "Explorador 🔍",
            texto: "Você está aberto a possibilidades e quer conhecer diferentes caminhos antes de decidir."
        },

        transformacao: {
            nome: "Em transformação 🔄",
            texto: "Sua visão de futuro está mudando junto com suas experiências."
        },

        descobrindo: {
            nome: "Descobrindo possibilidades 🌱",
            texto: "Você ainda está construindo sua visão de futuro e conhecendo novas opções."
        }

    };


    let perfil = perfis[maior];


    resultado.innerHTML = `
        <span class="eyebrow">SEU RESULTADO</span>

        <h2>${perfil.nome}</h2>

        <p class="profile">${perfil.texto}</p>

        <div class="result-score">

            <div class="score">
                <span>Planejamento</span>
                <b>${pontos.determinado * 12.5}%</b>
                <i>
                    <em style="width:${pontos.determinado * 12.5}%"></em>
                </i>
            </div>

            <div class="score">
                <span>Exploração</span>
                <b>${pontos.explorador * 12.5}%</b>
                <i>
                    <em style="width:${pontos.explorador * 12.5}%"></em>
                </i>
            </div>

            <div class="score">
                <span>Mudança</span>
                <b>${pontos.transformacao * 12.5}%</b>
                <i>
                    <em style="width:${pontos.transformacao * 12.5}%"></em>
                </i>
            </div>

            <div class="score">
                <span>Descoberta</span>
                <b>${pontos.descobrindo * 12.5}%</b>
                <i>
                    <em style="width:${pontos.descobrindo * 12.5}%"></em>
                </i>
            </div>

        </div>

        <p>
            Esse resultado representa seu momento atual.
            Você pode refazer o teste depois e comparar sua evolução.
        </p>
    `;


    resultado.classList.remove("hidden");

    formulario.classList.add("hidden");

    salvarHistorico(perfil.nome);

    resultado.scrollIntoView({
        behavior: "smooth"
    });
}


// ==========================
// HISTÓRICO
// ==========================

function salvarHistorico(perfil) {

    let historico =
        JSON.parse(localStorage.getItem("entreFuturosHistory")) || [];

    historico.push({
        perfil: perfil,
        data: new Date().toLocaleDateString("pt-BR")
    });

    localStorage.setItem(
        "entreFuturosHistory",
        JSON.stringify(historico.slice(-8))
    );

    mostrarHistorico();
}


function mostrarHistorico() {

    let historico =
        JSON.parse(localStorage.getItem("entreFuturosHistory")) || [];

    let caixa = document.getElementById("history");

    if (historico.length === 0) {

        caixa.innerHTML =
            "<p>Você ainda não realizou o teste.</p>";

        return;
    }


    caixa.innerHTML = "";

    historico.slice().reverse().forEach(function(item, index) {

        caixa.innerHTML += `
            <div class="history-item">

                <div>
                    <strong>${item.perfil}</strong>
                    <small>${item.data}</small>
                </div>

                <span>
                    ${index === 0 ? "Atual" : "Anterior"}
                </span>

            </div>
        `;

    });

}


document.getElementById("clearHistory").addEventListener(
    "click",
    function() {

        localStorage.removeItem("entreFuturosHistory");

        mostrarHistorico();

    }
);


// ==========================
// CAMINHOS
// ==========================

const caminhos = {

    "Faculdade":
        "Pode ampliar conhecimentos acadêmicos e abrir possibilidades profissionais.",

    "Curso técnico":
        "Oferece uma formação profissional mais prática e direcionada.",

    "Trabalho":
        "Permite adquirir experiência e conhecer melhor diferentes áreas.",

    "Empreendedorismo":
        "Permite transformar uma ideia em projeto, negócio ou solução."
};


function showPath(nome) {

    let caixa = document.getElementById("pathDetails");

    caixa.innerHTML = `
        <h3>${nome}</h3>
        <p>${caminhos[nome]}</p>
    `;

    caixa.classList.remove("hidden");

    caixa.scrollIntoView({
        behavior: "smooth"
    });

}


// ==========================
// MURAL
// ==========================

const mensagensPadrao = [

    ["Tenho medo de escolher errado, mas quero conhecer mais possibilidades.", "Estudante do 2º ano"],

    ["Queria que a escola mostrasse mais opções de carreira.", "Estudante do 1º ano"],

    ["Minha ideia de futuro mudou bastante.", "Estudante do 3º ano"]

];


function mostrarMural() {

    let mensagens =
        JSON.parse(localStorage.getItem("entreFuturosWall")) || [];

    let todas = mensagens.concat(mensagensPadrao);

    let mural = document.getElementById("wall");

    mural.innerHTML = "";

    todas.forEach(function(mensagem) {

        mural.innerHTML += `
            <article class="message">
                <p>“${mensagem[0]}”</p>
                <small>${mensagem[1]}</small>
            </article>
        `;

    });

}


document.getElementById("wallForm").addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        let texto =
            document.getElementById("wallText").value.trim();

        if (texto === "") {
            return;
        }


        let mensagens =
            JSON.parse(localStorage.getItem("entreFuturosWall")) || [];

        mensagens.unshift([
            texto,
            "Mensagem anônima"
        ]);

        localStorage.setItem(
            "entreFuturosWall",
            JSON.stringify(mensagens.slice(0, 10))
        );


        document.getElementById("wallText").value = "";

        mostrarMural();

    }
);


// ==========================
// INICIAR
// ==========================

atualizarTeste();
mostrarHistorico();
mostrarMural();