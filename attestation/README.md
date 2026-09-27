# Аттестация сотрудников

Сквозной проект из книги **«C++: от ученика до гуру»** (Кулханов В. М.).

Десктопное приложение на Qt 6 + REST-сервер на C++ + веб-интерфейс.
Данные хранятся в SQLite.

## Сборка

```bash
cmake -B build -DCMAKE_PREFIX_PATH=/path/to/Qt/6.x/gcc_64
cmake --build build --parallel
```

## Запуск

```bash
# Десктоп
./build/attestation-ui

# REST API (порт 8080)
./build/attestation-api
```

## Структура

- `src/main.cpp` — точка входа десктопа
- `src/ui/` — интерфейс (MainWindow, EmployeeForm, SessionWindow)
- `src/core/` — бизнес-логика (EmployeeDao, SessionService)
- `src/api/` — REST-сервер
- `web/` — веб-интерфейс
- `schema.sql` — схема базы данных
