import SwiftUI

@main
struct TailsApp: App {
    @UIApplicationDelegateAdaptor(NativeAppDelegate.self) private var appDelegate
    var body: some Scene { WindowGroup { ManifestConceptRootView() } }
}
