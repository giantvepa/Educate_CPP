#include <QApplication>
#include "ui/MainWindow.h"

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);
    app.setApplicationName("Аттестация сотрудников");
    app.setOrganizationName("Kulkhanov");

    MainWindow window;
    window.show();

    return app.exec();
}
