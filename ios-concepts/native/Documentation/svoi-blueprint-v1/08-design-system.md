# Дизайн-система и состав экранов

## Токены

```json
{
  "accent": "#0077FF",
  "background": "#FFFFFF",
  "groupedBackground": "#F2F3F5",
  "fill": "#F2F3F5",
  "separator": "#E7E8EC",
  "textPrimary": "#000000",
  "textSecondary": "#818C99",
  "badge": "#FF3347",
  "outgoingStart": "#4B8BF5",
  "outgoingMiddle": "#A44BF5",
  "outgoingEnd": "#F54BA4"
}
```

## Контракты поверхностей

```json
[
  {
    "surface": "login",
    "job": "Выполнить задачу экрана «Вход» в общем продуктовом цикле",
    "primaryAction": null,
    "pattern": "root",
    "composition": [
      "post",
      "people-list"
    ],
    "primaryRegion": "product-content",
    "aboveFold": {
      "mustExpose": "Вход",
      "maxPreludeLayers": 1
    },
    "allowedFamilies": [
      "post",
      "people-list"
    ],
    "forbiddenFamilies": [
      "decorative-gradient",
      "colored-icon-placeholder",
      "unowned-selector",
      "detached-action-panel"
    ],
    "source": "vk-ios-reference-ui-kit"
  },
  {
    "surface": "feed",
    "job": "Выполнить задачу экрана «Лента» в общем продуктовом цикле",
    "primaryAction": null,
    "pattern": "social-feed",
    "composition": [
      "root-header",
      "authored-posts",
      "attached-feedback"
    ],
    "primaryRegion": "authored-posts",
    "aboveFold": {
      "mustExpose": "Лента",
      "maxPreludeLayers": 1
    },
    "allowedFamilies": [
      "root-header",
      "social-feed",
      "post"
    ],
    "forbiddenFamilies": [
      "decorative-gradient",
      "colored-icon-placeholder",
      "unowned-selector",
      "detached-action-panel"
    ],
    "source": "vk-ios-reference-ui-kit"
  },
  {
    "surface": "post_detail",
    "job": "Выполнить задачу экрана «Дело» в общем продуктовом цикле",
    "primaryAction": "support_deed",
    "pattern": "push",
    "composition": [
      "post",
      "people-list"
    ],
    "primaryRegion": "product-content",
    "aboveFold": {
      "mustExpose": "Дело",
      "maxPreludeLayers": 1
    },
    "allowedFamilies": [
      "post",
      "people-list"
    ],
    "forbiddenFamilies": [
      "decorative-gradient",
      "colored-icon-placeholder",
      "unowned-selector",
      "detached-action-panel"
    ],
    "source": "vk-ios-reference-ui-kit"
  },
  {
    "surface": "comments",
    "job": "Выполнить задачу экрана «Комментарии» в общем продуктовом цикле",
    "primaryAction": null,
    "pattern": "sheet",
    "composition": [
      "root-header",
      "form"
    ],
    "primaryRegion": "product-content",
    "aboveFold": {
      "mustExpose": "Комментарии",
      "maxPreludeLayers": 1
    },
    "allowedFamilies": [
      "root-header",
      "form"
    ],
    "forbiddenFamilies": [
      "decorative-gradient",
      "colored-icon-placeholder",
      "unowned-selector",
      "detached-action-panel"
    ],
    "source": "vk-ios-reference-ui-kit"
  },
  {
    "surface": "search",
    "job": "Выполнить задачу экрана «Поиск» в общем продуктовом цикле",
    "primaryAction": null,
    "pattern": "tab",
    "composition": [
      "root-header",
      "people-list"
    ],
    "primaryRegion": "product-content",
    "aboveFold": {
      "mustExpose": "Поиск",
      "maxPreludeLayers": 1
    },
    "allowedFamilies": [
      "root-header",
      "people-list"
    ],
    "forbiddenFamilies": [
      "decorative-gradient",
      "colored-icon-placeholder",
      "unowned-selector",
      "detached-action-panel"
    ],
    "source": "vk-ios-reference-ui-kit"
  },
  {
    "surface": "create",
    "job": "Выполнить задачу экрана «Новое дело» в общем продуктовом цикле",
    "primaryAction": "create_deed",
    "pattern": "tab",
    "composition": [
      "root-header",
      "people-list"
    ],
    "primaryRegion": "product-content",
    "aboveFold": {
      "mustExpose": "Новое дело",
      "maxPreludeLayers": 1
    },
    "allowedFamilies": [
      "root-header",
      "people-list"
    ],
    "forbiddenFamilies": [
      "decorative-gradient",
      "colored-icon-placeholder",
      "unowned-selector",
      "detached-action-panel"
    ],
    "source": "vk-ios-reference-ui-kit"
  },
  {
    "surface": "complete",
    "job": "Выполнить задачу экрана «Завершить дело» в общем продуктовом цикле",
    "primaryAction": null,
    "pattern": "sheet",
    "composition": [
      "root-header",
      "form"
    ],
    "primaryRegion": "product-content",
    "aboveFold": {
      "mustExpose": "Завершить дело",
      "maxPreludeLayers": 1
    },
    "allowedFamilies": [
      "root-header",
      "form"
    ],
    "forbiddenFamilies": [
      "decorative-gradient",
      "colored-icon-placeholder",
      "unowned-selector",
      "detached-action-panel"
    ],
    "source": "vk-ios-reference-ui-kit"
  },
  {
    "surface": "messages",
    "job": "Выполнить задачу экрана «Сообщения» в общем продуктовом цикле",
    "primaryAction": null,
    "pattern": "tab",
    "composition": [
      "messages",
      "people-list"
    ],
    "primaryRegion": "product-content",
    "aboveFold": {
      "mustExpose": "Сообщения",
      "maxPreludeLayers": 1
    },
    "allowedFamilies": [
      "messages",
      "people-list"
    ],
    "forbiddenFamilies": [
      "decorative-gradient",
      "colored-icon-placeholder",
      "unowned-selector",
      "detached-action-panel"
    ],
    "source": "vk-ios-reference-ui-kit"
  },
  {
    "surface": "conversation",
    "job": "Выполнить задачу экрана «Диалог» в общем продуктовом цикле",
    "primaryAction": null,
    "pattern": "push",
    "composition": [
      "messages",
      "people-list"
    ],
    "primaryRegion": "product-content",
    "aboveFold": {
      "mustExpose": "Диалог",
      "maxPreludeLayers": 1
    },
    "allowedFamilies": [
      "messages",
      "people-list"
    ],
    "forbiddenFamilies": [
      "decorative-gradient",
      "colored-icon-placeholder",
      "unowned-selector",
      "detached-action-panel"
    ],
    "source": "vk-ios-reference-ui-kit"
  },
  {
    "surface": "profile",
    "job": "Выполнить задачу экрана «Профиль» в общем продуктовом цикле",
    "primaryAction": null,
    "pattern": "tab",
    "composition": [
      "profile-cards",
      "people-list"
    ],
    "primaryRegion": "product-content",
    "aboveFold": {
      "mustExpose": "Профиль",
      "maxPreludeLayers": 1
    },
    "allowedFamilies": [
      "profile-cards",
      "people-list"
    ],
    "forbiddenFamilies": [
      "decorative-gradient",
      "colored-icon-placeholder",
      "unowned-selector",
      "detached-action-panel"
    ],
    "source": "vk-ios-reference-ui-kit"
  },
  {
    "surface": "saved",
    "job": "Выполнить задачу экрана «Сохранённые» в общем продуктовом цикле",
    "primaryAction": null,
    "pattern": "push",
    "composition": [
      "post",
      "people-list"
    ],
    "primaryRegion": "product-content",
    "aboveFold": {
      "mustExpose": "Сохранённые",
      "maxPreludeLayers": 1
    },
    "allowedFamilies": [
      "post",
      "people-list"
    ],
    "forbiddenFamilies": [
      "decorative-gradient",
      "colored-icon-placeholder",
      "unowned-selector",
      "detached-action-panel"
    ],
    "source": "vk-ios-reference-ui-kit"
  },
  {
    "surface": "notifications",
    "job": "Выполнить задачу экрана «Уведомления» в общем продуктовом цикле",
    "primaryAction": null,
    "pattern": "push",
    "composition": [
      "post",
      "people-list"
    ],
    "primaryRegion": "product-content",
    "aboveFold": {
      "mustExpose": "Уведомления",
      "maxPreludeLayers": 1
    },
    "allowedFamilies": [
      "post",
      "people-list"
    ],
    "forbiddenFamilies": [
      "decorative-gradient",
      "colored-icon-placeholder",
      "unowned-selector",
      "detached-action-panel"
    ],
    "source": "vk-ios-reference-ui-kit"
  },
  {
    "surface": "settings",
    "job": "Выполнить задачу экрана «Настройки» в общем продуктовом цикле",
    "primaryAction": null,
    "pattern": "push",
    "composition": [
      "post",
      "people-list"
    ],
    "primaryRegion": "product-content",
    "aboveFold": {
      "mustExpose": "Настройки",
      "maxPreludeLayers": 1
    },
    "allowedFamilies": [
      "post",
      "people-list"
    ],
    "forbiddenFamilies": [
      "decorative-gradient",
      "colored-icon-placeholder",
      "unowned-selector",
      "detached-action-panel"
    ],
    "source": "vk-ios-reference-ui-kit"
  },
  {
    "surface": "accesses",
    "job": "Выполнить задачу экрана «Доступы» в общем продуктовом цикле",
    "primaryAction": null,
    "pattern": "push",
    "composition": [
      "post",
      "people-list"
    ],
    "primaryRegion": "product-content",
    "aboveFold": {
      "mustExpose": "Доступы",
      "maxPreludeLayers": 1
    },
    "allowedFamilies": [
      "post",
      "people-list"
    ],
    "forbiddenFamilies": [
      "decorative-gradient",
      "colored-icon-placeholder",
      "unowned-selector",
      "detached-action-panel"
    ],
    "source": "vk-ios-reference-ui-kit"
  },
  {
    "surface": "private_deeds",
    "job": "Выполнить задачу экрана «Приватные дела» в общем продуктовом цикле",
    "primaryAction": null,
    "pattern": "push",
    "composition": [
      "post",
      "people-list"
    ],
    "primaryRegion": "product-content",
    "aboveFold": {
      "mustExpose": "Приватные дела",
      "maxPreludeLayers": 1
    },
    "allowedFamilies": [
      "post",
      "people-list"
    ],
    "forbiddenFamilies": [
      "decorative-gradient",
      "colored-icon-placeholder",
      "unowned-selector",
      "detached-action-panel"
    ],
    "source": "vk-ios-reference-ui-kit"
  }
]
```

## Правила

- Для VK-мимикрии используются approved VK-компоненты и Lucide product chrome.
- Liquid Glass принадлежит системному TabView; случайное стекло в контенте запрещено.
- SF Symbols остаются для платформенных действий.
- Декоративные селекторы, цветные иконки-плейсхолдеры и оторванные панели действий запрещены.
