# Quality evidence

## Покрытие

- 34 экрана после унификации входа и аккаунта
- 4 корневые вкладки
- 7 сквозных сценариев
- 22 доступа и системные возможности
- Стандартное и отказное состояние у каждого доступного действия

## Inventory visual review

| Экран | Состояния | Статус |
| --- | --- | --- |
| phone | default, error, loading | fixed |
| password | default, error, loading | reviewed |
| register | default, error, loading | reviewed |
| registerpassword | default, error, loading | reviewed |
| account | default, error, loading | reviewed |
| deleteaccount | default, error, loading | reviewed |
| home | default, denied, offline | fixed |
| task | default, denied, offline | fixed |
| capture | default, denied | fixed |
| result | default, success | fixed |
| library | default, denied | fixed |
| resources | default, offline | fixed |
| resource | default, offline | fixed |
| newresource | default, error, offline | fixed |
| scan | default, denied | fixed |
| wifi | default, denied | fixed |
| delivery | default, offline | fixed |
| decisions | default, offline | fixed |
| decision | default, offline | fixed |
| vote | default, success | fixed |
| proposal | default, denied, error | fixed |
| events | default, offline | fixed |
| event | default, denied | fixed |
| newevent | default, error, offline | fixed |
| profile | default, offline | fixed |
| settings | default, denied | fixed |
| lock | default, success | fixed |
| access | default, offline | fixed |
| widget | default | reviewed |
| share | default | reviewed |
| ads | default, denied | fixed |
| audio | default | reviewed |
| call | default | fixed |
| speech | default, denied | fixed |

## Cross-screen comparison

Navbar, root tab bar, 66 pt list row, 50 pt primary button, 20 pt icon and 18 pt chevron use one metric set. Card variants differ only by semantic role: list, object, map, system or dark media. All screen titles use 26/1.12/700; all section titles use 16/1.25/600; standard copy and metadata use the shared body and secondary tokens.

## Критические доказательства

`home → task → capture → result` показывает полный цикл результата. `resources → resource → wifi` доказывает общую инфраструктуру. `decisions → decision → vote` доказывает адресный голос. `events → event` доказывает локальное событие и календарь.

## Проверка

Источник истины — `concept.json`; карта IA и переходы генерируются из фактической разметки. Свежие screenshots и audit artifacts создаются после финальной сборки.
