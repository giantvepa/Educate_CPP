#pragma once
#include <QObject>
#include <QSqlDatabase>
#include <optional>
#include <vector>

struct Employee {
    int id = 0;
    QString name;
    QString post;
    int departmentId = 0;
};

class EmployeeDao : public QObject
{
    Q_OBJECT
public:
    explicit EmployeeDao(QObject *parent = nullptr)
        : QObject(parent)
    {
        m_db = QSqlDatabase::database();
    }

    std::vector<Employee> all() const;
    std::optional<Employee> byId(int id) const;
    int insert(const Employee &e);
    bool update(const Employee &e);
    bool remove(int id);

private:
    QSqlDatabase m_db;
};
