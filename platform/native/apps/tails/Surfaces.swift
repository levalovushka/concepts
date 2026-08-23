import SwiftUI

// Заготовки поверхностей из манифеста: у каждой объявлены назначение,
// композиция рецепта и состояния. Заполняются руками — каркас только
// задаёт, что на экране обязано быть.

// phone — Войти
// Композиция рецепта: navigation · value · form · primary-action · secondary-action
// Состояния: default, loading, error
struct TailsSurface_phone: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: navigation
                // TODO region: value
                // TODO region: form
                // TODO region: primary-action
                // TODO region: secondary-action
                Text("Вход по почте").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// code — Подтвердить вход
// Композиция рецепта: navigation · value · form · primary-action · secondary-action
// Состояния: default, loading, error
struct TailsSurface_code: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: navigation
                // TODO region: value
                // TODO region: form
                // TODO region: primary-action
                // TODO region: secondary-action
                Text("Код из письма").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// codefail — Показать ошибку OTP и вернуть к вводу
// Композиция рецепта: navigation · value · form · primary-action · secondary-action
// Состояния: default, loading, error
struct TailsSurface_codefail: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: navigation
                // TODO region: value
                // TODO region: form
                // TODO region: primary-action
                // TODO region: secondary-action
                Text("Неверный код").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// home — Смотреть друзей
// Композиция рецепта: root-header · context · filters · collection
// Состояния: default, empty
struct TailsSurface_home: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: root-header
                // TODO region: context
                // TODO region: filters
                // TODO region: collection
                Text("Главная").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// pet — Познакомиться
// Композиция рецепта: navigation · summary · content · next-action
// Состояния: default
struct TailsSurface_pet: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: navigation
                // TODO region: summary
                // TODO region: content
                // TODO region: next-action
                Text("Профиль питомца").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// nearby — Найти прогулку
// Композиция рецепта: root-header · context · filters · collection
// Состояния: default, empty
struct TailsSurface_nearby: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: root-header
                // TODO region: context
                // TODO region: filters
                // TODO region: collection
                Text("Рядом").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// walk — Встретиться
// Композиция рецепта: navigation · summary · content · next-action
// Состояния: default
struct TailsSurface_walk: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: navigation
                // TODO region: summary
                // TODO region: content
                // TODO region: next-action
                Text("Прогулка").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// create — Опубликовать момент
// Композиция рецепта: root-header · context · primary-content
// Состояния: default, error, success
struct TailsSurface_create: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: root-header
                // TODO region: context
                // TODO region: primary-content
                Text("Новый момент").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// camera — Снять момент
// Композиция рецепта: navigation · primary-content · next-action
// Состояния: default, denied
struct TailsSurface_camera: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: navigation
                // TODO region: primary-content
                // TODO region: next-action
                Text("Камера").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// media — Выбрать фото
// Композиция рецепта: navigation · primary-content · next-action
// Состояния: default
struct TailsSurface_media: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: navigation
                // TODO region: primary-content
                // TODO region: next-action
                Text("Фото").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// places — Выбрать площадку для прогулки
// Композиция рецепта: root-header · context · filters · collection
// Состояния: default, empty
struct TailsSurface_places: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: root-header
                // TODO region: context
                // TODO region: filters
                // TODO region: collection
                Text("Площадки рядом").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// chats — Вернуться к диалогам
// Композиция рецепта: root-header · context · filters · collection
// Состояния: default, empty
struct TailsSurface_chats: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: root-header
                // TODO region: context
                // TODO region: filters
                // TODO region: collection
                Text("Сообщения").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// chat — Договориться
// Композиция рецепта: navigation · summary · content · next-action
// Состояния: default
struct TailsSurface_chat: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: navigation
                // TODO region: summary
                // TODO region: content
                // TODO region: next-action
                Text("Чат").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// voice — Записать голос
// Композиция рецепта: navigation · primary-content · next-action
// Состояния: default, denied
struct TailsSurface_voice: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: navigation
                // TODO region: primary-content
                // TODO region: next-action
                Text("Голосовое").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// profile — Показать профиль питомца и его прогулки
// Композиция рецепта: root-header · context · primary-content
// Состояния: default
struct TailsSurface_profile: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: root-header
                // TODO region: context
                // TODO region: primary-content
                Text("Профиль").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// settings — Держать доступы и системные функции под рукой
// Композиция рецепта: navigation · primary-content · next-action
// Состояния: default
struct TailsSurface_settings: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: navigation
                // TODO region: primary-content
                // TODO region: next-action
                Text("Настройки").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// widget — Поставить виджет ближайшей прогулки на экран «Домой»
// Композиция рецепта: navigation · primary-content · next-action
// Состояния: default
struct TailsSurface_widget: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: navigation
                // TODO region: primary-content
                // TODO region: next-action
                Text("Виджет на экране «Домой»").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// fill — Войти на сайт сохранённым в «Хвостах» входом
// Композиция рецепта: navigation · primary-content · next-action
// Состояния: default
struct TailsSurface_fill: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: navigation
                // TODO region: primary-content
                // TODO region: next-action
                Text("Автозаполнение на сайте").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// refresh — Проверить, что фоновое обновление работает
// Композиция рецепта: navigation · primary-content · next-action
// Состояния: default
struct TailsSurface_refresh: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: navigation
                // TODO region: primary-content
                // TODO region: next-action
                Text("Обновление в фоне").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// mates — Найти знакомых среди тех, кто уже гуляет рядом
// Композиция рецепта: root-header · context · filters · collection
// Состояния: default, empty, denied
struct TailsSurface_mates: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: root-header
                // TODO region: context
                // TODO region: filters
                // TODO region: collection
                Text("Контакты в «Хвостах»").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// ads — Объяснить обмен до системного запроса ATT
// Композиция рецепта: navigation · primary-content · next-action
// Состояния: default
struct TailsSurface_ads: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: navigation
                // TODO region: primary-content
                // TODO region: next-action
                Text("Реклама вместо подписки").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// lock — Закрыть ветпаспорт и адрес выгула биометрией
// Композиция рецепта: navigation · primary-content · next-action
// Состояния: default, denied
struct TailsSurface_lock: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: navigation
                // TODO region: primary-content
                // TODO region: next-action
                Text("Замок на ветпаспорте").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// vetnote — Надиктовать наблюдение и положить его в карточку питомца
// Композиция рецепта: navigation · primary-content · next-action
// Состояния: default, error, success
struct TailsSurface_vetnote: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: navigation
                // TODO region: primary-content
                // TODO region: next-action
                Text("Заметка о самочувствии").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// course — Слушать занятие и продолжать при погашенном экране
// Композиция рецепта: navigation · primary-content · next-action
// Состояния: default, loading, error
struct TailsSurface_course: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: navigation
                // TODO region: primary-content
                // TODO region: next-action
                Text("Курс послушания").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// background — Показать, что занятие продолжается при погашенном экране
// Композиция рецепта: navigation · primary-content · next-action
// Состояния: default, loading, error
struct TailsSurface_background: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: navigation
                // TODO region: primary-content
                // TODO region: next-action
                Text("Экран погас").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// call — Договориться о передержке, не раскрывая номер
// Композиция рецепта: navigation · primary-content · next-action
// Состояния: default
struct TailsSurface_call: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: navigation
                // TODO region: primary-content
                // TODO region: next-action
                Text("Звонок догситтеру").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// vaccine — Собрать сроки прививок и положить их в календарь
// Композиция рецепта: navigation · summary · content · next-action
// Состояния: default
struct TailsSurface_vaccine: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: navigation
                // TODO region: summary
                // TODO region: content
                // TODO region: next-action
                Text("Прививки и обработки").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// netqr — Подключиться к гостевой сети дог-парка
// Композиция рецепта: navigation · primary-content · next-action
// Состояния: default, error
struct TailsSurface_netqr: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: navigation
                // TODO region: primary-content
                // TODO region: next-action
                Text("Сеть площадки по QR").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}

// shareext — Принять ссылку или кадр из другого приложения в черновик
// Композиция рецепта: navigation · primary-content · next-action
// Состояния: default, success
struct TailsSurface_shareext: View {
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // TODO region: navigation
                // TODO region: primary-content
                // TODO region: next-action
                Text("Поделиться в «Хвосты»").textStyle(.section)
                    .padding(.horizontal, t.pad).padding(.vertical, 12)
            }
        }
        .background(t.background)
    }
}
