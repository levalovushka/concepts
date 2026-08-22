import SwiftUI

// Экраны, отрабатывающие заявленные доступы. Каждый ключ из concept.json
// обязан иметь достижимую фичу в этой же сборке — иначе он не заявляется.


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
        .toolbar(.hidden, for: .tabBar)
        .navigationBarBackButtonHidden()
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
                        Text("18 минут · собран по вашим 86 вещам")
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
                        Text("Отметятся 34 человека · вы ещё нет")
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
                Card {
                    Text("Уже отметились")
                        .font(.system(size: 13, weight: .medium)).foregroundStyle(t.textSecondary)
                        .padding(.horizontal, 12).padding(.top, 12).padding(.bottom, 8)
                    ForEach(["Аня Котова", "Марк Львов", "Даша Ким"], id: \.self) { n in
                        HStack(spacing: 12) {
                            Avatar(name: n, size: 36)
                            VStack(alignment: .leading, spacing: 1) {
                                Text(n).font(.system(size: 14, weight: .medium))
                                Text("принесла 3 вещи").font(.dsCaption).foregroundStyle(t.textSecondary)
                            }
                            Spacer()
                            Text("14:0\(Int.random(in: 2...9))")
                                .font(.dsCaption.monospacedDigit()).foregroundStyle(t.textSecondary)
                        }
                        .padding(.horizontal, 12).padding(.vertical, 6)
                    }
                    RowDivider(leading: 12)
                    HStack {
                        Text("34 человека идут · 12 уже на месте")
                            .font(.dsMeta).foregroundStyle(t.textSecondary)
                        Spacer()
                    }
                    .padding(12)
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
            // размытое превью того, что за замком — иначе экран пустой
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 6), count: 3), spacing: 6) {
                ForEach(0..<6, id: \.self) { i in
                    OutfitGridCell(glyph: ["tshirt.fill", "shoe.fill", "coat", "handbag.fill"][i % 4], seed: i)
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
                .font(.dsMeta).foregroundStyle(t.textSecondary)

            Spacer()
            if !unlocked {
                PrimaryButton(title: "Разблокировать", icon: "faceid") {
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
        .navigationTitle("Замок").navigationBarTitleDisplayMode(.inline)
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
                 : "Код на входе у организатора")
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
