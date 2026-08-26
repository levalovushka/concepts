# Мок-данные и локальное состояние

## Сущности

```json
[
  {
    "id": "user",
    "name": "Пользователь"
  },
  {
    "id": "session",
    "name": "Сессия"
  },
  {
    "id": "credential",
    "name": "Способ входа"
  },
  {
    "id": "circle",
    "name": "Круг своих"
  },
  {
    "id": "community",
    "name": "Сообщество"
  },
  {
    "id": "deed",
    "name": "Дело"
  },
  {
    "id": "update",
    "name": "Обновление дела"
  },
  {
    "id": "contribution",
    "name": "Вклад помощника или предложение помощи как частный вид вклада в дело; поле kind различает offer и delivered."
  },
  {
    "id": "comment",
    "name": "Comment"
  },
  {
    "id": "search_result",
    "name": "Search result"
  },
  {
    "id": "notification",
    "name": "Notification"
  },
  {
    "id": "conversation",
    "name": "Conversation"
  },
  {
    "id": "message",
    "name": "Message"
  },
  {
    "id": "preference",
    "name": "Preference"
  },
  {
    "id": "access_state",
    "name": "Access state"
  },
  {
    "id": "attachment",
    "name": "Attachment"
  },
  {
    "id": "place",
    "name": "Place"
  },
  {
    "id": "notification_preference",
    "name": "Notification preference"
  },
  {
    "id": "feed_snapshot",
    "name": "Feed snapshot"
  },
  {
    "id": "digest",
    "name": "Digest"
  },
  {
    "id": "widget_snapshot",
    "name": "Widget snapshot"
  },
  {
    "id": "site_check",
    "name": "Site check"
  },
  {
    "id": "measurement_preference",
    "name": "Measurement preference"
  },
  {
    "id": "private_vault",
    "name": "Private vault"
  },
  {
    "id": "playback",
    "name": "Playback"
  },
  {
    "id": "call",
    "name": "Call"
  },
  {
    "id": "calendar_link",
    "name": "Calendar link"
  },
  {
    "id": "site_connection",
    "name": "Site connection"
  }
]
```

## Детерминированные fixture-записи

```json
[
  {
    "id": "fixture-user-alex",
    "entityId": "user",
    "purpose": "Текущий пользователь и автор собственного активного дела.",
    "values": [
      {
        "key": "id",
        "value": "user-alex"
      },
      {
        "key": "name",
        "value": "Алексей Воронцов"
      },
      {
        "key": "email",
        "value": "alex@example.test"
      },
      {
        "key": "avatar",
        "value": "avatar_alex"
      }
    ]
  },
  {
    "id": "fixture-user-marina",
    "entityId": "user",
    "purpose": "Друг, помощник и участник диалога.",
    "values": [
      {
        "key": "id",
        "value": "user-marina"
      },
      {
        "key": "name",
        "value": "Марина Ким"
      },
      {
        "key": "avatar",
        "value": "avatar_marina"
      }
    ]
  },
  {
    "id": "fixture-community-yard",
    "entityId": "community",
    "purpose": "Автор локального совместного дела.",
    "values": [
      {
        "key": "id",
        "value": "community-yard"
      },
      {
        "key": "name",
        "value": "Соседи на Абая"
      },
      {
        "key": "avatar",
        "value": "avatar_yard"
      }
    ]
  },
  {
    "id": "fixture-deed-bench",
    "entityId": "deed",
    "purpose": "Активное дело текущего пользователя с предложением помощи и сроком.",
    "values": [
      {
        "key": "id",
        "value": "deed-bench"
      },
      {
        "key": "authorId",
        "value": "user-alex"
      },
      {
        "key": "result",
        "value": "Починить деревянную скамейку во дворе"
      },
      {
        "key": "details",
        "value": "Нужно заменить две доски. Ищу дрель и совет по пропитке."
      },
      {
        "key": "status",
        "value": "active"
      },
      {
        "key": "deadline",
        "value": "2026-08-30T12:00:00+06:00"
      },
      {
        "key": "supporterIds",
        "value": "user-marina,user-timur"
      },
      {
        "key": "followerIds",
        "value": "user-marina"
      },
      {
        "key": "updatedAt",
        "value": "2026-08-26T09:10:00+06:00"
      }
    ]
  },
  {
    "id": "fixture-deed-garden",
    "entityId": "deed",
    "purpose": "Дело сообщества с площадкой, сетью и развивающейся историей.",
    "values": [
      {
        "key": "id",
        "value": "deed-garden"
      },
      {
        "key": "authorId",
        "value": "community-yard"
      },
      {
        "key": "result",
        "value": "Высадить клумбу у третьего подъезда"
      },
      {
        "key": "details",
        "value": "Саженцы уже есть. Нужны две пары рук в субботу."
      },
      {
        "key": "status",
        "value": "active"
      },
      {
        "key": "place",
        "value": "Двор на Абая, 48"
      },
      {
        "key": "expectedSSID",
        "value": "Svoi-Yard"
      },
      {
        "key": "updatedAt",
        "value": "2026-08-26T10:30:00+06:00"
      }
    ]
  },
  {
    "id": "fixture-deed-library",
    "entityId": "deed",
    "purpose": "Завершённое дело, доказывающее финал и эстафету.",
    "values": [
      {
        "key": "id",
        "value": "deed-library"
      },
      {
        "key": "authorId",
        "value": "user-marina"
      },
      {
        "key": "result",
        "value": "Собрать полку обмена книгами"
      },
      {
        "key": "status",
        "value": "completed"
      },
      {
        "key": "proofAttachment",
        "value": "proof_library"
      },
      {
        "key": "thankedUserIds",
        "value": "user-alex,user-timur"
      },
      {
        "key": "completedAt",
        "value": "2026-08-25T18:40:00+06:00"
      }
    ]
  },
  {
    "id": "fixture-update-voice",
    "entityId": "update",
    "purpose": "Голосовое обновление для микрофона, распознавания и фонового аудио.",
    "values": [
      {
        "key": "id",
        "value": "update-voice-1"
      },
      {
        "key": "deedId",
        "value": "deed-bench"
      },
      {
        "key": "authorId",
        "value": "user-alex"
      },
      {
        "key": "audioPath",
        "value": "audio-update-1.m4a"
      },
      {
        "key": "durationSeconds",
        "value": "8"
      },
      {
        "key": "transcript",
        "value": "Доски нашёл, завтра сниму старые и сверю размеры."
      }
    ]
  },
  {
    "id": "fixture-help-offer",
    "entityId": "contribution",
    "purpose": "Конкретная помощь вместо абстрактной реакции.",
    "values": [
      {
        "key": "id",
        "value": "contribution-drill"
      },
      {
        "key": "deedId",
        "value": "deed-bench"
      },
      {
        "key": "authorId",
        "value": "user-marina"
      },
      {
        "key": "kind",
        "value": "offer"
      },
      {
        "key": "text",
        "value": "Могу принести дрель после 18:00."
      }
    ]
  },
  {
    "id": "fixture-conversation-marina",
    "entityId": "conversation",
    "purpose": "Достижимый сценарий сообщений и звонка.",
    "values": [
      {
        "key": "id",
        "value": "conversation-marina"
      },
      {
        "key": "participantIds",
        "value": "user-alex,user-marina"
      },
      {
        "key": "relatedDeedId",
        "value": "deed-bench"
      },
      {
        "key": "lastMessage",
        "value": "Принесу дрель после работы."
      }
    ]
  },
  {
    "id": "fixture-private-deed",
    "entityId": "deed",
    "purpose": "Содержимое, реально защищаемое биометрией.",
    "values": [
      {
        "key": "id",
        "value": "deed-private"
      },
      {
        "key": "authorId",
        "value": "user-alex"
      },
      {
        "key": "result",
        "value": "Подготовить сюрприз для Марины"
      },
      {
        "key": "visibility",
        "value": "private"
      },
      {
        "key": "status",
        "value": "active"
      }
    ]
  },
  {
    "id": "fixture-notification-update",
    "entityId": "notification",
    "purpose": "Детерминированное открытие изменения из центра уведомлений.",
    "values": [
      {
        "key": "id",
        "value": "notification-garden-update"
      },
      {
        "key": "deedId",
        "value": "deed-garden"
      },
      {
        "key": "title",
        "value": "У клумбы появилось обновление"
      },
      {
        "key": "read",
        "value": "false"
      }
    ]
  }
]
```

## Хранение

Состояние концепта локальное и детерминированное. Поля capability outcomes принадлежат указанным сущностям и сохраняются после успешного действия. Backend не требуется.
