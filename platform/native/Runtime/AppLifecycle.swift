import UIKit
import UserNotifications
import BackgroundTasks

/// System callbacks that SwiftUI does not surface on `App` itself. A remote
/// notification capability is not considered wired until the APNs token and
/// registration failure are observable by the product layer.
final class NativeAppDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        UNUserNotificationCenter.current().delegate = self
        if let bundleID = Bundle.main.bundleIdentifier {
            BGTaskScheduler.shared.register(
                forTaskWithIdentifier: "\(bundleID).refresh",
                using: nil
            ) { task in
                task.setTaskCompleted(success: true)
            }
        }
        return true
    }

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        UserDefaults.standard.set(deviceToken.map { String(format: "%02x", $0) }.joined(), forKey: "native.apnsToken")
        UserDefaults.standard.removeObject(forKey: "native.apnsRegistrationError")
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        UserDefaults.standard.set(error.localizedDescription, forKey: "native.apnsRegistrationError")
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.banner, .sound, .badge])
    }
}
