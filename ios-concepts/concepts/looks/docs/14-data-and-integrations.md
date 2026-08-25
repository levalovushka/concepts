## Data, state, persistence, and integrations

**Entities**

- Образ
- Отметка вещи
- Гардероб
- Ремикс
- Пользовательская сессия
- Черновик
- Разрешение

**State**

- Сессия и доступ к продукту
- Коллекция и detail для Образ
- Асинхронные loading/error состояния
- Permission state и denied fallback
- Локальный черновик и подтверждённый outcome

**Persistence**

- UserDefaults только для небольших явных настроек и локального восстановления
- Keychain или App Group только по capability contract
- Черновик сохраняется до отправки или явной отмены
- Удалённые записи требуют отдельно одобренного provider adapter

**Integrations**

- Системные iOS frameworks из capability manifest
- Одобренный identity/provider adapter
- Notification adapter после явной подписки
- Reference profile используется только для визуального и интеракционного соответствия
