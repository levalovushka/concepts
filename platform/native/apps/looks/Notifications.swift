import SwiftUI

struct NotificationsScreen: View {
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                notification("heart.fill", color: t.badge,
                             title: "Аня оценила ваш образ",
                             detail: "Тренч и ботинки · 8 минут назад") {
                    if let outfit = store.outfits.first { nav.push(LooksRoute.outfit(outfit)) }
                }
                RowSeparator(leading: 68)
                notification("bubble.left.fill", color: t.accent,
                             title: "Марк оставил комментарий",
                             detail: "«Шарф отлично собирает весь образ» · 24 минуты назад") {
                    if let outfit = store.outfits.dropFirst().first { nav.push(LooksRoute.outfit(outfit)) }
                }
                GroupGap()
                notification("person.crop.circle.badge.plus", color: Color(hex: "4BB34B"),
                             title: "Лена подписалась на вас",
                             detail: "У вас 14 общих знакомых · сегодня") {
                    nav.push(LooksRoute.profile)
                }
                RowSeparator(leading: 68)
                notification("bookmark.fill", color: Color(hex: "735BF2"),
                             title: "Ваш образ сохранили 12 раз",
                             detail: "Пиджак и широкие брюки · сегодня") {
                    if let outfit = store.outfits.first { nav.push(LooksRoute.outfit(outfit)) }
                }
                GroupGap()
                notification("arrow.left.arrow.right", color: Color(hex: "FF6B47"),
                             title: "Своп уже в эту субботу",
                             detail: "Новая Голландия · начало в 15:00") {
                    nav.push(LooksRoute.nearby)
                }
                RowSeparator(leading: 68)
                notification("person.2.fill", color: Color(hex: "2FAE7B"),
                             title: "Трое знакомых добавили новые вещи",
                             detail: "Аня, Марк и Даша · вчера") {
                    nav.push(LooksRoute.mates)
                }
                RowSeparator(leading: 68)
                notification("sparkles", color: Color(hex: "B44BE0"),
                             title: "Новая подборка по вашему гардеробу",
                             detail: "7 образов с тренчем · вчера") {
                    nav.push(LooksRoute.wardrobe)
                }
                Color.clear.frame(height: 96)
            }
        }
        .background(t.background)
        .navigationTitle("Уведомления")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func notification(_ icon: String, color: Color, title: String, detail: String,
                              action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 17, weight: .semibold)).foregroundStyle(.white)
                    .frame(width: 42, height: 42).background(color, in: Circle())
                VStack(alignment: .leading, spacing: 4) {
                    Text(title).font(.vkBody).foregroundStyle(t.textPrimary)
                    Text(detail).font(.vkMeta).foregroundStyle(t.textSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer(minLength: 0)
            }
            .padding(.horizontal, t.pad).padding(.vertical, 12)
            .contentShape(Rectangle())
        }
        .buttonStyle(HighlightStyle())
    }
}
