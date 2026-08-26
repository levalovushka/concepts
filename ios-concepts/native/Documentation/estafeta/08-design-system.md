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
    "surface": "relay_feed",
    "job": "Выполнить задачу экрана «Эстафета» в общем продуктовом цикле",
    "primaryAction": "open_relay",
    "pattern": "tab",
    "composition": [
      "root-header",
      "people-list"
    ],
    "primaryRegion": "product-content",
    "aboveFold": {
      "mustExpose": "Эстафета",
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
    "surface": "turn",
    "job": "Выполнить задачу экрана «Твой ход» в общем продуктовом цикле",
    "primaryAction": "accept_turn",
    "pattern": "push",
    "composition": [
      "post",
      "people-list"
    ],
    "primaryRegion": "product-content",
    "aboveFold": {
      "mustExpose": "Твой ход",
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
    "surface": "chapter_result",
    "job": "Выполнить задачу экрана «Продолжение» в общем продуктовом цикле",
    "primaryAction": "capture_chapter",
    "pattern": "push",
    "composition": [
      "post",
      "people-list"
    ],
    "primaryRegion": "product-content",
    "aboveFold": {
      "mustExpose": "Продолжение",
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
    "surface": "discover",
    "job": "Выполнить задачу экрана «Найти» в общем продуктовом цикле",
    "primaryAction": null,
    "pattern": "tab",
    "composition": [
      "root-header",
      "people-list"
    ],
    "primaryRegion": "product-content",
    "aboveFold": {
      "mustExpose": "Найти",
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
    "job": "Выполнить задачу экрана «Создать» в общем продуктовом цикле",
    "primaryAction": null,
    "pattern": "tab",
    "composition": [
      "root-header",
      "people-list"
    ],
    "primaryRegion": "product-content",
    "aboveFold": {
      "mustExpose": "Создать",
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
    "surface": "messages",
    "job": "Выполнить задачу экрана «Ответы» в общем продуктовом цикле",
    "primaryAction": null,
    "pattern": "tab",
    "composition": [
      "messages",
      "people-list"
    ],
    "primaryRegion": "product-content",
    "aboveFold": {
      "mustExpose": "Ответы",
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
    "surface": "services",
    "job": "Выполнить задачу экрана «Меню» в общем продуктовом цикле",
    "primaryAction": null,
    "pattern": "tab",
    "composition": [
      "root-header",
      "people-list"
    ],
    "primaryRegion": "product-content",
    "aboveFold": {
      "mustExpose": "Меню",
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
    "surface": "profile",
    "job": "Выполнить задачу экрана «Профиль» в общем продуктовом цикле",
    "primaryAction": null,
    "pattern": "push",
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
    "surface": "active_relays",
    "job": "Выполнить задачу экрана «Активные» в общем продуктовом цикле",
    "primaryAction": null,
    "pattern": "push",
    "composition": [
      "post",
      "people-list"
    ],
    "primaryRegion": "product-content",
    "aboveFold": {
      "mustExpose": "Активные",
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
    "surface": "drafts",
    "job": "Выполнить задачу экрана «Черновики» в общем продуктовом цикле",
    "primaryAction": null,
    "pattern": "push",
    "composition": [
      "post",
      "people-list"
    ],
    "primaryRegion": "product-content",
    "aboveFold": {
      "mustExpose": "Черновики",
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
    "surface": "schedule",
    "job": "Выполнить задачу экрана «Мои сроки» в общем продуктовом цикле",
    "primaryAction": null,
    "pattern": "push",
    "composition": [
      "post",
      "people-list"
    ],
    "primaryRegion": "product-content",
    "aboveFold": {
      "mustExpose": "Мои сроки",
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
    "surface": "handoff",
    "job": "Выполнить задачу экрана «Передать ход» в общем продуктовом цикле",
    "primaryAction": "pass_turn",
    "pattern": "push",
    "composition": [
      "post",
      "people-list"
    ],
    "primaryRegion": "product-content",
    "aboveFold": {
      "mustExpose": "Передать ход",
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
  }
]
```

## Правила

- Для VK-мимикрии используются approved VK-компоненты и Lucide product chrome.
- Liquid Glass принадлежит системному TabView; случайное стекло в контенте запрещено.
- SF Symbols остаются для платформенных действий.
- Декоративные селекторы, цветные иконки-плейсхолдеры и оторванные панели действий запрещены.
