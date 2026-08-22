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
                .padding(.vertical, t.cardGap)
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
                        InfoRow(icon: "person.2.fill", text: "\(event.going) человек идут")
                    }
                    .padding(12)
                }
                Card {
                    Button {
                        Task {
                            let ok = await perms.request(.calendar)
                            withAnimation { going = true }
                            nav.toast(ok ? "Добавили в календарь" : "Записали. Календарь недоступен", once: "calendar")
                        }
                    } label: {
                        HStack(spacing: 10) {
                            Image(systemName: going ? "checkmark.circle.fill" : "calendar.badge.plus")
                            Text(going ? "Вы идёте" : "Пойду и добавить в календарь")
                        }
                        .font(.system(size: 16, weight: .medium))
                        .foregroundStyle(going ? t.positive : t.accent)
                        .frame(maxWidth: .infinity).padding(.vertical, 14)
                    }
                    .buttonStyle(HighlightStyle())
                }
            }
            .padding(.vertical, t.cardGap)
        }
        .background(t.background)
        .navigationTitle("Своп").navigationBarTitleDisplayMode(.inline)
    }
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

    var body: some View {
        VStack(spacing: 0) {
            UnderlineTabs(items: ["Вещи", "Мои образы", "Сохранённое"], selection: $tab)
            Rectangle().fill(t.separator).frame(height: 0.5)

            ScrollView {
                if tab == 0 {
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
            ZStack {
                t.fieldFill
                Image(systemName: garment.glyph).font(.system(size: 44, weight: .light))
                    .foregroundStyle(t.accent.opacity(0.8))
            }
            .frame(height: 130)
            VStack(alignment: .leading, spacing: 2) {
                Text(garment.title).font(.system(size: 14, weight: .medium))
                    .foregroundStyle(t.textPrimary).lineLimit(1)
                Text(garment.brand).font(.dsCaption).foregroundStyle(t.textSecondary).lineLimit(1)
            }
            .padding(10)
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
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(spacing: t.cardGap) {
                Card {
                    OutfitMedia(items: outfit.items, seed: outfit.seed, height: 360)
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
                                Text(g.brand).font(.dsMeta).foregroundStyle(t.textSecondary)
                            }
                            Spacer()
                            Image(systemName: "chevron.right").font(.system(size: 13, weight: .semibold))
                                .foregroundStyle(t.textTertiary)
                        }
                        .padding(.horizontal, 12).padding(.vertical, 8)
                        if i < outfit.items.count - 1 { RowDivider(leading: 68) }
                    }
                    RowDivider(leading: 12)
                    ShowAllRow(title: "Собрать свою версию") {}
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
                                            else { nav.toast("Нет доступа к «Фото» — снимите на камеру", once: "photos") }
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
                        rowLink(icon: "tag", title: "Отметить вещи", value: "3 вещи")
                        RowDivider(leading: 52)
                        rowLink(icon: "person.2", title: "Аудитория", value: "Все")
                    }
                }
                .padding(.vertical, t.cardGap)
            }
            .background(t.background)
        }
        .background(t.background)
        .navigationTitle("Новый образ").navigationBarTitleDisplayMode(.inline)
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

// MARK: - Поиск

struct SearchScreen: View {
    @Environment(\.theme) private var t
    @State private var query = ""
    var body: some View {
        VStack(spacing: 12) {
            SearchField(placeholder: "Образы, вещи, авторы", text: $query)
                .padding(.horizontal, t.pad).padding(.top, 8)
            if query.isEmpty {
                EmptyState(icon: "magnifyingglass", title: "Что ищем?",
                           text: "Найдём образы по вещи, бренду или автору")
            }
            Spacer()
        }
        .background(t.background)
        .navigationTitle("Поиск").navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Друзья по контактам

struct MatesScreen: View {
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.theme) private var t
    private let names = ["Аня Котова", "Марк Львов", "Даша Ким", "Лена Гор"]

    var body: some View {
        ScrollView {
            VStack(spacing: t.cardGap) {
                if perms.status(.contacts) != .granted {
                    Card {
                        VStack(alignment: .leading, spacing: 12) {
                            Image(systemName: "person.2.fill").font(.system(size: 30)).foregroundStyle(t.accent)
                            Text("Кто из знакомых уже здесь")
                                .font(.system(size: 18, weight: .semibold))
                            Text("Сверим контакты, чтобы показать их образы. Номера не публикуем")
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
