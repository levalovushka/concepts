# Публичный релиз Camo

Кнопка в корневом README всегда скачивает один asset:

`https://github.com/vladshukurov/camo/releases/latest/download/Camo-macOS.zip`

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
  --repo vladshukurov/camo \
  --title "Camo 1.0.0" \
  --notes "Первый публичный релиз лаунчера нативных концептов"
```

Скрипт останавливается до создания ZIP, если нет обоих секретов, не проходит
подпись, нотариализация, stapling или Gatekeeper assessment. Поэтому ссылка в
README не может случайно начать раздавать неподписанную development-сборку.

TestFlight-сборка — отдельный песоченный продукт. Её процесс описан в
[TESTFLIGHT.md](TESTFLIGHT.md).

## Автоматическая сборка через CI

`.github/workflows/release-camo.yml` в корне репозитория гоняет тот же
`npm run launcher:package` на push тега `camo-v*` (или вручную,
workflow_dispatch). Секреты подписи/нотаризации читаются из GitHub Actions
Secrets, список и точные команды экспорта — в комментарии в начале файла
workflow. Готовый `Camo-macOS.zip` кладётся только в workflow-артефакт
(доступен тем, у кого есть доступ к запускам Actions в репозитории) —
публикация во внешний канал (внутренний хостинг, приватный релиз и т.п.)
осознанно не автоматизирована и остаётся ручным шагом владельца дистрибуции.

Адрес appcast для автообновлений (`CamoAppcastURL` в Info.plist, читает
`Updater.swift`) задаётся переменной репозитория `CAMO_APPCAST_URL`
(Settings → Secrets and variables → Actions → Variables), а не хардкодится —
см. `CAMO_APPCAST_URL` в `launcher/gen/gen-launcher.mjs`.
