#pragma once
#include <QComboBox>
#include <QFormLayout>
#include <QLineEdit>
#include <QPushButton>
#include <QWidget>

class EmployeeForm : public QWidget
{
    Q_OBJECT
public:
    explicit EmployeeForm(QWidget *parent = nullptr) : QWidget(parent)
    {
        auto *form = new QFormLayout(this);

        m_name = new QLineEdit(this);
        m_name->setPlaceholderText("Иванов Иван Иванович");
        m_post = new QLineEdit(this);
        m_post->setPlaceholderText("ведущий инженер");
        m_dept = new QComboBox(this);
        m_dept->addItems({"Разработка", "Тестирование", "Внедрение"});

        form->addRow("ФИО",       m_name);
        form->addRow("Должность", m_post);
        form->addRow("Отдел",     m_dept);

        auto *save = new QPushButton("Сохранить", this);
        form->addRow(save);

        connect(save, &QPushButton::clicked, this, [this] {
            if (m_name->text().trimmed().isEmpty()) {
                m_name->setStyleSheet("border: 1px solid #e05252;");
                m_name->setFocus();
                return;
            }
            emit saved(m_name->text().trimmed(),
                       m_post->text().trimmed(),
                       m_dept->currentText());
        });
    }

signals:
    void saved(const QString &name, const QString &post, const QString &dept);

private:
    QLineEdit *m_name;
    QLineEdit *m_post;
    QComboBox *m_dept;
};
