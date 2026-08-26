## Testing, evidence, and capture plan

**Levels**

- Unit: переходы состояний и фильтры
- Integration: App Group, Keychain, очередь офлайн-действий
- UI: вход, первый экран, создание, отклик, отказ в разрешениях
- Extension: импорт общего изображения и обогащение уведомления

**Evidence**

- Снимки populated, empty, error и offline первого экрана
- Логи сохранения сессии после перезапуска
- Проверка ручного района без Location

**Capture identifiers**

- Первый экран с тремя различными карточками
- Черновик из Share Extension
- Диалог после структурированного отклика

**Evidence provenance**

- e1 · user-input · observed · Краткий запрос на новый нативный концепт в мимикрии ВКонтакте.
- e2 · assumption · needs-validation · Продуктовая гипотеза, выведенная из запроса; пользовательских исследований не предоставлено.
