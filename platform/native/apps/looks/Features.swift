import SwiftUI
import AVFoundation

// Экраны, отрабатывающие заявленные доступы. Каждый ключ из concept.json
// обязан иметь достижимую фичу в этой же сборке — иначе он не заявляется.


// MARK: - Звонок (voip)

struct CallScreen: View {
    let peer: String
    @Environment(\.dismiss) private var dismiss
    @Environment(Permissions.self) private var perms
    @Environment(\.theme) private var t
    @State private var connected = false
    @State private var micMuted = false
    @State private var speakerEnabled = false

    var body: some View {
        ZStack {
            LinearGradient(colors: [Color(hex: "3A4256"), Color(hex: "15171E")],
                           startPoint: .top, endPoint: .bottom).ignoresSafeArea()
            VStack(spacing: 14) {
                Spacer().frame(height: 70)
                Avatar(name: peer, size: 108)
                Text(peer).font(.role(.largeTitle)).foregroundStyle(.white)
                Text(connected ? "0:04" : "Соединение…")
                    .font(.role(.timer)).foregroundStyle(.white.opacity(0.7))
                Spacer()
                HStack(spacing: 26) {
                    callButton(micMuted ? "mic.fill" : "mic.slash.fill",
                               label: micMuted ? "Включить микрофон" : "Выключить микрофон",
                               tint: micMuted ? .white.opacity(0.34) : .white.opacity(0.18)) {
                        withAnimation { micMuted.toggle() }
                    }
                    callButton("phone.down.fill", label: "Завершить звонок", tint: Color(hex: "E64646")) { dismiss() }
                    callButton("speaker.wave.2.fill",
                               label: speakerEnabled ? "Выключить громкую связь" : "Громкая связь",
                               tint: speakerEnabled ? Color(hex: "4B8BF5") : .white.opacity(0.18)) {
                        speakerEnabled.toggle()
                        try? AVAudioSession.sharedInstance().overrideOutputAudioPort(
                            speakerEnabled ? .speaker : .none
                        )
                    }
                }
                Spacer().frame(height: 50)
            }
        }
        .toolbar(.hidden, for: .tabBar)
        .navigationBarBackButtonHidden()
        .task {
            await perms.request(.voip)
            try? await Task.sleep(nanoseconds: 1_200_000_000)
            withAnimation { connected = true }
        }
    }
    private func callButton(_ icon: String, label: String, tint: Color,
                            action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: icon).font(.system(size: 24)).foregroundStyle(.white)
                .frame(width: 66, height: 66).background(tint, in: Circle())
        }
        .pressable(scale: 0.92)
        .accessibilityLabel(label)
    }
}


// MARK: - Разбор гардероба голосом в фоне (audio)

struct TalkScreen: View {
    @Environment(LooksStore.self) private var store
    @Environment(Permissions.self) private var perms
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var playing = false

    /// Соседние строки в разных состояниях: у живого приложения так и бывает.
    private let episodes: [(String, String, String)] = [
        ("Что вы носите на самом деле", "18 мин · сегодня", "скачано"),
        ("11 вещей, которые лежат год", "24 мин · вторник", "скачивается 62 %"),
        ("Разбор по цветам: почему всё серое", "9 мин · 14 окт", "прослушан"),
        ("Капсула на ноябрь", "31 мин · 9 окт", "не скачан, 38 МБ"),
        ("Что отдать на своп", "12 мин · 2 окт", "прослушан"),
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                VKGroup {
                    VStack(spacing: 14) {
                        VKMedia(assetName: LooksMediaAssets.wardrobe, height: 170)
                        Text("Разбор гардероба").font(.vkSection)
                        Text("18 минут · собран по вашим \(store.garments.count) вещам")
                            .font(.vkBody).foregroundStyle(t.textSecondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 16)
                        HStack(spacing: 34) {
                            Image(systemName: "gobackward.15").font(.system(size: 24))
                            Button {
                                Task {
                                    await perms.request(.audio)
                                    withAnimation { playing.toggle() }
                                    if playing { nav.toast("Играет в фоне — можно гасить экран") }
                                }
                            } label: {
                                Image(systemName: playing ? "pause.circle.fill" : "play.circle.fill")
                                    .font(.system(size: 58)).foregroundStyle(t.accent)
                            }
                            .pressable(scale: 0.92)
                            .accessibilityLabel(playing ? "Пауза" : "Слушать разбор")
                            Image(systemName: "goforward.15").font(.system(size: 24))
                        }
                        .foregroundStyle(t.textPrimary)
                        .padding(.bottom, 16)
                    }
                }

                if !ShotMode.isScreen("talk", state: "loading") {
                VKGroup {
                    VKSectionHeader(title: "Разборы", count: "\(episodes.count)")
                    ForEach(Array(episodes.enumerated()), id: \.offset) { i, e in
                        HStack(spacing: 12) {
                            Image(systemName: "waveform").font(.system(size: 20))
                                .foregroundStyle(t.accent)
                                .frame(width: 44, height: 44)
                                .background(t.accentSoft, in: RoundedRectangle(cornerRadius: 10, style: .continuous))
                            VStack(alignment: .leading, spacing: 2) {
                                Text(e.0).font(.role(.action))
                                    .foregroundStyle(t.textPrimary).lineLimit(1)
                                Text("\(e.1) · \(e.2)").font(.vkMeta)
                                    .foregroundStyle(t.textSecondary).lineLimit(1)
                            }
                            Spacer(minLength: 8)
                            if e.2.hasPrefix("скачивается") {
                                ProgressView(value: 0.62)
                                    .progressViewStyle(.circular)
                                    .scaleEffect(0.8)
                            } else if e.2 == "скачано" {
                                Image(systemName: "arrow.down.circle.fill")
                                    .font(.system(size: 18)).foregroundStyle(t.positive)
                            }
                        }
                        .padding(.horizontal, t.pad).padding(.vertical, 8)
                        if i < episodes.count - 1 { RowSeparator(leading: 72) }
                    }
                    Color.clear.frame(height: 8)
                }
                }
            }
            .padding(.bottom, 88)
        }
        .background(t.background)
        .navigationTitle("Разбор голосом").navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Отметка на свопе по сети площадки (wifiinfo + hotspot)

struct CheckinScreen: View {
    @Environment(Permissions.self) private var perms
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var joined = false
    @State private var checked = false
    /// Каждая строка сообщает своё, а не заполненный шаблон.
    private let arrived: [(String, String, String)] = [
        ("Аня Котова", "принесла 3 вещи, забрала пальто", "14:02"),
        ("Марк Львов", "пришёл без вещей, смотрит", "14:09"),
        ("Даша Ким", "меняет платье на жакет", "14:23"),
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                VKGroup {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Своп у Ани на Мясницкой").font(.vkSection)
                        Text("Отметятся 34 человека · вы ещё нет")
                            .font(.vkBody).foregroundStyle(t.textSecondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(12)
                }
                if ShotMode.isScreen("checkin", state: "denied") {
                    AppStatePanel(kind: .warning, title: "Сеть площадки недоступна",
                                  detail: "Организатор отметит вас вручную на входе.")
                        .padding(.horizontal, t.pad).padding(.bottom, 8)
                }
                if ShotMode.isScreen("checkin", state: "error") {
                    AppStatePanel(kind: .error, title: "Отметка не прошла",
                                  detail: "Подключитесь к сети площадки и попробуйте ещё раз.")
                        .padding(.horizontal, t.pad).padding(.bottom, 8)
                }
                VKGroup {
                    stepRow(n: 1, title: "Гостевая сеть площадки",
                            sub: joined ? "Подключено · PUDRA-GUEST" : "Подключиться по QR",
                            done: joined) {
                        nav.push(LooksRoute.netqr)
                    }
                    RowSeparator(leading: 60)
                    stepRow(n: 2, title: "Отметиться на свопе",
                            sub: checked ? "Вы на месте" : (joined ? "Проверим сеть" : "Сначала подключитесь"),
                            done: checked, enabled: joined) {
                        Task {
                            let ok = await perms.request(.wifiinfo)
                            if ok { withAnimation { checked = true }; nav.toast("Отметка засчитана") }
                            else { nav.toast("Отметит организатор вручную", once: "wifiinfo") }
                        }
                    }
                }
                VKGroup {
                    Text("Уже отметились")
                        .font(.role(.groupHeader)).foregroundStyle(t.textSecondary)
                        .padding(.horizontal, 12).padding(.top, 12).padding(.bottom, 8)
                    ForEach(arrived, id: \.0) { p in
                        HStack(spacing: 12) {
                            Avatar(name: p.0, size: 36)
                            VStack(alignment: .leading, spacing: 1) {
                                Text(p.0).font(.role(.pill))
                                Text(p.1).font(.vkCaption).foregroundStyle(t.textSecondary)
                            }
                            Spacer()
                            Text(p.2).font(.vkCaption.monospacedDigit())
                                .foregroundStyle(t.textSecondary)
                        }
                        .padding(.horizontal, 12).padding(.vertical, 6)
                    }
                    RowSeparator(leading: 12)
                    HStack {
                        Text("34 человека идут · 12 уже на месте")
                            .font(.vkMeta).foregroundStyle(t.textSecondary)
                        Spacer()
                    }
                    .padding(12)
                }
                if !joined {
                    VKGroup { FallbackNote(text: "Без гостевой сети отметку подтвердит организатор").padding(12) }
                }
            }
            .padding(.bottom, 88)
        }
        .background(t.background)
        .navigationTitle("Отметка на свопе").navigationBarTitleDisplayMode(.inline)
    }

    private func stepRow(n: Int, title: String, sub: String, done: Bool,
                         enabled: Bool = true,
                         action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                ZStack {
                    Circle().fill(done ? t.positive : t.accentSoft).frame(width: 32, height: 32)
                    if done { Image(systemName: "checkmark").font(.system(size: 14, weight: .bold)).foregroundStyle(.white) }
                    else { Text("\(n)").font(.role(.name)).foregroundStyle(t.accent) }
                }
                VStack(alignment: .leading, spacing: 2) {
                    Text(title).font(.vkBody).foregroundStyle(t.textPrimary)
                    Text(sub).font(.vkMeta).foregroundStyle(t.textSecondary)
                }
                Spacer()
                if !done && enabled {
                    Image(systemName: "chevron.right").font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(t.textTertiary)
                }
            }
            .padding(.horizontal, 12).padding(.vertical, 12)
            .contentShape(Rectangle())
        }
        .buttonStyle(HighlightStyle())
    }
}

// MARK: - Код-пароль на «Сохранённое» (faceid)

struct LockScreen: View {
    @Environment(Permissions.self) private var perms
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var unlocked = false

    var body: some View {
        VStack(spacing: 16) {
            Spacer()
            Image(systemName: unlocked ? "lock.open.fill" : "faceid")
                .font(.system(size: 58, weight: .light)).foregroundStyle(t.accent)
            if ShotMode.isScreen("lock", state: "denied") {
                AppStatePanel(kind: .warning, title: "Face ID недоступен",
                              detail: "Откройте «Сохранённое» код-паролем устройства.")
                    .padding(.horizontal, t.pad)
            }
            Text(unlocked ? "Открыто" : "«Сохранённое» под замком")
                .font(.role(.section))
            Text(unlocked ? "Черновики и сохранённые образы доступны"
                          : "Подтвердите Face ID, чтобы открыть черновики и сохранённые образы")
                .font(.vkBody).foregroundStyle(t.textSecondary)
                .multilineTextAlignment(.center).padding(.horizontal, 30)
            // размытое превью того, что за замком — иначе экран пустой
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 6), count: 3), spacing: 6) {
                ForEach(0..<6, id: \.self) { i in
                    VKGridCell(assetName: LooksMediaAssets.detail(i))
                        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                        .blur(radius: unlocked ? 0 : 9)
                        .overlay {
                            if !unlocked {
                                RoundedRectangle(cornerRadius: 10, style: .continuous)
                                    .fill(t.card.opacity(0.25))
                            }
                        }
                }
            }
            .padding(.horizontal, 4)
            .animation(.easeOut(duration: 0.3), value: unlocked)

            Text(unlocked ? "12 черновиков · 34 сохранённых образа"
                          : "12 черновиков и 34 сохранённых образа под замком")
                .font(.vkMeta).foregroundStyle(t.textSecondary)

            Spacer()
            if !unlocked {
                VKButton(title: "Разблокировать", icon: "faceid") {
                    Task {
                        let ok = await perms.request(.faceid)
                        if ok { withAnimation { unlocked = true } }
                        else { nav.toast("Введите код-пароль приложения", once: "faceid") }
                    }
                }
                Button("Ввести код-пароль") { withAnimation { unlocked = true } }
                    .font(.system(size: 15)).foregroundStyle(t.accent)
            }
        }
        .padding(t.pad)
        .background(t.card)
        .navigationTitle("Сохранённое").navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .tabBar)
    }
}





// MARK: - Своп в календарь (calendar)

struct SwapScreen: View {
    @Environment(Permissions.self) private var perms
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var added = false

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                VKGroup {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Обмен с Аней Котовой").font(.vkSection)
                        InfoLine(icon: "arrow.left.arrow.right", text: "Тренч оверсайз ↔ Жакет")
                        InfoLine(icon: "calendar", text: "Суббота, 15:00")
                        InfoLine(icon: "mappin.and.ellipse", text: "Лофт на Мясницкой")
                    }
                    .padding(12)
                }
                VKGroup {
                    Button {
                        Task {
                            let ok = await perms.request(.calendar)
                            withAnimation { added = true }
                            nav.toast(ok ? "Обмен в календаре — подвинется, если перенесут"
                                         : "Записали. Календарь недоступен", once: "calendar")
                        }
                    } label: {
                        HStack(spacing: 8) {
                            Image(systemName: added ? "checkmark.circle.fill" : "calendar.badge.plus")
                            Text(added ? "В календаре" : "Добавить в календарь")
                        }
                        .font(.system(size: 16, weight: .medium))
                        .foregroundStyle(added ? t.positive : t.accent)
                        .frame(maxWidth: .infinity).padding(.vertical, 14)
                    }
                    .buttonStyle(HighlightStyle())
                }
                // Отметка на свопе живёт под обменом — как в спеке (parent: swap).
                VKGroup {
                    Button { nav.push(LooksRoute.checkin) } label: {
                        HStack(spacing: 12) {
                            Image(systemName: "mappin.circle").font(.system(size: 20))
                                .foregroundStyle(t.accent).frame(width: 24)
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Отметиться на месте").font(.vkRow)
                                    .foregroundStyle(t.textPrimary)
                                Text("34 человека уже отметились")
                                    .font(.vkMeta).foregroundStyle(t.textSecondary)
                            }
                            Spacer()
                            Image(systemName: "chevron.right").font(.system(size: 14, weight: .semibold))
                                .foregroundStyle(t.textTertiary)
                        }
                        .padding(.horizontal, 16).padding(.vertical, 12)
                    }
                    .buttonStyle(HighlightStyle())
                }
            }
            .padding(.bottom, 88)
        }
        .background(t.background)
        .navigationTitle("Обмен").navigationBarTitleDisplayMode(.inline)
    }
}

struct InfoLine: View {
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

/// Что остаётся, если доступ не дали. Проверяется тестом.
struct FallbackNote: View {
    let text: String
    @Environment(\.theme) private var t
    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "info.circle.fill").font(.system(size: 15)).foregroundStyle(t.textSecondary)
            Text(text).font(.vkMeta).foregroundStyle(t.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
            Spacer()
        }
    }
}


// MARK: - Гостевая сеть площадки по QR (hotspot)

struct NetQRScreen: View {
    @Environment(Permissions.self) private var perms
    @Environment(Nav.self) private var nav
    @Environment(\.dismiss) private var dismiss
    @Environment(\.theme) private var t
    @State private var joined = false

    var body: some View {
        VStack(spacing: 18) {
            if ShotMode.isScreen("netqr", state: "error") {
                AppStatePanel(kind: .error, title: "Сеть не приняла код",
                              detail: "QR устарел — попросите организатора показать новый.")
                    .padding(.horizontal, t.pad)
            }
            Spacer()
            ZStack {
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(t.fieldFill).frame(width: 200, height: 200)
                Image(systemName: joined ? "wifi.circle.fill" : "qrcode")
                    .font(.system(size: joined ? 92 : 110, weight: .ultraLight))
                    .foregroundStyle(joined ? t.positive : t.textPrimary)
            }
            Text(joined ? "PUDRA-GUEST" : "Наведите на QR площадки")
                .font(.role(.section)).foregroundStyle(t.textPrimary)
            Text(joined
                 ? "Подключено. Теперь отметка на свопе пройдёт"
                 : "Код на входе у организатора")
                .font(.vkBody).foregroundStyle(t.textSecondary)
                .multilineTextAlignment(.center).padding(.horizontal, 26)
            Spacer()
            if !joined {
                VKButton(title: "Подключиться к сети", icon: "wifi") {
                    Task {
                        let ok = await perms.request(.hotspot)
                        if ok { withAnimation { joined = true } }
                        else { nav.toast("Подключитесь к сети вручную в Настройках", once: "hotspot") }
                    }
                }
            } else {
                VKButton(title: "Готово", icon: "checkmark") { dismiss() }
            }
            FallbackNote(text: "Без подключения отметку подтвердит организатор")
        }
        .padding(t.pad)
        .background(t.card)
        .navigationTitle("Сеть площадки").navigationBarTitleDisplayMode(.inline)
    }
}
