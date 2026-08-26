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
import NetworkExtension
import AuthenticationServices
import Security
import UIKit
import BackgroundTasks

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
    static let hotspot = PermissionKey(rawValue: "hotspot")
    static let wifiinfo = PermissionKey(rawValue: "wifiinfo")
    static let appgroups = PermissionKey(rawValue: "appgroups")
    static let keychain = PermissionKey(rawValue: "keychain")
    static let autofill = PermissionKey(rawValue: "autofill")
    static let shareext = PermissionKey(rawValue: "shareext")
    static let commnotif = PermissionKey(rawValue: "commnotif")
    static let remotenotif = PermissionKey(rawValue: "remotenotif")
    static let fetch = PermissionKey(rawValue: "fetch")
    static let bgtask = PermissionKey(rawValue: "bgtask")
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
    private let expectedWiFiSSID: String?
    private let biometricReason: String
    private let autofillService: String?
    private let autofillUsers: [(user: String, record: String)]

    init(
        expectedWiFiSSID: String? = nil,
        biometricReason: String = "Подтвердить доступ к защищённым данным",
        autofillService: String? = nil,
        autofillUsers: [(user: String, record: String)] = []
    ) {
        self.expectedWiFiSSID = expectedWiFiSSID
        self.biometricReason = biometricReason
        self.autofillService = autofillService
        self.autofillUsers = autofillUsers
        if ProcessInfo.processInfo.environment["NATIVE_UI_TESTING"] == "1" {
            for key in [PermissionKey.location, .camera, .calendar, .faceid, .hotspot] {
                if ProcessInfo.processInfo.environment["NATIVE_UI_TEST_PERMISSION_\(key.rawValue.uppercased())"] == "pregranted" {
                    status[key] = .granted
                }
            }
        }
    }

    func status(_ key: PermissionKey) -> Status { status[key] ?? .unknown }
    func isGranted(_ key: PermissionKey) -> Bool { status(key) == .granted }

    func refreshStatus(_ key: PermissionKey) async {
        status[key] = await currentStatus(key)
    }

    private func currentStatus(_ key: PermissionKey) async -> Status {
        switch key.rawValue {
        case "camera":
            return map(AVCaptureDevice.authorizationStatus(for: .video))
        case "mic":
            return switch AVAudioApplication.shared.recordPermission {
            case .granted: .granted
            case .denied: .denied
            default: .unknown
            }
        case "speech":
            return switch SFSpeechRecognizer.authorizationStatus() {
            case .authorized: .granted
            case .denied, .restricted: .denied
            default: .unknown
            }
        case "photo", "photos":
            return switch PHPhotoLibrary.authorizationStatus(for: .readWrite) {
            case .authorized, .limited: .granted
            case .denied, .restricted: .denied
            default: .unknown
            }
        case "location":
            return switch CLLocationManager().authorizationStatus {
            case .authorizedAlways, .authorizedWhenInUse: .granted
            case .denied, .restricted: .denied
            default: .unknown
            }
        case "push":
            return switch await UNUserNotificationCenter.current().notificationSettings().authorizationStatus {
            case .authorized, .provisional, .ephemeral: .granted
            case .denied: .denied
            default: .unknown
            }
        case "tracking":
            return switch ATTrackingManager.trackingAuthorizationStatus {
            case .authorized: .granted
            case .denied, .restricted: .denied
            default: .unknown
            }
        case "contacts":
            return map(CNContactStore.authorizationStatus(for: .contacts))
        case "calendar":
            return switch EKEventStore.authorizationStatus(for: .event) {
            case .fullAccess, .writeOnly, .authorized: .granted
            case .denied, .restricted: .denied
            default: .unknown
            }
        case "faceid":
            let context = LAContext()
            var error: NSError?
            return context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error) ? .granted : .denied
        default:
            return status[key] ?? .unknown
        }
    }

    private func map(_ value: AVAuthorizationStatus) -> Status {
        switch value {
        case .authorized: .granted
        case .denied, .restricted: .denied
        default: .unknown
        }
    }

    private func map(_ value: CNAuthorizationStatus) -> Status {
        switch value {
        case .authorized, .limited: .granted
        case .denied, .restricted: .denied
        default: .unknown
        }
    }

    func authenticateDeviceOwner(reason: String = "Подтвердить доступ") async -> Bool {
        let context = LAContext()
        var error: NSError?
        guard context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error) else { return false }
        return (try? await context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: reason)) ?? false
    }

    /// Идемпотентно: один доступ — одна точка запроса, повторный вход не даёт второй алерт.
    @discardableResult
    func request(_ key: PermissionKey, value: String? = nil) async -> Bool {
        let dynamic: Set<PermissionKey> = [
            .camera, .mic, .speech, .photo, .photos, .location, .push,
            .contacts, .calendar, .faceid, .hotspot, .wifiinfo, .autofill,
            .appgroups, .keychain, .fetch, .bgtask,
        ]
        if !dynamic.contains(key), let s = status[key], s != .unknown { return s == .granted }
        promptLog.append(key.rawValue)
        let ok = await perform(key, value: value)
        status[key] = ok ? .granted : .denied
        return ok
    }

    private func perform(_ key: PermissionKey, value: String?) async -> Bool {
        // XCUI observes that the product reached the real permission seam, but
        // never drives private TCC dialog chrome. Production launches do not
        // have this environment value and continue into the system adapter.
        if ProcessInfo.processInfo.environment["NATIVE_UI_TESTING"] == "1",
           let answer = ProcessInfo.processInfo.environment["NATIVE_UI_TEST_PERMISSION_\(key.rawValue.uppercased())"] {
            return answer == "granted" || answer == "pregranted"
        }
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
        case "commnotif":
            let settings = await UNUserNotificationCenter.current().notificationSettings()
            return settings.authorizationStatus == .authorized
                || settings.authorizationStatus == .provisional
        case "remotenotif":
            let remoteSettings = await UNUserNotificationCenter.current().notificationSettings()
            guard remoteSettings.authorizationStatus == .authorized
                    || remoteSettings.authorizationStatus == .provisional else { return false }
            UIApplication.shared.registerForRemoteNotifications()
            return true
        case "fetch":
            return (Bundle.main.object(forInfoDictionaryKey: "UIBackgroundModes") as? [String])?
                .contains("fetch") == true
        case "bgtask":
            guard let bundleID = Bundle.main.bundleIdentifier else { return false }
            let request = BGAppRefreshTaskRequest(identifier: "\(bundleID).refresh")
            request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60)
            do {
                try BGTaskScheduler.shared.submit(request)
                return true
            } catch { return false }
        case "tracking":
            return await ATTrackingManager.requestTrackingAuthorization() == .authorized
        case "contacts":
            return (try? await CNContactStore().requestAccess(for: .contacts)) ?? false
        case "calendar":
            return (try? await EKEventStore().requestFullAccessToEvents()) ?? false
        case "faceid":
            return await authenticateDeviceOwner(reason: biometricReason)
        case "localnet":
            return await LocalNetworkRequester().request()
        case "audio":
            do {
                try AVAudioSession.sharedInstance().setCategory(.playback)
                try AVAudioSession.sharedInstance().setActive(true)
                return true
            } catch { return false }
        case "voip":
            do {
                try AVAudioSession.sharedInstance().setCategory(
                    .playAndRecord,
                    mode: .voiceChat,
                    options: [.allowBluetoothHFP, .defaultToSpeaker]
                )
                return true
            } catch { return false }
        case "appgroups":
            guard let bundleID = Bundle.main.bundleIdentifier else { return false }
            return FileManager.default.containerURL(
                forSecurityApplicationGroupIdentifier: "group.\(bundleID)"
            ) != nil
        case "keychain":
            return KeychainProbe.isAvailable()
        case "autofill":
            guard let autofillService, !autofillUsers.isEmpty else { return false }
            return await withCheckedContinuation { continuation in
                ASCredentialIdentityStore.shared.getState { state in
                    guard state.isEnabled else {
                        continuation.resume(returning: false)
                        return
                    }
                    let service = ASCredentialServiceIdentifier(identifier: autofillService, type: .domain)
                    let identities = self.autofillUsers.map {
                        ASPasswordCredentialIdentity(
                            serviceIdentifier: service,
                            user: $0.user,
                            recordIdentifier: $0.record
                        )
                    }
                    ASCredentialIdentityStore.shared.saveCredentialIdentities(identities) { success, _ in
                        continuation.resume(returning: success)
                    }
                }
            }
        case "shareext":
            guard let plugins = Bundle.main.builtInPlugInsURL,
                  let bundles = try? FileManager.default.contentsOfDirectory(
                    at: plugins,
                    includingPropertiesForKeys: nil
                  ) else { return false }
            return bundles.contains { $0.lastPathComponent.hasSuffix("ShareExtension.appex") }
        case "wifiinfo":
            return await withCheckedContinuation { continuation in
                NEHotspotNetwork.fetchCurrent { network in
                    guard let network else {
                        continuation.resume(returning: false)
                        return
                    }
                    guard let expectedWiFiSSID = self.expectedWiFiSSID else {
                        continuation.resume(returning: true)
                        return
                    }
                    continuation.resume(
                        returning: network.ssid.compare(
                            expectedWiFiSSID,
                            options: [.caseInsensitive, .diacriticInsensitive]
                        ) == .orderedSame
                    )
                }
            }
        case "hotspot":
            guard let value, !value.isEmpty else { return false }
            let parts = value.split(separator: "|", maxSplits: 1).map(String.init)
            let ssid = parts[0]
            let configuration = parts.count == 2
                ? NEHotspotConfiguration(ssid: ssid, passphrase: parts[1], isWEP: false)
                : NEHotspotConfiguration(ssid: ssid)
            configuration.joinOnce = true
            return await withCheckedContinuation { continuation in
                NEHotspotConfigurationManager.shared.apply(configuration) { error in
                    if let error,
                       (error as NSError).domain == NEHotspotConfigurationErrorDomain,
                       (error as NSError).code == NEHotspotConfigurationError.alreadyAssociated.rawValue {
                        continuation.resume(returning: true)
                    } else {
                        continuation.resume(returning: error == nil)
                    }
                }
            }
        default:
            // A capability without an explicit adapter is not implemented. Build
            // entitlements are verified separately; they must never become a fake
            // runtime success state.
            return false
        }
    }
}

private enum KeychainProbe {
    static func isAvailable() -> Bool {
        let service = "com.camo.capability-probe"
        let account = UUID().uuidString
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecValueData as String: Data("probe".utf8),
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
        ]
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else { return false }
        SecItemDelete([
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
        ] as CFDictionary)
        return true
    }
}

private final class LocalNetworkRequester: @unchecked Sendable {
    func request() async -> Bool {
        await withCheckedContinuation { continuation in
            let browser = NWBrowser(
                for: .bonjour(type: "_companion-link._tcp", domain: nil),
                using: .tcp
            )
            let completion = LocalNetworkCompletion(continuation: continuation, browser: browser)
            browser.stateUpdateHandler = { state in
                switch state {
                case .ready: completion.finish(true)
                case .failed: completion.finish(false)
                default: break
                }
            }
            browser.start(queue: .main)
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) { completion.finish(false) }
        }
    }
}

private final class LocalNetworkCompletion: @unchecked Sendable {
    private let lock = NSLock()
    private var completed = false
    private let continuation: CheckedContinuation<Bool, Never>
    private let browser: NWBrowser

    init(continuation: CheckedContinuation<Bool, Never>, browser: NWBrowser) {
        self.continuation = continuation
        self.browser = browser
    }

    func finish(_ value: Bool) {
        lock.lock()
        guard !completed else { lock.unlock(); return }
        completed = true
        lock.unlock()
        browser.cancel()
        continuation.resume(returning: value)
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
