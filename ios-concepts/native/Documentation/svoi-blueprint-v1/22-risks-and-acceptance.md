# Risks, assumptions and final acceptance

## Risks

- Избыточный акцент на сроках может сделать продукт назидательным; статус показывается нейтрально, просрочка не наказывается и не ранжируется ниже.
- Локальная симуляция может выглядеть искусственно; fixtures должны показывать разные стадии, авторов, интервалы и конкретные вклады.
- Предложения помощи могут быть расплывчатыми; форма требует одного конкретного действия или ресурса.
- Доказательство может раскрыть людей или точное место; перед публикацией показывается предпросмотр аудитории и возможность удалить метаданные.
- Системные интеграции способны размыть ядро; они остаются контекстными действиями внутри дела, диалога или настроек.
- Hotspot и чтение SSID зависят от entitlement и условий устройства; полностью исполнимый ручной путь обязателен.
- Локальный VoIP демонстрирует CallKit, но не обещает сетевую связь между устройствами.
- Продвижение может подорвать доверие к выдаче; измерение не меняет ранжирование и выключено по умолчанию.

## Assumptions

- Целевая платформа — актуальная версия iOS с SwiftUI и локальным persistent store.
- Сборка включает основное приложение, Widget Extension и Credential Provider Extension.
- Email-code аутентификация локальная: код генерируется детерминированно и показывается на тестовом экране без сети.
- Все социальные изменения воспроизводятся локальным fixture-движком и сохраняются между запусками.
- Иконки используют перечисленные SF Symbols, а визуальные токены VK-прототипа: accent #0077FF, background #FFFFFF, groupedBackground #F2F3F5, separator #E7E8EC, primary #000000, secondary #818C99, badge #FF3347.
- Существуют entitlements для App Group group.app.svoi.shared, keychain access group, communication notifications, background modes, CallKit, Hotspot Configuration и Associated Domains.
- Домен svoi.example в производственной сборке обслуживает корректный apple-app-site-association; тестовый router умеет воспроизвести тот же переход локально.
- В ленте нет фильтров или сегментов: разнообразие создают авторы и состояния дел, а не каталог разделов.
- Пять root tabs являются единственными корневыми точками; уведомления, настройки, доступы, сохранённые и приватные дела открываются push-навигацией.
- Каждая мутация идемпотентна по action transaction id, поэтому повторное нажатие не создаёт дубликаты.

## Handoff gate

- Build and XCUI receipts pass.
- Every declared action has one real control and observable result.
- Every capability performs a real platform operation and a product mutation.
- Documentation drift audit passes.
- Independent visual review has no axis below 8.5/10.
