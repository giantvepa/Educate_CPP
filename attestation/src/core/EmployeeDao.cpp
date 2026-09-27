#include "EmployeeDao.h"
#include <QSqlQuery>
#include <QSqlError>
#include <QDebug>

std::vector<Employee> EmployeeDao::all() const
{
    std::vector<Employee> result;
    QSqlQuery q(m_db);
    q.prepare("SELECT id, full_name, post, department_id FROM employees ORDER BY full_name");
    if (!q.exec()) {
        qWarning() << "all() failed:" << q.lastError().text();
        return result;
    }
    while (q.next()) {
        Employee e;
        e.id = q.value(0).toInt();
        e.name = q.value(1).toString();
        e.post = q.value(2).toString();
        e.departmentId = q.value(3).toInt();
        result.push_back(std::move(e));
    }
    return result;
}

std::optional<Employee> EmployeeDao::byId(int id) const
{
    QSqlQuery q(m_db);
    q.prepare("SELECT id, full_name, post, department_id FROM employees WHERE id = :id");
    q.bindValue(":id", id);
    if (!q.exec() || !q.next()) return std::nullopt;

    Employee e;
    e.id = q.value(0).toInt();
    e.name = q.value(1).toString();
    e.post = q.value(2).toString();
    e.departmentId = q.value(3).toInt();
    return e;
}

int EmployeeDao::insert(const Employee &e)
{
    QSqlQuery q(m_db);
    q.prepare("INSERT INTO employees (full_name, post, department_id) "
              "VALUES (:name, :post, :dept)");
    q.bindValue(":name", e.name);
    q.bindValue(":post", e.post);
    q.bindValue(":dept", e.departmentId);
    if (!q.exec()) {
        qWarning() << "insert() failed:" << q.lastError().text();
        return -1;
    }
    return q.lastInsertId().toInt();
}

bool EmployeeDao::update(const Employee &e)
{
    QSqlQuery q(m_db);
    q.prepare("UPDATE employees SET full_name = :name, post = :post, "
              "department_id = :dept WHERE id = :id");
    q.bindValue(":name", e.name);
    q.bindValue(":post", e.post);
    q.bindValue(":dept", e.departmentId);
    q.bindValue(":id", e.id);
    if (!q.exec()) {
        qWarning() << "update() failed:" << q.lastError().text();
        return false;
    }
    return q.numRowsAffected() == 1;
}

bool EmployeeDao::remove(int id)
{
    QSqlQuery q(m_db);
    q.prepare("DELETE FROM employees WHERE id = :id");
    q.bindValue(":id", id);
    if (!q.exec()) {
        qWarning() << "remove() failed:" << q.lastError().text();
        return false;
    }
    return q.numRowsAffected() == 1;
}
