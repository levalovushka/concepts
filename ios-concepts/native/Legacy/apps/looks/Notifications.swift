import SwiftUI

struct NotificationsScreen: View {
    var captureState: String? = nil
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.visualLanguage) private var t

    var body: some View {
        ScrollView {
            if captureState == "empty" {
                NativeStatePanel(kind: .empty,
                                 title: "Новых уведомлений нет",
                                 detail: "Реакции, комментарии и приглашения появятся здесь.",
                                 placement: .page)
                    .padding(.horizontal, t.spacing.contentInset)
                    .padding(.top, 24)
            } else {
              LazyVStack(spacing: 0) {
                notification("heart.fill", unread: showsUnread,
                             title: "Аня оценила ваш образ",
                             detail: "Тренч и ботинки · 8 минут назад") {
                    if let outfit = store.outfits.first { nav.push(LooksRoute.outfit(outfit)) }
                }
                .nativeAction("notifications.open-notification")
                RowSeparator(leading: 68)
                notification("bubble.left.fill", unread: showsUnread,
                             title: "Марк оставил комментарий",
                             detail: "«Шарф отлично собирает весь образ» · 24 минуты назад") {
                    if let outfit = store.outfits.dropFirst().first { nav.push(LooksRoute.outfit(outfit)) }
                }
                GroupGap()
                notification("person.crop.circle.badge.plus", unread: false,
                             title: "Лена подписалась на вас",
                             detail: "У вас 14 общих знакомых · сегодня") {
                    nav.push(LooksRoute.author("Лена Гор"))
                }
                RowSeparator(leading: 68)
                notification("bookmark.fill", unread: false,
                             title: "Ваш образ сохранили 12 раз",
                             detail: "Пиджак и широкие брюки · сегодня") {
                    if let outfit = store.outfits.first { nav.push(LooksRoute.outfit(outfit)) }
                }
                GroupGap()
                notification("arrow.left.arrow.right", unread: false,
                             title: "Обмен вещами уже в эту субботу",
                             detail: "Новая Голландия · начало в 15:00") {
                    nav.push(LooksRoute.nearby)
                }
                RowSeparator(leading: 68)
                notification("person.2.fill", unread: false,
                             title: "Трое знакомых добавили новые вещи",
                             detail: "Аня, Марк и Даша · вчера") {
                    nav.push(LooksRoute.mates)
                }
                RowSeparator(leading: 68)
                notification("sparkles", unread: false,
                             title: "Новая подборка по вашему гардеробу",
                             detail: "7 образов с тренчем · вчера") {
                    nav.push(LooksRoute.wardrobe)
                }
                Color.clear.frame(height: 96)
              }
            }
        }
        .background(t.palette.background)
        .vkNavigation("Уведомления")
        .onAppear { store.unreadNotifications = 0 }
    }

    private var showsUnread: Bool { captureState != "read" }

    private func notification(_ icon: String, unread: Bool,
                              title: String, detail: String,
                              action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 20, weight: .regular)).foregroundStyle(t.palette.accent)
                    .frame(width: 42, height: 42)
                VStack(alignment: .leading, spacing: 4) {
                    Text(title).font(.vkBody).foregroundStyle(t.palette.textPrimary)
                    Text(detail).font(.vkMeta).foregroundStyle(t.palette.textSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer(minLength: 0)
                if unread {
                    Circle().fill(t.palette.accent).frame(width: 8, height: 8).padding(.top, 7)
                        .accessibilityHidden(true)
                }
            }
            .padding(.horizontal, t.spacing.contentInset).padding(.vertical, 12)
            .contentShape(Rectangle())
        }
        .buttonStyle(HighlightStyle())
    }
}
