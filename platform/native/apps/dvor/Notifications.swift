import SwiftUI

struct HouseNotificationsScreen: View {
    @Environment(HouseStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var read = Set<String>()
    @AppStorage("dvor.notifications.read") private var readStorage = ""
    /// Часть уведомлений прочитана заранее — так выглядит живой список.
    private static let allNotificationIDs: Set<String> = [
        "matter-status", "chat-message", "meter-deadline", "parking-reply",
        "event-meeting", "matter-resolved", "new-neighbour", "guest-network", "chronicle-shared",
    ]
    private static let preReadIDs: Set<String> = ["event-meeting", "new-neighbour", "chronicle-shared"]

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                if DvorShotMode.isScreen("notifications", state: "empty") {
                    AppStatePanel(kind: .empty, title: "Новых уведомлений нет", detail: "Ответы, изменения статусов и сроки появятся здесь.")
                        .padding(.horizontal, 16)
                } else {
                    // Уведомления живого приложения разложены по времени, и часть
                    // из них уже прочитана: три непрочитанных подряд — витрина.
                    notificationSection("Сегодня")
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
                    ) {
                        nav.push(DvorRoute.chat(store.conversations[2]))
                    }
                    RowSeparator(leading: 68)
                    notificationRow(
                        id: "meter-deadline", avatar: nil,
                        title: "Показания нужно передать до 25 августа",
                        detail: "Черновик уже сохранён на этом iPhone"
                    ) { nav.push(DvorRoute.meters) }
                    RowSeparator(leading: 68)
                    notificationRow(
                        id: "parking-reply", avatar: "Сергей Бабин",
                        title: "Ответил в «Парковке во дворе»",
                        detail: "«Разметку обещают в сентябре» · 3 часа назад"
                    ) { nav.push(DvorRoute.chat(store.conversations[1])) }

                    notificationSection("Вчера")
                    notificationRow(
                        id: "event-meeting", avatar: nil, icon: "calendar",
                        title: "Собрание жильцов 30 августа",
                        detail: "Повестка: домофон, парковка, детская площадка"
                    ) { nav.push(DvorRoute.events) }
                    RowSeparator(leading: 68)
                    notificationRow(
                        id: "matter-resolved", avatar: "Елена Соколова",
                        title: "Дело «Разбитая лампа у входа» решено",
                        detail: "Закрыто мастером · вчера, 18:40"
                    ) {
                        if let matter = store.matters.first {
                            nav.push(DvorRoute.matter(matter))
                        }
                    }

                    notificationSection("На этой неделе")
                    notificationRow(
                        id: "new-neighbour", avatar: "Ксения Дан",
                        title: "Новый сосед подтвердил адрес",
                        detail: "кв. 52 · вторник"
                    ) { nav.push(DvorRoute.neighbours) }
                    RowSeparator(leading: 68)
                    notificationRow(
                        id: "guest-network", avatar: nil, icon: "wifi",
                        title: "Пароль гостевой сети обновлён",
                        detail: "Старый перестанет работать в пятницу · понедельник"
                    ) { nav.push(DvorRoute.guest) }
                    RowSeparator(leading: 68)
                    notificationRow(
                        id: "chronicle-shared", avatar: "Марина Швец",
                        title: "Поделилась снимками субботника",
                        detail: "6 фотографий · понедельник"
                    ) { nav.push(DvorRoute.chronicle) }
                }
            }
        }
        .background(DvorStyle.card)
        .vkNavigation("Уведомления") {
            if read.count < Self.allNotificationIDs.count && !DvorShotMode.isScreen("notifications", state: "empty") {
                Button("Прочитать всё") { read = Self.allNotificationIDs }
                    .font(.system(size: 14, weight: .medium))
                    .nativeAction("notifications.mark-all-read")
            }
        }
        .task {
            let stored = Set(readStorage.split(separator: ",").map(String.init))
            read = stored.isEmpty ? Self.preReadIDs : stored
        }
        .onChange(of: read) { _, value in readStorage = value.sorted().joined(separator: ",") }
    }

    private func notificationSection(_ title: String) -> some View {
        HStack {
            Text(title).font(.role(.groupHeader)).foregroundStyle(t.textSecondary)
            Spacer()
        }
        .padding(.horizontal, t.pad).padding(.top, 16).padding(.bottom, 6)
    }

    private func notificationRow(
        id: String, avatar: String?, icon: String = "gauge.with.dots.needle.bottom.50percent",
        title: String, detail: String, action: @escaping () -> Void
    ) -> some View {
        Button {
            read.insert(id)
            action()
        } label: {
            HStack(alignment: .top, spacing: 12) {
                if let avatar {
                    Avatar(name: avatar, size: 40)
                } else {
                    Image(systemName: icon)
                        .font(.system(size: 20, weight: .medium)).foregroundStyle(t.accent)
                        .frame(width: 40, height: 40)
                }
                VStack(alignment: .leading, spacing: 4) {
                    HStack(alignment: .firstTextBaseline, spacing: 8) {
                        Text(title).font(.role(.name)).foregroundStyle(t.textPrimary)
                        Spacer(minLength: 4)
                        if !read.contains(id) { Circle().fill(t.accent).frame(width: 7, height: 7) }
                    }
                    Text(detail).font(.role(.meta)).foregroundStyle(t.textSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            .padding(.horizontal, 16).padding(.vertical, 12).contentShape(Rectangle())
        }
        .buttonStyle(HighlightStyle())
        .nativeAction("notifications.open-source")
    }
}
