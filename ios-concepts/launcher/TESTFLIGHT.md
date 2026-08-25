# Camo через TestFlight для Mac

Camo поставляется в двух режимах из одного исходного кода.

## Local runner

Непесоченная локальная сборка вызывает `xcodebuild`, `xcrun` и `simctl` сама.
Она предназначена для владельца репозитория и не отправляется в App Store Connect.

```bash
npm run launcher
cd launcher/build
xcodebuild -project Camo.xcodeproj -scheme Camo -configuration Debug \
  -derivedDataPath LocalDerivedData CODE_SIGNING_ALLOWED=NO build
open LocalDerivedData/Build/Products/Debug/Camo.app
```

## TestFlight catalog

Песоченная macOS-сборка содержит `DeveloperKit` со всеми концептами,
документацией, Swift-исходниками и готовыми Xcode-проектами. Разработчик может:

1. открыть документацию по разделам без рендера огромного Markdown целиком;
2. изучить исходники во вкладке «Файлы»;
3. сохранить документацию выбранного концепта;
4. экспортировать полный Developer Kit в выбранную папку;
5. открыть нужный `.xcodeproj` и запустить концепт кнопкой Run в Xcode.

TestFlight-каталог намеренно не запускает `simctl` из App Sandbox. Пользователь
сам выбирает папку для экспорта; приложение получает доступ только к ней.

### Локальная проверка каталога

```bash
npm run launcher:testflight
cd launcher/build
xcodebuild -project Camo.xcodeproj -scheme Camo -configuration Debug \
  -derivedDataPath TestFlightDerivedData CODE_SIGNING_ALLOWED=NO build
```

### Архив для App Store Connect

```bash
export CAMO_DEVELOPMENT_TEAM="YOUR_TEAM_ID"
export CAMO_BUNDLE_ID="com.yourcompany.camo"
export CAMO_MARKETING_VERSION="1.0"
export CAMO_BUILD_NUMBER="1"
npm run launcher:archive:testflight
```

Команда создаёт `launcher/build/Camo.xcarchive`. Перед загрузкой нужны созданный
App ID, запись macOS-приложения в App Store Connect, сертификаты команды,
контакт для beta review и политика конфиденциальности. Загрузка выполняется
через Organizer или Transporter после ручной проверки архива.

Официальные требования:

- TestFlight поддерживает macOS-приложения, собранные Xcode 13 или новее:
  <https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview>
- Mac App Store требует App Sandbox:
  <https://developer.apple.com/documentation/security/app-sandbox>
- Процесс архивации и TestFlight-distribution:
  <https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases>
