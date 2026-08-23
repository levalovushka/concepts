import PhotosUI
import SwiftUI
import UIKit

struct HouseHomeScreen: View {
    @Environment(HouseStore.self) private var store
    @Environment(Nav.self) private var nav

    var body: some View {
        VStack(spacing: 0) {
            DvorHomeHeader(
                address: store.address,
                resident: store.currentResident.name,
                openProfile: { nav.present(sheet: DvorRoute.profile) },
                switchHouse: { nav.present(sheet: DvorRoute.houseSwitcher) },
                openNotifications: { nav.push(DvorRoute.notifications) }
            )

            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: DvorStyle.sectionGap) {
                        DvorComposer(
                            resident: store.currentResident.name,
                            action: { nav.present(sheet: DvorRoute.createPost) }
                        )

                        if DvorShotMode.isScreen("home", state: "loading") {
                            DvorCard { ProgressView("Обновляем ленту дома…").frame(maxWidth: .infinity).padding(.vertical, 36) }
                        } else if visibleMatters.isEmpty {
                            DvorCard {
                                AppStatePanel(kind: .empty, title: "Публикаций пока нет", detail: "Станьте первым, кто поделится новостью или задаст вопрос соседям.")
                                    .padding(.horizontal, DvorStyle.contentInset)
                            }
                        } else {
                            ForEach(visibleMatters) { matter in
                                MatterCard(
                                    matter: matter,
                                    open: { nav.push(DvorRoute.matter(matter)) }
                                )
                                .id(matter.id)
                            }
                        }
                    }
                    .padding(.bottom, DvorStyle.space4)
                }
                .task {
                    let target: HouseMatter?
                    let anchor: UnitPoint
                    if DvorShotMode.isScreen("home", state: "end") {
                        target = store.matters.last
                        anchor = .bottom
                    } else if DvorShotMode.isScreen("home", state: "poll") || DvorShotMode.isScreen("home", state: "poll-voted") {
                        target = store.matters.first(where: { $0.kind == .poll })
                        anchor = .top
                    } else {
                        target = nil
                        anchor = .top
                    }
                    guard let target else { return }
                    try? await Task.sleep(nanoseconds: 200_000_000)
                    proxy.scrollTo(target.id, anchor: anchor)
                }
            }
        }
        .background(DvorStyle.page)
        .toolbar(.hidden, for: .navigationBar)
    }

    private var visibleMatters: [HouseMatter] {
        store.matters.filter { !store.hidden.contains($0.id) }
    }

}

struct DvorHomeHeader: View {
    let address: String
    let resident: String
    let openProfile: () -> Void
    let switchHouse: () -> Void
    let openNotifications: () -> Void
    @Environment(\.theme) private var t

    var body: some View {
        HStack(spacing: DvorStyle.space3) {
            Button(action: openProfile) { Avatar(name: resident, size: 32) }
                .buttonStyle(.plain).accessibilityLabel("Профиль")
            Button(action: switchHouse) {
                HStack(spacing: 5) {
                    Text(address).font(.system(size: 17, weight: .semibold)).lineLimit(1)
                    Image(systemName: "chevron.down").font(.system(size: 12, weight: .semibold))
                }
                .foregroundStyle(t.textPrimary).frame(maxWidth: .infinity, alignment: .leading)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain).accessibilityLabel("Выбрать дом. Сейчас \(address)")
            Button(action: openNotifications) {
                Image(systemName: "bell").font(.system(size: 20)).frame(width: DvorStyle.hitTarget, height: DvorStyle.hitTarget)
            }
            .accessibilityLabel("Уведомления дома")
            .nativeAction("home.open-notifications")
        }
        .padding(.horizontal, DvorStyle.contentInset).frame(height: 50).background(DvorStyle.card)
        .overlay(alignment: .bottom) { DvorStyle.line.frame(height: 0.5) }
    }
}

struct DvorComposer: View {
    let resident: String
    let action: () -> Void
    @Environment(\.theme) private var t

    var body: some View {
        Button(action: action) {
            HStack(spacing: DvorStyle.space2) {
                Avatar(name: resident, size: 38)
                Text("Что у вас нового?")
                    .font(.system(size: 15)).foregroundStyle(t.textSecondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                Text("Создать")
                    .font(.system(size: 14, weight: .semibold)).foregroundStyle(t.accent)
            }
            .padding(.horizontal, DvorStyle.contentInset).frame(height: 56).contentShape(Rectangle())
        }
        .buttonStyle(HighlightStyle())
        .background(DvorStyle.card)
        .accessibilityLabel("Создать публикацию")
        .nativeAction("home.create-post")
    }
}

struct MatterCard: View {
    let matter: HouseMatter
    let open: (() -> Void)?
    @Environment(HouseStore.self) private var store
    @Environment(Session.self) private var session
    @Environment(\.theme) private var t

    var body: some View {
        VStack(alignment: .leading, spacing: DvorStyle.space2) {
            postContent
                .contentShape(Rectangle())
                .onTapGesture { open?() }
                .nativeAction("home.open-post")

            HStack(spacing: DvorStyle.space2) {
                Button { store.toggleLike(matter) } label: {
                    MatterReaction(
                        icon: store.liked.contains(matter.id) ? "heart.fill" : "heart",
                        value: countText(currentMatter.likes),
                        selected: store.liked.contains(matter.id)
                    )
                }
                .accessibilityLabel(store.liked.contains(matter.id) ? "Убрать отметку Нравится" : "Нравится")
                .disabled(!session.canWriteToHouse)
                .nativeAction("home.like-post")
                if let open {
                    Button(action: open) {
                        MatterReaction(icon: "message", value: countText(matter.replies.count))
                    }
                    .accessibilityLabel("Открыть комментарии. \(matter.replies.count)")
                } else {
                    MatterReaction(icon: "message", value: countText(matter.replies.count))
                }
                ShareLink(item: "\(matter.title)\n\(matter.body)") {
                    MatterReaction(icon: "arrowshape.turn.up.right", value: "")
                }
                .accessibilityLabel("Поделиться публикацией")
                .nativeAction("home.share-post")
                Spacer()
                Label("\(84 + matter.likes)", systemImage: "eye")
                    .foregroundStyle(DvorStyle.secondary)
            }
            .font(.system(size: 14, weight: .medium))
            .buttonStyle(MatterReactionPressStyle())
            .frame(minHeight: DvorStyle.hitTarget)

            if let reply = matter.replies.first, let open {
                Button(action: open) {
                    HStack(alignment: .top, spacing: 8) {
                        Avatar(name: reply.author.name, size: 26)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(reply.author.name).font(.system(size: 13, weight: .semibold))
                            Text(reply.text).font(.system(size: 13)).foregroundStyle(DvorStyle.ink).lineLimit(2)
                            if matter.replies.count > 1 {
                                Text("Показать все \(matter.replies.count) комментария")
                                    .font(.system(size: 13, weight: .medium)).foregroundStyle(t.accent)
                            }
                        }
                        Spacer(minLength: 0)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading).contentShape(Rectangle())
                }
                .buttonStyle(.plain).accessibilityLabel("Открыть комментарии")
            }
        }.padding(.horizontal, DvorStyle.contentInset).padding(.vertical, DvorStyle.space3).background(DvorStyle.card)
    }

    private var currentMatter: HouseMatter {
        store.matters.first(where: { $0.id == matter.id }) ?? matter
    }

    private func countText(_ value: Int) -> String {
        value == 0 ? "" : "\(value)"
    }

    @ViewBuilder private var postContent: some View {
        VStack(alignment: .leading, spacing: DvorStyle.space2) {
            HStack(spacing: DvorStyle.space2) {
                Avatar(name: matter.author.name, size: 38)
                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 4) {
                        Text(matter.author.name).font(.system(size: 15, weight: .semibold))
                        if matter.author.role != nil {
                            Image(systemName: "checkmark.seal.fill").font(.system(size: 11)).foregroundStyle(t.accent)
                        }
                    }
                    Text("\(matter.published) · \(metaPlace)")
                        .font(.system(size: 13)).foregroundStyle(DvorStyle.muted)
                        .lineLimit(1).truncationMode(.tail)
                }
                Spacer(minLength: 8)
                Menu {
                    Button {
                        store.toggleSaved(matter)
                    } label: {
                        Label(store.saved.contains(matter.id) ? "Убрать из сохранённых" : "Сохранить", systemImage: "bookmark")
                    }
                    Button(role: .destructive) {
                        store.hide(matter)
                    } label: {
                        Label("Скрыть из ленты", systemImage: "eye.slash")
                    }
                } label: {
                    Image(systemName: "ellipsis").frame(width: 32, height: 36)
                }
                .foregroundStyle(DvorStyle.secondary).accessibilityLabel("Действия с публикацией")
                .disabled(!session.canWriteToHouse)
            }

            MatterPriorityLabel(matter: matter)

            if !matter.title.isEmpty {
                Text(matter.title).font(.system(size: 16, weight: .semibold)).foregroundStyle(DvorStyle.ink)
            }
            Text(matter.body).font(.system(size: 15)).foregroundStyle(DvorStyle.ink).lineSpacing(2).lineLimit(4)

            if let mediaAsset = matter.mediaAsset {
                Image(mediaAsset)
                    .resizable().scaledToFill()
                    .frame(maxWidth: .infinity).frame(height: 184)
                    .clipped()
                    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                    .accessibilityLabel("Фотография двора после субботника")
            } else if let mediaData = matter.mediaData, let image = UIImage(data: mediaData) {
                Image(uiImage: image)
                    .resizable().scaledToFill()
                    .frame(maxWidth: .infinity).frame(height: 184)
                    .clipped()
                    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                    .accessibilityLabel("Фотография в публикации")
            } else if !matter.mediaItems.isEmpty {
                LazyVGrid(columns: [GridItem(.flexible(), spacing: 4), GridItem(.flexible(), spacing: 4)], spacing: 4) {
                    ForEach(Array(matter.mediaItems.enumerated()), id: \.offset) { _, data in
                        if let image = UIImage(data: data) {
                            Image(uiImage: image).resizable().scaledToFill().frame(height: 132).clipped()
                        }
                    }
                }
                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                .accessibilityLabel("Фотографии в публикации: \(matter.mediaItems.count)")
            }

            if !matter.pollOptions.isEmpty {
                VStack(spacing: 8) {
                    ForEach(matter.pollOptions, id: \.self) { option in
                        Button {
                            store.vote(in: matter, option: option)
                        } label: {
                            ZStack(alignment: .leading) {
                                RoundedRectangle(cornerRadius: 10, style: .continuous).fill(t.fill)
                                if store.pollVotes[matter.id] != nil {
                                    GeometryReader { proxy in
                                        RoundedRectangle(cornerRadius: 10, style: .continuous)
                                            .fill(t.accentSoft)
                                            .frame(width: proxy.size.width * pollPercent(option))
                                    }
                                }
                                HStack {
                                    Text(option).font(.system(size: 14, weight: .medium))
                                    Spacer()
                                    if store.pollVotes[matter.id] != nil {
                                        Text("\(Int(pollPercent(option) * 100))%")
                                            .font(.system(size: 13, weight: .semibold)).foregroundStyle(t.accent)
                                    }
                                    if store.pollVotes[matter.id] == option {
                                        Image(systemName: "checkmark.circle.fill").foregroundStyle(t.accent)
                                    }
                                }
                                .padding(.horizontal, 12)
                            }
                            .frame(minHeight: DvorStyle.hitTarget)
                        }
                        .buttonStyle(.plain)
                        .disabled(!session.canWriteToHouse)
                        .accessibilityLabel("\(option)\(store.pollVotes[matter.id] == nil ? "" : ", \(Int(pollPercent(option) * 100)) процентов")")
                    }
                    if store.pollVotes[matter.id] != nil {
                        HStack(spacing: DvorStyle.space2) {
                            Text("\(pollTotal) голосов")
                                .font(.system(size: 13))
                                .foregroundStyle(DvorStyle.secondary)
                            Spacer()
                            Button("Изменить выбор") { store.clearVote(in: matter) }
                                .font(.system(size: 13, weight: .medium))
                                .frame(minHeight: DvorStyle.hitTarget)
                        }
                    }
                }
            }

            if matter.kind == .event {
                VStack(spacing: 0) {
                    eventRow(icon: "calendar", title: eventSummary)
                    DvorStyle.line.frame(height: 0.5)
                    HStack(spacing: DvorStyle.space2) {
                        HStack(spacing: -6) {
                            Avatar(name: "Анна Котова", size: 28)
                            Avatar(name: "Михаил Орлов", size: 28)
                            Avatar(name: "Елена Соколова", size: 28)
                        }
                        Text("18 соседей собираются")
                            .font(.system(size: 13)).foregroundStyle(DvorStyle.secondary)
                        Spacer(minLength: DvorStyle.space2)
                        Button(store.attending.contains(matter.id) ? "Вы пойдёте" : "Пойду") {
                            store.toggleAttendance(matter)
                        }
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(store.attending.contains(matter.id) ? DvorStyle.secondary : t.accent)
                        .frame(minWidth: 72, minHeight: DvorStyle.hitTarget)
                        .accessibilityLabel(store.attending.contains(matter.id) ? "Отменить участие" : "Пойти на событие")
                        .disabled(!session.canWriteToHouse)
                    }
                }
                .padding(.horizontal, DvorStyle.space3)
                .background(DvorStyle.quietInside, in: RoundedRectangle(cornerRadius: 10, style: .continuous))
            }

            if matter.kind == .incident && matter.status == .inProgress {
                HStack(spacing: DvorStyle.space2) {
                    Text("Вход со двора · заявка №418")
                        .font(.system(size: 13, weight: .semibold))
                        .lineLimit(1).truncationMode(.tail).layoutPriority(1)
                    Spacer(minLength: DvorStyle.space2)
                    Text("Электрик до завтра")
                        .font(.system(size: 13)).foregroundStyle(DvorStyle.secondary)
                        .lineLimit(1).truncationMode(.tail)
                }
                .padding(.top, 8)
                .overlay(alignment: .top) { DvorStyle.line.frame(height: 0.5) }
            }
        }
    }

    private var metaPlace: String {
        matter.kind == .incident ? "2 подъезд" : matter.place
    }

    private func pollPercent(_ option: String) -> Double {
        guard pollTotal > 0 else { return 0 }
        return Double(currentMatter.pollCounts[option] ?? 0) / Double(pollTotal)
    }

    private var pollTotal: Int { currentMatter.pollCounts.values.reduce(0, +) }

    private var eventSummary: String {
        guard let event = matter.eventDetails else { return "Время уточняется" }
        return "\(event.startsAt.formatted(.dateTime.weekday(.wide).hour().minute().locale(Locale(identifier: "ru_RU")))) · \(event.location)"
    }

    private func eventRow(icon: String, title: String) -> some View {
        HStack(spacing: DvorStyle.space2) {
            Image(systemName: icon).frame(width: 20).foregroundStyle(t.accent)
            Text(title).font(.system(size: 14, weight: .medium))
            Spacer(minLength: 0)
        }
        .frame(minHeight: DvorStyle.hitTarget)
    }
}

struct MatterReaction: View {
    let icon: String
    let value: String
    var selected = false
    @Environment(\.theme) private var t

    // Профиль vk-ios: действия поста — голые иконки с числами. Капсула вокруг
    // них была ошибкой и в «Образах» её уже убрали.
    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: icon).font(.system(size: 19))
            if !value.isEmpty { Text(value).font(.system(size: 15)) }
        }
        .foregroundStyle(selected ? Color(hex: "FF3347") : DvorStyle.secondary)
        .padding(.trailing, 8)
        .frame(minHeight: DvorStyle.hitTarget)
        .contentShape(Rectangle())
    }
}

struct MatterReactionPressStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .opacity(configuration.isPressed ? 0.68 : 1)
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

struct MatterPriorityLabel: View {
    let matter: HouseMatter
    @Environment(\.theme) private var t

    var body: some View {
        if let title {
            Text(title)
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(color)
                .padding(.horizontal, 8).frame(height: 24)
                .background(color.opacity(0.1), in: Capsule())
        }
    }

    private var title: String? {
        switch matter.kind {
        case .post: nil
        case .incident: matter.status.rawValue
        case .announcement: "Объявление"
        case .question: "Вопрос"
        case .event: "Событие"
        case .poll: "Опрос"
        }
    }

    private var color: Color {
        if matter.status == .resolved { return t.positive }
        if matter.kind == .post { return .clear }
        return matter.kind == .question ? DvorStyle.warningText : t.accent
    }
}

struct HouseSwitcherScreen: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        VStack(spacing: 0) {
            DvorModalChrome(title: "Ваш дом", onCancel: { nav.dismiss() })

            DvorCard {
                HStack(spacing: 12) {
                    Image(systemName: "house.fill").foregroundStyle(t.accent).frame(width: 32, height: 32)
                    VStack(alignment: .leading, spacing: 3) {
                        Text("Мясницкая, 24/7").font(.system(size: 16, weight: .semibold))
                        Text("Подтверждённый адрес").font(.system(size: 13)).foregroundStyle(t.textSecondary)
                    }
                    Spacer()
                    Image(systemName: "checkmark").foregroundStyle(t.accent)
                }
                .padding(16)
            }
            .padding(.top, 12)
            Spacer()
        }
        .background(t.groupGap)
    }
}

struct CreateHousePostScreen: View {
    @Environment(HouseStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var text = ""
    @State private var kind: MatterKind = .post
    @State private var photo: PhotosPickerItem?
    @State private var photoData: Data?
    @State private var isPublishing = false
    @State private var publishError: String?
    @State private var pollOptionOne = ""
    @State private var pollOptionTwo = ""
    @State private var eventDate = Calendar.current.date(byAdding: .day, value: 7, to: .now) ?? .now
    @State private var eventLocation = "Двор"

    var body: some View {
        VStack(spacing: 0) {
            DvorModalChrome(
                title: "Новая публикация",
                onCancel: { nav.dismiss() },
                cancelActionID: "createpost.cancel-post",
                done: DvorChromeAction(
                    title: isPublishing ? "Публикуем…" : "Опубликовать",
                    isDisabled: text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || isPublishing,
                    nativeActionID: "createpost.publish-post",
                    action: publish
                )
            )

            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    if DvorShotMode.isScreen("createpost", state: "error") {
                        AppStatePanel(kind: .error,
                            title: "Не удалось опубликовать",
                            detail: "Текст и вложение сохранены. Проверьте соединение и попробуйте ещё раз."
                        )
                    }
                    if let publishError {
                        AppStatePanel(kind: .warning, title: "Публикация не готова", detail: publishError)
                    }
                    HStack(spacing: 10) {
                        Avatar(name: store.currentResident.name, size: 40)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(store.currentResident.name).font(.system(size: 15, weight: .semibold))
                            Text("Увидят подтверждённые жильцы дома").font(.system(size: 13)).foregroundStyle(t.textSecondary)
                        }
                    }
                    TextEditor(text: $text)
                        .font(.system(size: 17))
                        .frame(height: 96)
                        .overlay(alignment: .topLeading) {
                            if text.isEmpty {
                                Text("Что у вас нового?").font(.system(size: 17)).foregroundStyle(t.textSecondary)
                                    .padding(.top, 8).allowsHitTesting(false)
                            }
                        }

                    Menu {
                        ForEach([MatterKind.post, .announcement, .question, .poll, .event], id: \.self) { option in
                            Button(composerTitle(option)) { kind = option }
                        }
                    } label: {
                        HStack(spacing: 6) {
                            Text("Формат").foregroundStyle(t.textPrimary)
                            Spacer()
                            Text(composerTitle(kind)).foregroundStyle(t.accent)
                            Image(systemName: "chevron.down")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundStyle(t.textSecondary)
                        }
                        .font(.system(size: 15, weight: .medium))
                        .frame(maxWidth: .infinity, minHeight: 44)
                        .contentShape(Rectangle())
                    }
                    .overlay(alignment: .bottom) { t.separator.frame(height: 0.5) }
                    .nativeAction("createpost.change-type")

                    if kind == .poll {
                        DvorFormField(title: "Первый вариант", placeholder: "Например, в 22:00", text: $pollOptionOne)
                        DvorFormField(title: "Второй вариант", placeholder: "Например, в 23:00", text: $pollOptionTwo)
                    }

                    if kind == .event {
                        DatePicker("Дата и время", selection: $eventDate, in: Date.now...)
                            .font(.system(size: 15, weight: .medium)).frame(minHeight: 44)
                        DvorFormField(title: "Место", placeholder: "Двор или подъезд", text: $eventLocation)
                    }

                    PhotosPicker(selection: $photo, matching: .images) {
                        Label(photo == nil ? "Добавить фотографию" : "Фотография добавлена", systemImage: photo == nil ? "photo" : "checkmark")
                            .font(.system(size: 15, weight: .medium)).frame(minHeight: 44)
                    }
                    .nativeAction("createpost.add-photo")
                    if let photoData, let image = UIImage(data: photoData) {
                        Image(uiImage: image).resizable().scaledToFill()
                            .frame(maxWidth: .infinity).frame(height: 160).clipped()
                            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                    }
                }
                .padding(16)
            }
        }
        .background(t.background)
        .task(id: photo) {
            photoData = try? await photo?.loadTransferable(type: Data.self)
        }
    }

    private func composerTitle(_ kind: MatterKind) -> String {
        switch kind {
        case .post: "Пост"
        case .announcement: "Объявление"
        case .question: "Вопрос"
        default: kind.rawValue
        }
    }

    private func publish() {
        let cleanText = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard cleanText.count >= 3 else { publishError = "Добавьте хотя бы несколько слов."; return }
        let pollOptions = [pollOptionOne, pollOptionTwo].map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
        if kind == .poll, pollOptions.contains(where: { $0.count < 2 }) {
            publishError = "Добавьте два понятных варианта ответа."
            return
        }
        if kind == .event, eventLocation.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            publishError = "Укажите место события."
            return
        }
        publishError = nil
        isPublishing = true
        Task {
            try? await Task.sleep(for: .milliseconds(450))
            let event = kind == .event
                ? HouseEvent(title: cleanText, startsAt: eventDate, duration: 2 * 3600,
                             location: eventLocation.trimmingCharacters(in: .whitespacesAndNewlines))
                : nil
            guard store.createPost(kind: kind, text: cleanText, mediaData: photoData,
                                   pollOptions: kind == .poll ? pollOptions : [], eventDetails: event) != nil else {
                publishError = "Адрес ещё проверяется. Публикации откроются после подтверждения."
                isPublishing = false
                return
            }
            isPublishing = false
            nav.dismiss()
        }
    }
}

struct HouseNotificationsScreen: View {
    @Environment(HouseStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var read = Set<String>()
    @AppStorage("dvor.notifications.read") private var readStorage = ""

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                if DvorShotMode.isScreen("notifications", state: "empty") {
                    AppStatePanel(kind: .empty, title: "Новых уведомлений нет", detail: "Ответы, изменения статусов и сроки появятся здесь.")
                        .padding(.horizontal, 16)
                } else {
                    notificationRow(
                        id: "matter-status", avatar: "Анна Котова",
                        title: "Заявку по свету приняли",
                        detail: "Электрик придёт до завтра · 12 минут назад"
                    ) {
                        if let incident = store.matters.first(where: { $0.kind == .incident }) {
                            nav.push(DvorRoute.matter(incident))
                        }
                    }
                    RowSeparator(leading: 68)
                    notificationRow(
                        id: "chat-message", avatar: "Михаил Орлов",
                        title: "Новое сообщение во втором подъезде",
                        detail: "«Вечером проверю лампу» · 34 минуты назад"
                    ) {
                        nav.push(DvorRoute.chat(store.conversations[1]))
                    }
                    RowSeparator(leading: 68)
                    notificationRow(
                        id: "meter-deadline", avatar: nil,
                        title: "Показания нужно передать до 25 августа",
                        detail: "Черновик уже сохранён на этом iPhone"
                    ) { nav.push(DvorRoute.meters) }
                }
            }
        }
        .background(DvorStyle.card)
        .vkNavigation("Уведомления") {
            if read.count < 3 && !DvorShotMode.isScreen("notifications", state: "empty") {
                Button("Прочитать всё") { read = ["matter-status", "chat-message", "meter-deadline"] }
                    .font(.system(size: 14, weight: .medium))
                    .nativeAction("notifications.mark-all-read")
            }
        }
        .task { read = Set(readStorage.split(separator: ",").map(String.init)) }
        .onChange(of: read) { _, value in readStorage = value.sorted().joined(separator: ",") }
    }

    private func notificationRow(
        id: String, avatar: String?, title: String, detail: String, action: @escaping () -> Void
    ) -> some View {
        Button {
            read.insert(id)
            action()
        } label: {
            HStack(alignment: .top, spacing: 12) {
                if let avatar {
                    Avatar(name: avatar, size: 40)
                } else {
                    Image(systemName: "gauge.with.dots.needle.bottom.50percent")
                        .font(.system(size: 20, weight: .medium)).foregroundStyle(t.accent)
                        .frame(width: 40, height: 40)
                }
                VStack(alignment: .leading, spacing: 4) {
                    HStack(alignment: .firstTextBaseline, spacing: 8) {
                        Text(title).font(.system(size: 15, weight: .semibold)).foregroundStyle(t.textPrimary)
                        Spacer(minLength: 4)
                        if !read.contains(id) { Circle().fill(t.accent).frame(width: 7, height: 7) }
                    }
                    Text(detail).font(.system(size: 13)).foregroundStyle(t.textSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            .padding(.horizontal, 16).padding(.vertical, 12).contentShape(Rectangle())
        }
        .buttonStyle(HighlightStyle())
        .nativeAction("notifications.open-source")
    }
}
