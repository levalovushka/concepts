import SwiftUI

struct HouseNotificationsScreen: View {
    @Environment(HouseStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.visualLanguage) private var t
    @State private var read = Set<String>()
    @AppStorage("dvor.notifications.read") private var readStorage = ""

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                if DvorShotMode.isScreen("notifications", state: "empty") {
                    AppStatePanel(kind: .empty, title: "Новых уведомлений нет", detail: "Ответы, изменения статусов и сроки появятся здесь.")
                        .padding(.horizontal, t.spacing.contentInset)
                } else {
                    notificationRow(
                        id: "matter-status", avatar: "Анна Котова",
                        title: "Заявку по свету приняли",
                        detail: "Электрик придёт до завтра · 12 минут назад"
                    ) {
                        if let incident = store.matters.first(where: { $0.kind == .incident }) {
                            nav.push(DvorRoute.matter(incident))
                        }
                    }
                    RowSeparator(leading: 68)
                    notificationRow(
                        id: "chat-message", avatar: "Михаил Орлов",
                        title: "Новое сообщение во втором подъезде",
                        detail: "«Вечером проверю лампу» · 34 минуты назад"
                    ) { nav.push(DvorRoute.chat(store.conversations[1])) }
                    RowSeparator(leading: 68)
                    notificationRow(
                        id: "meter-deadline", avatar: nil,
                        title: "Показания нужно передать до 25 августа",
                        detail: "Черновик уже сохранён на этом iPhone"
                    ) { nav.push(DvorRoute.meters) }
                }
            }
        }
        .background(t.palette.surface)
        .vkNavigation("Уведомления") {
            if read.count < 3 && !DvorShotMode.isScreen("notifications", state: "empty") {
                Button("Прочитать всё") { read = ["matter-status", "chat-message", "meter-deadline"] }
                    .font(.role(.pill))
                    .nativeAction("notifications.mark-all-read")
            }
        }
        .task { read = Set(readStorage.split(separator: ",").map(String.init)) }
        .onChange(of: read) { _, value in readStorage = value.sorted().joined(separator: ",") }
    }

    private func notificationRow(
        id: String, avatar: String?, title: String, detail: String, action: @escaping () -> Void
    ) -> some View {
        Button {
            read.insert(id)
            action()
        } label: {
            HStack(alignment: .top, spacing: t.spacing.x3) {
                if let avatar {
                    Avatar(name: avatar, size: 40)
                } else {
                    Image(systemName: "gauge.with.dots.needle.bottom.50percent")
                        .font(.system(size: 20, weight: t.icons.weight))
                        .foregroundStyle(t.palette.accent)
                        .frame(width: 40, height: 40)
                }
                VStack(alignment: .leading, spacing: t.spacing.x1) {
                    HStack(alignment: .firstTextBaseline, spacing: t.spacing.x2) {
                        Text(title).font(.role(.name)).foregroundStyle(t.palette.textPrimary)
                        Spacer(minLength: t.spacing.x1)
                        if !read.contains(id) { Circle().fill(t.palette.accent).frame(width: 7, height: 7) }
                    }
                    Text(detail).font(.role(.meta)).foregroundStyle(t.palette.textSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            .padding(.horizontal, t.spacing.contentInset)
            .padding(.vertical, t.spacing.x3)
            .contentShape(Rectangle())
        }
        .buttonStyle(HighlightStyle())
        .nativeAction("notifications.open-source")
    }
}
