## Screen, state, and action matrix

| Surface | Product task | Presentation | States | Actions |
|---|---|---|---|---|
| phone | Первый экран приложения | root | default<br>loading<br>error<br>offline | Открыть «Код из письма» → navigate:code |
| code | OTP · автоподстановка | push | default<br>loading<br>error<br>offline | Открыть «Неверный код» → navigate:codefail |
| codefail | Состояние ошибки OTP | push | default<br>loading<br>error<br>offline | Продолжить → mutate:codefail.completed |
| join | Location · точки рядом | push | default<br>loading<br>error<br>offline | Открыть «Код точки» → navigate:manual |
| manual | Fallback отказа в геопозиции | push | default<br>loading<br>error<br>offline | Продолжить → mutate:manual.completed |
| shifts | График недели · Photo Library | tab | default<br>loading<br>error<br>offline | Открыть «График из скриншотов» → navigate:import |
| import | Photo Library · Vision OCR | push | default<br>loading<br>error<br>offline | Продолжить → mutate:import.completed |
| shift | Push · Calendar · Remote notification | push | default<br>loading<br>error<br>offline | Открыть «Отметка на смене» → navigate:checkin |
| checkin | Wi-Fi Info · табель | sheet | default<br>loading<br>error<br>offline | Открыть «Сеть точки» → navigate:netqr |
| netqr | Hotspot · Camera | push | default<br>loading<br>error<br>offline | Открыть «Сканер QR» → navigate:scan |
| scan | DataScanner | push | default<br>loading<br>error<br>offline | Продолжить → mutate:scan.completed |
| handover | Camera · акт передачи | push | default<br>loading<br>error<br>offline | Открыть «Камера» → navigate:shoot |
| shoot | AVFoundation | push | default<br>loading<br>error<br>offline | Продолжить → mutate:shoot.completed |
| brief | Audio · Microphone · Speech | push | default<br>loading<br>error<br>offline | Открыть «Запись брифинга» → navigate:record |
| record | Microphone · Speech | sheet | default<br>loading<br>error<br>offline | Продолжить → mutate:record.completed |
| player | Now Playing · фоновое аудио | push | default<br>loading<br>error<br>offline | Продолжить → mutate:player.completed |
| swaps | Открытые смены · Location | tab | default<br>loading<br>error<br>offline | Открыть «Открытая смена» → navigate:swap |
| swap | Отклик на подмену | push | default<br>loading<br>error<br>offline | Продолжить → mutate:swap.completed |
| people | С кем работали · Contacts | tab | default<br>loading<br>error<br>offline | Открыть «Знакомые в сети» → navigate:mates |
| mates | Contacts · локальная сверка | push | default<br>loading<br>error<br>offline | Продолжить → mutate:mates.completed |
| person | Смены вместе · VoIP | push | default<br>loading<br>error<br>offline | Открыть «Звонок по смене» → navigate:call |
| call | CallKit · VoIP | push | default<br>loading<br>error<br>offline | Продолжить → mutate:call.completed |
| chat | Communication notification | push | default<br>loading<br>error<br>offline | Открыть «Экран блокировки» → navigate:lockscreen |
| lockscreen | Уведомление с аватаром | push | default<br>loading<br>error<br>offline | Продолжить → mutate:lockscreen.completed |
| menu | Разделы · Face ID | tab | default<br>loading<br>error<br>offline | Открыть «Замок Face ID» → navigate:lock |
| lock | LocalAuthentication | push | default<br>loading<br>error<br>offline | Продолжить → mutate:lock.completed |
| money | Часы и ставка за период | push | default<br>loading<br>error<br>offline | Продолжить → mutate:money.completed |
| passwords | AutoFill Credential Provider | push | default<br>loading<br>error<br>offline | Открыть «Автозаполнение в Safari» → navigate:fill |
| fill | ASCredentialProvider | push | default<br>loading<br>error<br>offline | Продолжить → mutate:fill.completed |
| settings | Фон · виджет · реклама | push | default<br>loading<br>error<br>offline | Открыть «Обновление в фоне» → navigate:background |
| background | Background fetch · BGTaskScheduler | push | default<br>loading<br>error<br>offline | Продолжить → mutate:background.completed |
| widget | App Groups · Keychain | push | default<br>loading<br>error<br>offline | Продолжить → mutate:widget.completed |
