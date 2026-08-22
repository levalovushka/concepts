import SwiftUI

// «Образы» — соцсеть, где единица контента не пост и не товар, а ОБРАЗ из реального
// гардероба: его можно разобрать на вещи и собрать свою версию.

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
        if s.contains("джинс") || s.contains("брюк") { return "figure.stand" }
        if s.contains("юбк") || s.contains("платье") { return "figure.dress.line.vertical.figure" }
        if s.contains("тренч") { return "coat" }
        if s.contains("пиджак") || s.contains("жакет") { return "person.crop.square" }
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
    var outfits: [Outfit] = [
        Outfit(author: "Аня Котова", meta: "2 ч · Москва",
               text: "Собрала образ на осень: тренч, ботинки и шарф крупной вязки. Как вам сочетание?",
               items: [Garment(title: "Тренч оверсайз", brand: "Zara", inOutfits: 12, state: .worn("надет вчера")),
                       Garment(title: "Ботинки челси", brand: "Ecco", inOutfits: 31, state: .worn("надеты 3 дня назад")),
                       Garment(title: "Шарф крупной вязки", brand: "связан сама", inOutfits: 4, state: .idle("2 недели"))],
               likes: 128, comments: 24, shares: 6, views: "3,4K", seed: 0),
        Outfit(author: "Марк Львов", meta: "вчера · Санкт-Петербург",
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
    ]

    var stories: [Story] = [
        Story(name: "Ника Орлова", isMine: true),
        Story(name: "Аня Котова"),
        Story(name: "Пудра"),
        Story(name: "Марк Львов", seen: true),
        Story(name: "Даша Ким", seen: true),
        Story(name: "Лена Гор", seen: true),
    ]

    var dialogs: [Dialog] = [
        Dialog(name: "Стиль-клуб «Пудра»", last: "Своп в субботу в 15:00, придёте?", time: "12:40", unread: 2),
        Dialog(name: "Аня Котова", last: "Скинула образ, глянь вещи", time: "11:05", online: true),
        Dialog(name: "Марк Львов", last: "Спасибо за совет по тренчу", time: "вчера"),
        Dialog(name: "Соседки по стилю", last: "Даша: принесу два платья", time: "вчера", unread: 5),
        Dialog(name: "Лена Гор", last: "Вы: договорились", time: "пн"),
        Dialog(name: "Ника Орлова", last: "Фото с барахолки", time: "12 окт"),
    ]

    var messages: [Message] = [
        Message(text: "Привет! Своп в эту субботу в 15:00", mine: false, time: "12:30"),
        Message(text: "Приду! Что приносить?", mine: true, time: "12:35"),
        Message(text: "Всё, что не носите — верх, обувь, аксессуары", mine: false, time: "12:38"),
        Message(text: "Отлично, соберу пакет", mine: true, time: "12:40"),
        Message(text: "Записала вас, до субботы", mine: false, time: "12:41"),
    ]

    var events: [NearbyEvent] = [
        NearbyEvent(title: "Своп-вечеринка «Пудра»", place: "Лофт на Мясницкой", when: "Суббота, 15:00", distance: "1,2 км", going: 34),
        NearbyEvent(title: "Барахолка винтажа", place: "Дизайн-завод «Флакон»", when: "Воскресенье, 12:00", distance: "3,4 км", going: 128),
        NearbyEvent(title: "Обмен верхней одеждой", place: "Кофейня «Заря»", when: "5 ноября, 19:00", distance: "600 м", going: 12),
    ]

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

    func send(_ text: String) {
        messages.append(Message(text: text, mine: true, time: "12:45"))
    }
}
