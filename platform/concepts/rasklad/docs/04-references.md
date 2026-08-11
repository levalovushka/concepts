# Расклад — референсы и обоснования

Ссылки на нормы, по которым сверялся концепт, и продуктовые ориентиры. Не вдохновение — проверяемые основания.

---

## Apple: гайдлайны, под которые нельзя попасть

| Документ | Что оттуда взято |
|---|---|
| [App Review Guidelines 2.5.4](https://developer.apple.com/app-store/review/guidelines/#software-requirements) | Фоновый режим `audio` только при реальном воспроизведении. Ревьюер тестирует руками: гасит экран и слушает |
| [App Review Guidelines 4.2](https://developer.apple.com/app-store/review/guidelines/#minimum-functionality) | Приложение-компаньон к бумажной колоде обязано иметь самостоятельную ценность: плеер с фоновым звуком, скан, дневник, прогресс |
| [App Review Guidelines 4.3](https://developer.apple.com/app-store/review/guidelines/#spam) | Категория гаданий перенасыщена. Отсюда запрет на предсказания и толкования в текстах — концепт живёт в Health & Fitness |
| [App Review Guidelines 5.1.1](https://developer.apple.com/app-store/review/guidelines/#data-collection-and-storage) | Каждый доступ — с внятной строкой назначения и достижимой фичей; пустых доступов нет |
| [Age Rating](https://developer.apple.com/help/app-store-connect/reference/age-ratings) | 4+ достигается тем, что в приложении нет ни гадания, ни «зрелых тем»: вопросы бытовые, без темы смерти и болезней |

## Apple: технические основания фич

| Фича | API | Почему именно так |
|---|---|---|
| Звук при погашенном экране | [`AVAudioSession`](https://developer.apple.com/documentation/avfaudio/avaudiosession) категория `.playback` + `UIBackgroundModes: audio` | Без категории `.playback` звук глохнет на блокировке |
| Управление с локскрина | [`MPNowPlayingInfoCenter`](https://developer.apple.com/documentation/mediaplayer/mpnowplayinginfocenter), [`MPRemoteCommandCenter`](https://developer.apple.com/documentation/mediaplayer/mpremotecommandcenter) | Заполненный Now Playing — то, что ревьюер видит первым делом при проверке 2.5.4 |
| Скан карты | [`DataScannerViewController`](https://developer.apple.com/documentation/visionkit/datascannerviewcontroller) | Чтение текста и кодов на устройстве. Читается **номер и метка**, а не рисунок: детерминированно и проверяемо |
| Выбор фото | [`PHPickerViewController`](https://developer.apple.com/documentation/photokit/phpickerviewcontroller) | Отдаёт выбранный снимок без доступа ко всей медиатеке — минимальное право под задачу |
| Пуш | [`UNUserNotificationCenter`](https://developer.apple.com/documentation/usernotifications) + `aps-environment` | Регистрация в APNs через SDK провайдера; отправка бродкаста из дашборда |
| Хранение | [CoreData](https://developer.apple.com/documentation/coredata), [Keychain](https://developer.apple.com/documentation/security/keychain_services) | Записи и прогресс на устройстве, токен входа в Keychain |

## HIG

| Раздел | Что взято |
|---|---|
| [Status bars](https://developer.apple.com/design/human-interface-guidelines/status-bars) | Светлый фон → чёрные чернила (`.dark-ink`); статус-бар не прячем |
| [Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars) | Три вкладки, только навигация, вкладки не отключаются |
| [Now Playing / Audio](https://developer.apple.com/design/human-interface-guidelines/playing-audio) | Экран Now Playing обязателен, транспорт — пауза и ±15 секунд |
| [Accessing private data](https://developer.apple.com/design/human-interface-guidelines/accessing-private-data) | Промпт в момент действия, внятная причина, работающий отказ |
| [Typography](https://developer.apple.com/design/human-interface-guidelines/typography) | Системная шкала, минимум 11 pt, данные — tabular-nums |

---

## Продуктовые ориентиры

| Что | Чему учит |
|---|---|
| Бумажные колоды метафорических ассоциативных карт (OH-cards и аналоги) | Карта работает как вопрос, а не как ответ. Отсюда весь тон концепта |
| Приложения-компаньоны к настольным играм (скан компонента → правило, трек) | Модель «бумага на столе + телефон рядом»: скан по напечатанному коду, а не по картинке |
| Приложения для практик с закрытыми глазами | Единственный сценарий, где фоновое аудио — не удобство, а условие. Отсюда якорь набора |
| Практика письменной рефлексии («утренние страницы», дневники терапии) | Запись после практики важнее самой записи — поэтому дневник встроен в поток, а не спрятан |

## Проверка на подмену (фаза 2)

| Атака | Ответ |
|---|---|
| Подмена: убрать фоновое аудио | Останется приложение, которое требует смотреть в экран с закрытыми глазами. Продукта не остаётся — значит якорь и есть продукт |
| «И что?» | Браузер не продолжит звучать при погашенном экране, не прочитает номер карты и не сложит серию вечеров |
| Именно здесь | Практика по определению идёт с закрытыми глазами: экран гаснет не «иногда», а всегда |
| Покажи жест | «Сегодня» → «Сканировать карту» → карта → «Слушать» → «Погасить экран». Четыре тапа до якоря, два — до камеры |
| Кто и когда | Человек с купленной колодой, 22:30, свет выключен, телефон на столе рядом с картой |
| Почему не системное | Ни «Музыка», ни «Подкасты» не знают, какая карта выпала, не убирают перемотку тишины и не пишут дневник |
| Второй запуск | Другая карта — другой вопрос; серия вечеров и прогресс по колоде дают повод вернуться |
| Слабое звено | `aps-environment`: бродкаст о новых паках — фича настоящая, но редкая. Названо честно как условный доступ |
| Клон | От целевого приложения (музыкальный стриминг) ниша далека: контент фиксированный, плейлистов нет, вход в контент — через физическую карту |
