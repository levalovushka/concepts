import AVFoundation
import PhotosUI
import Speech
import SwiftUI
import UIKit

struct HouseChatsScreen: View {
    @Environment(HouseStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var query = ""

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                VKSearchField(placeholder: "Поиск по чатам дома", text: $query)
                    .padding(.horizontal, t.pad).padding(.bottom, 10)
                    .background(DvorStyle.card)
                if DvorShotMode.isScreen("chats", state: "loading") {
                    DvorPageState(kind: .loading, title: "Обновляем чаты", detail: "Проверяем новые сообщения дома.")
                } else if store.conversations.isEmpty {
                    DvorPageState(kind: .empty, title: "Разговоров пока нет", detail: "Общий чат дома появится после подтверждения адреса.")
                }
                if !DvorShotMode.isScreen("chats", state: "loading") {
                ForEach(filtered) { conversation in
                    Button { nav.push(DvorRoute.chat(conversation)) } label: {
                        HStack(spacing: 12) {
                            Avatar(name: conversation.title, size: 52)
                            VStack(alignment: .leading, spacing: 4) {
                                HStack {
                                    Text(conversation.title).font(.system(size: 16, weight: .semibold)).foregroundStyle(t.textPrimary)
                                    Spacer()
                                    Text(conversation.time).font(.vkMeta).foregroundStyle(t.textSecondary)
                                }
                                Text(conversation.subtitle).font(.vkMeta).foregroundStyle(t.textSecondary)
                                HStack {
                                    Text(conversation.lastMessage).font(.system(size: 14)).foregroundStyle(t.textSecondary).lineLimit(1)
                                    Spacer()
                                    if conversation.unread > 0 {
                                        Text("\(conversation.unread)").font(.system(size: 12, weight: .semibold)).foregroundStyle(.white)
                                            .frame(minWidth: 22, minHeight: 22).background(t.accent, in: Capsule())
                                    }
                                }
                            }
                        }
                        .padding(.horizontal, t.pad).padding(.vertical, 10).contentShape(Rectangle())
                        .background(DvorStyle.card)
                        .overlay(alignment: .bottom) {
                            t.separator.frame(height: 0.5).padding(.leading, 80)
                        }
                    }.buttonStyle(HighlightStyle())
                        .nativeAction("chats.open-chat")
                }
                }
            }
        }
        .rootHeader {
            VKTabHeader(
                title: "Чаты", avatar: store.currentResident.name,
                avatarAction: { nav.present(sheet: DvorRoute.profile) }
            ) { EmptyView() }
        }
        .background(DvorStyle.page)
        .toolbar(.hidden, for: .navigationBar)
    }

    private var filtered: [HouseConversation] {
        guard !query.isEmpty else { return store.conversations }
        return store.conversations.filter {
            $0.title.localizedCaseInsensitiveContains(query)
                || $0.lastMessage.localizedCaseInsensitiveContains(query)
        }
    }
}

struct HouseChatScreen: View {
    let conversation: HouseConversation
    @Environment(\.dismiss) private var dismiss
    @Environment(HouseStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var permissions
    @Environment(\.theme) private var t
    @State private var message = ""
    @State private var attachment: PhotosPickerItem?
    @State private var attachmentData: Data?
    @State private var voiceCapture = VoiceCapture()
    @State private var voicePhase: VoiceDraftPhase = VoiceDraftPhase.shotValue
    @State private var voiceTranscript = DvorShotMode.isScreen("voice", state: "ready")
        ? "Второй подъезд, свет уже включили"
        : ""
    @State private var voiceDuration: TimeInterval = 0
    @State private var voiceRecordingURL: URL?
    @State private var voicePlayback = VoicePlayback()

    var body: some View {
        VStack(spacing: 0) {
            VKChatHeader(title: conversation.title, subtitle: conversation.subtitle, onBack: { dismiss() })
            ScrollView {
                VStack(spacing: 7) {
                    Text("Сегодня").font(.vkMeta).foregroundStyle(t.textSecondary).padding(.vertical, 8)
                    if DvorShotMode.isScreen("chat", state: "empty") {
                        AppStatePanel(kind: .empty, title: "Начните разговор", detail: "Сообщения увидят только участники этого чата.")
                    } else {
                        ForEach(store.messages(in: conversation)) { chatMessage in
                            messageBubble(chatMessage)
                        }
                    }
                    if voicePhase != .idle { voiceDraft }
                }.padding(.horizontal, 12).padding(.bottom, 16)
            }
            if let attachmentData, let image = UIImage(data: attachmentData) {
                HStack(spacing: 10) {
                    Image(uiImage: image).resizable().scaledToFill()
                        .frame(width: 52, height: 52).clipped()
                        .clipShape(RoundedRectangle(cornerRadius: 9, style: .continuous))
                    Text("Фото готово к отправке")
                        .font(.system(size: 14, weight: .medium))
                    Spacer()
                    Button {
                        self.attachmentData = nil
                        attachment = nil
                    } label: { Image(systemName: "xmark.circle.fill").frame(width: 44, height: 44) }
                        .accessibilityLabel("Убрать фото")
                }
                .padding(.horizontal, 12).padding(.top, 8)
                .background(t.background)
            }
            HStack(spacing: 10) {
                PhotosPicker(selection: $attachment, matching: .images) {
                    Image(systemName: "plus.circle.fill").font(.system(size: 28))
                }
                .accessibilityLabel("Добавить фотографию")
                .disabled(voicePhase != .idle)
                .nativeAction("chat.attach-photo")
                TextField("Сообщение", text: $message).padding(.horizontal, 14).frame(height: 40).background(t.fill, in: Capsule())
                    .disabled(voicePhase != .idle)
                Button {
                    if hasSendableDraft { sendDraft() }
                    else if voicePhase == .recording { finishRecording() }
                    else { beginRecording() }
                } label: {
                    Image(systemName: composerActionIcon).font(.system(size: 25)).frame(width: 36, height: 40)
                }
                .accessibilityLabel(composerActionLabel)
                .disabled(voicePhase == .transcribing || voicePhase == .ready || voicePhase == .denied)
                .nativeAction("chat.send-message")
                .nativeAction("chat.record-voice")
            }
            .foregroundStyle(t.accent).padding(.horizontal, 12).padding(.vertical, 8)
            .overlay(alignment: .top) { t.separator.frame(height: 0.5) }
        }
        .background(DvorStyle.page)
        .toolbar(.hidden, for: .navigationBar)
        .task(id: attachment) {
            attachmentData = try? await attachment?.loadTransferable(type: Data.self)
        }
    }

    private var hasSendableDraft: Bool {
        !message.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || attachmentData != nil
    }

    private var composerActionIcon: String {
        if hasSendableDraft { return "arrow.up.circle.fill" }
        if voicePhase == .recording { return "stop.circle.fill" }
        return "mic"
    }

    private var composerActionLabel: String {
        if hasSendableDraft { return "Отправить сообщение" }
        if voicePhase == .recording { return "Закончить запись" }
        return "Записать голосовое"
    }

    private func sendDraft() {
        let value = message.trimmingCharacters(in: .whitespacesAndNewlines)
        if let attachmentData { store.sendPhoto(attachmentData, caption: value, in: conversation) }
        else { store.sendText(value, in: conversation) }
        message = ""
        attachment = nil
        attachmentData = nil
    }

    private func beginRecording() {
        Task {
            guard await permissions.request(.mic) else {
                voicePhase = .denied
                return
            }
            do {
                try voiceCapture.start()
                voicePhase = .recording
            } catch {
                voicePhase = .denied
                nav.toast("Не удалось начать запись")
            }
        }
    }

    private func finishRecording() {
        guard let recording = voiceCapture.stop() else {
            voicePhase = .denied
            return
        }
        voiceDuration = recording.duration
        voiceRecordingURL = recording.url
        voicePhase = .transcribing
        Task {
            if await permissions.request(.speech) {
                voiceTranscript = (try? await voiceCapture.transcribe(recording.url)) ?? ""
            }
            voicePhase = .ready
        }
    }

    @ViewBuilder private func messageBubble(_ chatMessage: HouseMessage) -> some View {
        if chatMessage.isMine { outgoing(chatMessage) }
        else { incoming(chatMessage) }
    }

    private func incoming(_ chatMessage: HouseMessage) -> some View {
        HStack(alignment: .bottom, spacing: 7) {
            Avatar(name: chatMessage.author.name, size: 28)
            VStack(alignment: .leading, spacing: 3) {
                Text(chatMessage.author.name).font(.system(size: 12, weight: .semibold)).foregroundStyle(t.accent)
                messageContent(chatMessage)
                Text(chatMessage.time).font(.vkBubbleTime).foregroundStyle(t.textSecondary).frame(maxWidth: .infinity, alignment: .trailing)
            }
            .padding(.horizontal, 11).padding(.vertical, 7).background(DvorStyle.card, in: RoundedRectangle(cornerRadius: 16))
            Spacer(minLength: 48)
        }
    }

    private func outgoing(_ chatMessage: HouseMessage) -> some View {
        HStack {
            Spacer(minLength: 48)
            VStack(alignment: .leading, spacing: 3) {
                messageContent(chatMessage)
                HStack(spacing: 3) {
                    Spacer(minLength: 0)
                    Text(chatMessage.time).font(.vkBubbleTime)
                    Image(systemName: deliveryIcon(chatMessage.delivery))
                        .font(.system(size: 9, weight: .semibold))
                }
                .foregroundStyle(chatMessage.delivery == .failed ? t.danger : DvorStyle.secondary)
            }
            .padding(.horizontal, 11).padding(.vertical, 7)
            .background(DvorStyle.quietInside, in: RoundedRectangle(cornerRadius: 16))
        }
    }

    private func deliveryIcon(_ delivery: HouseMessageDelivery) -> String {
        switch delivery {
        case .pending: "clock"
        case .sent: "checkmark"
        case .read: "checkmark.circle.fill"
        case .failed: "exclamationmark.circle.fill"
        }
    }

    @ViewBuilder private func messageContent(_ chatMessage: HouseMessage) -> some View {
        switch chatMessage.kind {
        case .text:
            Text(chatMessage.text).font(.system(size: 15)).foregroundStyle(DvorStyle.ink)
        case .photo(let data):
            VStack(alignment: .leading, spacing: 6) {
                if let image = UIImage(data: data) {
                    Image(uiImage: image).resizable().scaledToFill()
                        .frame(width: 190, height: 150).clipped()
                        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                }
                if !chatMessage.text.isEmpty { Text(chatMessage.text).font(.system(size: 15)) }
            }
        case .voice(let data, let duration, let transcript):
            VStack(alignment: .leading, spacing: 6) {
                Button {
                    voicePlayback.toggle(data: data, messageID: chatMessage.id)
                } label: {
                    Label(voiceDurationText(duration), systemImage: voicePlayback.playingMessageID == chatMessage.id ? "pause.fill" : "play.fill")
                        .font(.system(size: 15, weight: .semibold)).foregroundStyle(t.accent)
                }
                .accessibilityLabel(voicePlayback.playingMessageID == chatMessage.id ? "Пауза" : "Воспроизвести голосовое")
                if let transcript, !transcript.isEmpty {
                    Text(transcript).font(.system(size: 14)).foregroundStyle(DvorStyle.ink)
                }
            }
        }
    }

    private var voiceDraft: some View {
        VStack(alignment: .leading, spacing: 10) {
            switch voicePhase {
            case .recording:
                AppStatePanel(kind: .loading, title: "Записываем голос", detail: "Нажмите стоп, чтобы перейти к расшифровке.")
            case .transcribing:
                AppStatePanel(kind: .loading, title: "Расшифровываем запись", detail: "Аудио уже сохранено и не потеряется.")
            case .ready:
                Text("Голосовое готово · \(voiceDurationText(voiceDuration))")
                    .font(.system(size: 15, weight: .semibold))
                TextField("Расшифровка недоступна", text: $voiceTranscript, axis: .vertical)
                    .padding(10).background(t.fill, in: RoundedRectangle(cornerRadius: 10))
                HStack {
                    Button("Отменить") { cancelVoice() }.frame(minHeight: 44)
                        .nativeAction("voice.cancel-voice")
                    Spacer()
                    Button("Отправить") {
                        guard let voiceRecordingURL, let data = try? Data(contentsOf: voiceRecordingURL) else {
                            voicePhase = .denied
                            return
                        }
                        store.sendVoice(data: data, duration: voiceDuration, transcript: voiceTranscript.nilIfEmpty, in: conversation)
                        cancelVoice()
                    }.fontWeight(.semibold).frame(minHeight: 44)
                        .nativeAction("voice.send-voice")
                }
            case .denied:
                AppStatePanel(kind: .error, title: "Микрофон недоступен", detail: "Можно отправить обычное текстовое сообщение.")
                Button("Закрыть") { cancelVoice() }.frame(minHeight: 44)
            case .idle:
                EmptyView()
            }
        }
        .padding(12).background(t.background, in: RoundedRectangle(cornerRadius: 12))
    }

    private func cancelVoice() {
        voiceCapture.cancel()
        if let voiceRecordingURL { try? FileManager.default.removeItem(at: voiceRecordingURL) }
        voiceRecordingURL = nil
        voicePhase = .idle
        voiceTranscript = ""
        voiceDuration = 0
    }

    private func voiceDurationText(_ duration: TimeInterval) -> String {
        let seconds = max(1, Int(duration.rounded()))
        return String(format: "%d:%02d", seconds / 60, seconds % 60)
    }
}

@MainActor
@Observable
private final class VoicePlayback: NSObject, AVAudioPlayerDelegate {
    private var player: AVAudioPlayer?
    var playingMessageID: UUID?

    func toggle(data: Data, messageID: UUID) {
        if playingMessageID == messageID, player?.isPlaying == true {
            player?.pause()
            playingMessageID = nil
            return
        }
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playback, mode: .spokenAudio)
            try session.setActive(true)
            player = try AVAudioPlayer(data: data)
            player?.delegate = self
            player?.play()
            playingMessageID = messageID
        } catch {
            playingMessageID = nil
        }
    }

    nonisolated func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        Task { @MainActor in self.playingMessageID = nil }
    }
}

private enum VoiceDraftPhase: Equatable {
    case idle, recording, transcribing, ready, denied

    static var shotValue: VoiceDraftPhase {
        guard DvorShotMode.screen == "voice" else { return .idle }
        return switch DvorShotMode.state {
        case "recording": .recording
        case "transcribing": .transcribing
        case "ready": .ready
        default: .denied
        }
    }
}

@MainActor
private final class VoiceCapture {
    struct Recording { let url: URL; let duration: TimeInterval }
    private var recorder: AVAudioRecorder?
    private var startedAt: Date?
    private var recognitionTask: SFSpeechRecognitionTask?

    func start() throws {
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.record, mode: .spokenAudio)
        try session.setActive(true)
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("dvor-voice-\(UUID().uuidString).m4a")
        recorder = try AVAudioRecorder(
            url: url,
            settings: [
                AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
                AVSampleRateKey: 16_000,
                AVNumberOfChannelsKey: 1,
                AVEncoderAudioQualityKey: AVAudioQuality.medium.rawValue,
            ]
        )
        guard recorder?.record() == true else { throw VoiceCaptureError.cannotRecord }
        startedAt = Date()
    }

    func stop() -> Recording? {
        guard let recorder else { return nil }
        let recordedTime = recorder.currentTime
        let recordedURL = recorder.url
        recorder.stop()
        let duration = max(recordedTime, Date().timeIntervalSince(startedAt ?? Date()))
        self.recorder = nil
        startedAt = nil
        try? AVAudioSession.sharedInstance().setActive(false)
        return Recording(url: recordedURL, duration: duration)
    }

    func cancel() {
        recorder?.stop()
        if let url = recorder?.url { try? FileManager.default.removeItem(at: url) }
        recorder = nil
        startedAt = nil
        recognitionTask?.cancel()
        recognitionTask = nil
        try? AVAudioSession.sharedInstance().setActive(false)
    }

    func transcribe(_ url: URL) async throws -> String {
        guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "ru-RU")), recognizer.isAvailable else {
            throw VoiceCaptureError.recognizerUnavailable
        }
        let request = SFSpeechURLRecognitionRequest(url: url)
        request.requiresOnDeviceRecognition = recognizer.supportsOnDeviceRecognition
        return try await withCheckedThrowingContinuation { continuation in
            var completed = false
            let timeout = DispatchWorkItem {
                guard !completed else { return }
                completed = true
                self.recognitionTask?.cancel()
                continuation.resume(throwing: VoiceCaptureError.timedOut)
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 15, execute: timeout)
            recognitionTask = recognizer.recognitionTask(with: request) { result, error in
                guard !completed else { return }
                if let error {
                    completed = true
                    timeout.cancel()
                    continuation.resume(throwing: error)
                } else if let result, result.isFinal {
                    completed = true
                    timeout.cancel()
                    continuation.resume(returning: result.bestTranscription.formattedString)
                }
            }
        }
    }
}

private enum VoiceCaptureError: Error { case cannotRecord, recognizerUnavailable, timedOut }

private extension String {
    var nilIfEmpty: String? {
        let value = trimmingCharacters(in: .whitespacesAndNewlines)
        return value.isEmpty ? nil : value
    }
}

struct YardScreen: View {
    @Environment(HouseStore.self) private var store
    @Environment(Nav.self) private var nav

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 9) {
                DvorSectionTitle(title: "Сейчас во дворе")
                DvorCard {
                    VStack(spacing: 0) {
                        if let incident = store.matters.first(where: { $0.kind == .incident && $0.status != .resolved }) {
                            Button { nav.push(DvorRoute.matter(incident)) } label: {
                                DvorRow(
                                    title: incident.title,
                                    subtitle: "\(incident.status.rawValue) · электрик до завтра",
                                    icon: "exclamationmark.circle",
                                    value: "№418"
                                )
                            }
                            .buttonStyle(.plain)
                            .nativeAction("yard.open-incident")
                        }
                        Button { nav.push(DvorRoute.events) } label: {
                            DvorRow(
                                title: "Соседский завтрак",
                                subtitle: "Воскресенье, 11:00 · детская площадка",
                                icon: "calendar"
                            )
                        }
                        .buttonStyle(.plain)
                        .nativeAction("yard.open-yard-event")
                    }
                }

                DvorSectionTitle(title: "Сервисы двора")
                DvorCard {
                    VStack(spacing: 0) {
                        serviceRow(title: "Гостевая сеть", subtitle: "Dvor-Guest, QR на лавочке", icon: "wifi", nativeActionID: "yard.open-guest") { nav.push(DvorRoute.guest) }
                        serviceRow(title: "Счётчики", subtitle: "Вода и электричество", icon: "gauge.with.dots.needle.bottom.50percent", value: "до 25 августа", warning: true, nativeActionID: "yard.open-meters") { nav.push(DvorRoute.meters) }
                        serviceRow(title: "Собрание жильцов", subtitle: "30 августа в 19:00", icon: "calendar", nativeActionID: "yard.open-events") { nav.push(DvorRoute.events) }
                        serviceRow(title: "Вывоз мусора", subtitle: "По чётным дням", icon: "trash", chevron: false) { }
                    }
                }
            }
            .padding(.bottom, 18)
        }
        // Шапка живёт над скроллом: пока она ехала внутри, под статус-баром
        // оставалась серая подложка страницы.
        .rootHeader {
            VKTabHeader(
                title: "Двор", avatar: store.currentResident.name, dropdown: true,
                avatarAction: { nav.present(sheet: DvorRoute.profile) }
            ) {
                Button { nav.present(sheet: DvorRoute.report) } label: { Image(systemName: "plus") }
                    .accessibilityLabel("Сообщить о проблеме")
            }
        }
        .background(DvorStyle.page).toolbar(.hidden, for: .navigationBar)
    }

    @ViewBuilder private func serviceRow(title: String, subtitle: String, icon: String, value: String? = nil, warning: Bool = false, chevron: Bool = true, nativeActionID: String? = nil, action: @escaping () -> Void) -> some View {
        if chevron {
            Button(action: action) {
                DvorRow(title: title, subtitle: subtitle, icon: icon, value: value, valueIsWarning: warning, chevron: true)
            }.buttonStyle(.plain)
                .nativeAction(nativeActionID ?? "")
        } else {
            DvorRow(title: title, subtitle: subtitle, icon: icon, value: value, valueIsWarning: warning, chevron: false)
        }
    }
}

struct HouseMenuScreen: View {
    @Environment(HouseStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Session.self) private var session

    // Сетка плиток, как в «Меню» ВК: 4 в ряд, скруглённый квадрат 64 радиус 18,
    // яркая градиентная заливка, белый глиф. «Настройки» — такая же плитка,
    // а не шестерёнка в шапке: дверь в настройки одна.
    var body: some View {
        ScrollView {
            LazyVStack(spacing: 9) {
                Button { nav.present(sheet: DvorRoute.profile) } label: {
                    DvorCard {
                        VStack(spacing: 12) {
                            HStack(spacing: 12) {
                                Avatar(name: store.currentResident.name, size: 52)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(store.currentResident.name).font(.system(size: 17, weight: .semibold)).foregroundStyle(DvorStyle.ink)
                                    Text("\(store.currentResident.apartment) · \(session.canWriteToHouse ? "адрес подтверждён" : "адрес на проверке")").font(.system(size: 14)).foregroundStyle(DvorStyle.secondary)
                                }
                                Spacer()
                                Image(systemName: "chevron.right").font(.system(size: 13, weight: .semibold)).foregroundStyle(DvorStyle.muted)
                            }
                            HStack(spacing: 18) {
                                DvorStat(value: "\(store.neighbourCount)", label: "соседей")
                                DvorStat(value: "\(store.openMatterCount)", label: "дела открыты")
                            }
                        }.padding(12)
                    }
                }.buttonStyle(.plain)

                // Плитки перечислены явно, а не циклом по таблице: у каждой свой
                // идентификатор действия, и ворота действий читают его буквально.
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 0), count: 4),
                          spacing: 16) {
                    VKServiceTile(title: "Соседи", icon: "person.2.fill",
                                  colors: ["42B883", "1E9E63"]) { nav.push(DvorRoute.neighbours) }
                        .nativeAction("menu.open-neighbors")
                    VKServiceTile(title: "Счётчики", icon: "gauge.with.dots.needle.bottom.50percent",
                                  colors: ["5B7CFA", "3D5AFE"]) { nav.push(DvorRoute.meters) }
                    VKServiceTile(title: "События", icon: "calendar",
                                  colors: ["FF8A65", "F4511E"]) { nav.push(DvorRoute.events) }
                    VKServiceTile(title: "Доступы", icon: "key.fill",
                                  colors: ["FFB300", "F57C00"]) { nav.push(DvorRoute.passwords) }
                        .nativeAction("menu.open-access")
                    VKServiceTile(title: "Хроника", icon: "photo.on.rectangle.angled",
                                  colors: ["A78BFA", "7C4DFF"]) { nav.push(DvorRoute.chronicle) }
                    VKServiceTile(title: "Настройки", icon: "gearshape.fill",
                                  colors: ["A9B0BA", "838B95"]) { nav.push(DvorRoute.settings) }
                        .nativeAction("menu.open-settings")
                }
                .padding(.horizontal, 10)
                .padding(.top, 14).padding(.bottom, 18)
                .background(DvorStyle.card)

                // Хвост экрана: ближайшие дела дома. Без него меню кончается
                // на 40 % высоты и читается как макет.
                if !store.events.isEmpty {
                    VStack(alignment: .leading, spacing: 0) {
                        DvorSectionTitle(title: "Дела дома")
                        DvorCard {
                            VStack(spacing: 0) {
                                ForEach(Array(store.events.prefix(4).enumerated()), id: \.element.id) { index, event in
                                    Button { nav.push(DvorRoute.events) } label: {
                                        DvorRow(title: event.title,
                                                subtitle: event.detail,
                                                icon: "calendar")
                                    }
                                    .buttonStyle(.plain)
                                    if index < min(store.events.count, 4) - 1 { RowSeparator(leading: 60) }
                                }
                            }
                        }
                    }
                }
            }
            .padding(.bottom, 18)
        }
        .rootHeader {
            VKTabHeader(
                title: "Меню", avatar: store.currentResident.name,
                avatarAction: { nav.present(sheet: DvorRoute.profile) }
            ) { EmptyView() }
        }
        .background(DvorStyle.page).toolbar(.hidden, for: .navigationBar)
    }

    private func menuRow(_ title: String, _ subtitle: String, icon: String, nativeActionID: String? = nil, action: @escaping () -> Void) -> some View {
        Button(action: action) { DvorRow(title: title, subtitle: subtitle, icon: icon) }.buttonStyle(.plain)
            .nativeAction(nativeActionID ?? "")
    }
}
