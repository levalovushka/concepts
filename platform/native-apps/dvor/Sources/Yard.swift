import SwiftUI

/// Схема двора. Координаты — те же доли, что в разметке концепта:
/// корпуса, проезд, площадка и парковка, свой дом акцентом, метка проблемы.
struct YardPlan: View {
    var compact = false

    var body: some View {
        GeometryReader { geo in
            let w = geo.size.width
            let h = geo.size.height
            ZStack(alignment: .topLeading) {
                Color(hex: 0xE4EBDE)

                block(w, h, 0.06, 0, 0.09, 1.0, fill: Color(hex: 0xD6D8DC))
                block(w, h, 0, 0.74, 1.0, 0.12, fill: Color(hex: 0xD6D8DC))

                building(w, h, 0.20, 0.06, 0.46, 0.12, title: "10")
                building(w, h, 0.72, 0.06, 0.12, 0.50, title: "14")

                zone(w, h, 0.21, 0.24, 0.21, 0.14, title: "площадка")
                zone(w, h, 0.46, 0.24, 0.20, 0.14, title: "парковка")

                building(w, h, 0.20, 0.44, 0.46, 0.12, title: "12", mine: true)

                marker(w, h, 0.36, 0.645) {
                    Circle().fill(D.accent).frame(width: 13, height: 13)
                        .overlay { Circle().strokeBorder(.white, lineWidth: 2.5) }
                        .background { Circle().fill(D.accent.opacity(0.25)).frame(width: 26, height: 26) }
                }
                marker(w, h, 0.55, 0.63) {
                    Image(systemName: "mappin.circle.fill")
                        .font(.system(size: 24))
                        .foregroundStyle(D.red)
                        .shadow(color: .black.opacity(0.2), radius: 2, y: 1)
                }
            }
        }
        .frame(height: compact ? 120 : 168)
        .clipShape(RoundedRectangle(cornerRadius: D.radius, style: .continuous))
    }

    private func block(_ w: CGFloat, _ h: CGFloat, _ x: CGFloat, _ y: CGFloat,
                       _ bw: CGFloat, _ bh: CGFloat, fill: Color) -> some View {
        Rectangle().fill(fill)
            .frame(width: w * bw, height: h * bh)
            .offset(x: w * x, y: h * y)
    }

    private func building(_ w: CGFloat, _ h: CGFloat, _ x: CGFloat, _ y: CGFloat,
                          _ bw: CGFloat, _ bh: CGFloat, title: String, mine: Bool = false) -> some View {
        RoundedRectangle(cornerRadius: 4, style: .continuous)
            .fill(mine ? D.accent : Color(hex: 0xB8BDC6))
            .frame(width: w * bw, height: h * bh)
            .overlay {
                Text(title)
                    .font(.data(compact ? 10 : 12, .semibold))
                    .foregroundStyle(mine ? .white : Color(hex: 0x4A5059))
            }
            .offset(x: w * x, y: h * y)
    }

    private func zone(_ w: CGFloat, _ h: CGFloat, _ x: CGFloat, _ y: CGFloat,
                      _ bw: CGFloat, _ bh: CGFloat, title: String) -> some View {
        RoundedRectangle(cornerRadius: 4, style: .continuous)
            .fill(Color(hex: 0xCFE0C2))
            .overlay {
                RoundedRectangle(cornerRadius: 4, style: .continuous)
                    .strokeBorder(Color(hex: 0x7FA36A), style: StrokeStyle(lineWidth: 1, dash: [3, 2]))
            }
            .overlay {
                Text(title)
                    .font(.system(size: compact ? 8 : 10))
                    .foregroundStyle(Color(hex: 0x4C6B3C))
            }
            .frame(width: w * bw, height: h * bh)
            .offset(x: w * x, y: h * y)
    }

    private func marker<V: View>(_ w: CGFloat, _ h: CGFloat, _ x: CGFloat, _ y: CGFloat,
                                 @ViewBuilder content: () -> V) -> some View {
        content().offset(x: w * x, y: h * y)
    }
}

struct YardView: View {
    @Environment(Nav.self) private var nav
    @Environment(AccessStore.self) private var access

    var body: some View {
        Page(spacing: 10) {
            HStack(spacing: 4) {
                Text("Двор").font(.system(size: 26, weight: .bold)).foregroundStyle(D.ink)
                Image(systemName: "chevron.down").font(.system(size: 14, weight: .semibold)).foregroundStyle(D.ink)
                Spacer()
                Button { nav.present(.problem) } label: {
                    Image(systemName: "plus").font(.system(size: 21, weight: .medium)).foregroundStyle(D.accent)
                }
                .accessibilityLabel("Поставить метку")
            }

            YardPlan()
            DCard(padding: 10) {
                Text("\(Concept.house.address) · \(Concept.house.radiusMeters) м · метка — заявка")
                    .font(.system(size: 13)).foregroundStyle(D.sub)
            }

            DSectionTitle(text: "Сервисы двора")
            DCard {
                DRow(title: "Гостевая сеть", subtitle: "\(Concept.guest.ssid), QR \(Concept.guest.qrLocation)") {
                    DBullet(symbol: "wifi")
                } action: { nav.push(.guest) }
                DHair(inset: 56)
                DRow(title: "Счётчики", subtitle: "вода и электричество") {
                    DBullet(symbol: "gauge.with.dots.needle.33percent")
                } trailing: {
                    HStack(spacing: 6) {
                        Text("до 25 апреля").font(.system(size: 14, weight: .medium)).foregroundStyle(D.orangeInk)
                        DChevron()
                    }
                } action: { nav.push(.meters) }
                DHair(inset: 56)
                DRow(title: "События дома", subtitle: "субботник 12 апреля") {
                    DBullet(symbol: "calendar")
                } action: { nav.push(.events) }
                DHair(inset: 56)
                DRow(title: "Мусорные баки", subtitle: "вывоз по чётным") {
                    DBullet(symbol: "trash")
                } trailing: { EmptyView() }
            }
        }
        .accessibilityIdentifier("screen.yard")
    }
}
