import SwiftUI

// Профиль в структуре ВК: обложка → круглый аватар → имя по центру → синяя кнопка
// на всю ширину + квадратные рядом → пилюли-табы → сетка 3 колонки.
// Продукт «Образы»: профиль — живой гардероб автора.

struct ProfileScreen: View {
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.theme) private var t
    @State private var tab = 0

    private let name = "Ника Орлова"
    private var garments: [Garment] { store.outfits.flatMap(\.items) }

    var body: some View {
        ScrollView {
            VStack(spacing: t.cardGap) {
                // шапка профиля: обложка уходит под статус-бар, без скруглений
                VStack(spacing: 0) {
                    LinearGradient(colors: [Color(hex: "6E8BFF"), Color(hex: "B478FF")],
                                   startPoint: .topLeading, endPoint: .bottomTrailing)
                        .frame(height: 168)
                        .overlay(alignment: .bottomTrailing) {
                            Button {} label: {
                                Image(systemName: "camera.fill").font(.system(size: 14))
                                    .foregroundStyle(.white)
                                    .frame(width: 32, height: 32)
                                    .background(.black.opacity(0.28), in: Circle())
                            }
                            .buttonStyle(.plain)
                            .padding(12)
                        }
                        .ignoresSafeArea(edges: .top)

                    VStack(spacing: 0) {
                        Avatar(name: name, size: 92)
                            .overlay(Circle().stroke(t.card, lineWidth: 4))
                            .offset(y: -46)
                            .padding(.bottom, -38)

                        Text(name)
                            .font(.system(size: 23, weight: .bold)).foregroundStyle(t.textPrimary)
                            .padding(.top, 4)
                        Text("Крупная вязка, секонд и осень")
                            .font(.system(size: 15)).foregroundStyle(t.textSecondary)
                            .padding(.top, 3)
                        HStack(spacing: 14) {
                            Label("Москва", systemImage: "mappin.and.ellipse")
                            Label("Подробнее", systemImage: "info.circle")
                        }
                        .font(.dsMeta).foregroundStyle(t.textSecondary)
                        .padding(.top, 6)

                        // это свой профиль — здесь редактирование, а не подписка
                        HStack(spacing: 8) {
                            PrimaryButton(title: "Редактировать", icon: "pencil") {
                                nav.toast("Редактирование профиля")
                            }
                            SquareButton(icon: "square.and.arrow.up") { nav.toast("Ссылка скопирована") }
                            SquareButton(icon: "gearshape.fill") { nav.push(LooksRoute.settings) }
                        }
                        .padding(.top, 14)
                        .padding(.horizontal, 12)
                        .padding(.bottom, 14)
                    }
                    .frame(maxWidth: .infinity)
                    .background(t.card)
                }

                // счётчики
                Card {
                    HStack(spacing: 0) {
                        stat("142", "образа")
                        divider
                        stat("1,3K", "подписчиков")
                        divider
                        stat("86", "вещей")
                    }
                    .padding(.vertical, 14)
                }

                // знакомые по контактам
                Card {
                    Button { nav.push(LooksRoute.mates) } label: {
                        HStack(spacing: 12) {
                            Image(systemName: "person.2.fill").font(.system(size: 17))
                                .foregroundStyle(t.accent).frame(width: 28)
                            Text("Кто из знакомых здесь").font(.dsBody).foregroundStyle(t.textPrimary)
                            Spacer()
                            Image(systemName: "chevron.right").font(.system(size: 13, weight: .semibold))
                                .foregroundStyle(t.textTertiary)
                        }
                        .padding(.horizontal, 12).padding(.vertical, 13)
                    }
                    .buttonStyle(HighlightStyle())
                    RowDivider(leading: 52)
                    Button { nav.push(LooksRoute.settings) } label: {
                        HStack(spacing: 12) {
                            Image(systemName: "gearshape.fill").font(.system(size: 17))
                                .foregroundStyle(t.accent).frame(width: 28)
                            Text("Настройки").font(.dsBody).foregroundStyle(t.textPrimary)
                            Spacer()
                            Image(systemName: "chevron.right").font(.system(size: 13, weight: .semibold))
                                .foregroundStyle(t.textTertiary)
                        }
                        .padding(.horizontal, 12).padding(.vertical, 13)
                    }
                    .buttonStyle(HighlightStyle())
                }

                // гардероб: пилюли-табы + сетка
                Card {
                    HStack(spacing: 8) {
                        pill("Образы", 0)
                        pill("Вещи", 1)
                        pill("Свопы", 2)
                        Spacer()
                    }
                    .padding(.horizontal, 12).padding(.top, 12).padding(.bottom, 10)

                    if tab == 1 {
                        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 2), count: 3), spacing: 2) {
                            ForEach(garments) { g in
                                ZStack {
                                    t.fieldFill
                                    Image(systemName: g.glyph).font(.system(size: 26, weight: .light))
                                        .foregroundStyle(t.accent.opacity(0.75))
                                }
                                .aspectRatio(0.82, contentMode: .fill).clipped()
                            }
                        }
                    } else if tab == 0 {
                        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 2), count: 3), spacing: 2) {
                            ForEach(0..<9, id: \.self) { i in
                                let g = garments[safe: i % max(garments.count, 1)]
                                OutfitGridCell(glyph: g?.glyph ?? "tshirt.fill", seed: i)
                            }
                        }
                    } else {
                        EmptyState(icon: "arrow.left.arrow.right", title: "Свопов пока нет",
                                   text: "Обмены вещами появятся здесь")
                            .padding(.bottom, 20)
                    }

                    RowDivider(leading: 12)
                    ShowAllRow(title: "Показать всё") {}
                }
            }
            .padding(.bottom, t.cardGap)
        }
        .background(t.background)
        .ignoresSafeArea(edges: .top)
    }

    private var divider: some View {
        Rectangle().fill(t.separator).frame(width: 0.5, height: 28)
    }
    private func stat(_ v: String, _ l: String) -> some View {
        VStack(spacing: 3) {
            Text(v).font(.system(size: 19, weight: .semibold)).foregroundStyle(t.textPrimary)
            Text(l).font(.dsMeta).foregroundStyle(t.textSecondary)
        }
        .frame(maxWidth: .infinity)
    }
    private func pill(_ title: String, _ i: Int) -> some View {
        Button { withAnimation(.easeOut(duration: 0.16)) { tab = i } } label: {
            Text(title)
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(tab == i ? t.accent : t.textPrimary)
                .padding(.horizontal, 14).frame(height: 34)
                .background(tab == i ? t.accentSoft : t.fieldFill, in: Capsule())
        }
        .pressable()
    }
}

// MARK: - Настройки

struct SettingsScreen: View {
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.theme) private var t
    @State private var push = false

    var body: some View {
        ScrollView {
            VStack(spacing: t.cardGap) {
                group("Аккаунт") {
                    row(icon: "envelope.fill", title: "nika@mail.ru", subtitle: "Почта для входа")
                }
                group("Уведомления") {
                    toggleRow(icon: "bell.fill", title: "Новые образы и реакции", isOn: $push) { on in
                        if on {
                            let ok = await perms.request(.push)
                            if !ok { push = false; nav.toast("Уведомления выключены в настройках", once: "push"); return }
                            // фоновые режимы включаются вместе с уведомлениями
                            await perms.request(.commnotif)
                            await perms.request(.remotenotif)
                            await perms.request(.fetch)
                        }
                    }
                    if perms.isGranted(.push) {
                        RowDivider(leading: 52)
                        row(icon: "person.crop.circle.badge.checkmark",
                            title: "Аватар автора в уведомлении", subtitle: "чаты приходят с лицом собеседника")
                        RowDivider(leading: 52)
                        row(icon: "arrow.triangle.2.circlepath",
                            title: "Свежая лента к запуску", subtitle: "образы подгружаются заранее")
                        RowDivider(leading: 52)
                        row(icon: "play.rectangle.on.rectangle",
                            title: "Актуальная серия клипов", subtitle: "новые примерки готовы к открытию")
                    }
                }
                group("Приватность") {
                    Button { nav.push(LooksRoute.lock) } label: {
                        row(icon: "faceid", title: "Замок на «Сохранённое»",
                            subtitle: "Face ID на черновики", chevron: true)
                    }
                    .buttonStyle(HighlightStyle())
                    RowDivider(leading: 52)
                    Button { nav.push(LooksRoute.ads) } label: {
                        row(icon: "sparkles", title: "Реклама по интересам", subtitle: "Можно отключить", chevron: true)
                    }
                    .buttonStyle(HighlightStyle())
                }
                group("О приложении") {
                    row(icon: "questionmark.circle", title: "Помощь", chevron: true)
                    RowDivider(leading: 52)
                    row(icon: "doc.text", title: "Пользовательское соглашение", chevron: true)
                    RowDivider(leading: 52)
                    row(icon: "info.circle", title: "Версия", value: "1.0")
                }
            }
            .padding(.vertical, t.cardGap)
        }
        .background(t.background)
        .navigationTitle("Настройки").navigationBarTitleDisplayMode(.inline)
    }

    @ViewBuilder private func group<C: View>(_ title: String, @ViewBuilder content: () -> C) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title).font(.system(size: 13, weight: .medium)).foregroundStyle(t.textSecondary)
                .padding(.horizontal, t.pad + 12)
            Card { content() }
        }
    }

    private func row(icon: String, title: String, subtitle: String? = nil,
                     value: String? = nil, chevron: Bool = false) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon).font(.system(size: 17)).foregroundStyle(t.accent).frame(width: 28)
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.dsBody).foregroundStyle(t.textPrimary)
                if let subtitle { Text(subtitle).font(.dsMeta).foregroundStyle(t.textSecondary) }
            }
            Spacer()
            if let value { Text(value).font(.dsBody).foregroundStyle(t.textSecondary) }
            if chevron {
                Image(systemName: "chevron.right").font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(t.textTertiary)
            }
        }
        .padding(.horizontal, 12).padding(.vertical, 12)
        .contentShape(Rectangle())
    }

    private func toggleRow(icon: String, title: String, isOn: Binding<Bool>,
                           action: @escaping (Bool) async -> Void) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon).font(.system(size: 17)).foregroundStyle(t.accent).frame(width: 28)
            Text(title).font(.dsBody).foregroundStyle(t.textPrimary)
            Spacer()
            Toggle("", isOn: isOn).labelsHidden()
                .onChange(of: isOn.wrappedValue) { _, v in Task { await action(v) } }
        }
        .padding(.horizontal, 12).padding(.vertical, 10)
    }
}

/// Ячейка сетки гардероба.
struct OutfitGridCell: View {
    let glyph: String
    let seed: Int
    @Environment(\.theme) private var t
    private var tint: Color {
        let p = ["5B7CFA", "E0719A", "3FA88C", "E08A4B", "8B6EE0", "5AA9E6"]
        return Color(hex: p[abs(seed) % p.count])
    }
    var body: some View {
        ZStack {
            LinearGradient(colors: [tint.opacity(0.18), tint.opacity(0.38)],
                           startPoint: .top, endPoint: .bottom)
            Image(systemName: glyph).font(.system(size: 30, weight: .ultraLight))
                .foregroundStyle(tint)
        }
        .aspectRatio(0.82, contentMode: .fit)
    }
}

extension Array {
    subscript(safe i: Int) -> Element? { indices.contains(i) ? self[i] : nil }
}
