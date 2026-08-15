# Пересменка — референсы и заземление

## Предметная область

| Что | Как устроено в жизни | Что из этого в концепте |
|---|---|---|
| График смен | Печатается на неделю-две, висит в подсобке, дублируется картинкой в рабочем чате. Правится вручную маркером | `shifts` — график двух точек; `import` — разбор присланного скриншота |
| Обмен сменами | Переписка в общем чате: «пятница, кто возьмёт?». Договорённость держится на слове | `swaps` — открытые смены со ставкой и дорогой; `swap` — отклик; `chat` — переписка |
| Табель | Тетрадь у старшего смены либо табельный портал сети. Спор о времени ухода решается памятью | `checkin` — отметка по сети точки; лента отметок; спорные строки в `shifts` и `money` |
| Брифинг смены | Голосовое в чате или записка на кассе: что кончилось, что по акции | `brief` — запись с расшифровкой; `player` — прослушивание с погашенным экраном |
| Пересменка | Устная передача плюс фотографии витрины в чат | `handover` — акт: кадры и шесть пунктов |
| Доступы к сервисам точки | Закреплённое сообщение в чате с логинами и паролями | `passwords` — записи в Keychain, `fill` — системное автозаполнение |
| Ставка и заработок | Считается в уме или в заметках; сверяется с расчётным листом раз в месяц | `money` — часы × ставка, под Face ID, с прямой оговоркой «не расчётный лист» |

Числа в прототипе взяты в реальных порядках: смена 8–9 часов, ночная с коэффициентом ×1,4, ставка 230–300 ₽/ч, перерыв 28 минут не оплачивается, спор по уходу — 44 минуты и 190 ₽.

## Технические референсы

| Фича | API / SDK | Где в Apple Docs (по названию) |
|---|---|---|
| Вход по номеру | VK ID SDK либо Firebase Phone Auth, токен в Keychain общей группы | `ASAuthorization`-независимый флоу провайдера |
| Заведения рядом, время в пути | `MKLocalSearch`, `MKDirections.ETA` | MapKit |
| Имя текущей сети | `CNCopyCurrentNetworkInfo` + entitlement `com.apple.developer.networking.wifi-info` | Network Extension: Wi-Fi Information |
| Подключение к сети по QR | `NEHotspotConfigurationManager`, параметры из QR | Network Extension: Hotspot Configuration |
| Сканер QR | `DataScannerViewController` (Vision) | VisionKit |
| Съёмка акта | `AVCaptureSession` | AVFoundation |
| Разбор графика со скриншота | `PHAsset` с `PHAssetMediaSubtype.photoScreenshot` за 14 дней + `VNRecognizeTextRequest` | Photos, Vision |
| Голосовой брифинг | `AVAudioRecorder`, файл в Firebase Storage | AVFoundation |
| Расшифровка | `SFSpeechRecognizer` c `requiresOnDeviceRecognition = true` | Speech |
| Фоновое воспроизведение | `AVAudioSession` категории `playback`, `MPNowPlayingInfoCenter`, `MPRemoteCommandCenter` | AVFAudio, MediaPlayer |
| Звонок без раскрытия номера | PushKit + CallKit, сигнализация через LiveKit / Agora | PushKit, CallKit |
| Уведомления | Firebase Cloud Messaging; Notification Service Extension + `INSendMessageIntent` для аватара и Focus | UserNotifications, Intents |
| Фоновое обновление | `BGAppRefreshTask`, идентификатор `app.peresmenka.refresh` в `BGTaskSchedulerPermittedIdentifiers` | BackgroundTasks |
| Виджет и Share Extension | App Group `group.app.peresmenka`, снапшот в JSON | WidgetKit |
| Логины точки | `ASCredentialProviderViewController`, записи в Keychain общей группы | AuthenticationServices |
| Смены в календаре | `EventKit`, полный доступ (события правятся и удаляются при переносе) | EventKit |
| Замок раздела | `LocalAuthentication`, политика `deviceOwnerAuthentication` | LocalAuthentication |
| Объявления | AppTrackingTransparency + рекламный SDK | AdSupport, AppTrackingTransparency |

## Визуальные референсы

- **Системный iOS** — единственный источник хрома: `kernel/ios-chrome.md` и сторибук `components.html`. Своих аналогов системных контролов в экранах нет.
- **Иконки** — спрайт Lucide (`kernel/icons.svg`, `node scripts/gen-icons.mjs`). Для этого концепта в набор добавлены: `coffee`, `utensils`, `store`, `arrow-left-right`, `alarm-clock`, `sunrise`, `moon`, `banknote`, `log-in`, `log-out`, `user-check`, `circle-check`.
- **Полоса суток** — приём из транспортных и рабочих расписаний: не диаграмма, а линейка, на которой видно, где в сутках лежит смена.

## Чего в референсах нет намеренно

- Скриншотов чужих приложений и их layout'ов: концепт строится из системного хрома, а не из перерисованного конкурента.
- Стоковых фотографий: вместо визуала — плейсхолдер `.ph`.
- Универсальных ссылок и превью по Open Graph: диплинков в концептах не делаем вообще.
