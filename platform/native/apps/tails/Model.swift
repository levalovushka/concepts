import SwiftUI

// «Хвосты» — соцсеть, где профиль принадлежит питомцу, а не человеку.
// Единица контента — момент прогулки: место, время, темперамент и то, с кем
// пёс уже поладил. Отсюда и модель: питомец первичен, человек при нём.

struct Pet: Identifiable, Hashable {
    let id = UUID()
    let name: String
    let breed: String
    let age: String
    let owner: String
    /// «спокойный · не любит крупных» — темперамент решает, кому писать.
    let temper: String
    var isMine: Bool = false
}

enum MomentKind: String, Hashable {
    case walk = "Прогулка"
    case found = "Находка"
    case question = "Вопрос"
    case lost = "Пропал"

    var systemImage: String {
        switch self {
        case .walk: "figure.walk"
        case .found: "sparkle.magnifyingglass"
        case .question: "bubble.left.and.bubble.right"
        case .lost: "exclamationmark.triangle"
        }
    }
}

struct Moment: Identifiable, Hashable {
    let id = UUID()
    let kind: MomentKind
    let pet: Pet
    let title: String
    let text: String
    let place: String
    let published: String
    var likes: Int
    var replies: [Reply]
    var views: String
    var liked: Bool = false
    var saved: Bool = false
}

struct Reply: Identifiable, Hashable {
    let id = UUID()
    let author: String
    let text: String
    let time: String
}

enum WalkState: String, Hashable {
    case planned = "Собираются"
    case now = "Идёт сейчас"
    case done = "Прошла"
}

struct Walk: Identifiable, Hashable {
    let id = UUID()
    let place: String
    let when: String
    let distance: String
    let state: WalkState
    let pets: [String]
    /// «мелкие и спокойные» — без этого прогулка не отличается от встречи.
    let suits: String
    var joined: Bool = false
}

struct DogPlace: Identifiable, Hashable {
    let id = UUID()
    let title: String
    let kind: String
    let distance: String
    let detail: String
    let hasNetwork: Bool
}

struct Dialog: Identifiable, Hashable {
    let id = UUID()
    let name: String
    let subtitle: String
    let last: String
    let time: String
    var unread: Int = 0
}

struct Message: Identifiable, Hashable {
    let id = UUID()
    let author: String
    let text: String
    let time: String
    let mine: Bool
    var day: String? = nil
}

struct VetRecord: Identifiable, Hashable {
    let id = UUID()
    let title: String
    let detail: String
    let due: String
    let done: Bool
}

struct Lesson: Identifiable, Hashable {
    let id = UUID()
    let title: String
    let duration: String
    /// «скачан · скачивается 62 % · не скачан, 38 МБ» — список живой, а не ровный.
    let state: String
    let progress: Double?
}

@MainActor
@Observable
final class TailsStore {
    let me = Pet(name: "Буся", breed: "корги", age: "3 года",
                 owner: "Ника Орлова", temper: "спокойная · не любит крупных", isMine: true)

    var moments: [Moment] = []
    var walks: [Walk] = []
    var places: [DogPlace] = []
    var dialogs: [Dialog] = []
    var messages: [Message] = []
    var vetRecords: [VetRecord] = []
    var lessons: [Lesson] = []
    var hidden = Set<UUID>()

    var visibleMoments: [Moment] { moments.filter { !hidden.contains($0.id) } }
    var petCount: Int { 214 }
    var joinedWalks: Int { walks.filter(\.joined).count }

    init() {
        let rada = Pet(name: "Рада", breed: "бигль", age: "2 года", owner: "Аня Котова",
                       temper: "шумная · любит бегать")
        let tosha = Pet(name: "Тоша", breed: "метис", age: "7 лет", owner: "Марк Львов",
                        temper: "пожилой · гуляет медленно")
        let mira = Pet(name: "Мира", breed: "шпиц", age: "1 год", owner: "Даша Ким",
                       temper: "боится крупных собак")
        let grisha = Pet(name: "Гриша", breed: "кот, британец", age: "5 лет", owner: "Лена Гор",
                         temper: "выходит только на балкон")

        moments = [
            Moment(kind: .walk, pet: rada,
                   title: "Утренний круг у пруда",
                   text: "Ходили в 7:40, было пусто и прохладно. Рада наконец не тянула поводок — сработал курс из приложения.",
                   place: "Парк у пруда · 600 м", published: "сегодня, 08:12",
                   likes: 34, replies: [
                       Reply(author: "Марк Львов", text: "Мы тоже там были, разминулись минут на десять", time: "08:31"),
                       Reply(author: "Даша Ким", text: "Мира боится больших, во сколько там тихо?", time: "09:02"),
                   ], views: "118"),
            Moment(kind: .lost, pet: grisha,
                   title: "Пропал кот у дома 24",
                   text: "Британец, серый, откликается на Гришу. Убежал через окно в среду вечером. Чип есть, номер в профиле.",
                   place: "Мясницкая, 24", published: "вчера, 21:40",
                   likes: 96, replies: [
                       Reply(author: "Аня Котова", text: "Расклеила во дворе, соседи предупреждены", time: "22:10"),
                   ], views: "1 240"),
            Moment(kind: .question, pet: mira,
                   title: "Куда ходить со щенком, который боится?",
                   text: "Мире год, на площадке зажимается. Есть места, где мало крупных собак утром?",
                   place: "Район Чистые пруды", published: "вчера, 18:05",
                   likes: 12, replies: [], views: "84"),
            Moment(kind: .found, pet: tosha,
                   title: "Нашли ошейник у детской",
                   text: "Синий, с адресником без телефона. Лежит у консьержа второго подъезда.",
                   place: "Двор 24/7", published: "2 дня назад",
                   likes: 41, replies: [
                       Reply(author: "Лена Гор", text: "Похоже на ошейник рыжего спаниеля с седьмого", time: "12:20"),
                   ], views: "306"),
            Moment(kind: .walk, pet: rada,
                   title: "Первый раз без поводка на площадке",
                   text: "Отпустили в огороженной зоне. Прибежала на кличку с третьего раза — для бигля это победа.",
                   place: "Дог-парк на Солянке", published: "2 дня назад",
                   likes: 57, replies: [
                       Reply(author: "Ника Орлова", text: "Мы там же учились, помогает свисток", time: "19:12"),
                   ], views: "402"),
            Moment(kind: .question, pet: rada,
                   title: "Чем занять бигля в дождь?",
                   text: "Второй день льёт, гуляем по десять минут. Дома грызёт всё подряд.",
                   place: "Дом", published: "4 дня назад",
                   likes: 23, replies: [], views: "191"),
            Moment(kind: .walk, pet: tosha,
                   title: "Медленный вечерний маршрут",
                   text: "Тоше семь, ходим короткими кругами по двору. Если у кого пожилая собака — присоединяйтесь, темп спокойный.",
                   place: "Двор и сквер", published: "3 дня назад",
                   likes: 28, replies: [], views: "203"),
        ]

        walks = [
            Walk(place: "Парк у пруда", when: "сегодня, 19:30", distance: "600 м",
                 state: .planned, pets: ["Рада", "Буся"], suits: "мелкие и спокойные"),
            Walk(place: "Дог-парк на Солянке", when: "идёт с 18:40", distance: "1,2 км",
                 state: .now, pets: ["Тоша", "Джек", "Луна"], suits: "любые, есть отдельная зона"),
            Walk(place: "Сквер у школы", when: "завтра, 08:00", distance: "300 м",
                 state: .planned, pets: ["Мира"], suits: "щенки и пугливые"),
            Walk(place: "Набережная", when: "вчера, 20:10", distance: "2,4 км",
                 state: .done, pets: ["Рада", "Тоша", "Буся", "Ёжик"], suits: "длинный маршрут"),
        ]

        places = [
            DogPlace(title: "Дог-парк на Солянке", kind: "площадка с зонами",
                     distance: "1,2 км", detail: "снаряды, вода, свет до 23:00", hasNetwork: true),
            DogPlace(title: "Парк у пруда", kind: "свободный выгул утром",
                     distance: "600 м", detail: "до 9:00 почти пусто", hasNetwork: false),
            DogPlace(title: "Ветклиника «Лапа»", kind: "круглосуточно",
                     distance: "850 м", detail: "приём без записи ночью", hasNetwork: false),
            DogPlace(title: "Зоомагазин у метро", kind: "корма и амуниция",
                     distance: "400 м", detail: "закрывается в 22:00", hasNetwork: true),
            DogPlace(title: "Сквер у школы", kind: "тихий выгул",
                     distance: "300 м", detail: "нет ограждения", hasNetwork: false),
        ]

        dialogs = [
            Dialog(name: "Аня и Рада", subtitle: "бигль · 2 года", last: "Во сколько выходите вечером?", time: "18:24", unread: 2),
            Dialog(name: "Прогулка у пруда", subtitle: "7 участников", last: "Марк: буду к половине", time: "17:50", unread: 5),
            Dialog(name: "Догситтер Оля", subtitle: "передержка · 4 отзыва", last: "Вы: подтвердила субботу", time: "вчера"),
            Dialog(name: "Даша и Мира", subtitle: "шпиц · 1 год", last: "Спасибо за совет по шлейке", time: "вчера"),
            Dialog(name: "Соседи по двору", subtitle: "31 участник", last: "Черновик: нашёлся ошейник", time: "пн"),
            Dialog(name: "Ветклиника «Лапа»", subtitle: "запись и напоминания", last: "Прививка через 12 дней", time: "12 авг"),
        ]

        messages = [
            Message(author: "Аня Котова", text: "Мы сегодня к семи у пруда, если что", time: "17:41", mine: false, day: "Сегодня"),
            Message(author: "Аня Котова", text: "Рада после курса стала спокойнее на поводке", time: "17:42", mine: false),
            Message(author: "Ника", text: "Отлично, подойдём с Бусей к половине восьмого", time: "17:55", mine: true),
            Message(author: "Аня Котова", text: "Во сколько выходите вечером?", time: "18:24", mine: false),
        ]

        vetRecords = [
            VetRecord(title: "Комплексная прививка", detail: "клиника «Лапа» · Нобивак", due: "через 12 дней", done: false),
            VetRecord(title: "Обработка от клещей", detail: "капли, каждые 4 недели", due: "просрочено на 3 дня", done: false),
            VetRecord(title: "Бешенство", detail: "клиника «Лапа»", due: "сделано 14 марта", done: true),
            VetRecord(title: "Чипирование", detail: "номер 643 094 100 218 445", due: "сделано в 2023", done: true),
        ]

        lessons = [
            Lesson(title: "Ходьба рядом без натяжения", duration: "14 мин", state: "скачан", progress: nil),
            Lesson(title: "Отзыв на кличку в парке", duration: "9 мин", state: "скачивается 62 %", progress: 0.62),
            Lesson(title: "Спокойная встреча с собакой", duration: "18 мин", state: "прослушан", progress: nil),
            Lesson(title: "Выдержка у подъезда", duration: "7 мин", state: "не скачан, 38 МБ", progress: nil),
        ]
    }

    func toggleLike(_ id: UUID) {
        guard let index = moments.firstIndex(where: { $0.id == id }) else { return }
        moments[index].liked.toggle()
        moments[index].likes += moments[index].liked ? 1 : -1
    }

    func toggleSave(_ id: UUID) {
        guard let index = moments.firstIndex(where: { $0.id == id }) else { return }
        moments[index].saved.toggle()
    }

    func hide(_ id: UUID) { hidden.insert(id) }

    func toggleJoin(_ id: UUID) {
        guard let index = walks.firstIndex(where: { $0.id == id }) else { return }
        walks[index].joined.toggle()
    }

    func send(_ text: String) {
        messages.append(Message(author: "Ника", text: text, time: "18:31", mine: true))
    }

    func addMoment(kind: MomentKind, text: String) {
        moments.insert(Moment(kind: kind, pet: me, title: text.isEmpty ? "Момент дня" : text,
                              text: text, place: "Двор 24/7", published: "только что",
                              likes: 0, replies: [], views: "0"), at: 0)
    }

    func addVetNote(_ text: String) {
        vetRecords.insert(VetRecord(title: "Заметка о самочувствии", detail: text,
                                    due: "только что", done: true), at: 0)
    }
}

/// «21 прогулка · 22 прогулки · 25 прогулок» — числа в интерфейсе живые.
func tailsPlural(_ n: Int, _ one: String, _ few: String, _ many: String) -> String {
    plural(n, one, few, many)
}
