import SwiftUI

// «Меню» — сетка сервисов ВК, настройки и экраны, отрабатывающие доступы:
// контакты, реклама вместо подписки, замок, виджет, автозаполнение,
// фоновое обновление и гостевая сеть площадки.

struct MenuScreen: View {
    @Environment(TailsStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                Button { nav.push(TailsRoute.pet(store.me)) } label: {
                    HStack(spacing: 12) {
                        Avatar(name: store.me.name, size: 56)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(store.me.name).textStyle(.cardTitle)
                            Text("\(store.me.breed) · \(store.me.owner)").textStyle(.meta)
                        }
                        Spacer()
                        Image(systemName: "chevron.right").font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(t.textTertiary)
                    }
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
                    .contentShape(Rectangle())
                }
                .buttonStyle(HighlightStyle())
                GroupGap()

                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 0), count: 4), spacing: 16) {
                    VKServiceTile(title: "Прогулки", icon: "figure.walk",
                                  colors: ["FF8A65", "F4511E"]) { nav.push(TailsRoute.walks) }
                    VKServiceTile(title: "Площадки", icon: "tree.fill",
                                  colors: ["42B883", "1E9E63"]) { nav.push(TailsRoute.places) }
                    VKServiceTile(title: "Знакомые", icon: "person.2.fill",
                                  colors: ["5B7CFA", "3D5AFE"]) { nav.push(TailsRoute.mates) }
                    VKServiceTile(title: "Здоровье", icon: "syringe.fill",
                                  colors: ["E0719A", "C2185B"]) { nav.push(TailsRoute.vaccine) }
                    VKServiceTile(title: "Курс", icon: "headphones",
                                  colors: ["A78BFA", "7C4DFF"]) { nav.push(TailsRoute.course) }
                    VKServiceTile(title: "Ветпаспорт", icon: "lock.fill",
                                  colors: ["2ECC71", "10A05A"]) { nav.push(TailsRoute.lock) }
                    VKServiceTile(title: "Обновление", icon: "arrow.clockwise",
                                  colors: ["5AA9E6", "2E7BC4"]) { nav.push(TailsRoute.refresh) }
                    VKServiceTile(title: "Настройки", icon: "gearshape.fill",
                                  colors: ["A9B0BA", "838B95"]) { nav.push(TailsRoute.settings) }
                }
                .padding(.horizontal, 10).padding(.top, 14).padding(.bottom, 18)
                GroupGap()

                VKSectionHeader(title: "Прогулки недели", action: "Все") { nav.push(TailsRoute.walks) }
                ForEach(store.walks.prefix(3)) { walk in
                    Button { nav.push(TailsRoute.walk(walk)) } label: {
                        VKRow(title: walk.place, subtitle: "\(walk.when) · \(walk.state.rawValue)",
                              icon: "figure.walk")
                    }
                    .buttonStyle(HighlightStyle())
                    RowSeparator(leading: 60)
                }
                Color.clear.frame(height: 88)
            }
        }
        .background(t.background)
        .rootHeaderBar {
            VKTabHeader(title: "Меню", avatar: store.me.name,
                        avatarAction: { nav.push(TailsRoute.pet(store.me)) }) { EmptyView() }
        }
    }
}

// MARK: - Настройки

struct SettingsScreen: View {
    @Environment(TailsStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.theme) private var t
    @AppStorage("tails.push") private var pushEnabled = false
    @AppStorage("tails.background") private var backgroundEnabled = false
    @State private var hydrating = true

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                VStack(spacing: 8) {
                    Avatar(name: store.me.name, size: 96).padding(.top, 12)
                    Text(store.me.owner).textStyle(.cardTitle)
                    Text("nika@mail.ru").textStyle(.meta)
                    VKOutlineButton(title: "Управление аккаунтом", tinted: false) {
                        nav.push(TailsRoute.mates)
                    }
                        .padding(.horizontal, t.pad).padding(.top, 6).padding(.bottom, 4)
                }
                .frame(maxWidth: .infinity)
                GroupGap()

                VKRow(title: "Уведомления", subtitle: "ответы и изменения прогулки",
                      icon: "bell", toggle: $pushEnabled)
                RowSeparator()
                VKRow(title: "Обновлять ленту в фоне", subtitle: "свежие прогулки к запуску",
                      icon: "arrow.clockwise", toggle: $backgroundEnabled)
                RowSeparator()
                Button { nav.push(TailsRoute.refresh) } label: {
                    VKRow(title: "Фоновая задача", subtitle: "когда приложение обновляется само", icon: "clock.arrow.circlepath")
                }
                .buttonStyle(HighlightStyle())
                GroupGap()

                Button { nav.push(TailsRoute.lock) } label: {
                    VKRow(title: "Замок на ветпаспорте", subtitle: "Face ID при открытии", icon: "faceid")
                }
                .buttonStyle(HighlightStyle())
                RowSeparator()
                Button { nav.push(TailsRoute.ads) } label: {
                    VKRow(title: "Реклама и данные", subtitle: "вместо платной подписки", icon: "megaphone")
                }
                .buttonStyle(HighlightStyle())
                RowSeparator()
                Button {
                    Task {
                        await perms.request(.appgroups)
                        await perms.request(.keychain)
                        nav.toast("Добавьте виджет долгим нажатием на экране «Домой»")
                    }
                } label: {
                    VKRow(title: "Виджет ближайшей прогулки", subtitle: "на экран «Домой»", icon: "square.grid.2x2")
                }
                .buttonStyle(HighlightStyle())
                RowSeparator()
                Button {
                    Task {
                        await perms.request(.autofill)
                        nav.toast("Включите «Хвосты» в Настройках → Пароли")
                    }
                } label: {
                    VKRow(title: "Пароли и автозаполнение", subtitle: "вход на сайт клиники", icon: "key")
                }
                .buttonStyle(HighlightStyle())
                RowSeparator()
                Button {
                    Task {
                        await perms.request(.shareext)
                        nav.toast("Включите «Хвосты» в меню «Поделиться» → Ещё")
                    }
                } label: {
                    VKRow(title: "Поделиться в «Хвосты»", subtitle: "объявление из Safari и «Фото»",
                          icon: "square.and.arrow.up")
                }
                .buttonStyle(HighlightStyle())
                GroupGap()

                VKRow(title: "Питомцев в районе", icon: "pawprint", value: "\(store.petCount)", chevron: false)
                RowSeparator()
                VKRow(title: "Версия", icon: "info.circle", value: "1.0", chevron: false)
                Color.clear.frame(height: 40)
            }
        }
        .background(t.background)
        .vkNavigation("Настройки")
        .task { hydrating = false }
        .onChange(of: pushEnabled) { _, enabled in
            guard !hydrating, enabled else { return }
            Task {
                let ok = await perms.request(.push)
                if ok { await perms.request(.commnotif) } else {
                    pushEnabled = false
                    nav.toast("Уведомления выключены в настройках", once: "push")
                }
            }
        }
        .onChange(of: backgroundEnabled) { _, enabled in
            guard !hydrating, enabled else { return }
            Task {
                // Фоновая задача регистрируется на своём экране: правило
                // «один доступ — одна точка запроса».
                let fetch = await perms.request(.fetch)
                if !fetch {
                    backgroundEnabled = false
                    nav.toast("Лента обновится при открытии", once: "fetch")
                } else {
                    nav.push(TailsRoute.refresh)
                }
            }
        }
    }
}

// MARK: - Знакомые

struct MatesScreen: View {
    @Environment(TailsStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.theme) private var t
    @State private var query = ""
    @State private var added: Set<String> = []

    private let maybe: [(String, String, String)] = [
        ("Аня и Рада", "из ваших контактов", "гуляют у пруда по утрам"),
        ("Гриша и Ёжик", "живёт в соседнем подъезде", "такса, 4 года"),
    ]
    private let mine: [(String, String)] = [
        ("Марк и Тоша", "метис · 7 лет"),
        ("Даша и Мира", "шпиц · 1 год"),
        ("Лена и Гриша", "кот · 5 лет"),
        ("Оля, догситтер", "передержка на выходные"),
        ("Соня и Джек", "лабрадор · 2 года"),
        ("Тимур и Луна", "хаски · 3 года"),
    ]

    private var isDenied: Bool {
        ShotMode.isScreen("mates", state: "denied") || perms.status(.contacts) == .denied
    }

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                VKSearchField(placeholder: "Поиск", text: $query)
                    .padding(.horizontal, t.pad).padding(.top, 8).padding(.bottom, 12)

                if isDenied {
                    AppStatePanel(kind: .warning, title: "Контакты недоступны",
                                  detail: "Ищите по кличке или площадке — остальное работает как обычно.")
                        .padding(.horizontal, t.pad).padding(.bottom, 12)
                } else if perms.status(.contacts) != .granted {
                    VKOutlineButton(title: "Импорт телефонной книги", icon: "phone") {
                        Task {
                            let ok = await perms.request(.contacts)
                            if !ok { nav.toast("Ищите по кличке в поиске", once: "contacts") }
                        }
                    }
                    .padding(.horizontal, t.pad).padding(.bottom, 6)
                } else {
                    VKRow(title: "Контакты подключены", subtitle: "7 человек из книги уже гуляют рядом",
                          icon: "checkmark.circle", chevron: false)
                }
                GroupGap()

                if ShotMode.isScreen("mates", state: "empty") {
                    AppStatePanel(kind: .empty, title: "Знакомых пока нет",
                                  detail: "Присоединитесь к прогулке — так знакомятся быстрее всего.")
                        .padding(t.pad)
                } else {
                    VKSectionHeader(title: "Возможные знакомые")
                    ForEach(maybe, id: \.0) { person in
                        VKPersonRow(name: person.0, subtitle: person.1, mutualText: person.2) {
                            if added.contains(person.0) {
                                Text("Заявка отправлена").textStyle(.meta)
                            } else {
                                VKRowAction(icon: "person.crop.circle.badge.plus", label: "Добавить") {
                                    withAnimation { _ = added.insert(person.0) }
                                }
                            }
                        }
                        RowSeparator()
                    }
                    GroupGap()
                    VKSectionHeader(title: "Мои знакомые", count: "\(mine.count)")
                    ForEach(mine.filter { query.isEmpty || $0.0.localizedCaseInsensitiveContains(query) }, id: \.0) { person in
                        VKPersonRow(name: person.0, subtitle: person.1) {
                            VKRowAction(icon: "bubble.left", label: "Написать \(person.0)") {
                                nav.push(TailsRoute.chat(store.dialogs[0]))
                            }
                        }
                        RowSeparator()
                    }
                }
                Color.clear.frame(height: 40)
            }
        }
        .background(t.background)
        .vkNavigation("Знакомые")
    }
}
