-- Схема базы данных "Аттестация сотрудников"
-- Глава 11 книги "C++: от ученика до гуру"

CREATE TABLE departments (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE employees (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name     TEXT NOT NULL,
    post          TEXT NOT NULL,
    department_id INTEGER NOT NULL REFERENCES departments(id),
    hired_at      TEXT NOT NULL DEFAULT (date('now'))
);

CREATE TABLE sessions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT NOT NULL,
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    status     TEXT NOT NULL DEFAULT 'draft'
               CHECK (status IN ('draft', 'active', 'done'))
);

CREATE TABLE results (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id  INTEGER NOT NULL REFERENCES sessions(id),
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    score       INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
    UNIQUE (session_id, employee_id)
);

-- Начальные данные
INSERT INTO departments (name) VALUES ('Разработка'), ('Тестирование'), ('Внедрение');
