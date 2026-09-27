#include "SessionService.h"
#include <QSqlQuery>
#include <QSqlError>
#include <QDebug>

QString SessionService::toString(SessionState s)
{
    switch (s) {
    case SessionState::Draft:  return "draft";
    case SessionState::Active: return "active";
    case SessionState::Done:   return "done";
    }
    return "draft";
}

bool SessionService::canTransition(SessionState from, SessionState to)
{
    return (from == SessionState::Draft  && to == SessionState::Active)
        || (from == SessionState::Active && to == SessionState::Done);
}

SessionState SessionService::state(int sessionId) const
{
    QSqlQuery q(m_db);
    q.prepare("SELECT status FROM sessions WHERE id = :id");
    q.bindValue(":id", sessionId);
    if (!q.exec() || !q.next()) return SessionState::Draft;

    const QString s = q.value(0).toString();
    if (s == "active") return SessionState::Active;
    if (s == "done")   return SessionState::Done;
    return SessionState::Draft;
}

bool SessionService::transition(int sessionId, SessionState to)
{
    const SessionState from = state(sessionId);
    if (!canTransition(from, to))
        return false;

    QSqlQuery q(m_db);
    q.prepare("UPDATE sessions SET status = :to "
              "WHERE id = :id AND status = :from");
    q.bindValue(":to", toString(to));
    q.bindValue(":id", sessionId);
    q.bindValue(":from", toString(from));
    if (!q.exec()) {
        qWarning() << "transition() failed:" << q.lastError().text();
        return false;
    }
    return q.numRowsAffected() == 1;
}

bool SessionService::grade(int sessionId, int employeeId, int score)
{
    if (score < 1 || score > 5)
        return false;
    if (state(sessionId) != SessionState::Active)
        return false;

    m_db.transaction();

    QSqlQuery q(m_db);
    q.prepare("INSERT INTO results (session_id, employee_id, score) "
              "VALUES (:s, :e, :score) "
              "ON CONFLICT(session_id, employee_id) DO UPDATE SET score = :score");
    q.bindValue(":s", sessionId);
    q.bindValue(":e", employeeId);
    q.bindValue(":score", score);

    if (!q.exec()) {
        m_db.rollback();
        qWarning() << "grade() failed:" << q.lastError().text();
        return false;
    }

    m_db.commit();
    emit resultsChanged(sessionId);
    return true;
}

bool SessionService::approve(int sessionId)
{
    if (!m_db.transaction()) return false;

    QSqlQuery q(m_db);
    q.prepare("SELECT COUNT(*) FROM results WHERE session_id = :id");
    q.bindValue(":id", sessionId);
    if (!q.exec()) {
        m_db.rollback();
        return false;
    }
    q.next();
    if (q.value(0).toInt() == 0) {
        m_db.rollback();
        return false;
    }

    const bool ok = transition(sessionId, SessionState::Done);
    ok ? m_db.commit() : m_db.rollback();
    return ok;
}
