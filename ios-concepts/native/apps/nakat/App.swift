import SwiftUI

@main
struct NakatApp: App {
    @UIApplicationDelegateAdaptor(NativeAppDelegate.self) private var appDelegate
    var body: some Scene { WindowGroup { ManifestConceptRootView() } }
}
