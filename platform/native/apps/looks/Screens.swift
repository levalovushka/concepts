import SwiftUI

// MARK: - Рядом: свопы и встречи (гео)

struct NearbyScreen: View {
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.theme) private var t
    @State private var filter = 0

    var body: some View {
        VStack(spacing: 0) {
            VKFilterPills(items: [("Все", "line.3.horizontal.decrease"), ("Свопы", "arrow.left.arrow.right"),
                                ("Барахолки", "bag"), ("Встречи", "person.2")], selection: $filter)
                .scrollClipDisabled()
                .padding(.vertical, 10)
                .background(t.card)

            ScrollView {
                LazyVStack(spacing: 0) {
                    if perms.status(.location) != .granted {
                        VKGroup {
                            VStack(alignment: .leading, spacing: 12) {
                                Image(systemName: "location.circle.fill")
                                    .font(.system(size: 34)).foregroundStyle(t.accent)
                                Text("Показать свопы поблизости")
                                    .font(.system(size: 18, weight: .semibold)).foregroundStyle(t.textPrimary)
                                Text("Нужна геопозиция, чтобы отсортировать встречи по расстоянию. Без неё покажем всё по городу")
                                    .font(.vkBody).foregroundStyle(t.textSecondary)
                                    .fixedSize(horizontal: false, vertical: true)
                                VKButton(title: "Разрешить геопозицию", icon: "location.fill") {
                                    Task {
                                        let ok = await perms.request(.location)
                                        if !ok { nav.toast("Показываем свопы по городу", once: "location") }
                                    }
                                }
                            }
                            .padding(16)
                        }
                    }
                    ForEach(store.events) { e in
                        Button { nav.push(LooksRoute.event(e)) } label: { EventCard(event: e) }
                            .buttonStyle(.plain)
                    }
                }

                .padding(.bottom, 72)
            }
            .background(t.background)
        }
        .background(t.background)
        .vkNavigation("Свопы рядом")
    }
}

private struct EventCard: View {
    let event: NearbyEvent
    @Environment(Permissions.self) private var perms
    @Environment(\.theme) private var t
    var body: some View {
        VKGroup {
            VKMedia(assetName: LooksMediaAssets.event(event.going), height: 140)
            VStack(alignment: .leading, spacing: 8) {
                Text(event.title).font(.system(size: 17, weight: .semibold)).foregroundStyle(t.textPrimary)
                HStack(spacing: 6) {
                    Image(systemName: "calendar").font(.system(size: 13))
                    Text(event.when)
                    Text("·")
                    Text(event.place).lineLimit(1)
                }
                .font(.vkMeta).foregroundStyle(t.textSecondary)
                HStack(spacing: 8) {
                    Label(perms.isGranted(.location) ? event.distance : "в городе", systemImage: "location.fill")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(t.accent)
                        .padding(.horizontal, 10).frame(height: 28)
                        .background(t.accentSoft, in: Capsule())
                    Text("\(event.going) идут").font(.vkMeta).foregroundStyle(t.textSecondary)
                    Spacer()
                }
            }
            .padding(12)
        }
    }
}

struct EventScreen: View {
    let event: NearbyEvent
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.theme) private var t
    @State private var going = false

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                VKGroup {
                    VKMedia(assetName: LooksMediaAssets.swap, height: 180)
                    VStack(alignment: .leading, spacing: 10) {
                        Text(event.title).font(.vkSection).foregroundStyle(t.textPrimary)
                        InfoRow(icon: "calendar", text: event.when)
                        InfoRow(icon: "mappin.and.ellipse", text: event.place)
                        InfoRow(icon: "person.2.fill", text: peopleGoing(event.going))
                    }
                    .padding(12)
                }
                VKGroup {
                    Text("Организатор")
                        .font(.system(size: 13, weight: .medium)).foregroundStyle(t.textSecondary)
                        .padding(.horizontal, 12).padding(.top, 12).padding(.bottom, 8)
                    HStack(spacing: 12) {
                        Avatar(name: "Аня Котова", size: 40)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Аня Котова").font(.system(size: 15, weight: .medium))
                            Text("собрала 12 свопов за год").font(.vkMeta).foregroundStyle(t.textSecondary)
                        }
                        Spacer()
                        Button {
                            nav.push(LooksRoute.chat(store.dialogs[0]))
                        } label: {
                            Text("Написать").font(.system(size: 14, weight: .medium))
                                .foregroundStyle(t.accent)
                                .padding(.horizontal, 12).frame(height: 30)
                                .background(t.accentSoft, in: Capsule())
                        }
                        .buttonStyle(.plain)
                    }
                    .padding(.horizontal, 12).padding(.bottom, 12)
                }
                VKGroup {
                    Text("Что приносить")
                        .font(.system(size: 13, weight: .medium)).foregroundStyle(t.textSecondary)
                        .padding(.horizontal, 12).padding(.top, 12).padding(.bottom, 6)
                    ForEach(["Верх и платья — в чистом виде",
                             "Обувь без следов носки",
                             "Аксессуары любые"], id: \.self) { r in
                        HStack(alignment: .top, spacing: 10) {
                            Image(systemName: "circle.fill").font(.system(size: 5))
                                .foregroundStyle(t.textTertiary).padding(.top, 7)
                            Text(r).font(.vkBody).foregroundStyle(t.textPrimary)
                            Spacer()
                        }
                        .padding(.horizontal, 12).padding(.vertical, 5)
                    }
                    Color.clear.frame(height: 8)
                }
                VKGroup {
                    VStack(spacing: 10) {
                        VKButton(title: going ? "Вы идёте" : "Пойду",
                                      icon: going ? "checkmark" : "person.badge.plus") {
                            withAnimation { going.toggle() }
                            nav.toast(going ? "Записали вас на своп" : "Отменили участие")
                        }
                        Button { nav.push(LooksRoute.swap) } label: {
                            HStack(spacing: 8) {
                                Image(systemName: "arrow.left.arrow.right")
                                Text("Договориться об обмене")
                            }
                            .font(.system(size: 15, weight: .medium)).foregroundStyle(t.accent)
                            .frame(maxWidth: .infinity).frame(height: 40)
                            .background(t.accentSoft, in: RoundedRectangle(cornerRadius: t.controlRadius))
                        }
                        .buttonStyle(.plain)
                    }
                    .padding(12)
                }
            }

        }
        .background(t.background)
        .navigationTitle("Своп").navigationBarTitleDisplayMode(.inline)
    }
}

/// «34 человека идут» / «21 человек идёт» — без шаблонной склейки.
func peopleGoing(_ n: Int) -> String {
    let t = n % 10, h = n % 100
    if t == 1 && h != 11 { return "\(n) человек идёт" }
    if (2...4).contains(t) && !(12...14).contains(h) { return "\(n) человека идут" }
    return "\(n) человек идут"
}

private struct InfoRow: View {
    let icon: String; let text: String
    @Environment(\.theme) private var t
    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: icon).font(.system(size: 15)).foregroundStyle(t.textSecondary).frame(width: 20)
            Text(text).font(.vkBody).foregroundStyle(t.textPrimary)
            Spacer()
        }
    }
}

// MARK: - Гардероб (свои вещи и образы)

struct WardrobeScreen: View {
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var tab = 0

    private var garments: [Garment] { store.garments }

    private func wardrobeStat(_ v: String, _ l: String) -> some View {
        VStack(spacing: 2) {
            Text(v).font(.system(size: 17, weight: .semibold)).foregroundStyle(t.textPrimary)
            Text(l).font(.vkCaption).foregroundStyle(t.textSecondary)
        }
        .frame(maxWidth: .infinity)
    }

    var body: some View {
        VStack(spacing: 0) {
            VKTabs(items: ["Вещи", "Мои образы", "Сохранённое"], selection: $tab)
            Rectangle().fill(t.separator).frame(height: 0.5)

            ScrollView {
                if tab == 0 {
                    // сводка гардероба: живой, а не плоский список
                    VKGroup {
                        HStack(spacing: 0) {
                            wardrobeStat("\(garments.count)", "вещей")
                            Rectangle().fill(t.separator).frame(width: 0.5, height: 26)
                            wardrobeStat("\(garments.filter { if case .worn = $0.state { return true }; return false }.count)",
                                         "носили")
                            Rectangle().fill(t.separator).frame(width: 0.5, height: 26)
                            wardrobeStat("\(garments.filter { if case .idle = $0.state { return true }; return false }.count)",
                                         "лежат")
                            Rectangle().fill(t.separator).frame(width: 0.5, height: 26)
                            wardrobeStat("\(garments.filter { $0.state == .onSwap || $0.state == .wanted }.count)",
                                         "на свопе")
                        }
                        .padding(.vertical, 12)
                    }

                    LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 2), spacing: 8) {
                        ForEach(garments) { g in GarmentCard(garment: g) }
                    }
                    .padding(t.pad)
                } else if tab == 1 {
                    LazyVStack(spacing: 0) {
                        ForEach(store.outfits.prefix(2)) { o in
                            VKGroup {
                                VKMedia(assetName: LooksMediaAssets.outfit(o.seed), height: 200)
                                Text(o.text.isEmpty ? "Без описания" : o.text)
                                    .font(.vkBody).foregroundStyle(t.textPrimary)
                                    .lineLimit(2).padding(12)
                            }
                        }
                    }

                } else {
                    EmptyState(icon: "bookmark", title: "Пока пусто",
                               text: "Сохраняйте образы из ленты — они появятся здесь")
                }
            }
            .background(t.background)
        }
        .background(t.background)
        .vkNavigation("Гардероб") {
            Button { nav.present(cover: LooksRoute.create) } label: {
                Image(systemName: "plus")
                    .font(.system(size: 20, weight: .regular))
                    .frame(width: 44, height: 44)
            }
            .accessibilityLabel("Добавить вещь")
        }
    }
}

private struct GarmentCard: View {
    let garment: Garment
    @Environment(\.theme) private var t
    var body: some View {
        VKCard {
            ZStack(alignment: .topTrailing) {
                VKMedia(assetName: LooksMediaAssets.detail(garment.title.count), height: 124)
                // состояние вещи — приложение всегда наполовину в процессе
                HStack(spacing: 4) {
                    Image(systemName: garment.state.icon).font(.system(size: 10, weight: .semibold))
                    Text(garment.state.label).font(.system(size: 11, weight: .medium))
                }
                .foregroundStyle(stateColor)
                .padding(.horizontal, 7).padding(.vertical, 3)
                .background(.regularMaterial, in: Capsule())
                .padding(8)
            }
            VStack(alignment: .leading, spacing: 3) {
                Text(garment.title).font(.system(size: 14, weight: .medium))
                    .foregroundStyle(t.textPrimary).lineLimit(1)
                HStack(spacing: 5) {
                    Text(garment.brand).font(.vkCaption).foregroundStyle(t.textSecondary)
                        .lineLimit(1).layoutPriority(1)
                    if garment.inOutfits > 0 {
                        Text("·").foregroundStyle(t.textTertiary)
                        Text("в \(garment.inOutfits) образах").font(.vkCaption)
                            .foregroundStyle(t.accent).lineLimit(1).layoutPriority(2)
                    }
                }
                .minimumScaleFactor(0.75)
            }
            .padding(10)
        }
    }
    private var stateColor: Color {
        switch garment.state {
        case .worn: return t.positive
        case .idle: return t.textSecondary
        case .onSwap: return Color(hex: "FF8A65")
        case .wanted: return t.accent
        }
    }
}

struct EmptyState: View {
    let icon: String; let title: String; let text: String
    @Environment(\.theme) private var t
    var body: some View {
        VStack(spacing: 10) {
            Image(systemName: icon).font(.system(size: 44, weight: .light)).foregroundStyle(t.textTertiary)
            Text(title).font(.system(size: 18, weight: .semibold)).foregroundStyle(t.textPrimary)
            Text(text).font(.vkBody).foregroundStyle(t.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(.horizontal, 40).padding(.top, 60)
    }
}

// MARK: - Образ целиком

struct OutfitScreen: View {
    let outfit: Outfit
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var showComments = false

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                VKGroup {
                    VKMedia(assetName: LooksMediaAssets.outfit(outfit.seed), height: 360)
                        .overlay(alignment: .bottomLeading) {
                            VStack(alignment: .leading, spacing: 6) {
                                ForEach(Array(outfit.items.enumerated()), id: \.element.id) { i, g in
                                    HStack(spacing: 6) {
                                        Text("\(i + 1)")
                                            .font(.system(size: 11, weight: .bold)).foregroundStyle(.black)
                                            .frame(width: 18, height: 18).background(.white, in: Circle())
                                        Text(g.title).font(.system(size: 13, weight: .medium))
                                            .foregroundStyle(.white)
                                    }
                                    .padding(.horizontal, 8).padding(.vertical, 5)
                                    .background(.black.opacity(0.55), in: Capsule())
                                }
                            }
                            .padding(12)
                        }
                    VStack(alignment: .leading, spacing: 10) {
                        HStack(spacing: 10) {
                            Avatar(name: outfit.author, size: 40)
                            VStack(alignment: .leading, spacing: 1) {
                                Text(outfit.author).font(.vkName)
                                Text(outfit.meta).font(.vkMeta).foregroundStyle(t.textSecondary)
                            }
                            Spacer()
                        }
                        if !outfit.text.isEmpty {
                            Text(outfit.text).font(.vkBody).lineSpacing(4)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                        VKPostActions(likes: outfit.likes, liked: outfit.liked,
                                      comments: outfit.comments, shares: outfit.shares,
                                      saved: outfit.saved, trailing: outfit.views,
                                      onLike: { store.toggleLike(outfit.id) },
                                      onComment: { showComments = true },
                                      onShare: { nav.toast("Ссылка скопирована") },
                                      onSave: { store.toggleSave(outfit.id) })
                            .padding(.top, 4)
                    }
                    .padding(12)
                }
                VKGroup {
                    Text("Вещи образа").font(.system(size: 17, weight: .semibold))
                        .padding(.horizontal, 12).padding(.top, 12).padding(.bottom, 4)
                    ForEach(Array(outfit.items.enumerated()), id: \.element.id) { i, g in
                        HStack(spacing: 12) {
                            Image(systemName: g.glyph).font(.system(size: 20)).foregroundStyle(t.accent)
                                .frame(width: 44, height: 44)
                                .background(t.accentSoft, in: RoundedRectangle(cornerRadius: 10, style: .continuous))
                            VStack(alignment: .leading, spacing: 2) {
                                Text(g.title).font(.system(size: 15, weight: .medium))
                                HStack(spacing: 5) {
                                    Text(g.brand).font(.vkMeta).foregroundStyle(t.textSecondary)
                                    if g.inOutfits > 0 {
                                        Text("·").foregroundStyle(t.textTertiary)
                                        Text("в \(g.inOutfits) образах").font(.vkMeta)
                                            .foregroundStyle(t.accent)
                                    }
                                }
                            }
                            Spacer()
                            Text(g.state.label).font(.vkMeta).foregroundStyle(t.textSecondary)
                        }
                        .padding(.horizontal, 12).padding(.vertical, 8)
                        if i < outfit.items.count - 1 { RowSeparator(leading: 68) }
                    }
                    Color.clear.frame(height: 6)
                }
            }

        }
        .background(t.background)
        .navigationTitle("Образ").navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showComments) { OutfitCommentsSheet(outfit: outfit) }
    }
}

private struct OutfitCommentsSheet: View {
    let outfit: Outfit
    @Environment(\.dismiss) private var dismiss
    @Environment(\.theme) private var t
    @State private var draft = ""
    @State private var comments = [
        "Сохранила сочетание, попробую с серым жакетом",
        "Очень нравится, что вещи не выглядят как витрина",
    ]

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                ScrollView {
                    LazyVStack(spacing: 0) {
                        ForEach(Array(comments.enumerated()), id: \.offset) { index, text in
                            HStack(alignment: .top, spacing: 10) {
                                Avatar(name: index.isMultiple(of: 2) ? "Аня Котова" : "Марк Львов", size: 36)
                                VStack(alignment: .leading, spacing: 3) {
                                    Text(index.isMultiple(of: 2) ? "Аня Котова" : "Марк Львов").font(.vkName)
                                    Text(text).font(.vkBody).foregroundStyle(t.textPrimary)
                                }
                                Spacer(minLength: 0)
                            }
                            .padding(12)
                            if index < comments.count - 1 { RowSeparator(leading: 58) }
                        }
                    }
                }
                HStack(spacing: 8) {
                    TextField("Комментарий к образу", text: $draft)
                        .textFieldStyle(.plain).padding(.horizontal, 14).frame(height: 40)
                        .background(t.fill, in: Capsule())
                    Button("Отправить") {
                        let value = draft.trimmingCharacters(in: .whitespacesAndNewlines)
                        guard !value.isEmpty else { return }
                        comments.append(value)
                        draft = ""
                    }
                    .disabled(draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
                .padding(12).background(t.background)
            }
            .navigationTitle("Комментарии · \(outfit.comments)")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .confirmationAction) { Button("Готово") { dismiss() } } }
        }
        .presentationDetents([.medium, .large])
    }
}

// MARK: - Создание образа (камера + медиатека)

struct CreateScreen: View {
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.dismiss) private var dismiss
    @Environment(\.theme) private var t
    @State private var text = ""
    @State private var picked = false

    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: 0) {
                    VKGroup {
                        if picked {
                            VKMedia(assetName: LooksMediaAssets.outfit(1), height: 260)
                        } else {
                            VStack(spacing: 14) {
                                Image(systemName: "camera.viewfinder")
                                    .font(.system(size: 42, weight: .light)).foregroundStyle(t.textTertiary)
                                Text("Добавьте фото образа")
                                    .font(.system(size: 17, weight: .semibold)).foregroundStyle(t.textPrimary)
                                HStack(spacing: 10) {
                                    Button {
                                        Task {
                                            let ok = await perms.request(.camera)
                                            if ok { withAnimation { picked = true } }
                                            else { nav.toast("Без камеры выберите фото из медиатеки", once: "camera") }
                                        }
                                    } label: {
                                        actionTile(icon: "camera.fill", title: "Снять")
                                    }.buttonStyle(.plain)
                                    Button {
                                        Task {
                                            let ok = await perms.request(.photos)
                                            if ok { withAnimation { picked = true } }
                                            else { nav.toast("Снимите образ на камеру", once: "photos") }
                                        }
                                    } label: {
                                        actionTile(icon: "photo.on.rectangle", title: "Медиатека")
                                    }.buttonStyle(.plain)
                                }
                            }
                            .padding(.vertical, 34).padding(.horizontal, 16)
                            .frame(maxWidth: .infinity)
                        }
                    }
                    VKGroup {
                        TextField("Расскажите про образ", text: $text, axis: .vertical)
                            .font(.vkBody).lineLimit(3...8).padding(12)
                    }
                    VKGroup {
                        rowLink(icon: "tag", title: "Отметить вещи",
                                value: picked ? "3 вещи" : "нужен кадр")
                        RowSeparator(leading: 52)
                        Button {
                            Task {
                                let ok = await perms.request(.speech)
                                nav.toast(ok ? "Субтитры собраны из речи в клипе"
                                             : "Подписи можно ввести вручную", once: "speech")
                            }
                        } label: {
                            rowLink(icon: "captions.bubble", title: "Субтитры к клипу",
                                    value: "собрать")
                        }
                        .buttonStyle(HighlightStyle())
                        RowSeparator(leading: 52)
                        rowLink(icon: "person.2", title: "Аудитория", value: "Все")
                    }
                }

                .padding(.bottom, 72)
            }
            .background(t.background)
        }
        .background(t.background)
        .navigationTitle("Образ").navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button("Отмена") { dismiss() }
            }
            ToolbarItem(placement: .topBarTrailing) {
                Button("Опубликовать") { dismiss(); nav.toast("Образ опубликован") }
                    .fontWeight(.semibold)
                    .disabled(!picked)
            }
        }
    }

    private func actionTile(icon: String, title: String) -> some View {
        VStack(spacing: 6) {
            Image(systemName: icon).font(.system(size: 20))
            Text(title).font(.system(size: 14, weight: .medium))
        }
        .foregroundStyle(t.accent)
        .frame(width: 120, height: 72)
        .background(t.accentSoft, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
    }

    private func rowLink(icon: String, title: String, value: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon).font(.system(size: 17)).foregroundStyle(t.accent).frame(width: 28)
            Text(title).font(.vkBody).foregroundStyle(t.textPrimary)
            Spacer()
            Text(value).font(.vkBody).foregroundStyle(t.textSecondary)
            Image(systemName: "chevron.right").font(.system(size: 13, weight: .semibold))
                .foregroundStyle(t.textTertiary)
        }
        .padding(.horizontal, 12).padding(.vertical, 13)
    }
}

// MARK: - Друзья по контактам

struct MatesScreen: View {
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.theme) private var t
    @State private var query = ""
    @State private var hidden: Set<String> = []
    @State private var added: Set<String> = []

    /// Возможные знакомые: каждая строка сообщает своё, а не заполненный шаблон.
    private let maybe: [(String, String, [String], String)] = [
        ("Ника Кравец", "Из ваших контактов", ["Аня Котова", "Марк Львов", "Даша Ким"], "3 общих знакомых"),
        ("Гриша Ли", "Санкт-Петербург", ["Лена Гор"], "1 общий знакомый"),
    ]

    /// Мои знакомые: у кого-то город, у кого-то нет — как в живом списке.
    private let mine: [(String, String?)] = [
        ("Аня Котова", "собрала 12 свопов за год"),
        ("Марк Львов", nil),
        ("Даша Ким", "Иркутск"),
        ("Лена Гор", "меняется верхней одеждой"),
        ("Оля Пан", nil),
        ("Соня Рахимова", "Санкт-Петербург"),
    ]

    private var filtered: [(String, String?)] {
        query.isEmpty ? mine : mine.filter { $0.0.localizedCaseInsensitiveContains(query) }
    }

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                VKSearchField(placeholder: "Поиск", text: $query)
                    .padding(.horizontal, t.pad).padding(.top, 8).padding(.bottom, 12)

                // Единственная точка запроса контактов — как «Импорт телефонной
                // книги» у ВК на экране «Добавить друга».
                if perms.status(.contacts) != .granted {
                    VKOutlineButton(title: "Импорт телефонной книги", icon: "phone") {
                        Task {
                            let ok = await perms.request(.contacts)
                            if !ok { nav.toast("Ищите знакомых по имени в поиске", once: "contacts") }
                        }
                    }
                    .padding(.horizontal, t.pad).padding(.bottom, 6)
                } else {
                    VKRow(title: "Контакты подключены",
                          subtitle: "9 человек из книги уже публикуют образы",
                          icon: "checkmark.circle", chevron: false)
                }
                GroupGap()

                VKSectionHeader(title: "Возможные знакомые")
                ForEach(maybe.filter { !hidden.contains($0.0) }, id: \.0) { p in
                    VKPersonRow(name: p.0, subtitle: p.1, mutual: p.2, mutualText: p.3) {
                        if added.contains(p.0) {
                            Text("Заявка отправлена").font(.system(size: 13))
                                .foregroundStyle(t.textSecondary)
                        } else {
                            VKRowAction(icon: "xmark.circle", label: "Скрыть",
                                        tint: t.textTertiary) {
                                withAnimation { _ = hidden.insert(p.0) }
                            }
                            VKRowAction(icon: "person.crop.circle.badge.plus", label: "Добавить") {
                                withAnimation { _ = added.insert(p.0) }
                                nav.toast("Заявка отправлена")
                            }
                        }
                    }
                    RowSeparator()
                }
                GroupGap()

                VKSectionHeader(title: "Мои знакомые", count: "\(mine.count)")
                ForEach(filtered, id: \.0) { p in
                    VKPersonRow(name: p.0, subtitle: p.1) {
                        VKRowAction(icon: "phone", label: "Позвонить \(p.0)") {
                            nav.push(LooksRoute.call)
                        }
                        VKRowAction(icon: "bubble.left", label: "Написать \(p.0)") {
                            nav.push(LooksRoute.chat(dialog(for: p.0)))
                        }
                    }
                    RowSeparator()
                }
                Color.clear.frame(height: 90)
            }
        }
        .background(t.background)
        .navigationTitle("Знакомые").navigationBarTitleDisplayMode(.inline)
    }

    private func dialog(for name: String) -> Dialog {
        store.dialogs.first { $0.name == name }
            ?? Dialog(name: name, last: "Напишите первым", time: "сейчас")
    }
}

// MARK: - Реклама (экран-объяснение перед ATT)

struct AdsScreen: View {
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.dismiss) private var dismiss
    @Environment(\.theme) private var t

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Spacer().frame(height: 8)
            Image(systemName: "sparkles").font(.system(size: 40)).foregroundStyle(t.accent)
            Text("Образы бесплатны").font(.system(size: 26, weight: .bold))
            Text("Приложение живёт за счёт рекламы марок и магазинов между образами")
                .font(.vkBody).foregroundStyle(t.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
            Text("Если разрешить отслеживание, реклама будет по вашим интересам. Если нет — покажем обычную, всё остальное работает так же")
                .font(.vkBody).foregroundStyle(t.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
            Spacer()
            VKButton(title: "Реклама по интересам") {
                Task { await perms.request(.tracking); dismiss() }
            }
            Button("Обычная реклама") { dismiss() }
                .font(.system(size: 16)).foregroundStyle(t.accent)
                .frame(maxWidth: .infinity).padding(.vertical, 6)
            Spacer().frame(height: 8)
        }
        .padding(.horizontal, t.pad)
        .background(t.card)
        .navigationTitle("Реклама").navigationBarTitleDisplayMode(.inline)
    }
}
