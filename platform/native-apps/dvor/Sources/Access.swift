import Foundation
import SwiftUI
import Observation
import AVFoundation
import Photos
import CoreLocation
import Contacts
import EventKit
import UserNotifications
import LocalAuthentication
import AppTrackingTransparency

/// Ключи доступов «Двора». Набор — vkontakte, 20 ключей; каждый стоит за фичей.
enum Access: String, CaseIterable {
    case location, wifiinfo, camera, photos
    case push, remotenotif, fetch, bgtask
    case appgroups, keychain, autofill, contacts
    case calendar, faceid, hotspot, tracking
    case mic
    case speech
    case commnotif
    case voip

    /// Системный промпт поднимает только часть ключей; остальное — entitlement.
    var isPrompt: Bool {
        switch self {
        case .location, .camera, .photos, .push, .contacts, .calendar, .faceid, .tracking, .mic, .speech:
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
        case .push: "aps-environment"
        case .remotenotif: "UIBackgroundModes: remote-notification"
        case .fetch: "UIBackgroundModes: fetch"
        case .bgtask: "BGTaskSchedulerPermittedIdentifiers"
        case .appgroups: "com.apple.security.application-groups"
        case .keychain: "keychain-access-groups"
        case .autofill: "com.apple.developer.authentication-services.autofill-credential-provider"
        case .contacts: "NSContactsUsageDescription"
        case .calendar: "NSCalendarsFullAccessUsageDescription"
        case .faceid: "NSFaceIDUsageDescription"
        case .hotspot: "com.apple.developer.networking.HotspotConfiguration"
        case .tracking: "NSUserTrackingUsageDescription"
        case .mic: "NSMicrophoneUsageDescription"
        case .speech: "NSSpeechRecognitionUsageDescription"
        case .commnotif: "com.apple.developer.usernotifications.communication"
        case .voip: "UIBackgroundModes: voip"
        }
    }

    /// Что остаётся работать при отказе. Написано на самом экране — принцип 5 вижена.
    var fallback: String {
        switch self {
        case .location: "Геопозиция выключена — подтвердите адрес вручную, заявку смотрит старший по подъезду"
        case .camera: "Без камеры остаётся фото из медиатеки и ввод имени сети руками"
        case .photos: "Без медиатеки в хронике остаются только кадры, снятые в приложении"
        case .push: "Ответы видны при открытии, тема помечается точкой в ленте"
        case .contacts: "Без контактов соседей можно найти по номеру квартиры"
        case .calendar: "Без календаря событие останется только в приложении"
        case .faceid: "Без Face ID приложение открывается без замка"
        case .tracking: "Реклама останется, но перестанет быть местной"
        case .mic: "Заявку можно заполнить текстом"
        case .speech: "Голосовой черновик можно перепечатать с клавиатуры"
        case .commnotif: "Статус заявки придёт обычным уведомлением без имени ответственного"
        case .voip: "Вместо вызова домофона придёт обычное уведомление с кадром посетителя"
        default: "Раздел работает, но без этой возможности"
        }
    }

    var status: String {
        switch self {
        case .location: "Геопозиция"
        case .wifiinfo: "Имя сети"
        case .mic: "Микрофон"
        case .speech: "Распознавание речи"
        case .commnotif: "Ответ диспетчера"
        case .voip: "Видеодомофон"
        default: rawValue
        }
    }
}
