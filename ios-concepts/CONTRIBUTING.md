# Изменения native-модуля

Работайте из корня repository. Малый command interface проекта:

```sh
npm test
npm run factory:run -- native/fixtures/product-factory/request.example.json --adapter native/fixtures/product-factory/fixture-adapter.mjs --out /tmp/camo-factory-tracer
npm run factory:develop -- native/fixtures/product-factory/request.example.json --adapter path/to/factory-adapter.mjs --out path/to/product-development.json
npm run check -- looks
npm run build -- looks
npm run capture -- looks
npm run release -- looks
npm run launcher
npm run check:all
```

`check:all` включает isolation gate. Он проверяет пути и import graph, затем
копирует source tree в системную временную папку без родительского репозитория и
там повторяет `npm test` и все non-Xcode contract gates.

Правила locality:

- source, canonical docs и vendored evidence живут внутри repository;
- Xcode generation, builds, captures и receipts живут только в игнорируемых
  `native/build`, `native/artifacts` и `launcher/build`;
- normal commands не читают и не изменяют `platform/`;
- старые HTML-концепты читаются только командами `legacy:*` с обязательным
  `--legacy-root /path/to/legacy/platform`;
- не коммитьте `DerivedData`, локальный `docs/factory-readiness.json`, absolute
  machine paths или receipts без реального запуска;
- не подменяйте независимое review, physical-device или VoiceOver evidence.

После правок generated developer guides проверяются `npm run docs:check -- <slug>`.
Если канонический контракт изменился намеренно, сначала выполните
`npm run docs -- <slug>`, затем полный `npm run check:all`.
