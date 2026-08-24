import SwiftUI

enum ManifestCaptureMode {
    static func productState(for surface: String) -> String? {
        let arguments = ProcessInfo.processInfo.arguments
        guard let screenIndex = arguments.firstIndex(of: "-shot"), screenIndex + 1 < arguments.count,
              arguments[screenIndex + 1] == surface,
              let stateIndex = arguments.firstIndex(of: "-state"), stateIndex + 1 < arguments.count else { return nil }
        return arguments[stateIndex + 1]
    }
}

/// Shared SwiftUI adapter for a fully explicit UX Specification. Product
/// semantics stay in the generated NativeConceptSpec; this view owns only the
/// native presentation and system seams.
struct ManifestConceptRootView: View {
    @State private var selectedTab = NativeConceptSpec.initialTab
    @State private var permissions = Permissions()
    private let visualLanguage = NativeVisualLanguage.resolve(NativeConceptSpec.design)

    var body: some View {
        TabView(selection: $selectedTab) {
            ForEach(NativeConceptSpec.tabs) { tab in
                NavigationStack {
                    ManifestConceptSurface(surfaceID: tab.screen)
                        .navigationDestination(for: String.self) { target in
                            ManifestConceptSurface(surfaceID: target)
                        }
                }
                .tabItem { Label(tab.label, systemImage: tab.systemImage) }
                .tag(tab.id)
            }
        }
        .environment(permissions)
        .environment(\.visualLanguage, visualLanguage)
        .tint(visualLanguage.palette.accent)
    }
}

private struct ManifestConceptSurface: View {
    let surfaceID: String
    @Environment(\.visualLanguage) private var language
    @Environment(Permissions.self) private var permissions
    @State private var completedActions: Set<String> = []
    @State private var permissionOutcomes: [String: Bool] = [:]

    private var surface: NativeSurfaceDefinition? {
        NativeConceptSpec.surfaces.first { $0.id == surfaceID }
    }

    private var actions: [NativeActionDefinition] {
        NativeConceptSpec.actions.filter { $0.surface == surfaceID }
    }

    private var surfacePermissions: [NativePermissionDefinition] {
        NativeConceptSpec.permissions.filter { $0.screen == surfaceID }
    }

    private var productState: String {
        ManifestCaptureMode.productState(for: surfaceID) ?? "default"
    }

    private func localized(_ key: String, fallback: String) -> String {
        NativeConceptSpec.localizedStrings[key] ?? fallback
    }

    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: language.spacing.groupGap) {
                VStack(alignment: .leading, spacing: language.spacing.x2) {
                    Text(localized(surface?.titleKey ?? "", fallback: surfaceID))
                        .font(.system(size: language.type.rootTitle, weight: .bold))
                        .foregroundStyle(language.palette.textPrimary)
                    Text(localized(surface?.purposeKey ?? "", fallback: "Продуктовая задача"))
                        .font(.system(size: language.type.body))
                        .foregroundStyle(language.palette.textSecondary)
                }

                if productState != "default" {
                    Label(productState, systemImage: productState == "error" ? "exclamationmark.triangle.fill" : "circle.dashed")
                        .font(.headline)
                        .foregroundStyle(productState == "error" ? language.palette.danger : language.palette.accent)
                        .padding(language.spacing.x3)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(language.palette.fill)
                        .clipShape(RoundedRectangle(cornerRadius: language.metrics.cardRadius))
                }

                ForEach(Array((NativeConceptSpec.fixtureText[surfaceID] ?? []).enumerated()), id: \.offset) { index, value in
                    HStack(alignment: .top, spacing: language.spacing.x3) {
                        Image(systemName: index == 0 ? "sparkles" : "circle.fill")
                            .font(.system(size: index == 0 ? 20 : 7, weight: .semibold))
                            .foregroundStyle(language.palette.accent)
                            .frame(width: 28, height: 28)
                        Text(value)
                            .font(.system(size: language.type.body))
                            .foregroundStyle(language.palette.textPrimary)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .padding(language.spacing.x4)
                    .background(language.palette.surface)
                    .clipShape(RoundedRectangle(cornerRadius: language.metrics.cardRadius))
                }

                ForEach(actions) { action in
                    actionControl(action)
                }

                ForEach(surfacePermissions) { permission in
                    Button {
                        Task {
                            let granted = await permissions.request(PermissionKey(rawValue: permission.key))
                            permissionOutcomes[permission.key] = granted
                        }
                    } label: {
                        VStack(alignment: .leading, spacing: language.spacing.x1) {
                            Text(permission.gesture).font(.headline)
                            Text(permissionOutcomes[permission.key] == false ? permission.fallback : permission.feature)
                                .font(.subheadline).foregroundStyle(language.palette.textSecondary)
                        }
                        .frame(maxWidth: .infinity, minHeight: language.metrics.hitTarget, alignment: .leading)
                        .padding(.horizontal, language.spacing.x4)
                    }
                    .buttonStyle(.bordered)
                    .accessibilityIdentifier("permission.\(surfaceID).\(permission.key)")
                }
            }
            .padding(language.spacing.contentInset)
        }
        .background(language.palette.groupedBackground)
        .navigationTitle(localized(surface?.titleKey ?? "", fallback: surfaceID))
        .navigationBarTitleDisplayMode(.inline)
        .nativeSurface(surfaceID)
    }

    @ViewBuilder
    private func actionControl(_ action: NativeActionDefinition) -> some View {
        if action.outcome == "navigate", let target = action.target {
            NavigationLink(value: target) { actionLabel(action) }
                .buttonStyle(.borderedProminent)
                .nativeAction(action.id)
        } else {
            Button {
                completedActions.insert(action.id)
            } label: {
                actionLabel(action)
            }
            .buttonStyle(.borderedProminent)
            .nativeAction(action.id)
        }
    }

    private func actionLabel(_ action: NativeActionDefinition) -> some View {
        HStack {
            Text(completedActions.contains(action.id) ? "Готово" : action.label)
            Spacer()
            Image(systemName: completedActions.contains(action.id) ? "checkmark.circle.fill" : "arrow.right")
        }
        .frame(maxWidth: .infinity, minHeight: language.metrics.hitTarget)
    }
}
