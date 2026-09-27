cmake_minimum_required(VERSION 3.16)
project(attestation LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_AUTOMOC ON)

# Поиск Qt 6
find_package(Qt6 REQUIRED COMPONENTS Widgets Sql Network)

# Ядро: Dao + Service (без UI)
add_library(core STATIC
    src/core/EmployeeDao.cpp
    src/core/SessionService.cpp
)
target_link_libraries(core PUBLIC Qt6::Sql)
target_include_directories(core PUBLIC src)

# Десктоп
add_executable(attestation-ui
    src/main.cpp
    src/ui/MainWindow.cpp
    src/ui/SessionWindow.cpp
)
target_link_libraries(attestation-ui PRIVATE core Qt6::Widgets Qt6::Network)

# REST API
add_executable(attestation-api
    src/api/main.cpp
)
target_link_libraries(attestation-api PRIVATE core)

# Копируем схему базы
configure_file(schema.sql ${CMAKE_BINARY_DIR}/schema.sql COPYONLY)
