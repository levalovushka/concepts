# Публичный релиз Camo

Кнопка в корневом README всегда скачивает один asset:

`https://github.com/levalovushka/concepts/releases/latest/download/Camo-macOS.zip`

## Один раз для команды

1. Выпустить сертификат **Developer ID Application** в Apple Developer.
2. Сохранить данные нотариализации в Keychain:

```bash
xcrun notarytool store-credentials CAMO_NOTARY
```

## Сборка и публикация

```bash
export CAMO_DEVELOPER_ID="Developer ID Application: Company (TEAMID)"
export CAMO_NOTARY_PROFILE="CAMO_NOTARY"
npm run launcher:package

gh release create camo-v1.0.0 launcher/dist/Camo-macOS.zip \
  --repo levalovushka/concepts \
  --title "Camo 1.0.0" \
  --notes "Первый публичный релиз лаунчера нативных концептов"
```

Скрипт останавливается до создания ZIP, если нет обоих секретов, не проходит
подпись, нотариализация, stapling или Gatekeeper assessment. Поэтому ссылка в
README не может случайно начать раздавать неподписанную development-сборку.

TestFlight-сборка — отдельный песоченный продукт. Её процесс описан в
[TESTFLIGHT.md](TESTFLIGHT.md).
