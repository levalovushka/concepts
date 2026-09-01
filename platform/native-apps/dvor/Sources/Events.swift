import SwiftUI

struct HouseEvent: Identifiable, Decodable {
    var id: String { title + when }
    let title: String
    let when: String
    let symbol: String
    let tone: String
}

/// Самостоятельный раздел событий заменяет коммуникационную вкладку:
/// здесь только даты, общий контекст дома и переход к исходному объявлению.
struct EventsHubView: View {
    @Environment(Nav.self) private var nav
    @Environment(AccessStore.self) private var access
    private let events: [HouseEvent] = Fixtures.load("events")

    var body: some View {
        Page(spacing: 10) {
            HStack {
                Text("События").font(.system(size: 26, weight: .bold)).foregroundStyle(D.ink)
                Spacer()
                Image(systemName: "calendar").font(.system(size: 19, weight: .medium)).foregroundStyle(D.accent)
            }

            DCard {
                ForEach(Array(events.enumerated()), id: \.element.id) { index, event in
                    DRow(title: event.title, subtitle: event.when) {
                        DBullet(symbol: event.symbol, tint: tone(event.tone))
                    } trailing: { DChevron() } action: { nav.push(.events) }
                    if index < events.count - 1 { DHair(inset: 56) }
                }
            }

            DSectionTitle(text: "Заявка в диспетчерскую")
            DCard {
                DRow(title: "Надиктовать заявку", subtitle: "получится текстовый черновик") {
                    DBullet(symbol: "waveform", tint: D.accent)
                } action: {
                    Task {
                        let ok = await access.request([.mic, .speech], on: "events")
                        nav.show(ok ? "Черновик записан — проверьте текст" : Access.mic.fallback)
                    }
                }
                DHair(inset: 56)
                DRow(title: "Ответы диспетчера", subtitle: "по номеру и статусу заявки") {
                    DBullet(symbol: "checkmark.message.fill", tint: D.green)
                } action: {
                    access.activate(.commnotif, on: "events")
                    nav.show("Именные ответы по заявке включены")
                }
            }
            DeniedNotice(key: .mic)
            DeniedNotice(key: .speech)

            DSectionTitle(text: "На этой неделе")
            DCard {
                DRow(title: "Два общих дела", subtitle: "субботник и показания счётчиков") {
                    DBullet(symbol: "checkmark.circle.fill", tint: D.green)
                } action: { nav.push(.events) }
                DHair(inset: 56)
                DRow(title: "Одно важное объявление", subtitle: "работы с водой 14–17 апреля") {
                    DBullet(symbol: "exclamationmark.triangle.fill", tint: D.orange)
                } action: { nav.push(.post) }
            }
        }
        .accessibilityIdentifier("screen.events")
    }

    private func tone(_ name: String) -> Color {
        switch name {
        case "green": D.green
        case "orange": D.orange
        default: D.accent
        }
    }
}
