import type { Part } from "./types";

export const part4: Part = {
  id: "p4",
  level: "Гуру",
  levelSub: "главы 16–20",
  title: "Веб и большая архитектура",
  desc: "Выносим логику в REST-сервер на C++, подключаем к нему десктоп и браузер, формализуем жизненный цикл сессии и собираем всё в единую архитектуру.",
  accent: "blue",
  chapters: [
    {
      id: "ch16",
      num: 16,
      title: "REST-сервер на C++",
      lead: "cpp-httplib + nlohmann/json: наша база данных становится доступна по HTTP за один вечер.",
      minutes: 18,
      blocks: [
        {
          t: "p",
          x: "Десктоп — не единственный клиент наших данных. Отделу нужен веб-доступ, а мобильным — API. Правильный ход — не копировать логику, а вынести её в **сервис**: маленькая программа на том же C++, которая слушает порт и отвечает на HTTP-запросы. Библиотека **cpp-httplib** — один заголовочный файл, ноль боли.",
        },
        {
          t: "code",
          lang: "bash",
          title: "зависимости (vcpkg или git submodule)",
          x: "vcpkg install cpp-httplib nlohmann-json\n# или: git submodule add https://github.com/yhirose/cpp-httplib externals/httplib",
        },
        { t: "h2", x: "Сервер attestation-api" },
        {
          t: "code",
          lang: "cpp",
          title: "api/main.cpp",
          x: '#include <httplib.h>\n#include <nlohmann/json.hpp>\n#include "dao/EmployeeDao.h"\n\nusing json = nlohmann::json;\n\nint main()\n{\n    if (!openDatabase("attestation.db")) return 1;\n    EmployeeDao dao;\n\n    httplib::Server svr;\n    svr.set_default_headers({{"Access-Control-Allow-Origin", "*"}}); // CORS для браузера\n\n    // GET /api/employees  →  JSON-массив\n    svr.Get("/api/employees", [&](const httplib::Request &,\n                                  httplib::Response &res) {\n        json arr = json::array();\n        for (const auto &e : dao.all())\n            arr.push_back({{"id", e.id}, {"name", e.name},\n                           {"post", e.post}, {"dept", e.dept}});\n        res.set_content(arr.dump(), "application/json");\n    });\n\n    // POST /api/employees  ←  JSON-объект\n    svr.Post("/api/employees", [&](const httplib::Request &req,\n                                   httplib::Response &res) {\n        const auto body = json::parse(req.body, nullptr, /*allow_exceptions=*/false);\n        if (body.is_discarded()) { res.status = 400; return; }\n\n        const int id = dao.insert({body.value("name", ""),\n                                   body.value("post", ""),\n                                   body.value("dept", "")});\n        res.set_content(json{{"id", id}}.dump(), "application/json");\n    });\n\n    svr.listen("0.0.0.0", 8080);\n}',
        },
        {
          t: "p",
          x: 'Важные детали. `json::parse(..., false)` не бросает исключение на мусорном теле, а возвращает `is_discarded()` — так мы отвечаем честным **400 Bad Request** вместо падения сервера. `body.value("name", "")` — безопасное чтение с дефолтом. Заголовок CORS разрешает запросы из браузера (подробнее в главе 18).',
        },
        {
          t: "code",
          lang: "bash",
          title: "проверяем curl-ом",
          x: "curl http://localhost:8080/api/employees\ncurl -X POST http://localhost:8080/api/employees \\\n     -d '{\"name\": \"Кузнецов К. К.\", \"post\": \"инженер\", \"dept\": \"Разработка\"}'",
        },
        {
          t: "note",
          kind: "guru",
          title: "Сервис переиспользует Dao",
          x: "Обратите внимание: сервер линкует тот же EmployeeDao и AttestationService, что и десктоп. Правила главы 14 окупаются: один слой данных — два клиента. Альтернативы для больших нагрузок — Drogon и Oat++.",
        },
        {
          t: "note",
          kind: "task",
          title: "Задача",
          x: "Добавьте эндпоинты GET /api/sessions и POST /api/sessions/:id/grades/:emp со валидацией оценки 1–5 через AttestationService::grade.",
        },
        {
          t: "key",
          items: [
            "cpp-httplib: Get/Post-обработчики и listen — весь HTTP-сервер.",
            "nlohmann/json: dump() в ответ, parse без исключений на вход.",
            "Сервер и десктоп делят Dao и Service — правила в одном месте.",
          ],
        },
      ],
    },
    {
      id: "ch17",
      num: 17,
      title: "HTTP-клиент в приложении",
      lead: "QNetworkAccessManager: десктоп учится ходить к серверу асинхронно, не подвешивая интерфейс.",
      minutes: 15,
      blocks: [
        {
          t: "p",
          x: "Теперь десктоп умеет два режима: локальная база или сервер. Запросы в Qt выполняет **QNetworkAccessManager**, и главное правило — **никогда не ждать ответ синхронно**: интерфейс замрёт. Запрос уходит, а результат приходит сигналом `finished`.",
        },
        { t: "h2", x: "Загрузка сотрудников с сервера" },
        {
          t: "code",
          lang: "cpp",
          title: "MainWindow.cpp",
          x: '#include <QJsonDocument>\n#include <QNetworkAccessManager>\n#include <QNetworkReply>\n\nvoid MainWindow::loadFromServer()\n{\n    auto *net = new QNetworkAccessManager(this);\n    QNetworkRequest req{QUrl("http://localhost:8080/api/employees")};\n\n    QNetworkReply *reply = net->get(req);\n    statusBar()->showMessage("Загружаем данные...");\n\n    connect(reply, &QNetworkReply::finished, this, [this, reply, net] {\n        if (reply->error() != QNetworkReply::NoError) {\n            statusBar()->showMessage("Сервер недоступен: " + reply->errorString());\n        } else {\n            const auto doc = QJsonDocument::fromJson(reply->readAll());\n            for (const auto &v : doc.array()) {\n                const auto o = v.toObject();\n                m_model->append({o["id"].toInt(), o["name"].toString(),\n                                 o["post"].toString(), o["dept"].toString()});\n            }\n            statusBar()->showMessage("Загружено строк: " +\n                QString::number(doc.array().size()));\n        }\n        reply->deleteLater();   // освобождаем в цикле событий\n        net->deleteLater();\n    });\n}',
        },
        { t: "h2", x: "Отправка данных: POST с JSON" },
        {
          t: "code",
          lang: "cpp",
          title: "сохранение формы на сервер",
          x: 'void MainWindow::pushEmployee(const QString &name, const QString &post)\n{\n    QJsonObject obj;\n    obj["name"] = name;\n    obj["post"] = post;\n    obj["dept"] = "Разработка";\n\n    QNetworkRequest req{QUrl("http://localhost:8080/api/employees")};\n    req.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");\n\n    QNetworkReply *reply = m_net->post(req, QJsonDocument(obj).toJson());\n    connect(reply, &QNetworkReply::finished, this, [reply] {\n        if (reply->error() == QNetworkReply::NoError)\n            qDebug() << "Создан:" << reply->readAll();   // {"id": 42}\n        reply->deleteLater();\n    });\n}',
        },
        {
          t: "note",
          kind: "warn",
          title: "Жизненный цикл reply",
          x: "QNetworkReply не удаляется сам: без `deleteLater()` — утечка на каждый запрос. И не читайте тело до сигнала `finished` — оно приходит кусками (`readyRead`), если не дождались конца.",
        },
        {
          t: "p",
          x: "Итог главы — переключатель режимов: `Settings → «Сервер» / «Локальная база»`. Обе ветки сходятся в EmployeeTableModel, и интерфейс не замечает подмены. Именно так устроены «офлайн-первые» приложения: модель одна, транспорт меняется.",
        },
        {
          t: "note",
          kind: "task",
          title: "Задача",
          x: "Добавьте индикатор статуса сервера в статусбар: по таймеру QTimer раз в 5 секунд делайте GET и рисуйте зелёную/красную точку (QLabel с pixmap).",
        },
        {
          t: "key",
          items: [
            "QNetworkAccessManager асинхронен: ответ приходит сигналом finished.",
            "JSON в обе стороны: QJsonObject ↔ QJsonDocument::toJson/fromJson.",
            "reply->deleteLater() обязателен; модель не знает о транспорте.",
          ],
        },
      ],
    },
    {
      id: "ch18",
      num: 18,
      title: "Веб-интерфейс поверх API",
      lead: "Браузер как второй клиент: страница на чистом JS потребляет наш C++-сервис, CORS и авторизация.",
      minutes: 16,
      blocks: [
        {
          t: "p",
          x: "Сервер из главы 16 говорит по-джентльменски — JSON поверх HTTP. Значит, клиентом может быть кто угодно: браузер, мобильное приложение, скрипт. Соберём страницу «Ведомость аттестации» без единого фреймворка — fetch и DOM.",
        },
        {
          t: "figure",
          kind: "web",
          caption: "Два клиента — один сервис: браузер и десктоп ходят в один REST API, а он — в единственную SQLite.",
        },
        { t: "h2", x: "Страница-клиент" },
        {
          t: "code",
          lang: "html",
          title: "web/index.html (главное — скрипт)",
          x: '<table id="grid"></table>\n<script>\n  const API = "http://localhost:8080/api";\n\n  async function loadEmployees() {\n    const res  = await fetch(API + "/employees");\n    if (!res.ok) throw new Error("HTTP " + res.status);\n    const rows = await res.json();\n\n    document.querySelector("#grid").innerHTML = rows\n      .map(e => `<tr><td>${e.name}</td><td>${e.post}</td><td>${e.dept}</td></tr>`)\n      .join("");\n  }\n\n  loadEmployees().catch(err => console.error(err));\n</script>',
        },
        {
          t: "p",
          x: "Здесь происходит ровно то же, что в главе 17: запрос → JSON → отрисовка. Только вместо сигналов — async/await. Если страница открыта с другого origin (файл, другой порт), браузер заблокирует ответ без заголовка **Access-Control-Allow-Origin** — его наш сервер уже отдаёт (глава 16).",
        },
        { t: "h2", x: "Встроить браузер в десктоп" },
        {
          t: "p",
          x: 'Хотите веб-отчёты прямо внутри приложения — **Qt WebEngine** рендерит страницу в виджете: `view->load(QUrl("http://localhost:8080"))`. Один процесс, ноль деплоя фронтенда. Цена — размер дистрибутива (+100 МБ Chromium), поэтому в продакшене чаще разводят: десктоп отдельно, веб отдельно.',
        },
        { t: "h2", x: "Авторизация" },
        {
          t: "p",
          x: "Пока API открыт всем. Минимально честная защита — токен: клиент шлёт заголовок `Authorization: Bearer <token>`, сервер проверяет его в middleware-обработчике cpp-httplib (`svr.set_pre_routing_handler`) и отвечает **401** чужим. Пароли в базе — только хэшами (bcrypt/argon2), никогда в открытом виде.",
        },
        {
          t: "note",
          kind: "task",
          title: "Задача",
          x: "Добавьте на страницу форму «Добавить сотрудника» с fetch-POST и обновлением таблицы без перезагрузки. Серверу — pre-routing проверку токена.",
        },
        {
          t: "key",
          items: [
            "JSON-API делает браузер полноценным вторым клиентом.",
            "CORS-заголовок на сервере разрешает запросы с других origin.",
            "Токен в Authorization + 401 чужим — минимальная честная авторизация.",
          ],
        },
      ],
    },
    {
      id: "ch19",
      num: 19,
      title: "Бизнес-логика: жизненный цикл сессии",
      lead: "Конечный автомат draft → active → done, инварианты и транзакции: код, которому можно доверить кадровые решения.",
      minutes: 16,
      blocks: [
        {
          t: "p",
          x: "Сессия аттестации — не строка в таблице, а **процесс** с правилами: черновик можно править, оценки ставятся только в активной сессии, после утверждения итоги заморожены. Формализуем это конечным автоматом — и ни одна кнопка, ни один API-запрос не смогут нарушить порядок.",
        },
        { t: "h2", x: "Машина состояний" },
        {
          t: "code",
          lang: "cpp",
          title: "service/SessionService.cpp",
          x: 'enum class State { Draft, Active, Done };\n\n// таблица разрешённых переходов — единственный источник правды\nstatic bool canTransition(State from, State to)\n{\n    return (from == State::Draft  && to == State::Active)\n        || (from == State::Active && to == State::Done);\n    // обратно нельзя: утверждённые итоги не пересматриваются\n}\n\nbool SessionService::transition(int sessionId, State to)\n{\n    const State from = state(sessionId);          // SELECT status ...\n    if (!canTransition(from, to))\n        return false;                             // тихий отказ — клиент получит 409\n\n    QSqlQuery q(m_db);\n    q.prepare("UPDATE sessions SET status = :to "\n              "WHERE id = :id AND status = :from");   // оптимистично: guard в самом SQL\n    q.bindValue(":to",   toString(to));\n    q.bindValue(":id",   sessionId);\n    q.bindValue(":from", toString(from));\n    q.exec();\n    return q.numRowsAffected() == 1;   // 0 — кто-то успел раньше нас\n}',
        },
        {
          t: "p",
          x: "Два приёма, которые отличают гуру. Первый — **таблица переходов** вместо россыпи if: правила читаются как таблица истинности, новые состояния добавляются строкой. Второй — **оптимистичная блокировка**: условие `WHERE status = :from` в самом UPDATE. Если два оператора одновременно жмут «Утвердить», numRowsAffected вернёт 1 ровно одному — второй получит честный отказ без единого мьютекса.",
        },
        { t: "h2", x: "Итоги под защитой транзакции" },
        {
          t: "code",
          lang: "cpp",
          title: "утверждение сессии",
          x: 'bool SessionService::approve(int sessionId)\n{\n    if (!m_db.transaction()) return false;\n\n    QSqlQuery q(m_db);\n    q.prepare("SELECT COUNT(*) FROM results WHERE session_id = :id");\n    q.bindValue(":id", sessionId);\n    q.exec(); q.next();\n    if (q.value(0).toInt() == 0) {          // пустую сессию не утверждаем\n        m_db.rollback();\n        return false;\n    }\n\n    const bool ok = transition(sessionId, State::Done);\n    ok ? m_db.commit() : m_db.rollback();\n    return ok;\n}',
        },
        {
          t: "note",
          kind: "guru",
          title: "Проверяемо и без UI",
          x: "Вся логика главы — чистый C++ без единого виджета. Значит, её можно покрыть тестами (Catch2: две строки — и `canTransition` проверен на всех парах состояний) и прогнать в CI. Интерфейс — лишь тонкая плёнка над сервисом.",
        },
        {
          t: "note",
          kind: "task",
          title: "Задача",
          x: "Напишите Catch2-тесты на canTransition (все 9 пар) и на grade(): оценка 0 и 6 отклоняются, в Done-сессии оценка не ставится.",
        },
        {
          t: "key",
          items: [
            "Состояния — enum + таблица переходов, никаких if-лабиринтов.",
            "Guard `WHERE status = :from` решает гонки на уровне SQL.",
            "Логика без UI тестируется Catch2 и живёт в CI.",
          ],
        },
      ],
    },
    {
      id: "ch20",
      num: 20,
      title: "Финальная архитектура и путь дальше",
      lead: "Собираем проект в три цели CMake, раскладываем по слоям и намечаем маршрут за пределы книги.",
      minutes: 14,
      blocks: [
        {
          t: "p",
          x: "Финал — не новые технологии, а порядок. Разносим код по целям сборки: **core** (Dao + Service, без единого виджета), **attestation-ui** (десктоп) и **attestation-api** (сервер). Зависимости — строго вниз.",
        },
        {
          t: "code",
          lang: "cmake",
          title: "CMakeLists.txt — три цели",
          x: 'cmake_minimum_required(VERSION 3.16)\nproject(attestation LANGUAGES CXX)\nset(CMAKE_CXX_STANDARD 17)\nset(CMAKE_AUTOMOC ON)\n\nfind_package(Qt6 REQUIRED COMPONENTS Widgets Sql Network)\n\nadd_library(core STATIC            # сердце: Dao + Service\n    core/EmployeeDao.cpp\n    core/SessionService.cpp)\ntarget_link_libraries(core PUBLIC Qt6::Sql)\n\nadd_executable(attestation-ui ui/main.cpp ui/MainWindow.cpp)\ntarget_link_libraries(attestation-ui PRIVATE core Qt6::Widgets Qt6::Network)\n\nadd_executable(attestation-api api/main.cpp)\ntarget_link_libraries(attestation-api PRIVATE core httplib::httplib)',
        },
        {
          t: "figure",
          kind: "layers",
          caption: "Итог пути: единое ядро core, два клиента — десктоп и веб. Стрелки зависимостей идут только вниз.",
        },
        { t: "h2", x: "Что мы построили" },
        {
          t: "ul",
          items: [
            "Десктоп: окна, формы, грид с прокси-поиском, дерево отделов, диалоги и CSV/PDF-отчёты.",
            "Данные: SQLite-схема с ограничениями, prepared statements, транзакции, QSql-модели.",
            "Архитектура: слои UI → Service → Dao, единые правила для всех клиентов.",
            "Веб: REST API на cpp-httplib, браузер-клиент на fetch, токен-авторизация.",
            "Надёжность: конечный автомат сессий, оптимистичные блокировки, тесты на логике.",
          ],
        },
        { t: "h2", x: "Куда расти" },
        {
          t: "ul",
          items: [
            "**Язык**: move-семантика, smart pointers, концепты C++20,Ranges — «Effective Modern C++» Скотта Мейерса.",
            "**Qt глубже**: многопоточность (QThread, QtConcurrent), QML для современных интерфейсов, модель/делегаты с кастомной отрисовкой.",
            "**Данные**: индексы и EXPLAIN QUERY PLAN, миграции версий, репликация SQLite (LiteFS), а затем — PostgreSQL.",
            "**Веб**: WebSocket для живых обновлений, OpenAPI-описание вашего API, контейнеризация сервера.",
          ],
        },
        {
          t: "note",
          kind: "tip",
          title: "Главный урок книги",
          x: "Гуру — не тот, кто знает все виджеты. Гуру — тот, кто разводит данные, правила и отображение по слоям, держит правила в одном месте и пишет код, который переживёт смену базы, транспорта и интерфейса. Вы теперь умеете ровно это.",
        },
        {
          t: "key",
          items: [
            "Три цели CMake: core (библиотека), ui, api — зависимости только вниз.",
            "Система «Аттестация» собрана: от QWidget до REST и браузера.",
            "Дальше — язык глубже, Qt шире, данные умнее.",
          ],
        },
      ],
    },
  ],
};
