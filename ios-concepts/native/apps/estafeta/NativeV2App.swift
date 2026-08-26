import SwiftUI

@main
struct EstafetaApp: App {
    @State private var store = NativeV2ProductStore()
    @State private var permissions = Permissions()
    @State private var session = NativeV2Session()
    private let visualLanguage = NativeVisualLanguage.resolve(NativeConceptSpec.design)

    var body: some Scene {
        WindowGroup {
            Group {
                if session.isAuthenticated {
                    NativeV2ProductRoot()
                } else {
                    NativeEmailAuth(
                        productName: "Эстафета",
                        persistencePromise: "профиль и ваши действия",
                        initialSurface: NativeV2Capture.surface,
                        captureState: NativeV2Capture.state,
                        emailActionID: NativeV2ShellAction.email,
                        codeActionID: NativeV2ShellAction.code,
                        codeFailureActionID: NativeV2ShellAction.codeFailure
                    ) { session.signIn() }
                }
            }
            .background(NativeV2CaptureProbe(store: store))
            .onOpenURL { NativeCapabilityOperations.handle(url: $0) }
            .environment(store)
            .environment(permissions)
            .environment(\.visualLanguage, visualLanguage)
            .tint(visualLanguage.palette.accent)
            .preferredColorScheme(.light)
        }
    }
}

private enum NativeV2ShellAction {
    static let email = "shell.login.request-email-code"
    static let code = "shell.login.verify-email-code"
    static let codeFailure = "shell.login.invalid-code"
}

@MainActor @Observable
private final class NativeV2Session {
    var isAuthenticated = NativeV2Capture.skipsAuthentication
    func signIn() { isAuthenticated = true }
}

enum NativeV2Capture {
    static let surface = argument(after: "-shot")
    static let state = argument(after: "-state") ?? "populated/default"
    static let skipsAuthentication = surface.map { $0 != "login" } ?? false
    static func route() -> ProductRoute? { surface.flatMap(ProductRoute.init(rawValue:)) }
    static func initialTab(_ roots: [String]) -> String {
        guard let first = roots.first else { return "feed" }
        return surface.flatMap { roots.contains($0) ? $0 : nil } ?? first
    }

    private static func argument(after key: String) -> String? {
        let values = ProcessInfo.processInfo.arguments
        guard let index = values.firstIndex(of: key), values.indices.contains(index + 1) else { return nil }
        return values[index + 1]
    }
}

private struct NativeV2CaptureProbe: View {
    let store: NativeV2ProductStore
    var body: some View {
        GeometryReader { proxy in
            Color.clear.task {
                let frame = proxy.frame(in: .global)
                CaptureIdentity.report(surface: NativeV2Capture.surface ?? store.route.rawValue, state: NativeV2Capture.state)
                CaptureIdentity.reportLayout(
                    viewportWidth: proxy.size.width, viewportHeight: proxy.size.height,
                    contentMinX: frame.minX, contentMaxX: frame.maxX,
                    contentMinY: frame.minY, contentMaxY: frame.maxY
                )
            }
        }
        .allowsHitTesting(false)
    }
}
