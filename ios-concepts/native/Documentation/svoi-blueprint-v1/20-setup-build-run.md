# Архитектура, файлы и запуск

## Границы

- Product Blueprint владеет продуктом, графом, действиями и состояниями.
- Runtime владеет реальными iOS capability adapters.
- Reference Profile и DesignSystem владеют визуальной грамматикой.
- App source владеет сущностями, продуктовой логикой и SwiftUI-композицией.
- XCUI владеет доказательством сценариев, а screenshot gates — геометрией и визуальным качеством.

## Пути

- Product Blueprint: `native/ProductBlueprints/svoi-blueprint-v1-vk.json`
- Swift source: `native/apps/svoi-blueprint-v1`
- Xcode project: `native/build/svoi-blueprint-v1`
- Captures: `native/artifacts/svoi-blueprint-v1`

## Запуск

`npm run build -- svoi-blueprint-v1`

`npm run capture -- svoi-blueprint-v1`

`npm run smoke -- svoi-blueprint-v1`
