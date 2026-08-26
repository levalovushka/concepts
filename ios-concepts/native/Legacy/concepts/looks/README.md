# Образы

Нативный социальный продукт об образах: лента, поиск, публикация, клипы, сообщения и сервисы. Мимикрия VK задаёт знакомую грамматику, а не копирует HTML или добавляет декоративные заглушки. Контракт находится в `concept.json`; SwiftUI-реализация — в `native/apps/looks`.

## Capture ownership

Все app-owned multi-state поверхности снимаются через свои реальные SwiftUI-экраны. `phone`, `code` и `codefail` драйвят auth state machine; `event` — участие и EventKit; `checkin` — location/Wi‑Fi permission flow и сохраняемую отметку. Synthetic capture presentation остаётся только для system- и extension-owned поверхностей; исчерпывающий registry лежит в `native/apps/looks/product-state-surfaces.json`.
