import SwiftUI

// «Рядом» — прогулки и площадки района. Точка запроса геопозиции: без неё
// список остаётся, но сортируется по городу, а не по расстоянию.

struct NearbyScreen: View {
    @Environment(TailsStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.theme) private var t
    @State private var filter = 0
    @State private var query = ""

    private var isEmpty: Bool { ShotMode.isScreen("nearby", state: "empty") }
    private var isDenied: Bool {
        ShotMode.isScreen("nearby", state: "denied") || perms.status(.location) == .denied
    }

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                VKSearchField(placeholder: "Площадка, порода или кличка", text: $query)
                    .padding(.horizontal, t.pad).padding(.bottom, 10)

                VKFilterPills(items: [("Все", "line.3.horizontal.decrease"),
                                      ("Прогулки", "figure.walk"),
                                      ("Площадки", "tree"),
                                      ("Сейчас", "clock")], selection: $filter)
                    .padding(.bottom, 12)

                if perms.status(.location) != .granted && !isDenied {
                    locationPrompt
                    GroupGap()
                }
                if isDenied {
                    AppStatePanel(kind: .warning, title: "Геопозиция выключена",
                                  detail: "Показываем прогулки по району, но без расстояния и сортировки по близости.")
                        .padding(.horizontal, t.pad).padding(.bottom, 12)
                }

                if isEmpty {
                    AppStatePanel(kind: .empty, title: "Рядом пока никого",
                                  detail: "Заведите прогулку — соседи с собаками увидят её в ленте района.")
                        .padding(t.pad)
                } else {
                    VKSectionHeader(title: "Прогулки", count: "\(store.walks.count)")
                    ForEach(store.walks) { walk in
                        Button { nav.push(TailsRoute.walk(walk)) } label: { walkRow(walk) }
                            .buttonStyle(HighlightStyle())
                        RowSeparator(leading: 68)
                    }
                    GroupGap()
                    VKSectionHeader(title: "Площадки рядом", action: "Все") {
                        nav.push(TailsRoute.places)
                    }
                    ForEach(store.places.prefix(3)) { place in
                        Button { nav.push(TailsRoute.places) } label: {
                            VKRow(title: place.title,
                                  subtitle: "\(place.kind) · \(place.detail)",
                                  icon: place.hasNetwork ? "wifi" : "tree",
                                  value: perms.isGranted(.location) ? place.distance : nil)
                        }
                        .buttonStyle(HighlightStyle())
                        RowSeparator(leading: 60)
                    }
                }
                Color.clear.frame(height: 88)
            }
        }
        .background(t.background)
        .rootHeaderBar {
            VKTabHeader(title: "Рядом", avatar: store.me.name,
                        avatarAction: { nav.push(TailsRoute.pet(store.me)) }) {
                Button { nav.push(TailsRoute.netqr) } label: { Image(systemName: "qrcode.viewfinder") }
                    .accessibilityLabel("Сеть площадки по QR")
            }
        }
    }

    private var locationPrompt: some View {
        VStack(alignment: .leading, spacing: 12) {
            Image(systemName: "location.circle.fill").font(.system(size: 32)).foregroundStyle(t.accent)
            Text("Показать прогулки поблизости").textStyle(.section)
            Text("Геопозиция нужна, чтобы отсортировать прогулки по расстоянию и подсказать площадку по пути. Без неё покажем весь район.")
                .textStyle(.body).foregroundStyle(t.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
            VKButton(title: "Разрешить геопозицию", icon: "location.fill") {
                Task {
                    let ok = await perms.request(.location)
                    if !ok { nav.toast("Показываем весь район", once: "location") }
                }
            }
        }
        .padding(t.pad)
    }

    private func walkRow(_ walk: Walk) -> some View {
        HStack(spacing: 12) {
            ZStack {
                Circle().fill(walk.state == .now ? t.positive.opacity(0.14) : t.accentSoft)
                    .frame(width: 44, height: 44)
                Image(systemName: walk.state == .done ? "checkmark" : "figure.walk")
                    .font(.system(size: 18))
                    .foregroundStyle(walk.state == .now ? t.positive : t.accent)
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(walk.place).textStyle(.rowTitle)
                Text("\(walk.when) · \(walk.suits)").textStyle(.meta).lineLimit(1)
                HStack(spacing: -8) {
                    ForEach(walk.pets.prefix(4), id: \.self) { pet in
                        Avatar(name: pet, size: 20)
                            .overlay(Circle().stroke(t.background, lineWidth: 1.5))
                    }
                    Text(tailsPlural(walk.pets.count, "питомец", "питомца", "питомцев"))
                        .textStyle(.meta).padding(.leading, 14)
                }
            }
            Spacer(minLength: 8)
            if perms.isGranted(.location) {
                Text(walk.distance).textStyle(.meta)
            }
            Image(systemName: "chevron.right").font(.system(size: 14, weight: .semibold))
                .foregroundStyle(t.textTertiary)
        }
        .padding(.horizontal, t.pad).padding(.vertical, 10)
        .contentShape(Rectangle())
    }
}

// MARK: - Площадки

struct PlacesScreen: View {
    @Environment(TailsStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                if ShotMode.isScreen("places", state: "denied") {
                    AppStatePanel(kind: .warning, title: "Без геопозиции",
                                  detail: "Список площадок остаётся, расстояние покажем после разрешения.")
                        .padding(t.pad)
                }
                if ShotMode.isScreen("places", state: "empty") {
                    AppStatePanel(kind: .empty, title: "Площадок рядом нет",
                                  detail: "Отметьте площадку, которой пользуетесь, — она появится у соседей.")
                        .padding(t.pad)
                }
                ForEach(ShotMode.isScreen("places", state: "empty") ? [] : store.places) { place in
                    VStack(alignment: .leading, spacing: 0) {
                        HStack(spacing: 12) {
                            Image(systemName: place.hasNetwork ? "wifi" : "tree")
                                .font(.system(size: 20)).foregroundStyle(t.accent)
                                .frame(width: 44, height: 44)
                                .background(t.accentSoft, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                            VStack(alignment: .leading, spacing: 2) {
                                Text(place.title).textStyle(.rowTitle)
                                Text(place.kind).textStyle(.meta)
                            }
                            Spacer(minLength: 8)
                            if perms.isGranted(.location) { Text(place.distance).textStyle(.meta) }
                        }
                        Text(place.detail).textStyle(.meta)
                            .padding(.leading, 56).padding(.top, 2)
                        if place.hasNetwork {
                            Button { nav.push(TailsRoute.netqr) } label: {
                                Label("Подключиться к сети площадки", systemImage: "qrcode.viewfinder")
                                    .textStyle(.action)
                            }
                            .buttonStyle(.plain)
                            .padding(.leading, 56).padding(.top, 6)
                        }
                    }
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
                    RowSeparator(leading: 68)
                }
                Color.clear.frame(height: 40)
            }
        }
        .background(t.background)
        .vkNavigation("Площадки рядом")
    }
}

// MARK: - Все прогулки

struct WalksScreen: View {
    @Environment(TailsStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.theme) private var t

    private var grouped: [(String, [Walk])] {
        [("Сейчас", store.walks.filter { $0.state == .now }),
         ("Собираются", store.walks.filter { $0.state == .planned }),
         ("Прошли", store.walks.filter { $0.state == .done })]
            .filter { !$0.1.isEmpty }
    }

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                ForEach(grouped, id: \.0) { group in
                    VKSectionHeader(title: group.0, count: "\(group.1.count)")
                    ForEach(group.1) { walk in
                        Button { nav.push(TailsRoute.walk(walk)) } label: {
                            VKRow(title: walk.place,
                                  subtitle: "\(walk.when) · подходит: \(walk.suits)",
                                  icon: walk.state == .done ? "checkmark" : "figure.walk",
                                  value: perms.isGranted(.location) ? walk.distance : nil)
                        }
                        .buttonStyle(HighlightStyle())
                        .opacity(walk.state == .done ? 0.6 : 1)
                        RowSeparator(leading: 60)
                    }
                }
                Color.clear.frame(height: 40)
            }
        }
        .background(t.background)
        .vkNavigation("Прогулки района")
    }
}
