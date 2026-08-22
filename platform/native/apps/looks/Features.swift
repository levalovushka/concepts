import SwiftUI

// Экраны, отрабатывающие заявленные доступы. Каждый ключ из concept.json
// обязан иметь достижимую фичу в этой же сборке — иначе он не заявляется.

// MARK: - Голосовое сообщение (mic)

struct VoiceScreen: View {
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.dismiss) private var dismiss
    @Environment(\.theme) private var t
    @State private var recording = false
    @State private var seconds = 0
    @State private var denied = false

    var body: some View {
        VStack(spacing: 20) {
            Spacer()
            ZStack {
                Circle().fill(t.accent.opacity(recording ? 0.18 : 0.10))
                    .frame(width: recording ? 168 : 132, height: recording ? 168 : 132)
                    .animation(.easeInOut(duration: 0.6).repeatForever(autoreverses: true), value: recording)
                Image(systemName: "mic.fill").font(.system(size: 44)).foregroundStyle(t.accent)
            }
            Text(recording ? timeString : "Запишите голосовое")
                .font(.system(size: 22, weight: .semibold).monospacedDigit())
                .foregroundStyle(t.textPrimary)
            Text(recording ? "Отпустите, чтобы отправить" : "Расскажите про образ голосом")
                .font(.dsSubhead).foregroundStyle(t.textSecondary)

            if denied {
                FallbackNote(text: "Без микрофона напишите текстом — сообщение уйдёт так же")
            }
            Spacer()
            Button {
                Task {
                    let ok = await perms.request(.mic)
                    if !ok { denied = true; return }
                    withAnimation { recording.toggle() }
                    if !recording { dismiss(); nav.toast("Голосовое отправлено") }
                }
            } label: {
                Text(recording ? "Отправить" : "Записать")
                    .font(.system(size: 17, weight: .semibold)).foregroundStyle(.white)
                    .frame(maxWidth: .infinity).frame(height: 50)
                    .background(recording ? t.danger : t.accent,
                                in: RoundedRectangle(cornerRadius: t.controlRadius, style: .continuous))
            }
            .pressable()
        }
        .padding(t.pad)
        .background(t.card)
        .navigationTitle("Голосовое").navigationBarTitleDisplayMode(.inline)
        .task {
            while true {
                try? await Task.sleep(nanoseconds: 1_000_000_000)
                if recording { seconds += 1 }
            }
        }
    }
    private var timeString: String { String(format: "0:%02d", seconds) }
}

// MARK: - Звонок (voip)

struct CallScreen: View {
    let peer: String
    @Environment(\.dismiss) private var dismiss
    @Environment(Permissions.self) private var perms
    @Environment(\.theme) private var t
    @State private var connected = false

    var body: some View {
        ZStack {
            LinearGradient(colors: [Color(hex: "3A4256"), Color(hex: "15171E")],
                           startPoint: .top, endPoint: .bottom).ignoresSafeArea()
            VStack(spacing: 14) {
                Spacer().frame(height: 70)
                Avatar(name: peer, size: 108)
                Text(peer).font(.system(size: 26, weight: .semibold)).foregroundStyle(.white)
                Text(connected ? "0:04" : "Соединение…")
                    .font(.system(size: 16).monospacedDigit()).foregroundStyle(.white.opacity(0.7))
                Spacer()
                HStack(spacing: 26) {
                    callButton("mic.slash.fill", tint: .white.opacity(0.18)) {}
                    callButton("phone.down.fill", tint: Color(hex: "E64646")) { dismiss() }
                    callButton("speaker.wave.2.fill", tint: .white.opacity(0.18)) {}
                }
                Spacer().frame(height: 50)
            }
        }
        .task {
            await perms.request(.voip)
            try? await Task.sleep(nanoseconds: 1_200_000_000)
            withAnimation { connected = true }
        }
    }
    private func callButton(_ icon: String, tint: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: icon).font(.system(size: 24)).foregroundStyle(.white)
                .frame(width: 66, height: 66).background(tint, in: Circle())
        }
        .pressable(scale: 0.92)
    }
}

// MARK: - Субтитры к клипу (speech)

struct SubtitlesScreen: View {
    @Environment(Permissions.self) private var perms
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var lines: [String] = []
    @State private var working = false
    @State private var denied = false

    var body: some View {
        ScrollView {
            VStack(spacing: t.cardGap) {
                Card {
                    MediaBlock(glyph: "waveform", height: 150, seed: 3)
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Субтитры к клипу").font(.dsSectionTitle)
                        Text("Распознаём речь на устройстве и собираем подписи — их читают без звука")
                            .font(.dsBody).foregroundStyle(t.textSecondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(12)
                }
                if !lines.isEmpty {
                    Card {
                        ForEach(Array(lines.enumerated()), id: \.offset) { i, l in
                            HStack(alignment: .top, spacing: 12) {
                                Text(String(format: "0:%02d", i * 3 + 2))
                                    .font(.dsMeta.monospacedDigit()).foregroundStyle(t.textSecondary)
                                    .frame(width: 40, alignment: .leading)
                                Text(l).font(.dsBody).foregroundStyle(t.textPrimary)
                                Spacer()
                            }
                            .padding(.horizontal, 12).padding(.vertical, 10)
                            if i < lines.count - 1 { RowDivider(leading: 64) }
                        }
                    }
                }
                if denied {
                    Card { FallbackNote(text: "Распознавание недоступно — подписи можно ввести вручную").padding(12) }
                }
                Card {
                    Button {
                        Task {
                            let ok = await perms.request(.speech)
                            if !ok { denied = true; return }
                            withAnimation { working = true }
                            try? await Task.sleep(nanoseconds: 900_000_000)
                            withAnimation {
                                lines = ["Собрала образ на осень",
                                         "Тренч оверсайз и ботинки челси",
                                         "Шарф связала сама"]
                                working = false
                            }
                        }
                    } label: {
                        HStack(spacing: 8) {
                            if working { ProgressView().tint(t.accent) }
                            Text(lines.isEmpty ? "Собрать субтитры" : "Пересобрать")
                        }
                        .font(.system(size: 16, weight: .medium)).foregroundStyle(t.accent)
                        .frame(maxWidth: .infinity).padding(.vertical, 14)
                    }
                    .buttonStyle(HighlightStyle())
                }
            }
            .padding(.bottom, 88)
        }
        .background(t.background)
        .navigationTitle("Субтитры").navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Разбор гардероба голосом в фоне (audio)

struct TalkScreen: View {
    @Environment(Permissions.self) private var perms
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var playing = false

    var body: some View {
        ScrollView {
            VStack(spacing: t.cardGap) {
                Card {
                    VStack(spacing: 14) {
                        MediaBlock(glyph: "waveform.circle", height: 170, seed: 5)
                            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                            .padding(.horizontal, 12).padding(.top, 12)
                        Text("Разбор гардероба").font(.dsSectionTitle)
                        Text("Стилист проходит по вашим вещам голосом. Продолжает играть при погасшем экране")
                            .font(.dsBody).foregroundStyle(t.textSecondary)
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
                            Image(systemName: "goforward.15").font(.system(size: 24))
                        }
                        .foregroundStyle(t.textPrimary)
                        .padding(.bottom, 16)
                    }
                }
                if playing {
                    Card {
                        HStack(spacing: 12) {
                            Image(systemName: "lock.iphone").font(.system(size: 18))
                                .foregroundStyle(t.accent).frame(width: 28)
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Экран воспроизведения").font(.dsHeadline)
                                Text("Пауза и ±15 секунд работают с локскрина")
                                    .font(.dsMeta).foregroundStyle(t.textSecondary)
                            }
                            Spacer()
                        }
                        .padding(12)
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

    var body: some View {
        ScrollView {
            VStack(spacing: t.cardGap) {
                Card {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Своп-вечеринка «Пудра»").font(.dsSectionTitle)
                        Text("Отметка подтверждается сетью площадки, а не словом участника")
                            .font(.dsBody).foregroundStyle(t.textSecondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(12)
                }
                Card {
                    stepRow(n: 1, title: "Гостевая сеть площадки",
                            sub: joined ? "Подключено · PUDRA-GUEST" : "Подключиться по QR",
                            done: joined) {
                        nav.push(LooksRoute.netqr)
                    }
                    RowDivider(leading: 60)
                    stepRow(n: 2, title: "Отметиться на свопе",
                            sub: checked ? "Вы на месте" : (joined ? "Проверим сеть" : "Сначала подключитесь"),
                            done: checked) {
                        Task {
                            let ok = await perms.request(.wifiinfo)
                            if ok { withAnimation { checked = true }; nav.toast("Отметка засчитана") }
                            else { nav.toast("Отметит организатор вручную", once: "wifiinfo") }
                        }
                    }
                }
                if !joined {
                    Card { FallbackNote(text: "Без гостевой сети отметку подтвердит организатор").padding(12) }
                }
            }
            .padding(.bottom, 88)
        }
        .background(t.background)
        .navigationTitle("Отметка на свопе").navigationBarTitleDisplayMode(.inline)
    }

    private func stepRow(n: Int, title: String, sub: String, done: Bool,
                         action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                ZStack {
                    Circle().fill(done ? t.positive : t.accentSoft).frame(width: 32, height: 32)
                    if done { Image(systemName: "checkmark").font(.system(size: 14, weight: .bold)).foregroundStyle(.white) }
                    else { Text("\(n)").font(.system(size: 15, weight: .semibold)).foregroundStyle(t.accent) }
                }
                VStack(alignment: .leading, spacing: 2) {
                    Text(title).font(.dsBody).foregroundStyle(t.textPrimary)
                    Text(sub).font(.dsMeta).foregroundStyle(t.textSecondary)
                }
                Spacer()
                if !done {
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
            Text(unlocked ? "Открыто" : "«Сохранённое» под замком")
                .font(.system(size: 20, weight: .semibold))
            Text(unlocked ? "Черновики и сохранённые образы доступны"
                          : "Подтвердите Face ID, чтобы открыть черновики и сохранённые образы")
                .font(.dsBody).foregroundStyle(t.textSecondary)
                .multilineTextAlignment(.center).padding(.horizontal, 30)
            Spacer()
            if !unlocked {
                PrimaryButton(title: "Разблокировать", icon: "faceid") {
                    Task {
                        let ok = await perms.request(.faceid)
                        if ok { withAnimation { unlocked = true } }
                        else { nav.toast("Введите код-пароль приложения", once: "faceid") }
                    }
                }
            }
        }
        .padding(t.pad)
        .background(t.card)
        .navigationTitle("Замок").navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Виджет сохранённого образа (appgroups + keychain)

struct WidgetScreen: View {
    @Environment(Permissions.self) private var perms
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var added = false

    var body: some View {
        ScrollView {
            VStack(spacing: t.cardGap) {
                Card {
                    VStack(spacing: 14) {
                        // превью виджета
                        RoundedRectangle(cornerRadius: 20, style: .continuous)
                            .fill(t.fieldFill)
                            .frame(height: 150)
                            .overlay {
                                HStack(spacing: 10) {
                                    Image(systemName: "tshirt.fill").font(.system(size: 34))
                                        .foregroundStyle(t.accent)
                                    VStack(alignment: .leading, spacing: 3) {
                                        Text("Образ дня").font(.dsHeadline)
                                        Text("Тренч · челси · шарф")
                                            .font(.dsMeta).foregroundStyle(t.textSecondary)
                                    }
                                }
                            }
                            .padding(.horizontal, 12).padding(.top, 12)
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Виджет сохранённого образа").font(.dsSectionTitle)
                            Text("Образ показывается на экране «Домой». Вход общий с приложением — заново входить не нужно")
                                .font(.dsBody).foregroundStyle(t.textSecondary)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                        .padding(.horizontal, 12).padding(.bottom, 12)
                    }
                }
                Card {
                    Button {
                        Task {
                            await perms.request(.appgroups)
                            await perms.request(.keychain)
                            withAnimation { added = true }
                            nav.toast("Виджет добавлен на экран «Домой»")
                        }
                    } label: {
                        HStack(spacing: 8) {
                            Image(systemName: added ? "checkmark.circle.fill" : "plus.circle.fill")
                            Text(added ? "Виджет добавлен" : "Добавить виджет")
                        }
                        .font(.system(size: 16, weight: .medium))
                        .foregroundStyle(added ? t.positive : t.accent)
                        .frame(maxWidth: .infinity).padding(.vertical, 14)
                    }
                    .buttonStyle(HighlightStyle())
                }
            }
            .padding(.bottom, 88)
        }
        .background(t.background)
        .navigationTitle("Виджет").navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Вход на сайт марки сохранённой связкой (autofill)

struct FillScreen: View {
    @Environment(Permissions.self) private var perms
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var enabled = false

    var body: some View {
        ScrollView {
            VStack(spacing: t.cardGap) {
                Card {
                    VStack(alignment: .leading, spacing: 10) {
                        Image(systemName: "key.fill").font(.system(size: 30)).foregroundStyle(t.accent)
                        Text("Вход на сайты марок").font(.dsSectionTitle)
                        Text("«Образы» подставляют сохранённую связку, когда открываете сайт марки из карточки вещи")
                            .font(.dsBody).foregroundStyle(t.textSecondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(16)
                }
                Card {
                    HStack(spacing: 12) {
                        Image(systemName: "rectangle.and.pencil.and.ellipsis")
                            .font(.system(size: 17)).foregroundStyle(t.accent).frame(width: 28)
                        Text("Автозаполнение паролей").font(.dsBody)
                        Spacer()
                        Toggle("", isOn: $enabled).labelsHidden()
                            .onChange(of: enabled) { _, v in
                                Task {
                                    if v {
                                        await perms.request(.autofill)
                                        nav.toast("Включите «Образы» в Настройках → Пароли")
                                    }
                                }
                            }
                    }
                    .padding(.horizontal, 12).padding(.vertical, 10)
                }
                Card { FallbackNote(text: "Без автозаполнения связку можно ввести вручную").padding(12) }
            }
            .padding(.bottom, 88)
        }
        .background(t.background)
        .navigationTitle("Автозаполнение").navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Поделиться в «Образы» (shareext)

struct ShareExtScreen: View {
    @Environment(Permissions.self) private var perms
    @Environment(\.theme) private var t
    @State private var on = false

    var body: some View {
        ScrollView {
            VStack(spacing: t.cardGap) {
                Card {
                    VStack(alignment: .leading, spacing: 10) {
                        Image(systemName: "square.and.arrow.up").font(.system(size: 30)).foregroundStyle(t.accent)
                        Text("Поделиться в «Образы»").font(.dsSectionTitle)
                        Text("Кадр или ссылка из Safari, «Фото» и мессенджеров падает в черновик образа")
                            .font(.dsBody).foregroundStyle(t.textSecondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(16)
                }
                Card {
                    ForEach(["Safari", "Фото", "Сообщения"], id: \.self) { app in
                        HStack(spacing: 12) {
                            Image(systemName: "arrow.up.forward.app.fill")
                                .font(.system(size: 17)).foregroundStyle(t.accent).frame(width: 28)
                            Text(app).font(.dsBody)
                            Spacer()
                            Text(on ? "Включено" : "—").font(.dsMeta).foregroundStyle(t.textSecondary)
                        }
                        .padding(.horizontal, 12).padding(.vertical, 11)
                        if app != "Сообщения" { RowDivider(leading: 52) }
                    }
                }
                Card {
                    Button {
                        Task {
                            await perms.request(.shareext)
                            withAnimation { on = true }
                        }
                    } label: {
                        Text(on ? "Расширение включено" : "Включить расширение")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundStyle(on ? t.positive : t.accent)
                            .frame(maxWidth: .infinity).padding(.vertical, 14)
                    }
                    .buttonStyle(HighlightStyle())
                }
            }
            .padding(.bottom, 88)
        }
        .background(t.background)
        .navigationTitle("Расширение").navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Медиатека (photos)

struct MediaScreen: View {
    @Environment(Permissions.self) private var perms
    @Environment(Nav.self) private var nav
    @Environment(\.dismiss) private var dismiss
    @Environment(\.theme) private var t
    @State private var granted = false
    @State private var picked: Int?

    var body: some View {
        ScrollView {
            if granted {
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 2), count: 3), spacing: 2) {
                    ForEach(0..<18, id: \.self) { i in
                        Button { withAnimation { picked = i } } label: {
                            ZStack {
                                OutfitGridCell(glyph: ["tshirt.fill", "shoe.fill", "coat", "handbag.fill"][i % 4], seed: i)
                                if picked == i {
                                    Rectangle().fill(t.accent.opacity(0.28))
                                    Image(systemName: "checkmark.circle.fill")
                                        .font(.system(size: 24)).foregroundStyle(.white)
                                }
                            }
                        }
                        .buttonStyle(.plain)
                    }
                }
            } else {
                VStack(spacing: 14) {
                    Image(systemName: "photo.on.rectangle.angled")
                        .font(.system(size: 44, weight: .light)).foregroundStyle(t.textTertiary)
                    Text("Выберите фото образа").font(.system(size: 18, weight: .semibold))
                    Text("Покажем медиатеку, чтобы взять кадр для образа")
                        .font(.dsBody).foregroundStyle(t.textSecondary).multilineTextAlignment(.center)
                    PrimaryButton(title: "Открыть медиатеку", icon: "photo") {
                        Task {
                            let ok = await perms.request(.photos)
                            if ok { withAnimation { granted = true } }
                            else { nav.toast("Снимите образ на камеру", once: "photos") }
                        }
                    }
                    .padding(.horizontal, 30)
                }
                .padding(.top, 70).padding(.horizontal, t.pad)
            }
        }
        .background(t.background)
        .navigationTitle("Медиатека").navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Готово") { dismiss() }.fontWeight(.semibold).disabled(picked == nil)
            }
        }
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
            VStack(spacing: t.cardGap) {
                Card {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Обмен с Аней Котовой").font(.dsSectionTitle)
                        InfoLine(icon: "arrow.left.arrow.right", text: "Тренч оверсайз ↔ Жакет")
                        InfoLine(icon: "calendar", text: "Суббота, 15:00")
                        InfoLine(icon: "mappin.and.ellipse", text: "Лофт на Мясницкой")
                    }
                    .padding(12)
                }
                Card {
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
            Text(text).font(.dsBody).foregroundStyle(t.textPrimary)
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
            Text(text).font(.dsMeta).foregroundStyle(t.textSecondary)
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
            Spacer()
            ZStack {
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(t.fieldFill).frame(width: 200, height: 200)
                Image(systemName: joined ? "wifi.circle.fill" : "qrcode")
                    .font(.system(size: joined ? 92 : 110, weight: .ultraLight))
                    .foregroundStyle(joined ? t.positive : t.textPrimary)
            }
            Text(joined ? "PUDRA-GUEST" : "Наведите на QR площадки")
                .font(.system(size: 20, weight: .semibold)).foregroundStyle(t.textPrimary)
            Text(joined
                 ? "Подключено. Теперь отметка на свопе пройдёт"
                 : "Организатор показывает код на входе — подключаемся к гостевой сети без пароля")
                .font(.dsBody).foregroundStyle(t.textSecondary)
                .multilineTextAlignment(.center).padding(.horizontal, 26)
            Spacer()
            if !joined {
                PrimaryButton(title: "Подключиться к сети", icon: "wifi") {
                    Task {
                        let ok = await perms.request(.hotspot)
                        if ok { withAnimation { joined = true } }
                        else { nav.toast("Подключитесь к сети вручную в Настройках", once: "hotspot") }
                    }
                }
            } else {
                PrimaryButton(title: "Готово", icon: "checkmark") { dismiss() }
            }
            FallbackNote(text: "Без подключения отметку подтвердит организатор")
        }
        .padding(t.pad)
        .background(t.card)
        .navigationTitle("Сеть площадки").navigationBarTitleDisplayMode(.inline)
    }
}
