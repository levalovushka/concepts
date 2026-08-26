import UIKit
import UserNotifications
import BackgroundTasks

/// System callbacks that SwiftUI does not surface on `App` itself. A remote
/// notification capability is not considered wired until the APNs token and
/// registration failure are observable by the product layer.
final class NativeAppDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {
    private let refreshKey = "native.lastBackgroundRefresh"

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        UNUserNotificationCenter.current().delegate = self
        if let bundleID = Bundle.main.bundleIdentifier {
            BGTaskScheduler.shared.register(
                forTaskWithIdentifier: "\(bundleID).refresh",
                using: nil
            ) { [weak self] task in
                guard let refreshTask = task as? BGAppRefreshTask else {
                    task.setTaskCompleted(success: false)
                    return
                }
                self?.scheduleRefresh()
                self?.refreshVisibleSnapshot {
                    refreshTask.setTaskCompleted(success: true)
                }
            }
        }
        return true
    }

    private func scheduleRefresh() {
        guard let bundleID = Bundle.main.bundleIdentifier else { return }
        let request = BGAppRefreshTaskRequest(identifier: "\(bundleID).refresh")
        request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60)
        try? BGTaskScheduler.shared.submit(request)
    }

    private func refreshVisibleSnapshot(completion: @escaping () -> Void) {
        // Product adapters can observe this timestamp and replace the local refresh
        // with their repository sync. The lifecycle always completes deterministically.
        UserDefaults.standard.set(Date().timeIntervalSince1970, forKey: refreshKey)
        completion()
    }

    func application(
        _ application: UIApplication,
        performFetchWithCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
    ) {
        refreshVisibleSnapshot { completionHandler(.newData) }
    }

    func application(
        _ application: UIApplication,
        didReceiveRemoteNotification userInfo: [AnyHashable: Any],
        fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
    ) {
        refreshVisibleSnapshot { completionHandler(.newData) }
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
