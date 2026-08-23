import SwiftUI

// Навигация и оболочка. Детерминированная часть: роли экранов, стек, снекбар.

@MainActor
@Observable
final class Nav {
    var tab: String
    var paths: [String: NavigationPath] = [:]
    var sheet: AnyRoute?
    var cover: AnyRoute?
    var toastText: String?
    private var toastShown = Set<String>()

    init(initialTab: String) {
        tab = initialTab
    }

    func path(_ tab: String) -> Binding<NavigationPath> {
        Binding(get: { self.paths[tab] ?? NavigationPath() },
                set: { self.paths[tab] = $0 })
    }
    func push<R: Hashable>(_ route: R) {
        var p = paths[tab] ?? NavigationPath()
        p.append(route)
        paths[tab] = p
    }
    func pop() {
        var p = paths[tab] ?? NavigationPath()
        guard !p.isEmpty else { return }
        p.removeLast()
        paths[tab] = p
    }
    func present<R: Hashable>(sheet route: R) { sheet = AnyRoute(route) }
    func present<R: Hashable>(cover route: R) { cover = AnyRoute(route) }
    func dismiss() { sheet = nil; cover = nil }

    func toast(_ text: String, once key: String? = nil) {
        if let key {
            if toastShown.contains(key) { return }
            toastShown.insert(key)
        }
        withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) { toastText = text }
        Task {
            try? await Task.sleep(nanoseconds: 2_600_000_000)
            if toastText == text {
                withAnimation(.easeOut(duration: 0.25)) { toastText = nil }
            }
        }
    }
}

/// Обёртка, чтобы презентовать любой Hashable-маршрут через .sheet(item:)
struct AnyRoute: Identifiable, Hashable {
    let id: String
    private let box: AnyHashable
    init<R: Hashable>(_ r: R) { box = AnyHashable(r); id = String(describing: r) }
    func value<R: Hashable>(_ type: R.Type) -> R? { box as? R }
    static func == (a: AnyRoute, b: AnyRoute) -> Bool { a.id == b.id }
    func hash(into h: inout Hasher) { h.combine(id) }
}

// MARK: - Снекбар

struct ToastOverlay: View {
    let text: String?
    @Environment(\.theme) private var t
    var body: some View {
        if let text {
            Text(text)
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(.white)
                .padding(.horizontal, 16).padding(.vertical, 12)
                .background(Color.black.opacity(0.86), in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                .padding(.horizontal, 16)
                .transition(.move(edge: .bottom).combined(with: .opacity))
        }
    }
}
