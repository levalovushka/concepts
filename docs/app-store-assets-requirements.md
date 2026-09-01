# Требования к изображениям и App Preview для App Store

Проверено: **1 сентября 2026 года**. Источники: только официальная документация Apple. Требования у Apple меняются вместе с новыми устройствами, поэтому перед релизом генератору стоит уметь повторно сверять таблицы спецификаций.

## Короткий вывод для генератора

Минимальный технический набор для iOS/iPadOS-приложения:

- **iPhone:** от 1 до 10 скриншотов. Достаточно загрузить набор для дисплея 6,9"; App Store Connect масштабирует его для меньших дисплеев. Если 6,9" не предоставлен, обязателен набор 6,5". Практический мастер-размер для нового шаблона — **1320 × 2868 px** (portrait) или **2868 × 1320 px** (landscape): это самый большой из принимаемых Apple размеров 6,9".
- **iPad:** если приложение запускается на iPad, набор для 13" обязателен. Практический мастер-размер — **2064 × 2752 px** (portrait) или **2752 × 2064 px** (landscape); также Apple принимает 2048 × 2732 / 2732 × 2048 px.
- Форматы скриншотов: `.jpeg`, `.jpg`, `.png`; **без alpha-канала и прозрачности**.
- App Preview — необязательное видео; до 3 роликов на каждый размер устройства и локализацию. Ролики всегда отображаются перед скриншотами.
- Все изображения и ролики должны честно показывать реальный интерфейс/геймплей приложения. Текстовые и графические оверлеи разрешены, но не должны подменять сам продукт.

Основание: [Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/), [Upload app previews and screenshots](https://developer.apple.com/help/app-store-connect/manage-app-information/upload-app-previews-and-screenshots), [App Review Guidelines, 2.3](https://developer.apple.com/app-store/review/guidelines/#accurate-metadata).

## Скриншоты: количество, формат и обязательность

- От **1 до 10** скриншотов на поддерживаемую платформу/набор устройства.
- Принимаются JPEG/JPG/PNG без прозрачности.
- Допустимы portrait и landscape в перечисленных ниже размерах.
- Скриншоты являются обязательным metadata-полем и могут быть локализованы.
- Если UI одинаков на разных размерах, Apple рекомендует загрузить только скриншоты самого высокого требуемого разрешения: App Store Connect автоматически уменьшит их. Отдельные варианты можно загрузить через Media Manager.
- После одобрения версии для замены скриншотов нужно создать новую версию приложения.

Источники: [Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/), [Platform version information](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information/), [Upload app previews and screenshots](https://developer.apple.com/help/app-store-connect/manage-app-information/upload-app-previews-and-screenshots).

### Допустимые размеры скриншотов iPhone

| Семейство дисплея | Portrait, px | Landscape, px | Обязательность / fallback |
|---|---:|---:|---|
| 6,9" | 1260 × 2736; 1290 × 2796; 1320 × 2868 | 2736 × 1260; 2796 × 1290; 2868 × 1320 | Главный актуальный набор; меньшие размеры могут быть получены из него |
| 6,5" | 1284 × 2778; 1242 × 2688 | 2778 × 1284; 2688 × 1242 | Обязателен для iPhone-приложения, если нет 6,9"; иначе может быть сгенерирован из 6,9" |
| 6,3" | 1179 × 2556; 1206 × 2622 | 2556 × 1179; 2622 × 1206 | При отсутствии используется масштабированный 6,5" |
| 6,1" | 1170 × 2532; 1125 × 2436; 1080 × 2340 | 2532 × 1170; 2436 × 1125; 2340 × 1080 | При отсутствии используется масштабированный 6,5" |
| 5,5" | 1242 × 2208 | 2208 × 1242 | При отсутствии используется масштабированный 6,1" |
| 4,7" | 750 × 1334 | 1334 × 750 | При отсутствии используется масштабированный 5,5" |
| 4" | 640 × 1096 без status bar; 640 × 1136 со status bar | 1136 × 600 без status bar; 1136 × 640 со status bar | При отсутствии используется масштабированный 4,7" |
| 3,5" | 640 × 920 без status bar; 640 × 960 со status bar | 960 × 600 без status bar; 960 × 640 со status bar | При отсутствии используется масштабированный 4" |

Источник: [Apple — Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/).

### Допустимые размеры скриншотов iPad

| Семейство дисплея | Portrait, px | Landscape, px | Обязательность / fallback |
|---|---:|---:|---|
| 13" | 2064 × 2752; 2048 × 2732 | 2752 × 2064; 2732 × 2048 | **Обязателен, если приложение запускается на iPad** |
| 12,9" | 2048 × 2732 | 2732 × 2048 | При отсутствии используется масштабированный 13" |
| 11" | 1488 × 2266; 1668 × 2420; 1668 × 2388; 1640 × 2360 | 2266 × 1488; 2420 × 1668; 2388 × 1668; 2360 × 1640 | При отсутствии используется масштабированный 13" |
| 10,5" | 1668 × 2224 | 2224 × 1668 | При отсутствии используется масштабированный 12,9" |
| 9,7" | 1536 × 2008 или 768 × 1004 без status bar; 1536 × 2048 или 768 × 1024 со status bar | 2048 × 1496 или 1024 × 748 без status bar; 2048 × 1536 или 1024 × 768 со status bar | При отсутствии используется масштабированный 10,5" |

Источник: [Apple — Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/).

## App Preview: видео

App Preview необязателен. Можно предоставить до **3 роликов на каждый поддерживаемый размер устройства и язык**. На iPhone/iPad допустимы portrait и landscape; ролики всегда стоят перед скриншотами, даже если в App Store Connect их переставить.

Технические параметры:

- длительность: **15–30 секунд**;
- максимальный размер: **500 MB**;
- частота кадров: до **30 fps**, progressive;
- H.264: целевой bitrate 10–12 Mbps, до High Profile Level 4.0;
- ProRes 422 HQ: VBR примерно до 220 Mbps;
- контейнеры: H.264 — `.mov`, `.m4v`, `.mp4`; ProRes 422 HQ — `.mov`;
- аудио: stereo, 44,1 или 48 kHz; для H.264 — AAC 256 kbps, для ProRes — PCM или AAC 256 kbps;
- poster frame по умолчанию берётся на 5-й секунде, но его можно выбрать вручную;
- обработка после загрузки может занять до 24 часов.

Источник: [Apple — App preview specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/app-preview-specifications/), [Upload app previews and screenshots](https://developer.apple.com/help/app-store-connect/manage-app-information/upload-app-previews-and-screenshots).

### Допустимые разрешения App Preview для iPhone

| Семейство дисплея | Portrait, px | Landscape, px | Примечание |
|---|---:|---:|---|
| 6,9" | 886 × 1920 | 1920 × 886 | Актуальный главный набор |
| 6,5" | 886 × 1920 | 1920 × 886 | При отсутствии используется масштабированный 6,9" |
| 6,3" | 886 × 1920 | 1920 × 886 | При отсутствии используется масштабированный 6,5" |
| 6,1" | 886 × 1920 | 1920 × 886 | При отсутствии используется масштабированный 6,5" |
| 5,5" | 1080 × 1920 | 1920 × 1080 | При отсутствии используется масштабированный 6,1" |
| 4,7" | 750 × 1334 | 1334 × 750 | При отсутствии используется масштабированный 5,5" |
| 4" | 1080 × 1920 | 1920 × 1080 | При отсутствии используется масштабированный 4,7" |
| 3,5" | — | — | App Preview не поддерживается |

### Допустимые разрешения App Preview для iPad

| Семейство дисплея | Portrait, px | Landscape, px | Примечание |
|---|---:|---:|---|
| 13" | 1200 × 1600 | 1600 × 1200 | Главный набор |
| 12,9" | 1200 × 1600; 900 × 1200 | 1600 × 1200; 1200 × 900 | При отсутствии используется масштабированный 13" |
| 11" | 1200 × 1600 | 1600 × 1200 | При отсутствии используется масштабированный 13" |
| 10,5" | 1200 × 1600 | 1600 × 1200 | При отсутствии используется масштабированный 12,9" |
| 9,7" | 900 × 1200 | 1200 × 900 | При отсутствии используется масштабированный 10,5" |

Источник обеих таблиц: [Apple — App preview specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/app-preview-specifications/).

## Что разрешено и что нельзя показывать

### Скриншоты

Apple требует, чтобы скриншоты:

- показывали **приложение в использовании**, а не только key art, экран входа или splash screen;
- точно отражали актуальный основной опыт и доступные функции;
- могли содержать текстовые/графические оверлеи, например подсказку касания или Apple Pencil;
- ясно отмечали, если показанная функция, предмет, уровень или подписка требует дополнительной покупки;
- использовали вымышленные данные аккаунта вместо данных реального человека;
- содержали только материалы, на которые у разработчика есть права;
- были пригодны для аудитории **4+**, даже если возрастной рейтинг приложения выше;
- не содержали названия, значки или изображения других мобильных платформ и альтернативных магазинов, если они не относятся к одобренной функциональности приложения.

Metadata нельзя использовать для вводящих в заблуждение или непроверяемых обещаний. Apple отдельно рекомендует не помещать в ассеты конкретные цены/скидки, URL, знак copyright, неподтверждённые награды, а также признания Apple вроде App of the Day, Editor’s Choice и Apple Design Award. Общие accolades и CTA не должны занимать весь скриншот.

Источники: [App Review Guidelines, 2.3.1–2.3.10](https://developer.apple.com/app-store/review/guidelines/#accurate-metadata), [App Store asset best practices](https://developer.apple.com/app-store/asset-best-practices/).

### App Preview

- Допускается только видеозахват самого приложения; нельзя снимать человека/руки, взаимодействующие с устройством.
- Можно добавлять narration, текст, touch hotspots и простые переходы, если они не создают впечатление несуществующей функции.
- Видео должно оставаться понятным без звука: автопроигрывание обычно начинается muted.
- Если показанная возможность требует покупки, подписки или входа, это нужно раскрыть в кадре либо на end frame.
- Не следует указывать конкретные цены, даты и сезонные формулировки, которые быстро устаревают.
- Нужны права на музыку, кино, бренды, персонажей и любой другой защищённый контент во всех территориях показа.
- Poster frame должен быть самостоятельным, понятным и визуально сильным изображением.

Источники: [Show more with app previews](https://developer.apple.com/app-store/app-previews/), [App Review Guidelines, 2.3.4](https://developer.apple.com/app-store/review/guidelines/#accurate-metadata), [App Store asset best practices](https://developer.apple.com/app-store/asset-best-practices/).

## Текст, композиция и порядок серии

Официальные рекомендации Apple:

- первые 1–3 изображения могут попасть в поиск, если нет App Preview, поэтому они должны сразу объяснять суть приложения;
- начать с сильнейших функций/выгод и выстроить кадры в связную историю реального использования;
- каждому следующему кадру отдать одну ключевую функцию или пользу;
- использовать сильную композицию и один ясный фокус;
- текст делать короткой фразой, которая **добавляет смысл**, а не пересказывает изображение;
- держать текст и фокусный объект в safe area ближе к центру: App Store может кадрировать ассет на разных устройствах и в разных ориентациях;
- проверить читаемость в Preview tool App Store Connect;
- при наличии Dark Mode рассмотреть хотя бы один кадр с ним.

Источники: [Creating Your Product Page](https://developer.apple.com/app-store/product-page/), [App Store asset best practices](https://developer.apple.com/app-store/asset-best-practices/).

Практическая серия для видеосервиса (это рекомендация для шаблона, а не формальное требование Apple):

1. **Суть продукта:** главный экран с самым сильным обещанием, например «Смотрите то, что любите».
2. **Каталог/поиск:** как быстро найти фильм, шоу, автора или прямой эфир.
3. **Просмотр:** реальный player UI и ключевой сценарий воспроизведения.
4. **Персонализация:** подписки, рекомендации, история или «продолжить просмотр».
5. **Полезная функция:** PiP, загрузки, трансляция на экран или уведомления — только если функция действительно есть.
6. **iPad-сценарий:** нативный iPad UI в landscape, крупный player/каталог или многозадачность; не растянутый iPhone-интерфейс.
7. **Дополнительная ценность:** авторы, эфиры, детский режим, качество видео и т.п. — в зависимости от конкретного концепта.

Для автоматической генерации разумно делать 6–8 кадров, а не заполнять все 10: три первых отвечают на «что это / зачем / как выглядит», остальные раскрывают отличия. Для видео-контента генератор должен использовать только лицензированные либо явно вымышленные обложки, лица, названия и аккаунты.

## Локализация

- Скриншоты можно локализовать. При добавлении языка они по умолчанию наследуются из primary language.
- Если локализация не совпала с языком пользователя, App Store выбирает следующую наиболее релевантную; в остальных случаях используется primary language.
- Apple рекомендует локализовать текст в изображениях и видео для каждого поддерживаемого рынка/языка.
- App Preview показывается во всех storefronts, если не загружен отдельный ролик для конкретной локализации; при отсутствии нужного языка используется следующий подходящий.
- Чтобы полностью контролировать язык App Preview, нужен отдельный ролик для каждой поддерживаемой locale.
- При смене primary language Apple требует уже одобренные скриншоты на новом языке для всех платформ; их размеры должны совпадать с текущим primary language.

Источники: [Localize app information](https://developer.apple.com/help/app-store-connect/manage-app-information/localize-app-information), [Creating Your Product Page — Localization](https://developer.apple.com/app-store/product-page/#localization), [Upload app previews and screenshots](https://developer.apple.com/help/app-store-connect/manage-app-information/upload-app-previews-and-screenshots).

## Мокап iPhone/iPad

**Мокап устройства не является обязательным требованием App Store Connect.** Apple разрешает текстовые и графические оверлеи, а основной критерий — заметный, честный интерфейс работающего приложения. Поэтому шаблон должен уметь работать в двух режимах:

1. **UI-first без девайс-фрейма** — самый универсальный и безопасный вариант: интерфейс занимает большую часть кадра, вокруг него фон и короткий заголовок.
2. **С девайс-фреймом** — композиционный вариант, когда рамка помогает объяснить контекст. Если используется узнаваемое Apple-устройство, безопаснее брать официальный Apple Product Bezel, актуальное поддерживаемое поколение, и не модифицировать его.

В официальных Marketing Resources Apple требует для предоставленных ею product bezels:

- использовать изображение «как есть»;
- не обрезать, не наклонять и не перекрывать устройство;
- не добавлять к самому product image отражения, тени, highlights и элементы, выходящие из экрана;
- размещать промо-текст рядом, а не поверх product image;
- не смешивать Apple device image с конкурирующими устройствами;
- показывать реальный экран приложения, актуальную версию ОС и вымышленные персональные данные.

Эти правила относятся к Apple-provided artwork в маркетинговых материалах. Они не означают, что App Store screenshot обязан содержать bezel; наоборот, для переносимого генератора режим без bezel должен оставаться базовым. Не следует самостоятельно рисовать «почти iPhone» с уникальными деталями Apple: Apple отдельно запрещает неавторизованные 3D-рендеры и симуляции своих продуктов в маркетинговых материалах.

Источник: [Apple — Marketing Resources and Identity Guidelines, Apple Product Images](https://developer.apple.com/app-store/marketing/guidelines/#apple-product-images).

## Рекомендуемая структура переносимого шаблона

Это проектное следствие требований, а не правило Apple:

- единый **scene manifest**: locale, platform, orientation, headline, optional subhead, screenshot source, crop/focal point, theme, device-frame mode;
- master canvas `iphone-6.9-portrait` 1320 × 2868 и `ipad-13-landscape` 2752 × 2064; генератор также делает отдельный корректный re-layout для 6.5″ 1284 × 2778, 6.3″ 1206 × 2622 и 6.1″ 1170 × 2532, а не слепо растягивает готовый JPEG;
- safe-area layout с центральным фокусом, автоматически проверяемыми margins и минимальным размером текста;
- device frame как отключаемый слой, отдельно от UI capture;
- контентные проверки: отсутствие alpha, точный размер, допустимый формат, 1–10 файлов, локализованный текст, отсутствие URL/цен/чужих платформ, disclosure платных функций;
- одинаковая визуальная система серии — палитра, типографика, радиусы, фон и тон — но один смысловой акцент на кадр;
- отдельные export-папки по `locale/platform/display-size/orientation`, чтобы набор напрямую маппился на App Store Connect API.

## Отдельная новинка App Store 2026

Apple теперь описывает дополнительные **creative assets** для product page header и search results в iOS 27/iPadOS 27 и предоставляет для них Figma/Photoshop/Pixelmator/Sketch templates. Это отдельный класс ассетов и **не замена обязательным скриншотам**. Если генератор задуман как долгоживущий, их лучше предусмотреть отдельным последующим export target, не смешивая со screenshot pipeline.

Источник: [App Store asset best practices and resources](https://developer.apple.com/app-store/asset-best-practices/).

## Официальные источники

- [Screenshot specifications — App Store Connect Help](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)
- [App preview specifications — App Store Connect Help](https://developer.apple.com/help/app-store-connect/reference/app-information/app-preview-specifications/)
- [Upload app previews and screenshots — App Store Connect Help](https://developer.apple.com/help/app-store-connect/manage-app-information/upload-app-previews-and-screenshots)
- [Platform version information — App Store Connect Help](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information/)
- [Localize app information — App Store Connect Help](https://developer.apple.com/help/app-store-connect/manage-app-information/localize-app-information)
- [App Review Guidelines, section 2.3 Accurate Metadata](https://developer.apple.com/app-store/review/guidelines/#accurate-metadata)
- [Creating Your Product Page](https://developer.apple.com/app-store/product-page/)
- [App Store asset best practices and resources](https://developer.apple.com/app-store/asset-best-practices/)
- [Show more with app previews](https://developer.apple.com/app-store/app-previews/)
- [Marketing Resources and Identity Guidelines](https://developer.apple.com/app-store/marketing/guidelines/)
