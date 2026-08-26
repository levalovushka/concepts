# Поэкранные состояния

| Экран | Состояния | Назначение |
|---|---|---|
| relay_feed | populated/default, empty, offline | Выполнить задачу экрана «Эстафета» в общем продуктовом цикле |
| turn | populated/default, error | Выполнить задачу экрана «Твой ход» в общем продуктовом цикле |
| chapter_result | populated/default, permission-denied | Выполнить задачу экрана «Продолжение» в общем продуктовом цикле |
| discover | populated/default, empty | Выполнить задачу экрана «Найти» в общем продуктовом цикле |
| create | populated/default, permission-denied | Выполнить задачу экрана «Создать» в общем продуктовом цикле |
| messages | populated/default, empty | Выполнить задачу экрана «Ответы» в общем продуктовом цикле |
| services | populated/default, offline | Выполнить задачу экрана «Меню» в общем продуктовом цикле |
| profile | populated/default | Выполнить задачу экрана «Профиль» в общем продуктовом цикле |
| active_relays | populated/default | Выполнить задачу экрана «Активные» в общем продуктовом цикле |
| drafts | populated/default | Выполнить задачу экрана «Черновики» в общем продуктовом цикле |
| schedule | populated/default | Выполнить задачу экрана «Мои сроки» в общем продуктовом цикле |
| handoff | populated/default, error | Выполнить задачу экрана «Передать ход» в общем продуктовом цикле |
| settings | populated/default | Выполнить задачу экрана «Настройки» в общем продуктовом цикле |

Каждый экран обязан реализовать loading, populated/default, empty, error и offline; permission-denied проверяется в capability-сценарии владельца.
