const { useMemo, useState, useEffect } = React;

const crestPath = "assets/brasao-ceep.png?v=ceep-oficial";

const iconLabels = {
  Search: "S",
  Bell: "N",
  Sun: "L",
  Moon: "E",
  Contrast: "C",
  ZoomIn: "+",
  LogIn: ">",
  GraduationCap: "A",
  BriefcaseBusiness: "P",
  Megaphone: "!",
  Newspaper: "J",
  CalendarDays: "D",
  CalendarCheck: "C",
  Clock: "H",
  X: "X",
  ShieldCheck: "V",
  Home: "I",
  LayoutDashboard: "Q",
  BookOpen: "B",
  Flame: "F",
  ClipboardList: "L",
  Layers: "R",
  ListTodo: "T",
  MessagesSquare: "M",
  UploadCloud: "U",
  ClipboardPlus: "+",
  ShieldAlert: "!",
  UsersRound: "U",
  School: "S",
  BarChart3: "G",
  Trophy: "T",
  Heart: "H",
  Download: "D",
  CheckCircle2: "V",
  Plus: "+",
  Check: "V",
  Send: ">",
  Flag: "!"
};

const motivational = [
  "Cada pagina estudada aproxima voce dos seus sonhos.",
  "Respire. Continue. Voce consegue.",
  "Seu futuro agradece seu esforco de hoje.",
  "Pequenos estudos consistentes viram grandes conquistas.",
  "Hoje e um bom dia para vencer uma dificuldade."
];

const scheduleChanges = [
  "Amanha a aula de Matematica sera substituida por Programacao Web I e II.",
  "Sexta-feira nao havera aula devido ao conselho de classe.",
  "O laboratorio de Informatica estara aberto para revisao no contraturno."
];

const news = [
  { title: "Semana de revisao tecnica", text: "Professores publicaram listas e resumos para os simulados." },
  { title: "Mostra de projetos", text: "Turmas tecnicas apresentarao solucoes criadas no semestre." },
  { title: "Biblioteca atualizada", text: "Novas apostilas digitais ja estao disponiveis para download." }
];

const events = [
  { date: "12 AGO", title: "Simulado integrado", meta: "08:00 - Sala 04" },
  { date: "16 AGO", title: "Conselho de classe", meta: "Sem aula regular" },
  { date: "22 AGO", title: "Feira tecnica", meta: "Patio principal" }
];

const subjects = [
  {
    name: "Portugues",
    items: ["Resumo de interpretacao textual", "Lista de figuras de linguagem", "Videoaula de redacao"]
  },
  {
    name: "Matematica",
    items: ["Funcoes do 1o e 2o grau", "Simulado de algebra", "Lista de graficos"]
  },
  {
    name: "Biologia",
    items: ["Citologia ilustrada", "Exercicios de mitose", "Mapa mental de organelas"]
  },
  {
    name: "Programacao Web",
    items: ["HTML semantico", "CSS responsivo", "JavaScript para formularios"]
  }
];

const simulations = [
  { date: "12/08", time: "08:00", content: "Funcoes, Revolucao Francesa e Citologia", teacher: "Profa. Ana" },
  { date: "19/08", time: "10:00", content: "HTML, CSS e logica", teacher: "Prof. Marcos" },
  { date: "26/08", time: "07:30", content: "Interpretacao textual", teacher: "Profa. Lucia" }
];

const achievements = [
  "Estudou 5 dias seguidos.",
  "Criou 20 flashcards.",
  "Entrou todos os dias da semana.",
  "Finalizou seu cronograma."
];

const initialMessages = [
  { author: "Joao", text: "Boa sorte no simulado!" },
  { author: "Lara", text: "Vamos revisar funcoes hoje?" },
  { author: "Mural CEEP", text: "Vocês conseguem. Um passo de cada vez." }
];

const badWords = ["palavrao", "xingamento", "burro", "idiota", "preconceito", "bullying", "******"];

function Icon({ name, size = 18 }) {
  const label = iconLabels[name] || "*";
  return <span className="ui-icon" style={{ width: size, height: size, fontSize: Math.max(11, size * 0.58) }} aria-hidden="true">{label}</span>;
}

function App() {
  const [view, setView] = useState("home");
  const [section, setSection] = useState("visao");
  const [role, setRole] = useState("aluno");
  const [showLogin, setShowLogin] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dark, setDark] = useState(false);
  const [contrast, setContrast] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  const message = useMemo(() => motivational[Math.floor(Math.random() * motivational.length)], []);

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    document.body.classList.toggle("contrast", contrast);
    document.documentElement.style.setProperty("--font-scale", fontScale);
  }, [dark, contrast, fontScale]);

  function enterAs(nextRole) {
    setRole(nextRole);
    setView(nextRole === "aluno" ? "student" : nextRole === "professor" ? "teacher" : "admin");
    setSection("visao");
    setShowLogin(false);
    notify(`Entrada como ${labelRole(nextRole)} realizada.`);
  }

  function notify(text) {
    setToast(text);
    window.setTimeout(() => setToast(""), 2600);
  }

  return (
    <main className="app-shell">
      <Topbar
        search={search}
        setSearch={setSearch}
        openLogin={() => setShowLogin(true)}
        dark={dark}
        setDark={setDark}
        contrast={contrast}
        setContrast={setContrast}
        fontScale={fontScale}
        setFontScale={setFontScale}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        goHome={() => setView("home")}
      />

      {showNotifications && <Notifications />}

      {view === "home" ? (
        <Home openLogin={() => setShowLogin(true)} enterAs={enterAs} message={message} search={search} />
      ) : (
        <Portal
          role={role}
          section={section}
          setSection={setSection}
          search={search}
          notify={notify}
          goHome={() => setView("home")}
        />
      )}

      <footer className="footer">
        <strong>Portal CEEP Helio Xavier de Vasconcelos</strong>
        <p>Conectando estudantes, professores e conhecimento em um so lugar.</p>
      </footer>

      {showLogin && <LoginModal close={() => setShowLogin(false)} enterAs={enterAs} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}

function Topbar(props) {
  return (
    <header className="topbar">
      <button className="brand ghost-btn" onClick={props.goHome} aria-label="Ir para a pagina inicial">
        <span className="brand-mark">CE</span>
        <span>
          <strong>Portal CEEP</strong>
          <span className="brand-copy">Helio Xavier de Vasconcelos</span>
        </span>
      </button>

      <label className="search-wrap">
        <Icon name="Search" />
        <input
          value={props.search}
          onChange={(event) => props.setSearch(event.target.value)}
          placeholder="Pesquisar materiais, avisos, simulados..."
          aria-label="Pesquisar no portal"
        />
      </label>

      <div className="actions">
        <button className="icon-btn" title="Notificacoes" onClick={() => props.setShowNotifications(!props.showNotifications)}>
          <Icon name="Bell" />
        </button>
        <button className="icon-btn" title="Modo escuro" onClick={() => props.setDark(!props.dark)}>
          <Icon name={props.dark ? "Sun" : "Moon"} />
        </button>
        <button className="icon-btn" title="Alto contraste" onClick={() => props.setContrast(!props.contrast)}>
          <Icon name="Contrast" />
        </button>
        <button className="icon-btn" title="Aumentar fonte" onClick={() => props.setFontScale(Math.min(1.18, props.fontScale + 0.04))}>
          <Icon name="ZoomIn" />
        </button>
        <button className="ghost-btn" onClick={props.openLogin}>
          <Icon name="LogIn" />
          <span>Entrar</span>
        </button>
      </div>
    </header>
  );
}

function Home({ openLogin, enterAs, message, search }) {
  const filteredNews = news.filter((item) => matches(item.title + item.text, search));
  return (
    <>
      <section className="hero">
        <div>
          <span className="badge gold-badge">Portal escolar integrado</span>
          <h1>Portal CEEP Helio Xavier de Vasconcelos</h1>
          <p>Conectando estudantes, professores e conhecimento em um so lugar.</p>
          <div className="hero-actions">
            <button className="secondary-btn" onClick={openLogin}><Icon name="LogIn" />Entrar</button>
            <button className="primary-btn" onClick={() => enterAs("aluno")}><Icon name="GraduationCap" />Sou aluno</button>
            <button className="ghost-btn" onClick={() => enterAs("professor")}><Icon name="BriefcaseBusiness" />Sou professor</button>
          </div>
          <div className="notice-strip">
            <Icon name="Megaphone" />
            <div>
              <strong>Aviso importante</strong>
              <p>{scheduleChanges[0]}</p>
            </div>
          </div>
          <p className="muted">{message}</p>
        </div>
        <div className="hero-crest">
          <img src={crestPath} alt="Brasao do CEEP Helio Xavier de Vasconcelos" />
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2>Informacoes da escola</h2>
            <p>Avisos, noticias, eventos e calendario em uma tela.</p>
          </div>
        </div>
        <div className="grid cols-4">
          <InfoCard icon="Newspaper" title="Noticias" items={filteredNews.map((item) => item.title)} />
          <InfoCard icon="CalendarDays" title="Proximos eventos" items={events.map((item) => `${item.date} - ${item.title}`)} />
          <InfoCard icon="CalendarCheck" title="Calendario escolar" items={["Revisoes semanais", "Simulados integrados", "Feira tecnica"]} />
          <InfoCard icon="Clock" title="Funcionamento" items={["Manha: 07:00 as 12:00", "Tarde: 13:00 as 17:30", "Secretaria: 08:00 as 16:00"]} />
        </div>
      </section>

      <section className="section" id="aluno">
        <div className="section-header">
          <div>
            <h2>Area do aluno</h2>
            <p>Um painel para acompanhar estudos, avisos, revisoes e progresso.</p>
          </div>
          <button className="primary-btn" onClick={() => enterAs("aluno")}><Icon name="GraduationCap" />Abrir painel do aluno</button>
        </div>
        <div className="grid cols-4">
          <InfoCard icon="BookOpen" title="Estudos" items={["PDFs e resumos", "Exercicios", "Videoaulas"]} />
          <InfoCard icon="Flame" title="Assuntos em foco" items={["Funcoes", "Revolucao Francesa", "Citologia"]} />
          <InfoCard icon="Layers" title="Flashcards" items={["Revisao rapida", "Criacao propria", "Pergunta e resposta"]} />
          <InfoCard icon="ListTodo" title="Cronograma" items={["Rotina semanal", "Tarefas do dia", "Barra de progresso"]} />
        </div>
      </section>

      <section className="section" id="professor">
        <div className="section-header">
          <div>
            <h2>Professor e coordenacao</h2>
            <p>Ferramentas para publicar conteudos, avisos e administrar a escola.</p>
          </div>
        </div>
        <div className="grid cols-3">
          <InfoCard icon="UploadCloud" title="Professor" items={["Publicar PDFs", "Criar simulados", "Alterar horarios"]} />
          <InfoCard icon="UsersRound" title="Coordenacao" items={["Cadastrar alunos", "Criar turmas", "Enviar avisos gerais"]} />
          <InfoCard icon="BarChart3" title="Estatisticas" items={["Acessos", "Materiais baixados", "Participacao dos alunos"]} />
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2>Recursos extras</h2>
            <p>Funcionalidades que deixam o portal mais completo e acessivel.</p>
          </div>
        </div>
        <div className="grid cols-4">
          <InfoCard icon="Moon" title="Acessibilidade" items={["Modo escuro", "Alto contraste", "Ajuste de fonte"]} />
          <InfoCard icon="Heart" title="Favoritos" items={["Salvar materiais", "Baixar apostilas", "Organizar estudos"]} />
          <InfoCard icon="MessagesSquare" title="Mural" items={["Mensagens positivas", "Filtro de palavras", "Denunciar mensagem"]} />
          <InfoCard icon="Bell" title="Notificacoes" items={["Avisos da direcao", "Novos materiais", "Simulados e eventos"]} />
        </div>
      </section>
    </>
  );
}

function InfoCard({ icon, title, items }) {
  return (
    <article className="card">
      <Icon name={icon} size={24} />
      <h3>{title}</h3>
      <ul className="list">
        {items.map((item) => <li key={item}><span>{item}</span></li>)}
      </ul>
    </article>
  );
}

function LoginModal({ close, enterAs }) {
  const [selectedRole, setSelectedRole] = useState("aluno");
  return (
    <div className="login-modal" role="dialog" aria-modal="true" aria-label="Login do portal">
      <div className="card modal-card">
        <div className="section-header">
          <div>
            <h2>Entrar no portal</h2>
            <p>Use matricula e senha. Neste prototipo, qualquer valor entra.</p>
          </div>
          <button className="icon-btn" onClick={close} title="Fechar"><Icon name="X" /></button>
        </div>
        <div className="form-grid">
          <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)} aria-label="Perfil">
            <option value="aluno">Aluno</option>
            <option value="professor">Professor</option>
            <option value="coordenacao">Coordenacao</option>
          </select>
          <input placeholder="Matricula" />
          <input placeholder="Senha" type="password" />
          <button className="primary-btn" onClick={() => enterAs(selectedRole)}><Icon name="ShieldCheck" />Acessar painel</button>
        </div>
      </div>
    </div>
  );
}

function Portal({ role, section, setSection, search, notify, goHome }) {
  const menu = role === "aluno" ? studentMenu : role === "professor" ? teacherMenu : adminMenu;
  return (
    <div className="portal-layout">
      <aside className="sidebar">
        {menu.map((item) => (
          <button key={item.id} className={`side-btn ${section === item.id ? "active" : ""}`} onClick={() => setSection(item.id)}>
            <Icon name={item.icon} />
            {item.label}
          </button>
        ))}
        <button className="side-btn" onClick={goHome}><Icon name="Home" />Pagina inicial</button>
      </aside>
      <section className="dashboard">
        {role === "aluno" && <StudentDashboard section={section} search={search} notify={notify} />}
        {role === "professor" && <TeacherDashboard section={section} notify={notify} />}
        {role === "coordenacao" && <AdminDashboard section={section} notify={notify} />}
      </section>
    </div>
  );
}

const studentMenu = [
  { id: "visao", label: "Meu painel", icon: "LayoutDashboard" },
  { id: "estudos", label: "Plataforma de estudos", icon: "BookOpen" },
  { id: "foco", label: "Assuntos em foco", icon: "Flame" },
  { id: "simulados", label: "Simulados", icon: "ClipboardList" },
  { id: "flashcards", label: "Flashcards", icon: "Layers" },
  { id: "cronograma", label: "Cronograma", icon: "ListTodo" },
  { id: "chat", label: "Chat dos estudantes", icon: "MessagesSquare" }
];

const teacherMenu = [
  { id: "visao", label: "Painel do professor", icon: "LayoutDashboard" },
  { id: "materiais", label: "Publicar materiais", icon: "UploadCloud" },
  { id: "avisos", label: "Avisos e horarios", icon: "Megaphone" },
  { id: "simulados", label: "Criar simulados", icon: "ClipboardPlus" },
  { id: "moderacao", label: "Moderacao", icon: "ShieldAlert" }
];

const adminMenu = [
  { id: "visao", label: "Coordenacao", icon: "LayoutDashboard" },
  { id: "cadastros", label: "Cadastros", icon: "UsersRound" },
  { id: "turmas", label: "Turmas", icon: "School" },
  { id: "noticias", label: "Noticias e avisos", icon: "Newspaper" },
  { id: "estatisticas", label: "Estatisticas", icon: "BarChart3" }
];

function StudentDashboard({ section, search, notify }) {
  if (section === "estudos") return <StudyPlatform search={search} notify={notify} />;
  if (section === "foco") return <FocusPanel />;
  if (section === "simulados") return <SimulationPanel />;
  if (section === "flashcards") return <Flashcards notify={notify} />;
  if (section === "cronograma") return <SmartSchedule notify={notify} />;
  if (section === "chat") return <StudentChat notify={notify} />;

  return (
    <div className="grid cols-2">
      <article className="card profile">
        <div className="avatar">MS</div>
        <div>
          <span className="badge">Perfil do aluno</span>
          <h2>Maria Silva</h2>
          <p>2o Ano - Informatica<br />Turma B<br />Manha</p>
        </div>
      </article>
      <article className="card">
        <h3>Progresso dos estudos</h3>
        <p className="muted">68% do cronograma semanal concluido.</p>
        <div className="progress"><span style={{ width: "68%" }} /></div>
      </article>
      <InfoCard icon="Megaphone" title="Alteracoes de horario" items={scheduleChanges} />
      <InfoCard icon="Trophy" title="Conquistas" items={achievements} />
    </div>
  );
}

function StudyPlatform({ search, notify }) {
  const filtered = subjects.filter((subject) => matches(subject.name + subject.items.join(" "), search));
  return (
    <div>
      <div className="section-header">
        <div>
          <h2>Plataforma de estudos</h2>
          <p>Materiais organizados por materia, com favoritos e downloads.</p>
        </div>
      </div>
      <div className="grid cols-2">
        {filtered.map((subject) => (
          <article className="card" key={subject.name}>
            <h3>{subject.name}</h3>
            <div className="materials">
              {subject.items.map((item) => (
                <div className="material-row" key={item}>
                  <span>{item}</span>
                  <span>
                    <button className="icon-btn" title="Favoritar" onClick={() => notify("Material salvo nos favoritos.")}><Icon name="Heart" /></button>
                    <button className="icon-btn" title="Baixar apostila" onClick={() => notify("Download simulado iniciado.")}><Icon name="Download" /></button>
                  </span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function FocusPanel() {
  return (
    <article className="card">
      <span className="badge gold-badge">Esta semana sera cobrado</span>
      <h2>Assuntos em foco</h2>
      <div className="grid cols-3">
        {["Funcoes", "Revolucao Francesa", "Citologia"].map((topic) => (
          <div className="card" key={topic}>
            <Icon name="CheckCircle2" />
            <h3>{topic}</h3>
            <p className="muted">Prioridade alta para revisao.</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function SimulationPanel() {
  return (
    <article className="card">
      <h2>Simulados</h2>
      <div className="materials">
        {simulations.map((item) => (
          <div className="schedule-row" key={item.date + item.time}>
            <div>
              <strong>{item.date} as {item.time}</strong>
              <p className="muted">{item.content} - {item.teacher}</p>
            </div>
            <span className="badge">Notificacao ativa</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function Flashcards({ notify }) {
  const [cards, setCards] = useState([
    { q: "O que e mitose?", a: "Processo de divisao celular que gera duas celulas geneticamente iguais." },
    { q: "O que e funcao?", a: "Relacao em que cada valor de entrada possui uma unica saida." }
  ]);
  const [flipped, setFlipped] = useState(false);
  const [form, setForm] = useState({ q: "", a: "" });
  const current = cards[0];

  function addCard() {
    if (!form.q.trim() || !form.a.trim()) return;
    setCards([{ q: form.q, a: form.a }, ...cards]);
    setForm({ q: "", a: "" });
    notify("Flashcard criado.");
  }

  return (
    <div className="grid cols-2">
      <button className="card flashcard" onClick={() => setFlipped(!flipped)}>
        <h2>{flipped ? current.a : current.q}</h2>
        <p className="muted">Clique para virar</p>
      </button>
      <article className="card">
        <h2>Criar flashcard</h2>
        <div className="form-grid">
          <input value={form.q} onChange={(event) => setForm({ ...form, q: event.target.value })} placeholder="Pergunta" />
          <textarea value={form.a} onChange={(event) => setForm({ ...form, a: event.target.value })} placeholder="Resposta" />
          <button className="primary-btn" onClick={addCard}><Icon name="Plus" />Adicionar</button>
        </div>
      </article>
    </div>
  );
}

function SmartSchedule({ notify }) {
  const [tasks, setTasks] = useState({
    Segunda: ["Matematica", "Historia"],
    Terca: ["Portugues", "Fisica"],
    Quarta: ["Biologia", "Programacao Web"]
  });

  return (
    <article className="card">
      <h2>Cronograma inteligente</h2>
      <p className="muted">Continue assim! Voce esta mantendo sua rotina.</p>
      <div className="grid cols-3">
        {Object.entries(tasks).map(([day, items]) => (
          <div className="card" key={day}>
            <h3>{day}</h3>
            <ul className="list">
              {items.map((item) => <li key={item}><span><Icon name="Check" /> {item}</span></li>)}
            </ul>
          </div>
        ))}
      </div>
      <br />
      <button className="primary-btn" onClick={() => notify("Faltam apenas duas tarefas hoje.")}><Icon name="Send" />Enviar lembrete</button>
    </article>
  );
}

function StudentChat({ notify }) {
  const [messages, setMessages] = useState(() => JSON.parse(localStorage.getItem("ceep-chat") || "null") || initialMessages);
  const [text, setText] = useState("");

  useEffect(() => localStorage.setItem("ceep-chat", JSON.stringify(messages)), [messages]);

  function send() {
    const normalized = text.toLowerCase();
    if (badWords.some((word) => normalized.includes(word))) {
      notify("Mensagem bloqueada pelo filtro de seguranca.");
      return;
    }
    if (!text.trim()) return;
    setMessages([{ author: "Maria", text }, ...messages]);
    setText("");
  }

  return (
    <div className="grid cols-2">
      <article className="card">
        <h2>Chat dos estudantes</h2>
        <div className="form-grid">
          <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Escreva uma mensagem positiva para a turma..." />
          <button className="primary-btn" onClick={send}><Icon name="Send" />Publicar</button>
        </div>
      </article>
      <article className="card">
        <h3>Mural</h3>
        <ul className="list">
          {messages.map((message, index) => (
            <li className="chat-message" key={index}>
              <strong>{message.author}</strong>
              <span>{message.text}</span>
              <button className="ghost-btn" onClick={() => notify("Denuncia registrada para moderacao.")}><Icon name="Flag" />Denunciar</button>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}

function TeacherDashboard({ section, notify }) {
  if (section === "materiais") return <PublishForm title="Publicar materiais" button="Enviar PDF" notify={notify} />;
  if (section === "avisos") return <PublishForm title="Avisos e alteracoes de horario" button="Publicar aviso" notify={notify} />;
  if (section === "simulados") return <PublishForm title="Criar simulado" button="Criar simulado" notify={notify} />;
  if (section === "moderacao") return <Moderation notify={notify} />;

  return (
    <div className="grid cols-3">
      <InfoCard icon="UploadCloud" title="Materiais publicados" items={["12 PDFs", "8 atividades", "3 videoaulas"]} />
      <InfoCard icon="Megaphone" title="Avisos ativos" items={scheduleChanges} />
      <InfoCard icon="MessagesSquare" title="Chat" items={["2 mensagens denunciadas", "Filtro automatico ativo"]} />
    </div>
  );
}

function AdminDashboard({ section, notify }) {
  if (section === "cadastros") return <PublishForm title="Cadastrar aluno ou professor" button="Salvar cadastro" notify={notify} />;
  if (section === "turmas") return <PublishForm title="Criar turma" button="Criar turma" notify={notify} />;
  if (section === "noticias") return <PublishForm title="Publicar noticias e avisos gerais" button="Publicar" notify={notify} />;
  if (section === "estatisticas") return <Stats />;

  return (
    <div className="grid cols-4">
      <InfoCard icon="UsersRound" title="Alunos" items={["842 cadastrados", "92% ativos"]} />
      <InfoCard icon="BriefcaseBusiness" title="Professores" items={["48 cadastrados", "31 com materiais publicados"]} />
      <InfoCard icon="School" title="Turmas" items={["18 turmas", "6 cursos tecnicos"]} />
      <InfoCard icon="BarChart3" title="Acessos" items={["1.284 acessos na semana", "Pico: 19:00"]} />
    </div>
  );
}

function PublishForm({ title, button, notify }) {
  return (
    <article className="card">
      <h2>{title}</h2>
      <div className="form-grid">
        <input placeholder="Titulo" />
        <select>
          <option>Informatica - 2o Ano B</option>
          <option>Todas as turmas</option>
          <option>Professores</option>
        </select>
        <textarea placeholder="Descricao, conteudo ou observacoes" />
        <button className="primary-btn" onClick={() => notify("Acao registrada no prototipo.")}><Icon name="Save" />{button}</button>
      </div>
    </article>
  );
}

function Moderation({ notify }) {
  return (
    <article className="card">
      <h2>Moderacao do chat</h2>
      <ul className="list">
        <li><span>Mensagem denunciada aguardando revisao.</span><button className="danger-btn" onClick={() => notify("Mensagem removida.")}>Remover</button></li>
        <li><span>Filtro de palavras proibidas ativo.</span><button className="ghost-btn" onClick={() => notify("Filtro atualizado.")}>Atualizar</button></li>
      </ul>
    </article>
  );
}

function Stats() {
  return (
    <article className="card">
      <h2>Estatisticas de acesso</h2>
      <div className="grid cols-3">
        {[
          ["Alunos ativos", "92%"],
          ["Materiais baixados", "386"],
          ["Flashcards criados", "1.420"]
        ].map(([label, value]) => (
          <div className="card" key={label}>
            <h3>{value}</h3>
            <p className="muted">{label}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function Notifications() {
  return (
    <div className="notification-popover card">
      <h3>Notificacoes</h3>
      <ul className="list">
        <li><span>Novo material de Matematica publicado.</span></li>
        <li><span>Mudanca de aula: Programacao Web no lugar de Matematica.</span></li>
        <li><span>Simulado integrado se aproxima.</span></li>
        <li><span>Evento: Feira tecnica no patio principal.</span></li>
      </ul>
    </div>
  );
}

function labelRole(role) {
  if (role === "professor") return "professor";
  if (role === "coordenacao") return "coordenacao";
  return "aluno";
}

function matches(text, search) {
  return !search || text.toLowerCase().includes(search.toLowerCase());
}

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
