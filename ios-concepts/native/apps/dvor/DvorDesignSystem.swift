import SwiftUI

extension Permissions {
    func requestCameraForEvidence() async -> Bool {
        await request(.camera)
    }

    func requestHouseNotifications() async -> Bool {
        await request(.push)
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

// MARK: - Semantic feedback

struct AppStatePanel: View {
    enum Kind {
        case empty, loading, success, warning, error

        var native: NativeFeedbackKind {
            switch self {
            case .empty: .empty
            case .loading: .loading
            case .success: .success
            case .warning: .warning
            case .error: .error
            }
        }
    }

    let kind: Kind
    let title: String
    let detail: String
    var icon: String? = nil
    var actionTitle: String? = nil
    var action: (() -> Void)? = nil
    var body: some View {
        NativeStatePanel(kind: kind.native, title: title, detail: detail,
                         icon: icon, actionTitle: actionTitle, action: action)
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
    var body: some View {
        NativeActionButton(title: title, loadingTitle: loadingTitle,
                           isLoading: isLoading, isDisabled: isDisabled,
                           icon: icon, action: action)
    }
}

struct DvorPageState: View {
    @Environment(\.visualLanguage) private var t
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
        .padding(.horizontal, t.spacing.x4)
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
    @Environment(\.visualLanguage) private var t

    var body: some View {
        ZStack {
            Text(title).font(.vkNavTitle).foregroundStyle(t.palette.textPrimary).lineLimit(1)
                .padding(.horizontal, 76)
            HStack {
                chromeAction(leading)
                Spacer()
                chromeAction(trailing)
            }
        }
        .padding(.horizontal, t.spacing.x1)
        .frame(height: 52)
        .background(t.palette.background)
        .overlay(alignment: .bottom) { t.palette.separator.frame(height: 0.5) }
    }

    @ViewBuilder private func chromeAction(_ item: DvorChromeAction?) -> some View {
        if let item {
            Button(action: item.action) {
                Group {
                    if let icon = item.icon { Image(systemName: icon).font(.system(size: 19, weight: .semibold)) }
                    else { Text(item.title).font(.role(.action)) }
                }
                .frame(minWidth: t.metrics.hitTarget, minHeight: t.metrics.hitTarget)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .foregroundStyle(t.palette.accent)
            .opacity(item.isDisabled ? 0.42 : 1)
            .disabled(item.isDisabled)
            .accessibilityLabel(item.title)
            .modifier(OptionalNativeAction(id: item.nativeActionID))
        } else {
            Color.clear.frame(width: t.metrics.hitTarget, height: t.metrics.hitTarget)
        }
    }
}

private struct OptionalNativeAction: ViewModifier {
    let id: String?
    func body(content: Content) -> some View {
        if let id { content.nativeAction(id) }
        else { content }
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
    @Environment(\.visualLanguage) private var t
    let title: String
    var detail: String? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(title)
                .font(.role(.section))
                .foregroundStyle(t.palette.textPrimary)
            if let detail {
                Text(detail)
                    .font(.role(.body))
                    .foregroundStyle(t.palette.textSecondary)
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
    @Environment(\.visualLanguage) private var t

    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            Text(title)
                .font(.role(.pill))
                .foregroundStyle(error == nil ? t.palette.textPrimary : t.palette.danger)
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
                .background(t.palette.fill, in: RoundedRectangle(cornerRadius: t.metrics.controlRadius))
                .overlay {
                    if error != nil {
                        RoundedRectangle(cornerRadius: t.metrics.controlRadius)
                            .stroke(t.palette.danger.opacity(0.75), lineWidth: 1)
                    }
                }
            if let error {
                Label(error, systemImage: "exclamationmark.circle.fill")
                    .font(.system(size: 13))
                    .foregroundStyle(t.palette.danger)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }
}

struct DvorCard<Content: View>: View {
    @Environment(\.visualLanguage) private var t
    @ViewBuilder let content: Content

    var body: some View {
        content
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(t.palette.surface)
    }
}

struct DvorSectionTitle: View {
    @Environment(\.visualLanguage) private var t
    let title: String

    var body: some View {
        Text(title)
            .font(.role(.groupHeader))
            .foregroundStyle(t.palette.textSecondary)
            .padding(.horizontal, 16)
            .padding(.top, 11)
            .padding(.bottom, 7)
            .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct DvorRow: View {
    @Environment(\.visualLanguage) private var t
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
                Text(title).font(.role(.name)).foregroundStyle(t.palette.textPrimary)
                if let subtitle {
                    Text(subtitle).font(.role(.meta)).foregroundStyle(t.palette.textSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            Spacer(minLength: 6)
            if let value {
                Text(value).font(.role(valueIsWarning ? .name : .body))
                    .foregroundStyle(valueIsWarning ? t.palette.warning : t.palette.textSecondary)
            }
            if let toggle {
                Toggle("", isOn: toggle).labelsHidden()
            } else if chevron {
                Image(systemName: t.icon(.disclosure))
                    .font(.system(size: 13, weight: .semibold)).foregroundStyle(t.palette.textSecondary)
            }
        }
        .padding(.horizontal, 12).padding(.vertical, 9).frame(minHeight: 48)
        .contentShape(Rectangle())
        .overlay(alignment: .bottom) {
            t.palette.separator.frame(height: 0.5).padding(.leading, icon == nil ? 12 : 52)
        }
    }
}

struct DvorStat: View {
    @Environment(\.visualLanguage) private var t
    let value: String
    let label: String

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(value).font(.role(.rowTitle)).foregroundStyle(t.palette.textPrimary)
            Text(label).font(.role(.bubbleTime)).foregroundStyle(t.palette.textSecondary)
        }.frame(maxWidth: .infinity, alignment: .leading)
    }
}
