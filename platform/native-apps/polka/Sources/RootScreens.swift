import SwiftUI

struct ShelfView: View {
    @Environment(PolkaStore.self) private var store
    @State private var category = "Всё"
    private let columns = [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)]
    private let categories = ["Всё", "Выезд", "Дом", "Инструменты", "Игры"]

    private var visibleItems: [LoanItem] {
        category == "Всё" ? store.items : store.items.filter { $0.category == category }
    }

    var body: some View {
        PolkaPage(spacing: 16) {
            RootTitle(title: "Полка", subtitle: "\(store.me.city) · только друзья") {
                CircleIconButton(icon: "plus", label: "Добавить вещь") { store.showAdd = true }
            }

            ScrollView(.horizontal) {
                HStack(spacing: 8) {
                    ForEach(categories, id: \.self) { item in
                        Button { category = item } label: {
                            Text(item)
                                .font(.system(size: 14, weight: category == item ? .semibold : .regular))
                                .foregroundStyle(category == item ? .white : D.ink)
                                .padding(.horizontal, 13)
                                .frame(height: 36)
                                .background(category == item ? D.accent : D.card, in: Capsule())
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .scrollIndicators(.hidden)

            if let featured = store.items.first(where: \.featured) {
                SectionTitle(title: "На эти выходные")
                NavigationLink(value: PolkaRoute.item(featured.id)) {
                    FeaturedItemCard(item: featured)
                }
                .buttonStyle(.plain)
            }

            SectionTitle(title: "У друзей рядом", action: "Карта") {
                store.show("На карте — 12 вещей друзей")
            }
            LazyVGrid(columns: columns, spacing: 10) {
                ForEach(visibleItems.filter { !$0.featured }) { item in
                    NavigationLink(value: PolkaRoute.item(item.id)) {
                        ItemTile(item: item)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .toolbar(.hidden, for: .navigationBar)
        .accessibilityIdentifier("screen.shelf")
    }
}

struct DiscoverView: View {
    @Environment(PolkaStore.self) private var store
    @Environment(AccessStore.self) private var access
    @State private var query = ""
    private let categories: [(String, String, String)] = [
        ("Выезд", "tent.fill", "395C88"), ("Инструменты", "hammer.fill", "D67A22"),
        ("Дом", "house.fill", "19B394"), ("Игры", "puzzlepiece.fill", "7C5CE7")
    ]

    private var results: [LoanItem] {
        guard !query.isEmpty else { return store.items }
        return store.items.filter {
            $0.title.localizedCaseInsensitiveContains(query) || $0.category.localizedCaseInsensitiveContains(query)
        }
    }

    var body: some View {
        PolkaPage(spacing: 18) {
            RootTitle("Поиск", subtitle: "среди \(store.me.friends) друзей")
            SearchField(text: $query)

            Button {
                Task {
                    let ok = await access.request([.tracking], on: "discover")
                    store.show(ok ? "Подборки настроены под ваши интересы" : Access.tracking.fallback)
                }
            } label: {
                HStack(spacing: 11) {
                    Image(systemName: "wand.and.stars").foregroundStyle(D.accent).frame(width: 30)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Настроить подборки").font(.system(size: 15, weight: .semibold))
                        Text("Сначала объясним, затем спросит iOS").font(.system(size: 12)).foregroundStyle(D.sub)
                    }
                    Spacer()
                    Image(systemName: "chevron.right").foregroundStyle(D.mute)
                }
                .foregroundStyle(D.ink).padding(13)
                .background(D.accent.opacity(0.07), in: RoundedRectangle(cornerRadius: 15))
            }
            .buttonStyle(.plain)

            SectionTitle(title: "Категории")
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                ForEach(categories, id: \.0) { item in
                    Button { query = item.0 } label: {
                        HStack(spacing: 10) {
                            Image(systemName: item.1)
                                .font(.system(size: 18, weight: .medium))
                                .foregroundStyle(.white)
                                .frame(width: 38, height: 38)
                                .background(Color(hex: item.2).gradient, in: RoundedRectangle(cornerRadius: 11))
                            Text(item.0)
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundStyle(D.ink)
                                .lineLimit(1)
                            Spacer(minLength: 0)
                        }
                        .padding(10)
                        .background(D.card, in: RoundedRectangle(cornerRadius: 15, style: .continuous))
                    }
                    .buttonStyle(.plain)
                }
            }

            SectionTitle(title: query.isEmpty ? "Часто берут" : "Найдено: \(results.count)")
            VStack(spacing: 10) {
                ForEach(results.prefix(5)) { item in
                    NavigationLink(value: PolkaRoute.item(item.id)) {
                        HStack(spacing: 12) {
                            ItemArtwork(item: item, height: 78, cornerRadius: 13)
                                .frame(width: 92)
                            VStack(alignment: .leading, spacing: 4) {
                                Text(item.title).font(.system(size: 16, weight: .semibold)).foregroundStyle(D.ink)
                                Text(item.owner).font(.system(size: 13)).foregroundStyle(D.sub)
                                Text(item.availability).font(.system(size: 12)).foregroundStyle(D.green).lineLimit(1)
                            }
                            Spacer()
                            Image(systemName: "chevron.right").font(.system(size: 13, weight: .semibold)).foregroundStyle(D.mute)
                        }
                        .padding(10)
                        .background(D.card, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .toolbar(.hidden, for: .navigationBar)
        .accessibilityIdentifier("screen.discover")
    }
}

struct RequestsView: View {
    @Environment(PolkaStore.self) private var store

    private var visible: [LoanRequest] {
        store.requests.filter { store.showsIncomingRequests ? $0.incoming : !$0.incoming }
    }

    var body: some View {
        @Bindable var store = store
        PolkaPage(spacing: 16) {
            RootTitle("Запросы", subtitle: "ответы и сроки возврата")

            Picker("Тип запроса", selection: $store.showsIncomingRequests) {
                Text("Входящие ·1").tag(true)
                Text("Мои ·2").tag(false)
            }
            .pickerStyle(.segmented)

            if store.showsIncomingRequests {
                HStack(alignment: .top, spacing: 10) {
                    Image(systemName: "sparkles").foregroundStyle(D.accent)
                    Text("Антон указал даты и зачем ему вещь. Можно ответить одним касанием.")
                        .font(.system(size: 13)).foregroundStyle(D.sub)
                }
                .padding(13)
                .background(D.accent.opacity(0.08), in: RoundedRectangle(cornerRadius: 14))
            }

            ForEach(visible) { request in
                RequestCard(request: request)
            }
        }
        .toolbar(.hidden, for: .navigationBar)
        .accessibilityIdentifier("screen.requests")
    }
}

private struct RequestCard: View {
    let request: LoanRequest
    @Environment(PolkaStore.self) private var store
    @State private var accepted = false

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 11) {
                PolkaAvatar(initials: request.initials, color: request.incoming ? "4868C9" : "7C5CE7", size: 44)
                VStack(alignment: .leading, spacing: 2) {
                    Text(request.person).font(.system(size: 16, weight: .semibold)).foregroundStyle(D.ink)
                    Text(request.status).font(.system(size: 13)).foregroundStyle(request.status == "подтверждено" ? D.green : D.sub)
                }
                Spacer()
                Image(systemName: request.incoming ? "arrow.down.left" : "arrow.up.right")
                    .foregroundStyle(D.mute)
            }

            VStack(alignment: .leading, spacing: 5) {
                Text(request.item).font(.system(size: 19, weight: .bold)).foregroundStyle(D.ink)
                Label(request.dates, systemImage: "calendar")
                    .font(.system(size: 14)).foregroundStyle(D.sub)
            }

            if request.incoming && !accepted {
                HStack(spacing: 8) {
                    PrimaryButton(title: "Отклонить", quiet: true) { store.show("Запрос отклонён") }
                    PrimaryButton(title: "Дать", icon: "checkmark") {
                        accepted = true
                        store.show("Передача создана")
                    }
                }
            } else if accepted || request.id == "confirmed" {
                NavigationLink(value: PolkaRoute.handoff(request.id)) {
                    HStack {
                        Label("Код и место передачи", systemImage: "checkmark.circle.fill")
                        Spacer()
                        Image(systemName: "chevron.right")
                    }
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(D.accent)
                    .padding(.vertical, 4)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(15)
        .background(D.card, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
    }
}

struct ProfileView: View {
    @Environment(PolkaStore.self) private var store
    @Environment(AccessStore.self) private var access
    private let columns = [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)]

    var body: some View {
        PolkaPage(spacing: 16) {
            RootTitle(title: "Профиль") {
                CircleIconButton(icon: "gearshape", label: "Настройки") { store.show("Настройки открыты") }
            }

            VStack(spacing: 14) {
                PolkaAvatar(initials: store.me.initials, color: "2688EB", size: 82)
                VStack(spacing: 3) {
                    Text(store.me.name).font(.system(size: 23, weight: .bold)).foregroundStyle(D.ink)
                    Text("\(store.me.city) · полка видна друзьям")
                        .font(.system(size: 14)).foregroundStyle(D.sub)
                }
                HStack(spacing: 0) {
                    stat("\(store.me.friends)", "друзей")
                    Divider().frame(height: 38)
                    stat("7", "вещей")
                    Divider().frame(height: 38)
                    stat("12", "передач")
                }
                PrimaryButton(title: "Добавить вещь", icon: "plus") { store.showAdd = true }
            }
            .padding(18)
            .background(D.card, in: RoundedRectangle(cornerRadius: 20, style: .continuous))

            SectionTitle(title: "Моя полка", action: "Все 7") {}
            LazyVGrid(columns: columns, spacing: 10) {
                ForEach(store.items.prefix(4)) { item in ItemTile(item: item) }
            }

            SectionTitle(title: "Доверие")
            HStack(spacing: 12) {
                Image(systemName: "checkmark.shield.fill")
                    .font(.system(size: 24)).foregroundStyle(D.green)
                VStack(alignment: .leading, spacing: 2) {
                    Text("12 вещей вернуты вовремя").font(.system(size: 15, weight: .semibold))
                    Text("Это видят только ваши друзья").font(.system(size: 13)).foregroundStyle(D.sub)
                }
            }
            .padding(15)
            .background(D.card, in: RoundedRectangle(cornerRadius: 16))

            SectionTitle(title: "Полка работает сама")
            VStack(spacing: 0) {
                capabilityRow("person.crop.circle.badge.plus", "Найти друзей", "по контактам, либо пригласить ссылкой") {
                    Task {
                        let ok = await access.request([.contacts], on: "profile")
                        store.show(ok ? "Нашли 6 друзей в Полке" : Access.contacts.fallback)
                    }
                }
                Divider().padding(.leading, 56)
                capabilityRow("arrow.clockwise", "Обновлять доступность", "подготовить полку и сроки в фоне") {
                    Task {
                        let fetch = await access.request([.fetch], on: "profile")
                        let task = await access.request([.bgtask], on: "profile")
                        store.show(fetch && task ? "Фоновое обновление включено" : Access.bgtask.fallback)
                    }
                }
            }
            .background(D.card, in: RoundedRectangle(cornerRadius: 16))
        }
        .toolbar(.hidden, for: .navigationBar)
        .accessibilityIdentifier("screen.profile")
    }

    private func stat(_ value: String, _ label: String) -> some View {
        VStack(spacing: 2) {
            Text(value).font(.system(size: 20, weight: .bold)).foregroundStyle(D.ink)
            Text(label).font(.system(size: 12)).foregroundStyle(D.sub)
        }
        .frame(maxWidth: .infinity)
    }

    private func capabilityRow(_ icon: String, _ title: String, _ subtitle: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon).font(.system(size: 18)).foregroundStyle(D.accent).frame(width: 32)
                VStack(alignment: .leading, spacing: 2) {
                    Text(title).font(.system(size: 15, weight: .semibold)).foregroundStyle(D.ink)
                    Text(subtitle).font(.system(size: 12)).foregroundStyle(D.sub)
                }
                Spacer()
                Image(systemName: "chevron.right").font(.system(size: 12, weight: .semibold)).foregroundStyle(D.mute)
            }
            .padding(13)
        }
        .buttonStyle(.plain)
    }
}
