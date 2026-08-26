import SwiftUI
import AVFoundation

// Экраны, отрабатывающие заявленные доступы. Каждый ключ из concept.json
// обязан иметь достижимую фичу в этой же сборке — иначе он не заявляется.


// MARK: - Звонок (voip)

struct CallScreen: View {
    let peer: String
    @Environment(\.dismiss) private var dismiss
    @Environment(Permissions.self) private var perms
    @Environment(\.visualLanguage) private var t
    @State private var connected = false
    @State private var micMuted = false
    @State private var speakerEnabled = false

    var body: some View {
        ZStack {
            LinearGradient(colors: t.palette.immersiveBackground,
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
                    callButton("phone.down.fill", label: "Завершить звонок", tint: t.palette.danger) { dismiss() }
                    callButton("speaker.wave.2.fill",
                               label: speakerEnabled ? "Выключить громкую связь" : "Громкая связь",
                               tint: speakerEnabled ? t.palette.accent : .white.opacity(0.18)) {
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
            try? await Task.sleep(nanoseconds: 500_000_000)
            connected = true
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
    var captureState: String? = nil
    @Environment(LooksStore.self) private var store
    @Environment(Permissions.self) private var perms
    @Environment(Nav.self) private var nav
    @Environment(\.visualLanguage) private var t
    @State private var playing = false
    @State private var selectedEpisode = 0
    @State private var recoveredFromError = false
    @State private var playbackError = false

    /// Соседние строки в разных состояниях: у живого приложения так и бывает.
    private let episodes: [(String, String, String)] = [
        ("Что вы носите на самом деле", "18 мин · сегодня", "скачано"),
        ("11 вещей, которые лежат год", "24 мин · вторник", "скачивается 62 %"),
        ("Разбор по цветам: почему всё серое", "9 мин · 14 окт", "прослушан"),
        ("Капсула на ноябрь", "31 мин · 9 окт", "не скачан, 38 МБ"),
        ("Что принести на обмен вещами", "12 мин · 2 окт", "прослушан"),
    ]

    var body: some View {
        ScrollView {
            if captureState == "loading" {
                NativeStatePanel(kind: .loading,
                                 title: "Загружаем выпуск",
                                 detail: "Подготавливаем аудио для воспроизведения.",
                                 placement: .page)
                    .padding(.horizontal, t.spacing.contentInset).padding(.top, 24)
            } else if (captureState == "error" && !recoveredFromError) || playbackError {
                NativeStatePanel(kind: .error,
                                 title: "Выпуск не загрузился",
                                 detail: "Проверьте соединение. Позиция прослушивания сохранена.",
                                 actionTitle: "Повторить",
                                 action: { recoveredFromError = true; playbackError = false; startPlayback() },
                                 placement: .page)
                    .padding(.horizontal, t.spacing.contentInset).padding(.top, 24)
            } else {
            VStack(spacing: 0) {
                VKGroup {
                    VStack(spacing: 14) {
                        VKMedia(assetName: LooksMediaAssets.wardrobe, height: 170)
                        Text(episodes[selectedEpisode].0).font(.vkSection)
                        Text("\(episodes[selectedEpisode].1) · по вашим \(store.garments.count) вещам")
                            .font(.vkBody).foregroundStyle(t.palette.textSecondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 16)
                        HStack(spacing: 34) {
                            Image(systemName: "gobackward.15").font(.system(size: 24))
                            Button {
                                if playing { withAnimation { playing = false } }
                                else { startPlayback() }
                            } label: {
                                Image(systemName: playing ? "pause.circle.fill" : "play.circle.fill")
                                    .font(.system(size: 58)).foregroundStyle(t.palette.accent)
                            }
                            .nativeAction("talk.start-background-audio")
                            .pressable(scale: 0.92)
                            .accessibilityLabel(playing ? "Пауза" : "Слушать разбор")
                            Image(systemName: "goforward.15").font(.system(size: 24))
                        }
                        .foregroundStyle(t.palette.textPrimary)
                        .padding(.bottom, 16)
                    }
                }

                VKGroup {
                    VKSectionHeader(title: "Разборы", count: "\(episodes.count)")
                    ForEach(Array(episodes.enumerated()), id: \.offset) { i, e in
                        Button {
                            selectedEpisode = i
                            playing = true
                        } label: {
                        HStack(spacing: 12) {
                            Image(systemName: selectedEpisode == i && playing ? "speaker.wave.2.fill" : "waveform")
                                .font(.system(size: 20))
                                .foregroundStyle(t.palette.accent)
                                .frame(width: 44, height: 44)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(e.0).font(.role(.action))
                                    .foregroundStyle(t.palette.textPrimary).lineLimit(1)
                                Text("\(e.1) · \(e.2)").font(.vkMeta)
                                    .foregroundStyle(t.palette.textSecondary).lineLimit(1)
                            }
                            Spacer(minLength: 8)
                            if e.2.hasPrefix("скачивается") {
                                ProgressView(value: 0.62)
                                    .progressViewStyle(.circular)
                                    .scaleEffect(0.8)
                            } else if e.2 == "скачано" {
                                Image(systemName: "arrow.down.circle.fill")
                                    .font(.system(size: 18)).foregroundStyle(t.palette.positive)
                            }
                        }
                        .padding(.horizontal, t.spacing.contentInset).padding(.vertical, 8)
                        }
                        .buttonStyle(HighlightStyle())
                        .accessibilityLabel("Включить: \(e.0)")
                        if i < episodes.count - 1 { RowSeparator(leading: 72) }
                    }
                    Color.clear.frame(height: 8)
                }
            }
            .padding(.bottom, 88)
            }
        }
        .background(t.palette.background)
        .vkNavigation("Разбор голосом")
    }

    private func startPlayback() {
        Task { @MainActor in
            let ok = await perms.request(.audio)
            withAnimation { playing = ok; playbackError = !ok }
        }
    }
}

// MARK: - Подтверждение участия в обмене по сети площадки (wifiinfo + hotspot)

struct CheckinScreen: View {
    var captureState: String? = nil
    @Environment(LooksStore.self) private var store
    @Environment(Permissions.self) private var perms
    @Environment(Nav.self) private var nav
    @Environment(\.visualLanguage) private var t
    @State private var feedback: CheckinFeedback
    /// Каждая строка сообщает своё, а не заполненный шаблон.
    private let arrived: [(String, String, String)] = [
        ("Аня Котова", "принесла 3 вещи, забрала пальто", "14:02"),
        ("Марк Львов", "пришёл без вещей, смотрит", "14:09"),
        ("Даша Ким", "меняет платье на жакет", "14:23"),
    ]

    init(captureState: String? = nil) {
        self.captureState = captureState
        let initial: CheckinFeedback = switch captureState {
        case "error": .error
        case "denied": .denied
        default: .idle
        }
        _feedback = State(initialValue: initial)
    }

    private var networkJoined: Bool {
        store.venueNetworkJoined || feedback == .error || feedback == .denied || feedback == .checking
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                VKGroup {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Обмен вещами у Ани на Мясницкой").font(.vkSection)
                        Text("Отметятся 34 человека · вы ещё нет")
                            .font(.vkBody).foregroundStyle(t.palette.textSecondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(12)
                }
                if feedback == .error {
                    VKGroup {
                        NativeStatePanel(kind: .error,
                                         title: "Не удалось отметиться",
                                         detail: "Мы сохранили попытку. Попробуйте ещё раз у входа на событие.",
                                         actionTitle: "Повторить",
                                         action: attemptCheckin,
                                         placement: .inline)
                    }
                } else if feedback == .denied {
                    VKGroup {
                        NativeStatePanel(kind: .warning,
                                         title: "Нет доступа к геопозиции",
                                         detail: "Разрешите геопозицию для доступа к Wi‑Fi или покажите QR организатору.",
                                         actionTitle: "Открыть настройки",
                                         action: openSettings,
                                         placement: .inline)
                    }
                }
                VKGroup {
                    stepRow(n: 1, title: "Гостевая сеть площадки",
                            sub: networkJoined ? "Подключено · PUDRA-GUEST" : "Подключиться по QR",
                            done: networkJoined) {
                        nav.push(LooksRoute.netqr)
                    }
                    RowSeparator(leading: 60)
                    stepRow(n: 2, title: "Подтвердить участие",
                            sub: store.checkedIn ? "Вы на месте" : (feedback == .checking ? "Проверяем сеть…" : (networkJoined ? "Проверим сеть" : "Сначала подключитесь")),
                            done: store.checkedIn, enabled: networkJoined && feedback != .checking,
                            nativeActionID: "checkin.confirm-swap-checkin") {
                        attemptCheckin()
                    }
                }
                VKGroup {
                    Text("Уже отметились")
                        .font(.role(.groupHeader)).foregroundStyle(t.palette.textSecondary)
                        .padding(.horizontal, 12).padding(.top, 12).padding(.bottom, 8)
                    ForEach(arrived, id: \.0) { p in
                        HStack(spacing: 12) {
                            Avatar(name: p.0, size: 36)
                            VStack(alignment: .leading, spacing: 1) {
                                Text(p.0).font(.role(.pill))
                                Text(p.1).font(.vkCaption).foregroundStyle(t.palette.textSecondary)
                            }
                            Spacer()
                            Text(p.2).font(.vkCaption.monospacedDigit())
                                .foregroundStyle(t.palette.textSecondary)
                        }
                        .padding(.horizontal, 12).padding(.vertical, 6)
                    }
                    RowSeparator(leading: 12)
                    HStack {
                        Text("34 человека идут · 12 уже на месте")
                            .font(.vkMeta).foregroundStyle(t.palette.textSecondary)
                        Spacer()
                    }
                    .padding(12)
                }
                if !networkJoined {
                    VKGroup { FallbackNote(text: "Без гостевой сети отметку подтвердит организатор").padding(12) }
                }
            }
            .padding(.bottom, 88)
        }
        .background(t.palette.background)
        .vkNavigation("Участие в обмене")
    }

    private func attemptCheckin() {
        feedback = .checking
        Task { @MainActor in
            guard await LooksPermissionFlow.requestLocation(using: perms) else {
                withAnimation { feedback = .denied }
                nav.toast("Разрешите геопозицию или покажите QR организатору", once: "checkin-location")
                return
            }
            let ok = await perms.request(.wifiinfo)
            if ok {
                withAnimation { store.setVenueNetworkJoined(true); store.setCheckedIn(true); feedback = .idle }
                nav.toast("Отметка засчитана")
            } else {
                withAnimation { feedback = .error }
                nav.toast("Отметит организатор вручную", once: "wifiinfo")
            }
        }
    }

    private func openSettings() {
        guard let url = URL(string: UIApplication.openSettingsURLString) else { return }
        UIApplication.shared.open(url)
    }

    private func stepRow(n: Int, title: String, sub: String, done: Bool,
                         enabled: Bool = true,
                         nativeActionID: String? = nil,
                         action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                ZStack {
                    Circle().fill(done ? t.palette.positive : t.palette.accent.opacity(0.12)).frame(width: 32, height: 32)
                    if done { Image(systemName: "checkmark").font(.system(size: 14, weight: .bold)).foregroundStyle(.white) }
                    else { Text("\(n)").font(.role(.name)).foregroundStyle(t.palette.accent) }
                }
                VStack(alignment: .leading, spacing: 2) {
                    Text(title).font(.vkBody).foregroundStyle(t.palette.textPrimary)
                    Text(sub).font(.vkMeta).foregroundStyle(t.palette.textSecondary)
                }
                Spacer()
                if !done && enabled {
                    Image(systemName: t.icon(.disclosure)).font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(t.palette.textTertiary)
                }
            }
            .padding(.horizontal, 12).padding(.vertical, 12)
            .contentShape(Rectangle())
        }
        .looksNativeAction(nativeActionID)
        .buttonStyle(HighlightStyle())
    }
}

private enum CheckinFeedback: Equatable { case idle, checking, error, denied }

// MARK: - Код-пароль на «Сохранённое» (faceid)

struct LockScreen: View {
    var captureState: String? = nil
    @Environment(Permissions.self) private var perms
    @Environment(Nav.self) private var nav
    @Environment(\.visualLanguage) private var t
    @State private var unlocked = false

    var body: some View {
        VStack(spacing: 16) {
            if captureState == "denied" {
                NativeStatePanel(kind: .warning,
                                 title: "Face ID недоступен",
                                 detail: "Используйте код iPhone, чтобы открыть черновики и сохранённые образы.",
                                 actionTitle: "Ввести код iPhone",
                                 action: { withAnimation { unlocked = true } },
                                 placement: .page)
                Spacer()
            } else {
            Spacer()
            Image(systemName: unlocked ? "lock.open.fill" : "faceid")
                .font(.system(size: 58, weight: .light)).foregroundStyle(t.palette.accent)
            Text(unlocked ? "Открыто" : "«Сохранённое» под замком")
                .font(.role(.section))
            Text(unlocked ? "Черновики и сохранённые образы доступны"
                          : "Подтвердите Face ID, чтобы открыть черновики и сохранённые образы")
                .font(.vkBody).foregroundStyle(t.palette.textSecondary)
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
                                    .fill(t.palette.surface.opacity(0.25))
                            }
                        }
                }
            }
            .padding(.horizontal, 4)
            .animation(.easeOut(duration: 0.3), value: unlocked)

            Text(unlocked ? "12 черновиков · 34 сохранённых образа"
                          : "12 черновиков и 34 сохранённых образа под замком")
                .font(.vkMeta).foregroundStyle(t.palette.textSecondary)

            Spacer()
            if !unlocked {
                VKButton(title: "Разблокировать", icon: "faceid") {
                    Task {
                        let ok = await perms.request(.faceid)
                        if ok { withAnimation { unlocked = true } }
                        else { nav.toast("Введите код-пароль приложения", once: "faceid") }
                    }
                }
                .nativeAction("lock.request-face-id")
                Button("Ввести код-пароль") { withAnimation { unlocked = true } }
                    .font(.system(size: 15)).foregroundStyle(t.palette.accent)
            }
            }
        }
        .padding(t.spacing.contentInset)
        .background(t.palette.surface)
        .vkNavigation("Сохранённое")
        .toolbar(.hidden, for: .tabBar)
    }

}





// MARK: - Предложение обмена и встреча (calendar)

struct SwapScreen: View {
    @Environment(LooksStore.self) private var store
    @Environment(Permissions.self) private var perms
    @Environment(Nav.self) private var nav
    @Environment(\.visualLanguage) private var t
    @State private var added = false
    @State private var calendarError = false
    @State private var proposalSent = false

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                VKGroup {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Предложение Ане Котовой").font(.vkSection)
                        Text("Проверьте обе вещи до отправки. Аня сможет принять предложение или обсудить детали в сообщениях.")
                            .font(.vkBody).foregroundStyle(t.palette.textSecondary)
                        exchangeItem(title: "Вы отдаёте", item: "Тренч оверсайз", detail: "Zara · хорошее состояние", seed: 2)
                        HStack { Spacer(); Image(systemName: "arrow.up.arrow.down").foregroundStyle(t.palette.textSecondary); Spacer() }
                        exchangeItem(title: "Вы получите", item: "Жакет", detail: "12 Storeez · размер M", seed: 5)
                    }
                    .padding(12)
                }
                VKGroup {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Встреча после подтверждения").font(.role(.cardTitle))
                        InfoLine(icon: "calendar", text: "Суббота, 15:00")
                        InfoLine(icon: "mappin.and.ellipse", text: "Лофт на Мясницкой")
                    }
                    .padding(12)
                    RowSeparator()
                    if calendarError {
                        NativeStatePanel(kind: .error,
                                         title: "Календарь недоступен",
                                         detail: "Дата останется в карточке обмена.",
                                         actionTitle: "Повторить",
                                         action: addToCalendar,
                                         placement: .inline)
                    }
                    Button {
                        addToCalendar()
                    } label: {
                        HStack(spacing: 8) {
                            Image(systemName: added ? "checkmark.circle.fill" : "calendar.badge.plus")
                            Text(added ? "В календаре" : "Добавить в календарь")
                        }
                        .font(.system(size: 16, weight: .medium))
                        .foregroundStyle(added ? t.palette.positive : t.palette.accent)
                        .frame(maxWidth: .infinity).padding(.vertical, 14)
                    }
                    .nativeAction("swap.add-swap-calendar")
                    .buttonStyle(HighlightStyle())
                }
                VKGroup {
                    VStack(spacing: 10) {
                        VKButton(title: proposalSent ? "Предложение отправлено" : "Предложить обмен",
                                 icon: proposalSent ? "checkmark" : "arrow.left.arrow.right") {
                            guard !proposalSent else { return }
                            proposalSent = true
                            store.send("Предлагаю обменять мой тренч на ваш жакет. Подойдёт встреча в субботу?", to: "Аня Котова")
                            nav.toast("Аня получила предложение")
                        }
                        .disabled(proposalSent)
                        Button("Обсудить в сообщениях") {
                            nav.push(LooksRoute.chat(store.dialogs[0]))
                        }
                        .font(.role(.action)).foregroundStyle(t.palette.accent)
                        .frame(maxWidth: .infinity, minHeight: 44)
                    }
                    .padding(12)
                }
            }
            .padding(.bottom, 88)
        }
        .background(t.palette.background)
        .vkNavigation("Обмен")
    }

    private func exchangeItem(title: String, item: String, detail: String, seed: Int) -> some View {
        HStack(spacing: 12) {
            VKMedia(assetName: LooksMediaAssets.detail(seed), height: 64)
                .frame(width: 64).clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            VStack(alignment: .leading, spacing: 3) {
                Text(title).font(.vkMeta).foregroundStyle(t.palette.textSecondary)
                Text(item).font(.role(.rowTitle)).foregroundStyle(t.palette.textPrimary)
                Text(detail).font(.vkMeta).foregroundStyle(t.palette.textSecondary)
            }
            Spacer()
        }
    }

    private func addToCalendar() {
        Task { @MainActor in
            let ok = await LooksPermissionFlow.requestCalendar(using: perms)
            withAnimation { added = ok; calendarError = !ok }
        }
    }
}

struct InfoLine: View {
    let icon: String; let text: String
    @Environment(\.visualLanguage) private var t
    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: icon).font(.system(size: 15)).foregroundStyle(t.palette.textSecondary).frame(width: 20)
            Text(text).font(.vkBody).foregroundStyle(t.palette.textPrimary)
            Spacer()
        }
    }
}

/// Что остаётся, если доступ не дали. Проверяется тестом.
struct FallbackNote: View {
    let text: String
    @Environment(\.visualLanguage) private var t
    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "info.circle.fill").font(.system(size: 15)).foregroundStyle(t.palette.textSecondary)
            Text(text).font(.vkMeta).foregroundStyle(t.palette.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
            Spacer()
        }
    }
}


// MARK: - Гостевая сеть площадки по QR (hotspot)

struct NetQRScreen: View {
    var captureState: String? = nil
    @Environment(LooksStore.self) private var store
    @Environment(Permissions.self) private var perms
    @Environment(Nav.self) private var nav
    @Environment(\.dismiss) private var dismiss
    @Environment(\.visualLanguage) private var t
    @State private var retrying = false
    @State private var connectionFailed = false

    var body: some View {
        VStack(spacing: 18) {
            if captureState == "error" && !retrying {
                Spacer()
                NativeStatePanel(kind: .error,
                                 title: "Код не подходит",
                                 detail: "Наведите камеру на QR события «Образов».",
                                 actionTitle: "Сканировать снова",
                                 action: { retrying = true },
                                 placement: .page)
                Spacer()
            } else {
            Spacer()
            ZStack {
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(t.palette.fill).frame(width: 200, height: 200)
                Image(systemName: store.venueNetworkJoined ? "wifi.circle.fill" : "qrcode")
                    .font(.system(size: store.venueNetworkJoined ? 92 : 110, weight: .ultraLight))
                    .foregroundStyle(store.venueNetworkJoined ? t.palette.positive : t.palette.textPrimary)
            }
            Text(store.venueNetworkJoined ? "PUDRA-GUEST" : "Наведите на QR площадки")
                .font(.role(.section)).foregroundStyle(t.palette.textPrimary)
            Text(store.venueNetworkJoined
                 ? "Подключено. Теперь можно подтвердить участие"
                 : "Код на входе у организатора")
                .font(.vkBody).foregroundStyle(t.palette.textSecondary)
                .multilineTextAlignment(.center).padding(.horizontal, 26)
            Spacer()
            if !store.venueNetworkJoined {
                if connectionFailed {
                    NativeStatePanel(kind: .error,
                                     title: "Не удалось подключиться",
                                     detail: "Повторите по QR или попросите организатора подтвердить отметку.",
                                     placement: .inline)
                }
                VKButton(title: "Подключиться к сети", icon: "wifi") {
                    attemptConnection()
                }
                .nativeAction("netqr.join-venue-network")
            } else {
                VKButton(title: "Готово", icon: "checkmark") { dismiss() }
            }
            FallbackNote(text: "Без подключения отметку подтвердит организатор")
            }
        }
        .padding(t.spacing.contentInset)
        .background(t.palette.surface)
        .vkNavigation("Сеть площадки")
    }

    private func attemptConnection() {
        Task { @MainActor in
            let ok = await perms.request(.hotspot, value: "PUDRA-GUEST")
            withAnimation {
                connectionFailed = !ok
                if ok { store.setVenueNetworkJoined(true) }
            }
        }
    }
}

private extension View {
    @ViewBuilder
    func looksNativeAction(_ id: String?) -> some View {
        if let id { nativeAction(id) } else { self }
    }
}
