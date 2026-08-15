import type { Part } from "./types";

export const part2: Part = {
  id: "p2",
  level: "Практик",
  levelSub: "главы 6–10",
  title: "Интерфейс системы",
  desc: "Превращаем набор форм в профессиональное приложение: главное окно с меню, грид сотрудников, собственная модель данных и дерево отделов.",
  accent: "teal",
  chapters: [
    {
      id: "ch06",
      num: 6,
      title: "Главное окно: QMainWindow",
      lead: "Меню, тулбар и статусбар — скелет взрослого приложения, а не игрушки с одной кнопкой.",
      minutes: 12,
      blocks: [
        {
          t: "p",
          x: "**QMainWindow** — специальный виджет-«рама»: у него есть слоты под строку меню, панели инструментов, доки и статусбар, а в центр ставится любой виджет через `setCentralWidget`. С него начинается всё, что похоже на «программу».",
        },
        { t: "h2", x: "Скелет с меню и статусбаром" },
        {
          t: "code",
          lang: "cpp",
          title: "MainWindow.h",
          x: '#include <QMainWindow>\n\nclass MainWindow : public QMainWindow\n{\n    Q_OBJECT\npublic:\n    explicit MainWindow(QWidget *parent = nullptr)\n        : QMainWindow(parent)\n    {\n        setWindowTitle("Аттестация сотрудников");\n        resize(1024, 640);\n\n        // Меню «Файл» с горячими клавишами\n        auto *file = menuBar()->addMenu("&Файл");\n        file->addAction("&Новая сессия...", this, &MainWindow::newSession,\n                        QKeySequence::New);            // Ctrl+N\n        file->addAction("&Открыть базу...", this, &MainWindow::openDatabase,\n                        QKeySequence::Open);           // Ctrl+O\n        file->addSeparator();\n        file->addAction("Вы&ход", this, &QWidget::close,\n                        QKeySequence::Quit);           // Ctrl+Q\n\n        menuBar()->addMenu("&Справка")\n                 ->addAction("О программе", this, &MainWindow::about);\n\n        statusBar()->showMessage("Готово");            // строка состояния\n    }\n\nprivate:\n    void newSession()   { statusBar()->showMessage("Сессия аттестации создана"); }\n    void openDatabase() { statusBar()->showMessage("База attestation.db открыта"); }\n    void about()        { statusBar()->showMessage("Аттестация 1.0 · учебный проект на Qt"); }\n};',
        },
        {
          t: "p",
          x: "`addAction(текст, объект, слот, клавиша)` — самая частая форма: пункт меню уже подключён. Амперсанд в `&Файл` делает «Ф» горячей клавишей Alt-меню. `addSeparator()` — разделитель, мелочь, а приложение выглядит собранным.",
        },
        { t: "h2", x: "Тулбар" },
        {
          t: "code",
          lang: "cpp",
          title: "панель инструментов",
          x: 'auto *toolbar = addToolBar("Основное");\ntoolbar->setMovable(false);\n\nQAction *actNew = toolbar->addAction("Новая сессия");\nQAction *actAdd = toolbar->addAction("Добавить сотрудника");\n\nconnect(actNew, &QAction::triggered, this, &MainWindow::newSession);\nconnect(actAdd, &QAction::triggered, this, [this] {\n    statusBar()->showMessage("Открыта карточка сотрудника");\n});',
        },
        {
          t: "note",
          kind: "tip",
          title: "QAction — один на всех",
          x: "Один QAction можно повесить и в меню, и в тулбар, и на кнопку: состояние (включён/выключен, текст, иконка) синхронизируется само. Не дублируйте обработчики — дублируйте действия.",
        },
        {
          t: "note",
          kind: "task",
          title: "Задача",
          x: "Добавьте меню «Аттестация» с пунктами «Список сессий» и «Итоги», а в статусбар выводите текущую дату через QDate::currentDate().toString().",
        },
        {
          t: "key",
          items: [
            "QMainWindow = меню + тулбар + доки + статусбар + центральный виджет.",
            "addAction сразу подключает слот и горячую клавишу.",
            "QAction переиспользуется между меню, тулбаром и кнопками.",
          ],
        },
      ],
    },
    {
      id: "ch07",
      num: 7,
      title: "Грид: QTableWidget",
      lead: "Таблица сотрудников — сердце кадровой системы. Быстрый старт на QTableWidget и его потолок.",
      minutes: 13,
      blocks: [
        {
          t: "p",
          x: "Грид в Qt — это `QTableView` (вид) плюс модель данных. Но для прототипа есть **QTableWidget** — таблица «всё в одном»: ячейки создаются вручную как QTableWidgetItem. Быстро, понятно, и именно с неё мы начнём список сотрудников.",
        },
        { t: "h2", x: "Таблица сотрудников" },
        {
          t: "code",
          lang: "cpp",
          title: "MainWindow.cpp",
          x: '#include <QHeaderView>\n#include <QTableWidget>\n\n// в конструкторе MainWindow:\nm_table = new QTableWidget(0, 4, this);          // 0 строк, 4 колонки\nm_table->setHorizontalHeaderLabels(\n    {"№", "ФИО", "Должность", "Отдел"});\nm_table->horizontalHeader()->setStretchLastSection(true);\nm_table->setSelectionBehavior(QAbstractItemView::SelectRows);  // курсор на строку\nm_table->setEditTriggers(QAbstractItemView::NoEditTriggers);   // только чтение\nm_table->verticalHeader()->setVisible(false);    // без «1, 2, 3...» слева\nsetCentralWidget(m_table);',
        },
        { t: "h2", x: "Добавление строк" },
        {
          t: "code",
          lang: "cpp",
          title: "слот добавления",
          x: 'void MainWindow::addEmployee(const QString &name,\n                             const QString &post,\n                             const QString &dept)\n{\n    const int row = m_table->rowCount();\n    m_table->insertRow(row);\n    m_table->setItem(row, 0, new QTableWidgetItem(QString::number(row + 1)));\n    m_table->setItem(row, 1, new QTableWidgetItem(name));\n    m_table->setItem(row, 2, new QTableWidgetItem(post));\n    m_table->setItem(row, 3, new QTableWidgetItem(dept));\n}\n\nvoid MainWindow::removeSelected()\n{\n    const int row = m_table->currentRow();\n    if (row >= 0) m_table->removeRow(row);\n}',
        },
        {
          t: "p",
          x: "Работает? Да. Масштабируется? Нет. Данные размазаны по ячейкам-виджетам: чтобы посчитать средний балл, придётся обходить таблицу и парсить строки. Когда источников данных станет больше одного (а станет — база, сервер), QTableWidget упрётся в потолок. Решение Qt — развести данные и отображение.",
        },
        {
          t: "note",
          kind: "guru",
          title: "Мысль на вырост",
          x: "Паттерн Model–View: модель хранит данные и сообщает виду «строка добавлена», вид перерисовывается. Одну модель можно показать таблицей, деревом и графиком одновременно. Следующая глава — ровно про это.",
        },
        {
          t: "note",
          kind: "task",
          title: "Задача",
          x: "Подключите EmployeeForm из главы 4: по сигналу saved строка появляется в гриде. Кнопка Delete на клавиатуре удаляет выбранную строку (QShortcut).",
        },
        {
          t: "key",
          items: [
            "QTableWidget — быстрый грид для прототипа:setItem(row, col, item).",
            "SelectRows + NoEditTriggers — типовые настройки «реестра».",
            "Данные в ячейках — тупик: дальше нужна модель.",
          ],
        },
      ],
    },
    {
      id: "ch08",
      num: 8,
      title: "Модель-представление: своя QAbstractTableModel",
      lead: "Данные живут в модели, рисует их вид. Пишем EmployeeTableModel — фундамент всей системы.",
      minutes: 18,
      blocks: [
        {
          t: "p",
          x: "Контракт модели — четыре вопроса, которые задаёт вид: сколько строк? сколько колонок? что в ячейке (r, c)? что в шапке? Отвечаем, переопределив четыре метода **QAbstractTableModel**. Всё остальное — удобство.",
        },
        { t: "h2", x: "EmployeeTableModel" },
        {
          t: "code",
          lang: "cpp",
          title: "EmployeeTableModel.h",
          x: '#include <QAbstractTableModel>\n#include <QString>\n#include <vector>\n\nclass EmployeeTableModel : public QAbstractTableModel\n{\npublic:\n    struct Employee {\n        int     id = 0;\n        QString name;\n        QString post;\n        QString dept;\n        QString status = "не аттестован";\n    };\n\n    int rowCount(const QModelIndex & = {}) const override\n    { return int(m_data.size()); }\n\n    int columnCount(const QModelIndex & = {}) const override { return 4; }\n\n    QVariant data(const QModelIndex &i, int role) const override\n    {\n        if (role != Qt::DisplayRole) return {};          // рисуем только текст\n        const Employee &e = m_data[i.row()];\n        switch (i.column()) {\n        case 0:  return e.name;\n        case 1:  return e.post;\n        case 2:  return e.dept;\n        default: return e.status;\n        }\n    }\n\n    QVariant headerData(int s, Qt::Orientation o, int role) const override\n    {\n        if (o != Qt::Horizontal || role != Qt::DisplayRole) return {};\n        return QStringList{"ФИО", "Должность", "Отдел", "Статус"}[s];\n    }\n\n    void append(Employee e)\n    {\n        const int row = int(m_data.size());\n        beginInsertRows({}, row, row);      // «вид, сейчас появится строка»\n        m_data.push_back(std::move(e));\n        endInsertRows();                    // «вид, перерисуйся»\n    }\n\n    const Employee &at(int row) const { return m_data[row]; }\n\nprivate:\n    std::vector<Employee> m_data;\n};',
        },
        {
          t: "p",
          x: "Ключевая дисциплина — скобки `beginInsertRows / endInsertRows` (и их братья `beginRemoveRows`, `dataChanged`). Это обещания виду: «данные сейчас изменятся вот так». Без них таблица не обновится или, хуже, упадёт на недействительных индексах.",
        },
        { t: "h2", x: "Подключаем к QTableView" },
        {
          t: "code",
          lang: "cpp",
          title: "MainWindow.cpp",
          x: 'm_model = new EmployeeTableModel(this);\nm_table = new QTableView(this);\nm_table->setModel(m_model);\nm_table->setSelectionBehavior(QAbstractItemView::SelectRows);\nm_table->horizontalHeader()->setStretchLastSection(true);\nm_table->setAlternatingRowColors(true);   // зебра — читается легче\n\nconnect(m_form, &EmployeeForm::saved, this,\n        [this](const QString &n, const QString &p, const QString &d) {\n    m_model->append({0, n, p, d, "не аттестован"});\n});',
        },
        {
          t: "p",
          x: "Теперь форма кладёт данные в модель, модель уведомляет вид. Захотим завтра показывать тех же людей деревом или сохранять в файл — модель не трогаем. А `role` позволяет вернуть для одной ячейки и текст, и цвет, и тултип: `Qt::DisplayRole`, `Qt::ForegroundRole`, `Qt::ToolTipRole`.",
        },
        {
          t: "note",
          kind: "warn",
          title: "QVariant — ящик для всего",
          x: "data() возвращает QVariant — универсальную обёртку: строка, число, цвет, иконка. Не бойтесь `return {};` для нерелевантных ролей — вид спросит только то, что умеет рисовать.",
        },
        {
          t: "note",
          kind: "task",
          title: "Задача",
          x: "Реализуйте removeRows() через beginRemoveRows/endRemoveRows и удаление по Delete. Бонус: статус «аттестован» рисуйте зелёным через Qt::ForegroundRole.",
        },
        {
          t: "key",
          items: [
            "Модель отвечает на 4 вопроса вида: строки, колонки, ячейка, шапка.",
            "Любое изменение данных — в скобках begin*/end*.",
            "Одна модель — много видов: таблица, дерево, экспорт.",
          ],
        },
      ],
    },
    {
      id: "ch09",
      num: 9,
      title: "Дерево отделов: QTreeView",
      lead: "Оргструктура — это иерархия: филиалы, отделы, люди. Строим дерево и синхронизируем его с гридом.",
      minutes: 15,
      blocks: [
        {
          t: "p",
          x: "Дерево в Qt рисуется **QTreeView**, а данные даёт модель с иерархией. Самый простой путь — **QStandardItemModel**: узлы-`QStandardItem` вкладываются через `appendRow`, и дерево строится само.",
        },
        { t: "h2", x: "Оргструктура" },
        {
          t: "code",
          lang: "cpp",
          title: "MainWindow.cpp — дерево отделов",
          x: '#include <QStandardItemModel>\n#include <QTreeView>\n\nm_treeModel = new QStandardItemModel(this);\nauto *root = m_treeModel->invisibleRootItem();   // невидимый корень\n\nauto *hq  = new QStandardItem("Головной офис");\nauto *dev = new QStandardItem("Отдел разработки");\ndev->appendRow(new QStandardItem("Иванов И. И."));\ndev->appendRow(new QStandardItem("Петров П. П."));\nhq->appendRow(dev);\n\nauto *qa = new QStandardItem("Отдел тестирования");\nqa->appendRow(new QStandardItem("Сидорова А. А."));\nhq->appendRow(qa);\n\nroot->appendRow(hq);\nroot->appendRow(new QStandardItem("Филиал «Восток»"));\n\nm_tree = new QTreeView(this);\nm_tree->setModel(m_treeModel);\nm_tree->setHeaderHidden(true);\nm_tree->expandAll();',
        },
        { t: "h2", x: "Выбор в дереве управляет гридом" },
        {
          t: "p",
          x: "Главный приём главы: выбрали отдел в дереве — грид отфильтровался. Сигнал `currentChanged` у **QItemSelectionModel** сообщает QModelIndex выбранного узла, а `index.data()` — его текст.",
        },
        {
          t: "code",
          lang: "cpp",
          title: "синхронизация дерево → грид",
          x: 'connect(m_tree->selectionModel(),\n        &QItemSelectionModel::currentChanged,\n        this, [this](const QModelIndex &idx) {\n    const QString selected = idx.data().toString();\n    statusBar()->showMessage("Выбран узел: " + selected);\n    // фильтр по отделу (подробно — в главе 15):\n    if (m_proxy) m_proxy->setFilterFixedString(selected);\n});',
        },
        {
          t: "note",
          kind: "tip",
          title: "Данные в узле",
          x: "Текст узла — плохой ключ. Правильно — прятать в item настоящий id: `item->setData(deptId, Qt::UserRole)`, а читать как `idx.data(Qt::UserRole).toInt()`. Имена могут совпасть, id — нет.",
        },
        {
          t: "note",
          kind: "task",
          title: "Задача",
          x: "Добавьте контекстное меню на узел отдела (customContextMenuRequested) с пунктами «Переименовать» и «Удалить отдел».",
        },
        {
          t: "key",
          items: [
            "QTreeView + QStandardItemModel: appendRow строит иерархию.",
            "currentChanged → data() — мост от выбора в дереве к логике.",
            "Настоящие ключи прячутся в Qt::UserRole, не в тексте.",
          ],
        },
      ],
    },
    {
      id: "ch10",
      num: 10,
      title: "Диалоги, сплиттер и лоск",
      lead: "QMessageBox, QFileDialog, QSplitter и горячие клавиши: приложение ведёт себя как продукт.",
      minutes: 12,
      blocks: [
        {
          t: "p",
          x: "Пользователь не должен терять данные молча, а интерфейс — выглядеть склеенным наспех. Финальный слой Практика: стандартные диалоги, раздвижные панели и мелочи, по которым отличают поделку от продукта.",
        },
        { t: "h2", x: "Сплиттер: дерево + грид" },
        {
          t: "code",
          lang: "cpp",
          title: "рабочая область",
          x: '#include <QSplitter>\n\nauto *splitter = new QSplitter(Qt::Horizontal, this);\nsplitter->addWidget(m_tree);     // слева — отделы\nsplitter->addWidget(m_table);    // справа — сотрудники\nsplitter->setStretchFactor(0, 1);\nsplitter->setStretchFactor(1, 3);          // грид втрое шире\nsplitter->setSizes({260, 760});            // стартовые ширины\nsetCentralWidget(splitter);',
        },
        { t: "h2", x: "Диалоги" },
        {
          t: "code",
          lang: "cpp",
          title: "вопросы, файлы, ввод",
          x: '#include <QFileDialog>\n#include <QMessageBox>\n\n// 1. Подтверждение опасного действия\nconst auto ans = QMessageBox::question(\n    this, "Удаление",\n    "Удалить сотрудника «" + name + "»? Действие необратимо.");\nif (ans == QMessageBox::Yes) m_model->removeRow(row);\n\n// 2. Выбор файла для экспорта\nconst QString path = QFileDialog::getSaveFileName(\n    this, "Экспорт отчёта", "attestation.csv",\n    "CSV (*.csv);;Все файлы (*)");\nif (!path.isEmpty()) exportCsv(path);',
        },
        {
          t: "p",
          x: "Правило: **опасное — спрашиваем** (Yes/No), **необратимое — дважды** (добавьте «не спрашивать снова» через чекбокс), **выбор файла — только системными диалогами**, они знают про папки и фильтры лучше нас.",
        },
        { t: "h2", x: "Горячие клавиши" },
        {
          t: "code",
          lang: "cpp",
          title: "QShortcut",
          x: '#include <QShortcut>\n\nnew QShortcut(QKeySequence("Ctrl+F"), this, [this] {\n    m_search->setFocus();                 // Ctrl+F — в строку поиска\n});\nnew QShortcut(QKeySequence::Delete, this, [this] {\n    removeSelected();                     // Delete — удалить строку\n});',
        },
        {
          t: "note",
          kind: "tip",
          title: "Чек-лист «лоска»",
          x: "Статусбар реагирует на каждое действие · размеры окон помнит QSettings · у кнопок есть ToolTip · вкладки QTabWidget делят «Сотрудники / Сессии / Отчёты» · шрифты и отступы одинаковы во всех формах.",
        },
        {
          t: "note",
          kind: "task",
          title: "Задача",
          x: "Соберите вкладку «Отчёты» (QTabWidget) с кнопкой экспорта CSV из диалога. Настройки последней папки сохраняйте в QSettings.",
        },
        {
          t: "key",
          items: [
            "QSplitter с stretchFactor — дерево и грид в одном окне.",
            "Опасные действия — через QMessageBox::question.",
            "QShortcut + QSettings = управление с клавиатуры и память настроек.",
          ],
        },
      ],
    },
  ],
};
