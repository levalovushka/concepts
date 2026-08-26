# Executable acceptance scenarios · 2

XCUI must execute the action IDs in order and assert the observable result, not merely open screens.

| ID | Scenario | Start | Actions | Expected result | Recovery |
|---|---|---|---|---|---|
| navigation-open_settings | Приёмочный сценарий 29 | profile | open_settings | Открываются настройки приватности, уведомлений и безопасности | Последний подтверждённый шаг сохраняется, действие можно повторить. |
