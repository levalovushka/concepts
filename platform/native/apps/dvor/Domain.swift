import SwiftUI

enum MatterKind: String, CaseIterable, Hashable, Codable {
    case post = "Публикация"
    case incident = "Проблема"
    case announcement = "Объявление"
    case question = "Вопрос соседям"
    case event = "Событие"
    case poll = "Опрос"

    var systemImage: String {
        switch self {
        case .post: "text.bubble"
        case .incident: "exclamationmark.triangle"
        case .announcement: "megaphone"
        case .question: "bubble.left.and.bubble.right"
        case .event: "calendar"
        case .poll: "chart.bar"
        }
    }
}

enum MatterStatus: String, Hashable, Codable {
    case open = "Открыто"
    case inProgress = "В работе"
    case resolved = "Решено"
}

struct Resident: Identifiable, Hashable, Codable {
    let id: UUID
    let name: String
    let apartment: String
    let role: String?

    init(id: UUID = UUID(), name: String, apartment: String, role: String?) {
        self.id = id
        self.name = name
        self.apartment = apartment
        self.role = role
    }
}

struct HouseMatter: Identifiable, Hashable, Codable {
    let id: UUID
    let kind: MatterKind
    var status: MatterStatus
    let title: String
    let body: String
    let place: String
    let author: Resident
    let published: String
    var followers: Int
    var replies: [MatterReply]
    var mediaAsset: String? = nil
    var mediaData: Data? = nil
    var mediaItems: [Data] = []
    var likes: Int = 0
    var shares: Int = 0
    var pollOptions: [String] = []
    var pollCounts: [String: Int] = [:]
    var eventDetails: HouseEvent? = nil
}

struct MatterReply: Identifiable, Hashable, Codable {
    let id: UUID
    let author: Resident
    let text: String
    let time: String

    init(id: UUID = UUID(), author: Resident, text: String, time: String) {
        self.id = id
        self.author = author
        self.text = text
        self.time = time
    }
}

struct HouseConversation: Identifiable, Hashable, Codable {
    let id: UUID
    let title: String
    let subtitle: String
    var lastMessage: String
    var time: String
    var unread: Int

    init(id: UUID = UUID(), title: String, subtitle: String, lastMessage: String, time: String, unread: Int) {
        self.id = id
        self.title = title
        self.subtitle = subtitle
        self.lastMessage = lastMessage
        self.time = time
        self.unread = unread
    }
}

enum HouseMessageKind: Hashable, Codable {
    case text
    case photo(Data)
    case voice(data: Data, duration: TimeInterval, transcript: String?)
}

enum HouseMessageDelivery: String, Hashable, Codable {
    case pending, sent, failed, read
}

struct HouseMessage: Identifiable, Hashable, Codable {
    let id: UUID
    let author: Resident
    let kind: HouseMessageKind
    let text: String
    let time: String
    let isMine: Bool
    var delivery: HouseMessageDelivery

    init(id: UUID = UUID(), author: Resident, kind: HouseMessageKind, text: String, time: String,
         isMine: Bool, delivery: HouseMessageDelivery = .read) {
        self.id = id
        self.author = author
        self.kind = kind
        self.text = text
        self.time = time
        self.isMine = isMine
        self.delivery = delivery
    }
}

struct HouseEvent: Identifiable, Hashable, Codable {
    let id: UUID
    let title: String
    let startsAt: Date
    let duration: TimeInterval
    let location: String

    init(id: UUID = UUID(), title: String, startsAt: Date, duration: TimeInterval, location: String) {
        self.id = id
        self.title = title
        self.startsAt = startsAt
        self.duration = duration
        self.location = location
    }

    var day: String {
        startsAt.formatted(.dateTime.day().month(.abbreviated).locale(Locale(identifier: "ru_RU")))
    }

    var detail: String {
        "\(startsAt.formatted(.dateTime.hour().minute())) · \(location)"
    }
}

@MainActor
@Observable
final class HouseStore {
    private struct Snapshot: Codable {
        let matters: [HouseMatter]
        let conversations: [HouseConversation]
        let events: [HouseEvent]
        let messages: [UUID: [HouseMessage]]
        let following: Set<UUID>
        let liked: Set<UUID>
        let saved: Set<UUID>
        let hidden: Set<UUID>
        let pollVotes: [UUID: String]
        let attending: Set<UUID>
    }

    static let expectedResidenceSSID = "Myasnitskaya-24"
    let houseName = "Дом на Мясницкой"
    let address = "Мясницкая, 24/7"
    let currentResident = Resident(name: "Влад Шукуров", apartment: "кв. 48", role: nil)
    var matters: [HouseMatter]
    var conversations: [HouseConversation]
    var events: [HouseEvent]
    var messages: [UUID: [HouseMessage]]
    /// Реестр дома. Одно место на всё приложение: меню, настройки и экран
    /// соседей раньше называли разные числа — 18 в двух местах и три строки
    /// в списке.
    let neighbours: [Resident] = [
        Resident(name: "Анна Котова", apartment: "кв. 12", role: "Старшая по дому"),
        Resident(name: "Михаил Орлов", apartment: "кв. 31", role: nil),
        Resident(name: "Елена Соколова", apartment: "кв. 57", role: "Отвечает за клумбы"),
        Resident(name: "Пётр Гаврилов", apartment: "кв. 4", role: nil),
        Resident(name: "Ирина Лаптева", apartment: "кв. 9", role: nil),
        Resident(name: "Сергей Бабин", apartment: "кв. 14", role: "Собирает на домофон"),
        Resident(name: "Юлия Мороз", apartment: "кв. 17", role: nil),
        Resident(name: "Тимур Ахметов", apartment: "кв. 22", role: nil),
        Resident(name: "Ольга Пантелеева", apartment: "кв. 25", role: nil),
        Resident(name: "Денис Ковалёв", apartment: "кв. 28", role: nil),
        Resident(name: "Марина Швец", apartment: "кв. 33", role: "Держит чат подъезда"),
        Resident(name: "Артём Носов", apartment: "кв. 36", role: nil),
        Resident(name: "Галина Юрьева", apartment: "кв. 41", role: nil),
        Resident(name: "Роман Тихонов", apartment: "кв. 45", role: nil),
        Resident(name: "Ксения Дан", apartment: "кв. 52", role: nil),
        Resident(name: "Виктор Ильин", apartment: "кв. 55", role: nil),
        Resident(name: "Лариса Гей", apartment: "кв. 61", role: nil),
        Resident(name: "Никита Фомин", apartment: "кв. 64", role: nil),
    ]

    var neighbourCount: Int { neighbours.count }
    /// «Дела» — то, что ещё не решено: числа в меню и в ленте обязаны сойтись.
    var openMatterCount: Int { matters.filter { $0.status != .resolved }.count }
    var isResidenceVerified = true
    var following = Set<UUID>()
    var liked = Set<UUID>()
    var saved = Set<UUID>()
    var hidden = Set<UUID>()
    var pollVotes: [UUID: String] = [:]
    var attending = Set<UUID>()
    var coldWater = UserDefaults.standard.string(forKey: "dvor.meters.cold") ?? "128"
    var hotWater = UserDefaults.standard.string(forKey: "dvor.meters.hot") ?? "84"
    var electricity = UserDefaults.standard.string(forKey: "dvor.meters.electricity") ?? "3921"

    init() {
        let steward = Resident(name: "Анна Котова", apartment: "кв. 12", role: "Старшая по дому")
        let neighbour = Resident(name: "Михаил Орлов", apartment: "кв. 31", role: nil)
        let gardener = Resident(name: "Елена Соколова", apartment: "кв. 57", role: nil)
        matters = [
            HouseMatter(
                id: UUID(), kind: .post, status: .open,
                title: "Спасибо за субботник!",
                body: "Покрасили лавочку и собрали мусор у второго корпуса. Цветы у подъезда тоже пересадили — получилось уютно.",
                place: "Двор", author: gardener, published: "сегодня, 10:18",
                followers: 0,
                replies: [
                    MatterReply(author: steward, text: "Спасибо всем, кто помог!", time: "10:24"),
                    MatterReply(author: neighbour, text: "Во дворе стало намного уютнее.", time: "10:31")
                ],
                mediaAsset: "CourtyardCleanup", likes: 34, shares: 2
            ),
            HouseMatter(
                id: UUID(), kind: .announcement, status: .open,
                title: "Отключение горячей воды 26 августа",
                body: "Работы пройдут с 10:00 до 16:00. Пожалуйста, закройте краны перед уходом.",
                place: "Весь дом", author: steward, published: "сегодня, 09:05", followers: 43, replies: [], likes: 8
            ),
            HouseMatter(
                id: UUID(), kind: .question, status: .open,
                title: "У кого есть стремянка на выходные?",
                body: "Нужно повесить карниз в субботу. Заберу и верну в тот же день.",
                place: "3 подъезд", author: neighbour, published: "сегодня, 08:51", followers: 4,
                replies: [MatterReply(author: gardener, text: "Есть складная, напишу в личку.", time: "09:02")], likes: 3
            ),
            HouseMatter(
                id: UUID(), kind: .poll, status: .open,
                title: "Во сколько закрывать калитку во двор?",
                body: "Выберем время, которое удобно большинству соседей.",
                place: "Весь дом", author: steward, published: "вчера, 20:10", followers: 0,
                replies: [], likes: 5, pollOptions: ["В 22:00", "В 23:00", "Не закрывать"],
                pollCounts: ["В 22:00": 67, "В 23:00": 40, "Не закрывать": 21]
            ),
            HouseMatter(
                id: UUID(), kind: .incident, status: .inProgress,
                title: "Не горит свет у второго подъезда",
                body: "После девяти вечера у входа совсем темно. Заявка уже передана диспетчеру, ждём электрика.",
                place: "2 подъезд · вход со двора", author: neighbour, published: "сегодня, 08:42",
                followers: 18,
                replies: [MatterReply(author: steward, text: "Заявка №418 принята. Обещали исправить до завтра.", time: "09:16")],
                likes: 6
            ),
            HouseMatter(
                id: UUID(), kind: .event, status: .open,
                title: "Соседский завтрак во дворе",
                body: "В воскресенье в 11:00 встречаемся у детской площадки. Приносите чай и что-нибудь к общему столу.",
                place: "Детская площадка", author: gardener, published: "вчера, 19:40", followers: 12, replies: [], likes: 15, shares: 3,
                eventDetails: HouseEvent(
                    title: "Соседский завтрак во дворе",
                    startsAt: Calendar(identifier: .gregorian).date(from: DateComponents(year: 2026, month: 8, day: 30, hour: 11)) ?? .now,
                    duration: 2 * 3600,
                    location: "детская площадка"
                )
            ),
        ]
        let house = HouseConversation(title: "Наш дом", subtitle: "146 жильцов", lastMessage: "Анна: заявку по свету приняли", time: "09:16", unread: 2)
        let entrance = HouseConversation(title: "Второй подъезд", subtitle: "38 жильцов", lastMessage: "Михаил: вечером проверю лампу", time: "вчера", unread: 0)
        let help = HouseConversation(title: "Соседская помощь", subtitle: "72 жильца", lastMessage: "Есть стремянка до выходных", time: "ср", unread: 0)
        conversations = [house, entrance, help]
        messages = [
            house.id: [
                HouseMessage(author: steward, kind: .text, text: "Заявку по свету у второго подъезда приняли.", time: "09:16", isMine: false),
                HouseMessage(author: steward, kind: .text, text: "Электрик обещал прийти до завтра, номер заявки 418.", time: "09:17", isMine: false),
                HouseMessage(author: currentResident, kind: .text, text: "Спасибо! Вечером проверю, стало ли светлее.", time: "09:24", isMine: true),
            ],
            entrance.id: [],
            help.id: [],
        ]
        let calendar = Calendar(identifier: .gregorian)
        events = [
            HouseEvent(title: "Отключение горячей воды",
                       startsAt: calendar.date(from: DateComponents(year: 2026, month: 8, day: 26, hour: 10)) ?? .now,
                       duration: 6 * 3600, location: "весь дом"),
            HouseEvent(title: "Собрание жильцов",
                       startsAt: calendar.date(from: DateComponents(year: 2026, month: 8, day: 30, hour: 19)) ?? .now,
                       duration: 2 * 3600, location: "двор у детской площадки"),
        ]
        restoreSnapshotIfAvailable()
    }

    func toggleFollowing(_ matter: HouseMatter) {
        guard isResidenceVerified else { return }
        if following.contains(matter.id) { following.remove(matter.id) }
        else { following.insert(matter.id) }
        persistSnapshot()
    }

    func toggleLike(_ matter: HouseMatter) {
        guard isResidenceVerified else { return }
        guard let index = matters.firstIndex(where: { $0.id == matter.id }) else { return }
        if liked.contains(matter.id) {
            liked.remove(matter.id)
            matters[index].likes = max(0, matters[index].likes - 1)
        } else {
            liked.insert(matter.id)
            matters[index].likes += 1
        }
        persistSnapshot()
    }

    func toggleSaved(_ matter: HouseMatter) {
        guard isResidenceVerified else { return }
        if saved.contains(matter.id) { saved.remove(matter.id) }
        else { saved.insert(matter.id) }
        persistSnapshot()
    }

    func hide(_ matter: HouseMatter) {
        guard isResidenceVerified else { return }
        hidden.insert(matter.id)
        persistSnapshot()
    }

    func addReply(to matter: HouseMatter, text: String) {
        guard isResidenceVerified else { return }
        guard let index = matters.firstIndex(where: { $0.id == matter.id }) else { return }
        matters[index].replies.append(
            MatterReply(author: currentResident, text: text, time: "только что")
        )
        persistSnapshot()
    }

    func messages(in conversation: HouseConversation) -> [HouseMessage] {
        messages[conversation.id] ?? []
    }

    func sendText(_ text: String, in conversation: HouseConversation) {
        appendMessage(.text, text: text, in: conversation)
    }

    func sendPhoto(_ data: Data, caption: String, in conversation: HouseConversation) {
        appendMessage(.photo(data), text: caption, in: conversation)
    }

    func sendVoice(data: Data, duration: TimeInterval, transcript: String?, in conversation: HouseConversation) {
        appendMessage(.voice(data: data, duration: duration, transcript: transcript), text: transcript ?? "Голосовое сообщение", in: conversation)
    }

    func conversation(with resident: Resident) -> HouseConversation {
        if let existing = conversations.first(where: { $0.title == resident.name }) { return existing }
        let created = HouseConversation(
            title: resident.name,
            subtitle: resident.apartment,
            lastMessage: "Начните разговор",
            time: "",
            unread: 0
        )
        conversations.append(created)
        messages[created.id] = []
        persistSnapshot()
        return created
    }

    private func appendMessage(_ kind: HouseMessageKind, text: String, in conversation: HouseConversation) {
        guard isResidenceVerified else { return }
        let value = text.trimmingCharacters(in: .whitespacesAndNewlines)
        let message = HouseMessage(
            author: currentResident,
            kind: kind,
            text: value,
            time: "только что",
            isMine: true,
            delivery: .pending
        )
        messages[conversation.id, default: []].append(message)
        guard let index = conversations.firstIndex(where: { $0.id == conversation.id }) else { return }
        conversations[index].lastMessage = kind.previewText(fallback: value)
        conversations[index].time = "сейчас"
        conversations[index].unread = 0
        persistSnapshot()
        Task {
            try? await Task.sleep(for: .milliseconds(350))
            guard let messageIndex = messages[conversation.id]?.firstIndex(where: { $0.id == message.id }) else { return }
            messages[conversation.id]?[messageIndex].delivery = .sent
            persistSnapshot()
        }
    }

    func vote(in matter: HouseMatter, option: String) {
        guard isResidenceVerified else { return }
        guard let index = matters.firstIndex(where: { $0.id == matter.id }) else { return }
        if let previous = pollVotes[matter.id] {
            matters[index].pollCounts[previous] = max(0, (matters[index].pollCounts[previous] ?? 0) - 1)
        }
        pollVotes[matter.id] = option
        matters[index].pollCounts[option, default: 0] += 1
        persistSnapshot()
    }

    func clearVote(in matter: HouseMatter) {
        guard isResidenceVerified else { return }
        guard let previous = pollVotes[matter.id], let index = matters.firstIndex(where: { $0.id == matter.id }) else { return }
        matters[index].pollCounts[previous] = max(0, (matters[index].pollCounts[previous] ?? 0) - 1)
        pollVotes.removeValue(forKey: matter.id)
        persistSnapshot()
    }

    func toggleAttendance(_ matter: HouseMatter) {
        guard isResidenceVerified else { return }
        if attending.contains(matter.id) { attending.remove(matter.id) }
        else { attending.insert(matter.id) }
        persistSnapshot()
    }

    @discardableResult
    func createPost(kind: MatterKind, text: String, mediaData: Data? = nil, mediaItems: [Data] = [],
                    pollOptions: [String] = [], eventDetails: HouseEvent? = nil) -> HouseMatter? {
        guard isResidenceVerified else { return nil }
        let post = HouseMatter(
            id: UUID(), kind: kind, status: .open,
            title: "", body: text, place: "Весь дом", author: currentResident,
            published: "только что", followers: 0, replies: [], mediaData: mediaData, mediaItems: mediaItems,
            pollOptions: pollOptions, pollCounts: Dictionary(uniqueKeysWithValues: pollOptions.map { ($0, 0) }),
            eventDetails: eventDetails
        )
        matters.insert(post, at: 0)
        if let eventDetails { events.append(eventDetails) }
        persistSnapshot()
        return post
    }

    @discardableResult
    func createIncident(title: String, details: String, place: String, mediaData: Data? = nil) -> HouseMatter? {
        guard isResidenceVerified else { return nil }
        let matter = HouseMatter(
            id: UUID(), kind: .incident, status: .open, title: title,
            body: details, place: place, author: currentResident, published: "только что",
            followers: 1, replies: [], mediaData: mediaData
        )
        matters.insert(matter, at: 0)
        following.insert(matter.id)
        persistSnapshot()
        return matter
    }

    private func restoreSnapshotIfAvailable() {
        guard DvorShotMode.screen == nil,
              let data = try? Data(contentsOf: Self.snapshotURL()),
              let snapshot = try? JSONDecoder().decode(Snapshot.self, from: data) else { return }
        matters = snapshot.matters
        conversations = snapshot.conversations
        events = snapshot.events
        messages = snapshot.messages
        following = snapshot.following
        liked = snapshot.liked
        saved = snapshot.saved
        hidden = snapshot.hidden
        pollVotes = snapshot.pollVotes
        attending = snapshot.attending
    }

    private func persistSnapshot() {
        guard DvorShotMode.screen == nil else { return }
        let snapshot = Snapshot(
            matters: matters,
            conversations: conversations,
            events: events,
            messages: messages,
            following: following,
            liked: liked,
            saved: saved,
            hidden: hidden,
            pollVotes: pollVotes,
            attending: attending
        )
        guard let data = try? JSONEncoder().encode(snapshot) else { return }
        try? data.write(to: Self.snapshotURL(), options: .atomic)
    }

    private static func snapshotURL() -> URL {
        let support = (try? FileManager.default.url(
            for: .applicationSupportDirectory,
            in: .userDomainMask,
            appropriateFor: nil,
            create: true
        )) ?? FileManager.default.temporaryDirectory
        return support.appendingPathComponent("dvor-house-snapshot.json")
    }
}

private extension HouseMessageKind {
    func previewText(fallback: String) -> String {
        switch self {
        case .text: fallback
        case .photo: fallback.isEmpty ? "Вы: фото" : "Вы: фото · \(fallback)"
        case .voice: "Вы: голосовое"
        }
    }
}
