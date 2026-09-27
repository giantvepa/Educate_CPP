#include <QWidget>
#include <QVBoxLayout>
#include <QHBoxLayout>
#include <QGridLayout>
#include <QLabel>
#include <QSpinBox>
#include <QPushButton>
#include <QStringList>

// Окно аттестационной сессии (глава 5)
class SessionWindow : public QWidget
{
public:
    explicit SessionWindow(QWidget *parent = nullptr) : QWidget(parent)
    {
        setWindowTitle("Аттестационная сессия");
        resize(800, 500);

        auto *root = new QVBoxLayout(this);

        auto *top = new QHBoxLayout;

        // Слева — форма (заглушка)
        auto *formPlaceholder = new QLabel("Форма сотрудника\n(см. EmployeeForm)", this);
        formPlaceholder->setFrameShape(QFrame::StyledPanel);
        formPlaceholder->setAlignment(Qt::AlignCenter);
        top->addWidget(formPlaceholder, 1);

        // Справа — сетка критериев
        auto *grid = new QGridLayout;
        grid->addWidget(new QLabel("Критерий"), 0, 0);
        grid->addWidget(new QLabel("Оценка (1–5)"), 0, 1);

        const QStringList criteria = {"Знания", "Навыки", "Результативность"};
        for (int i = 0; i < criteria.size(); ++i) {
            grid->addWidget(new QLabel(criteria[i]), i + 1, 0);
            auto *spin = new QSpinBox;
            spin->setRange(1, 5);
            spin->setValue(3);
            grid->addWidget(spin, i + 1, 1);
        }
        top->addLayout(grid, 1);

        root->addLayout(top, 1);

        // Кнопки внизу
        auto *bottom = new QHBoxLayout;
        bottom->addStretch();
        bottom->addWidget(new QPushButton("Отмена"));
        bottom->addWidget(new QPushButton("Завершить сессию"));
        root->addLayout(bottom);
    }
};
