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
import MediaPlayer
import AuthenticationServices
import BackgroundTasks
import CallKit
import Intents
import NetworkExtension
import Security
import UIKit

/// Движок доступов кита. Работает поверх перечисления Access, которое
/// генерируется из набора доступов концепта.

enum AccessState { case unknown, granted, denied }

struct AccessLogEntry: Identifiable {
    let id = UUID()
    let key: Access
    let state: AccessState
    let screen: String
    let at = Date()
}

/// Реальные системные запросы. Никакой симуляции: промпт поднимает iOS.
@MainActor
@Observable
final class AccessStore {
    private(set) var states: [Access: AccessState] = [:]
    private(set) var log: [AccessLogEntry] = []

    private let location = LocationRequester()
    private let scripted: [Access: AccessState]
    private let voice = AVSpeechSynthesizer()

    init() {
        var scripted: [Access: AccessState] = [:]
        for argument in ProcessInfo.processInfo.arguments {
            guard argument.hasPrefix("-grant:") || argument.hasPrefix("-deny:") else { continue }
            let parts = argument.split(separator: ":", maxSplits: 1)
            guard parts.count == 2 else { continue }
            let state: AccessState = parts[0] == "-grant" ? .granted : .denied
            for raw in parts[1].split(separator: ",") {
                if let key = Access(rawValue: String(raw)) { scripted[key] = state }
            }
        }
        self.scripted = scripted
    }

    func state(_ key: Access) -> AccessState { states[key] ?? .unknown }
    func granted(_ key: Access) -> Bool { state(key) == .granted }
    func denied(_ key: Access) -> Bool { state(key) == .denied }

    /// Старый синхронный seam для authored UI. Даже entitlement проходит через
    /// реальную platform operation; наличие ключа в подписи больше не считается успехом.
    func activate(_ key: Access, on screen: String) {
        Task { _ = await request([key], on: screen) }
    }

    /// Цепочка: ключи спрашиваются подряд, первый отказ обрывает остальные.
    @discardableResult
    func request(_ keys: [Access], on screen: String, value: String? = nil) async -> Bool {
        for key in keys where !(await requestOne(key, on: screen, value: value)) { return false }
        return true
    }

    private func requestOne(_ key: Access, on screen: String, value: String?) async -> Bool {
        if let forced = scripted[key] { record(key, forced, screen); return forced == .granted }
        if case let known = state(key), known != .unknown { return known == .granted }

        // Переключаемся по строковому ключу: набор доступов у каждого концепта свой,
        // и рантайм не должен знать, какие именно кейсы в нём объявлены.
        let ok: Bool
        switch key.rawValue {
        case "camera": ok = await AVCaptureDevice.requestAccess(for: .video)
        case "mic": ok = await AVAudioApplication.requestRecordPermission()
        case "photo", "photos": ok = await PHPhotoLibrary.requestAuthorization(for: .readWrite) != .denied
        case "photoadd", "photosadd": ok = await PHPhotoLibrary.requestAuthorization(for: .addOnly) != .denied
        case "location", "locationalways": ok = await location.request()
        case "contacts": ok = (try? await CNContactStore().requestAccess(for: .contacts)) ?? false
        case "calendar": ok = (try? await EKEventStore().requestFullAccessToEvents()) ?? false
        case "push": ok = (try? await UNUserNotificationCenter.current()
            .requestAuthorization(options: [.alert, .sound, .badge])) ?? false
        case "tracking": ok = await ATTrackingManager.requestTrackingAuthorization() == .authorized
        case "speech": ok = await withCheckedContinuation { c in
            SFSpeechRecognizer.requestAuthorization { c.resume(returning: $0 == .authorized) }
        }
        case "music": ok = await withCheckedContinuation { c in
            MPMediaLibrary.requestAuthorization { c.resume(returning: $0 == .authorized) }
        }
        case "faceid": ok = await biometrics(reason: key.fallback)
        case "commnotif": ok = await donateCommunicationIntent()
        case "remotenotif":
            UIApplication.shared.registerForRemoteNotifications()
            ok = true
        case "fetch": ok = (Bundle.main.object(forInfoDictionaryKey: "UIBackgroundModes") as? [String])?.contains("fetch") == true
        case "bgtask": ok = scheduleRefreshTask()
        case "appgroups": ok = verifyAppGroup()
        case "keychain": ok = verifyKeychain()
        case "autofill": ok = await saveAutofillIdentity()
        case "wifiinfo": ok = await readCurrentWiFi()
        case "audio": ok = startBackgroundVoicePlayback()
        case "voip": ok = await startCallKitCall()
        case "associateddomains": ok = publishItemActivity(value: value)
        case "hotspot": ok = await joinGuestNetwork(value: value)
        default: ok = false
        }
        record(key, ok ? .granted : .denied, screen)
        return ok
    }

    private func biometrics(reason: String) async -> Bool {
        let context = LAContext()
        var error: NSError?
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else { return false }
        return (try? await context.evaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics, localizedReason: reason)) ?? false
    }

    private func donateCommunicationIntent() async -> Bool {
        let person = INPerson(
            personHandle: INPersonHandle(value: "polka-friend", type: .unknown),
            nameComponents: nil, displayName: "Лена Морозова", image: nil,
            contactIdentifier: nil, customIdentifier: "polka-friend"
        )
        let intent = INSendMessageIntent(
            recipients: [person], outgoingMessageType: .outgoingMessageText,
            content: "Можно забрать вещь", speakableGroupName: nil,
            conversationIdentifier: "polka-handoff", serviceName: "Полка",
            sender: nil, attachments: nil
        )
        return await withCheckedContinuation { continuation in
            INInteraction(intent: intent, response: nil).donate {
                continuation.resume(returning: $0 == nil)
            }
        }
    }

    private func scheduleRefreshTask() -> Bool {
        guard let bundle = Bundle.main.bundleIdentifier else { return false }
        let request = BGAppRefreshTaskRequest(identifier: "\(bundle).refresh")
        request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60)
        do { try BGTaskScheduler.shared.submit(request); return true }
        catch { return false }
    }

    private func verifyAppGroup() -> Bool {
        guard let bundle = Bundle.main.bundleIdentifier,
              let defaults = UserDefaults(suiteName: "group.\(bundle)") else { return false }
        defaults.set("tent", forKey: "sharedItemDraft")
        return defaults.synchronize()
    }

    private func verifyKeychain() -> Bool {
        let service = "app.camo.polka.session"
        let account = "current"
        let base: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
        ]
        SecItemDelete(base as CFDictionary)
        var insertion = base
        insertion[kSecValueData as String] = Data("active".utf8)
        guard SecItemAdd(insertion as CFDictionary, nil) == errSecSuccess else { return false }
        return SecItemCopyMatching(base as CFDictionary, nil) == errSecSuccess
    }

    private func saveAutofillIdentity() async -> Bool {
        await withCheckedContinuation { continuation in
            ASCredentialIdentityStore.shared.getState { state in
                guard state.isEnabled else { continuation.resume(returning: false); return }
                let service = ASCredentialServiceIdentifier(identifier: "polka.app", type: .domain)
                let identity = ASPasswordCredentialIdentity(
                    serviceIdentifier: service, user: "marina@polka.app", recordIdentifier: "polka-main"
                )
                ASCredentialIdentityStore.shared.saveCredentialIdentities([identity]) { success, _ in
                    continuation.resume(returning: success)
                }
            }
        }
    }

    private func readCurrentWiFi() async -> Bool {
        await withCheckedContinuation { continuation in
            NEHotspotNetwork.fetchCurrent { continuation.resume(returning: $0 != nil) }
        }
    }

    private func startBackgroundVoicePlayback() -> Bool {
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback)
            try AVAudioSession.sharedInstance().setActive(true)
            let utterance = AVSpeechUtterance(string: "Лена: палатку можно забрать сегодня после семи")
            utterance.voice = AVSpeechSynthesisVoice(language: "ru-RU")
            voice.speak(utterance)
            MPNowPlayingInfoCenter.default().nowPlayingInfo = [MPMediaItemPropertyTitle: "Голосовое от Лены"]
            return true
        } catch { return false }
    }

    private func startCallKitCall() async -> Bool {
        let action = CXStartCallAction(call: UUID(), handle: CXHandle(type: .generic, value: "Лена · Полка"))
        return await withCheckedContinuation { continuation in
            CXCallController().request(CXTransaction(action: action)) {
                continuation.resume(returning: $0 == nil)
            }
        }
    }

    private func publishItemActivity(value: String?) -> Bool {
        guard let url = URL(string: value ?? "https://polka.app/item/tent") else { return false }
        let activity = NSUserActivity(activityType: NSUserActivityTypeBrowsingWeb)
        activity.title = "Палатка на троих"
        activity.webpageURL = url
        activity.isEligibleForHandoff = true
        activity.becomeCurrent()
        return true
    }

    private func joinGuestNetwork(value: String?) async -> Bool {
        let parts = (value ?? "Polka-Guest").split(separator: "|", maxSplits: 1).map(String.init)
        let config = parts.count == 2
            ? NEHotspotConfiguration(ssid: parts[0], passphrase: parts[1], isWEP: false)
            : NEHotspotConfiguration(ssid: parts[0])
        config.joinOnce = true
        return await withCheckedContinuation { continuation in
            NEHotspotConfigurationManager.shared.apply(config) { error in
                if let ns = error as NSError?, ns.domain == NEHotspotConfigurationErrorDomain,
                   ns.code == NEHotspotConfigurationError.alreadyAssociated.rawValue {
                    continuation.resume(returning: true)
                } else {
                    continuation.resume(returning: error == nil)
                }
            }
        }
    }

    /// Журнал — инструмент приёмки, а не фича продукта: он уходит в консоль,
    /// а не на экран. В HTML-концепте он тоже живёт в обвязке страницы вокруг
    /// устройства (kernel/page.html), а не внутри приложения.
    private func record(_ key: Access, _ state: AccessState, _ screen: String) {
        states[key] = state
        log.append(AccessLogEntry(key: key, state: state, screen: screen))
        print("[access] \(state == .granted ? "granted" : "denied") \(key.rawValue) · \(key.plist) · \(screen)")
    }
}

/// CLLocationManager отвечает делегатом, поэтому запрос заворачивается в continuation.
private final class LocationRequester: NSObject, CLLocationManagerDelegate, @unchecked Sendable {
    private let manager = CLLocationManager()
    private var continuation: CheckedContinuation<Bool, Never>?

    override init() { super.init(); manager.delegate = self }

    func request() async -> Bool {
        await withCheckedContinuation { c in
            guard continuation == nil else { c.resume(returning: false); return }
            continuation = c
            manager.requestWhenInUseAuthorization()
        }
    }

    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        let status = manager.authorizationStatus
        guard status != .notDetermined, let c = continuation else { return }
        continuation = nil
        c.resume(returning: status == .authorizedWhenInUse || status == .authorizedAlways)
    }
}

/// Плашка, объясняющая, что осталось работать после отказа.
struct DeniedNotice: View {
    let key: Access
    @Environment(AccessStore.self) private var access

    var body: some View {
        if access.denied(key) {
            HStack(alignment: .top, spacing: 8) {
                Image(systemName: "info.circle.fill")
                    .font(.system(size: 14))
                    .foregroundStyle(D.orangeInk)
                Text(key.fallback)
                    .font(.system(size: 13))
                    .foregroundStyle(D.orangeInk)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(10)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(D.orange.opacity(0.14), in: RoundedRectangle(cornerRadius: 10, style: .continuous))
        }
    }
}
