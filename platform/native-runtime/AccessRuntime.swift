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

    /// Entitlement: право есть в сборке, системного алерта нет.
    func activate(_ key: Access, on screen: String) {
        record(key, .granted, screen)
    }

    /// Цепочка: ключи спрашиваются подряд, первый отказ обрывает остальные.
    @discardableResult
    func request(_ keys: [Access], on screen: String) async -> Bool {
        for key in keys where !(await requestOne(key, on: screen)) { return false }
        return true
    }

    private func requestOne(_ key: Access, on screen: String) async -> Bool {
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
        default: ok = true   // entitlement или фоновый режим — системного запроса нет
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
