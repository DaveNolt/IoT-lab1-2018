cmake_minimum_required(VERSION 3.10)

add_executable(IoT-temp main.cpp)
add_library(winring0 STATIC IMPORTED)
set_target_properties(winring0 PROPERTIES IMPORTED_LOCATION ${PROJECT_SOURCE_DIR}/lib/bin/WinRing0.lib)
target_link_libraries(IoT-temp winring0)

include_directories(${PROJECT_SOURCE_DIR}/lib/src)

add_custom_command(TARGET IoT-temp POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
        "${PROJECT_SOURCE_DIR}/lib/bin/dll"
        ${PROJECT_SOURCE_DIR}/js-part/helper
    COMMAND ${CMAKE_COMMAND} -E copy_directory
        "$<TARGET_FILE_DIR:IoT-temp>"
        ${PROJECT_SOURCE_DIR}/js-part/helper
        )