import SwiftUI
import UserNotifications

@MainActor
enum CirclesCapabilityFlow {
    static func notifications(using permissions: Permissions) async -> Bool {
        let granted = await permissions.request(.push)
        guard granted else { return false }
        _ = await permissions.request(.commnotif)
        _ = await permissions.request(.remotenotif)
        let content = UNMutableNotificationContent()
        content.title = "Круги"
        content.body = "В подписанной публикации появились изменения"
        content.sound = .default
        let request = UNNotificationRequest(
            identifier: "circles.followed-post",
            content: content,
            trigger: UNTimeIntervalNotificationTrigger(timeInterval: 60 * 60, repeats: false)
        )
        do { try await UNUserNotificationCenter.current().add(request) }
        catch { return false }
        return true
    }

    static func background(using permissions: Permissions) async -> Bool {
        let fetch = await permissions.request(.fetch)
        let refresh = await permissions.request(.bgtask)
        return fetch || refresh
    }

    static func biometric(using permissions: Permissions) async -> Bool {
        permissions.isGranted(.faceid) ? true : await permissions.request(.faceid)
    }

    static func personalization(using permissions: Permissions) async -> Bool {
        await permissions.request(.tracking)
    }

    static func audio(using permissions: Permissions) async -> Bool {
        await permissions.request(.audio)
    }
}

struct CirclePost: Identifiable, Hashable {
    let id: String
    let author: String
    let meta: String
    let circle: String
    let title: String
    let text: String
    var likes: Int
    var comments: Int
    var shares: Int
    var liked = false
    var saved = false
    var mediaData: Data? = nil
    var voiceURL: URL? = nil
    var voiceDuration: TimeInterval = 0
    var place: String? = nil
}

struct InterestCircle: Identifiable, Hashable {
    let id: String
    let title: String
    let subtitle: String
    let members: Int
    var joined: Bool
}

struct CirclePlan: Identifiable, Hashable {
    let id: String
    let title: String
    let circle: String
    let when: String
    let place: String
    var joined: Bool
}

struct CircleDialog: Identifiable, Hashable {
    let id: String
    let title: String
    var last: String
    var time: String
    var unread: Int
}

struct CircleComment: Identifiable, Hashable {
    let id: UUID
    let author: String
    let text: String
    let time: String
}

struct CircleMessage: Identifiable, Hashable {
    let id: UUID
    let text: String
    let mine: Bool
}

@MainActor
@Observable
final class CirclesStore {
    var publishedOutcomePlanIDs = Set<String>()
    var calendarEventIDs: [String: String] = [:]
    var posts: [CirclePost] = [
        CirclePost(
            id: "film", author: "Аня Котова", meta: "18 мин · Кино на 16 мм", circle: "Кино на 16 мм",
            title: "Первый монтаж нашей короткометражки",
            text: "Собрала черновую сцену в мастерской. Не понимаю, оставлять ли длинную паузу перед финалом. Посмотрите отрывок?",
            likes: 46, comments: 12, shares: 4
        ),
        CirclePost(
            id: "run", author: "Максим Орлов", meta: "1 ч · Беговая среда", circle: "Беговая среда",
            title: "Ищу двоих на спокойные 8 км",
            text: "В субботу в 9:30 от Воробьёвых гор. Темп около 6:20, после зайдём за кофе. Откликнитесь, если по пути.",
            likes: 31, comments: 8, shares: 2
        ),
        CirclePost(
            id: "ceramics", author: "Лена Соколова", meta: "вчера · Керамика по воскресеньям", circle: "Керамика",
            title: "Чашки после первого обжига",
            text: "Три недели назад мы выбирали форму, а сегодня забрали первую партию. Показываю, что получилось.",
            likes: 89, comments: 19, shares: 6
        )
    ]

    var circles: [InterestCircle] = [
        InterestCircle(id: "film", title: "Кино на 16 мм", subtitle: "Съёмки и разборы", members: 184, joined: true),
        InterestCircle(id: "run", title: "Беговая среда", subtitle: "Тренировки и старты", members: 326, joined: true),
        InterestCircle(id: "ceramics", title: "Керамика по воскресеньям", subtitle: "Мастерские и обжиги", members: 97, joined: false),
        InterestCircle(id: "books", title: "Короткая проза", subtitle: "Тексты и честные разборы", members: 241, joined: false)
    ]

    var plans: [CirclePlan] = [
        CirclePlan(id: "run", title: "8 км и кофе", circle: "Беговая среда", when: "суббота, 9:30", place: "Воробьёвы горы", joined: true),
        CirclePlan(id: "film", title: "Разбор первого монтажа", circle: "Кино на 16 мм", when: "воскресенье, 18:00", place: "Мастерская №4", joined: false)
    ]

    var dialogs: [CircleDialog] = [
        CircleDialog(id: "film", title: "Кино на 16 мм", last: "Аня: залила новый монтаж", time: "14:32", unread: 3),
        CircleDialog(id: "run", title: "Максим Орлов", last: "Тогда встретимся у входа", time: "12:08", unread: 0),
        CircleDialog(id: "ceramics", title: "Керамика", last: "Лена: обжиг перенесли на час", time: "вчера", unread: 1)
    ]

    var comments: [String: [CircleComment]] = [
        "film": [
            CircleComment(id: UUID(), author: "Илья Миронов", text: "Паузу оставил бы — она даёт время собрать финал.", time: "14:21"),
            CircleComment(id: UUID(), author: "Марта Серова", text: "И музыку в этом месте не ускоряла бы.", time: "14:28")
        ],
        "run": [CircleComment(id: UUID(), author: "Олег Ким", text: "Я с вами, темп подходит.", time: "12:12")]
    ]

    var messages: [String: [CircleMessage]] = [
        "film": [
            CircleMessage(id: UUID(), text: "Аня скинула второй монтаж. Посмотришь до вечера?", mine: false),
            CircleMessage(id: UUID(), text: "Да, оставлю комментарии прямо в посте", mine: true)
        ]
    ]

    func toggleLike(_ post: CirclePost) {
        guard let index = posts.firstIndex(where: { $0.id == post.id }) else { return }
        posts[index].liked.toggle()
        posts[index].likes += posts[index].liked ? 1 : -1
    }

    func toggleSave(_ post: CirclePost) {
        guard let index = posts.firstIndex(where: { $0.id == post.id }) else { return }
        posts[index].saved.toggle()
    }

    func hide(_ post: CirclePost) {
        posts.removeAll { $0.id == post.id }
    }

    func addComment(_ text: String, to post: CirclePost) {
        let value = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !value.isEmpty else { return }
        comments[post.id, default: []].append(CircleComment(id: UUID(), author: "Влад Шукуров", text: value, time: "сейчас"))
        if let index = posts.firstIndex(where: { $0.id == post.id }) { posts[index].comments += 1 }
    }

    func sendMessage(_ text: String, to dialog: CircleDialog) {
        let value = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !value.isEmpty else { return }
        messages[dialog.id, default: []].append(CircleMessage(id: UUID(), text: value, mine: true))
        if let index = dialogs.firstIndex(where: { $0.id == dialog.id }) {
            dialogs[index].last = value
            dialogs[index].time = "сейчас"
            dialogs[index].unread = 0
        }
    }

    func togglePlan(_ plan: CirclePlan) {
        guard let index = plans.firstIndex(where: { $0.id == plan.id }) else { return }
        plans[index].joined.toggle()
    }

    func createPlan(from post: CirclePost) {
        guard !plans.contains(where: { $0.id == "post-\(post.id)" }) else { return }
        plans.insert(CirclePlan(
            id: "post-\(post.id)", title: "Обсудить: \(post.title)", circle: post.circle,
            when: "воскресенье, 18:00", place: "В чате круга", joined: true
        ), at: 0)
    }

    func publishOutcome(for plan: CirclePlan) {
        guard !publishedOutcomePlanIDs.contains(plan.id) else { return }
        publishedOutcomePlanIDs.insert(plan.id)
        posts.insert(CirclePost(
            id: "outcome-\(plan.id)", author: "Влад Шукуров", meta: "сейчас · \(plan.circle)", circle: plan.circle,
            title: "Как прошёл план «\(plan.title)»", text: "План завершён. Делимся итогом с кругом.",
            likes: 0, comments: 0, shares: 0
        ), at: 0)
    }

    func publish(
        text: String,
        circle: String,
        mediaData: Data? = nil,
        voiceURL: URL? = nil,
        voiceDuration: TimeInterval = 0,
        place: String? = nil
    ) {
        let value = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !value.isEmpty else { return }
        posts.insert(CirclePost(
            id: UUID().uuidString, author: "Влад Шукуров", meta: "сейчас · \(circle)", circle: circle,
            title: "Новая публикация", text: value, likes: 0, comments: 0, shares: 0,
            mediaData: mediaData, voiceURL: voiceURL, voiceDuration: voiceDuration,
            place: place?.trimmingCharacters(in: .whitespacesAndNewlines).nilIfEmpty
        ), at: 0)
    }
}

private extension String {
    var nilIfEmpty: String? { isEmpty ? nil : self }
}
