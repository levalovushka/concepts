import SwiftUI
import EventKit

// MARK: - Рядом: обмен вещами и встречи (гео)

struct NearbyScreen: View {
    var captureState: String? = nil
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.visualLanguage) private var t
    @State private var filter = 0

    var body: some View {
        VStack(spacing: 0) {
            VKFilterPills(items: [("Все", "line.3.horizontal.decrease"), ("Обмен", "arrow.left.arrow.right"),
                                ("Барахолки", "bag"), ("Встречи", "person.2")], selection: $filter)
                .scrollClipDisabled()
                .padding(.vertical, 10)
                .background(t.palette.surface)

            ScrollView {
                LazyVStack(spacing: 0) {
                    if perms.status(.location) != .granted {
                        VKGroup {
                            VStack(alignment: .leading, spacing: 12) {
                                Image(systemName: "location.circle.fill")
                                    .font(.system(size: 34)).foregroundStyle(t.palette.accent)
                                Text("Показать обмен вещами поблизости")
                                    .font(.role(.section)).foregroundStyle(t.palette.textPrimary)
                                Text("Нужна геопозиция, чтобы отсортировать встречи по расстоянию. Без неё покажем всё по городу")
                                    .font(.vkBody).foregroundStyle(t.palette.textSecondary)
                                    .fixedSize(horizontal: false, vertical: true)
                                VKButton(title: "Разрешить геопозицию", icon: "location.fill") {
                                    Task {
                                        let ok = await LooksPermissionFlow.requestLocation(using: perms)
                                        if !ok { nav.toast("Показываем обмены по городу", once: "location") }
                                    }
                                }
                                .nativeAction("nearby.enable-location")
                            }
                            .padding(16)
                        }
                    }
                    if captureState == "empty" {
                        NativeStatePanel(kind: .empty,
                                         title: "Рядом пока нет событий",
                                         detail: "Покажем обмен вещами и встречи, когда они появятся в вашем городе.",
                                         placement: .page)
                            .padding(.horizontal, t.spacing.contentInset)
                            .padding(.top, 16)
                    } else {
                        ForEach(filteredEvents) { e in
                            Button { nav.push(LooksRoute.event(e)) } label: { EventCard(event: e) }
                                .nativeAction("nearby.open-nearby-event")
                                .buttonStyle(.plain)
                        }
                        if filteredEvents.isEmpty {
                            NativeStatePanel(kind: .empty,
                                             title: "В этой категории пока пусто",
                                             detail: "Новые события появятся здесь.",
                                             placement: .page)
                                .padding(.horizontal, t.spacing.contentInset)
                                .padding(.top, 16)
                        }
                    }
                }

                .padding(.bottom, 72)
            }
            .background(t.palette.background)
        }
        .background(t.palette.background)
        .vkNavigation("Обмен рядом")
    }

    private var filteredEvents: [NearbyEvent] {
        switch filter {
        case 1: store.events.filter { !$0.title.localizedCaseInsensitiveContains("барахолка") }
        case 2: store.events.filter { $0.title.localizedCaseInsensitiveContains("барахолка") }
        case 3: store.events.filter { $0.title.localizedCaseInsensitiveContains("встреч") }
        default: store.events
        }
    }
}

private struct EventCard: View {
    let event: NearbyEvent
    @Environment(Permissions.self) private var perms
    @Environment(\.visualLanguage) private var t
    var body: some View {
        VKGroup {
            VKMedia(assetName: LooksMediaAssets.event(event.going), height: 140)
            VStack(alignment: .leading, spacing: 8) {
                Text(event.title).font(.role(.cardTitle)).foregroundStyle(t.palette.textPrimary)
                HStack(spacing: 6) {
                    Image(systemName: "calendar").font(.system(size: 13))
                    Text(event.when)
                    Text("·")
                    Text(event.place).lineLimit(1)
                }
                .font(.vkMeta).foregroundStyle(t.palette.textSecondary)
                HStack(spacing: 8) {
                    Label(perms.isGranted(.location) ? event.distance : "в городе", systemImage: "location.fill")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(t.palette.accent)
                        .padding(.horizontal, 10).frame(height: 28)
                        .background(t.palette.accent.opacity(0.12), in: Capsule())
                    Text("\(event.going) идут").font(.vkMeta).foregroundStyle(t.palette.textSecondary)
                    Spacer()
                }
            }
            .padding(12)
        }
    }
}

struct EventScreen: View {
    let event: NearbyEvent
    var captureState: String? = nil
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.visualLanguage) private var t
    @State private var going = false
    @State private var addingToCalendar = false
    @State private var calendarAdded = false

    private var isCancelled: Bool { captureState == "cancelled" }
    private var isGoing: Bool { captureState == "joined" || going }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                VKGroup {
                    VKMedia(assetName: LooksMediaAssets.swap, height: 180)
                    VStack(alignment: .leading, spacing: 10) {
                        Text(event.title).font(.vkSection).foregroundStyle(t.palette.textPrimary)
                        InfoRow(icon: "calendar", text: event.when)
                        InfoRow(icon: "mappin.and.ellipse", text: event.place)
                        InfoRow(icon: "person.2.fill", text: peopleGoing(event.going))
                    }
                    .padding(12)
                }
                if captureState == "joined" {
                    VKGroup {
                        NativeStatePanel(
                            kind: .success,
                            title: "Вы участвуете",
                            detail: "Событие сохранено. Напомним о нём заранее.",
                            actionTitle: calendarAdded ? "Добавлено в календарь" : "Добавить в календарь",
                            action: addToCalendar,
                            placement: .inline
                        )
                    }
                } else if isCancelled {
                    VKGroup {
                        NativeStatePanel(
                            kind: .error,
                            title: "Событие отменено",
                            detail: "Организатор отменил встречу. Другие события доступны в разделе «Рядом».",
                            actionTitle: "Смотреть другие",
                            action: { nav.push(LooksRoute.nearby) },
                            placement: .inline
                        )
                    }
                }
                VKGroup {
                    Text("Организатор")
                        .font(.role(.groupHeader)).foregroundStyle(t.palette.textSecondary)
                        .padding(.horizontal, 12).padding(.top, 12).padding(.bottom, 8)
                    HStack(spacing: 12) {
                        Avatar(name: "Аня Котова", size: 40)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Аня Котова").font(.role(.action))
                            Text("организовала 12 обменов").font(.vkMeta).foregroundStyle(t.palette.textSecondary)
                        }
                        Spacer()
                        Button {
                            nav.push(LooksRoute.chat(store.dialogs[0]))
                        } label: {
                            Text("Написать").font(.role(.pill))
                                .foregroundStyle(t.palette.accent)
                                .padding(.horizontal, 12).frame(height: 30)
                                .background(t.palette.accent.opacity(0.12), in: Capsule())
                        }
                        .buttonStyle(.plain)
                    }
                    .padding(.horizontal, 12).padding(.bottom, 12)
                }
                VKGroup {
                    Text("Что приносить")
                        .font(.role(.groupHeader)).foregroundStyle(t.palette.textSecondary)
                        .padding(.horizontal, 12).padding(.top, 12).padding(.bottom, 6)
                    ForEach(["Верх и платья — в чистом виде",
                             "Обувь без следов носки",
                             "Аксессуары любые"], id: \.self) { r in
                        HStack(alignment: .top, spacing: 10) {
                            Image(systemName: "circle.fill").font(.system(size: 5))
                                .foregroundStyle(t.palette.textTertiary).padding(.top, 7)
                            Text(r).font(.vkBody).foregroundStyle(t.palette.textPrimary)
                            Spacer()
                        }
                        .padding(.horizontal, 12).padding(.vertical, 5)
                    }
                    Color.clear.frame(height: 8)
                }
                if !isCancelled {
                VKGroup {
                    VStack(spacing: 10) {
                        VKButton(title: isGoing ? "Вы идёте" : "Пойду",
                                      icon: isGoing ? "checkmark" : "person.badge.plus") {
                            withAnimation { going.toggle() }
                            store.setGoing(going, to: event)
                            nav.toast(going ? "Вы участвуете в обмене" : "Участие отменено")
                        }
                        .nativeAction("event.join-event")
                        Button { nav.push(LooksRoute.swap) } label: {
                            HStack(spacing: 8) {
                                Image(systemName: "arrow.left.arrow.right")
                                Text("Договориться об обмене")
                            }
                            .font(.system(size: 15, weight: .medium)).foregroundStyle(t.palette.accent)
                            .frame(maxWidth: .infinity).frame(height: 40)
                            .background(t.palette.accent.opacity(0.12), in: RoundedRectangle(cornerRadius: t.metrics.controlRadius))
                        }
                        .buttonStyle(.plain)
                        if isGoing {
                            Button { nav.push(LooksRoute.checkin) } label: {
                                HStack(spacing: 8) {
                                    Image(systemName: "checkmark.circle")
                                    Text("Отметиться на встрече")
                                }
                                .font(.system(size: 15, weight: .medium)).foregroundStyle(t.palette.accent)
                                .frame(maxWidth: .infinity).frame(height: 40)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(12)
                }
                }
            }

        }
        .background(t.palette.background)
        .vkNavigation("Обмен вещами")
        .onAppear {
            going = captureState == "joined" || store.isGoing(to: event)
        }
    }

    private func addToCalendar() {
        guard !addingToCalendar, !calendarAdded else { return }
        addingToCalendar = true
        Task { @MainActor in
            defer { addingToCalendar = false }
            guard await LooksPermissionFlow.requestCalendar(using: perms) else {
                nav.toast("Календарь недоступен", once: "event-calendar")
                return
            }
            do {
                let eventStore = EKEventStore()
                let calendarEvent = EKEvent(eventStore: eventStore)
                calendarEvent.title = event.title
                calendarEvent.location = event.place
                calendarEvent.startDate = nextSaturdayAtThree
                calendarEvent.endDate = nextSaturdayAtThree.addingTimeInterval(2 * 60 * 60)
                calendarEvent.calendar = eventStore.defaultCalendarForNewEvents
                calendarEvent.notes = "Событие из «Образов»"
                try eventStore.save(calendarEvent, span: .thisEvent, commit: true)
                calendarAdded = true
                nav.toast("Событие в календаре")
            } catch {
                nav.toast("Не удалось сохранить в календарь", once: "event-calendar-save")
            }
        }
    }

    private var nextSaturdayAtThree: Date {
        let calendar = Calendar.current
        let start = calendar.nextDate(after: .now, matching: DateComponents(weekday: 7),
                                      matchingPolicy: .nextTime) ?? .now
        return calendar.date(bySettingHour: 15, minute: 0, second: 0, of: start) ?? start
    }
}

/// «34 человека идут» / «21 человек идёт» — без шаблонной склейки.
func peopleGoing(_ n: Int) -> String {
    let t = n % 10, h = n % 100
    if t == 1 && h != 11 { return "\(n) человек идёт" }
    if (2...4).contains(t) && !(12...14).contains(h) { return "\(n) человека идут" }
    return "\(n) человек идут"
}

private struct InfoRow: View {
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

// MARK: - Гардероб (свои вещи и образы)

struct WardrobeScreen: View {
    var captureState: String? = nil
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.visualLanguage) private var t
    @State private var tab = 0

    private var garments: [Garment] { store.garments }

    private func wardrobeStat(_ v: String, _ l: String) -> some View {
        VStack(spacing: 2) {
            Text(v).font(.role(.cardTitle)).foregroundStyle(t.palette.textPrimary)
            Text(l).font(.vkCaption).foregroundStyle(t.palette.textSecondary)
        }
        .frame(maxWidth: .infinity)
    }

    var body: some View {
        VStack(spacing: 0) {
            VKTabs(items: ["Вещи", "Мои образы", "Сохранённое"], selection: $tab)
            Rectangle().fill(t.palette.separator).frame(height: 0.5)

            ScrollView {
                if captureState == "loading" {
                    NativeStatePanel(kind: .loading,
                                     title: "Открываем гардероб",
                                     detail: "Загружаем вещи и сохранённые сочетания.",
                                     placement: .page)
                        .padding(.horizontal, t.spacing.contentInset)
                        .padding(.top, 24)
                } else if captureState == "empty" {
                    NativeStatePanel(kind: .empty,
                                     title: "Гардероб пуст",
                                     detail: "Добавьте первую вещь, чтобы собирать образы и подборки.",
                                     actionTitle: "Добавить вещь",
                                     action: { nav.present(cover: LooksRoute.create) },
                                     placement: .page)
                        .padding(.horizontal, t.spacing.contentInset)
                        .padding(.top, 24)
                } else if tab == 0 {
                    // сводка гардероба: живой, а не плоский список
                    VKGroup {
                        HStack(spacing: 0) {
                            wardrobeStat("\(garments.count)", "вещей")
                            Rectangle().fill(t.palette.separator).frame(width: 0.5, height: 26)
                            wardrobeStat("\(garments.filter { if case .worn = $0.state { return true }; return false }.count)",
                                         "носили")
                            Rectangle().fill(t.palette.separator).frame(width: 0.5, height: 26)
                            wardrobeStat("\(garments.filter { if case .idle = $0.state { return true }; return false }.count)",
                                         "лежат")
                            Rectangle().fill(t.palette.separator).frame(width: 0.5, height: 26)
                            wardrobeStat("\(garments.filter { $0.state == .onSwap || $0.state == .wanted }.count)",
                                         "для обмена")
                        }
                        .padding(.vertical, 12)
                    }

                    LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 2), spacing: 8) {
                        ForEach(garments) { g in GarmentCard(garment: g) }
                    }
                    .padding(t.spacing.contentInset)
                } else if tab == 1 {
                    LazyVStack(spacing: 0) {
                        ForEach(store.outfits.prefix(2)) { o in
                            VKGroup {
                                VKMedia(assetName: LooksMediaAssets.outfit(o.seed), height: 200)
                                Text(o.text.isEmpty ? "Без описания" : o.text)
                                    .font(.vkBody).foregroundStyle(t.palette.textPrimary)
                                    .lineLimit(2).padding(12)
                            }
                        }
                    }

                } else {
                    let saved = store.outfits.filter(\.saved)
                    if saved.isEmpty {
                        EmptyState(icon: "bookmark", title: "Пока пусто",
                                   text: "Сохраняйте образы из ленты — они появятся здесь")
                    } else {
                        LazyVStack(spacing: 0) {
                            ForEach(saved) { outfit in
                                Button { nav.push(LooksRoute.outfit(outfit)) } label: {
                                    VKGroup {
                                        VKMedia(assetName: LooksMediaAssets.outfit(outfit.seed), height: 200)
                                        Text(outfit.text.isEmpty ? "Без описания" : outfit.text)
                                            .font(.vkBody).foregroundStyle(t.palette.textPrimary)
                                            .lineLimit(2).padding(12)
                                    }
                                }
                                .nativeAction("wardrobe.open-saved-look")
                                .buttonStyle(.plain)
                            }
                        }
                    }
                }
            }
            .background(t.palette.background)
        }
        .background(t.palette.background)
        .vkNavigation("Гардероб") {
            Button { nav.present(cover: LooksRoute.create) } label: {
                Image(systemName: "plus")
                    .font(.system(size: 20, weight: .regular))
                    .frame(width: 44, height: 44)
            }
            .accessibilityLabel("Добавить вещь")
        }
    }
}

private struct GarmentCard: View {
    let garment: Garment
    @Environment(\.visualLanguage) private var t
    var body: some View {
        VKCard {
            ZStack(alignment: .topTrailing) {
                VKMedia(assetName: LooksMediaAssets.detail(garment.title.count), height: 124)
                // состояние вещи — приложение всегда наполовину в процессе
                HStack(spacing: 4) {
                    Image(systemName: garment.state.icon).font(.system(size: 10, weight: .semibold))
                    Text(garment.state.label).font(.role(.bubbleTime))
                }
                .foregroundStyle(stateColor)
                .padding(.horizontal, 7).padding(.vertical, 3)
                .background(.regularMaterial, in: Capsule())
                .padding(8)
            }
            VStack(alignment: .leading, spacing: 3) {
                Text(garment.title).font(.role(.pill))
                    .foregroundStyle(t.palette.textPrimary).lineLimit(1)
                HStack(spacing: 5) {
                    Text(garment.brand).font(.vkCaption).foregroundStyle(t.palette.textSecondary)
                        .lineLimit(1).layoutPriority(1)
                    if garment.inOutfits > 0 {
                        Text("·").foregroundStyle(t.palette.textTertiary)
                        Text("в \(garment.inOutfits) образах").font(.vkCaption)
                            .foregroundStyle(t.palette.accent).lineLimit(1).layoutPriority(2)
                    }
                }
                .minimumScaleFactor(0.75)
            }
            .padding(10)
        }
    }
    private var stateColor: Color {
        switch garment.state {
        case .worn: return t.palette.positive
        case .idle: return t.palette.textSecondary
        case .onSwap: return t.palette.warning
        case .wanted: return t.palette.accent
        }
    }
}

struct EmptyState: View {
    let icon: String; let title: String; let text: String
    @Environment(\.visualLanguage) private var t
    var body: some View {
        VStack(spacing: 10) {
            Image(systemName: icon).font(.system(size: 44, weight: .light)).foregroundStyle(t.palette.textTertiary)
            Text(title).font(.role(.section)).foregroundStyle(t.palette.textPrimary)
            Text(text).font(.vkBody).foregroundStyle(t.palette.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(.horizontal, 40).padding(.top, 60)
    }
}

// MARK: - Образ целиком

struct OutfitScreen: View {
    let outfit: Outfit
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.visualLanguage) private var t
    @State private var showComments = false

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                VKGroup {
                    VKMedia(assetName: LooksMediaAssets.outfit(outfit.seed), height: 360)
                        .overlay(alignment: .bottomLeading) {
                            VStack(alignment: .leading, spacing: 6) {
                                ForEach(Array(outfit.items.enumerated()), id: \.element.id) { i, g in
                                    HStack(spacing: 6) {
                                        Text("\(i + 1)")
                                            .font(.role(.bubbleTime)).foregroundStyle(.black)
                                            .frame(width: 18, height: 18).background(.white, in: Circle())
                                        Text(g.title).font(.role(.groupHeader))
                                            .foregroundStyle(.white)
                                    }
                                    .padding(.horizontal, 8).padding(.vertical, 5)
                                    .background(.black.opacity(0.55), in: Capsule())
                                }
                            }
                            .padding(12)
                        }
                    VStack(alignment: .leading, spacing: 10) {
                        HStack(spacing: 10) {
                            Avatar(name: outfit.author, size: 40)
                            VStack(alignment: .leading, spacing: 1) {
                                Text(outfit.author).font(.vkName)
                                Text(outfit.meta).font(.vkMeta).foregroundStyle(t.palette.textSecondary)
                            }
                            Spacer()
                        }
                        if !outfit.text.isEmpty {
                            Text(outfit.text).font(.vkBody).lineSpacing(4)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                        VKPostActions(likes: outfit.likes, liked: outfit.liked,
                                      comments: outfit.comments, shares: outfit.shares,
                                      saved: outfit.saved, trailing: outfit.views,
                                      nativeActionID: "post.save-look",
                                      onLike: { store.toggleLike(outfit.id) },
                                      onComment: { showComments = true },
                                      onShare: {
                                          UIPasteboard.general.string = "looks://outfit/\(outfit.id.uuidString)"
                                          nav.toast("Ссылка скопирована")
                                      },
                                      onSave: { store.toggleSave(outfit.id) })
                            .padding(.top, 4)
                    }
                    .padding(12)
                }
                VKGroup {
                    Text("Вещи образа").font(.role(.cardTitle))
                        .padding(.horizontal, 12).padding(.top, 12).padding(.bottom, 4)
                    ForEach(Array(outfit.items.enumerated()), id: \.element.id) { i, g in
                        HStack(spacing: 12) {
                            VKMedia(assetName: LooksMediaAssets.detail(g.title.count), height: 44)
                                .frame(width: 44)
                                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                            VStack(alignment: .leading, spacing: 2) {
                                Text(g.title).font(.role(.action))
                                HStack(spacing: 5) {
                                    Text(g.brand).font(.vkMeta).foregroundStyle(t.palette.textSecondary)
                                    if g.inOutfits > 0 {
                                        Text("·").foregroundStyle(t.palette.textTertiary)
                                        Text("в \(g.inOutfits) образах").font(.vkMeta)
                                            .foregroundStyle(t.palette.accent)
                                    }
                                }
                            }
                            Spacer()
                            Text(g.state.label).font(.vkMeta).foregroundStyle(t.palette.textSecondary)
                        }
                        .padding(.horizontal, 12).padding(.vertical, 8)
                        if i < outfit.items.count - 1 { RowSeparator(leading: 68) }
                    }
                    Color.clear.frame(height: 6)
                }
                VKGroup {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Хотите повторить сочетание?").font(.role(.cardTitle))
                        Text("Откроем редактор с вещами этого образа как подсказкой — публикация появится только после вашего подтверждения.")
                            .font(.vkMeta).foregroundStyle(t.palette.textSecondary)
                        VKButton(title: "Собрать похожий образ", icon: "plus") {
                            nav.present(cover: LooksRoute.create)
                        }
                    }
                    .padding(12)
                }
            }

        }
        .background(t.palette.background)
        .vkNavigation("Образ")
        .sheet(isPresented: $showComments) { OutfitCommentsSheet(outfit: outfit) }
    }
}

private struct OutfitCommentsSheet: View {
    let outfit: Outfit
    @Environment(\.dismiss) private var dismiss
    @Environment(\.visualLanguage) private var t
    @State private var draft = ""
    @State private var comments = [
        "Сохранила сочетание, попробую с серым жакетом",
        "Очень нравится, что вещи не выглядят как витрина",
    ]

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                ScrollView {
                    LazyVStack(spacing: 0) {
                        ForEach(Array(comments.enumerated()), id: \.offset) { index, text in
                            HStack(alignment: .top, spacing: 10) {
                                Avatar(name: index.isMultiple(of: 2) ? "Аня Котова" : "Марк Львов", size: 36)
                                VStack(alignment: .leading, spacing: 3) {
                                    Text(index.isMultiple(of: 2) ? "Аня Котова" : "Марк Львов").font(.vkName)
                                    Text(text).font(.vkBody).foregroundStyle(t.palette.textPrimary)
                                }
                                Spacer(minLength: 0)
                            }
                            .padding(12)
                            if index < comments.count - 1 { RowSeparator(leading: 58) }
                        }
                    }
                }
                HStack(spacing: 8) {
                    TextField("Комментарий к образу", text: $draft)
                        .textFieldStyle(.plain).padding(.horizontal, 14).frame(height: 40)
                        .background(t.palette.fill, in: Capsule())
                    Button("Отправить") {
                        let value = draft.trimmingCharacters(in: .whitespacesAndNewlines)
                        guard !value.isEmpty else { return }
                        comments.append(value)
                        draft = ""
                    }
                    .disabled(draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
                .padding(12).background(t.palette.background)
            }
            .navigationTitle("Комментарии · \(outfit.comments)")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .confirmationAction) { Button("Готово") { dismiss() } } }
        }
        .presentationDetents([.medium, .large])
    }
}

// MARK: - Создание образа (камера + медиатека)

struct CreateScreen: View {
    var captureState: String? = nil
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.dismiss) private var dismiss
    @Environment(\.visualLanguage) private var t
    @State private var text = ""
    @State private var picked = false
    @State private var tagged = false
    @State private var audience = "Все"
    @State private var recoveredFromError = false

    var body: some View {
        VStack(spacing: 0) {
            VKModalChrome(
                title: "Образ",
                onCancel: { dismiss() },
                cancelTitle: captureState == "success" || captureState == "error" ? "Закрыть" : "Отмена",
                doneTitle: captureState == "success" || captureState == "error" ? nil : "Опубликовать",
                doneDisabled: !picked,
                onDone: { store.publish(text: text); dismiss() }
            )
            ScrollView {
                if captureState == "success" {
                    NativeStatePanel(kind: .success,
                                     title: "Образ опубликован",
                                     detail: "Он уже появился в ленте и в вашем профиле.",
                                     actionTitle: "Открыть публикацию",
                                     action: { openPublishedOutfit() },
                                     placement: .page)
                        .padding(.horizontal, t.spacing.contentInset)
                        .padding(.top, 24)
                } else if captureState == "error" && !recoveredFromError {
                    NativeStatePanel(kind: .error,
                                     title: "Не удалось опубликовать",
                                     detail: "Черновик сохранён. Проверьте соединение и попробуйте ещё раз.",
                                     actionTitle: "Вернуться к черновику",
                                     action: { recoveredFromError = true },
                                     placement: .page)
                        .padding(.horizontal, t.spacing.contentInset)
                        .padding(.top, 24)
                } else {
                    VStack(spacing: 0) {
                    VKGroup {
                        if picked {
                            VKMedia(assetName: LooksMediaAssets.outfit(1), height: 260)
                        } else {
                            VStack(spacing: 12) {
                                Text("Добавьте фото образа")
                                    .font(.role(.cardTitle)).foregroundStyle(t.palette.textPrimary)
                                Text("Снимите новый кадр или выберите готовый из медиатеки")
                                    .font(.vkBody).foregroundStyle(t.palette.textSecondary)
                                    .multilineTextAlignment(.center)
                                VKButton(title: "Снять образ", icon: "camera") {
                                        Task {
                                            let ok = await perms.request(.camera)
                                            if ok { withAnimation { picked = true } }
                                            else { nav.toast("Без камеры выберите фото из медиатеки", once: "camera") }
                                        }
                                }
                                    .nativeAction("create.open-camera")
                                VKOutlineButton(title: "Выбрать из медиатеки", icon: "photo") {
                                        Task {
                                            let ok = await perms.request(.photos)
                                            if ok { withAnimation { picked = true } }
                                            else { nav.toast("Снимите образ на камеру", once: "photos") }
                                        }
                                }
                            }
                            .padding(.vertical, 24).padding(.horizontal, 24)
                            .frame(maxWidth: .infinity)
                        }
                    }
                    VKGroup {
                        TextField("Расскажите про образ", text: $text, axis: .vertical)
                            .font(.vkBody).lineLimit(3...8).padding(12)
                    }
                    VKGroup {
                        Button {
                            withAnimation { tagged.toggle() }
                        } label: {
                            rowLink(icon: "tag", title: "Отметить вещи",
                                    value: tagged ? "3 вещи" : "Не выбраны")
                        }
                        .buttonStyle(HighlightStyle())
                        .disabled(!picked)
                        RowSeparator(leading: 52)
                        Button {
                            audience = audience == "Все" ? "Подписчики" : "Все"
                        } label: {
                            rowLink(icon: "person.2", title: "Аудитория", value: audience)
                        }
                        .buttonStyle(HighlightStyle())
                    }
                    }

                    .padding(.bottom, 72)
                }
            }
            .background(t.palette.background)
        }
        .background(t.palette.background)
        .toolbar(.hidden, for: .navigationBar)
    }

    private func rowLink(icon: String, title: String, value: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon).font(.system(size: 17)).foregroundStyle(t.palette.accent).frame(width: 28)
            Text(title).font(.vkBody).foregroundStyle(t.palette.textPrimary)
            Spacer()
            Text(value).font(.vkBody).foregroundStyle(t.palette.textSecondary)
            Image(systemName: t.icon(.disclosure)).font(.role(.groupHeader))
                .foregroundStyle(t.palette.textTertiary)
        }
        .padding(.horizontal, 12).padding(.vertical, 13)
    }

    private func openPublishedOutfit() {
        guard let outfit = store.outfits.first else { return }
        dismiss()
        DispatchQueue.main.async { nav.push(LooksRoute.outfit(outfit)) }
    }
}

// MARK: - Друзья по контактам

struct MatesScreen: View {
    var captureState: String? = nil
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.visualLanguage) private var t
    @State private var query = ""
    @State private var hidden: Set<String> = []
    @State private var added: Set<String> = []

    /// Возможные знакомые: каждая строка сообщает своё, а не заполненный шаблон.
    private let maybe: [(String, String, [String], String)] = [
        ("Ника Кравец", "Из ваших контактов", ["Аня Котова", "Марк Львов", "Даша Ким"], "3 общих знакомых"),
        ("Гриша Ли", "Санкт-Петербург", ["Лена Гор"], "1 общий знакомый"),
    ]

    /// Мои знакомые: у кого-то город, у кого-то нет — как в живом списке.
    private let mine: [(String, String?)] = [
        ("Аня Котова", "провела 12 встреч по обмену вещами за год"),
        ("Марк Львов", nil),
        ("Даша Ким", "Иркутск"),
        ("Лена Гор", "меняется верхней одеждой"),
        ("Оля Пан", nil),
        ("Соня Рахимова", "Санкт-Петербург"),
    ]

    private var filtered: [(String, String?)] {
        query.isEmpty ? mine : mine.filter { $0.0.localizedCaseInsensitiveContains(query) }
    }

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                VKSearchField(placeholder: "Поиск", text: $query)
                    .padding(.horizontal, t.spacing.contentInset).padding(.top, 8).padding(.bottom, 12)

                // Единственная точка запроса контактов — как «Импорт телефонной
                // книги» у ВК на экране «Добавить друга».
                if captureState == "denied" {
                    NativeStatePanel(kind: .warning,
                                     title: "Нет доступа к контактам",
                                     detail: "Поиск по имени работает без адресной книги. Доступ можно включить в настройках iPhone.",
                                     actionTitle: "Открыть настройки",
                                     action: { openSettings() })
                        .padding(.horizontal, t.spacing.contentInset).padding(.bottom, 8)
                } else if perms.status(.contacts) != .granted {
                    VKOutlineButton(title: "Импорт телефонной книги", icon: "phone") {
                        Task {
                            let ok = await perms.request(.contacts)
                            if !ok { nav.toast("Ищите знакомых по имени в поиске", once: "contacts") }
                        }
                    }
                    .padding(.horizontal, t.spacing.contentInset).padding(.bottom, 6)
                } else {
                    VKRow(title: "Контакты подключены",
                          subtitle: "9 человек из книги уже публикуют образы",
                          icon: "checkmark.circle", chevron: false)
                }
                GroupGap()

                if captureState == "empty" {
                    NativeStatePanel(kind: .empty,
                                     title: "Знакомые пока не найдены",
                                     detail: "Ищите людей по имени или подключите телефонную книгу.",
                                     actionTitle: "Найти по имени",
                                     action: { query = "Аня" },
                                     placement: .page)
                        .padding(.horizontal, t.spacing.contentInset).padding(.top, 12)
                } else {
                VKSectionHeader(title: "Возможные знакомые")
                ForEach(maybe.filter { !hidden.contains($0.0) }, id: \.0) { p in
                    VKPersonRow(name: p.0, subtitle: p.1, mutual: p.2, mutualText: p.3) {
                        if added.contains(p.0) {
                            Text("Заявка отправлена").font(.role(.meta))
                                .foregroundStyle(t.palette.textSecondary)
                        } else {
                            VKRowAction(icon: "xmark.circle", label: "Скрыть",
                                        tint: t.palette.textTertiary) {
                                withAnimation { _ = hidden.insert(p.0) }
                            }
                            VKRowAction(icon: "person.crop.circle.badge.plus", label: "Добавить") {
                                withAnimation { _ = added.insert(p.0) }
                                nav.toast("Заявка отправлена")
                            }
                        }
                    }
                    RowSeparator()
                }
                GroupGap()

                VKSectionHeader(title: "Мои знакомые", count: "\(mine.count)")
                ForEach(filtered, id: \.0) { p in
                    VKPersonRow(name: p.0, subtitle: p.1) {
                        VKRowAction(icon: "person.crop.circle", label: "Открыть профиль \(p.0)") {
                            nav.push(LooksRoute.author(p.0))
                        }
                        .nativeAction("mates.open-contact-profile")
                        VKRowAction(icon: "phone", label: "Позвонить \(p.0)") {
                            nav.push(LooksRoute.call(p.0))
                        }
                        VKRowAction(icon: "bubble.left", label: "Написать \(p.0)") {
                            nav.push(LooksRoute.chat(dialog(for: p.0)))
                        }
                    }
                    RowSeparator()
                }
                }
                Color.clear.frame(height: 90)
            }
        }
        .background(t.palette.background)
        .vkNavigation("Знакомые")
    }

    private func dialog(for name: String) -> Dialog {
        store.dialogs.first { $0.name == name }
            ?? Dialog(name: name, last: "Напишите первым", time: "сейчас")
    }

    private func openSettings() {
        guard let url = URL(string: UIApplication.openSettingsURLString) else { return }
        Task { await UIApplication.shared.open(url) }
    }
}

// MARK: - Реклама (экран-объяснение перед ATT)

struct AdsScreen: View {
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.dismiss) private var dismiss
    @Environment(\.visualLanguage) private var t

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Spacer().frame(height: 8)
            Image(systemName: "sparkles").font(.system(size: 40)).foregroundStyle(t.palette.accent)
            Text("Образы бесплатны").font(.role(.largeTitle))
            Text("Приложение живёт за счёт рекламы марок и магазинов между образами")
                .font(.vkBody).foregroundStyle(t.palette.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
            Text("Если разрешить отслеживание, реклама будет по вашим интересам. Если нет — покажем обычную, всё остальное работает так же")
                .font(.vkBody).foregroundStyle(t.palette.textSecondary)
                .fixedSize(horizontal: false, vertical: true)
            Spacer()
            VKButton(title: "Реклама по интересам") {
                Task { await perms.request(.tracking); dismiss() }
            }
            Button("Продолжить без персонализации") { dismiss() }
                .nativeAction("ads.dismiss-ads-explanation")
                .font(.system(size: 16)).foregroundStyle(t.palette.accent)
                .frame(maxWidth: .infinity).padding(.vertical, 6)
            Spacer().frame(height: 8)
        }
        .padding(.horizontal, t.spacing.contentInset)
        .background(t.palette.surface)
        .vkNavigation("Реклама")
    }
}
