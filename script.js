// =========================
// SISTEMA DE ABAS
// =========================

function openTab(event, tabId) {
    event.preventDefault();

    document.querySelectorAll(".tab-content").forEach(tab => {
        tab.classList.remove("active");
    });

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle("active", link.dataset.tab === tabId);
    });

    const tab = document.getElementById(tabId);

    if (tab) {
        tab.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =========================
// TESTE DE PERSPECTIVA
// =========================

const questions = document.querySelectorAll(".question");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const questionCounter = document.getElementById("questionCounter");
const progressValue = document.getElementById("progressValue");
const progressBar = document.getElementById("progressBar");
const quizError = document.getElementById("quizError");

let currentQuestion = 0;


// MOSTRA A PERGUNTA ATUAL

function showQuestion(index) {

    questions.forEach((question, i) => {
        question.classList.toggle("active", i === index);
    });

    const total = questions.length;
    const porcentagem = ((index + 1) / total) * 100;

    questionCounter.textContent =
        `Pergunta ${index + 1} de ${total}`;

    progressValue.textContent =
        `${porcentagem.toFixed(1).replace(".", ",")}%`;

    progressBar.style.width =
        `${porcentagem}%`;

    prevBtn.disabled = index === 0;

    if (index === total - 1) {
        nextBtn.textContent = "Ver resultado";
    } else {
        nextBtn.textContent = "Próxima";
    }

    quizError.classList.add("hidden");
}


// =========================
// BOTÃO PRÓXIMA
// =========================

nextBtn.addEventListener("click", function () {

    const current = questions[currentQuestion];

    const resposta =
        current.querySelector("input[type='radio']:checked");

    // Impede continuar sem responder
    if (!resposta) {

        quizError.textContent =
            "Escolha uma resposta para continuar.";

        quizError.classList.remove("hidden");

        return;
    }

    // Se ainda existem perguntas
    if (currentQuestion < questions.length - 1) {

        currentQuestion++;

        showQuestion(currentQuestion);

        // Rola para o começo da pergunta atual
        const teste = document.getElementById("teste");

        teste.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } else {

        mostrarResultado();
    }
});


// =========================
// BOTÃO VOLTAR
// =========================

prevBtn.addEventListener("click", function () {

    if (currentQuestion > 0) {

        currentQuestion--;

        showQuestion(currentQuestion);

        const teste = document.getElementById("teste");

        teste.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
});


// =========================
// RESULTADO
// =========================

function mostrarResultado() {

    const respostas =
        document.querySelectorAll(
            "#quizForm input[type='radio']:checked"
        );

    const pontos = {
        determinado: 0,
        explorador: 0,
        transformacao: 0,
        descobrindo: 0
    };

    respostas.forEach(resposta => {
        if (pontos[resposta.value] !== undefined) {
            pontos[resposta.value]++;
        }
    });

    let perfil = "";

    let maior = -1;

    for (const tipo in pontos) {

        if (pontos[tipo] > maior) {
            maior = pontos[tipo];
            perfil = tipo;
        }
    }

    const resultados = {

        determinado: {
            titulo: "Perfil Determinado",
            texto:
                "Você costuma ter objetivos mais claros e gosta de saber onde quer chegar. Ter um plano pode ajudar, mas também é importante estar aberto a novas possibilidades."
        },

        explorador: {
            titulo: "Perfil Explorador",
            texto:
                "Você gosta de conhecer possibilidades antes de tomar uma decisão. Experiências, cursos e contato com diferentes áreas podem ajudar nas suas escolhas."
        },

        transformacao: {
            titulo: "Perfil em Transformação",
            texto:
                "Sua visão de futuro pode mudar conforme você vive novas experiências. Isso faz parte do processo de descobrir seus interesses e objetivos."
        },

        descobrindo: {
            titulo: "Perfil Descobrindo",
            texto:
                "Você ainda está tentando entender qual caminho combina com você. Pesquisar, conversar com pessoas e experimentar novas atividades pode ajudar."
        }
    };

    const resultado = document.getElementById("result");

    resultado.innerHTML = `
        <h2>${resultados[perfil].titulo}</h2>

        <p>
            ${resultados[perfil].texto}
        </p>

        <p>
            Lembre-se: o resultado é apenas uma forma
            de refletir sobre sua perspectiva. Ele não
            define seu futuro.
        </p>

        <button class="btn primary" type="button"
            onclick="openTab(event, 'caminhos')">
            Explorar caminhos
        </button>
    `;

    document
        .getElementById("quizForm")
        .classList.add("hidden");

    resultado.classList.remove("hidden");

    resultado.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// =========================
// INÍCIO DO TESTE
// =========================

showQuestion(0);


// =========================
// MODELOS DE CURRÍCULO
// =========================

function mostrarModelo(modelo) {

    const area =
        document.getElementById("modeloCurriculo");

    const modelos = {

        modelo1: `
            <h2>Modelo simples</h2>

            <h3>Nome completo</h3>
            <p>
                Telefone • E-mail • Cidade/UF
            </p>

            <h3>Objetivo</h3>
            <p>
                Uma frase curta explicando
                qual oportunidade você procura.
            </p>

            <h3>Formação</h3>
            <p>
                Ensino Médio em andamento.
            </p>

            <h3>Cursos e conhecimentos</h3>
            <p>
                Informática, idiomas, oficinas
                e outros conhecimentos.
            </p>

            <h3>Habilidades</h3>
            <p>
                Organização, comunicação,
                criatividade e trabalho em equipe.
            </p>
        `,

        modelo2: `
            <h2>Modelo para primeiro emprego</h2>

            <h3>Nome completo</h3>
            <p>
                Telefone • E-mail • Cidade
            </p>

            <h3>Objetivo</h3>
            <p>
                Buscar a primeira oportunidade
                profissional.
            </p>

            <h3>Formação</h3>
            <p>
                Ensino Médio em andamento.
            </p>

            <h3>Cursos e conhecimentos</h3>
            <p>
                Informática, idiomas, cursos livres
                e projetos escolares.
            </p>

            <h3>Projetos e atividades</h3>
            <p>
                Trabalhos escolares, eventos,
                voluntariado ou outras atividades.
            </p>

            <h3>Habilidades</h3>
            <p>
                Comunicação, responsabilidade,
                organização e trabalho em equipe.
            </p>
        `,

        modelo3: `
            <h2>Modelo profissional</h2>

            <h3>Nome completo</h3>
            <p>
                Telefone • E-mail • Cidade
            </p>

            <h3>Objetivo profissional</h3>
            <p>
                Área ou cargo desejado.
            </p>

            <h3>Formação</h3>
            <p>
                Formação escolar e cursos relevantes.
            </p>

            <h3>Experiência</h3>
            <p>
                Experiências profissionais ou
                atividades relevantes.
            </p>

            <h3>Cursos e conhecimentos</h3>
            <p>
                Cursos, ferramentas, idiomas
                e conhecimentos técnicos.
            </p>

            <h3>Habilidades</h3>
            <p>
                Principais competências relacionadas
                à oportunidade.
            </p>
        `
    };

    area.innerHTML = modelos[modelo];

    area.classList.remove("hidden");

    area.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}