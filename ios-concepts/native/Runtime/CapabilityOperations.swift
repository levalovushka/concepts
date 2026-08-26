import AVFoundation
import AuthenticationServices
import CallKit
import ContactsUI
import CoreLocation
import EventKit
import Intents
import MediaPlayer
import PhotosUI
import Security
import Speech
import UIKit
import UserNotifications

/// Общие post-authorization операции полного capability pack.
/// Product Kernel вызывает их только после `Permissions.request`; приложения
/// получают одну проверенную реализацию вместо генерации платформенного кода.
@MainActor
enum NativeCapabilityOperations {
  private static var audioPlayer: AVPlayer?
  private static var photoDelegate: NativePhotoPickerDelegate?
  private static var contactDelegate: NativeContactPickerDelegate?
  private static var locationDelegate: NativeLocationResultDelegate?

  static func perform(_ key: String) async -> Bool {
    if ProcessInfo.processInfo.environment["NATIVE_UI_TESTING"] == "1" { return true }
    switch key {
    case "camera": return true  // Camera completion belongs to NativeV2CameraPicker.
    case "photos": return await pickPhoto()
    case "mic": return await recordVoiceSample()
    case "speech": return await recognizeVoiceSample()
    case "location": return await requestLocationResult()
    case "contacts": return await pickContact()
    case "calendar": return await saveCalendarTurn()
    case "push": return await scheduleTurnNotification()
    case "commnotif": return await donateCommunicationIntent()
    case "appgroups": return writeSharedDraft()
    case "keychain": return verifySharedKeychainRecord()
    case "audio": return startBackgroundPlaybackContext()
    case "voip": return await startCallKitCall()
    case "associateddomains": return true  // Completion is handled by onOpenURL.
    default: return true  // Authorization/runtime adapter in Permissions is the operation.
    }
  }

  static func handle(url: URL) {
    UserDefaults.standard.set(url.absoluteString, forKey: "lastUniversalLink")
  }

  private static func topController() -> UIViewController? {
    let root = UIApplication.shared.connectedScenes
      .compactMap { ($0 as? UIWindowScene)?.keyWindow?.rootViewController }
      .first
    var current = root
    while let presented = current?.presentedViewController { current = presented }
    return current
  }

  private static func pickPhoto() async -> Bool {
    await withCheckedContinuation { continuation in
      var configuration = PHPickerConfiguration(photoLibrary: .shared())
      configuration.filter = .images
      configuration.selectionLimit = 1
      let picker = PHPickerViewController(configuration: configuration)
      let delegate = NativePhotoPickerDelegate { success in
        photoDelegate = nil
        continuation.resume(returning: success)
      }
      photoDelegate = delegate
      picker.delegate = delegate
      guard let controller = topController() else {
        photoDelegate = nil
        continuation.resume(returning: false)
        return
      }
      controller.present(picker, animated: true)
    }
  }

  private static func pickContact() async -> Bool {
    await withCheckedContinuation { continuation in
      let picker = CNContactPickerViewController()
      let delegate = NativeContactPickerDelegate { success in
        contactDelegate = nil
        continuation.resume(returning: success)
      }
      contactDelegate = delegate
      picker.delegate = delegate
      guard let controller = topController() else {
        contactDelegate = nil
        continuation.resume(returning: false)
        return
      }
      controller.present(picker, animated: true)
    }
  }

  private static func recordVoiceSample() async -> Bool {
    let url = FileManager.default.temporaryDirectory.appendingPathComponent("native-v2-voice.m4a")
    let settings: [String: Any] = [
      AVFormatIDKey: Int(kAudioFormatMPEG4AAC), AVSampleRateKey: 12_000,
      AVNumberOfChannelsKey: 1, AVEncoderAudioQualityKey: AVAudioQuality.medium.rawValue,
    ]
    guard let recorder = try? AVAudioRecorder(url: url, settings: settings), recorder.record()
    else { return false }
    try? await Task.sleep(for: .milliseconds(250))
    recorder.stop()
    return FileManager.default.fileExists(atPath: url.path)
  }

  private static func recognizeVoiceSample() async -> Bool {
    guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "ru-RU")) else {
      return false
    }
    let request = SFSpeechAudioBufferRecognitionRequest()
    request.endAudio()
    return await withCheckedContinuation { continuation in
      var resumed = false
      _ = recognizer.recognitionTask(with: request) { _, error in
        guard !resumed else { return }
        resumed = true
        continuation.resume(returning: error == nil)
      }
    }
  }

  private static func requestLocationResult() async -> Bool {
    await withCheckedContinuation { continuation in
      let delegate = NativeLocationResultDelegate { success in
        locationDelegate = nil
        continuation.resume(returning: success)
      }
      locationDelegate = delegate
      delegate.requestLocation()
    }
  }

  private static func scheduleTurnNotification() async -> Bool {
    let content = UNMutableNotificationContent()
    content.title = "Эстафета продолжается"
    content.body = "Знакомый передал вам следующий ход"
    let request = UNNotificationRequest(
      identifier: "native-v2-turn", content: content,
      trigger: UNTimeIntervalNotificationTrigger(timeInterval: 5, repeats: false)
    )
    return await withCheckedContinuation { continuation in
      UNUserNotificationCenter.current().add(request) { continuation.resume(returning: $0 == nil) }
    }
  }

  private static func donateCommunicationIntent() async -> Bool {
    let person = INPerson(
      personHandle: INPersonHandle(value: "relay-friend", type: .unknown), nameComponents: nil,
      displayName: "Друг", image: nil, contactIdentifier: nil, customIdentifier: "relay-friend")
    let intent = INSendMessageIntent(
      recipients: [person], outgoingMessageType: .outgoingMessageText,
      content: "Твой ход в эстафете", speakableGroupName: nil, conversationIdentifier: "relay",
      serviceName: "Эстафета", sender: nil, attachments: nil)
    return await withCheckedContinuation { continuation in
      INInteraction(intent: intent, response: nil).donate {
        continuation.resume(returning: $0 == nil)
      }
    }
  }

  private static func saveCalendarTurn() async -> Bool {
    let store = EKEventStore()
    let event = EKEvent(eventStore: store)
    event.title = "Мой ход в эстафете"
    event.startDate = Date().addingTimeInterval(3600)
    event.endDate = event.startDate.addingTimeInterval(1800)
    event.calendar = store.defaultCalendarForNewEvents
    do {
      try store.save(event, span: .thisEvent)
      return true
    } catch { return false }
  }

  private static func writeSharedDraft() -> Bool {
    guard let bundleID = Bundle.main.bundleIdentifier,
      let defaults = UserDefaults(suiteName: "group.\(bundleID)")
    else { return false }
    defaults.set("relay-draft", forKey: "sharedDraft")
    return defaults.synchronize()
  }

  private static func verifySharedKeychainRecord() -> Bool {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: "native-v2-session",
      kSecAttrAccount as String: "current",
    ]
    let value = Data("active".utf8)
    let update = SecItemUpdate(
      query as CFDictionary, [kSecValueData as String: value] as CFDictionary)
    if update == errSecItemNotFound {
      var insertion = query
      insertion[kSecValueData as String] = value
      guard SecItemAdd(insertion as CFDictionary, nil) == errSecSuccess else { return false }
    } else if update != errSecSuccess {
      return false
    }
    return SecItemCopyMatching(query as CFDictionary, nil) == errSecSuccess
  }

  private static func startBackgroundPlaybackContext() -> Bool {
    audioPlayer = AVPlayer(playerItem: nil)
    MPNowPlayingInfoCenter.default().nowPlayingInfo = [
      MPMediaItemPropertyTitle: "Продолжения эстафеты"
    ]
    audioPlayer?.play()
    return true
  }

  private static func startCallKitCall() async -> Bool {
    let action = CXStartCallAction(
      call: UUID(), handle: CXHandle(type: .generic, value: "relay-friend"))
    return await withCheckedContinuation { continuation in
      CXCallController().request(CXTransaction(action: action)) {
        continuation.resume(returning: $0 == nil)
      }
    }
  }
}

private final class NativePhotoPickerDelegate: NSObject, PHPickerViewControllerDelegate {
  let completion: (Bool) -> Void
  init(completion: @escaping (Bool) -> Void) { self.completion = completion }
  func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
    picker.dismiss(animated: true)
    guard let provider = results.first?.itemProvider, provider.canLoadObject(ofClass: UIImage.self)
    else {
      completion(false)
      return
    }
    provider.loadObject(ofClass: UIImage.self) { object, _ in
      DispatchQueue.main.async { self.completion(object is UIImage) }
    }
  }
}

private final class NativeContactPickerDelegate: NSObject, CNContactPickerDelegate {
  let completion: (Bool) -> Void
  init(completion: @escaping (Bool) -> Void) { self.completion = completion }
  func contactPicker(_ picker: CNContactPickerViewController, didSelect contacts: [CNContact]) {
    completion(!contacts.isEmpty)
  }
  func contactPickerDidCancel(_ picker: CNContactPickerViewController) { completion(false) }
}

private final class NativeLocationResultDelegate: NSObject, CLLocationManagerDelegate {
  private let manager = CLLocationManager()
  private let completion: (Bool) -> Void
  init(completion: @escaping (Bool) -> Void) { self.completion = completion }
  func requestLocation() {
    manager.delegate = self
    manager.requestLocation()
  }
  func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    completion(!locations.isEmpty)
  }
  func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
    completion(false)
  }
}
