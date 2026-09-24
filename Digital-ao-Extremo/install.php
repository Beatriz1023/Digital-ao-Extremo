<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

$status = [];
$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $server = new PDO('mysql:host=' . DB_HOST . ';charset=utf8mb4', DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);

        $server->exec('CREATE DATABASE IF NOT EXISTS `' . DB_NAME . '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        $status[] = 'Banco criado/verificado.';

        $pdo = db();

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS classes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(120) NOT NULL,
                course VARCHAR(120) NOT NULL,
                grade VARCHAR(60) NOT NULL,
                shift VARCHAR(60) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS rooms (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(120) NOT NULL,
                capacity INT NOT NULL DEFAULT 30,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS subjects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(120) NOT NULL UNIQUE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(160) NOT NULL,
                registration VARCHAR(80) NOT NULL UNIQUE,
                email VARCHAR(160) NULL,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('administrador','direcao','secretaria','professor','aluno') NOT NULL,
                class_id INT NULL,
                active TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS materials (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(180) NOT NULL,
                description TEXT NULL,
                file_path VARCHAR(255) NULL,
                subject_id INT NOT NULL,
                class_id INT NOT NULL,
                teacher_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (subject_id) REFERENCES subjects(id),
                FOREIGN KEY (class_id) REFERENCES classes(id),
                FOREIGN KEY (teacher_id) REFERENCES users(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS schedules (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(180) NOT NULL,
                description TEXT NULL,
                subject_id INT NOT NULL,
                class_id INT NOT NULL,
                room_id INT NOT NULL,
                teacher_id INT NOT NULL,
                start_at DATETIME NOT NULL,
                end_at DATETIME NOT NULL,
                created_by INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (subject_id) REFERENCES subjects(id),
                FOREIGN KEY (class_id) REFERENCES classes(id),
                FOREIGN KEY (room_id) REFERENCES rooms(id),
                FOREIGN KEY (teacher_id) REFERENCES users(id),
                FOREIGN KEY (created_by) REFERENCES users(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");

        $status[] = 'Tabelas criadas/verificadas.';

        $pdo->exec("INSERT IGNORE INTO classes (id, name, course, grade, shift) VALUES
            (1, '2o Ano B - Informatica', 'Informatica', '2o Ano', 'Manha')");
        $pdo->exec("INSERT IGNORE INTO rooms (id, name, capacity) VALUES
            (1, 'Laboratorio de Informatica', 35),
            (2, 'Sala 04', 40)");
        $pdo->exec("INSERT IGNORE INTO subjects (id, name) VALUES
            (1, 'Programacao Web'),
            (2, 'Matematica'),
            (3, 'Portugues'),
            (4, 'Biologia')");

        $count = (int) $pdo->query("SELECT COUNT(*) FROM users WHERE registration = 'admin'")->fetchColumn();
        if ($count === 0) {
            $stmt = $pdo->prepare('INSERT INTO users (name, registration, email, password_hash, role) VALUES (?, ?, ?, ?, ?)');
            $stmt->execute([
                'Administrador CEEP',
                'admin',
                'admin@ceep.local',
                password_hash('admin123', PASSWORD_DEFAULT),
                'administrador',
            ]);
            $status[] = 'Administrador inicial criado.';
        } else {
            $status[] = 'Administrador inicial ja existia.';
        }

        if (!is_dir(__DIR__ . '/uploads')) {
            mkdir(__DIR__ . '/uploads', 0777, true);
        }
        $status[] = 'Pasta de uploads verificada.';
    } catch (Throwable $exception) {
        $error = $exception->getMessage();
    }
}
?>
<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instalar Portal CEEP</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <main class="section">
        <article class="card">
            <h1>Instalacao do Portal CEEP</h1>
            <p class="muted">Clique para criar o banco MySQL, tabelas e o usuario administrador inicial.</p>
            <?php if ($error): ?>
                <div class="alert danger">Erro: <?= e($error) ?></div>
            <?php endif; ?>
            <?php foreach ($status as $item): ?>
                <div class="alert success"><?= e($item) ?></div>
            <?php endforeach; ?>
            <form method="post">
                <button class="primary-btn" type="submit">Instalar / Atualizar banco</button>
                <a class="ghost-btn" href="index.php">Ir para o portal</a>
            </form>
            <p class="muted">Login inicial: <strong>admin</strong> | Senha: <strong>admin123</strong></p>
        </article>
    </main>
</body>
</html>
