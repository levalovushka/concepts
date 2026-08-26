# Поэкранные состояния

| Экран | Состояния | Назначение |
|---|---|---|
| relay_feed | populated/default, empty, offline | Выполнить задачу экрана «Эстафета» в общем продуктовом цикле |
| turn | populated/default, error | Выполнить задачу экрана «Твой ход» в общем продуктовом цикле |
| chapter_result | populated/default, permission-denied | Выполнить задачу экрана «Продолжение» в общем продуктовом цикле |
| discover | populated/default, empty | Выполнить задачу экрана «Найти» в общем продуктовом цикле |
| create | populated/default, permission-denied | Выполнить задачу экрана «Создать» в общем продуктовом цикле |
| messages | populated/default, empty | Выполнить задачу экрана «Ответы» в общем продуктовом цикле |
| services | populated/default, offline | Выполнить задачу экрана «Профиль» в общем продуктовом цикле |
| settings | populated/default | Выполнить задачу экрана «Настройки» в общем продуктовом цикле |

Каждый экран обязан реализовать loading, populated/default, empty, error и offline; permission-denied проверяется в capability-сценарии владельца.
