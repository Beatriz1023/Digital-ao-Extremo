<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

try {
    $pdo = db();
} catch (Throwable $exception) {
    header('Location: install.php');
    exit;
}

$user = current_user();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    try {
        if ($action === 'login') {
            $registration = trim($_POST['registration'] ?? '');
            $password = (string) ($_POST['password'] ?? '');

            $stmt = $pdo->prepare('SELECT * FROM users WHERE registration = ? AND active = 1');
            $stmt->execute([$registration]);
            $found = $stmt->fetch();

            if (!$found || !password_verify($password, $found['password_hash'])) {
                redirect_with('danger', 'Matricula ou senha invalidas.');
            }

            $_SESSION['user_id'] = $found['id'];
            redirect_with('success', 'Bem-vindo ao Portal CEEP.');
        }

        $user = require_login();

        if ($action === 'create_user') {
            if (!can('manage_users', $user)) {
                redirect_with('danger', 'Voce nao tem permissao para cadastrar usuarios.');
            }

            $role = $_POST['role'] ?? '';
            if (!in_array($role, allowed_roles_to_create($user['role']), true)) {
                redirect_with('danger', 'Seu perfil nao pode criar esse tipo de usuario.');
            }

            $classId = $role === 'aluno' && !empty($_POST['class_id']) ? (int) $_POST['class_id'] : null;
            $stmt = $pdo->prepare('
                INSERT INTO users (name, registration, email, password_hash, role, class_id)
                VALUES (?, ?, ?, ?, ?, ?)
            ');
            $stmt->execute([
                trim($_POST['name'] ?? ''),
                trim($_POST['registration'] ?? ''),
                trim($_POST['email'] ?? ''),
                password_hash((string) ($_POST['password'] ?? '123456'), PASSWORD_DEFAULT),
                $role,
                $classId,
            ]);

            redirect_with('success', 'Usuario cadastrado com sucesso.');
        }

        if ($action === 'create_class') {
            if (!can('manage_classes', $user)) {
                redirect_with('danger', 'Voce nao tem permissao para cadastrar turmas.');
            }

            $stmt = $pdo->prepare('INSERT INTO classes (name, course, grade, shift) VALUES (?, ?, ?, ?)');
            $stmt->execute([
                trim($_POST['name'] ?? ''),
                trim($_POST['course'] ?? ''),
                trim($_POST['grade'] ?? ''),
                trim($_POST['shift'] ?? ''),
            ]);
            redirect_with('success', 'Turma cadastrada.');
        }

        if ($action === 'create_room') {
            if (!can('manage_rooms', $user)) {
                redirect_with('danger', 'Voce nao tem permissao para cadastrar salas.');
            }

            $stmt = $pdo->prepare('INSERT INTO rooms (name, capacity) VALUES (?, ?)');
            $stmt->execute([trim($_POST['name'] ?? ''), max(1, (int) ($_POST['capacity'] ?? 30))]);
            redirect_with('success', 'Sala cadastrada.');
        }

        if ($action === 'create_subject') {
            if (!can('create_materials', $user) && !can('create_schedules', $user)) {
                redirect_with('danger', 'Voce nao tem permissao para cadastrar materias.');
            }

            $stmt = $pdo->prepare('INSERT IGNORE INTO subjects (name) VALUES (?)');
            $stmt->execute([trim($_POST['name'] ?? '')]);
            redirect_with('success', 'Materia cadastrada.');
        }

        if ($action === 'create_material') {
            if (!can('create_materials', $user)) {
                redirect_with('danger', 'Voce nao tem permissao para publicar materiais.');
            }

            $filePath = null;
            if (!empty($_FILES['material_file']['name']) && is_uploaded_file($_FILES['material_file']['tmp_name'])) {
                $extension = strtolower(pathinfo($_FILES['material_file']['name'], PATHINFO_EXTENSION));
                if (!in_array($extension, ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg'], true)) {
                    redirect_with('danger', 'Tipo de arquivo nao permitido.');
                }

                if (!is_dir(__DIR__ . '/uploads')) {
                    mkdir(__DIR__ . '/uploads', 0777, true);
                }

                $safeName = date('YmdHis') . '-' . bin2hex(random_bytes(4)) . '.' . $extension;
                $target = __DIR__ . '/uploads/' . $safeName;
                move_uploaded_file($_FILES['material_file']['tmp_name'], $target);
                $filePath = 'uploads/' . $safeName;
            }

            $teacherId = $user['role'] === 'professor' ? (int) $user['id'] : (int) ($_POST['teacher_id'] ?? $user['id']);
            $stmt = $pdo->prepare('
                INSERT INTO materials (title, description, file_path, subject_id, class_id, teacher_id)
                VALUES (?, ?, ?, ?, ?, ?)
            ');
            $stmt->execute([
                trim($_POST['title'] ?? ''),
                trim($_POST['description'] ?? ''),
                $filePath,
                (int) $_POST['subject_id'],
                (int) $_POST['class_id'],
                $teacherId,
            ]);

            redirect_with('success', 'Material publicado para a turma.');
        }

        if ($action === 'create_schedule') {
            if (!can('create_schedules', $user)) {
                redirect_with('danger', 'Voce nao tem permissao para agendar aulas.');
            }

            $classId = (int) $_POST['class_id'];
            $roomId = (int) $_POST['room_id'];
            $startAt = str_replace('T', ' ', $_POST['start_at'] ?? '');
            $endAt = str_replace('T', ' ', $_POST['end_at'] ?? '');

            if (!$startAt || !$endAt || strtotime($endAt) <= strtotime($startAt)) {
                redirect_with('danger', 'Horario final deve ser maior que o inicial.');
            }

            $conflict = $pdo->prepare('
                SELECT COUNT(*) FROM schedules
                WHERE (room_id = ? OR class_id = ?)
                  AND start_at < ?
                  AND end_at > ?
            ');
            $conflict->execute([$roomId, $classId, $endAt, $startAt]);
            if ((int) $conflict->fetchColumn() > 0) {
                redirect_with('danger', 'Conflito encontrado: sala ou turma ja possui aula nesse horario.');
            }

            $teacherId = $user['role'] === 'professor' ? (int) $user['id'] : (int) ($_POST['teacher_id'] ?? $user['id']);
            $stmt = $pdo->prepare('
                INSERT INTO schedules (title, description, subject_id, class_id, room_id, teacher_id, start_at, end_at, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ');
            $stmt->execute([
                trim($_POST['title'] ?? ''),
                trim($_POST['description'] ?? ''),
                (int) $_POST['subject_id'],
                $classId,
                $roomId,
                $teacherId,
                $startAt,
                $endAt,
                (int) $user['id'],
            ]);

            redirect_with('success', 'Aula agendada com sala e turma.');
        }
    } catch (PDOException $exception) {
        redirect_with('danger', 'Erro no banco: ' . $exception->getMessage());
    }
}

$flash = flash();
$classes = $pdo->query('SELECT * FROM classes ORDER BY name')->fetchAll();
$rooms = $pdo->query('SELECT * FROM rooms ORDER BY name')->fetchAll();
$subjects = $pdo->query('SELECT * FROM subjects ORDER BY name')->fetchAll();
$teachers = $pdo->query("SELECT id, name FROM users WHERE role = 'professor' AND active = 1 ORDER BY name")->fetchAll();

$users = [];
$materials = [];
$schedules = [];

if ($user) {
    if (can('manage_users', $user)) {
        $users = $pdo->query('
            SELECT users.*, classes.name AS class_name
            FROM users
            LEFT JOIN classes ON classes.id = users.class_id
            ORDER BY users.created_at DESC
        ')->fetchAll();
    }

    if ($user['role'] === 'aluno') {
        $stmt = $pdo->prepare('
            SELECT materials.*, subjects.name AS subject_name, users.name AS teacher_name, classes.name AS class_name
            FROM materials
            JOIN subjects ON subjects.id = materials.subject_id
            JOIN users ON users.id = materials.teacher_id
            JOIN classes ON classes.id = materials.class_id
            WHERE materials.class_id = ?
            ORDER BY materials.created_at DESC
        ');
        $stmt->execute([$user['class_id']]);
        $materials = $stmt->fetchAll();

        $stmt = $pdo->prepare('
            SELECT schedules.*, subjects.name AS subject_name, rooms.name AS room_name, users.name AS teacher_name, classes.name AS class_name
            FROM schedules
            JOIN subjects ON subjects.id = schedules.subject_id
            JOIN rooms ON rooms.id = schedules.room_id
            JOIN users ON users.id = schedules.teacher_id
            JOIN classes ON classes.id = schedules.class_id
            WHERE schedules.class_id = ?
            ORDER BY schedules.start_at ASC
        ');
        $stmt->execute([$user['class_id']]);
        $schedules = $stmt->fetchAll();
    } else {
        $materials = $pdo->query('
            SELECT materials.*, subjects.name AS subject_name, users.name AS teacher_name, classes.name AS class_name
            FROM materials
            JOIN subjects ON subjects.id = materials.subject_id
            JOIN users ON users.id = materials.teacher_id
            JOIN classes ON classes.id = materials.class_id
            ORDER BY materials.created_at DESC
        ')->fetchAll();

        $schedules = $pdo->query('
            SELECT schedules.*, subjects.name AS subject_name, rooms.name AS room_name, users.name AS teacher_name, classes.name AS class_name
            FROM schedules
            JOIN subjects ON subjects.id = schedules.subject_id
            JOIN rooms ON rooms.id = schedules.room_id
            JOIN users ON users.id = schedules.teacher_id
            JOIN classes ON classes.id = schedules.class_id
            ORDER BY schedules.start_at ASC
        ')->fetchAll();
    }
}
?>
<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portal CEEP</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
<main class="app-shell">
    <header class="topbar">
        <a class="brand ghost-btn" href="index.php">
            <span class="brand-mark">CE</span>
            <span>
                <strong>Portal CEEP</strong>
                <span class="brand-copy">Helio Xavier de Vasconcelos</span>
            </span>
        </a>
        <div class="search-wrap">
            <span class="ui-icon">S</span>
            <input id="search" placeholder="Pesquisar na tela..." aria-label="Pesquisar na tela">
        </div>
        <div class="actions">
            <button class="icon-btn" id="themeToggle" type="button" title="Alternar modo escuro ou claro" aria-label="Alternar modo escuro ou claro">E</button>
            <?php if ($user): ?>
                <span class="badge"><?= e(role_label($user['role'])) ?></span>
                <a class="ghost-btn" href="logout.php">Sair</a>
            <?php endif; ?>
        </div>
    </header>

    <?php if ($flash): ?>
        <section class="section compact-section">
            <div class="alert <?= e($flash['type']) ?>"><?= e($flash['message']) ?></div>
        </section>
    <?php endif; ?>

    <?php if (!$user): ?>
        <nav class="school-tabs" aria-label="Informacoes sobre a escola">
            <a href="#escola">A escola</a>
            <a href="#cursos">Cursos tecnicos</a>
            <a href="#direcao">Direcao</a>
            <a href="#calendario">Calendario</a>
            <a href="#contato">Contato</a>
        </nav>

        <section class="newspaper-cover">
            <div class="newspaper-masthead">
                <div>
                    <span class="edition-label">Edicao escolar da semana</span>
                    <h1>Jornal CEEP Helio Xavier de Vasconcelos</h1>
                    <p>Comunicados, estudos, eventos e vida escolar em um so lugar.</p>
                </div>
                <img src="assets/brasao-ceep.png?v=ceep-oficial" alt="Brasao do CEEP">
            </div>

            <div class="newspaper-grid">
                <article class="lead-story" id="escola">
                    <span class="badge gold-badge">Manchete</span>
                    <h2>Portal CEEP conecta estudantes, professores e conhecimento</h2>
                    <p>Agora a comunidade escolar conta com um ambiente digital para acessar materiais, acompanhar aulas agendadas, ver comunicados e organizar a rotina de estudos por turma.</p>
                    <div class="story-meta">Comunidade escolar • Ensino tecnico • Informacao oficial</div>
                </article>

                <aside class="login-column">
                    <form class="card login-card" method="post">
                        <input type="hidden" name="action" value="login">
                        <h3>Acesso ao sistema</h3>
                        <p class="muted">Entre com matricula e senha.</p>
                        <div class="form-grid">
                            <input name="registration" placeholder="Matricula" required>
                            <input name="password" type="password" placeholder="Senha" required>
                            <button class="primary-btn" type="submit">Entrar</button>
                        </div>
                        <p class="muted">Primeiro acesso: instale o banco e use admin / admin123.</p>
                    </form>
                </aside>
            </div>
        </section>

        <section class="section newspaper-section">
            <div class="section-header">
                <div>
                    <span class="edition-label">Destaques da semana</span>
                    <h2>O que merece atencao agora</h2>
                </div>
            </div>
            <div class="news-grid weekly-grid">
                <article class="news-card main-news">
                    <span class="news-kicker">Estudos</span>
                    <h3>Professores liberam materiais para revisao</h3>
                    <p>Listas, PDFs e atividades ficam disponiveis por turma para que cada aluno acompanhe os conteudos certos.</p>
                </article>
                <article class="news-card">
                    <span class="news-kicker">Agenda</span>
                    <h3>Aulas passam a ter sala e horario organizados</h3>
                    <p>O agendamento evita conflito de sala e ajuda turmas e professores a visualizarem a rotina.</p>
                </article>
                <article class="news-card">
                    <span class="news-kicker">Comunicados</span>
                    <h3>Alteracoes de horario em destaque</h3>
                    <p>A direcao e a secretaria podem publicar avisos importantes para a comunidade escolar.</p>
                </article>
                <article class="news-card">
                    <span class="news-kicker">Seguranca</span>
                    <h3>Acesso separado por perfil</h3>
                    <p>Administrador, Direcao, Secretaria, Professor e Aluno possuem camadas diferentes de permissao.</p>
                </article>
            </div>
        </section>

        <section class="section newspaper-section">
            <div class="section-header">
                <div>
                    <span class="edition-label">Destaques do mes</span>
                    <h2>Planejamento e vida escolar</h2>
                </div>
            </div>
            <div class="month-layout">
                <article class="month-feature" id="cursos">
                    <h3>Cursos tecnicos em foco</h3>
                    <p>O portal organiza materiais por materia, turma e curso tecnico, fortalecendo o acompanhamento das atividades praticas e teoricas.</p>
                </article>
                <article class="news-card" id="calendario">
                    <span class="news-kicker">Calendario</span>
                    <h3>Simulados, eventos e conselhos</h3>
                    <p>Os proximos eventos podem ser acompanhados junto aos agendamentos de aula.</p>
                </article>
                <article class="news-card" id="direcao">
                    <span class="news-kicker">Gestao</span>
                    <h3>Direcao e secretaria integradas</h3>
                    <p>Cadastros, turmas, salas e comunicados ficam centralizados em um mesmo painel.</p>
                </article>
                <article class="news-card" id="contato">
                    <span class="news-kicker">Atendimento</span>
                    <h3>Secretaria escolar</h3>
                    <p>Use o portal para acompanhar avisos oficiais e informacoes sobre funcionamento da escola.</p>
                </article>
            </div>
        </section>
    <?php else: ?>
        <section class="section">
            <div class="section-header">
                <div>
                    <span class="badge gold-badge">Painel <?= e(role_label($user['role'])) ?></span>
                    <h1>Ola, <?= e($user['name']) ?></h1>
                    <p>Camadas de acesso ativas para usuarios, materiais, turmas, salas e agendamentos.</p>
                </div>
            </div>

            <div class="grid cols-4">
                <article class="card"><h3>Usuarios</h3><p class="metric"><?= count($users) ?: '-' ?></p><p class="muted">Cadastro por perfil.</p></article>
                <article class="card"><h3>Turmas</h3><p class="metric"><?= count($classes) ?></p><p class="muted">Alunos vinculados por turma.</p></article>
                <article class="card"><h3>Materiais</h3><p class="metric"><?= count($materials) ?></p><p class="muted">Conteudos dos professores.</p></article>
                <article class="card"><h3>Agendamentos</h3><p class="metric"><?= count($schedules) ?></p><p class="muted">Aula, sala e turma.</p></article>
            </div>
        </section>

        <?php if (can('manage_users', $user)): ?>
            <section class="section searchable">
                <div class="section-header">
                    <div>
                        <h2>Criacao de usuarios</h2>
                        <p>Cadastre usuarios com camadas de acesso separadas.</p>
                    </div>
                </div>
                <div class="grid cols-2">
                    <form class="card form-grid" method="post">
                        <input type="hidden" name="action" value="create_user">
                        <input name="name" placeholder="Nome completo" required>
                        <input name="registration" placeholder="Matricula / login" required>
                        <input name="email" type="email" placeholder="E-mail">
                        <input name="password" type="password" placeholder="Senha inicial" required>
                        <select name="role" required>
                            <option value="">Perfil de acesso</option>
                            <?php foreach (allowed_roles_to_create($user['role']) as $role): ?>
                                <option value="<?= e($role) ?>"><?= e(role_label($role)) ?></option>
                            <?php endforeach; ?>
                        </select>
                        <select name="class_id">
                            <option value="">Turma do aluno, se for aluno</option>
                            <?php foreach ($classes as $class): ?>
                                <option value="<?= (int) $class['id'] ?>"><?= e($class['name']) ?></option>
                            <?php endforeach; ?>
                        </select>
                        <button class="primary-btn" type="submit">Cadastrar usuario</button>
                    </form>
                    <article class="card table-card">
                        <h3>Usuarios cadastrados</h3>
                        <div class="table-wrap">
                            <table>
                                <thead><tr><th>Nome</th><th>Perfil</th><th>Turma</th></tr></thead>
                                <tbody>
                                <?php foreach ($users as $row): ?>
                                    <tr><td><?= e($row['name']) ?></td><td><?= e(role_label($row['role'])) ?></td><td><?= e($row['class_name'] ?? '-') ?></td></tr>
                                <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </article>
                </div>
            </section>
        <?php endif; ?>

        <?php if (can('manage_classes', $user) || can('manage_rooms', $user)): ?>
            <section class="section searchable">
                <div class="section-header">
                    <div>
                        <h2>Turmas, salas e materias</h2>
                        <p>Base usada para alunos, materiais e agendamentos.</p>
                    </div>
                </div>
                <div class="grid cols-3">
                    <?php if (can('manage_classes', $user)): ?>
                        <form class="card form-grid" method="post">
                            <input type="hidden" name="action" value="create_class">
                            <h3>Nova turma</h3>
                            <input name="name" placeholder="Nome da turma" required>
                            <input name="course" placeholder="Curso tecnico" required>
                            <input name="grade" placeholder="Serie" required>
                            <input name="shift" placeholder="Turno" required>
                            <button class="primary-btn" type="submit">Salvar turma</button>
                        </form>
                    <?php endif; ?>
                    <?php if (can('manage_rooms', $user)): ?>
                        <form class="card form-grid" method="post">
                            <input type="hidden" name="action" value="create_room">
                            <h3>Nova sala</h3>
                            <input name="name" placeholder="Nome da sala/laboratorio" required>
                            <input name="capacity" type="number" min="1" value="30" placeholder="Capacidade" required>
                            <button class="primary-btn" type="submit">Salvar sala</button>
                        </form>
                    <?php endif; ?>
                    <form class="card form-grid" method="post">
                        <input type="hidden" name="action" value="create_subject">
                        <h3>Nova materia</h3>
                        <input name="name" placeholder="Nome da materia" required>
                        <button class="primary-btn" type="submit">Salvar materia</button>
                    </form>
                </div>
            </section>
        <?php endif; ?>

        <section class="section searchable">
            <div class="section-header">
                <div>
                    <h2>Materiais dos professores</h2>
                    <p><?= $user['role'] === 'aluno' ? 'Voce visualiza apenas materiais da sua turma.' : 'Publique e acompanhe materiais por turma.' ?></p>
                </div>
            </div>
            <div class="grid cols-2">
                <?php if (can('create_materials', $user)): ?>
                    <form class="card form-grid" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="action" value="create_material">
                        <h3>Publicar material</h3>
                        <input name="title" placeholder="Titulo" required>
                        <textarea name="description" placeholder="Descricao"></textarea>
                        <select name="subject_id" required>
                            <option value="">Materia</option>
                            <?php foreach ($subjects as $subject): ?>
                                <option value="<?= (int) $subject['id'] ?>"><?= e($subject['name']) ?></option>
                            <?php endforeach; ?>
                        </select>
                        <select name="class_id" required>
                            <option value="">Turma</option>
                            <?php foreach ($classes as $class): ?>
                                <option value="<?= (int) $class['id'] ?>"><?= e($class['name']) ?></option>
                            <?php endforeach; ?>
                        </select>
                        <?php if ($user['role'] !== 'professor'): ?>
                            <select name="teacher_id">
                                <option value="<?= (int) $user['id'] ?>">Publicado por mim</option>
                                <?php foreach ($teachers as $teacher): ?>
                                    <option value="<?= (int) $teacher['id'] ?>"><?= e($teacher['name']) ?></option>
                                <?php endforeach; ?>
                            </select>
                        <?php endif; ?>
                        <input type="file" name="material_file">
                        <button class="primary-btn" type="submit">Disponibilizar para turma</button>
                    </form>
                <?php endif; ?>
                <article class="card table-card">
                    <h3>Materiais disponiveis</h3>
                    <div class="table-wrap">
                        <table>
                            <thead><tr><th>Titulo</th><th>Materia</th><th>Turma</th><th>Professor</th><th>Arquivo</th></tr></thead>
                            <tbody>
                            <?php foreach ($materials as $material): ?>
                                <tr>
                                    <td><?= e($material['title']) ?></td>
                                    <td><?= e($material['subject_name']) ?></td>
                                    <td><?= e($material['class_name']) ?></td>
                                    <td><?= e($material['teacher_name']) ?></td>
                                    <td><?= $material['file_path'] ? '<a href="' . e($material['file_path']) . '" target="_blank">Abrir</a>' : '-' ?></td>
                                </tr>
                            <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </article>
            </div>
        </section>

        <section class="section searchable">
            <div class="section-header">
                <div>
                    <h2>Agendamento de aula e sala</h2>
                    <p><?= $user['role'] === 'aluno' ? 'Voce visualiza os agendamentos da sua turma.' : 'Agende aula escolhendo materia, professor, turma, sala e horario.' ?></p>
                </div>
            </div>
            <div class="grid cols-2">
                <?php if (can('create_schedules', $user)): ?>
                    <form class="card form-grid" method="post">
                        <input type="hidden" name="action" value="create_schedule">
                        <h3>Novo agendamento</h3>
                        <input name="title" placeholder="Titulo da aula" required>
                        <textarea name="description" placeholder="Observacoes"></textarea>
                        <select name="subject_id" required>
                            <option value="">Materia</option>
                            <?php foreach ($subjects as $subject): ?>
                                <option value="<?= (int) $subject['id'] ?>"><?= e($subject['name']) ?></option>
                            <?php endforeach; ?>
                        </select>
                        <select name="class_id" required>
                            <option value="">Turma</option>
                            <?php foreach ($classes as $class): ?>
                                <option value="<?= (int) $class['id'] ?>"><?= e($class['name']) ?></option>
                            <?php endforeach; ?>
                        </select>
                        <select name="room_id" required>
                            <option value="">Sala</option>
                            <?php foreach ($rooms as $room): ?>
                                <option value="<?= (int) $room['id'] ?>"><?= e($room['name']) ?> (<?= (int) $room['capacity'] ?>)</option>
                            <?php endforeach; ?>
                        </select>
                        <?php if ($user['role'] !== 'professor'): ?>
                            <select name="teacher_id">
                                <option value="<?= (int) $user['id'] ?>">Responsavel: eu</option>
                                <?php foreach ($teachers as $teacher): ?>
                                    <option value="<?= (int) $teacher['id'] ?>"><?= e($teacher['name']) ?></option>
                                <?php endforeach; ?>
                            </select>
                        <?php endif; ?>
                        <input name="start_at" type="datetime-local" required>
                        <input name="end_at" type="datetime-local" required>
                        <button class="primary-btn" type="submit">Agendar aula</button>
                    </form>
                <?php endif; ?>
                <article class="card table-card">
                    <h3>Agenda</h3>
                    <div class="table-wrap">
                        <table>
                            <thead><tr><th>Aula</th><th>Materia</th><th>Turma</th><th>Sala</th><th>Professor</th><th>Horario</th></tr></thead>
                            <tbody>
                            <?php foreach ($schedules as $schedule): ?>
                                <tr>
                                    <td><?= e($schedule['title']) ?></td>
                                    <td><?= e($schedule['subject_name']) ?></td>
                                    <td><?= e($schedule['class_name']) ?></td>
                                    <td><?= e($schedule['room_name']) ?></td>
                                    <td><?= e($schedule['teacher_name']) ?></td>
                                    <td><?= e(date('d/m/Y H:i', strtotime($schedule['start_at']))) ?> - <?= e(date('H:i', strtotime($schedule['end_at']))) ?></td>
                                </tr>
                            <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </article>
            </div>
        </section>
    <?php endif; ?>
</main>
<script>
const savedTheme = localStorage.getItem('ceep-theme');
const themeButton = document.getElementById('themeToggle');

function applyTheme(theme) {
    document.body.classList.toggle('dark', theme === 'dark');
    if (themeButton) {
        themeButton.textContent = theme === 'dark' ? 'C' : 'E';
        themeButton.title = theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro';
        themeButton.setAttribute('aria-label', themeButton.title);
    }
}

applyTheme(savedTheme || 'light');

themeButton?.addEventListener('click', function () {
    const nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
    localStorage.setItem('ceep-theme', nextTheme);
    applyTheme(nextTheme);
});

document.getElementById('search')?.addEventListener('input', function () {
    const term = this.value.toLowerCase();
    document.querySelectorAll('.searchable').forEach(function (section) {
        section.style.display = section.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
});
</script>
</body>
</html>
