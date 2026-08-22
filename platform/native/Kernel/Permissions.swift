import SwiftUI
import AVFoundation
import Speech
import Photos
import CoreLocation
import UserNotifications
import AppTrackingTransparency
import Network

// Слой доступов. Запрос идёт через настоящие iOS API, а не через эмуляцию.
// Инвариант «один доступ — одна точка запроса» держится тем, что статус кэшируется:
// повторный вход в фичу не показывает второй системный алерт.

@MainActor
@Observable
final class PermissionManager {
    enum Status: Equatable { case unknown, granted, denied }
    private(set) var status: [PermissionKey: Status] = [:]
    /// Порядок фактически показанных системных промптов — журнал доступов для сверки.
    private(set) var promptLog: [PermissionKey] = []

    func status(_ key: PermissionKey) -> Status { status[key] ?? .unknown }

    /// Запрос доступа. Идемпотентен: если статус уже известен, системный алерт не показывается.
    func request(_ key: PermissionKey) async -> Bool {
        if let s = status[key], s != .unknown { return s == .granted }
        promptLog.append(key)
        let granted = await perform(key)
        status[key] = granted ? .granted : .denied
        return granted
    }

    private func perform(_ key: PermissionKey) async -> Bool {
        switch key {
        case .camera:
            return await AVCaptureDevice.requestAccess(for: .video)
        case .mic:
            return await withCheckedContinuation { c in
                AVAudioApplication.requestRecordPermission { c.resume(returning: $0) }
            }
        case .speech:
            return await withCheckedContinuation { c in
                SFSpeechRecognizer.requestAuthorization { c.resume(returning: $0 == .authorized) }
            }
        case .photo:
            let s = await PHPhotoLibrary.requestAuthorization(for: .readWrite)
            return s == .authorized || s == .limited
        case .location:
            return await LocationRequester.shared.request()
        case .push:
            return (try? await UNUserNotificationCenter.current()
                .requestAuthorization(options: [.alert, .sound, .badge])) ?? false
        case .tracking:
            let s = await ATTrackingManager.requestTrackingAuthorization()
            return s == .authorized
        case .localnet:
            return await LocalNetworkProbe.trigger()
        case .audio:
            // entitlement, не запрос: настраиваем сессию воспроизведения.
            try? AVAudioSession.sharedInstance().setCategory(.playback)
            return true
        }
    }
}

// CoreLocation требует делегата для колбэка авторизации.
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
            self.cont = c
            self.manager.delegate = self
            self.manager.requestWhenInUseAuthorization()
        }
    }
    func locationManagerDidChangeAuthorization(_ m: CLLocationManager) {
        guard m.authorizationStatus != .notDetermined, let c = cont else { return }
        cont = nil
        c.resume(returning: m.authorizationStatus == .authorizedWhenInUse
                 || m.authorizationStatus == .authorizedAlways)
    }
}

// Локальная сеть: системный промпт показывается, когда приложение реально
// начинает искать сервисы Bonjour. Ищем _googlecast._tcp — как для показа урока на ТВ.
private enum LocalNetworkProbe {
    static func trigger() async -> Bool {
        let browser = NWBrowser(for: .bonjour(type: "_googlecast._tcp", domain: nil),
                                using: .init())
        browser.start(queue: .main)
        try? await Task.sleep(nanoseconds: 1_500_000_000)
        browser.cancel()
        return true // системный запрос показан; наличие устройств — отдельный вопрос
    }
}
