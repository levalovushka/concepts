## Permissions, capabilities, and entitlements

| Permission | Product value | Request timing | Flow | Denied fallback | Native activation |
|---|---|---|---|---|---|
| photos | Добавить пользовательское фото предмета. | После нажатия «Добавить фото». | Опубликовать просьбу или предложение. | Карточка создаётся без изображения. | contextual-gesture |
| location | Преобразовать текущее положение в приблизительный район. | После явного нажатия «Найти рядом». | Увидеть актуальные карточки района. | Ручной выбор района. | contextual-gesture |
| push | Сообщать о новых ответах и явно сохранённых категориях. | После создания карточки или подписки на категорию. | Увидеть актуальные карточки района. | Обновления доступны внутри приложения. | contextual-gesture |
| remotenotif | Обновить локальный снимок активных карточек. | После включения обновлений карточки. | Увидеть актуальные карточки района. | Снимок обновляется при запуске. | app-lifecycle |
| appgroups | Передать черновик из Share Extension. | При выборе расширения в системном меню «Поделиться». | Создать черновик из Share Extension. | Пользователь копирует текст вручную. | build-artifact |
| keychain | Разделить действующую сессию с Share Extension. | После успешного кода. | Войти по коду из электронной почты. | Расширение предлагает открыть приложение и войти. | build-artifact |

**Entitlements:** `aps-environment`, `com.apple.security.application-groups`, `keychain-access-groups`
**Extension targets:** `share-extension`, `notification-service`
