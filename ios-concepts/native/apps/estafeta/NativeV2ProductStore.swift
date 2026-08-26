import SwiftUI

enum ProductRoute: String, CaseIterable, Identifiable {
    case relayFeed = "relay_feed"
    case turn = "turn"
    case chapterResult = "chapter_result"
    case discover = "discover"
    case create = "create"
    case messages = "messages"
    case services = "services"
    case profile = "profile"
    case activeRelays = "active_relays"
    case drafts = "drafts"
    case schedule = "schedule"
    case handoff = "handoff"
    case settings = "settings"
    var id: String { rawValue }
}

enum ProductAction: String, CaseIterable, Identifiable {
    case openRelay = "open_relay"
    case acceptTurn = "accept_turn"
    case captureChapter = "capture_chapter"
    case passTurn = "pass_turn"
    case openReply = "open_reply"
    case supportChapter = "support_chapter"
    case startRelay = "start_relay"
    case openProfile = "open_profile"
    case openActiveRelays = "open_active_relays"
    case openDrafts = "open_drafts"
    case openSchedule = "open_schedule"
    case openSettings = "open_settings"
    case capabilityPhotos = "capability_photos"
    case capabilityMic = "capability_mic"
    case capabilityLocation = "capability_location"
    case capabilityPush = "capability_push"
    case capabilityCommnotif = "capability_commnotif"
    case capabilityRemotenotif = "capability_remotenotif"
    case capabilityFetch = "capability_fetch"
    case capabilityBgtask = "capability_bgtask"
    case capabilityAppgroups = "capability_appgroups"
    case capabilityKeychain = "capability_keychain"
    case capabilityAutofill = "capability_autofill"
    case capabilityWifiinfo = "capability_wifiinfo"
    case capabilityContacts = "capability_contacts"
    case capabilityTracking = "capability_tracking"
    case capabilityFaceid = "capability_faceid"
    case capabilitySpeech = "capability_speech"
    case capabilityAudio = "capability_audio"
    case capabilityVoip = "capability_voip"
    case capabilityCalendar = "capability_calendar"
    case capabilityAssociateddomains = "capability_associateddomains"
    case capabilityHotspot = "capability_hotspot"
    var id: String { rawValue }
}

@MainActor @Observable
final class NativeV2ProductStore {
    var route: ProductRoute
    var flags: [String: Bool] = [:]
    var values: [String: String] = [:]
    var collections: [String: [String]] = [:]
    var permissionOutcomes: [String: Bool] = [:]
    var lastOutcome = ""
    var presentedCapability: String?
    private var pendingCapabilityAction: ProductAction?
    private var pendingCapabilityFallback = ""

    init() {
        route = NativeV2Capture.route() ?? .relayFeed
    }

    func perform(_ action: ProductAction) {
        switch action {
        case .openRelay:
            values["lastOpenedRelay"] = "current"
            lastOutcome = "Человек видит текущий ход, условие и цепочку знакомых участников"
            route = .turn
        case .acceptTurn:
            values["turnStatus"] = "accepted"
            lastOutcome = "Текущий ход закрепляется за участником и открывает создание продолжения"
            route = .chapterResult
        case .captureChapter:
            collections["chapters", default: []].append(UUID().uuidString)
            lastOutcome = "Снятый результат становится новой видимой главой эстафеты"
            route = .handoff
        case .passTurn:
            values["nextParticipant"] = "selected"
            lastOutcome = "Следующий знакомый получает персональный ход с готовым продолжением"
            route = .relayFeed
        case .openReply:
            values["replyStatus"] = "opened"
            lastOutcome = "Открывается готовое продолжение и выбор следующего знакомого"
            route = .handoff
        case .supportChapter:
            flags["supported", default: false].toggle()
            lastOutcome = "Поддержка остаётся на конкретной главе и видна её автору"
        case .startRelay:
            collections["relays", default: []].append(UUID().uuidString)
            lastOutcome = "Новая эстафета с первым условием появляется у выбранного знакомого"
        case .openProfile:
            values["profileVisible"] = "true"
            lastOutcome = "Открывается личный профиль участника"
            route = .profile
        case .openActiveRelays:
            values["relayFilter"] = "active"
            lastOutcome = "Открывается список цепочек, где ещё идёт ход"
            route = .activeRelays
        case .openDrafts:
            values["chapterFilter"] = "drafts"
            lastOutcome = "Открываются незаконченные главы"
            route = .drafts
        case .openSchedule:
            values["scheduleVisible"] = "true"
            lastOutcome = "Открываются принятые ходы и сроки"
            route = .schedule
        case .openSettings:
            values["profileDestination"] = "settings"
            lastOutcome = "Открываются настройки приватности, уведомлений и безопасности"
            route = .settings
        case .capabilityPhotos:
            values["capability_photos"] = "completed"
            lastOutcome = "Выбрать из медиатеки: результат сохранён в текущей эстафете и остаётся видимым пользователю"
        case .capabilityMic:
            values["capability_mic"] = "completed"
            lastOutcome = "Записать голос: результат сохранён в текущей эстафете и остаётся видимым пользователю"
        case .capabilityLocation:
            values["capability_location"] = "completed"
            lastOutcome = "Добавить место: результат сохранён в текущей эстафете и остаётся видимым пользователю"
        case .capabilityPush:
            values["capability_push"] = "completed"
            lastOutcome = "Следить за эстафетой: результат сохранён в текущей эстафете и остаётся видимым пользователю"
        case .capabilityCommnotif:
            values["capability_commnotif"] = "completed"
            lastOutcome = "Включить важные ответы: результат сохранён в текущей эстафете и остаётся видимым пользователю"
        case .capabilityRemotenotif:
            values["capability_remotenotif"] = "completed"
            lastOutcome = "Обновлять цепочки: результат сохранён в текущей эстафете и остаётся видимым пользователю"
        case .capabilityFetch:
            values["capability_fetch"] = "completed"
            lastOutcome = "Обновлять ленту: результат сохранён в текущей эстафете и остаётся видимым пользователю"
        case .capabilityBgtask:
            values["capability_bgtask"] = "completed"
            lastOutcome = "Готовить подборку: результат сохранён в текущей эстафете и остаётся видимым пользователю"
        case .capabilityAppgroups:
            values["capability_appgroups"] = "completed"
            lastOutcome = "Поделиться черновиком: результат сохранён в текущей эстафете и остаётся видимым пользователю"
        case .capabilityKeychain:
            values["capability_keychain"] = "completed"
            lastOutcome = "Сохранить защищённую сессию: результат сохранён в текущей эстафете и остаётся видимым пользователю"
        case .capabilityAutofill:
            values["capability_autofill"] = "completed"
            lastOutcome = "Добавить быстрый вход: результат сохранён в текущей эстафете и остаётся видимым пользователю"
        case .capabilityWifiinfo:
            values["capability_wifiinfo"] = "completed"
            lastOutcome = "Проверить общую сеть: результат сохранён в текущей эстафете и остаётся видимым пользователю"
        case .capabilityContacts:
            values["capability_contacts"] = "completed"
            lastOutcome = "Выбрать знакомого: результат сохранён в текущей эстафете и остаётся видимым пользователю"
        case .capabilityTracking:
            values["capability_tracking"] = "completed"
            lastOutcome = "Настроить рекомендации: результат сохранён в текущей эстафете и остаётся видимым пользователю"
        case .capabilityFaceid:
            values["capability_faceid"] = "completed"
            lastOutcome = "Защитить черновики: результат сохранён в текущей эстафете и остаётся видимым пользователю"
        case .capabilitySpeech:
            values["capability_speech"] = "completed"
            lastOutcome = "Расшифровать голос: результат сохранён в текущей эстафете и остаётся видимым пользователю"
        case .capabilityAudio:
            values["capability_audio"] = "completed"
            lastOutcome = "Слушать продолжения: результат сохранён в текущей эстафете и остаётся видимым пользователю"
        case .capabilityVoip:
            values["capability_voip"] = "completed"
            lastOutcome = "Позвонить участнику: результат сохранён в текущей эстафете и остаётся видимым пользователю"
        case .capabilityCalendar:
            values["capability_calendar"] = "completed"
            lastOutcome = "Запланировать ход: результат сохранён в текущей эстафете и остаётся видимым пользователю"
        case .capabilityAssociateddomains:
            values["capability_associateddomains"] = "completed"
            lastOutcome = "Открывать ссылки на эстафеты: результат сохранён в текущей эстафете и остаётся видимым пользователю"
        case .capabilityHotspot:
            values["capability_hotspot"] = "completed"
            lastOutcome = "Подключиться к встрече: результат сохранён в текущей эстафете и остаётся видимым пользователю"
        }
    }

    func performCapability(
        _ action: ProductAction,
        key: String,
        fallback: String,
        permissions: Permissions
    ) async {
        let granted: Bool
        switch key {
        case "camera":
            granted = await permissions.request(PermissionKey(rawValue: "camera"))
        case "photos":
            granted = await permissions.request(PermissionKey(rawValue: "photos"))
        case "mic":
            granted = await permissions.request(PermissionKey(rawValue: "mic"))
        case "location":
            granted = await permissions.request(PermissionKey(rawValue: "location"))
        case "push":
            granted = await permissions.request(PermissionKey(rawValue: "push"))
        case "commnotif":
            granted = await permissions.request(PermissionKey(rawValue: "commnotif"))
        case "remotenotif":
            granted = await permissions.request(PermissionKey(rawValue: "remotenotif"))
        case "fetch":
            granted = await permissions.request(PermissionKey(rawValue: "fetch"))
        case "bgtask":
            granted = await permissions.request(PermissionKey(rawValue: "bgtask"))
        case "appgroups":
            granted = await permissions.request(PermissionKey(rawValue: "appgroups"))
        case "keychain":
            granted = await permissions.request(PermissionKey(rawValue: "keychain"))
        case "autofill":
            granted = await permissions.request(PermissionKey(rawValue: "autofill"))
        case "wifiinfo":
            granted = await permissions.request(PermissionKey(rawValue: "wifiinfo"))
        case "contacts":
            granted = await permissions.request(PermissionKey(rawValue: "contacts"))
        case "tracking":
            granted = await permissions.request(PermissionKey(rawValue: "tracking"))
        case "faceid":
            granted = await permissions.request(PermissionKey(rawValue: "faceid"))
        case "speech":
            granted = await permissions.request(PermissionKey(rawValue: "speech"))
        case "audio":
            granted = await permissions.request(PermissionKey(rawValue: "audio"))
        case "voip":
            granted = await permissions.request(PermissionKey(rawValue: "voip"))
        case "calendar":
            granted = await permissions.request(PermissionKey(rawValue: "calendar"))
        case "associateddomains":
            granted = await permissions.request(PermissionKey(rawValue: "associateddomains"))
        case "hotspot":
            granted = await permissions.request(PermissionKey(rawValue: "hotspot"))
        default:
            assertionFailure("Capability is not part of the compiled plan: \(key)")
            granted = false
        }
        permissionOutcomes[key] = granted
        if granted {
            if key == "camera", ProcessInfo.processInfo.environment["NATIVE_UI_TESTING"] != "1" {
                pendingCapabilityAction = action
                pendingCapabilityFallback = fallback
                presentedCapability = key
            } else {
                let completed = await NativeCapabilityOperations.perform(key)
                if completed {
                    recordCapabilityOutcome(key)
                    perform(action)
                } else {
                    lastOutcome = fallback
                    permissionOutcomes[key] = false
                }
            }
        } else {
            lastOutcome = fallback
        }
    }

    func completePresentedCapability() {
        if let action = pendingCapabilityAction {
            recordCapabilityOutcome("camera")
            perform(action)
        }
        presentedCapability = nil
        pendingCapabilityAction = nil
        pendingCapabilityFallback = ""
    }

    func cancelPresentedCapability() {
        lastOutcome = pendingCapabilityFallback
        presentedCapability = nil
        pendingCapabilityAction = nil
        pendingCapabilityFallback = ""
    }

    private func recordCapabilityOutcome(_ key: String) {
        switch key {
        case "camera": values["capturedMedia"] = "completed"
        case "photos": values["capability_photos"] = "completed"
        case "mic": values["capability_mic"] = "completed"
        case "location": values["capability_location"] = "completed"
        case "push": values["capability_push"] = "completed"
        case "commnotif": values["capability_commnotif"] = "completed"
        case "remotenotif": values["capability_remotenotif"] = "completed"
        case "fetch": values["capability_fetch"] = "completed"
        case "bgtask": values["capability_bgtask"] = "completed"
        case "appgroups": values["capability_appgroups"] = "completed"
        case "keychain": values["capability_keychain"] = "completed"
        case "autofill": values["capability_autofill"] = "completed"
        case "wifiinfo": values["capability_wifiinfo"] = "completed"
        case "contacts": values["capability_contacts"] = "completed"
        case "tracking": values["capability_tracking"] = "completed"
        case "faceid": values["capability_faceid"] = "completed"
        case "speech": values["capability_speech"] = "completed"
        case "audio": values["capability_audio"] = "completed"
        case "voip": values["capability_voip"] = "completed"
        case "calendar": values["capability_calendar"] = "completed"
        case "associateddomains": values["capability_associateddomains"] = "completed"
        case "hotspot": values["capability_hotspot"] = "completed"
        default: break
        }
    }
}

private extension Array {
    mutating func removeLastIfPresent() { if !isEmpty { removeLast() } }
}

enum NativeV2PermissionContract {
    static let keys = ["camera", "photos", "mic", "location", "push", "commnotif", "remotenotif", "fetch", "bgtask", "appgroups", "keychain", "autofill", "wifiinfo", "contacts", "tracking", "faceid", "speech", "audio", "voip", "calendar", "associateddomains", "hotspot"]
}
