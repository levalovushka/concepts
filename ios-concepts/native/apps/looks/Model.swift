import SwiftUI

@MainActor
enum LooksPermissionFlow {
    static func requestLocation(using permissions: Permissions) async -> Bool {
        await permissions.request(.location)
    }

    static func requestCalendar(using permissions: Permissions) async -> Bool {
        await permissions.request(.calendar)
    }
}

// «Образы» — соцсеть, где единица контента не пост и не товар, а ОБРАЗ из реального
// гардероба: его можно разобрать на вещи и собрать свою версию.

/// Фотографии — продуктовые данные «Образов», а не часть VK reference profile.
/// В наборе нет синтетических лиц/тел: только вещи и пространства.
enum LooksMediaAssets {
    static let outfit = ["LooksMedia0", "LooksMedia1", "LooksMedia4"]
    static let detail = ["LooksMedia5", "LooksMedia3", "LooksMedia1"]
    static let discovery = ["LooksMedia0", "LooksMedia1", "LooksMedia5", "LooksMedia4", "LooksMedia3", "LooksMedia2"]
    static let events = ["LooksMedia2", "LooksMedia3", "LooksMedia5"]
    static let swap = "LooksMedia2"
    static let wardrobe = "LooksMedia3"

    static func outfit(_ seed: Int) -> String { outfit[abs(seed) % outfit.count] }
    static func detail(_ seed: Int) -> String { detail[abs(seed) % detail.count] }
    /// Shift every completed media cycle so a repeated search match does not
    /// alias to the same photograph when outfit and asset counts coincide.
    static func discovery(_ seed: Int) -> String {
        let value = abs(seed)
        return discovery[(value + value / discovery.count) % discovery.count]
    }
    static func event(_ seed: Int) -> String { events[abs(seed) % events.count] }
}

struct Outfit: Identifiable, Hashable {
    let id = UUID()
    let author: String
    let meta: String
    let text: String
    let items: [Garment]
    var likes: Int
    var comments: Int
    var shares: Int
    var views: String
    var liked: Bool = false
    var saved: Bool = false
    var seed: Int = 0
}

enum GarmentState: Hashable {
    case worn(String)      // «надета 3 дня назад»
    case idle(String)      // «не носили 7 месяцев»
    case onSwap            // отдана на своп
    case wanted            // хочу такую

    var label: String {
        switch self {
        case .worn(let w): return w
        case .idle(let w): return "не носили \(w)"
        case .onSwap: return "на свопе"
        case .wanted: return "в вишлисте"
        }
    }
    var icon: String {
        switch self {
        case .worn: return "checkmark.circle.fill"
        case .idle: return "clock"
        case .onSwap: return "arrow.left.arrow.right"
        case .wanted: return "heart"
        }
    }
}

struct Garment: Identifiable, Hashable {
    let id = UUID()
    let title: String
    let brand: String
    var inOutfits: Int = 0
    var state: GarmentState = .idle("месяц")
    var glyph: String {
        let s = title.lowercased()
        if s.contains("ботин") || s.contains("сапог") || s.contains("босонож") { return "shoe.fill" }
        if s.contains("шапк") || s.contains("шляп") || s.contains("берет") { return "hat.widebrim.fill" }
        if s.contains("сумк") || s.contains("рюкзак") { return "handbag.fill" }
        if s.contains("очк") { return "eyeglasses" }
        if s.contains("джинс") || s.contains("брюк") { return "rectangle.split.1x2" }
        if s.contains("юбк") || s.contains("платье") { return "tshirt" }
        if s.contains("тренч") { return "coat" }
        if s.contains("пиджак") || s.contains("жакет") { return "coat" }
        if s.contains("шарф") { return "scribble.variable" }
        if s.contains("кед") || s.contains("кросс") { return "shoe.2.fill" }
        return "tshirt.fill"
    }
}

struct Story: Identifiable, Hashable {
    let id = UUID()
    let name: String
    var isMine: Bool = false
    var seen: Bool = false
}

struct Dialog: Identifiable, Hashable {
    let id = UUID()
    let name: String
    let last: String
    let time: String
    var unread: Int = 0
    var online: Bool = false
}

struct Message: Identifiable, Hashable {
    let id = UUID()
    let text: String
    let mine: Bool
    let time: String
    /// Разделитель даты над сообщением — как в ВК, по центру серым.
    var day: String? = nil
}

struct NearbyEvent: Identifiable, Hashable {
    let id = UUID()
    let title: String
    let place: String
    let when: String
    let distance: String
    let going: Int
}

// MARK: - Состояние приложения (живое: лайки, сохранения, отправка сообщений)

@MainActor
@Observable
final class LooksStore {
    private static let venueNetworkKey = "looks.swap.venue-network-joined"
    private static let checkedInKey = "looks.swap.checked-in"
    private static let joinedEventsKey = "looks.events.joined"

    private(set) var venueNetworkJoined: Bool
    private(set) var checkedIn: Bool
    private var joinedEventTitles: Set<String>
    var unreadNotifications = 7

    init() {
        let defaults = UserDefaults.standard
        venueNetworkJoined = defaults.bool(forKey: Self.venueNetworkKey)
        checkedIn = defaults.bool(forKey: Self.checkedInKey)
        joinedEventTitles = Set(defaults.stringArray(forKey: Self.joinedEventsKey) ?? [])
    }

    func setVenueNetworkJoined(_ joined: Bool) {
        venueNetworkJoined = joined
        UserDefaults.standard.set(joined, forKey: Self.venueNetworkKey)
    }

    func setCheckedIn(_ value: Bool) {
        checkedIn = value
        UserDefaults.standard.set(value, forKey: Self.checkedInKey)
    }

    func isGoing(to event: NearbyEvent) -> Bool { joinedEventTitles.contains(event.title) }

    func setGoing(_ going: Bool, to event: NearbyEvent) {
        if going { joinedEventTitles.insert(event.title) }
        else { joinedEventTitles.remove(event.title) }
        UserDefaults.standard.set(Array(joinedEventTitles).sorted(), forKey: Self.joinedEventsKey)
    }

    var outfits: [Outfit] = [
        Outfit(author: "Аня Котова", meta: "2 ч",
               text: "Собрала образ на осень: тренч, ботинки и шарф крупной вязки. Как вам сочетание?",
               items: [Garment(title: "Тренч оверсайз", brand: "Zara", inOutfits: 12, state: .worn("надет вчера")),
                       Garment(title: "Ботинки челси", brand: "Ecco", inOutfits: 31, state: .worn("надеты 3 дня назад")),
                       Garment(title: "Шарф крупной вязки", brand: "связан сама", inOutfits: 4, state: .idle("2 недели"))],
               likes: 128, comments: 24, shares: 6, views: "3,4K", seed: 0),
        Outfit(author: "Марк Львов", meta: "вчера",
               text: "Три вещи, которые работают в любом сочетании. Проверял месяц.",
               items: [Garment(title: "Пиджак оверсайз", brand: "Massimo Dutti", inOutfits: 8, state: .idle("7 месяцев")),
                       Garment(title: "Прямые джинсы", brand: "Levi\'s 501", inOutfits: 44, state: .worn("надеты сегодня")),
                       Garment(title: "Белые кеды", brand: "Adidas", inOutfits: 19, state: .onSwap)],
               likes: 210, comments: 41, shares: 33, views: "8,1K", seed: 2),
        Outfit(author: "Даша Ким", meta: "вчера",
               text: "Платье-комбинация под жакет — работает и в офис, и вечером",
               items: [Garment(title: "Платье-комбинация", brand: "12 Storeez", inOutfits: 6, state: .worn("надето в пятницу")),
                       Garment(title: "Жакет", brand: "секонд, 1 200 ₽", inOutfits: 15, state: .idle("месяц")),
                       Garment(title: "Босоножки", brand: "Mango", inOutfits: 2, state: .wanted)],
               likes: 64, comments: 8, shares: 2, views: "1,9K", seed: 4),
        Outfit(author: "Лена Гор", meta: "2 д",
               text: "Купила пальто в секонде за 2 400 ₽. Ношу третью неделю не снимая",
               items: [Garment(title: "Пальто драповое", brand: "секонд, 2 400 ₽", inOutfits: 9, state: .worn("надето сегодня")),
                       Garment(title: "Шапка бини", brand: "Uniqlo", inOutfits: 27, state: .worn("надета вчера")),
                       Garment(title: "Сумка через плечо", brand: "мамина", inOutfits: 63, state: .idle("4 дня"))],
               likes: 341, comments: 57, shares: 12, views: "12,4K", seed: 1),
        Outfit(author: "Аня Котова", meta: "3 д",
               text: "Разобрала гардероб: 11 вещей уезжают на своп в субботу",
               items: [Garment(title: "Юбка миди", brand: "H&M", inOutfits: 3, state: .onSwap),
                       Garment(title: "Свитер крупной вязки", brand: "бабушкин", inOutfits: 21, state: .onSwap)],
               likes: 87, comments: 113, shares: 4, views: "5,2K", seed: 3),
        Outfit(author: "Марк Львов", meta: "4 д",
               text: "Год не надевал эти брюки. Собрал под них два образа — оба рабочие",
               items: [Garment(title: "Брюки со стрелками", brand: "Massimo Dutti", inOutfits: 2, state: .idle("год")),
                       Garment(title: "Ботинки челси", brand: "Ecco", inOutfits: 31, state: .worn("надеты в среду")),
                       Garment(title: "Очки", brand: "Ray-Ban", inOutfits: 48, state: .worn("надеты сегодня"))],
               likes: 52, comments: 6, shares: 1, views: "1,1K", seed: 5),
    ]

    /// Мозаика «Поиска»: смесь клипов, фото и подборок — то, что в ВК на
    /// вкладке «Для вас». Высоты неровные, иначе сетка читается как шаблон.
    var discover: [VKMosaicItem] = [
        VKMosaicItem(assetName: LooksMediaAssets.discovery(0), height: 210, badge: "play.fill"),
        VKMosaicItem(assetName: LooksMediaAssets.discovery(1), height: 150, badge: nil),
        VKMosaicItem(assetName: LooksMediaAssets.discovery(2), height: 168, badge: "square.on.square"),
        VKMosaicItem(assetName: LooksMediaAssets.discovery(3), height: 148, badge: nil),
        VKMosaicItem(assetName: LooksMediaAssets.discovery(4), height: 196, badge: "play.fill"),
        VKMosaicItem(assetName: LooksMediaAssets.discovery(5), height: 132, badge: nil),
        VKMosaicItem(assetName: LooksMediaAssets.discovery(6), height: 176, badge: "square.on.square"),
        VKMosaicItem(assetName: LooksMediaAssets.discovery(7), height: 204, badge: "play.fill"),
        VKMosaicItem(assetName: LooksMediaAssets.discovery(8), height: 142, badge: nil),
        VKMosaicItem(assetName: LooksMediaAssets.discovery(9), height: 186, badge: nil),
        VKMosaicItem(assetName: LooksMediaAssets.discovery(10), height: 154, badge: "play.fill"),
        VKMosaicItem(assetName: LooksMediaAssets.discovery(11), height: 172, badge: nil),
        VKMosaicItem(assetName: LooksMediaAssets.discovery(12), height: 198, badge: "square.on.square"),
        VKMosaicItem(assetName: LooksMediaAssets.discovery(13), height: 136, badge: nil),
        VKMosaicItem(assetName: LooksMediaAssets.discovery(14), height: 164, badge: "play.fill"),
    ]

    var stories: [Story] = [
        Story(name: "Ника Орлова", isMine: true),
        Story(name: "Аня Котова"),
        Story(name: "Лена Гор"),
        Story(name: "Марк Львов", seen: true),
        Story(name: "Даша Ким", seen: true),
        Story(name: "Лена Гор", seen: true),
    ]

    var dialogs: [Dialog] = [
        Dialog(name: "Аня Котова", last: "Своп в субботу в 15:00, придёте?", time: "12:40", unread: 2),
        Dialog(name: "Даша Ким", last: "Скинула образ, глянь вещи", time: "11:05", online: true),
        Dialog(name: "Марк Львов", last: "Спасибо за совет по тренчу", time: "вчера"),
        Dialog(name: "Соседки по стилю", last: "Даша: принесу два платья", time: "вчера", unread: 5),
        Dialog(name: "Лена Гор", last: "Вы: договорились", time: "пн"),
        Dialog(name: "Оля Пан", last: "Фото с барахолки", time: "12 окт"),
    ]

    private var messagesByPeer: [String: [Message]] = ["Аня Котова": [
        Message(text: "Тренч я всё-таки отдаю на своп", mine: false, time: "19:04", day: "27 октября"),
        Message(text: "Тот самый? Я его два года у вас вижу", mine: true, time: "19:06"),
        Message(text: "Он самый. Надела дважды за год", mine: false, time: "19:07"),
        Message(text: "Привет! Своп в эту субботу в 15:00", mine: false, time: "12:30", day: "Сегодня"),
        Message(text: "Приду! Что приносить?", mine: true, time: "12:35"),
        Message(text: "Всё, что не носите — верх, обувь, аксессуары", mine: false, time: "12:38"),
        Message(text: "И вешалки, если есть лишние", mine: false, time: "12:38"),
        Message(text: "Отлично, соберу пакет", mine: true, time: "12:40"),
        Message(text: "Записала вас, до субботы", mine: false, time: "12:41"),
    ]]

    var events: [NearbyEvent] = [
        NearbyEvent(title: "Своп у Ани на Мясницкой", place: "Лофт на Мясницкой", when: "Суббота, 15:00", distance: "1,2 км", going: 34),
        NearbyEvent(title: "Барахолка винтажа", place: "Дизайн-завод «Флакон»", when: "Воскресенье, 12:00", distance: "3,4 км", going: 128),
        NearbyEvent(title: "Обмен верхней одеждой", place: "Кофейня «Заря»", when: "5 ноября, 19:00", distance: "600 м", going: 12),
    ]

    /// Вещей в гардеробе — одно число на все экраны, иначе они спорят друг с другом.
    var garments: [Garment] { outfits.flatMap(\.items) }
    /// Лента без скрытых публикаций.
    var visibleOutfits: [Outfit] { outfits.filter { !hidden.contains($0.id) } }

    /// Скрытая и пожалованная публикации уходят из ленты — у действия должен
    /// быть продуктовый исход, а не снекбар.
    var hidden = Set<UUID>()
    var reported = Set<UUID>()

    func hide(_ id: UUID) { hidden.insert(id) }
    func report(_ id: UUID) { reported.insert(id); hidden.insert(id) }

    func toggleLike(_ id: UUID) {
        guard let i = outfits.firstIndex(where: { $0.id == id }) else { return }
        outfits[i].liked.toggle()
        outfits[i].likes += outfits[i].liked ? 1 : -1
    }
    func toggleSave(_ id: UUID) {
        guard let i = outfits.firstIndex(where: { $0.id == id }) else { return }
        outfits[i].saved.toggle()
    }
    /// Ремикс: свой образ, собранный из чужого — ядровое отличие продукта.
    func remix(_ outfit: Outfit) {
        var copy = outfit
        copy = Outfit(author: "Ника Орлова", meta: "только что · ваш ремикс",
                      text: "Собрала свою версию образа @\(outfit.author.split(separator: " ").first ?? "")",
                      items: outfit.items, likes: 0, comments: 0, shares: 0,
                      views: "0", seed: outfit.seed + 1)
        outfits.insert(copy, at: 0)
    }

    func publish(text: String) {
        let draft = Outfit(
            author: "Ника Орлова",
            meta: "только что",
            text: text.trimmingCharacters(in: .whitespacesAndNewlines),
            items: [Garment(title: "Новый образ", brand: "мой гардероб", inOutfits: 1, state: .worn("сегодня"))],
            likes: 0,
            comments: 0,
            shares: 0,
            views: "0",
            seed: outfits.count + 1
        )
        outfits.insert(draft, at: 0)
    }

    func messages(for peer: String) -> [Message] {
        messagesByPeer[peer] ?? [
            Message(text: "Здравствуйте! Рада знакомству в «Образах».", mine: false, time: "сейчас", day: "Сегодня")
        ]
    }

    func send(_ text: String, to peer: String) {
        var thread = messages(for: peer)
        thread.append(Message(text: text, mine: true, time: "12:45"))
        messagesByPeer[peer] = thread
    }
}
