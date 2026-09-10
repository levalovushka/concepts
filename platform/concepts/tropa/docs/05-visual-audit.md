# Визуальный аудит

## Проход 1

Проверены все экраны и permission/denial состояния на целевом viewport. Исправлены: произвольные заголовки, неунифицированные отступы, браузерные margin, разная высота строк, неразмеченные chevron, inline-геометрия карты и пустая камера.

## Проход 2

Сопоставлены равнозначные поверхности: четыре tab roots, detail screens, grouped settings, composer/capture и result. Приняты единые tokens типографики, 4/8 spacing rhythm, radius 14/18, 44px hit targets, 20px Lucide icons и 46×28 toggles. Отдельно удалены conversation UI: ответы под наблюдением, поле отправки и упоминания обсуждений.

## Матрица просмотра

Все product, auth, fallback и system states отмечены в `07-quality-evidence.md`. После генерации свежих PNG contact sheet повторно проверяется на crop, резкость, safe area, перенос русских строк и composition.
