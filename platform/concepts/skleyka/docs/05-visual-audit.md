# Склейка — visual audit

## Pass 1

Просмотрены все 18 экранов после backend-free переработки. Исправлено 9 дефектов: серверные статусы, участники, аккаунт, push, remote copy, source ambiguity, root navigation, media buttons и sheet карты.

## Pass 2

Повторно просмотрены все captures. Исправлен minor-дефект action PHPicker: текст сокращён до «Готово», slot расширен. Проверены светлые и тёмные поверхности, длинные подписи, локальные mixed states, empty/error/denied cases, safe areas, timeline и system sheets. Blocker/major нет.

## Consumer polish

Третий полный проход выполнен по всем 18 PNG после строгой критики. Пересобраны библиотека проектов, экран события и выбор места; фото-заглушку заменяет bundled-карта OpenStreetMap/CARTO. Из видимого UI удалены слова «офлайн», «на этом iPhone», «локальный», `metadata`, `proxy`, `draft`, `picker` и названия внутренних технологий. Исправлены 12 замечаний по иерархии, копирайту, плотности, карте и повторяющимся плиткам; blocker/major нет.

Проверены root navigation, push/back, camera, Photos, Files, request Share Sheet, on-device processing, draft, reorder/delete, viewer, Cast, background audio, Photos export и deny fallback.
