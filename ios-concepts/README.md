# Camo Launcher

В этом каталоге остался только macOS-лаунчер. Актуальный нативный pipeline
находится в [`../platform`](../platform): продуктовые факты живут в
`platform/concepts`, авторский SwiftUI — в `platform/native-apps`, а общий слой
доступов — в `platform/native-runtime`.

## Requirements

- macOS с Xcode и симулятором `iPhone 17 Pro`;
- Node.js 20 или новее.

## Сборка

```sh
npm run launcher
cd launcher/build
xcodebuild -project Camo.xcodeproj -scheme Camo -configuration Debug \
  -derivedDataPath LocalDerivedData CODE_SIGNING_ALLOWED=NO build
open LocalDerivedData/Build/Products/Debug/Camo.app
```

Лаунчер сам находит корень репозитория. При необходимости его можно задать через
`CAMO_REPOSITORY_ROOT=/path/to/repository`.

Кнопка «Запустить» выполняет новый цикл `build-app.mjs → xcodebuild → simctl`,
а не обращается к удалённому pipeline «Эстафеты».

Подробнее: [`launcher/README.md`](launcher/README.md).
