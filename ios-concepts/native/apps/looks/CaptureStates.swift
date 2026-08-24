import SwiftUI

struct LooksCaptureSurface<Content: View>: View {
    let surface: String?
    let state: String?
    @ViewBuilder let content: Content
    @State private var revealProduct = false

    init(surface: String?, state: String?, @ViewBuilder content: () -> Content) {
        self.surface = surface
        self.state = state
        self.content = content()
    }

    var body: some View {
        let surface = surface ?? "unknown"
        let state = state ?? "default"
        Group {
            if !revealProduct,
               NativeCaptureSurfaceOwnership.allowsSyntheticPresentation(for: surface),
               let presentation = LooksCapturePresentation.resolve(surface: surface, state: state) {
                LooksProductStateView(presentation: presentation) { revealProduct = true }
            } else {
                content
            }
        }
        .nativeSurface(surface)
        .background {
            GeometryReader { geometry in
                Color.clear.task {
                    if ShotMode.screen == surface {
                        CaptureIdentity.report(surface: surface, state: state,
                                               safeAreaTop: geometry.safeAreaInsets.top,
                                               contentMinY: geometry.frame(in: .global).minY)
                    }
                }
            }
        }
    }
}

private struct LooksCapturePresentation {
    enum Kind { case empty, loading, error, success, permission, system }
    let kind: Kind
    let title: String
    let detail: String
    let action: String?
    var nativeActionID: String? = nil
    var contextKey: String = ""

    static func resolve(surface: String, state: String) -> Self? {
        // Default product screens stay real. Only declared alternative states and
        // OS-owned surfaces are represented here.
        let key = "\(surface).\(state)"
        let states: [String: Self] = [
            "subtitles.error": .init(kind: .error, title: "Не удалось распознать речь", detail: "Проверьте звук в клипе или добавьте текст вручную.", action: "Добавить вручную"),
            "subtitles.success": .init(kind: .success, title: "Субтитры готовы", detail: "Проверьте текст перед публикацией клипа.", action: "Продолжить"),
            "background.loading": .init(kind: .loading, title: "Обновляем ленту", detail: "Новые публикации появятся без перезапуска приложения.", action: nil),
            "background.error": .init(kind: .error, title: "Фоновое обновление недоступно", detail: "Лента обновится при следующем открытии приложения.", action: "Открыть настройки"),
            "shareext.success": .init(kind: .success, title: "Сохранено в черновики", detail: "Материал ждёт вас в создании публикации.", action: "Открыть «Образы»")
        ]
        if var value = states[key] {
            value.contextKey = key
            return value
        }

        if state == "denied" {
            let copy: (String, String) = switch surface {
            case "camera": ("Нет доступа к камере", "Разрешите камеру в настройках iPhone или выберите готовое фото.")
            case "voice": ("Нет доступа к микрофону", "Можно отправить текстовое сообщение без записи голоса.")
            case "mates": ("Нет доступа к контактам", "Поиск по имени продолжает работать без адресной книги.")
            case "lock": ("Face ID недоступен", "Введите код iPhone или измените защиту в настройках.")
            default: ("Доступ отключён", "Разрешение можно изменить в настройках iPhone.")
            }
            return .init(kind: .permission, title: copy.0, detail: copy.1,
                         action: "Открыть настройки", contextKey: "\(surface).denied")
        }

        let systemDefaults: [String: Self] = [
            "camera": .init(kind: .system, title: "Добавить фото", detail: "Снимите образ или выберите фотографию из медиатеки.", action: "Открыть камеру", nativeActionID: "camera.capture-photo"),
            "voice": .init(kind: .system, title: "Голосовое сообщение", detail: "Удерживайте кнопку записи, затем прослушайте сообщение перед отправкой.", action: "Начать запись"),
            "widget": .init(kind: .system, title: "Виджет «Образ дня»", detail: "Добавьте виджет на экран «Домой», чтобы видеть сохранённые сочетания.", action: "Как добавить"),
            "fill": .init(kind: .system, title: "Быстрый вход", detail: "Используйте сохранённую почту и код подтверждения.", action: "Войти"),
            "subtitles": .init(kind: .system, title: "Субтитры к клипу", detail: "Распознаем речь и дадим проверить текст перед публикацией.", action: "Опубликовать клип", nativeActionID: "subtitles.publish-captioned-clip"),
            "background": .init(kind: .system, title: "Обновление в фоне", detail: "Новые публикации будут готовы к следующему открытию.", action: "Вернуться к разбору", nativeActionID: "background.return-to-talk"),
            "shareext": .init(kind: .system, title: "Сохранить в «Образы»", detail: "Ссылка и изображение попадут в черновик публикации.", action: "Сохранить в черновик", nativeActionID: "shareext.save-shared-draft")
        ]
        guard var value = systemDefaults[surface] else { return nil }
        value.contextKey = "\(surface).default"
        return value
    }
}

private struct LooksProductStateView: View {
    let presentation: LooksCapturePresentation
    let revealProduct: () -> Void
    @Environment(\.visualLanguage) private var theme
    @Environment(Permissions.self) private var permissions
    @Environment(Nav.self) private var nav
    @Environment(LooksStore.self) private var store
    @State private var outcomeText: String?

    var body: some View {
        VStack(spacing: 0) {
            Spacer(minLength: 72)
            Group {
                if presentation.kind == .loading {
                    ProgressView().controlSize(.large)
                } else {
                    Image(systemName: icon)
                        .font(.system(size: 32, weight: .regular))
                        .foregroundStyle(iconColor)
                }
            }
            .frame(width: 48, height: 48)
            Text(presentation.title)
                .font(.role(.section))
                .foregroundStyle(theme.palette.textPrimary)
                .multilineTextAlignment(.center)
                .padding(.top, 18)
            Text(presentation.detail)
                .font(.role(.body))
                .foregroundStyle(theme.palette.textSecondary)
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
                .padding(.top, 8)
            if let action = presentation.action {
                Button(action) {
                    Task { await performAction() }
                }
                .modifier(LooksOptionalNativeAction(id: presentation.nativeActionID))
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundStyle(theme.palette.accent)
                    .frame(minHeight: 44)
                    .padding(.top, 10)
            }
            if let outcomeText {
                Text(outcomeText)
                    .font(.role(.meta))
                    .foregroundStyle(theme.palette.textSecondary)
                    .transition(.opacity)
            }
            Spacer()
        }
        .padding(.horizontal, 32)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(theme.palette.background)
    }

    private var icon: String {
        switch presentation.kind {
        case .empty: "tray"
        case .error: "exclamationmark.circle"
        case .success: "checkmark.circle"
        case .permission: "hand.raised"
        case .system: "sparkles"
        case .loading: "arrow.triangle.2.circlepath"
        }
    }

    private var iconColor: Color {
        switch presentation.kind {
        case .error: theme.palette.danger
        case .success: theme.palette.positive
        default: theme.palette.textSecondary
        }
    }

    @MainActor private func performAction() async {
        switch presentation.contextKey {
        case "subtitles.error", "subtitles.success": revealProduct()
        case "background.error":
            if let url = URL(string: UIApplication.openSettingsURLString) { await UIApplication.shared.open(url) }
        case "shareext.success": nav.present(cover: LooksRoute.create)
        case let key where key.hasSuffix(".denied"):
            if let url = URL(string: UIApplication.openSettingsURLString) { await UIApplication.shared.open(url) }
        case "camera.default", "voice.default": revealProduct()
        case "subtitles.default":
            outcomeText = await permissions.request(.speech) ? "Клип опубликован" : "Распознавание недоступно"
        case "background.default":
            _ = await permissions.request(.bgtask)
            nav.push(LooksRoute.talk)
        case "shareext.default": outcomeText = "Черновик сохранён"
        case "widget.default": outcomeText = "Откройте галерею виджетов на экране «Домой»"
        case "fill.default": outcomeText = "Сохранённый аккаунт выбран"
        default:
            outcomeText = "Действие пока недоступно"
        }
    }
}

private struct LooksOptionalNativeAction: ViewModifier {
    let id: String?
    func body(content: Content) -> some View {
        if let id { content.nativeAction(id) }
        else { content }
    }
}
