<?php
declare(strict_types=1);

const DB_HOST = '127.0.0.1';
const DB_NAME = 'ceep_portal';
const DB_USER = 'root';
const DB_PASS = '';

session_start();

function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    return $pdo;
}

function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function current_user(): ?array
{
    if (empty($_SESSION['user_id'])) {
        return null;
    }

    $stmt = db()->prepare('SELECT * FROM users WHERE id = ? AND active = 1');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();

    return $user ?: null;
}

function require_login(): array
{
    $user = current_user();
    if (!$user) {
        header('Location: index.php');
        exit;
    }

    return $user;
}

function role_label(string $role): string
{
    return [
        'administrador' => 'Administrador',
        'direcao' => 'Direcao',
        'secretaria' => 'Secretaria',
        'professor' => 'Professor',
        'aluno' => 'Aluno',
    ][$role] ?? $role;
}

function can(string $permission, array $user): bool
{
    $role = $user['role'];

    $rules = [
        'manage_users' => ['administrador', 'direcao', 'secretaria'],
        'manage_classes' => ['administrador', 'direcao', 'secretaria'],
        'manage_rooms' => ['administrador', 'direcao', 'secretaria'],
        'create_materials' => ['administrador', 'direcao', 'professor'],
        'create_schedules' => ['administrador', 'direcao', 'secretaria', 'professor'],
        'view_admin' => ['administrador', 'direcao', 'secretaria', 'professor'],
    ];

    return in_array($role, $rules[$permission] ?? [], true);
}

function allowed_roles_to_create(string $role): array
{
    return match ($role) {
        'administrador' => ['administrador', 'direcao', 'secretaria', 'professor', 'aluno'],
        'direcao' => ['secretaria', 'professor', 'aluno'],
        'secretaria' => ['professor', 'aluno'],
        default => [],
    };
}

function redirect_with(string $type, string $message): never
{
    $_SESSION['flash'] = ['type' => $type, 'message' => $message];
    header('Location: index.php');
    exit;
}

function flash(): ?array
{
    $flash = $_SESSION['flash'] ?? null;
    unset($_SESSION['flash']);
    return $flash;
}
