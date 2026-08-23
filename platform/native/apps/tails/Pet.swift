import SwiftUI

// Профиль питомца — главное отличие продукта: страница принадлежит собаке,
// а человек указан рядом. Ветпаспорт лежит под замком, прививки уезжают
// в системный календарь, заметка о самочувствии пишется голосом.

struct PetScreen: View {
    let pet: Pet
    @Environment(TailsStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var tab = 0

    private var moments: [Moment] { store.moments.filter { $0.pet.name == pet.name } }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                header
                GroupGap()
                stats
                GroupGap()

                VKTabs(items: ["Моменты", "Прогулки", "Здоровье"], selection: $tab)
                RowSeparator(leading: 0)

                switch tab {
                case 1: walks
                case 2: health
                default: momentList
                }
                Color.clear.frame(height: 60)
            }
        }
        .background(t.background)
        .vkNavigation(pet.isMine ? "Мой питомец" : "Профиль питомца") {
            Button { nav.push(TailsRoute.settings) } label: { Image(systemName: "gearshape") }
                .accessibilityLabel("Настройки")
                .opacity(pet.isMine ? 1 : 0)
        }
    }

    private var header: some View {
        VStack(spacing: 10) {
            Avatar(name: pet.name, size: 96, online: pet.isMine)
                .padding(.top, 16)
            Text(pet.name).font(.role(.largeTitle))
            Text("\(pet.breed) · \(pet.age)").textStyle(.body).foregroundStyle(t.textSecondary)
            HStack(spacing: 6) {
                Image(systemName: "person.crop.circle").font(.system(size: 14))
                Text(pet.owner).textStyle(.meta)
            }
            .foregroundStyle(t.textSecondary)
            Text(pet.temper).textStyle(.action)
                .padding(.horizontal, 12).frame(height: 30)
                .background(t.accentSoft, in: Capsule())
            if !pet.isMine {
                HStack(spacing: 10) {
                    VKButton(title: "Написать", icon: "bubble.left") {
                        nav.push(TailsRoute.chat(store.dialogs[0]))
                    }
                    VKOutlineButton(title: "Позвать гулять", icon: "figure.walk") {
                        nav.push(TailsRoute.walk(store.walks[0]))
                    }
                }
                .padding(.horizontal, t.pad).padding(.top, 4)
            }
        }
        .padding(.bottom, 16)
        .frame(maxWidth: .infinity)
    }

    private var stats: some View {
        HStack(spacing: 0) {
            stat("\(moments.count)", "моментов")
            Rectangle().fill(t.separator).frame(width: 0.5, height: 28)
            stat("\(store.walks.filter { $0.pets.contains(pet.name) }.count)", "прогулок")
            Rectangle().fill(t.separator).frame(width: 0.5, height: 28)
            stat(pet.isMine ? "18" : "9", "знакомых")
        }
        .padding(.vertical, 14)
        .background(t.background)
    }

    private func stat(_ value: String, _ label: String) -> some View {
        VStack(spacing: 2) {
            Text(value).textStyle(.cardTitle)
            Text(label).textStyle(.meta)
        }
        .frame(maxWidth: .infinity)
    }

    @ViewBuilder private var momentList: some View {
        if moments.isEmpty {
            AppStatePanel(kind: .empty, title: "Моментов пока нет",
                          detail: "Расскажите о прогулке — она появится в ленте района.")
                .padding(t.pad)
        } else {
            ForEach(moments) { moment in
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Image(systemName: moment.kind.systemImage).font(.system(size: 12))
                            .foregroundStyle(t.textSecondary)
                        Text(moment.published).textStyle(.meta)
                    }
                    Text(moment.title).textStyle(.rowTitle)
                    Text(moment.text).textStyle(.meta).lineLimit(2)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, t.pad).padding(.vertical, 12)
                RowSeparator(leading: 16)
            }
        }
    }

    @ViewBuilder private var walks: some View {
        ForEach(store.walks.filter { $0.pets.contains(pet.name) }) { walk in
            Button { nav.push(TailsRoute.walk(walk)) } label: {
                VKRow(title: walk.place, subtitle: "\(walk.when) · \(walk.state.rawValue)",
                      icon: "figure.walk")
            }
            .buttonStyle(HighlightStyle())
            RowSeparator(leading: 60)
        }
    }

    @ViewBuilder private var health: some View {
        Button { nav.push(TailsRoute.vaccine) } label: {
            VKRow(title: "Прививки и обработки",
                  subtitle: "ближайшая — через 12 дней", icon: "syringe")
        }
        .buttonStyle(HighlightStyle())
        RowSeparator(leading: 60)
        Button { nav.push(TailsRoute.vetnote) } label: {
            VKRow(title: "Заметка о самочувствии", subtitle: "надиктовать голосом", icon: "waveform")
        }
        .buttonStyle(HighlightStyle())
        RowSeparator(leading: 60)
        Button { nav.push(TailsRoute.lock) } label: {
            VKRow(title: "Ветпаспорт", subtitle: "под замком: диагнозы, чип, адрес выгула", icon: "lock")
        }
        .buttonStyle(HighlightStyle())
        RowSeparator(leading: 60)
        Button { nav.push(TailsRoute.course) } label: {
            VKRow(title: "Курс послушания", subtitle: "\(store.lessons.count) занятия, слушается на прогулке",
                  icon: "headphones")
        }
        .buttonStyle(HighlightStyle())
    }
}

// MARK: - Прогулка

struct WalkScreen: View {
    let walk: Walk
    @Environment(TailsStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.theme) private var t
    @State private var joined = false
    @State private var checkedIn = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                if ShotMode.isScreen("walk", state: "cancelled") {
                    AppStatePanel(kind: .warning, title: "Прогулка отменена",
                                  detail: "Организатор перенесёт время — вернём в ленту, когда назначит.")
                        .padding(t.pad)
                }
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 6) {
                        Circle().fill(walk.state == .now ? t.positive : t.accent).frame(width: 8, height: 8)
                        Text(walk.state.rawValue).textStyle(.meta)
                            .foregroundStyle(walk.state == .now ? t.positive : t.textSecondary)
                    }
                    Text(walk.place).textStyle(.section)
                    Text("\(walk.when) · \(walk.distance) · подходит: \(walk.suits)")
                        .textStyle(.body).foregroundStyle(t.textSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .padding(t.pad)
                GroupGap()

                VKSectionHeader(title: "Кто идёт", count: "\(walk.pets.count)")
                ForEach(walk.pets, id: \.self) { pet in
                    HStack(spacing: 12) {
                        Avatar(name: pet, size: 44)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(pet).textStyle(.rowTitle)
                            Text(pet == "Буся" ? "ваш питомец" : "гуляет здесь регулярно").textStyle(.meta)
                        }
                        Spacer()
                    }
                    .padding(.horizontal, t.pad).padding(.vertical, 8)
                    RowSeparator(leading: 72)
                }
                GroupGap()

                VStack(spacing: 10) {
                    VKButton(title: joined ? "Вы идёте" : "Присоединиться",
                             icon: joined ? "checkmark" : "figure.walk") {
                        Task {
                            withAnimation { joined.toggle() }
                            store.toggleJoin(walk.id)
                            if joined {
                                let ok = await perms.request(.remotenotif)
                                nav.toast(ok ? "Сообщим, если состав изменится" : "Состав смотрите в приложении")
                            }
                        }
                    }
                    VKOutlineButton(title: checkedIn ? "Вы на месте" : "Отметиться на площадке",
                                    icon: checkedIn ? "checkmark" : "wifi") {
                        Task {
                            let ok = await perms.request(.wifiinfo)
                            if ok { withAnimation { checkedIn = true } }
                            else { nav.push(TailsRoute.netqr) }
                        }
                    }
                    Text("Отметка подтверждается сетью партнёрского дог-парка, а не словом участника.")
                        .textStyle(.meta)
                }
                .padding(t.pad)
            }
        }
        .background(t.background)
        .vkNavigation("Прогулка")
    }
}
