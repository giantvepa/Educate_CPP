#pragma once
#include <QObject>
#include <QSqlDatabase>

enum class SessionState { Draft, Active, Done };

class SessionService : public QObject
{
    Q_OBJECT
public:
    explicit SessionService(QObject *parent = nullptr)
        : QObject(parent)
    {
        m_db = QSqlDatabase::database();
    }

    SessionState state(int sessionId) const;
    bool transition(int sessionId, SessionState to);
    bool grade(int sessionId, int employeeId, int score);
    bool approve(int sessionId);

signals:
    void resultsChanged(int sessionId);

private:
    QSqlDatabase m_db;

    static QString toString(SessionState s);
    static bool canTransition(SessionState from, SessionState to);
};
