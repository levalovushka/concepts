import SwiftUI

// Навигация выводится из типов экранов: push складывается в стек вкладки,
// sheet/modal и fullscreen — презентуются поверх.

@MainActor
@Observable
final class Router {
    var selectedTab: String
    var paths: [String: [String]] = [:]
    var presentedPath: [String] = []   // стек push внутри презентованного потока
    var sheetScreen: String?
    var coverScreen: String?
    var snack: String?
    private var snackShownOnce: Set<String> = []

    init(startTab: String) {
        self.selectedTab = startTab
    }

    func path(for tab: String) -> Binding<[String]> {
        Binding(
            get: { self.paths[tab] ?? [] },
            set: { self.paths[tab] = $0 }
        )
    }

    /// Открыть экран согласно его типу.
    func open(_ screen: ScreenSpec) {
        let presenting = sheetScreen != nil || coverScreen != nil
        switch screen.kind {
        case .push, .root:
            if presenting { presentedPath.append(screen.id) }
            else { paths[selectedTab, default: []].append(screen.id) }
        case .sheet, .modal:
            sheetScreen = screen.id
        case .fullscreen, .system:
            coverScreen = screen.id
        }
    }

    func back() {
        if !(paths[selectedTab]?.isEmpty ?? true) {
            paths[selectedTab]?.removeLast()
        }
    }

    func dismissPresented() {
        sheetScreen = nil
        coverScreen = nil
        presentedPath = []
    }

    func toast(_ message: String, once: Bool = false, id: String = "") {
        if once {
            if snackShownOnce.contains(id) { return }
            snackShownOnce.insert(id)
        }
        snack = message
        Task {
            try? await Task.sleep(nanoseconds: 2_500_000_000)
            if self.snack == message { self.snack = nil }
        }
    }
}
