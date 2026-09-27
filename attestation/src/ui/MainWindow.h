#pragma once
#include <QMainWindow>
#include <QTableView>
#include <QTreeView>
#include <QLineEdit>
#include <QNetworkAccessManager>
#include <QSortFilterProxyModel>
#include "core/EmployeeDao.h"

class EmployeeTableModel;
class QStandardItemModel;

class MainWindow : public QMainWindow
{
    Q_OBJECT
public:
    explicit MainWindow(QWidget *parent = nullptr);

private slots:
    void newSession();
    void openDatabase();
    void about();
    void addEmployee(const QString &name, const QString &post, const QString &dept);
    void removeSelected();
    void loadFromServer();

private:
    QTableView              *m_table;
    QTreeView               *m_tree;
    QStandardItemModel      *m_treeModel;
    EmployeeTableModel      *m_model;
    QSortFilterProxyModel   *m_proxy;
    QLineEdit               *m_search;
    QNetworkAccessManager   *m_net;
    EmployeeDao             *m_dao;
};
