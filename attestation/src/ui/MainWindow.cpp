#include "MainWindow.h"
#include "EmployeeForm.h"
#include "core/EmployeeDao.h"
#include <QMenuBar>
#include <QToolBar>
#include <QStatusBar>
#include <QSplitter>
#include <QHeaderView>
#include <QVBoxLayout>
#include <QHBoxLayout>
#include <QShortcut>
#include <QFileDialog>
#include <QMessageBox>
#include <QStandardItemModel>
#include <QNetworkReply>
#include <QJsonDocument>
#include <QJsonArray>
#include <QJsonObject>
#include <QApplication>

// Простая модель для демонстрации (глава 8)
class EmployeeTableModel : public QAbstractTableModel
{
public:
    struct Employee {
        int id = 0;
        QString name, post, dept;
    };

    int rowCount(const QModelIndex & = {}) const override { return int(m_data.size()); }
    int columnCount(const QModelIndex & = {}) const override { return 4; }

    QVariant data(const QModelIndex &i, int role) const override
    {
        if (role != Qt::DisplayRole) return {};
        const Employee &e = m_data[i.row()];
        switch (i.column()) {
        case 0:  return e.name;
        case 1:  return e.post;
        case 2:  return e.dept;
        default: return "не аттестован";
        }
    }

    QVariant headerData(int s, Qt::Orientation o, int role) const override
    {
        if (o != Qt::Horizontal || role != Qt::DisplayRole) return {};
        return QStringList{"ФИО", "Должность", "Отдел", "Статус"}[s];
    }

    void append(Employee e)
    {
        const int row = int(m_data.size());
        beginInsertRows({}, row, row);
        m_data.push_back(std::move(e));
        endInsertRows();
    }

    void removeRow(int row)
    {
        beginRemoveRows({}, row, row);
        m_data.erase(m_data.begin() + row);
        endRemoveRows();
    }

private:
    std::vector<Employee> m_data;
};

MainWindow::MainWindow(QWidget *parent) : QMainWindow(parent)
{
    setWindowTitle("Аттестация сотрудников");
    resize(1024, 640);

    // Меню
    auto *file = menuBar()->addMenu("&Файл");
    file->addAction("&Новая сессия...", this, &MainWindow::newSession, QKeySequence::New);
    file->addAction("&Открыть базу...", this, &MainWindow::openDatabase, QKeySequence::Open);
    file->addSeparator();
    file->addAction("Вы&ход", this, &QWidget::close, QKeySequence::Quit);

    menuBar()->addMenu("&Справка")->addAction("О программе", this, &MainWindow::about);

    // Тулбар
    auto *toolbar = addToolBar("Основное");
    toolbar->setMovable(false);
    toolbar->addAction("Новая сессия", this, &MainWindow::newSession);
    toolbar->addAction("Добавить сотрудника", this, [this] {
        auto *form = new EmployeeForm(this);
        connect(form, &EmployeeForm::saved, this, &MainWindow::addEmployee);
        form->show();
    });

    // Модель и прокси
    m_model = new EmployeeTableModel(this);
    m_proxy = new QSortFilterProxyModel(this);
    m_proxy->setSourceModel(m_model);
    m_proxy->setFilterKeyColumn(-1);
    m_proxy->setFilterCaseSensitivity(Qt::CaseInsensitive);

    // Таблица
    m_table = new QTableView(this);
    m_table->setModel(m_proxy);
    m_table->setSelectionBehavior(QAbstractItemView::SelectRows);
    m_table->horizontalHeader()->setStretchLastSection(true);
    m_table->setAlternatingRowColors(true);
    m_table->setSortingEnabled(true);

    // Дерево отделов
    m_treeModel = new QStandardItemModel(this);
    auto *root = m_treeModel->invisibleRootItem();
    auto *hq = new QStandardItem("Головной офис");
    hq->appendRow(new QStandardItem("Разработка"));
    hq->appendRow(new QStandardItem("Тестирование"));
    root->appendRow(hq);
    root->appendRow(new QStandardItem("Филиал «Восток»"));

    m_tree = new QTreeView(this);
    m_tree->setModel(m_treeModel);
    m_tree->setHeaderHidden(true);
    m_tree->expandAll();

    // Поиск
    m_search = new QLineEdit(this);
    m_search->setPlaceholderText("Поиск сотрудника...");
    connect(m_search, &QLineEdit::textChanged, this, [this](const QString &text) {
        m_proxy->setFilterFixedString(text);
    });

    // Сплиттер
    auto *splitter = new QSplitter(Qt::Horizontal, this);
    splitter->addWidget(m_tree);
    splitter->addWidget(m_table);
    splitter->setStretchFactor(0, 1);
    splitter->setStretchFactor(1, 3);
    splitter->setSizes({260, 760});

    // Корневой лейаут
    auto *central = new QWidget(this);
    auto *layout = new QVBoxLayout(central);
    layout->addWidget(m_search);
    layout->addWidget(splitter);
    setCentralWidget(central);

    // Горячие клавиши
    new QShortcut(QKeySequence("Ctrl+F"), this, [this] {
        m_search->setFocus();
    });
    new QShortcut(QKeySequence::Delete, this, this, &MainWindow::removeSelected);

    // Сеть
    m_net = new QNetworkAccessManager(this);

    // Dao (пока не используется, но готово)
    m_dao = new EmployeeDao(this);

    statusBar()->showMessage("Готово");
}

void MainWindow::newSession()
{
    statusBar()->showMessage("Сессия аттестации создана");
}

void MainWindow::openDatabase()
{
    const QString path = QFileDialog::getOpenFileName(this, "Открыть базу", "", "SQLite (*.db)");
    if (!path.isEmpty())
        statusBar()->showMessage("База открыта: " + path);
}

void MainWindow::about()
{
    QMessageBox::about(this, "О программе",
                       "Аттестация сотрудников 1.0\n\n"
                       "Учебный проект из книги\n"
                       "«C++: от ученика до гуру»\n"
                       "Автор: Кулханов В. М.");
}

void MainWindow::addEmployee(const QString &name, const QString &post, const QString &dept)
{
    m_model->append({0, name, post, dept});
    statusBar()->showMessage("Сотрудник добавлен: " + name);
}

void MainWindow::removeSelected()
{
    const auto idx = m_table->currentIndex();
    if (!idx.isValid()) return;

    const auto sourceIdx = m_proxy->mapToSource(idx);
    const int row = sourceIdx.row();

    const auto ans = QMessageBox::question(this, "Удаление",
        "Удалить сотрудника?", QMessageBox::Yes | QMessageBox::No);
    if (ans == QMessageBox::Yes) {
        m_model->removeRow(row);
        statusBar()->showMessage("Сотрудник удалён");
    }
}

void MainWindow::loadFromServer()
{
    QNetworkRequest req{QUrl("http://localhost:8080/api/employees")};
    QNetworkReply *reply = m_net->get(req);
    statusBar()->showMessage("Загружаем данные...");

    connect(reply, &QNetworkReply::finished, this, [this, reply] {
        if (reply->error() != QNetworkReply::NoError) {
            statusBar()->showMessage("Сервер недоступен: " + reply->errorString());
        } else {
            const auto doc = QJsonDocument::fromJson(reply->readAll());
            for (const auto &v : doc.array()) {
                const auto o = v.toObject();
                m_model->append({o["id"].toInt(), o["name"].toString(),
                                 o["post"].toString(), o["dept"].toString()});
            }
            statusBar()->showMessage("Загружено строк: " +
                QString::number(doc.array().size()));
        }
        reply->deleteLater();
    });
}
