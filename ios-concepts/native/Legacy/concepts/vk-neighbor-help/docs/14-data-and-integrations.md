## Data, state, persistence, and integrations

**Entities**

- User
- Session
- Neighborhood
- HelpPost
- Response
- Conversation
- Message
- SharedDraft
- NotificationSnapshot

**State**

- Состояния карточки: draft, active, reserved, completed, expired, reported
- Состояния отклика: pending, accepted, declined, withdrawn
- Состояния сессии: signedOut, codeSent, authenticated, expired

**Persistence**

- Keychain для общей сессии приложения и расширения
- App Group SQLite для карточек, сообщений, черновиков и снимка уведомлений
- UserDefaults для выбранного района и фильтров

**Integrations**

- Email-code demo adapter
- Core Location
- Photos picker
- App Group Share Extension
- Notification Service Extension
