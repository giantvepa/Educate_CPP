#include <httplib.h>
#include <nlohmann/json.hpp>
#include "core/EmployeeDao.h"
#include <QApplication>
#include <QSqlDatabase>
#include <QSqlQuery>
#include <QFile>
#include <QDebug>

using json = nlohmann::json;

bool openDatabase(const QString &path)
{
    auto db = QSqlDatabase::addDatabase("QSQLITE");
    db.setDatabaseName(path);
    if (!db.open()) {
        qWarning() << "Не открыть базу:" << db.lastError().text();
        return false;
    }

    // Накатываем схему, если таблиц нет
    QSqlQuery q;
    q.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='employees'");
    if (!q.next()) {
        QFile schema("schema.sql");
        if (!schema.open(QIODevice::ReadOnly)) {
            qWarning() << "Не открыть schema.sql";
            return false;
        }
        const QString sql = QString::fromUtf8(schema.readAll());
        for (const QString &stmt : sql.split(';', Qt::SkipEmptyParts)) {
            const QString trimmed = stmt.trimmed();
            if (!trimmed.isEmpty() && !q.exec(trimmed))
                qWarning() << "Миграция:" << q.lastError().text();
        }
    }
    return true;
}

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);

    if (!openDatabase("attestation.db")) return 1;

    EmployeeDao dao;

    httplib::Server svr;
    svr.set_default_headers({{"Access-Control-Allow-Origin", "*"}});

    // GET /api/employees
    svr.Get("/api/employees", [&](const httplib::Request &, httplib::Response &res) {
        json arr = json::array();
        for (const auto &e : dao.all()) {
            arr.push_back({
                {"id", e.id},
                {"name", e.name.toStdString()},
                {"post", e.post.toStdString()},
                {"dept", e.departmentId}
            });
        }
        res.set_content(arr.dump(), "application/json");
    });

    // POST /api/employees
    svr.Post("/api/employees", [&](const httplib::Request &req, httplib::Response &res) {
        const auto body = json::parse(req.body, nullptr, false);
        if (body.is_discarded()) {
            res.status = 400;
            res.set_content("{\"error\":\"invalid json\"}", "application/json");
            return;
        }

        Employee e;
        e.name = QString::fromStdString(body.value("name", ""));
        e.post = QString::fromStdString(body.value("post", ""));
        e.departmentId = body.value("dept", 1);

        const int id = dao.insert(e);
        if (id < 0) {
            res.status = 500;
            res.set_content("{\"error\":\"insert failed\"}", "application/json");
            return;
        }

        res.set_content(json{{"id", id}}.dump(), "application/json");
    });

    // DELETE /api/employees/:id
    svr.Delete(R"(/api/employees/(\d+))", [&](const httplib::Request &req, httplib::Response &res) {
        const int id = std::stoi(req.matches[1]);
        if (dao.remove(id)) {
            res.set_content("{\"ok\":true}", "application/json");
        } else {
            res.status = 404;
            res.set_content("{\"error\":\"not found\"}", "application/json");
        }
    });

    qInfo() << "REST API слушает http://0.0.0.0:8080";
    svr.listen("0.0.0.0", 8080);

    return 0;
}
