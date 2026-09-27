import type { Part } from "./types";

export const part1: Part = {
  id: "p1",
  level: "Ученик",
  levelSub: "главы 1–5",
  title: "Первое окно",
  desc: "Ставим инструмент, пишем первое окно, оживляем кнопки сигналами и собираем форму сотрудника из виджетов и слоёв разметки.",
  accent: "gold",
  chapters: [
    {
      id: "ch01",
      num: 1,
      title: "Путь к «Аттестации»",
      lead: "Что мы построим, зачем здесь C++ и Qt, и как устроен наш маршрут от кнопки до веб-сервиса.",
      minutes: 8,
      blocks: [
        {
          t: "p",
          x: "Эта книга — один сквозной проект. Мы напишем систему **«Аттестация сотрудников»**: десктопное приложение, где отдел кадров ведёт сотрудников и отделы, проводит аттестационные сессии, ставит оценки, хранит всё в базе **SQLite** и в конце отдаёт данные веб-интерфейсу по **REST API**. Не отдельные игрушки, а одну взрослеющую систему.",
        },
        {
          t: "p",
          x: "Почему Qt? Это главный промышленный инструментарий для C++-интерфейсов: окна, таблицы, деревья, база данных и сеть — всё из одной коробки, на всех платформах. Язык — **C++17**, сборка — **CMake**. Никакой магии: каждый механизм разберём руками.",
        },
        { t: "h2", x: "Четыре ступени" },
        {
          t: "ul",
          items: [
            "**Ученик (главы 1–5)** — первое окно, кнопки, сигналы, поля ввода, разметка. К концу части форма сотрудника работает.",
            "**Практик (главы 6–10)** — главное окно с меню, грид сотрудников, собственная модель данных, дерево отделов, диалоги.",
            "**Мастер (главы 11–15)** — SQLite: схема, запросы, привязка грида к базе, слои Dao/Service, поиск и отчёты.",
            "**Гуру (главы 16–20)** — REST-сервер на C++, HTTP-клиент в приложении, веб-интерфейс, бизнес-логика сессий и итоговая архитектура.",
          ],
        },
        {
          t: "figure",
          kind: "flow",
          caption: "Эволюция проекта: от QWidget на столе до связки «веб-интерфейс → C++ API → SQLite».",
        },
        { t: "h2", x: "Инструменты" },
        {
          t: "p",
          x: "Поставьте три вещи: **Qt 6** (через Qt Online Installer, компоненты `Qt 6.x` + `Qt Creator` по желанию), **CMake 3.16+** и компилятор (MSVC на Windows, GCC/Clang на Linux и macOS). Проверьте, что всё нашлось:",
        },
        {
          t: "code",
          lang: "bash",
          title: "терминал",
          x: "cmake --version    # cmake version 3.28...\nc++ --version      # clang/gcc — любой современный\n# Qt ищем через CMake, переменная CMAKE_PREFIX_PATH",
        },
        {
          t: "note",
          kind: "tip",
          title: "Как читать эту книгу",
          x: "Каждая глава — теория на полстраницы, затем код, который можно скопировать одной кнопкой, и задача в конце. Код компилируйте и запускайте: чтение без сборки даёт десятую часть пользы.",
        },
        {
          t: "key",
          items: [
            "Один сквозной проект — система «Аттестация» — взрослеет от окна до веб-сервиса.",
            "Стек: C++17, Qt 6, CMake, SQLite, REST.",
            "Четыре ступени: Ученик → Практик → Мастер → Гуру.",
          ],
        },
      ],
    },
    {
      id: "ch02",
      num: 2,
      title: "Первое окно",
      lead: "QApplication, QWidget и цикл событий — три кита, на которых стоит любое Qt-приложение.",
      minutes: 12,
      blocks: [
        {
          t: "p",
          x: "Любое Qt-приложение начинается одинаково: объект **QApplication** забирает управление и запускает **цикл событий** — бесконечный опрос «что случилось: клик, клавиша, таймер?». Окно — это **QWidget**: базовый кирпичик, у которого есть размер, заголовок и содержимое.",
        },
        { t: "h2", x: "main.cpp" },
        {
          t: "code",
          lang: "cpp",
          title: "main.cpp — первое окно системы «Аттестация»",
          x: '#include <QApplication>\n#include <QWidget>\n\nint main(int argc, char *argv[])\n{\n    QApplication app(argc, argv);   // 1. диспетчер событий\n\n    QWidget window;                 // 2. само окно\n    window.setWindowTitle("Аттестация сотрудников");\n    window.resize(480, 320);\n    window.show();                  // 3. показать\n\n    return app.exec();              // 4. цикл событий: ждём действия пользователя\n}',
        },
        {
          t: "p",
          x: "Разберём по шагам. `QApplication app(argc, argv)` обязан быть ровно один и создаётся раньше любых виджетов. `window.show()` лишь помечает окно видимым — программа не зависает, потому что дальше `app.exec()` передаёт управление циклу событий. Когда пользователь закрывает окно, цикл завершается и `main` возвращает управление.",
        },
        { t: "h2", x: "Собираем CMake" },
        {
          t: "code",
          lang: "cmake",
          title: "CMakeLists.txt",
          x: 'cmake_minimum_required(VERSION 3.16)\nproject(attestation LANGUAGES CXX)\n\nset(CMAKE_CXX_STANDARD 17)\nset(CMAKE_CXX_STANDARD_REQUIRED ON)\nset(CMAKE_AUTOMOC ON)   # Qt-метаобъектный компилятор: без него не взлетят сигналы\n\nfind_package(Qt6 REQUIRED COMPONENTS Widgets)\n\nadd_executable(attestation main.cpp)\ntarget_link_libraries(attestation PRIVATE Qt6::Widgets)',
        },
        {
          t: "code",
          lang: "bash",
          title: "сборка и запуск",
          x: "cmake -B build -DCMAKE_BUILD_TYPE=Release\ncmake --build build --parallel\n./build/attestation",
        },
        {
          t: "note",
          kind: "warn",
          title: "Если Qt не нашёлся",
          x: "Подскажите CMake путь: `cmake -B build -DCMAKE_PREFIX_PATH=/путь/к/Qt/6.x/gcc_64`. На Windows это обычно `C:/Qt/6.x/msvc2019_64`.",
        },
        { t: "h2", x: "Родитель и потомок" },
        {
          t: "p",
          x: "Виджеты образуют дерево: передав в конструктор `parent`, вы вешаете ребёнка на родителя. Qt сам удалит детей при удалении родителя — утечки памяти из-за «забытого» виджета исчезают как класс. Запомните правило: **создаёшь виджет — отдавай его родителю или в лейаут**.",
        },
        {
          t: "note",
          kind: "task",
          title: "Задача",
          x: "Создайте второе окно «О программе» и покажите его из первого. Подсказка: создайте QWidget со своим заголовком и вызовите `show()` до `app.exec()`.",
        },
        {
          t: "key",
          items: [
            "QApplication — один на программу, `exec()` запускает цикл событий.",
            "QWidget — базовый виджет; `show()` + `resize()` достаточно для первого окна.",
            "Родитель владеет детьми и сам их удаляет.",
          ],
        },
      ],
    },
    {
      id: "ch03",
      num: 3,
      title: "Кнопки и сигналы",
      lead: "Событийная модель Qt: сигналы, слоты и первая живая логика — кнопка «Начать аттестацию».",
      minutes: 14,
      blocks: [
        {
          t: "p",
          x: "Виджеты не вызывают код напрямую — они **излучают сигналы**. «Кнопку нажали» — это сигнал `QPushButton::clicked`. Кто хочет отреагировать, подключает к нему **слот** — любую функцию с подходящей сигнатурой. Связка создаётся функцией `QObject::connect`. Это и есть сердце Qt.",
        },
        { t: "h2", x: "Счётчик аттестаций" },
        {
          t: "code",
          lang: "cpp",
          title: "main.cpp",
          x: '#include <QApplication>\n#include <QLabel>\n#include <QPushButton>\n#include <QVBoxLayout>\n#include <QWidget>\n\nint main(int argc, char *argv[])\n{\n    QApplication app(argc, argv);\n    QWidget window;\n    window.setWindowTitle("Аттестация сотрудников");\n\n    auto *layout = new QVBoxLayout(&window);\n    auto *label  = new QLabel("Аттестаций проведено: 0", &window);\n    auto *button = new QPushButton("Начать аттестацию", &window);\n    layout->addWidget(label);\n    layout->addWidget(button);\n\n    int count = 0;\n    QObject::connect(button, &QPushButton::clicked, &window,\n                     [&count, label] {\n        ++count;\n        label->setText("Аттестаций проведено: " + QString::number(count));\n    });\n\n    window.show();\n    return app.exec();\n}',
        },
        {
          t: "p",
          x: "Четыре аргумента `connect`: **источник** сигнала, **сам сигнал** (через `&Класс::сигнал`), **контекст** (объект, при гибели которого связь рвётся — страховка от вызова слота на умершем объекте) и **слот**. Здесь слот — лямбда: коротко и рядом с местом подключения.",
        },
        { t: "h2", x: "Сигналы и слоты в своём классе" },
        {
          t: "p",
          x: "Свой сигнал объявляется в секции `signals:`, слот — обычный метод (или лямбда). Перед классом с сигналами обязателен макрос `Q_OBJECT`, а реализацию `connect` берёт на себя moc — тот самый `CMAKE_AUTOMOC` из CMakeLists.",
        },
        {
          t: "code",
          lang: "cpp",
          title: "AttestationStarter.h",
          x: '#include <QObject>\n\nclass AttestationStarter : public QObject\n{\n    Q_OBJECT\npublic:\n    void start()   { emit started(++m_total); }   // emit — маркер «вот он, сигнал»\n\nsignals:\n    void started(int total);                      // сигнал: аттестация запущена\n\nprivate:\n    int m_total = 0;\n};',
        },
        {
          t: "code",
          lang: "cpp",
          title: "подключение",
          x: 'AttestationStarter starter;\nQObject::connect(&starter, &AttestationStarter::started,\n                 &window, [label](int total) {\n    label->setText("Аттестаций проведено: " + QString::number(total));\n});\n\nstarter.start();   // → сигнал → слот обновил label',
        },
        {
          t: "note",
          kind: "tip",
          title: "Правило сигнатур",
          x: "Слот может принимать **меньше** аргументов, чем сигнал (лишние отбрасываются), но не больше и не несовместимых типов. Сигнал `started(int)` совместим со слотом `onStarted(int)` и со слотом без параметров.",
        },
        {
          t: "note",
          kind: "task",
          title: "Задача",
          x: "Добавьте кнопку «Сбросить», которая обнуляет счётчик, и сигнал `reset()` в стартере. Убедитесь, что один сигнал можно подключить к двум слотам сразу.",
        },
        {
          t: "key",
          items: [
            "Сигнал — «событие», слот — «реакция»; связывает их QObject::connect.",
            "Сигналы объявляются в `signals:` под макросом Q_OBJECT.",
            "Контекст в connect страхует от вызова на удалённом объекте.",
          ],
        },
      ],
    },
    {
      id: "ch04",
      num: 4,
      title: "Поля ввода и форма сотрудника",
      lead: "QLineEdit, QComboBox, QFormLayout и валидация: карточка сотрудника, которую не стыдно показать кадровику.",
      minutes: 14,
      blocks: [
        {
          t: "p",
          x: "Данные в систему входят через виджеты ввода: **QLineEdit** — строка, **QComboBox** — выбор из списка, **QSpinBox** — число. Для «подпись слева, поле справа» есть готовый **QFormLayout** — он сам выравнивает подписи и тянется при ресайзе.",
        },
        { t: "h2", x: "Класс формы" },
        {
          t: "code",
          lang: "cpp",
          title: "EmployeeForm.h",
          x: '#include <QComboBox>\n#include <QFormLayout>\n#include <QLineEdit>\n#include <QPushButton>\n#include <QWidget>\n\nclass EmployeeForm : public QWidget\n{\n    Q_OBJECT\npublic:\n    explicit EmployeeForm(QWidget *parent = nullptr) : QWidget(parent)\n    {\n        auto *form = new QFormLayout(this);\n\n        m_name = new QLineEdit(this);\n        m_name->setPlaceholderText("Иванов Иван Иванович");\n        m_post = new QLineEdit(this);\n        m_post->setPlaceholderText("ведущий инженер");\n        m_dept = new QComboBox(this);\n        m_dept->addItems({"Разработка", "Тестирование", "Внедрение"});\n\n        form->addRow("ФИО",       m_name);\n        form->addRow("Должность", m_post);\n        form->addRow("Отдел",     m_dept);\n\n        auto *save = new QPushButton("Сохранить", this);\n        form->addRow(save);\n\n        connect(save, &QPushButton::clicked, this, [this] {\n            if (m_name->text().trimmed().isEmpty()) {\n                m_name->setStyleSheet("border: 1px solid #e05252;");\n                m_name->setFocus();\n                return;                              // не даём сохранить пустоту\n            }\n            emit saved(m_name->text().trimmed(),\n                       m_post->text().trimmed(),\n                       m_dept->currentText());\n        });\n    }\n\nsignals:\n    void saved(const QString &name, const QString &post, const QString &dept);\n\nprivate:\n    QLineEdit *m_name;\n    QLineEdit *m_post;\n    QComboBox *m_dept;\n};',
        },
        {
          t: "p",
          x: "Обратите внимание на приём: форма **ничего не знает** о том, куда уйдут данные. Она лишь излучает сигнал `saved(...)` с тремя строками. Сохранит ли их таблица, база или файл — решает тот, кто подключится. Это разделение ответственности станет главным рефреном книги.",
        },
        { t: "h2", x: "Валидация без боли" },
        {
          t: "p",
          x: "Для строгих форм есть **QValidator**. Ограничим ввод ФИО: только буквы, пробелы, точки и дефисы — цифры и символы не пройдут даже физически.",
        },
        {
          t: "code",
          lang: "cpp",
          title: "ограничение ввода",
          x: '#include <QRegularExpressionValidator>\n\nm_name->setValidator(new QRegularExpressionValidator(\n    QRegularExpression("^[А-Яа-яЁёA-Za-z .\\\\-]{2,60}$"), m_name));',
        },
        {
          t: "note",
          kind: "tip",
          title: "UX-деталь",
          x: "Подсветка ошибки красной рамкой + `setFocus()` на виновное поле — минимум вежливости формы. Рядом поставьте QLabel с текстом ошибки и показывайте его при неудаче.",
        },
        {
          t: "note",
          kind: "task",
          title: "Задача",
          x: "Добавьте в форму поле «Дата приёма» на QDateEdit и сигнал `saved` с четырьмя аргументами. Проверьте, что пустая дата не проходит.",
        },
        {
          t: "key",
          items: [
            "QFormLayout — пара «подпись + поле» в одну строку кода.",
            "Форма излучает сигнал с данными, а не сохраняет их сама.",
            "QValidator не даёт ввести мусор; подсветка ошибки — обязательна.",
          ],
        },
      ],
    },
    {
      id: "ch05",
      num: 5,
      title: "Лейауты: порядок на экране",
      lead: "VBox, HBox, Grid и stretch: собираем окно аттестации, которое не разваливается при ресайзе.",
      minutes: 12,
      blocks: [
        {
          t: "p",
          x: "Ручные координаты `setGeometry` — путь в никуда: окно меняет размер, и верстка плывёт. Лейауты размещают виджеты по правилам: **QVBoxLayout** — колонкой, **QHBoxLayout** — строкой, **QGridLayout** — сеткой, **QFormLayout** мы уже знаем. Лейауты вкладываются друг в друга как матрёшки.",
        },
        { t: "h2", x: "Окно аттестационной сессии" },
        {
          t: "p",
          x: "Слева — форма сотрудника, справа — сетка критериев с оценками, внизу — кнопки. Каркас:",
        },
        {
          t: "code",
          lang: "cpp",
          title: "SessionWindow.cpp — каркас",
          x: 'auto *root = new QVBoxLayout(this);\n\nauto *top = new QHBoxLayout;\ntop->addWidget(new EmployeeForm(this), /*stretch=*/1);   // слева\n\nauto *grid = new QGridLayout;                            // справа\ngrid->addWidget(new QLabel("Критерий"),       0, 0);\ngrid->addWidget(new QLabel("Оценка (1–5)"),   0, 1);\n\nconst QStringList criteria = {"Знания", "Навыки", "Результативность"};\nfor (int i = 0; i < criteria.size(); ++i) {\n    grid->addWidget(new QLabel(criteria[i]), i + 1, 0);\n    auto *spin = new QSpinBox;\n    spin->setRange(1, 5);\n    spin->setValue(3);\n    grid->addWidget(spin, i + 1, 1);\n}\ntop->addLayout(grid, /*stretch=*/1);\n\nroot->addLayout(top, /*stretch=*/1);   // верх растягивается\n\nauto *bottom = new QHBoxLayout;\nbottom->addStretch();                  // пружина слева — кнопки прижмёт вправо\nbottom->addWidget(new QPushButton("Отмена"));\nbottom->addWidget(new QPushButton("Завершить сессию"));\nroot->addLayout(bottom);',
        },
        {
          t: "p",
          x: "Три приёма, которые делают верстку взрослой. **stretch** — вес при распределении свободного места: `addLayout(top, 1)` забирает всё, что останется. **addStretch()** — пустая пружина, прижимающая кнопки к правому краю. **setContentsMargins / setSpacing** — воздух между блоками, не жалейте 8–12 px.",
        },
        { t: "h2", x: "Свой лейаут-компонент" },
        {
          t: "p",
          x: "Повторяющиеся куски выносите в функции или классы: `QWidget *makeCriteriaGrid(QVector<QSpinBox*> &spins)` — сетка критериев теперь переиспользуема, а указатели на спинбоксы вернутся наружу, чтобы читать оценки при сохранении.",
        },
        {
          t: "note",
          kind: "warn",
          title: "Частая ошибка",
          x: "Виджет, созданный без родителя, но добавленный в лейаут родителю, — нормально. А вот виджет **в двух лейаутах сразу** — неопределённое поведение. Один виджет — одно место.",
        },
        {
          t: "note",
          kind: "task",
          title: "Задача",
          x: "Соберите окно целиком: форма + критерии + кнопки, и по «Завершить сессию» выводите средний балл в QLabel. Средний балл считайте по спинбоксам.",
        },
        {
          t: "key",
          items: [
            "Лейауты вкладываются; stretch распределяет свободное место.",
            "addStretch() — пружина для прижатия к краю.",
            "Повторяющиеся блоки — в отдельные функции/компоненты.",
          ],
        },
      ],
    },
  ],
};
