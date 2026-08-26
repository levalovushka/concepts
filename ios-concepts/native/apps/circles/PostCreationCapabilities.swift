import SwiftUI
import UIKit
import AVFoundation
import Speech
import PhotosUI
import CoreLocation
import MapKit
import MediaPlayer

@MainActor
@Observable
final class CirclesPostDraftCapabilities {
    private enum CaptureMode { case voice, dictation }

    var mediaData: Data?
    var voiceURL: URL?
    var voiceDuration: TimeInterval = 0
    var place = ""
    var isRecording = false
    var isDictating = false
    var message: String?

    private let recorder = CirclesAudioCapture()
    private var mode: CaptureMode?

    func attachMedia(_ data: Data?) {
        guard let data, UIImage(data: data) != nil else {
            message = "Не удалось прочитать изображение. Выберите другой файл."
            return
        }
        mediaData = data
        message = "Фото прикреплено к черновику"
    }

    func toggleVoice(using permissions: Permissions) async {
        if mode == .voice {
            guard let recording = recorder.stop() else { return }
            voiceURL = recording.url
            voiceDuration = recording.duration
            mode = nil
            isRecording = false
            message = "Голосовое прикреплено к черновику"
            return
        }
        guard mode == nil else { return }
        guard await authorizeMicrophone(using: permissions) else {
            message = "Микрофон выключен. Публикацию можно оставить текстом."
            return
        }
        do {
            try recorder.start(prefix: "circles-voice")
            mode = .voice
            isRecording = true
            message = "Идёт запись — нажмите ещё раз, чтобы закончить"
        } catch {
            message = "Не удалось начать запись. Введите сообщение текстом."
        }
    }

    func toggleDictation(using permissions: Permissions) async -> String? {
        if mode == .dictation {
            guard let recording = recorder.stop() else { return nil }
            mode = nil
            isDictating = false
            message = "Распознаём запись…"
            do {
                let transcript = try await recorder.transcribe(recording.url)
                message = "Текст добавлен — его можно отредактировать"
                return transcript
            } catch {
                message = "Не удалось распознать речь. Черновик можно заполнить вручную."
                return nil
            }
        }
        guard mode == nil else { return nil }
        guard await authorizeMicrophone(using: permissions), await permissions.request(.speech) else {
            message = "Диктовка недоступна. Введите текст вручную."
            return nil
        }
        do {
            try recorder.start(prefix: "circles-dictation")
            mode = .dictation
            isDictating = true
            message = "Говорите — нажмите ещё раз, когда закончите"
        } catch {
            message = "Не удалось включить диктовку. Введите текст вручную."
        }
        return nil
    }

    func resolvePlace(using permissions: Permissions) async {
        guard await permissions.request(.location) else {
            message = "Геопозиция выключена. Укажите место вручную."
            return
        }
        do {
            let result = try await CirclesLocationResolver().resolve()
            place = result
            message = "Место прикреплено к черновику"
        } catch {
            message = "Не удалось определить место. Укажите его вручную."
        }
    }

    func clearMedia() { mediaData = nil }
    func clearVoice() {
        if let voiceURL { try? FileManager.default.removeItem(at: voiceURL) }
        voiceURL = nil
        voiceDuration = 0
    }

    private func authorizeMicrophone(using permissions: Permissions) async -> Bool {
        permissions.isGranted(.mic) ? true : await permissions.request(.mic)
    }
}

@MainActor
private final class CirclesAudioCapture {
    struct Recording { let url: URL; let duration: TimeInterval }
    private var recorder: AVAudioRecorder?
    private var recognitionTask: SFSpeechRecognitionTask?

    func start(prefix: String) throws {
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.record, mode: .spokenAudio)
        try session.setActive(true)
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("\(prefix)-\(UUID().uuidString).m4a")
        recorder = try AVAudioRecorder(
            url: url,
            settings: [
                AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
                AVSampleRateKey: 16_000,
                AVNumberOfChannelsKey: 1,
                AVEncoderAudioQualityKey: AVAudioQuality.medium.rawValue,
            ]
        )
        guard recorder?.record() == true else { throw CirclesCapabilityError.operationFailed }
    }

    func stop() -> Recording? {
        guard let recorder else { return nil }
        let result = Recording(url: recorder.url, duration: max(recorder.currentTime, 0.1))
        recorder.stop()
        self.recorder = nil
        try? AVAudioSession.sharedInstance().setActive(false)
        return result
    }

    func transcribe(_ url: URL) async throws -> String {
        guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "ru-RU")), recognizer.isAvailable else {
            throw CirclesCapabilityError.operationFailed
        }
        let request = SFSpeechURLRecognitionRequest(url: url)
        request.requiresOnDeviceRecognition = recognizer.supportsOnDeviceRecognition
        return try await withCheckedThrowingContinuation { continuation in
            var completed = false
            let timeout = DispatchWorkItem {
                guard !completed else { return }
                completed = true
                self.recognitionTask?.cancel()
                continuation.resume(throwing: CirclesCapabilityError.operationFailed)
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 15, execute: timeout)
            recognitionTask = recognizer.recognitionTask(with: request) { result, error in
                guard !completed else { return }
                if let error {
                    completed = true
                    timeout.cancel()
                    continuation.resume(throwing: error)
                } else if let result, result.isFinal {
                    completed = true
                    timeout.cancel()
                    continuation.resume(returning: result.bestTranscription.formattedString)
                }
            }
        }
    }
}

private enum CirclesCapabilityError: Error { case operationFailed }

@MainActor
@Observable
final class CirclesAudioPlayback: NSObject, AVAudioPlayerDelegate {
    private var player: AVAudioPlayer?
    private(set) var isPlaying = false

    func toggle(url: URL, title: String) -> Bool {
        if isPlaying {
            player?.stop()
            finish()
            return false
        }
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playback)
            try session.setActive(true)
            player = try AVAudioPlayer(contentsOf: url)
            player?.delegate = self
            guard player?.play() == true else { throw CirclesCapabilityError.operationFailed }
            isPlaying = true
            MPNowPlayingInfoCenter.default().nowPlayingInfo = [
                MPMediaItemPropertyTitle: title,
                MPMediaItemPropertyArtist: "Круги",
                MPMediaItemPropertyPlaybackDuration: player?.duration ?? 0,
                MPNowPlayingInfoPropertyPlaybackRate: 1,
            ]
            return true
        } catch {
            finish()
            return false
        }
    }

    nonisolated func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        Task { @MainActor in self.finish() }
    }

    private func finish() {
        isPlaying = false
        player = nil
        MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
        try? AVAudioSession.sharedInstance().setActive(false)
    }
}

@MainActor
private final class CirclesLocationResolver: NSObject, @preconcurrency CLLocationManagerDelegate {
    private let manager = CLLocationManager()
    private var continuation: CheckedContinuation<CLLocation, Error>?

    func resolve() async throws -> String {
        let location = try await withCheckedThrowingContinuation { continuation in
            self.continuation = continuation
            manager.delegate = self
            manager.desiredAccuracy = kCLLocationAccuracyHundredMeters
            manager.requestLocation()
        }
        guard let request = MKReverseGeocodingRequest(location: location) else {
            throw CirclesCapabilityError.operationFailed
        }
        request.preferredLocale = Locale(identifier: "ru-RU")
        let mapItems = try await request.mapItems
        if let name = mapItems.first?.name, !name.isEmpty { return name }
        return String(format: "%.5f, %.5f", location.coordinate.latitude, location.coordinate.longitude)
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last, let continuation else { return }
        self.continuation = nil
        continuation.resume(returning: location)
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        guard let continuation else { return }
        self.continuation = nil
        continuation.resume(throwing: error)
    }
}

struct CirclesCameraPicker: UIViewControllerRepresentable {
    @Binding var imageData: Data?
    @Environment(\.dismiss) private var dismiss

    func makeCoordinator() -> Coordinator { Coordinator(parent: self) }
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.delegate = context.coordinator
        return picker
    }
    func updateUIViewController(_ controller: UIImagePickerController, context: Context) {}

    final class Coordinator: NSObject, UINavigationControllerDelegate, UIImagePickerControllerDelegate {
        let parent: CirclesCameraPicker
        init(parent: CirclesCameraPicker) { self.parent = parent }
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            if let image = info[.originalImage] as? UIImage { parent.imageData = image.jpegData(compressionQuality: 0.86) }
            parent.dismiss()
        }
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) { parent.dismiss() }
    }
}

struct CirclesPhotoLibraryPicker: UIViewControllerRepresentable {
    @Binding var imageData: Data?
    @Environment(\.dismiss) private var dismiss

    func makeCoordinator() -> Coordinator { Coordinator(parent: self) }
    func makeUIViewController(context: Context) -> PHPickerViewController {
        var configuration = PHPickerConfiguration(photoLibrary: .shared())
        configuration.selectionLimit = 1
        configuration.filter = .images
        let picker = PHPickerViewController(configuration: configuration)
        picker.delegate = context.coordinator
        return picker
    }
    func updateUIViewController(_ controller: PHPickerViewController, context: Context) {}

    final class Coordinator: NSObject, PHPickerViewControllerDelegate {
        let parent: CirclesPhotoLibraryPicker
        init(parent: CirclesPhotoLibraryPicker) { self.parent = parent }
        func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
            guard let provider = results.first?.itemProvider else { parent.dismiss(); return }
            provider.loadDataRepresentation(forTypeIdentifier: "public.image") { data, _ in
                Task { @MainActor in
                    self.parent.imageData = data
                    self.parent.dismiss()
                }
            }
        }
    }
}
