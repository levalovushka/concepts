import SwiftUI

/// Маршрутизатор экранов.
struct Screen: View {
    let route: Route
    init(_ route: Route) { self.route = route }

    var body: some View {
        switch route {
        case .code: CodeView()
        case .join: JoinView()
        case .verify: VerifyView()
        case .manual: ManualView()
        case .post: PostThreadView()
        case .problem: ProblemView()
        case .shoot: ShootView()
        case .chronicle: ChronicleView()
        case .chat: ChatView()
        case .voice: VoiceView()
        case .lockscreen: LockscreenView()
        case .guest: GuestView()
        case .scan: ScanView()
        case .meters: MetersView()
        case .background: BackgroundView()
        case .events: EventsView()
        case .passwords: PasswordsView()
        case .fill: FillView()
        case .neighbors: NeighborsView()
        case .profile: ProfileView()
        case .call: CallView()
        case .settings: SettingsView()
        case .ads: AdsView()
        case .lock: LockView()
        case .widget: WidgetView()
        }
    }
}

// MARK: - Дом

/// Тема объявления. Подписка на тему — фича за уведомлениями.
struct PostThreadView: View {
    @Environment(Nav.self) private var nav
    @Environment(AccessStore.self) private var access

    var body: some View {
        StackPage(title: "Объявление", spacing: 10) {
            PostCard(post: Feed.posts[0])

            DCard {
                DRow(title: "Следить за темой",
                     subtitle: "Пришлём, когда управляющая компания ответит") {
                    DBullet(symbol: "bell.badge")
                } action: {
                    Task {
                        let ok = await access.request([.push], on: "post")
                        nav.show(ok ? "Вы следите за темой" : "Ответы будут видны при открытии")
                    }
                }
                .accessibilityIdentifier("action.follow")
            }

            DeniedNotice(key: .push)

            DSectionTitle(text: "Ответы")
            DCard(padding: D.inset) {
                VStack(alignment: .leading, spacing: 12) {
                    reply("Пётр, старший по подъезду", "Перерасчёт делают по заявлению, форма у консьержа.")
                    DHair(inset: 0)
                    reply("Ирина, кв. 51", "У нас в третьем подъезде воду отключат на день раньше.")
                }
            }
        }
    }

    private func reply(_ author: String, _ text: String) -> some View {
        HStack(alignment: .top, spacing: 9) {
            DAvatar(size: 34)
            VStack(alignment: .leading, spacing: 2) {
                Text(author).font(.system(size: 14, weight: .semibold)).foregroundStyle(D.ink)
                Text(text).font(.system(size: 15)).foregroundStyle(D.ink)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }
}

/// Заявка о проблеме. Кадр с места — фича за камерой.
struct ProblemView: View {
    @Environment(Nav.self) private var nav
    @Environment(AccessStore.self) private var access
    @State private var what = "Сорвало доводчик на второй двери, дверь бьёт по коляскам."
    @State private var place = 0

    var body: some View {
        NavigationStack {
            Page(spacing: 10) {
                DSectionTitle(text: "Что случилось")
                Picker("", selection: $place) {
                    Text("Подъезд").tag(0); Text("Двор").tag(1); Text("Лифт").tag(2); Text("Вода").tag(3)
                }
                .pickerStyle(.segmented)

                DCard(padding: D.inset) {
                    TextEditor(text: $what)
                        .font(.system(size: 15))
                        .frame(minHeight: 88)
                        .scrollContentBackground(.hidden)
                }

                DCard {
                    DRow(title: "Фото с места", subtitle: access.granted(.camera) ? "1 кадр приложен" : "пока не добавлено") {
                        DBullet(symbol: "camera.fill")
                    } action: {
                        Task {
                            let ok = await access.request([.camera], on: "problem")
                            if ok { nav.cover(.shoot) } else { nav.show("Нет доступа к камере") }
                        }
                    }
                    .accessibilityIdentifier("action.shoot")
                }

                DeniedNotice(key: .camera)

                DCard {
                    DRow(title: "Место", subtitle: "3 подъезд, 1 этаж") { DBullet(symbol: "mappin") } trailing: { EmptyView() }
                    DHair(inset: 56)
                    DRow(title: "Видно соседям", subtitle: "18 жильцов, 3 подъезд") { DBullet(symbol: "eye") } trailing: { EmptyView() }
                }

                DButton(title: "Отправить заявку") {
                    nav.sheet = nil
                    nav.show("Заявка 4418 отправлена")
                }
            }
            .navigationTitle("Сообщить о проблеме")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Закрыть") { nav.sheet = nil }
                }
            }
        }
        .accessibilityIdentifier("screen.problem")
    }
}

/// Тёмная иммерсивная поверхность камеры.
struct ShootView: View {
    @Environment(Nav.self) private var nav

    var body: some View {
        ZStack {
            D.dark.ignoresSafeArea()
            VStack {
                HStack {
                    Button("Отмена") { nav.cover = nil }.foregroundStyle(.white)
                    Spacer()
                    Text("3 подъезд").font(.system(size: 15)).foregroundStyle(.white.opacity(0.7))
                    Spacer()
                    Image(systemName: "bolt.slash").foregroundStyle(.white)
                }
                .padding(D.inset)

                Spacer()
                Image(systemName: "viewfinder")
                    .font(.system(size: 64, weight: .ultraLight))
                    .foregroundStyle(.white.opacity(0.35))
                Spacer()

                Button { nav.cover = nil; nav.show("Кадр приложен к заявке") } label: {
                    Circle().strokeBorder(.white, lineWidth: 4).frame(width: 72, height: 72)
                        .overlay { Circle().fill(.white).frame(width: 58, height: 58) }
                }
                .padding(.bottom, 34)
                .accessibilityLabel("Снять")
            }
        }
        .accessibilityIdentifier("screen.shoot")
    }
}

/// Хроника двора: кадры из медиатеки, попавшие в границы двора.
struct ChronicleView: View {
    private let columns = Array(repeating: GridItem(.flexible(), spacing: 3), count: 3)

    var body: some View {
        StackPage(title: "Хроника двора", spacing: 10) {
            Text("42 снимка за апрель — приложение нашло в медиатеке кадры в границах двора.")
                .font(.system(size: 14)).foregroundStyle(D.sub).fixedSize(horizontal: false, vertical: true)
            LazyVGrid(columns: columns, spacing: 3) {
                ForEach(0..<18, id: \.self) { _ in
                    DPhoto(height: 112, glyph: 18)
                }
            }
        }
    }
}

// MARK: - Чаты

/// Экран блокировки: уведомление о сообщении соседа с аватаром — это entitlement
/// communication notifications, системного алерта у него нет.
struct LockscreenView: View {
    @Environment(Nav.self) private var nav

    var body: some View {
        ZStack {
            LinearGradient(colors: [Color(hex: 0x1B2735), Color(hex: 0x0A0A0A)],
                           startPoint: .top, endPoint: .bottom).ignoresSafeArea()
            VStack(spacing: 22) {
                VStack(spacing: 2) {
                    Text("9:41").font(.system(size: 74, weight: .light)).foregroundStyle(.white)
                    Text("четверг, 11 апреля").font(.system(size: 17)).foregroundStyle(.white.opacity(0.75))
                }
                .padding(.top, 60)

                HStack(spacing: 10) {
                    DAvatar(size: 38)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Пётр, старший по подъезду")
                            .font(.system(size: 14, weight: .semibold)).foregroundStyle(.white)
                        Text("Мастер придёт в четверг после двух")
                            .font(.system(size: 14)).foregroundStyle(.white.opacity(0.85))
                    }
                    Spacer()
                }
                .padding(12)
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                .padding(.horizontal, D.inset)

                Text("С entitlement уведомление показывается как сообщение — с аватаром и в сводке.")
                    .font(.system(size: 13)).foregroundStyle(.white.opacity(0.6))
                    .multilineTextAlignment(.center).padding(.horizontal, 30)

                Spacer()
                DButton(title: "Вернуться в чат") { nav.cover = nil }.padding(D.inset)
            }
        }
        .accessibilityIdentifier("screen.lockscreen")
    }
}

// MARK: - Двор

/// Гостевая сеть: подключение по QR без ввода пароля — entitlement hotspot.
struct GuestView: View {
    @Environment(Nav.self) private var nav
    @Environment(AccessStore.self) private var access

    var body: some View {
        StackPage(title: "Гостевая сеть", spacing: 10) {
            DCard(padding: D.inset) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Dvor-Guest").font(.data(20, .semibold)).foregroundStyle(D.ink)
                    Text("QR на лавочке у второго подъезда. Гость подключается без ввода пароля.")
                        .font(.system(size: 14)).foregroundStyle(D.sub).fixedSize(horizontal: false, vertical: true)
                }
            }

            DCard {
                DRow(title: "Сканировать QR", subtitle: "камера наводится на наклейку") {
                    DBullet(symbol: "qrcode.viewfinder")
                } action: {
                    Task {
                        let ok = await access.request([.camera], on: "guest")
                        if ok { nav.cover(.scan) } else { nav.show("Нет доступа к камере") }
                    }
                }
                DHair(inset: 56)
                DRow(title: "Подключиться к сети", subtitle: "без ввода пароля") {
                    DBullet(symbol: "wifi")
                } action: {
                    access.activate(.hotspot, on: "guest")
                    nav.show("Подключено к Dvor-Guest")
                }
            }

            DeniedNotice(key: .camera)

            DSectionTitle(text: "Если камеры нет")
            DCard(padding: D.inset) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Имя сети и пароль").font(.system(size: 13)).foregroundStyle(D.mute)
                    Text("Dvor-Guest · 4417-guest").font(.data(15)).foregroundStyle(D.ink)
                }
            }
        }
    }
}

struct ScanView: View {
    @Environment(Nav.self) private var nav
    @Environment(AccessStore.self) private var access

    var body: some View {
        ZStack {
            D.dark.ignoresSafeArea()
            VStack {
                HStack {
                    Button("Отмена") { nav.cover = nil }.foregroundStyle(.white)
                    Spacer()
                }
                .padding(D.inset)
                Spacer()
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .strokeBorder(.white, lineWidth: 3)
                    .frame(width: 220, height: 220)
                    .shadow(color: .black.opacity(0.9), radius: 2000)
                Text("Наведите на QR-наклейку на лавочке")
                    .font(.system(size: 15)).foregroundStyle(.white.opacity(0.8))
                    .padding(.top, 20)
                Spacer()
                DButton(title: "Подключиться к Dvor-Guest") {
                    access.activate(.hotspot, on: "scan")
                    nav.cover = nil
                    nav.show("Подключено к Dvor-Guest")
                }
                .padding(D.inset)
            }
        }
        .accessibilityIdentifier("screen.scan")
    }
}

/// Счётчики. Фоновое обновление — entitlement, идентификатор задачи в Info.plist.
struct MetersView: View {
    @Environment(Nav.self) private var nav
    @Environment(AccessStore.self) private var access
    @State private var water = "04812"
    @State private var power = "18240"

    var body: some View {
        StackPage(title: "Счётчики", spacing: 10) {
            DCard(padding: D.inset) {
                HStack(spacing: 8) {
                    Image(systemName: "clock.badge.exclamationmark").foregroundStyle(D.orangeInk)
                    Text("Показания принимают до 25 апреля")
                        .font(.system(size: 14, weight: .medium)).foregroundStyle(D.orangeInk)
                }
            }

            DCard(padding: D.inset) {
                VStack(spacing: 12) {
                    meter("Холодная вода", "м³", $water)
                    DHair(inset: 0)
                    meter("Электричество", "кВт·ч", $power)
                }
            }

            DCard {
                DRow(title: "Обновлять в фоне", subtitle: "тихий пуш обновляет показания и срок") {
                    DBullet(symbol: "arrow.clockwise")
                } action: {
                    access.activate(.remotenotif, on: "meters")
                    access.activate(.bgtask, on: "meters")
                    nav.push(.background)
                }
                .accessibilityIdentifier("action.background")
            }

            DButton(title: "Передать показания") { nav.show("Показания переданы") }
        }
    }

    private func meter(_ title: String, _ unit: String, _ value: Binding<String>) -> some View {
        HStack(spacing: 10) {
            DBullet(symbol: title.hasPrefix("Х") ? "drop.fill" : "bolt.fill")
            VStack(alignment: .leading, spacing: 1) {
                Text(title).font(.system(size: 16))
                Text(unit).font(.system(size: 13)).foregroundStyle(D.mute)
            }
            Spacer()
            TextField("", text: value)
                .font(.data(18, .semibold))
                .multilineTextAlignment(.trailing)
                .keyboardType(.numberPad)
                .frame(width: 92)
        }
    }
}

/// Журнал фоновой задачи: видно, что идентификатор объявлен и зарегистрирован.
struct BackgroundView: View {
    var body: some View {
        ZStack {
            D.dark.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Обновление в фоне")
                        .font(.system(size: 22, weight: .bold)).foregroundStyle(.white)
                    Text("Идентификатор объявлен в Info.plist и зарегистрирован в коде — иначе BGTaskScheduler падает при регистрации.")
                        .font(.system(size: 14)).foregroundStyle(.white.opacity(0.6))
                        .fixedSize(horizontal: false, vertical: true)

                    VStack(alignment: .leading, spacing: 7) {
                        line("BGTaskScheduler.register")
                        line("app.camo.dvor.refresh")
                        line("→ снапшот виджета переписан")
                        line("→ срок показаний: 25 апреля")
                        line("→ следующая попытка: 06:00")
                    }
                    .padding(D.inset)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(D.surf, in: RoundedRectangle(cornerRadius: D.radius, style: .continuous))
                }
                .padding(D.inset)
            }
        }
        .navigationTitle("Обновление в фоне")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .accessibilityIdentifier("screen.background")
    }

    private func line(_ text: String) -> some View {
        Text(text).font(.data(13)).foregroundStyle(Color(hex: 0x8BE28B))
    }
}

/// События дома. Добавление в календарь — фича за доступом к календарю.
struct EventsView: View {
    @Environment(Nav.self) private var nav
    @Environment(AccessStore.self) private var access

    var body: some View {
        StackPage(title: "События дома", spacing: 10) {
            DCard {
                DRow(title: "Субботник", subtitle: "12 апреля, 11:00 · двор") { DBullet(symbol: "leaf.fill", tint: D.green) } trailing: { EmptyView() }
                DHair(inset: 56)
                DRow(title: "Собрание жильцов", subtitle: "18 апреля, 19:00 · 1 подъезд") { DBullet(symbol: "person.3.fill") } trailing: { EmptyView() }
                DHair(inset: 56)
                DRow(title: "Отключение воды", subtitle: "14–17 апреля · весь дом") { DBullet(symbol: "drop.fill", tint: D.orange) } trailing: { EmptyView() }
            }

            DeniedNotice(key: .calendar)

            DButton(title: "Добавить в календарь") {
                Task {
                    let ok = await access.request([.calendar], on: "events")
                    nav.show(ok ? "Субботник добавлен в календарь" : "Событие осталось только в приложении")
                }
            }
            .accessibilityIdentifier("action.calendar")
        }
    }
}

// MARK: - Меню

/// Пароли дома. Записи публикует старший по дому, подставляет автозаполнение.
struct PasswordsView: View {
    @Environment(Nav.self) private var nav
    @Environment(AccessStore.self) private var access

    var body: some View {
        StackPage(title: "Пароли дома", spacing: 10) {
            DCard {
                entry("Кабинет УК", "uk-polevaya.ru")
                DHair(inset: 56)
                entry("Видеонаблюдение", "cam.polevaya12.ru")
                DHair(inset: 56)
                entry("Гостевая сеть", "Dvor-Guest")
            }

            DSectionTitle(text: "Автозаполнение")
            DCard {
                DRow(title: "Добавить быстрый вход", subtitle: "записи подставляются в Safari") {
                    DBullet(symbol: "rectangle.and.pencil.and.ellipsis")
                } action: {
                    access.activate(.autofill, on: "passwords")
                    access.activate(.keychain, on: "passwords")
                    nav.push(.fill)
                }
                .accessibilityIdentifier("action.autofill")
            }
        }
    }

    private func entry(_ title: String, _ host: String) -> some View {
        DRow(title: title, subtitle: host) {
            DBullet(symbol: "key.fill", tint: Color(hex: 0x4A5059))
        } trailing: {
            Text("••••••").font(.data(14)).foregroundStyle(D.mute)
        }
    }
}

/// Чужая поверхность Safari: запись подставляется системой, копировать не нужно.
struct FillView: View {
    @Environment(Nav.self) private var nav

    var body: some View {
        StackPage(title: "Автозаполнение в Safari", spacing: 10) {
            DCard(padding: D.inset) {
                VStack(alignment: .leading, spacing: 10) {
                    Text("uk-polevaya.ru").font(.system(size: 13)).foregroundStyle(D.mute)
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Вход в кабинет").font(.system(size: 17, weight: .semibold))
                        field("Логин", "polevaya12-74")
                        field("Пароль", "••••••••••")
                    }
                    .padding(D.inset)
                    .background(Color(hex: 0xF2F2F7), in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                }
            }

            HStack(spacing: 9) {
                DBullet(symbol: "key.fill")
                VStack(alignment: .leading, spacing: 1) {
                    Text("Двор — polevaya12-74").font(.system(size: 15, weight: .medium))
                    Text("подставить пароль").font(.system(size: 13)).foregroundStyle(D.sub)
                }
                Spacer()
            }
            .padding(D.inset)
            .background(D.card, in: RoundedRectangle(cornerRadius: D.radius, style: .continuous))
            .overlay(alignment: .top) { Rectangle().fill(D.line).frame(height: 0.5) }

            DButton(title: "Подставить и войти") {
                nav.show("Пароль подставлен из общей связки")
            }
        }
    }

    private func field(_ label: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label).font(.system(size: 12)).foregroundStyle(D.mute)
            Text(value).font(.system(size: 16)).foregroundStyle(D.ink)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(9)
                .background(.white, in: RoundedRectangle(cornerRadius: 9, style: .continuous))
                .overlay { RoundedRectangle(cornerRadius: 9).strokeBorder(D.accent.opacity(0.16), lineWidth: 2) }
        }
    }
}

/// Соседи из контактов: книга не покидает устройство.
struct NeighborsView: View {
    @Environment(Nav.self) private var nav
    @Environment(AccessStore.self) private var access

    var body: some View {
        StackPage(title: "Соседи", spacing: 10) {
            if access.granted(.contacts) {
                DCard {
                    ForEach(["Ирина Малова · кв. 51", "Пётр Кузьмин · кв. 12", "Ольга Ким · кв. 88"], id: \.self) { name in
                        DRow(title: String(name.split(separator: " · ")[0]),
                             subtitle: String(name.split(separator: " · ")[1])) {
                            DAvatar(size: 42)
                        } action: { nav.push(.profile) }
                    }
                }
            } else {
                DeniedNotice(key: .contacts)
                DCard {
                    DRow(title: "Найти по номеру квартиры", subtitle: "работает без доступа к контактам") {
                        DBullet(symbol: "number")
                    } action: { nav.push(.profile) }
                }
            }
        }
    }
}

/// Профиль соседа. Звонок в квартиру идёт через CallKit, номера не раскрываются.
struct ProfileView: View {
    @Environment(Nav.self) private var nav
    @Environment(AccessStore.self) private var access

    var body: some View {
        StackPage(title: "Сосед", spacing: 10) {
            VStack(spacing: 8) {
                DAvatar(size: 76)
                Text("Ирина Малова").font(.system(size: 20, weight: .semibold))
                Text("кв. 51 · 3 подъезд").font(.system(size: 15)).foregroundStyle(D.sub)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 10)

            DCard {
                DRow(title: "Позвонить в квартиру", subtitle: "номер телефона не раскрывается") {
                    DBullet(symbol: "phone.fill", tint: D.green)
                } action: {
                    access.activate(.voip, on: "profile")
                    nav.cover(.call)
                }
                .accessibilityIdentifier("action.call")
                DHair(inset: 56)
                DRow(title: "Написать", subtitle: "личный чат") { DBullet(symbol: "bubble.left.fill") }
                    action: { nav.tab = .chats; nav.paths[.menu] = [] }
            }
        }
    }
}

struct CallView: View {
    @Environment(Nav.self) private var nav

    var body: some View {
        ZStack {
            LinearGradient(colors: [Color(hex: 0x2B3B4E), Color(hex: 0x0A0A0A)],
                           startPoint: .top, endPoint: .bottom).ignoresSafeArea()
            VStack(spacing: 12) {
                Spacer()
                DAvatar(size: 96)
                Text("Ирина Малова").font(.system(size: 26, weight: .semibold)).foregroundStyle(.white)
                Text("Двор · вызов в квартиру 51").font(.system(size: 15)).foregroundStyle(.white.opacity(0.7))
                Spacer()
                HStack(spacing: 60) {
                    callButton("phone.down.fill", D.red) { nav.cover = nil }
                    callButton("mic.slash.fill", .white.opacity(0.2)) {}
                }
                .padding(.bottom, 44)
            }
        }
        .accessibilityIdentifier("screen.call")
    }

    private func callButton(_ symbol: String, _ tint: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Circle().fill(tint).frame(width: 66, height: 66)
                .overlay { Image(systemName: symbol).font(.system(size: 25)).foregroundStyle(.white) }
        }
        .buttonStyle(.plain)
    }
}

/// Настройки: переключатели отражают реальный статус доступа.
struct SettingsView: View {
    @Environment(Nav.self) private var nav
    @Environment(AccessStore.self) private var access

    var body: some View {
        StackPage(title: "Настройки", spacing: 10) {
            DSectionTitle(text: "Мой дом")
            DCard {
                DRow(title: "Полевая, 12, кв. 74", subtitle: "3 подъезд") { DBullet(symbol: "house.fill") } trailing: {
                        Text(nav.homeConfirmed ? "подтверждён" : "на проверке")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundStyle(nav.homeConfirmed ? D.green : D.orangeInk)
                    }
            }

            DSectionTitle(text: "Уведомления")
            DCard {
                toggle("Уведомления о темах", .push)
                DHair(inset: 56)
                DRow(title: "Обновление в фоне", subtitle: "лента и срок готовы к утру") {
                    DBullet(symbol: "arrow.clockwise")
                } action: {
                    access.activate(.fetch, on: "settings")
                    nav.push(.background)
                }
                DHair(inset: 56)
                DRow(title: "Виджет на экран «Домой»", subtitle: "срок показаний и отключения") {
                    DBullet(symbol: "square.grid.2x2.fill")
                } action: {
                    access.activate(.appgroups, on: "settings")
                    nav.cover(.widget)
                }
                .accessibilityIdentifier("action.widget")
            }

            DSectionTitle(text: "Приватность")
            DCard {
                toggle("Замок Face ID на приложении", .faceid) { nav.cover(.lock) }
                DHair(inset: 56)
                toggle("Реклама и отслеживание", .tracking) { nav.push(.ads) }
            }

        }
    }

    private func toggle(_ title: String, _ key: Access, onGrant: @escaping () -> Void = {}) -> some View {
        DRow(title: title, subtitle: access.denied(key) ? key.fallback : nil) {
            DBullet(symbol: key == .faceid ? "faceid" : (key == .tracking ? "megaphone.fill" : "bell.fill"))
        } trailing: {
            Toggle("", isOn: Binding(
                get: { access.granted(key) },
                set: { on in
                    guard on else { return }
                    Task {
                        let ok = await access.request([key], on: "settings")
                        if ok { onGrant() }
                    }
                }
            ))
            .labelsHidden()
        }
        .accessibilityIdentifier("toggle.\(key.rawValue)")
    }
}

/// Реклама и ATT: без разрешения реклама остаётся, но перестаёт быть местной.
struct AdsView: View {
    @Environment(Nav.self) private var nav
    @Environment(AccessStore.self) private var access

    var body: some View {
        StackPage(title: "Реклама", spacing: 10) {
            DCard(padding: D.inset) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Местные услуги").font(.system(size: 17, weight: .semibold))
                    Text("С разрешением на отслеживание реклама будет про сантехника в вашем районе, а не про случайный баннер.")
                        .font(.system(size: 14)).foregroundStyle(D.sub).fixedSize(horizontal: false, vertical: true)
                }
            }

            DeniedNotice(key: .tracking)

            DButton(title: "Настроить рекомендации") {
                Task {
                    let ok = await access.request([.tracking], on: "ads")
                    nav.show(ok ? "Реклама стала местной" : "Реклама осталась общей")
                }
            }
            .accessibilityIdentifier("action.tracking")
        }
    }
}

struct LockView: View {
    @Environment(Nav.self) private var nav

    var body: some View {
        ZStack {
            D.dark.ignoresSafeArea()
            VStack(spacing: 16) {
                Spacer()
                Image(systemName: "faceid").font(.system(size: 66)).foregroundStyle(.white)
                Text("Двор закрыт").font(.system(size: 22, weight: .semibold)).foregroundStyle(.white)
                Text("В приложении адрес, номера квартир и коды от общих дверей.")
                    .font(.system(size: 14)).foregroundStyle(.white.opacity(0.6))
                    .multilineTextAlignment(.center).padding(.horizontal, 40)
                Spacer()
                DButton(title: "Разблокировать") { nav.cover = nil }.padding(D.inset)
            }
        }
        .accessibilityIdentifier("screen.lock")
    }
}

/// Виджет на экране «Домой»: две строки про дом, которые нужны до открытия приложения.
struct WidgetView: View {
    @Environment(Nav.self) private var nav

    var body: some View {
        ZStack {
            LinearGradient(colors: [Color(hex: 0x24304A), Color(hex: 0x0A0A0A)],
                           startPoint: .topLeading, endPoint: .bottomTrailing).ignoresSafeArea()
            VStack(spacing: 20) {
                Spacer()
                VStack(alignment: .leading, spacing: 9) {
                    HStack(spacing: 7) {
                        RoundedRectangle(cornerRadius: 6, style: .continuous)
                            .fill(D.accent).frame(width: 20, height: 20)
                            .overlay { Image(systemName: "house.fill").font(.system(size: 10)).foregroundStyle(.white) }
                        Text("Двор").font(.system(size: 13, weight: .semibold)).foregroundStyle(D.ink)
                        Spacer()
                    }
                    Text("Показания до 25 апреля")
                        .font(.system(size: 15, weight: .semibold)).foregroundStyle(D.ink)
                    Text("Горячая вода 14–17 апреля")
                        .font(.system(size: 13)).foregroundStyle(D.orangeInk)
                        .padding(.horizontal, 7).padding(.vertical, 3)
                        .background(D.orange.opacity(0.16), in: RoundedRectangle(cornerRadius: 7, style: .continuous))
                }
                .padding(14)
                .frame(width: 168, height: 168, alignment: .topLeading)
                .background(.white, in: RoundedRectangle(cornerRadius: 22, style: .continuous))

                Text("Виджет и приложение читают одни данные через общий контейнер.")
                    .font(.system(size: 13)).foregroundStyle(.white.opacity(0.6))
                    .multilineTextAlignment(.center).padding(.horizontal, 40)
                Spacer()
                DButton(title: "Открыть Двор") { nav.cover = nil }.padding(D.inset)
            }
        }
        .accessibilityIdentifier("screen.widget")
    }
}
