# Поэкранные состояния

| Экран | Состояния | Назначение |
|---|---|---|
| login | loading, populated/default, empty, error, offline | Выполнить задачу экрана «Вход» в общем продуктовом цикле |
| feed | loading, populated/default, empty, error, offline | Выполнить задачу экрана «Лента» в общем продуктовом цикле |
| post_detail | loading, populated/default, empty, error, offline | Выполнить задачу экрана «Дело» в общем продуктовом цикле |
| comments | loading, populated/default, empty, error, offline | Выполнить задачу экрана «Комментарии» в общем продуктовом цикле |
| search | loading, populated/default, empty, error, offline | Выполнить задачу экрана «Поиск» в общем продуктовом цикле |
| create | loading, populated/default, empty, error, offline | Выполнить задачу экрана «Новое дело» в общем продуктовом цикле |
| complete | loading, populated/default, empty, error, offline | Выполнить задачу экрана «Завершить дело» в общем продуктовом цикле |
| messages | loading, populated/default, empty, error, offline | Выполнить задачу экрана «Сообщения» в общем продуктовом цикле |
| conversation | loading, populated/default, empty, error, offline | Выполнить задачу экрана «Диалог» в общем продуктовом цикле |
| profile | loading, populated/default, empty, error, offline | Выполнить задачу экрана «Профиль» в общем продуктовом цикле |
| saved | loading, populated/default, empty, error, offline | Выполнить задачу экрана «Сохранённые» в общем продуктовом цикле |
| notifications | loading, populated/default, empty, error, offline | Выполнить задачу экрана «Уведомления» в общем продуктовом цикле |
| settings | loading, populated/default, empty, error, offline | Выполнить задачу экрана «Настройки» в общем продуктовом цикле |
| accesses | loading, populated/default, empty, error, offline | Выполнить задачу экрана «Доступы» в общем продуктовом цикле |
| private_deeds | loading, populated/default, empty, error, offline | Выполнить задачу экрана «Приватные дела» в общем продуктовом цикле |

Каждый экран обязан реализовать loading, populated/default, empty, error и offline; permission-denied проверяется в capability-сценарии владельца.
