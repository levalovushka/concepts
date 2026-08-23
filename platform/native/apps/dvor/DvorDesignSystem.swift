import SwiftUI

extension Permissions {
    func requestCameraForEvidence() async -> Bool {
        await request(.camera)
    }

    func requestHouseNotifications() async -> Bool {
        await request(.push)
    }

    /// Одна дверь для фонового обновления: пуш дому, регистрация в APNs и
    /// фоновая задача — это одна продуктовая настройка, а не три ключа.
    func requestBackgroundHouseUpdates() async -> Bool {
        guard await requestHouseNotifications() else { return false }
        let remote = await request(.remotenotif)
        let fetch = await request(.fetch)
        let task = await request(.bgtask)
        return remote && fetch && task
    }

    func requestMessageNotifications() async -> Bool {
        guard await requestHouseNotifications() else { return false }
        return await request(.commnotif)
    }

    func requestMeterDeadlineUpdates() async -> Bool {
        guard await requestHouseNotifications() else { return false }
        let content = UNMutableNotificationContent()
        content.title = "Пора записать показания"
        content.body = "До срока осталось два дня. Проверьте воду и электричество."
        content.sound = .default
        let trigger = UNCalendarNotificationTrigger(
            dateMatching: DateComponents(day: 23, hour: 10),
            repeats: true
        )
        let request = UNNotificationRequest(
            identifier: "dvor.meters.deadline",
            content: content,
            trigger: trigger
        )
        do {
            try await UNUserNotificationCenter.current().add(request)
            return true
        } catch { return false }
    }

    func cancelMeterDeadlineUpdates() {
        UNUserNotificationCenter.current().removePendingNotificationRequests(
            withIdentifiers: ["dvor.meters.deadline"]
        )
    }

    func connectToGuestNetwork(password: String) async -> Bool {
        await applyGuestNetwork("Dvor-Guest|\(password)")
    }

    func connectToGuestNetwork(qrPayload: String) async -> Bool {
        let fields = parseWiFiPayload(qrPayload)
        guard let ssid = fields["S"], ssid == "Dvor-Guest" else { return false }
        let password = fields["P"]
        return await applyGuestNetwork(password.map { "\(ssid)|\($0)" } ?? ssid)
    }

    func guestNetworkName(qrPayload: String) -> String? {
        let fields = parseWiFiPayload(qrPayload)
        guard fields["S"] == "Dvor-Guest" else { return nil }
        return fields["S"]
    }

    private func parseWiFiPayload(_ payload: String) -> [String: String] {
        guard payload.hasPrefix("WIFI:") else { return [:] }
        var fields: [String: String] = [:]
        var token = ""
        var escaped = false
        var tokens: [String] = []
        for character in payload.dropFirst(5) {
            if escaped { token.append(character); escaped = false }
            else if character == "\\" { escaped = true }
            else if character == ";" { tokens.append(token); token = "" }
            else { token.append(character) }
        }
        if !token.isEmpty { tokens.append(token) }
        for token in tokens {
            guard let separator = token.firstIndex(of: ":") else { continue }
            fields[String(token[..<separator])] = String(token[token.index(after: separator)...])
        }
        return fields
    }

    private func applyGuestNetwork(_ configuration: String) async -> Bool {
        await request(.hotspot, value: configuration)
    }
}

enum DvorStyle {
    // Four-point optical grid shared by product and reference compositions.
    static let space1: CGFloat = 4
    static let space2: CGFloat = 8
    static let space3: CGFloat = 12
    static let space4: CGFloat = 16
    static let space6: CGFloat = 24
    static let hitTarget: CGFloat = 44
    static let contentInset: CGFloat = 16
    static let sectionGap: CGFloat = 8
    static let page = Color(hex: "F2F3F5")
    static let card = Color.white
    static let ink = Color(hex: "0B0B0C")
    static let secondary = Color(hex: "6D7885")
    static let muted = Color(hex: "6E7887")
    static let quiet = Color(hex: "E8EAF0")
    static let quietInside = Color(hex: "EFF1F5")
    static let line = Color(hex: "E1E3E6")
    static let warningText = Color(hex: "A8690A")
    static let inset: CGFloat = contentInset
    static let gap: CGFloat = sectionGap
    static let controlRadius: CGFloat = 8
    static let cardRadius: CGFloat = 0
}

// MARK: - Semantic feedback

struct AppStatePanel: View {
    enum Kind {
        case empty, loading, success, warning, error

        var icon: String {
            switch self {
            case .empty: "tray"
            case .loading: "arrow.triangle.2.circlepath"
            case .success: "checkmark.circle.fill"
            case .warning: "exclamationmark.triangle.fill"
            case .error: "xmark.circle.fill"
            }
        }
    }

    let kind: Kind
    let title: String
    let detail: String
    var icon: String? = nil
    var actionTitle: String? = nil
    var action: (() -> Void)? = nil
    @Environment(\.theme) private var t

    private var tint: Color {
        switch kind {
        case .empty, .loading: t.textSecondary
        case .success: t.positive
        case .warning: DvorStyle.warningText
        case .error: t.danger
        }
    }

    var body: some View {
        HStack(alignment: .top, spacing: DvorStyle.space3) {
            Group {
                if kind == .loading {
                    ProgressView().tint(tint)
                } else {
                    Image(systemName: icon ?? kind.icon)
                        .font(.system(size: 18, weight: .semibold))
                }
            }
            .foregroundStyle(tint)
            .frame(width: 24, height: 24)

            VStack(alignment: .leading, spacing: DvorStyle.space1) {
                Text(title)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(t.textPrimary)
                Text(detail)
                    .font(.system(size: 13))
                    .foregroundStyle(t.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
                if let actionTitle, let action {
                    Button(actionTitle, action: action)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(t.accent)
                        .frame(minHeight: DvorStyle.hitTarget)
                }
            }
            Spacer(minLength: 0)
        }
        .padding(DvorStyle.space3)
        // Semantic colour belongs to the status glyph, not to a decorative card.
        // Keeping the surface neutral makes feedback feel native to the VK shell
        // and prevents a feed of unrelated green, amber and red blocks.
        .background(t.card, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(t.separator, lineWidth: 1)
        }
        .accessibilityElement(children: .combine)
    }
}

// MARK: - Stateful actions

struct DvorPrimaryButton: View {
    let title: String
    var loadingTitle: String? = nil
    var isLoading = false
    var isDisabled = false
    var icon: String? = nil
    let action: () -> Void
    @Environment(\.theme) private var t

    var body: some View {
        Button(action: action) {
            HStack(spacing: DvorStyle.space2) {
                if isLoading {
                    ProgressView().tint(.white).controlSize(.small)
                } else if let icon {
                    Image(systemName: icon).font(.system(size: 16, weight: .semibold))
                }
                Text(isLoading ? (loadingTitle ?? title) : title)
                    .font(.system(size: 16, weight: .semibold))
            }
            .foregroundStyle(isDisabled ? t.textSecondary : .white)
            .frame(maxWidth: .infinity)
            .frame(height: 46)
            .background(
                isDisabled ? t.fill : t.accent,
                in: RoundedRectangle(cornerRadius: 10, style: .continuous)
            )
        }
        .buttonStyle(PressableStyle())
        .disabled(isDisabled || isLoading)
        .accessibilityValue(isLoading ? "Выполняется" : "")
    }
}

struct DvorPageState: View {
    let kind: AppStatePanel.Kind
    let title: String
    let detail: String
    var icon: String? = nil
    var actionTitle: String? = nil
    var action: (() -> Void)? = nil

    var body: some View {
        VStack {
            Spacer(minLength: 44)
            AppStatePanel(kind: kind, title: title, detail: detail, icon: icon,
                          actionTitle: actionTitle, action: action)
            Spacer(minLength: 88)
        }
        .frame(maxWidth: .infinity, minHeight: 360)
        .padding(.horizontal, DvorStyle.space4)
    }
}

// MARK: - Navigation chrome

struct DvorChromeAction {
    let title: String
    var icon: String? = nil
    var isDisabled = false
    var nativeActionID: String? = nil
    let action: () -> Void
}

private struct DvorChromeBar: View {
    let title: String
    let leading: DvorChromeAction?
    let trailing: DvorChromeAction?
    @Environment(\.theme) private var t

    var body: some View {
        ZStack {
            Text(title).font(.vkNavTitle).foregroundStyle(t.textPrimary).lineLimit(1)
                .padding(.horizontal, 76)
            HStack {
                chromeAction(leading)
                Spacer()
                chromeAction(trailing)
            }
        }
        .padding(.horizontal, DvorStyle.space1)
        .frame(height: 52)
        .background(t.background)
        .overlay(alignment: .bottom) { t.separator.frame(height: 0.5) }
    }

    @ViewBuilder private func chromeAction(_ item: DvorChromeAction?) -> some View {
        if let item {
            Button(action: item.action) {
                Group {
                    if let icon = item.icon { Image(systemName: icon).font(.system(size: 19, weight: .semibold)) }
                    else { Text(item.title).font(.system(size: 15, weight: .medium)) }
                }
                .frame(minWidth: DvorStyle.hitTarget, minHeight: DvorStyle.hitTarget)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .foregroundStyle(t.accent)
            .opacity(item.isDisabled ? 0.42 : 1)
            .disabled(item.isDisabled)
            .accessibilityLabel(item.title)
            .nativeAction(item.nativeActionID ?? "")
        } else {
            Color.clear.frame(width: DvorStyle.hitTarget, height: DvorStyle.hitTarget)
        }
    }
}

struct DvorRootChrome: View {
    let title: String
    var leading: DvorChromeAction? = nil
    var trailing: DvorChromeAction? = nil
    var body: some View { DvorChromeBar(title: title, leading: leading, trailing: trailing) }
}

struct DvorPushChrome: View {
    let title: String
    let onBack: () -> Void
    var trailing: DvorChromeAction? = nil
    var body: some View {
        DvorChromeBar(
            title: title,
            leading: DvorChromeAction(title: "Назад", icon: "chevron.left", action: onBack),
            trailing: trailing
        )
    }
}

struct DvorModalChrome: View {
    let title: String
    let onCancel: () -> Void
    var cancelActionID: String? = nil
    var done: DvorChromeAction? = nil
    var body: some View {
        DvorChromeBar(
            title: title,
            leading: DvorChromeAction(title: "Отмена", nativeActionID: cancelActionID, action: onCancel),
            trailing: done
        )
    }
}

struct DvorScreenIntro: View {
    let title: String
    var detail: String? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(title)
                .font(.system(size: 20, weight: .bold))
                .foregroundStyle(DvorStyle.ink)
            if let detail {
                Text(detail)
                    .font(.system(size: 15))
                    .foregroundStyle(DvorStyle.secondary)
                    .lineSpacing(2)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct DvorFormField: View {
    let title: String
    let placeholder: String
    @Binding var text: String
    var keyboard: UIKeyboardType = .default
    var error: String? = nil
    var textContentType: UITextContentType? = nil
    var isDisabled = false
    var submitLabel: SubmitLabel = .next
    var onSubmit: (() -> Void)? = nil
    @Environment(\.theme) private var t

    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            Text(title)
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(error == nil ? t.textPrimary : t.danger)
            TextField(placeholder, text: $text)
                .keyboardType(keyboard)
                .textContentType(textContentType)
                .textInputAutocapitalization(keyboard == .emailAddress ? .never : .sentences)
                .autocorrectionDisabled(keyboard == .emailAddress || keyboard == .numberPad)
                .submitLabel(submitLabel)
                .onSubmit { onSubmit?() }
                .disabled(isDisabled)
                .font(.system(size: 16))
                .padding(.horizontal, 12)
                .frame(height: 46)
                .background(t.fill, in: RoundedRectangle(cornerRadius: DvorStyle.controlRadius))
                .overlay {
                    if error != nil {
                        RoundedRectangle(cornerRadius: DvorStyle.controlRadius)
                            .stroke(t.danger.opacity(0.75), lineWidth: 1)
                    }
                }
            if let error {
                Label(error, systemImage: "exclamationmark.circle.fill")
                    .font(.system(size: 13))
                    .foregroundStyle(t.danger)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }
}

struct DvorOTPField: View {
    @Binding var code: String
    var length = 6
    var error: String? = nil
    var isDisabled = false
    @FocusState private var focused: Bool
    @Environment(\.theme) private var t

    var body: some View {
        VStack(alignment: .leading, spacing: DvorStyle.space2) {
            Text("Код из письма")
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(error == nil ? t.textPrimary : t.danger)
            ZStack {
                HStack(spacing: DvorStyle.space2) {
                    ForEach(0..<length, id: \.self) { index in
                        Text(character(at: index))
                            .font(.system(size: 20, weight: .semibold, design: .rounded))
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                            .background(t.fill, in: RoundedRectangle(cornerRadius: 10, style: .continuous))
                            .overlay {
                                RoundedRectangle(cornerRadius: 10, style: .continuous)
                                    .stroke(cellColor(at: index), lineWidth: index == code.count && focused ? 1.5 : 1)
                            }
                    }
                }
                TextField("", text: $code)
                    .keyboardType(.numberPad)
                    .textContentType(.oneTimeCode)
                    .focused($focused)
                    .disabled(isDisabled)
                    .opacity(0.01)
                    .onChange(of: code) { _, value in
                        code = String(value.filter(\.isNumber).prefix(length))
                    }
            }
            .contentShape(Rectangle())
            .onTapGesture { focused = true }
            .accessibilityElement(children: .ignore)
            .accessibilityLabel("Код из письма")
            .accessibilityValue(code.isEmpty ? "Не введён" : "Введено цифр: \(code.count) из \(length)")
            if let error {
                Label(error, systemImage: "exclamationmark.circle.fill")
                    .font(.system(size: 13)).foregroundStyle(t.danger)
            }
        }
        .onAppear { if code.isEmpty { focused = true } }
    }

    private func character(at index: Int) -> String {
        guard index < code.count else { return "" }
        let position = code.index(code.startIndex, offsetBy: index)
        return String(code[position])
    }

    private func cellColor(at index: Int) -> Color {
        if error != nil { return t.danger.opacity(0.75) }
        if index == code.count && focused { return t.accent }
        return t.separator
    }
}

struct DvorCard<Content: View>: View {
    @ViewBuilder let content: Content

    var body: some View {
        content
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(DvorStyle.card)
    }
}

struct DvorSectionTitle: View {
    let title: String

    var body: some View {
        Text(title)
            .font(.system(size: 13, weight: .semibold))
            .foregroundStyle(DvorStyle.secondary)
            .padding(.horizontal, 16)
            .padding(.top, 11)
            .padding(.bottom, 7)
            .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct DvorRow: View {
    let title: String
    var subtitle: String? = nil
    var icon: String? = nil
    var value: String? = nil
    var valueIsWarning = false
    var chevron = true
    var toggle: Binding<Bool>? = nil

    var body: some View {
        HStack(spacing: 12) {
            if let icon {
                Image(systemName: icon)
                    .font(.system(size: 20, weight: .regular))
                    .foregroundStyle(Color.accentColor)
                    .frame(width: 28)
            }
            VStack(alignment: .leading, spacing: 1) {
                Text(title).font(.system(size: 15, weight: .semibold)).foregroundStyle(DvorStyle.ink)
                if let subtitle {
                    Text(subtitle).font(.system(size: 14)).foregroundStyle(DvorStyle.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            Spacer(minLength: 6)
            if let value {
                Text(value).font(.system(size: 15, weight: valueIsWarning ? .semibold : .regular))
                    .foregroundStyle(valueIsWarning ? DvorStyle.warningText : DvorStyle.secondary)
            }
            if let toggle {
                Toggle("", isOn: toggle).labelsHidden()
            } else if chevron {
                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .semibold)).foregroundStyle(DvorStyle.muted)
            }
        }
        .padding(.horizontal, 12).padding(.vertical, 9).frame(minHeight: 48)
        .contentShape(Rectangle())
        .overlay(alignment: .bottom) {
            DvorStyle.line.frame(height: 0.5).padding(.leading, icon == nil ? 12 : 52)
        }
    }
}

struct DvorStat: View {
    let value: String
    let label: String

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(value).font(.system(size: 17, weight: .bold)).foregroundStyle(DvorStyle.ink)
            Text(label).font(.system(size: 12)).foregroundStyle(DvorStyle.muted)
        }.frame(maxWidth: .infinity, alignment: .leading)
    }
}
