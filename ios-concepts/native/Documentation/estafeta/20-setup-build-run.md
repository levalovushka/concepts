# Архитектура, файлы и запуск

## Границы

- Product Blueprint владеет продуктом, графом, действиями и состояниями.
- Runtime владеет реальными iOS capability adapters.
- Reference Profile и DesignSystem владеют визуальной грамматикой.
- App source владеет сущностями, продуктовой логикой и SwiftUI-композицией.
- XCUI владеет доказательством сценариев, а screenshot gates — геометрией и визуальным качеством.

## Пути

- Product Blueprint: `native/ProductBlueprints/estafeta-vk.json`
- Swift source: `native/apps/estafeta`
- Xcode project: `native/build/estafeta`
- Captures: `native/artifacts/estafeta`

## Запуск

`npm run build -- estafeta`

`npm run capture -- estafeta`

`npm run smoke -- estafeta`
