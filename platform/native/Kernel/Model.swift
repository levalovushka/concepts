import SwiftUI

// Модель приложения — это ровно то, что уже описано в concept.json.
// Генератор эмитит экземпляр AppSpec в Generated/AppConfig.swift, ядро его рендерит.

// Ключ доступа — строковый, чтобы пайплайн принимал любой набор из concept.json,
// а не только зашитый список. Известные ключи имеют статики для кода ядра.
struct PermissionKey: RawRepresentable, Hashable, Sendable {
    let rawValue: String
    init(rawValue: String) { self.rawValue = rawValue }

    static let camera = PermissionKey(rawValue: "camera")
    static let mic = PermissionKey(rawValue: "mic")
    static let speech = PermissionKey(rawValue: "speech")
    static let photo = PermissionKey(rawValue: "photo")
    static let photos = PermissionKey(rawValue: "photos")
    static let location = PermissionKey(rawValue: "location")
    static let push = PermissionKey(rawValue: "push")
    static let tracking = PermissionKey(rawValue: "tracking")
    static let localnet = PermissionKey(rawValue: "localnet")
    static let audio = PermissionKey(rawValue: "audio")
    static let contacts = PermissionKey(rawValue: "contacts")
    static let calendar = PermissionKey(rawValue: "calendar")
    static let faceid = PermissionKey(rawValue: "faceid")
}

enum ScreenKind: String, Codable, Sendable {
    case root        // корневой экран вкладки
    case push        // NavigationStack push
    case sheet       // .sheet
    case fullscreen  // .fullScreenCover
    case modal       // .sheet, но помечен модальным в спеке
    case system      // системный (PiP, Now Playing, системный picker) — заглушка-объяснение
}

// Иконка доступа по ключу — общая для всех точек запроса.
func permissionIcon(_ key: PermissionKey) -> String {
    switch key.rawValue {
    case "camera": return "camera"
    case "mic": return "mic"
    case "speech": return "waveform"
    case "photo", "photos": return "photo"
    case "location": return "location"
    case "push", "remotenotif", "commnotif": return "bell"
    case "tracking": return "hand.raised"
    case "localnet", "wifiinfo", "hotspot": return "wifi"
    case "audio": return "speaker.wave.2"
    case "contacts": return "person.crop.circle"
    case "calendar": return "calendar"
    case "faceid": return "faceid"
    case "voip": return "phone"
    case "keychain", "autofill": return "key"
    case "fetch", "appgroups": return "arrow.triangle.2.circlepath"
    case "shareext": return "square.and.arrow.up"
    default: return "circle"
    }
}

struct PermissionSpec: Identifiable, Sendable {
    let key: PermissionKey
    let plistKey: String
    let title: String
    let body: String
    let feature: String
    let gesture: String
    let screen: String        // экран, с которого запрашивается — ровно один
    let target: String        // куда вести при granted
    let fallback: String      // что показать при denied
    let snack: String
    let risk: String
    let anchor: Bool
    let conditional: Bool     // не запрашивать, пока за ключом нет живой фичи
    let activate: Bool        // entitlement без системного алерта (audio)
    var id: String { key.rawValue }
}

struct ScreenSpec: Identifiable, Sendable {
    let id: String
    let title: String
    let kind: ScreenKind
    let parent: String?
    let tab: String?          // к какой вкладке относится (для корневых)
    let meta: String
}

struct TabSpec: Identifiable, Sendable {
    let id: String
    let label: String
    let systemImage: String
}

enum PositioningMode: String, Codable, Sendable {
    case mimicry        // почти полная визуальная копия сервиса ВК (архетип референса)
    case differentiation // самостоятельный продукт со своей визуальной системой
}

struct AppSpec: Sendable {
    let name: String
    let mode: PositioningMode
    let referenceArchetype: String?  // для мимикрии: vk-music / vk-video / vkontakte / ok
    let accent: Color
    let accentDark: Color
    let tabs: [TabSpec]
    let screens: [ScreenSpec]
    let permissions: [PermissionSpec]
    let mailAuth: Bool        // вход по почте (набор vkontakte) vs по номеру

    func screen(_ id: String) -> ScreenSpec? { screens.first { $0.id == id } }
    func children(of id: String) -> [ScreenSpec] { screens.filter { $0.parent == id } }
    func permissions(on id: String) -> [PermissionSpec] { permissions.filter { $0.screen == id } }
    func rootScreen(forTab tab: String) -> ScreenSpec? {
        screens.first { $0.kind == .root && ($0.tab == tab || $0.id == tab) }
    }
}
