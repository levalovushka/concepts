## Architecture and module boundaries

| Module | Responsibility | Owns |
|---|---|---|
| Рядом · module 1 | Вход по коду и общая сессия | Owns Карточка помощи: просьба или предложение с автором, категорией, сроком, приблизительным местом и статусом state and rules |
| HelpFeed | Лента, фильтрация и карточки | HelpPost |
| Conversation | Отклики и сообщения | Response, Conversation, Message |
| Extensions | Приём общего контента и обработка уведомлений | SharedDraft, NotificationSnapshot |

**Boundaries**
- Геопозиция преобразуется в приблизительный район до публикации.
- Share Extension создаёт черновик, но не публикует без открытия приложения.
- Notification Service Extension только обогащает уведомление данными из локального снимка.
