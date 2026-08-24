import SwiftUI

@main
struct PeresmenkaApp: App {
    @UIApplicationDelegateAdaptor(NativeAppDelegate.self) private var appDelegate
    var body: some Scene { WindowGroup { ManifestConceptRootView() } }
}
