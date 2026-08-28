import Foundation
import SwiftUI
import Observation
import AVFoundation
import Photos
import CoreLocation
import Contacts
import EventKit
import Speech
import UserNotifications
import LocalAuthentication
import AppTrackingTransparency

/// Ключи доступов «Двора». Набор — vkontakte, 20 ключей; каждый стоит за фичей.
enum Access: String, CaseIterable {
    case location, wifiinfo, camera, photos, mic, speech
    case push, commnotif, remotenotif, fetch, bgtask
    case appgroups, keychain, autofill, voip, contacts
    case calendar, faceid, hotspot, tracking

    /// Системный промпт поднимает только часть ключей; остальное — entitlement.
    var isPrompt: Bool {
        switch self {
        case .location, .camera, .photos, .mic, .speech, .push, .contacts, .calendar, .faceid, .tracking:
            return true
        default:
            return false
        }
    }

    var plist: String {
        switch self {
        case .location: "NSLocationWhenInUseUsageDescription"
        case .wifiinfo: "com.apple.developer.networking.wifi-info"
        case .camera: "NSCameraUsageDescription"
        case .photos: "NSPhotoLibraryUsageDescription"
        case .mic: "NSMicrophoneUsageDescription"
        case .speech: "NSSpeechRecognitionUsageDescription"
        case .push: "aps-environment"
        case .commnotif: "com.apple.developer.usernotifications.communication"
        case .remotenotif: "UIBackgroundModes: remote-notification"
        case .fetch: "UIBackgroundModes: fetch"
        case .bgtask: "BGTaskSchedulerPermittedIdentifiers"
        case .appgroups: "com.apple.security.application-groups"
        case .keychain: "keychain-access-groups"
        case .autofill: "com.apple.developer.authentication-services.autofill-credential-provider"
        case .voip: "UIBackgroundModes: voip"
        case .contacts: "NSContactsUsageDescription"
        case .calendar: "NSCalendarsFullAccessUsageDescription"
        case .faceid: "NSFaceIDUsageDescription"
        case .hotspot: "com.apple.developer.networking.HotspotConfiguration"
        case .tracking: "NSUserTrackingUsageDescription"
        }
    }

    /// Что остаётся работать при отказе. Написано на самом экране — принцип 5 вижена.
    var fallback: String {
        switch self {
        case .location: "Геопозиция выключена — подтвердите адрес вручную, заявку смотрит старший по подъезду"
        case .camera: "Без камеры остаётся фото из медиатеки и ввод имени сети руками"
        case .photos: "Без медиатеки в хронике остаются только кадры, снятые в приложении"
        case .mic: "Без микрофона остаётся текстовое сообщение"
        case .speech: "Голосовое отправится без расшифровки"
        case .push: "Ответы видны при открытии, тема помечается точкой в ленте"
        case .contacts: "Без контактов соседей можно найти по номеру квартиры"
        case .calendar: "Без календаря событие останется только в приложении"
        case .faceid: "Без Face ID приложение открывается без замка"
        case .tracking: "Реклама останется, но перестанет быть местной"
        default: "Раздел работает, но без этой возможности"
        }
    }

    var status: String {
        switch self {
        case .location: "Геопозиция"
        case .wifiinfo: "Имя сети"
        default: rawValue
        }
    }
}
