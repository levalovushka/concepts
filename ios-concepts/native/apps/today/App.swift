import SwiftUI

@main
struct TodayApp: App {
    @UIApplicationDelegateAdaptor(NativeAppDelegate.self) private var appDelegate
    var body: some Scene { WindowGroup { ManifestConceptRootView() } }
}
