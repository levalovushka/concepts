import SwiftUI

@main
struct PolkaApp: App {
    @State private var store = PolkaStore()
    @State private var access = AccessStore()

    var body: some Scene {
        WindowGroup {
            PolkaRoot()
                .environment(store)
                .environment(access)
                .tint(D.accent)
                .preferredColorScheme(.light)
        }
    }
}

struct PolkaRoot: View {
    @Environment(PolkaStore.self) private var store

    var body: some View {
        @Bindable var store = store
        if let captureScreen = store.captureScreen {
            captureView(captureScreen)
        } else {
            appTabs
        }
    }

    @ViewBuilder
    private func captureView(_ screen: String) -> some View {
        switch screen {
        case "item":
            NavigationStack { ItemDetailView(itemID: "tent") }
        case "handoff":
            NavigationStack { HandoffView(requestID: "confirmed") }
        case "request":
            RequestSheet(item: store.selectedItem)
        case "add":
            AddItemSheet()
        default:
            appTabs
        }
    }

    private var appTabs: some View {
        @Bindable var store = store
        return ZStack(alignment: .bottom) {
            TabView(selection: $store.tab) {
                Tab("Полка", systemImage: "rectangle.stack", value: PolkaTab.shelf) {
                    PolkaStack { ShelfView() }
                }
                Tab("Поиск", systemImage: "magnifyingglass", value: PolkaTab.discover) {
                    PolkaStack { DiscoverView() }
                }
                Tab("Запросы", systemImage: "bubble.left.and.bubble.right", value: PolkaTab.requests) {
                    PolkaStack { RequestsView() }
                }
                .badge(1)
                Tab("Профиль", systemImage: "person.crop.circle", value: PolkaTab.profile) {
                    PolkaStack { ProfileView() }
                }
            }
            .tabBarMinimizeBehavior(.onScrollDown)

            if let toast = store.toast {
                Text(toast)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 11)
                    .background(.black.opacity(0.84), in: Capsule())
                    .padding(.bottom, 92)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .animation(.snappy(duration: 0.22), value: store.toast)
        .sheet(isPresented: $store.showRequest) { RequestSheet(item: store.selectedItem) }
        .sheet(isPresented: $store.showAdd) { AddItemSheet() }
    }
}

struct PolkaStack<Root: View>: View {
    @ViewBuilder var root: Root

    var body: some View {
        NavigationStack {
            root
                .navigationDestination(for: PolkaRoute.self) { route in
                    switch route {
                    case .item(let id): ItemDetailView(itemID: id)
                    case .handoff(let id): HandoffView(requestID: id)
                    }
                }
        }
    }
}
