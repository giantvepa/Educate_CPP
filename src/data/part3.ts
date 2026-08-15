import type { Part } from "./types";

export const part3: Part = {
  id: "p3",
  level: "Мастер",
  levelSub: "главы 11–15",
  title: "Данные и SQLite",
  desc: "Проектируем схему базы, подключаем её из C++ через Qt SQL, наводим порядок слоями Dao/Service и учим грид искать и выгружать.",
  accent: "coral",
  chapters: [
    {
      id: "ch11",
      num: 11,
      title: "SQL и SQLite: язык данных",
      lead: "Четыре таблицы, три запроса — и вся предметная область «Аттестации» описана на языке, который понимают все СУБД.",
      minutes: 16,
      blocks: [
        {
          t: "p",
          x: "**SQLite** — база данных в одном файле: без сервера, без настройки, идеально для десктопа и встраивания. Язык у неё стандартный — **SQL**. Проектируем схему под нашу предметную область: отделы, сотрудники, сессии аттестации и результаты.",
        },
        { t: "h2", x: "Схема базы" },
        {
          t: "code",
          lang: "sql",
          title: "schema.sql",
          x: "CREATE TABLE departments (\n    id   INTEGER PRIMARY KEY AUTOINCREMENT,\n    name TEXT NOT NULL UNIQUE\n);\n\nCREATE TABLE employees (\n    id            INTEGER PRIMARY KEY AUTOINCREMENT,\n    full_name     TEXT NOT NULL,\n    post          TEXT NOT NULL,\n    department_id INTEGER NOT NULL REFERENCES departments(id),\n    hired_at      TEXT NOT NULL DEFAULT (date('now'))\n);\n\nCREATE TABLE sessions (\n    id         INTEGER PRIMARY KEY AUTOINCREMENT,\n    title      TEXT NOT NULL,\n    started_at TEXT NOT NULL DEFAULT (datetime('now')),\n    status     TEXT NOT NULL DEFAULT 'draft'\n               CHECK (status IN ('draft', 'active', 'done'))\n);\n\nCREATE TABLE results (\n    id          INTEGER PRIMARY KEY AUTOINCREMENT,\n    session_id  INTEGER NOT NULL REFERENCES sessions(id),\n    employee_id INTEGER NOT NULL REFERENCES employees(id),\n    score       INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),\n    UNIQUE (session_id, employee_id)   -- одна оценка на сотрудника за сессию\n);",
        },
        {
          t: "p",
          x: "Читается схема как договор: `NOT NULL` — поле обязательное, `UNIQUE` — дубли запрещены, `REFERENCES` — ссылка на другую таблицу (отдел сотрудника обязан существовать), `CHECK` — значение по правилам (оценка строго 1–5). База **сама** не пропустит мусор, даже если интерфейс промолчал.",
        },
        { t: "h2", x: "Три запроса на все случаи" },
        {
          t: "code",
          lang: "sql",
          title: "INSERT / SELECT / JOIN",
          x: "-- добавить данные\nINSERT INTO departments (name) VALUES ('Разработка'), ('Тестирование');\nINSERT INTO employees (full_name, post, department_id)\nVALUES ('Иванов Иван Иванович', 'ведущий инженер', 1);\n\n-- итоговая ведомость: сотрудник + отдел + средний балл\nSELECT e.full_name,\n       d.name            AS department,\n       ROUND(AVG(r.score), 2) AS avg_score\nFROM employees e\nJOIN departments d ON d.id = e.department_id\nLEFT JOIN results r ON r.employee_id = e.id\nGROUP BY e.id\nORDER BY avg_score DESC;\n\n-- обновить и удалить\nUPDATE employees SET post = 'главный инженер' WHERE id = 1;\nDELETE FROM employees WHERE id = 1;",
        },
        {
          t: "p",
          x: "`LEFT JOIN` здесь не случаен: сотрудник без оценок всё равно попадёт в ведомость (балл будет NULL), тогда как обычный `JOIN` его выбросит. `GROUP BY e.id` схлопывает несколько оценок в одну строку, `AVG` усредняет.",
        },
        {
          t: "note",
          kind: "tip",
          title: "Песочница",
          x: "Установите консольную утилиту `sqlite3` и прогоняйте запросы руками: `sqlite3 attestation.db < schema.sql`, затем `sqlite3 attestation.db` — интерактивная строка. Так SQL запоминается за вечер.",
        },
        {
          t: "note",
          kind: "task",
          title: "Задача",
          x: "Напишите запрос «лучший отдел»: department.name и средний балл его сотрудников, по убыванию. И второй: сотрудники, не прошедшие ни одной аттестации.",
        },
        {
          t: "key",
          items: [
            "SQLite = база в одном файле; схема — договор с ограничениями.",
            "SELECT + JOIN + GROUP BY закрывают 90% отчётных задач.",
            "LEFT JOIN сохраняет строки без связей — для полных ведомостей.",
          ],
        },
      ],
    },
    {
      id: "ch12",
      num: 12,
      title: "Подключение из C++: Qt SQL",
      lead: "QSqlDatabase, QSqlQuery и prepared statements: данные из формы наконец долетают до attestation.db.",
      minutes: 16,
      blocks: [
        {
          t: "p",
          x: "Модуль **Qt SQL** — тонкий слой над базами. Драйвер `QSQLITE` идёт в поставке Qt; добавляем его в CMake и получаем доступ к файлу базы как к обычному ресурсу приложения.",
        },
        {
          t: "code",
          lang: "cmake",
          title: "CMakeLists.txt — добавить Sql",
          x: "find_package(Qt6 REQUIRED COMPONENTS Widgets Sql)\ntarget_link_libraries(attestation PRIVATE Qt6::Widgets Qt6::Sql)",
        },
        { t: "h2", x: "Открытие базы" },
        {
          t: "code",
          lang: "cpp",
          title: "Database.cpp",
          x: '#include <QSqlDatabase>\n#include <QSqlError>\n#include <QSqlQuery>\n#include <QFile>\n#include <QDebug>\n\nbool openDatabase(const QString &path)\n{\n    auto db = QSqlDatabase::addDatabase("QSQLITE");\n    db.setDatabaseName(path);\n    if (!db.open()) {\n        qWarning() << "Не открыть базу:" << db.lastError().text();\n        return false;\n    }\n\n    // схема создаётся один раз: если таблиц нет — накатываем\n    QSqlQuery q;\n    q.exec("SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\'employees\'");\n    if (!q.next()) {\n        QFile schema(":/schema.sql");            // ресурс внутри exe\n        schema.open(QIODevice::ReadOnly);\n        for (const QString &stmt : QString(schema.readAll()).split(\';\', Qt::SkipEmptyParts))\n            if (!q.exec(stmt.trimmed()))\n                qWarning() << "Миграция:" << q.lastError().text();\n    }\n    return true;\n}',
        },
        {
          t: "p",
          x: 'Дальше — только **подготовленные запросы**. Склеивать строки с данными (`SELECT ... \'` + name + `\'`) нельзя: кавычка в фамилии О’Брайен сломает запрос, а злоумышленник через такое поле унесёт базу. `bindValue` отделяет код от данных — драйвер сам всё экранирует.',
        },
        { t: "h2", x: "CRUD-запросы" },
        {
          t: "code",
          lang: "cpp",
          title: "запись и чтение",
          x: 'int insertEmployee(const QString &name, const QString &post, int deptId)\n{\n    QSqlQuery q;\n    q.prepare("INSERT INTO employees (full_name, post, department_id) "\n              "VALUES (:name, :post, :dept)");\n    q.bindValue(":name", name);\n    q.bindValue(":post", post);\n    q.bindValue(":dept", deptId);\n    if (!q.exec()) { qWarning() << q.lastError().text(); return -1; }\n    return q.lastInsertId().toInt();\n}\n\nvoid loadEmployees()\n{\n    QSqlQuery q("SELECT id, full_name, post FROM employees ORDER BY full_name");\n    while (q.next()) {                          // построчный курсор\n        const int     id   = q.value(0).toInt();\n        const QString name = q.value(1).toString();\n        const QString post = q.value(2).toString();\n        qDebug() << id << name << post;\n    }\n}',
        },
        {
          t: "note",
          kind: "warn",
          title: "Транзакции для серий",
          x: "Сто INSERT подряд без транзакции — сто синхронизаций файла, медленно в разы. Оберните серию: `db.transaction(); ... db.commit();` (при ошибке — `rollback()`). Правило «всё или ничего» в подарок.",
        },
        {
          t: "note",
          kind: "task",
          title: "Задача",
          x: "Подключите EmployeeForm к insertEmployee: сохранение формы пишет строку в базу, а при старте loadEmployees наполняет модель таблицы.",
        },
        {
          t: "key",
          items: [
            "addDatabase(\"QSQLITE\") + setDatabaseName + open — весь рецепт подключения.",
            "Только prepared statements: bindValue спасает от инъекций и кавычек.",
            "Схему накатываем при первом запуске; серии записей — в транзакции.",
          ],
        },
      ],
    },
    {
      id: "ch13",
      num: 13,
      title: "Грид, привязанный к базе",
      lead: "QSqlTableModel и QSqlRelationalTableModel: таблица читает и пишет в SQLite без единого ручного запроса.",
      minutes: 14,
      blocks: [
        {
          t: "p",
          x: "Qt умеет показывать таблицу базы **напрямую**: `QSqlTableModel` — это готовая модель поверх SELECT. Отредактировали ячейку — модель сама выполнила UPDATE. Нам остаётся настроить.",
        },
        { t: "h2", x: "Редактируемый реестр" },
        {
          t: "code",
          lang: "cpp",
          title: "MainWindow.cpp",
          x: '#include <QSqlTableModel>\n\nauto *dbModel = new QSqlTableModel(this, QSqlDatabase::database());\ndbModel->setTable("employees");\ndbModel->setEditStrategy(QSqlTableModel::OnFieldChange); // UPDATE при потере фокуса\ndbModel->setHeaderData(1, Qt::Horizontal, "ФИО");\ndbModel->setHeaderData(2, Qt::Horizontal, "Должность");\ndbModel->select();                                  // выполнить SELECT *\n\nm_table->setModel(dbModel);\nm_table->hideColumn(0);   // id — служебный, прячем\nm_table->hideColumn(3);   // department_id покажем красивее ниже',
        },
        {
          t: "p",
          x: "`setEditStrategy` задаёт момент записи: `OnFieldChange` — сразу, `OnRowChange` — при переходе на другую строку, `OnManualSubmit` — только по команде `submitAll()` (идеально для кнопки «Сохранить» с откатом `revertAll()`).",
        },
        { t: "h2", x: "Связи без боли: relational-модель" },
        {
          t: "p",
          x: "Голая таблица покажет в колонке отдела число 1 вместо «Разработка». **QSqlRelationalTableModel** подменяет внешний ключ выпадающим списком из связанной таблицы:",
        },
        {
          t: "code",
          lang: "cpp",
          title: "колонка «Отдел» как список",
          x: '#include <QSqlRelationalTableModel>\n#include <QSqlRelationalDelegate>\n\nauto *rel = new QSqlRelationalTableModel(this, QSqlDatabase::database());\nrel->setTable("employees");\nrel->setRelation(3, QSqlRelation("departments", "id", "name"));\n//                ^ колонка   ^ таблица        ^ключ  ^что показывать\nrel->setHeaderData(3, Qt::Horizontal, "Отдел");\nrel->select();\n\nm_table->setModel(rel);\nm_table->setItemDelegate(new QSqlRelationalDelegate(m_table)); // combo при редактировании',
        },
        {
          t: "note",
          kind: "guru",
          title: "Когда это уместно",
          x: "QSql*-модели — конвейер для простых реестров: справочники, журналы, CRUD-экраны. Сложная логика (каскады, валидация, вычисления) всё равно живёт в сервисном слое — о нём следующая глава. Не тащите бизнес-правила в делегаты.",
        },
        {
          t: "note",
          kind: "task",
          title: "Задача",
          x: "Переведите стратегию на OnManualSubmit, добавьте кнопки «Сохранить» (submitAll) и «Отменить» (revertAll) и добейтесь, чтобы отмена возвращала исходные значения.",
        },
        {
          t: "key",
          items: [
            "QSqlTableModel = SELECT * с живым редактированием.",
            "setRelation превращает id в читаемое имя и выпадающий список.",
            "OnManualSubmit + submitAll/revertAll = «черновик» правок.",
          ],
        },
      ],
    },
    {
      id: "ch14",
      num: 14,
      title: "Архитектура: слои Dao и Service",
      lead: "Разносим код по этажам: Dao говорит с базой, Service знает правила, интерфейс лишь показывает. Проект переживёт смену базы.",
      minutes: 18,
      blocks: [
        {
          t: "p",
          x: "К этой главе SQL расползся по обработчикам кнопок. Останавливаемся и наводим порядок: **Dao** (data access object) — единственный, кто знает SQL; **Service** — правила предметной области; **UI** — только показывает и слушает. Замена SQLite на PostgreSQL или сервер затронет один класс.",
        },
        {
          t: "figure",
          kind: "layers",
          caption: "Слои «Аттестации»: интерфейс → сервис → Dao → SQLite. Стрелки зависимостей идут только вниз.",
        },
        { t: "h2", x: "Слой Dao" },
        {
          t: "code",
          lang: "cpp",
          title: "dao/EmployeeDao.h",
          x: '#pragma once\n#include <QSqlDatabase>\n#include <optional>\n#include <vector>\n\nstruct Employee {\n    int id = 0;\n    QString name, post;\n    int departmentId = 0;\n};\n\nclass EmployeeDao\n{\npublic:\n    explicit EmployeeDao(QSqlDatabase db) : m_db(std::move(db)) {}\n\n    std::vector<Employee>          all() const;\n    std::optional<Employee>        byId(int id) const;\n    int                            insert(const Employee &e);\n    bool                           update(const Employee &e);\n    bool                           remove(int id);\n\nprivate:\n    QSqlDatabase m_db;   // только здесь живёт SQL\n};',
        },
        { t: "h2", x: "Слой Service" },
        {
          t: "code",
          lang: "cpp",
          title: "service/AttestationService.cpp — оценка с транзакцией",
          x: 'bool AttestationService::grade(int sessionId, int employeeId, int score)\n{\n    if (score < 1 || score > 5)            // правило предметной области\n        return false;\n    if (state(sessionId) != SessionState::Active)\n        return false;                      // оценивать можно только идущую сессию\n\n    m_db.transaction();                    // всё или ничего\n    QSqlQuery q(m_db);\n    q.prepare("INSERT INTO results (session_id, employee_id, score) "\n              "VALUES (:s, :e, :score) "\n              "ON CONFLICT(session_id, employee_id) DO UPDATE SET score = :score");\n    q.bindValue(":s", sessionId);\n    q.bindValue(":e", employeeId);\n    q.bindValue(":score", score);\n\n    if (!q.exec()) { m_db.rollback(); return false; }\n    m_db.commit();\n    emit resultsChanged(sessionId);        // интерфейс перерисуется\n    return true;\n}',
        },
        {
          t: "p",
          x: "Смотрите, что произошло: правило «оценка 1–5 и только для активной сессии» сформулировано **один раз**, на своём этаже. Кнопка, веб-API и будущий консольный импорт пройдут через один и тот же `grade()` — обойти правила нельзя, не взломав сам сервис.",
        },
        {
          t: "note",
          kind: "tip",
          title: "Границы слоёв",
          x: "UI знает Service. Service знает Dao и структуры данных. Dao знает SQL. Интерфейс **никогда** не пишет QSqlQuery, Dao **никогда** не решает, можно ли ставить двойку. Нарушение границы — будущий баг.",
        },
        {
          t: "note",
          kind: "task",
          title: "Задача",
          x: "Вынесите весь SQL из MainWindow в EmployeeDao, а в сервис добавьте метод `avgScore(int employeeId)`. Интерфейс должен работать без изменений.",
        },
        {
          t: "key",
          items: [
            "Три этажа: UI → Service → Dao; зависимости только вниз.",
            "Бизнес-правила — в сервисе, в единственном экземпляре.",
            "Транзакция + проверка состояния до записи — дисциплина Мастера.",
          ],
        },
      ],
    },
    {
      id: "ch15",
      num: 15,
      title: "Поиск, фильтр и отчёты",
      lead: "QSortFilterProxyModel ищет по всем колонкам, CSV выгружает ведомость, а QPainter рисует печатный отчёт.",
      minutes: 15,
      blocks: [
        {
          t: "p",
          x: "Реестр на тысячу строк без поиска — пытка. Правильный инструмент — **прокси-модель**: она встаёт **между** моделью и видом, не трогая данные, и решает, какие строки показать и в каком порядке.",
        },
        { t: "h2", x: "Живой поиск" },
        {
          t: "code",
          lang: "cpp",
          title: "MainWindow.cpp",
          x: '#include <QSortFilterProxyModel>\n\nm_proxy = new QSortFilterProxyModel(this);\nm_proxy->setSourceModel(m_model);            // настоящая модель — под капотом\nm_proxy->setFilterKeyColumn(-1);             // -1 = искать во всех колонках\nm_proxy->setFilterCaseSensitivity(Qt::CaseInsensitive);\nm_proxy->setSortRole(Qt::DisplayRole);\n\nm_table->setModel(m_proxy);                  // вид смотрит на прокси\nm_table->setSortingEnabled(true);            // клик по шапке сортирует\n\nconnect(m_search, &QLineEdit::textChanged, this,\n        [this](const QString &text) {\n    m_proxy->setFilterFixedString(text);     // ввели «ива» — остались Ивановы\n});',
        },
        {
          t: "p",
          x: "Тонкость, на которой спотыкаются: индексы теперь **проксированные**. Чтобы по выбранной строке дойти до данных, переводите: `m_model->at(m_proxy->mapToSource(idx).row())`. В обратную сторону — `mapFromSource`.",
        },
        { t: "h2", x: "Экспорт в CSV" },
        {
          t: "code",
          lang: "cpp",
          title: "export.cpp",
          x: '#include <QFile>\n#include <QTextStream>\n\nvoid exportCsv(const QString &path, QAbstractItemModel *m)\n{\n    QFile f(path);\n    if (!f.open(QIODevice::WriteOnly | QIODevice::Text)) return;\n    QTextStream out(&f);\n\n    for (int r = 0; r < m->rowCount(); ++r) {\n        QStringList row;\n        for (int c = 0; c < m->columnCount(); ++c)\n            row << \'"\' + m->index(r, c).data().toString()\n                       .replace(\'"\', "\\"\\"") + \'"\';     // экранируем кавычки\n        out << row.join(\';\') << \'\\n\';                    // \';\' — для русского Excel\n    }\n}',
        },
        {
          t: "p",
          x: "Для печатной ведомости есть **QPdfWriter** — рисуете тем же QPainter, что и на экране, а получаете PDF: заголовок сессии, таблица оценок, подпись председателя. Один навык рисования — два носителя.",
        },
        {
          t: "note",
          kind: "tip",
          title: "Сортировка чисел",
          x: "Если в колонке числа хранятся строками, сортировка будет «10, 2, 3...». Лечится override filterAcceptsRow/lessThan в наследнике прокси или хранением чисел в QVariant как чисел.",
        },
        {
          t: "note",
          kind: "task",
          title: "Задача",
          x: "Добавьте второй фильтр — по отделу из дерева (глава 9): setFilterFixedString по колонке отдела, и кнопку «Экспорт» с QFileDialog, вызывающую exportCsv для прокси-модели.",
        },
        {
          t: "key",
          items: [
            "Прокси-модель фильтрует и сортирует, не касаясь данных.",
            "mapToSource/mapFromSource — перевод индексов через прокси.",
            "CSV с «;» и экранированием кавычек; PDF — через QPdfWriter.",
          ],
        },
      ],
    },
  ],
};
