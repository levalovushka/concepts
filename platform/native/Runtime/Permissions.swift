import SwiftUI
import AVFoundation
import Speech
import Photos
import CoreLocation
import UserNotifications
import AppTrackingTransparency
import Contacts
import EventKit
import LocalAuthentication
import Network

// Слой доступов — детерминированная часть пайплайна. Запрос идёт через настоящие
// iOS API; ключи и usage-строки приходят из concept.json дословно.

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
    static let contacts = PermissionKey(rawValue: "contacts")
    static let calendar = PermissionKey(rawValue: "calendar")
    static let faceid = PermissionKey(rawValue: "faceid")
    static let voip = PermissionKey(rawValue: "voip")
    static let audio = PermissionKey(rawValue: "audio")
    static let localnet = PermissionKey(rawValue: "localnet")
}

struct PermissionSpec: Identifiable, Sendable {
    let key: PermissionKey
    let plistKey: String
    let feature: String
    let gesture: String
    let screen: String
    let target: String
    let fallback: String
    let snack: String
    let activate: Bool
    var id: String { key.rawValue }
}

@MainActor
@Observable
final class Permissions {
    enum Status: Equatable { case unknown, granted, denied }
    private(set) var status: [PermissionKey: Status] = [:]
    private(set) var promptLog: [String] = []

    func status(_ key: PermissionKey) -> Status { status[key] ?? .unknown }
    func isGranted(_ key: PermissionKey) -> Bool { status(key) == .granted }

    /// Идемпотентно: один доступ — одна точка запроса, повторный вход не даёт второй алерт.
    @discardableResult
    func request(_ key: PermissionKey) async -> Bool {
        if let s = status[key], s != .unknown { return s == .granted }
        promptLog.append(key.rawValue)
        let ok = await perform(key)
        status[key] = ok ? .granted : .denied
        return ok
    }

    private func perform(_ key: PermissionKey) async -> Bool {
        switch key.rawValue {
        case "camera":
            return await AVCaptureDevice.requestAccess(for: .video)
        case "mic":
            return await withCheckedContinuation { c in
                AVAudioApplication.requestRecordPermission { c.resume(returning: $0) }
            }
        case "speech":
            return await withCheckedContinuation { c in
                SFSpeechRecognizer.requestAuthorization { c.resume(returning: $0 == .authorized) }
            }
        case "photo", "photos":
            let s = await PHPhotoLibrary.requestAuthorization(for: .readWrite)
            return s == .authorized || s == .limited
        case "location":
            return await LocationRequester.shared.request()
        case "push":
            return (try? await UNUserNotificationCenter.current()
                .requestAuthorization(options: [.alert, .sound, .badge])) ?? false
        case "tracking":
            return await ATTrackingManager.requestTrackingAuthorization() == .authorized
        case "contacts":
            return (try? await CNContactStore().requestAccess(for: .contacts)) ?? false
        case "calendar":
            return (try? await EKEventStore().requestFullAccessToEvents()) ?? false
        case "faceid":
            let ctx = LAContext()
            var err: NSError?
            guard ctx.canEvaluatePolicy(.deviceOwnerAuthentication, error: &err) else { return false }
            return (try? await ctx.evaluatePolicy(.deviceOwnerAuthentication,
                                                  localizedReason: "Разблокировать приложение")) ?? false
        case "localnet":
            let b = NWBrowser(for: .bonjour(type: "_companion-link._tcp", domain: nil), using: .init())
            b.start(queue: .main)
            try? await Task.sleep(nanoseconds: 1_200_000_000)
            b.cancel()
            return true
        case "audio":
            try? AVAudioSession.sharedInstance().setCategory(.playback)
            return true
        default:
            return true   // entitlement без рантайм-промпта
        }
    }
}

private final class LocationRequester: NSObject, CLLocationManagerDelegate, @unchecked Sendable {
    static let shared = LocationRequester()
    private let manager = CLLocationManager()
    private var cont: CheckedContinuation<Bool, Never>?

    func request() async -> Bool {
        if manager.authorizationStatus != .notDetermined {
            return manager.authorizationStatus == .authorizedWhenInUse
                || manager.authorizationStatus == .authorizedAlways
        }
        return await withCheckedContinuation { c in
            cont = c
            manager.delegate = self
            manager.requestWhenInUseAuthorization()
        }
    }
    func locationManagerDidChangeAuthorization(_ m: CLLocationManager) {
        guard m.authorizationStatus != .notDetermined, let c = cont else { return }
        cont = nil
        c.resume(returning: m.authorizationStatus == .authorizedWhenInUse
                 || m.authorizationStatus == .authorizedAlways)
    }
}
