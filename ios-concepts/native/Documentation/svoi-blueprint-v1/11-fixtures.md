# Deterministic fixture catalog

Fixtures use stable IDs and power captures, edge cases and acceptance flows.

| Fixture | Entity | Purpose | Values |
|---|---|---|---|
| fixture-user-alex | user | Текущий пользователь и автор собственного активного дела. | id: user-alex<br>name: Алексей Воронцов<br>email: alex@example.test<br>avatar: avatar_alex |
| fixture-user-marina | user | Друг, помощник и участник диалога. | id: user-marina<br>name: Марина Ким<br>avatar: avatar_marina |
| fixture-community-yard | community | Автор локального совместного дела. | id: community-yard<br>name: Соседи на Абая<br>avatar: avatar_yard |
| fixture-deed-bench | deed | Активное дело текущего пользователя с предложением помощи и сроком. | id: deed-bench<br>authorId: user-alex<br>result: Починить деревянную скамейку во дворе<br>details: Нужно заменить две доски. Ищу дрель и совет по пропитке.<br>status: active<br>deadline: 2026-08-30T12:00:00+06:00<br>supporterIds: user-marina,user-timur<br>followerIds: user-marina<br>updatedAt: 2026-08-26T09:10:00+06:00 |
| fixture-deed-garden | deed | Дело сообщества с площадкой, сетью и развивающейся историей. | id: deed-garden<br>authorId: community-yard<br>result: Высадить клумбу у третьего подъезда<br>details: Саженцы уже есть. Нужны две пары рук в субботу.<br>status: active<br>place: Двор на Абая, 48<br>expectedSSID: Svoi-Yard<br>updatedAt: 2026-08-26T10:30:00+06:00 |
| fixture-deed-library | deed | Завершённое дело, доказывающее финал и эстафету. | id: deed-library<br>authorId: user-marina<br>result: Собрать полку обмена книгами<br>status: completed<br>proofAttachment: proof_library<br>thankedUserIds: user-alex,user-timur<br>completedAt: 2026-08-25T18:40:00+06:00 |
| fixture-update-voice | update | Голосовое обновление для микрофона, распознавания и фонового аудио. | id: update-voice-1<br>deedId: deed-bench<br>authorId: user-alex<br>audioPath: audio-update-1.m4a<br>durationSeconds: 8<br>transcript: Доски нашёл, завтра сниму старые и сверю размеры. |
| fixture-help-offer | contribution | Конкретная помощь вместо абстрактной реакции. | id: contribution-drill<br>deedId: deed-bench<br>authorId: user-marina<br>kind: offer<br>text: Могу принести дрель после 18:00. |
| fixture-conversation-marina | conversation | Достижимый сценарий сообщений и звонка. | id: conversation-marina<br>participantIds: user-alex,user-marina<br>relatedDeedId: deed-bench<br>lastMessage: Принесу дрель после работы. |
| fixture-private-deed | deed | Содержимое, реально защищаемое биометрией. | id: deed-private<br>authorId: user-alex<br>result: Подготовить сюрприз для Марины<br>visibility: private<br>status: active |
| fixture-notification-update | notification | Детерминированное открытие изменения из центра уведомлений. | id: notification-garden-update<br>deedId: deed-garden<br>title: У клумбы появилось обновление<br>read: false |
