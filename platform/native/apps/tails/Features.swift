import SwiftUI

// Экраны, которые отрабатывают оставшиеся доступы: реклама вместо подписки,
// замок ветпаспорта, заметка голосом, курс в фоне, прививки в календаре,
// сеть площадки по QR и фоновое обновление.

struct AdsScreen: View {
    @Environment(Permissions.self) private var perms
    @Environment(\.dismiss) private var dismiss
    @Environment(\.theme) private var t
    @State private var decided = ShotMode.state == "accepted" || ShotMode.state == "declined"

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Spacer().frame(height: 8)
            Image(systemName: "megaphone.fill").font(.system(size: 40)).foregroundStyle(t.accent)
            Text("«Хвосты» бесплатны").textStyle(.largeTitle)
            Text("Приложение живёт за счёт рекламы зоомагазинов, кормов и ветклиник между моментами.")
                .textStyle(.body).foregroundStyle(t.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
            Text("Если разрешить отслеживание, реклама будет по вашему району и породе. Если нет — покажем обычную, всё остальное работает так же.")
                .textStyle(.body).foregroundStyle(t.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
            if ShotMode.state == "accepted" {
                AppStatePanel(kind: .success, title: "Реклама по интересам включена",
                              detail: "Покажем зоомагазины и клиники вашего района.")
            }
            if ShotMode.state == "declined" {
                AppStatePanel(kind: .empty, title: "Обычная реклама",
                              detail: "Отслеживание выключено, приложение работает полностью.")
            }
            Spacer()
            VKButton(title: "Реклама по интересам") {
                Task { await perms.request(.tracking); dismiss() }
            }
            Button("Обычная реклама") { dismiss() }
                .textStyle(.action)
                .frame(maxWidth: .infinity).padding(.vertical, 6)
            Spacer().frame(height: 8)
        }
        .padding(.horizontal, t.pad)
        .background(t.background)
        .vkNavigation("Реклама")
    }
}

// MARK: - Ветпаспорт под замком

struct LockScreen: View {
    @Environment(TailsStore.self) private var store
    @Environment(Permissions.self) private var perms
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var unlocked = false

    private var denied: Bool { ShotMode.isScreen("lock", state: "denied") }

    var body: some View {
        ScrollView {
            VStack(spacing: 14) {
                if denied {
                    AppStatePanel(kind: .warning, title: "Face ID недоступен",
                                  detail: "Откройте ветпаспорт код-паролем устройства.")
                        .padding(.horizontal, t.pad)
                }
                Image(systemName: unlocked ? "lock.open.fill" : "faceid")
                    .font(.system(size: 54, weight: .light)).foregroundStyle(t.accent)
                    .padding(.top, 20)
                Text(unlocked ? "Ветпаспорт открыт" : "Ветпаспорт под замком").textStyle(.section)
                Text(unlocked
                     ? "Диагнозы, номер чипа и адрес выгула видны только вам."
                     : "Здесь диагнозы, номер чипа и адрес выгула. Подтвердите Face ID, чтобы открыть.")
                    .textStyle(.body).foregroundStyle(t.textSecondary)
                    .multilineTextAlignment(.center).padding(.horizontal, 30)

                VStack(spacing: 0) {
                    ForEach(store.vetRecords) { record in
                        HStack(spacing: 12) {
                            Image(systemName: record.done ? "checkmark.circle.fill" : "clock")
                                .font(.system(size: 18))
                                .foregroundStyle(record.done ? t.positive : t.warning)
                                .frame(width: 28)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(record.title).textStyle(.rowTitle)
                                Text(unlocked ? record.detail : "•••••• скрыто до Face ID").textStyle(.meta)
                            }
                            Spacer()
                            Text(record.due).textStyle(.meta)
                                .foregroundStyle(record.due.hasPrefix("просрочено") ? t.warning : t.textSecondary)
                        }
                        .padding(.horizontal, t.pad).padding(.vertical, 10)
                        RowSeparator(leading: 60)
                    }
                }
                .blur(radius: unlocked ? 0 : 4)
                .animation(.easeOut(duration: 0.25), value: unlocked)

                if !unlocked {
                    VKButton(title: "Разблокировать", icon: "faceid") {
                        Task {
                            let ok = await perms.request(.faceid)
                            if ok { withAnimation { unlocked = true } }
                            else { nav.toast("Введите код-пароль устройства", once: "faceid") }
                        }
                    }
                    .padding(.horizontal, t.pad)
                    Button("Ввести код-пароль") { withAnimation { unlocked = true } }
                        .textStyle(.action)
                }
                Color.clear.frame(height: 30)
            }
        }
        .background(t.background)
        .vkNavigation("Ветпаспорт")
        .toolbar(.hidden, for: .tabBar)
    }
}

// MARK: - Заметка о самочувствии голосом

struct VetNoteScreen: View {
    @Environment(TailsStore.self) private var store
    @Environment(Permissions.self) private var perms
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var phase: Phase = ShotMode.isScreen("vetnote", state: "recording") ? .recording
        : (ShotMode.isScreen("vetnote", state: "success") ? .ready : .idle)
    @State private var text = ShotMode.isScreen("vetnote", state: "success")
        ? "Хромает на левую заднюю после прогулки, отёка нет, ест обычно"
        : ""

    enum Phase { case idle, recording, ready }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("Что с питомцем?").textStyle(.section)
                Text("Надиктуйте наблюдение — текст ляжет в карточку и найдётся поиском по симптому.")
                    .textStyle(.body).foregroundStyle(t.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)

                if ShotMode.isScreen("vetnote", state: "error") {
                    AppStatePanel(kind: .error, title: "Не удалось распознать",
                                  detail: "Слишком шумно на улице — отредактируйте текст руками.")
                }
                if ShotMode.isScreen("vetnote", state: "denied") {
                    AppStatePanel(kind: .warning, title: "Распознавание речи выключено",
                                  detail: "Наберите заметку текстом — она попадёт в карточку так же.")
                }

                ZStack(alignment: .topLeading) {
                    TextEditor(text: $text)
                        .font(.role(.body)).frame(height: 140)
                        .scrollContentBackground(.hidden).padding(10)
                        .background(t.fill, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                    if text.isEmpty {
                        Text("Например: хромает на левую заднюю после прогулки")
                            .textStyle(.body).foregroundStyle(t.textSecondary)
                            .padding(.horizontal, 15).padding(.top, 18)
                            .allowsHitTesting(false)
                    }
                }

                if phase == .recording {
                    HStack(spacing: 10) {
                        Circle().fill(t.badge).frame(width: 10, height: 10)
                        Text("Слушаем · 0:06").textStyle(.body)
                        Spacer()
                        Button("Стоп") {
                            withAnimation {
                                phase = .ready
                                text = "Хромает на левую заднюю после прогулки, отёка нет, ест обычно"
                            }
                        }
                        .textStyle(.action)
                    }
                    .padding(12)
                    .background(t.fill, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                }

                VKButton(title: phase == .recording ? "Идёт запись" : "Надиктовать", icon: "waveform") {
                    Task {
                        let ok = await perms.request(.speech)
                        if ok { withAnimation { phase = .recording } }
                        else { nav.toast("Наберите заметку текстом", once: "speech") }
                    }
                }
                .disabled(phase == .recording)

                VKOutlineButton(title: "Сохранить в карточку", icon: "square.and.arrow.down") {
                    store.addVetNote(text.isEmpty ? "Заметка без описания" : text)
                    nav.toast("Заметка в карточке Буси")
                }
                .disabled(text.trimmingCharacters(in: .whitespaces).isEmpty)
            }
            .padding(t.pad)
        }
        .background(t.background)
        .vkNavigation("Самочувствие")
    }
}

// MARK: - Курс послушания

struct CourseScreen: View {
    @Environment(TailsStore.self) private var store
    @Environment(Permissions.self) private var perms
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var playing = ShotMode.isScreen("course", state: "playing")

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                if ShotMode.isScreen("course", state: "loading") {
                    AppStatePanel(kind: .loading, title: "Загружаем занятие",
                                  detail: "Скачаем целиком, чтобы слушать без сети на прогулке.")
                        .padding(t.pad)
                }
                if ShotMode.isScreen("course", state: "error") {
                    AppStatePanel(kind: .error, title: "Занятие не загрузилось",
                                  detail: "Нет сети. Скачанные занятия ниже слушаются офлайн.")
                        .padding(t.pad)
                }
                VStack(spacing: 12) {
                    Image(systemName: "headphones")
                        .font(.system(size: 44)).foregroundStyle(t.accent)
                        .frame(width: 120, height: 120)
                        .background(t.accentSoft, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
                        .padding(.top, 16)
                    Text("Ходьба рядом без натяжения").textStyle(.section)
                        .multilineTextAlignment(.center)
                    Text("14 минут · шаг 3 из 8 · слушают на прогулке")
                        .textStyle(.body).foregroundStyle(t.textSecondary)
                    HStack(spacing: 34) {
                        Image(systemName: "gobackward.15").font(.system(size: 24))
                        Button {
                            Task {
                                await perms.request(.audio)
                                withAnimation { playing.toggle() }
                                if playing { nav.toast("Играет в фоне — можно убрать телефон") }
                            }
                        } label: {
                            Image(systemName: playing ? "pause.circle.fill" : "play.circle.fill")
                                .font(.system(size: 58)).foregroundStyle(t.accent)
                        }
                        .pressable(scale: 0.92)
                        .accessibilityLabel(playing ? "Пауза" : "Слушать занятие")
                        Image(systemName: "goforward.15").font(.system(size: 24))
                    }
                    .foregroundStyle(t.textPrimary)
                    .padding(.bottom, 16)
                }
                .frame(maxWidth: .infinity)
                GroupGap()

                VKSectionHeader(title: "Занятия", count: "\(store.lessons.count)")
                ForEach(store.lessons) { lesson in
                    HStack(spacing: 12) {
                        Image(systemName: "waveform").font(.system(size: 20)).foregroundStyle(t.accent)
                            .frame(width: 44, height: 44)
                            .background(t.accentSoft, in: RoundedRectangle(cornerRadius: 10, style: .continuous))
                        VStack(alignment: .leading, spacing: 2) {
                            Text(lesson.title).textStyle(.rowTitle).lineLimit(1)
                            Text("\(lesson.duration) · \(lesson.state)").textStyle(.meta).lineLimit(1)
                        }
                        Spacer(minLength: 8)
                        if let progress = lesson.progress {
                            ProgressView(value: progress).progressViewStyle(.circular).scaleEffect(0.8)
                        } else if lesson.state == "скачан" {
                            Image(systemName: "arrow.down.circle.fill")
                                .font(.system(size: 18)).foregroundStyle(t.positive)
                        }
                    }
                    .padding(.horizontal, t.pad).padding(.vertical, 8)
                    RowSeparator(leading: 72)
                }
                Color.clear.frame(height: 40)
            }
        }
        .background(t.background)
        .vkNavigation("Курс послушания")
    }
}

// MARK: - Прививки в календаре

struct VaccineScreen: View {
    @Environment(TailsStore.self) private var store
    @Environment(Permissions.self) private var perms
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var added: Set<UUID> = []

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                if ShotMode.isScreen("vaccine", state: "error") {
                    AppStatePanel(kind: .error, title: "Календарь недоступен",
                                  detail: "Даты остаются в карточке питомца — напомним уведомлением.")
                        .padding(t.pad)
                }
                if ShotMode.isScreen("vaccine", state: "added") {
                    AppStatePanel(kind: .success, title: "Прививка в календаре",
                                  detail: "Событие подвинется, если клиника перенесёт приём.")
                        .padding(t.pad)
                }
                ForEach(store.vetRecords) { record in
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: record.done ? "checkmark.circle.fill" : "syringe")
                            .font(.system(size: 20))
                            .foregroundStyle(record.done ? t.positive : t.accent)
                            .frame(width: 28)
                        VStack(alignment: .leading, spacing: 4) {
                            Text(record.title).textStyle(.rowTitle)
                            Text(record.detail).textStyle(.meta)
                            Text(record.due).textStyle(.meta)
                                .foregroundStyle(record.due.hasPrefix("просрочено") ? t.warning : t.textSecondary)
                            if !record.done {
                                Button(added.contains(record.id) ? "Добавлено в календарь" : "Добавить в календарь") {
                                    Task {
                                        let ok = await perms.request(.calendar)
                                        if ok { withAnimation { _ = added.insert(record.id) } }
                                        else { nav.toast("Даты останутся в карточке", once: "calendar") }
                                    }
                                }
                                .textStyle(.action)
                                .disabled(added.contains(record.id))
                            }
                        }
                        Spacer(minLength: 0)
                    }
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
                    RowSeparator(leading: 60)
                }
                Color.clear.frame(height: 40)
            }
        }
        .background(t.background)
        .vkNavigation("Прививки и обработки")
    }
}

// MARK: - Сеть площадки по QR

struct NetQRScreen: View {
    @Environment(Permissions.self) private var perms
    @Environment(Nav.self) private var nav
    @Environment(\.dismiss) private var dismiss
    @Environment(\.theme) private var t
    @State private var joined = ShotMode.isScreen("netqr", state: "connected")

    var body: some View {
        VStack(spacing: 18) {
            if ShotMode.isScreen("netqr", state: "error") {
                AppStatePanel(kind: .error, title: "Сеть не приняла код",
                              detail: "QR устарел — попросите новый у администратора площадки.")
                    .padding(.horizontal, t.pad)
            }
            Spacer()
            ZStack {
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(t.fill).frame(width: 200, height: 200)
                Image(systemName: joined ? "checkmark.circle.fill" : "qrcode")
                    .font(.system(size: joined ? 72 : 96))
                    .foregroundStyle(joined ? t.positive : t.textPrimary)
            }
            Text(joined ? "Сеть площадки подключена" : "Наведите на QR у входа").textStyle(.section)
            Text(joined
                 ? "Теперь отметка «я на месте» подтверждается сетью дог-парка."
                 : "Гостевая сеть партнёрского дог-парка нужна, чтобы подтвердить отметку на площадке.")
                .textStyle(.body).foregroundStyle(t.textSecondary)
                .multilineTextAlignment(.center).padding(.horizontal, 30)
            Spacer()
            if !joined {
                VKButton(title: "Подключиться к сети", icon: "wifi") {
                    Task {
                        let ok = await perms.request(.hotspot)
                        if ok { withAnimation { joined = true } }
                        else { nav.toast("Подключитесь к сети вручную в Настройках", once: "hotspot") }
                    }
                }
                .padding(.horizontal, t.pad)
            } else {
                VKButton(title: "Готово") { dismiss() }.padding(.horizontal, t.pad)
            }
            Spacer().frame(height: 20)
        }
        .background(t.background)
        .vkNavigation("Сеть площадки")
    }
}

// MARK: - Фоновое обновление

struct RefreshScreen: View {
    @Environment(Permissions.self) private var perms
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var scheduled = ShotMode.isScreen("refresh", state: "scheduled")

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("Обновление в фоне").textStyle(.section)
                Text("Система будит «Хвосты» раз в несколько часов и подтягивает состав прогулок и ответы. Это экономит время на запуске.")
                    .textStyle(.body).foregroundStyle(t.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)

                if scheduled {
                    AppStatePanel(kind: .success, title: "Задача зарегистрирована",
                                  detail: "Ближайшее обновление — когда система решит, что момент удобный.")
                }
                if ShotMode.isScreen("refresh", state: "denied") {
                    AppStatePanel(kind: .warning, title: "Фон выключен",
                                  detail: "Лента обновится при открытии приложения — ничего не теряется.")
                }

                VKRow(title: "Последнее обновление", icon: "clock", value: "18 минут назад", chevron: false)
                RowSeparator(leading: 60)
                VKRow(title: "Что обновляем", icon: "arrow.triangle.2.circlepath",
                      value: "прогулки и ответы", chevron: false)

                VKButton(title: scheduled ? "Задача уже стоит" : "Зарегистрировать задачу", icon: "clock.arrow.circlepath") {
                    Task {
                        let ok = await perms.request(.bgtask)
                        if ok { withAnimation { scheduled = true } }
                        else { nav.toast("Обновим при следующем запуске", once: "bgtask") }
                    }
                }
                .disabled(scheduled)
            }
            .padding(t.pad)
        }
        .background(t.background)
        .vkNavigation("Обновление в фоне")
    }
}
