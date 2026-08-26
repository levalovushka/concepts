import SwiftUI

// Настройки ВК: белый фон, аватар и имя по центру, обводочная кнопка,
// группы строк с синими контурными иконками, разделённые серой полосой.

struct SettingsScreen: View {
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(Session.self) private var session
    @Environment(\.visualLanguage) private var t
    @State private var push = false
    @State private var dnd = false
    @State private var backgroundFeed = false
    @State private var sheet: SettingsSheet?
    @State private var confirmLogout = false

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                header
                GroupGap(height: 12)

                group {
                    row("bell", "Уведомления", toggle: $push) { on in
                        if on {
                            let ok = await perms.request(.push)
                            if !ok {
                                push = false
                                nav.toast("Уведомления выключены в настройках", once: "push")
                                return
                            }
                            await perms.request(.commnotif)
                            await perms.request(.remotenotif)
                            await perms.request(.fetch)
                        }
                    }
                    RowSeparator()
                    row("moon", "Не беспокоить", toggle: $dnd) { _ in }
                    RowSeparator()
                    row("arrow.clockwise", "Обновлять ленту в фоне", toggle: $backgroundFeed) { enabled in
                        if enabled {
                            await perms.request(.fetch)
                            await perms.request(.bgtask)
                        }
                    }
                    .nativeAction("settings.toggle-background-feed")
                }
                GroupGap()

                group {
                    link("person", "Аккаунт") { sheet = .account }
                    RowSeparator()
                    link("megaphone", "Реклама и данные") { nav.push(LooksRoute.ads) }
                    RowSeparator()
                    link("square.grid.2x2", "Виджет образа дня") {
                        Task {
                            await perms.request(.appgroups)
                            await perms.request(.keychain)
                            nav.toast("Добавьте виджет долгим нажатием на экране «Домой»")
                        }
                    }
                    RowSeparator()
                    link("key", "Пароли и автозаполнение") {
                        Task {
                            await perms.request(.autofill)
                            nav.toast("Включите «Образы» в Настройках → Пароли")
                        }
                    }
                    RowSeparator()
                    link("square.and.arrow.up", "Поделиться в «Образы»") {
                        Task {
                            await perms.request(.shareext)
                            nav.toast("Включите «Образы» в меню «Поделиться» → Ещё")
                        }
                    }
                }
                GroupGap()

                group {
                    link("questionmark.circle", "Помощь") { sheet = .help }
                    RowSeparator()
                    link("doc.text", "Пользовательское соглашение") { sheet = .agreement }
                    RowSeparator()
                    VKRow(title: "Версия", icon: "info.circle", value: "1.0", chevron: false)
                }
                GroupGap()

                group {
                    Button { confirmLogout = true } label: {
                        Text("Выйти").font(.vkRow).foregroundStyle(t.palette.badge)
                            .frame(maxWidth: .infinity).frame(height: 48)
                    }
                    .buttonStyle(HighlightStyle())
                }
                Color.clear.frame(height: 90)
            }
        }
        .background(t.palette.background)
        .vkNavigation("Настройки")
        .sheet(item: $sheet) { destination in
            switch destination {
            case .account: AccountSettingsSheet()
            case .help: SettingsDocumentSheet(title: "Помощь", text: "Расскажите, что не получилось. Ответим в приложении и на почту аккаунта.")
            case .agreement: SettingsDocumentSheet(title: "Пользовательское соглашение", text: "Публикуйте только свои материалы, уважайте участников и не используйте чужие вещи без согласия владельца.")
            }
        }
        .confirmationDialog("Выйти из аккаунта?", isPresented: $confirmLogout) {
            Button("Выйти", role: .destructive) { session.signOut() }
            Button("Отмена", role: .cancel) {}
        }
    }

    private var header: some View {
        Button { sheet = .account } label: {
            HStack(spacing: 12) {
                Avatar(name: "Ника Орлова", size: 52)
                VStack(alignment: .leading, spacing: 3) {
                    Text("Ника Орлова").font(.role(.cardTitle))
                        .foregroundStyle(t.palette.textPrimary)
                    Text("nika@mail.ru").font(.role(.meta))
                        .foregroundStyle(t.palette.textSecondary)
                }
                Spacer()
                Text("Управление")
                    .font(.role(.pill)).foregroundStyle(t.palette.accent)
                Image(systemName: t.icon(.disclosure))
                    .font(.system(size: 13, weight: .semibold)).foregroundStyle(t.palette.textTertiary)
            }
            .padding(.horizontal, t.spacing.contentInset)
            .frame(minHeight: 76)
        }
        .buttonStyle(HighlightStyle())
    }

    @ViewBuilder private func group<C: View>(@ViewBuilder _ content: () -> C) -> some View {
        VStack(spacing: 0) { content() }.background(t.palette.background)
    }

    private func link(_ icon: String, _ title: String,
                      action: @escaping () -> Void) -> some View {
        Button(action: action) { VKRow(title: title, icon: icon) }
            .buttonStyle(HighlightStyle())
    }

    private func row(_ icon: String, _ title: String, toggle: Binding<Bool>,
                     action: @escaping (Bool) async -> Void) -> some View {
        VKRow(title: title, icon: icon, chevron: false, toggle: toggle)
            .onChange(of: toggle.wrappedValue) { _, v in Task { await action(v) } }
    }
}

private enum SettingsSheet: String, Identifiable {
    case account, help, agreement
    var id: String { rawValue }
}

private struct AccountSettingsSheet: View {
    @Environment(\.dismiss) private var dismiss
    @State private var email = "nika@mail.ru"

    var body: some View {
        NavigationStack {
            Form {
                Section("Вход") { TextField("Почта", text: $email).textContentType(.emailAddress) }
                Section("Профиль") {
                    LabeledContent("Имя", value: "Ника Орлова")
                    LabeledContent("Статус", value: "Активен")
                }
            }
            .navigationTitle("Аккаунт")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .confirmationAction) { Button("Готово") { dismiss() } } }
        }
    }
}

private struct SettingsDocumentSheet: View {
    let title: String
    let text: String
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                Text(text).font(.role(.rowTitle)).frame(maxWidth: .infinity, alignment: .leading).padding(20)
            }
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .confirmationAction) { Button("Готово") { dismiss() } } }
        }
        .presentationDetents([.medium, .large])
    }
}
