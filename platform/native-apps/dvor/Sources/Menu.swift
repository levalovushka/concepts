import SwiftUI

struct MenuTile: Identifiable {
    let id = UUID()
    let title: String
    let symbol: String
    let from: UInt32
    let to: UInt32
    let route: Route?
    var access: [Access] = []
}

struct MenuView: View {
    @Environment(Nav.self) private var nav
    @Environment(AccessStore.self) private var access

    private let tiles: [MenuTile] = [
        .init(title: "Соседи", symbol: "person.2.fill", from: 0x6A5AE0, to: 0x8E7BFF, route: .neighbors, access: [.contacts]),
        .init(title: "Счётчики", symbol: "gauge.with.dots.needle.33percent", from: 0x0FA88E, to: 0x2ECFA8, route: .meters),
        .init(title: "События", symbol: "calendar", from: 0xE8891A, to: 0xF7B733, route: .events, access: [.calendar]),
        .init(title: "Пароли дома", symbol: "key.fill", from: 0x4A5059, to: 0x767E8A, route: .passwords),
        .init(title: "Гостевая сеть", symbol: "wifi", from: 0xC0399F, to: 0xF061C2, route: .guest),
        .init(title: "Хроника", symbol: "photo.stack.fill", from: 0xE5442E, to: 0xFF7A4D, route: .chronicle, access: [.photos]),
        .init(title: "Чаты", symbol: "bubble.left.fill", from: 0x5B4CE0, to: 0x7E6BFF, route: nil),
        .init(title: "Реклама", symbol: "megaphone.fill", from: 0xE03B57, to: 0xFF6B82, route: .ads, access: [.tracking]),
    ]

    private let columns = Array(repeating: GridItem(.flexible(), spacing: 10), count: 4)

    var body: some View {
        Page(spacing: 10) {
            HStack {
                Text("Меню").font(.system(size: 26, weight: .bold)).foregroundStyle(D.ink)
                Spacer()
                Button { nav.push(.settings) } label: {
                    Image(systemName: "gearshape.fill").font(.system(size: 20)).foregroundStyle(D.accent)
                }
                .accessibilityLabel("Настройки")
            }

            DCard {
                DRow(title: Concept.me.name,
                     subtitle: "кв. \(Concept.me.flatNumber) · \(Concept.me.entrance) подъезд · \(nav.homeConfirmed ? "дом подтверждён" : "заявка на проверке")") {
                    DAvatar(size: 52)
                } action: { nav.push(.profile) }

                DHair(inset: 0)

                HStack(spacing: 0) {
                    stat("18", "соседей рядом")
                    Rectangle().fill(D.line).frame(width: 0.5, height: 34)
                    stat("4", "открытых заявки")
                }
                .padding(.vertical, 12)
            }

            DCard(padding: D.inset) {
                LazyVGrid(columns: columns, spacing: 14) {
                    ForEach(tiles) { tile in tileView(tile) }
                }
            }

            DSectionTitle(text: "Дом")
            DCard {
                DRow(title: "Схема двора") {
                    DBullet(symbol: "map")
                } trailing: {
                    HStack(spacing: 6) {
                        Text("3 корпуса").font(.system(size: 14)).foregroundStyle(D.sub)
                        DChevron()
                    }
                } action: { nav.tab = .yard }
                DHair(inset: 56)
                DRow(title: "Настройки") {
                    DBullet(symbol: "shield")
                } action: { nav.push(.settings) }
            }
        }
        .accessibilityIdentifier("screen.menu")
    }

    private func stat(_ value: String, _ label: String) -> some View {
        VStack(spacing: 2) {
            Text(value).font(.data(20, .bold)).foregroundStyle(D.ink)
            Text(label).font(.system(size: 13)).foregroundStyle(D.sub)
        }
        .frame(maxWidth: .infinity)
    }

    /// Декоративная плитка меню: свой набор из восьми пар цветов,
    /// в семантические токены он не входит.
    private func tileView(_ tile: MenuTile) -> some View {
        Button {
            guard let route = tile.route else { nav.tab = .chats; return }
            if tile.access.isEmpty {
                nav.push(route)
            } else {
                Task {
                    let ok = await access.request(tile.access, on: "menu")
                    if ok || route == .ads { nav.push(route) }
                    else { nav.show("Доступ не выдан — \(tile.title.lowercased()) работает частично") }
                }
            }
        } label: {
            VStack(spacing: 5) {
                RoundedRectangle(cornerRadius: 15, style: .continuous)
                    .fill(LinearGradient(colors: [Color(hex: tile.from), Color(hex: tile.to)],
                                         startPoint: .topLeading, endPoint: .bottomTrailing))
                    .aspectRatio(1, contentMode: .fit)
                    .overlay {
                        Image(systemName: tile.symbol)
                            .font(.system(size: 22, weight: .medium))
                            .foregroundStyle(.white)
                            .shadow(color: .black.opacity(0.15), radius: 1, y: 1)
                    }
                Text(tile.title)
                    .font(.system(size: 11))
                    .foregroundStyle(D.ink)
                    .lineLimit(2)
                    .multilineTextAlignment(.center)
                    .frame(height: 27, alignment: .top)
            }
        }
        .buttonStyle(.plain)
        .accessibilityIdentifier("tile.\(tile.title)")
    }
}
