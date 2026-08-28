import Foundation

/// Полный capability pack `vkontakte`. Ключ существует здесь только если у
/// него есть достижимое продуктовое действие в «Полке».
enum Access: String, CaseIterable {
    case camera, photos, mic, location, push, commnotif, remotenotif, fetch, bgtask
    case appgroups, keychain, autofill, wifiinfo, contacts, tracking, faceid, speech
    case audio, voip, calendar, associateddomains, hotspot

    var isPrompt: Bool {
        switch self {
        case .camera, .photos, .mic, .location, .push, .contacts, .tracking, .faceid, .speech, .calendar: true
        default: false
        }
    }

    var plist: String {
        switch self {
        case .camera: "NSCameraUsageDescription"
        case .photos: "NSPhotoLibraryUsageDescription"
        case .mic: "NSMicrophoneUsageDescription"
        case .location: "NSLocationWhenInUseUsageDescription"
        case .push: "aps-environment"
        case .commnotif: "com.apple.developer.usernotifications.communication"
        case .remotenotif: "UIBackgroundModes: remote-notification"
        case .fetch: "UIBackgroundModes: fetch"
        case .bgtask: "BGTaskSchedulerPermittedIdentifiers"
        case .appgroups: "com.apple.security.application-groups"
        case .keychain: "keychain-access-groups"
        case .autofill: "com.apple.developer.authentication-services.autofill-credential-provider"
        case .wifiinfo: "com.apple.developer.networking.wifi-info"
        case .contacts: "NSContactsUsageDescription"
        case .tracking: "NSUserTrackingUsageDescription"
        case .faceid: "NSFaceIDUsageDescription"
        case .speech: "NSSpeechRecognitionUsageDescription"
        case .audio: "UIBackgroundModes: audio"
        case .voip: "UIBackgroundModes: voip"
        case .calendar: "NSCalendarsFullAccessUsageDescription"
        case .associateddomains: "com.apple.developer.associated-domains"
        case .hotspot: "com.apple.developer.networking.HotspotConfiguration"
        }
    }

    var fallback: String {
        switch self {
        case .camera: "Можно выбрать фото или оставить цветную обложку."
        case .photos: "Камера и цветная обложка остаются доступны."
        case .mic, .speech: "Сообщение владельцу можно написать текстом."
        case .location: "Место передачи можно написать вручную."
        case .push, .commnotif, .remotenotif: "Ответы и сроки остаются во вкладке «Запросы»."
        case .fetch, .bgtask: "Полка обновится при следующем открытии."
        case .appgroups, .keychain: "Быстрое добавление откроет основное приложение."
        case .autofill: "Вход можно выполнить почтой и кодом."
        case .wifiinfo, .hotspot: "Сеть места можно выбрать вручную в Настройках."
        case .contacts: "Друга можно найти по имени или пригласить ссылкой."
        case .tracking: "Подборки останутся общими, без персонализации."
        case .faceid: "Код передачи останется под системным код-паролем."
        case .audio: "Голосовое остановится при блокировке экрана."
        case .voip: "Остаются сообщения внутри передачи."
        case .calendar: "Срок остаётся в карточке передачи."
        case .associateddomains: "Ссылка откроет приложение на главной полке."
        }
    }

    var title: String {
        switch self {
        case .camera: "Камера"
        case .photos: "Фото"
        case .mic: "Голосовое"
        case .location: "Место передачи"
        case .push: "Ответы"
        case .commnotif: "Аватар в уведомлении"
        case .remotenotif: "Тихое обновление"
        case .fetch: "Свежая полка к запуску"
        case .bgtask: "Сроки в фоне"
        case .appgroups: "Быстрое добавление"
        case .keychain: "Общий защищённый вход"
        case .autofill: "Автозаполнение"
        case .wifiinfo: "Сеть места"
        case .contacts: "Друзья из контактов"
        case .tracking: "Персональные подборки"
        case .faceid: "Защита кода"
        case .speech: "Расшифровка"
        case .audio: "Фоновое прослушивание"
        case .voip: "Звонок владельцу"
        case .calendar: "Срок возврата"
        case .associateddomains: "Ссылка на вещь"
        case .hotspot: "Гостевой Wi‑Fi"
        }
    }

    var status: String { title }
}
