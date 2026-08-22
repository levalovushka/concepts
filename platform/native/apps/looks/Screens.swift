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
            FilterPills(items: [("Все", "line.3.horizontal.decrease"), ("Свопы", "arrow.left.arrow.right"),
                                ("Барахолки", "bag"), ("Встречи", "person.2")], selection: $filter)
                .scrollClipDisabled()
                .padding(.vertical, 10)
                .background(t.card)

            ScrollView {
                LazyVStack(spacing: t.cardGap) {
                    if perms.status(.location) != .granted {
                        Card {
                            VStack(alignment: .leading, spacing: 12) {
                                Image(systemName: "location.circle.fill")
                                    .font(.system(size: 34)).foregroundStyle(t.accent)
                                Text("Показать свопы поблизости")
                                    .font(.system(size: 18, weight: .semibold)).foregroundStyle(t.textPrimary)
                                Text("Нужна геопозиция, чтобы отсортировать встречи по расстоянию. Без неё покажем всё по городу")
                                    .font(.dsBody).foregroundStyle(t.textSecondary)
                                    .fixedSize(horizontal: false, vertical: true)
                                PrimaryButton(title: "Разрешить геопозицию", icon: "location.fill") {
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
                .padding(.top, t.cardGap)
                .padding(.bottom, 72)
            }
            .background(t.background)
        }
        .background(t.background)
        .navigationTitle("Свопы рядом").navigationBarTitleDisplayMode(.inline)
    }
}

private struct EventCard: View {
    let event: NearbyEvent
    @Environment(Permissions.self) private var perms
    @Environment(\.theme) private var t
    var body: some View {
        Card {
            MediaBlock(glyph: "arrow.left.arrow.right", height: 140, seed: event.going)
            VStack(alignment: .leading, spacing: 8) {
                Text(event.title).font(.system(size: 17, weight: .semibold)).foregroundStyle(t.textPrimary)
                HStack(spacing: 6) {
                    Image(systemName: "calendar").font(.system(size: 13))
                    Text(event.when)
                    Text("·")
                    Text(event.place).lineLimit(1)
                }
                .font(.dsMeta).foregroundStyle(t.textSecondary)
                HStack(spacing: 8) {
                    Label(perms.isGranted(.location) ? event.distance : "в городе", systemImage: "location.fill")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(t.accent)
                        .padding(.horizontal, 10).frame(height: 28)
                        .background(t.accentSoft, in: Capsule())
                    Text("\(event.going) идут").font(.dsMeta).foregroundStyle(t.textSecondary)
                    Spacer()
                }
            }
            .padding(12)
        }
    }
}

struct EventScreen: View {
    let event: NearbyEvent
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.theme) private var t
    @State private var going = false

    var body: some View {
        ScrollView {
            VStack(spacing: t.cardGap) {
                Card {
                    MediaBlock(glyph: "arrow.left.arrow.right", height: 180, seed: event.going)
                    VStack(alignment: .leading, spacing: 10) {
                        Text(event.title).font(.dsSectionTitle).foregroundStyle(t.textPrimary)
                        InfoRow(icon: "calendar", text: event.when)
                        InfoRow(icon: "mappin.and.ellipse", text: event.place)
                        InfoRow(icon: "person.2.fill", text: peopleGoing(event.going))
                    }
                    .padding(12)
                }
                Card {
                    Text("Организатор")
                        .font(.system(size: 13, weight: .medium)).foregroundStyle(t.textSecondary)
                        .padding(.horizontal, 12).padding(.top, 12).padding(.bottom, 8)
                    HStack(spacing: 12) {
                        Avatar(name: "Аня Котова", size: 40)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Аня Котова").font(.system(size: 15, weight: .medium))
                            Text("собрала 12 свопов за год").font(.dsMeta).foregroundStyle(t.textSecondary)
                        }
                        Spacer()
                        Text("Написать").font(.system(size: 14, weight: .medium))
                            .foregroundStyle(t.accent)
                            .padding(.horizontal, 12).frame(height: 30)
                            .background(t.accentSoft, in: Capsule())
                    }
                    .padding(.horizontal, 12).padding(.bottom, 12)
                }
                Card {
                    Text("Что приносить")
                        .font(.system(size: 13, weight: .medium)).foregroundStyle(t.textSecondary)
                        .padding(.horizontal, 12).padding(.top, 12).padding(.bottom, 6)
                    ForEach(["Верх и платья — в чистом виде",
                             "Обувь без следов носки",
                             "Аксессуары любые"], id: \.self) { r in
                        HStack(alignment: .top, spacing: 10) {
                            Image(systemName: "circle.fill").font(.system(size: 5))
                                .foregroundStyle(t.textTertiary).padding(.top, 7)
                            Text(r).font(.dsBody).foregroundStyle(t.textPrimary)
                            Spacer()
                        }
                        .padding(.horizontal, 12).padding(.vertical, 5)
                    }
                    Color.clear.frame(height: 8)
                }
                Card {
                    VStack(spacing: 10) {
                        PrimaryButton(title: going ? "Вы идёте" : "Пойду",
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
            .padding(.vertical, t.cardGap)
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
            Text(text).font(.dsBody).foregroundStyle(t.textPrimary)
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

    private var garments: [Garment] { store.outfits.flatMap(\.items) }

    private func wardrobeStat(_ v: String, _ l: String) -> some View {
        VStack(spacing: 2) {
            Text(v).font(.system(size: 17, weight: .semibold)).foregroundStyle(t.textPrimary)
            Text(l).font(.dsCaption).foregroundStyle(t.textSecondary)
        }
        .frame(maxWidth: .infinity)
    }

    var body: some View {
        VStack(spacing: 0) {
            UnderlineTabs(items: ["Вещи", "Мои образы", "Сохранённое"], selection: $tab)
            Rectangle().fill(t.separator).frame(height: 0.5)

            ScrollView {
                if tab == 0 {
                    // сводка гардероба: живой, а не плоский список
                    Card {
                        HStack(spacing: 0) {
                            wardrobeStat("\(garments.count)", "вещей")
                            Rectangle().fill(t.separator).frame(width: 0.5, height: 26)
                            wardrobeStat("\(garments.filter { if case .worn = $0.state { return true }; return false }.count)",
                                         "носили")
                            Rectangle().fill(t.separator).frame(width: 0.5, height: 26)
                            wardrobeStat("\(garments.filter { if case .idle = $0.state { return true }; return false }.count)",
                                         "лежат")
                            Rectangle().fill(t.separator).frame(width: 0.5, height: 26)
                            wardrobeStat("\(garments.filter { $0.state == .onSwap }.count)", "на свопе")
                        }
                        .padding(.vertical, 12)
                    }
                    .padding(.horizontal, t.pad).padding(.top, t.cardGap)

                    LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 2), spacing: 8) {
                        ForEach(garments) { g in GarmentCard(garment: g) }
                    }
                    .padding(t.pad)
                } else if tab == 1 {
                    LazyVStack(spacing: t.cardGap) {
                        ForEach(store.outfits.prefix(2)) { o in
                            Card {
                                OutfitMedia(items: o.items, seed: o.seed, height: 200)
                                Text(o.text.isEmpty ? "Без описания" : o.text)
                                    .font(.dsBody).foregroundStyle(t.textPrimary)
                                    .lineLimit(2).padding(12)
                            }
                        }
                    }
                    .padding(.vertical, t.cardGap)
                } else {
                    EmptyState(icon: "bookmark", title: "Пока пусто",
                               text: "Сохраняйте образы из ленты — они появятся здесь")
                }
            }
            .background(t.background)
        }
        .background(t.background)
        .navigationTitle("Гардероб").navigationBarTitleDisplayMode(.inline)
        .toolbar { ToolbarItem(placement: .topBarTrailing) { Button { nav.present(cover: LooksRoute.create) } label: { Image(systemName: "plus") } } }
    }
}

private struct GarmentCard: View {
    let garment: Garment
    @Environment(\.theme) private var t
    var body: some View {
        Card {
            ZStack(alignment: .topTrailing) {
                ZStack {
                    t.fieldFill
                    Image(systemName: garment.glyph).font(.system(size: 42, weight: .ultraLight))
                        .foregroundStyle(t.accent.opacity(0.8))
                }
                .frame(height: 124)
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
                    Text(garment.brand).font(.dsCaption).foregroundStyle(t.textSecondary).lineLimit(1)
                    if garment.inOutfits > 0 {
                        Text("·").foregroundStyle(t.textTertiary)
                        Text("в \(garment.inOutfits) образах").font(.dsCaption)
                            .foregroundStyle(t.accent).lineLimit(1)
                    }
                }
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
            Text(text).font(.dsBody).foregroundStyle(t.textSecondary)
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

    var body: some View {
        ScrollView {
            VStack(spacing: t.cardGap) {
                Card {
                    OutfitMedia(items: outfit.items, seed: outfit.seed, height: 360)
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
                                Text(outfit.author).font(.dsName)
                                Text(outfit.meta).font(.dsMeta).foregroundStyle(t.textSecondary)
                            }
                            Spacer()
                        }
                        if !outfit.text.isEmpty {
                            Text(outfit.text).font(.dsBody).lineSpacing(4)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                        HStack(spacing: 8) {
                            ActionPill(icon: "heart", count: "\(outfit.likes)",
                                       active: outfit.liked, activeColor: t.danger) {
                                store.toggleLike(outfit.id)
                            }
                            ActionPill(icon: "bubble.right", count: "\(outfit.comments)") {}
                            ActionPill(icon: "arrowshape.turn.up.right", count: "\(outfit.shares)") {}
                            Spacer()
                            Button { store.toggleSave(outfit.id) } label: {
                                Image(systemName: outfit.saved ? "bookmark.fill" : "bookmark")
                                    .font(.system(size: 16, weight: .medium))
                                    .foregroundStyle(outfit.saved ? t.accent : t.textSecondary)
                            }
                            .buttonStyle(.plain)
                        }
                        .padding(.top, 4)
                    }
                    .padding(12)
                }
                Card {
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
                                    Text(g.brand).font(.dsMeta).foregroundStyle(t.textSecondary)
                                    if g.inOutfits > 0 {
                                        Text("·").foregroundStyle(t.textTertiary)
                                        Text("в \(g.inOutfits) образах").font(.dsMeta)
                                            .foregroundStyle(t.accent)
                                    }
                                }
                            }
                            Spacer()
                            Image(systemName: "chevron.right").font(.system(size: 13, weight: .semibold))
                                .foregroundStyle(t.textTertiary)
                        }
                        .padding(.horizontal, 12).padding(.vertical, 8)
                        if i < outfit.items.count - 1 { RowDivider(leading: 68) }
                    }
                    RowDivider(leading: 12)
                    ShowAllRow(title: "Все вещи автора") {}
                }
            }
            .padding(.vertical, t.cardGap)
        }
        .background(t.background)
        .navigationTitle("Образ").navigationBarTitleDisplayMode(.inline)
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
                VStack(spacing: t.cardGap) {
                    Card {
                        if picked {
                            MediaBlock(glyph: "figure.stand", height: 260, seed: 1)
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
                    Card {
                        TextField("Расскажите про образ", text: $text, axis: .vertical)
                            .font(.dsBody).lineLimit(3...8).padding(12)
                    }
                    Card {
                        rowLink(icon: "tag", title: "Отметить вещи",
                                value: picked ? "3 вещи" : "нужен кадр")
                        RowDivider(leading: 52)
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
                        RowDivider(leading: 52)
                        rowLink(icon: "person.2", title: "Аудитория", value: "Все")
                    }
                }
                .padding(.top, t.cardGap)
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
            Text(title).font(.dsBody).foregroundStyle(t.textPrimary)
            Spacer()
            Text(value).font(.dsBody).foregroundStyle(t.textSecondary)
            Image(systemName: "chevron.right").font(.system(size: 13, weight: .semibold))
                .foregroundStyle(t.textTertiary)
        }
        .padding(.horizontal, 12).padding(.vertical, 13)
    }
}

// MARK: - Друзья по контактам

struct MatesScreen: View {
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.theme) private var t
    private let names = ["Аня Котова", "Марк Львов", "Даша Ким", "Лена Гор"]
    /// Разные состояния: подписан, взаимно, только зарегистрировался.
    private let suggested: [(String, String, String)] = [
        ("Аня Котова", "12 общих подписок · 142 образа", "Вы подписаны"),
        ("Марк Львов", "подписался на вас вчера", "Подписаться"),
        ("Лена Гор", "зарегистрировалась 3 дня назад", "Подписаться"),
        ("Ника Кравец", "4 общие подписки · 8 образов", "Подписаться"),
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: t.cardGap) {
                if perms.status(.contacts) != .granted {
                    Card {
                        VStack(alignment: .leading, spacing: 12) {
                            Image(systemName: "person.2.fill").font(.system(size: 30)).foregroundStyle(t.accent)
                            Text("Кто из знакомых уже здесь")
                                .font(.system(size: 18, weight: .semibold))
                            Text("Покажем, кто из ваших контактов уже публикует образы")
                                .font(.dsBody).foregroundStyle(t.textSecondary)
                                .fixedSize(horizontal: false, vertical: true)
                            PrimaryButton(title: "Найти знакомых", icon: "person.crop.circle.badge.plus") {
                                Task {
                                    let ok = await perms.request(.contacts)
                                    if !ok { nav.toast("Найдите людей через поиск", once: "contacts") }
                                }
                            }
                        }
                        .padding(16)
                    }
                    // пока доступа нет — не пустой экран, а то, что уже можно
                    Card {
                        Text("Найти по имени")
                            .font(.system(size: 13, weight: .medium)).foregroundStyle(t.textSecondary)
                            .padding(.horizontal, 12).padding(.top, 12).padding(.bottom, 8)
                        ForEach(suggested, id: \.0) { p in
                            HStack(spacing: 12) {
                                Avatar(name: p.0, size: 40)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(p.0).font(.system(size: 15, weight: .medium))
                                    Text(p.1).font(.dsMeta).foregroundStyle(t.textSecondary).lineLimit(1)
                                }
                                Spacer(minLength: 8)
                                Text(p.2)
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundStyle(p.2 == "Вы подписаны" ? t.textSecondary : t.accent)
                                    .padding(.horizontal, 12).frame(height: 30)
                                    .background(p.2 == "Вы подписаны" ? t.fieldFill : t.accentSoft,
                                                in: Capsule())
                            }
                            .padding(.horizontal, 12).padding(.vertical, 7)
                        }
                        RowDivider(leading: 12)
                        ShowAllRow(title: "Пригласить по ссылке") {
                            nav.toast("Ссылка скопирована")
                        }
                    }
                } else {
                    Card {
                        ForEach(Array(names.enumerated()), id: \.offset) { i, n in
                            HStack(spacing: 12) {
                                Avatar(name: n, size: 44)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(n).font(.system(size: 15, weight: .medium))
                                    Text("уже публикует образы").font(.dsMeta).foregroundStyle(t.textSecondary)
                                }
                                Spacer()
                                Text("Подписаться").font(.system(size: 14, weight: .medium))
                                    .foregroundStyle(t.accent)
                                    .padding(.horizontal, 12).frame(height: 32)
                                    .background(t.accentSoft, in: Capsule())
                            }
                            .padding(.horizontal, 12).padding(.vertical, 8)
                            if i < names.count - 1 { RowDivider(leading: 68) }
                        }
                    }
                }
            }
            .padding(.vertical, t.cardGap)
        }
        .background(t.background)
        .navigationTitle("Знакомые").navigationBarTitleDisplayMode(.inline)
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
                .font(.dsBody).foregroundStyle(t.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
            Text("Если разрешить отслеживание, реклама будет по вашим интересам. Если нет — покажем обычную, всё остальное работает так же")
                .font(.dsBody).foregroundStyle(t.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
            Spacer()
            PrimaryButton(title: "Реклама по интересам") {
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
