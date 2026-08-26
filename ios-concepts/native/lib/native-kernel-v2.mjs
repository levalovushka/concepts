import { createHash } from "node:crypto";

function swiftString(value) {
  return JSON.stringify(String(value ?? ""))
    .replaceAll("\\u2028", "\\u{2028}")
    .replaceAll("\\u2029", "\\u{2029}");
}

function swiftCase(id) {
  const words = String(id).split(/[^A-Za-z0-9]+/).filter(Boolean);
  const value = words.map((word, index) => index === 0
    ? word.toLowerCase()
    : `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`).join("");
  const safe = value || "product";
  return /^\d/.test(safe) ? `value${safe}` : safe;
}

function swiftType(id, suffix = "") {
  const value = swiftCase(id);
  return `${value[0].toUpperCase()}${value.slice(1)}${suffix}`;
}

function reducer(action) {
  const effect = action.effect;
  switch (effect.type) {
  case "create": return `collections[${swiftString(effect.collectionField)}, default: []].append(UUID().uuidString)`;
  case "append": return `collections[${swiftString(effect.collectionField)}, default: []].append(UUID().uuidString)`;
  case "delete": return `collections[${swiftString(effect.collectionField)}, default: []].removeLastIfPresent()`;
  case "toggle": return `flags[${swiftString(effect.stateField)}, default: false].toggle()`;
  case "update":
  case "system": return `values[${swiftString(effect.stateField)}] = ${swiftString(effect.value || "completed")}`;
  default: throw new Error(`Native Kernel v2 cannot compile effect ${effect.type}`);
  }
}

function compileStore(core, slice, capabilityPlan) {
  const routes = slice.surfaces.map(item => item.id);
  const actions = core.world.actions;
  const routeByAction = new Map(slice.transitions.map(item => [item.actionId, item.to]));
  return `import SwiftUI

enum ProductRoute: String, CaseIterable, Identifiable {
${routes.map(id => `    case ${swiftCase(id)} = ${swiftString(id)}`).join("\n")}
    var id: String { rawValue }
}

enum ProductAction: String, CaseIterable, Identifiable {
${actions.map(action => `    case ${swiftCase(action.id)} = ${swiftString(action.id)}`).join("\n")}
    var id: String { rawValue }
}

@MainActor @Observable
final class NativeV2ProductStore {
    var route: ProductRoute
    var flags: [String: Bool] = [:]
    var values: [String: String] = [:]
    var collections: [String: [String]] = [:]
    var permissionOutcomes: [String: Bool] = [:]
    var lastOutcome = ""
    var presentedCapability: String?
    private var pendingCapabilityAction: ProductAction?
    private var pendingCapabilityFallback = ""

    init() {
        route = NativeV2Capture.route() ?? .${swiftCase(routes[0])}
    }

    func perform(_ action: ProductAction) {
        switch action {
${actions.map(action => `        case .${swiftCase(action.id)}:
            ${reducer(action)}
            lastOutcome = ${swiftString(action.outcome)}${routeByAction.has(action.id) ? `
            route = .${swiftCase(routeByAction.get(action.id))}` : ""}`).join("\n")}
        }
    }

    func performCapability(
        _ action: ProductAction,
        key: String,
        fallback: String,
        permissions: Permissions
    ) async {
        let granted: Bool
        switch key {
${capabilityPlan.bindings.map(item => `        case ${swiftString(item.key)}:
            granted = await permissions.request(PermissionKey(rawValue: ${swiftString(item.key)}))`).join("\n")}
        default:
            assertionFailure("Capability is not part of the compiled plan: \\(key)")
            granted = false
        }
        permissionOutcomes[key] = granted
        if granted {
            if key == "camera", ProcessInfo.processInfo.environment["NATIVE_UI_TESTING"] != "1" {
                pendingCapabilityAction = action
                pendingCapabilityFallback = fallback
                presentedCapability = key
            } else {
                let completed = await NativeCapabilityOperations.perform(key)
                if completed {
                    recordCapabilityOutcome(key)
                    perform(action)
                } else {
                    lastOutcome = fallback
                    permissionOutcomes[key] = false
                }
            }
        } else {
            lastOutcome = fallback
        }
    }

    func completePresentedCapability() {
        if let action = pendingCapabilityAction {
            recordCapabilityOutcome("camera")
            perform(action)
        }
        presentedCapability = nil
        pendingCapabilityAction = nil
        pendingCapabilityFallback = ""
    }

    func cancelPresentedCapability() {
        lastOutcome = pendingCapabilityFallback
        presentedCapability = nil
        pendingCapabilityAction = nil
        pendingCapabilityFallback = ""
    }

    private func recordCapabilityOutcome(_ key: String) {
        switch key {
${capabilityPlan.bindings.map(item => `        case ${swiftString(item.key)}: values[${swiftString(item.outcome.stateField)}] = "completed"`).join("\n")}
        default: break
        }
    }
}

private extension Array {
    mutating func removeLastIfPresent() { if !isEmpty { removeLast() } }
}

enum NativeV2PermissionContract {
    static let keys = [${capabilityPlan.bindings.map(item => swiftString(item.key)).join(", ")}]
}
`;
}

function compileApp(core) {
  return `import SwiftUI

@main
struct ${swiftType(core.id, "App")}: App {
    @State private var store = NativeV2ProductStore()
    @State private var permissions = Permissions()
    @State private var session = NativeV2Session()
    private let visualLanguage = NativeVisualLanguage.resolve(NativeConceptSpec.design)

    var body: some Scene {
        WindowGroup {
            Group {
                if session.isAuthenticated {
                    NativeV2ProductRoot()
                } else {
                    NativeEmailAuth(
                        productName: ${swiftString(core.name)},
                        persistencePromise: "профиль и ваши действия",
                        initialSurface: NativeV2Capture.surface,
                        captureState: NativeV2Capture.state,
                        emailActionID: NativeV2ShellAction.email,
                        codeActionID: NativeV2ShellAction.code,
                        codeFailureActionID: NativeV2ShellAction.codeFailure
                    ) { session.signIn() }
                }
            }
            .background(NativeV2CaptureProbe(store: store))
            .onOpenURL { NativeCapabilityOperations.handle(url: $0) }
            .environment(store)
            .environment(permissions)
            .environment(\\.visualLanguage, visualLanguage)
            .tint(visualLanguage.palette.accent)
            .preferredColorScheme(.light)
        }
    }
}

private enum NativeV2ShellAction {
    static let email = "shell.login.request-email-code"
    static let code = "shell.login.verify-email-code"
    static let codeFailure = "shell.login.invalid-code"
}

@MainActor @Observable
private final class NativeV2Session {
    var isAuthenticated = NativeV2Capture.skipsAuthentication
    func signIn() { isAuthenticated = true }
}

enum NativeV2Capture {
    static let surface = argument(after: "-shot")
    static let state = argument(after: "-state") ?? "populated/default"
    static let skipsAuthentication = surface.map { $0 != "login" } ?? false
    static func route() -> ProductRoute? { surface.flatMap(ProductRoute.init(rawValue:)) }
    static func initialTab(_ roots: [String]) -> String {
        guard let first = roots.first else { return "feed" }
        return surface.flatMap { roots.contains($0) ? $0 : nil } ?? first
    }

    private static func argument(after key: String) -> String? {
        let values = ProcessInfo.processInfo.arguments
        guard let index = values.firstIndex(of: key), values.indices.contains(index + 1) else { return nil }
        return values[index + 1]
    }
}

private struct NativeV2CaptureProbe: View {
    let store: NativeV2ProductStore
    var body: some View {
        GeometryReader { proxy in
            Color.clear.task {
                let frame = proxy.frame(in: .global)
                CaptureIdentity.report(surface: NativeV2Capture.surface ?? store.route.rawValue, state: NativeV2Capture.state)
                CaptureIdentity.reportLayout(
                    viewportWidth: proxy.size.width, viewportHeight: proxy.size.height,
                    contentMinX: frame.minX, contentMaxX: frame.maxX,
                    contentMinY: frame.minY, contentMaxY: frame.maxY
                )
            }
        }
        .allowsHitTesting(false)
    }
}
`;
}

function actionCall(actionId, capabilityByAction) {
  const capability = capabilityByAction.get(actionId);
  if (capability) return `Task { await store.performCapability(.${swiftCase(actionId)}, key: ${swiftString(capability.key)}, fallback: ${swiftString(capability.fallback)}, permissions: permissions) }`;
  return `store.perform(.${swiftCase(actionId)})`;
}

const CAPABILITY_ICONS = Object.freeze({
  camera: "camera.fill", photos: "photo.on.rectangle", mic: "mic.fill", speech: "waveform",
  audio: "headphones", location: "location.fill", wifiinfo: "wifi", hotspot: "personalhotspot",
  tracking: "slider.horizontal.3", associateddomains: "link", push: "bell.fill",
  commnotif: "message.badge.fill", remotenotif: "arrow.clockwise", voip: "phone.fill",
  contacts: "person.crop.circle.badge.plus", fetch: "arrow.triangle.2.circlepath",
  bgtask: "clock.arrow.circlepath", appgroups: "square.and.arrow.up", keychain: "key.fill",
  autofill: "person.text.rectangle", faceid: "faceid", calendar: "calendar",
});

const CAPABILITY_HINTS = Object.freeze({
  camera: "Чтобы снять новую главу", photos: "Чтобы выбрать готовый кадр", mic: "Чтобы записать голосовое продолжение",
  speech: "Чтобы превратить голос в текст", audio: "Чтобы слушать главы в фоне", location: "Чтобы показать место эстафеты",
  wifiinfo: "Чтобы найти участников в общей сети", hotspot: "Чтобы подключиться к локальной встрече", tracking: "Чтобы подобрать более точные рекомендации",
  associateddomains: "Чтобы открывать цепочку прямо по ссылке", push: "Чтобы узнать о новой главе", commnotif: "Чтобы не пропустить переданный ход",
  remotenotif: "Чтобы цепочки обновлялись вовремя", voip: "Чтобы быстро связаться с участником", contacts: "Чтобы передать ход знакомому",
  fetch: "Чтобы показывать свежие главы", bgtask: "Чтобы готовить подборку заранее", appgroups: "Чтобы передать черновик в расширение",
  keychain: "Чтобы безопасно сохранить вход", autofill: "Чтобы входить без повторного ввода", faceid: "Чтобы скрыть личные черновики",
  calendar: "Чтобы не пропустить срок принятого хода",
});

function actionControl(surfaceId, action, capabilityByAction, primary) {
  const call = actionCall(action.id, capabilityByAction);
  const capability = capabilityByAction.get(action.id);
  const icon = capability ? CAPABILITY_ICONS[capability.key] || "gearshape.fill" : "arrow.right";
  const modifier = `.nativeAction(${swiftString(`${surfaceId}.${action.id}`)})
            .accessibilityIdentifier(${swiftString(`action.${surfaceId}.${action.id}`)})`;
  return primary
    ? `VKButton(title: ${swiftString(action.label)}) { ${call} }
            ${modifier}`
    : `Button { ${call} } label: {
                VKRow(title: ${swiftString(action.label)}, subtitle: ${capability ? swiftString(CAPABILITY_HINTS[capability.key] || capability.purpose) : "nil"}, icon: ${swiftString(icon)}, chevron: false)
            }
            .buttonStyle(.plain)
            ${modifier}`;
}

function compileSurface(surface, core, capabilityByAction, firstPerson, isRoot) {
  const actionById = new Map(core.world.actions.map(item => [item.id, item]));
  const ownedActions = surface.actionIds.map(id => actionById.get(id)).filter(Boolean);
  const headerAction = ownedActions.find(action => action.id === "open_profile");
  const actions = ownedActions.filter(action => action.id !== "open_profile");
  const primary = actions[0];
  const secondary = actions.slice(1);
  const primaryControl = primary ? actionControl(surface.id, primary, capabilityByAction, true) : "EmptyView()";
  const secondaryControls = secondary.map(action => `${actionControl(surface.id, action, capabilityByAction, false)}
            RowSeparator()`).join("\n");
  const allRowControls = actions.map(action => `${actionControl(surface.id, action, capabilityByAction, false)}
            RowSeparator()`).join("\n");
  const permissionKeys = actions.map(action => capabilityByAction.get(action.id)?.key).filter(Boolean);
  const surfacePerson = surface.content.author || firstPerson;
  const detailRows = (surface.content.details || []).map((detail, index) => `
                    VKRow(title: ${swiftString(detail.title)}, subtitle: ${swiftString(detail.detail)}, icon: ${swiftString(detail.icon || "circle")}, chevron: false)
                    ${index < surface.content.details.length - 1 ? "RowSeparator()" : ""}`).join("\n");
  const recipientRows = (surface.content.details || []).map((detail, index) => `
                    Button { selectedRecipient = ${swiftString(detail.title)} } label: {
                        HStack(spacing: 12) {
                            Image(systemName: ${swiftString(detail.icon || "person.crop.circle.fill")})
                                .font(.system(size: 30))
                                .foregroundStyle(theme.palette.accent)
                                .frame(width: 40)
                            VStack(alignment: .leading, spacing: 3) {
                                Text(${swiftString(detail.title)}).font(.vkBody)
                                Text(${swiftString(detail.detail)}).font(.vkMeta).foregroundStyle(theme.palette.textSecondary)
                            }
                            Spacer()
                            Image(systemName: selectedRecipient == ${swiftString(detail.title)} ? "checkmark.circle.fill" : "circle")
                                .foregroundStyle(selectedRecipient == ${swiftString(detail.title)} ? theme.palette.accent : theme.palette.textSecondary)
                        }
                        .padding(.horizontal, 16)
                        .frame(minHeight: 64)
                        .contentShape(Rectangle())
                    }
                    .buttonStyle(.plain)
                    .accessibilityIdentifier(${swiftString(`recipient.${surface.id}.${index + 1}`)})
                    ${index < surface.content.details.length - 1 ? "RowSeparator()" : ""}`).join("\n");
  const serviceIcons = ["arrow.triangle.branch", "doc.text.fill", "calendar", "bookmark.fill", "gearshape.fill"];
  const serviceTiles = actions.map((action, index) => `Button { store.perform(.${swiftCase(action.id)}) } label: {
                    VStack(alignment: .leading, spacing: 12) {
                        Image(systemName: ${swiftString(serviceIcons[index % serviceIcons.length])})
                            .font(.system(size: 24, weight: .semibold))
                            .foregroundStyle(theme.palette.accent)
                            .frame(width: 48, height: 48)
                            .background(theme.palette.fill, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                        Text(${swiftString(action.label)}).font(.vkName).foregroundStyle(theme.palette.textPrimary)
                    }
                    .frame(maxWidth: .infinity, minHeight: 124, alignment: .topLeading)
                    .padding(16)
                    .background(.white, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                }
                .buttonStyle(.plain)
                .nativeAction(${swiftString(`${surface.id}.${action.id}`)})
                .accessibilityIdentifier(${swiftString(`action.${surface.id}.${action.id}`)})`).join("\n");
  const outcomeNotices = permissionKeys.map(key => `if let granted = store.permissionOutcomes[${swiftString(key)}] {
                VKInlineNotice(
                    title: granted ? "Доступ выполнен" : "Продолжим без доступа",
                    detail: store.lastOutcome
                )
                .accessibilityIdentifier(granted ? ${swiftString(`outcome.permission.${key}.granted`)} : ${swiftString(`outcome.permission.${key}.denied`)})
            }`).join("\n");
  const mediaPlaceholder = surface.content.mediaPlaceholder ? `ZStack {
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(theme.palette.fill)
                    VStack(spacing: 10) {
                        Image(systemName: "photo")
                            .font(.system(size: 34, weight: .medium))
                            .foregroundStyle(theme.palette.textSecondary)
                        Text(${swiftString(surface.content.mediaPlaceholder)})
                            .font(.vkMeta)
                            .foregroundStyle(theme.palette.textSecondary)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 250)` : "";
  const entryBody = `VStack(alignment: .leading, spacing: 0) {
            VKAuthoredPost {
                HStack(spacing: 10) {
                    Avatar(name: ${swiftString(surfacePerson)}, size: 42, online: true)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(${swiftString(surfacePerson)}).font(.vkName)
                        Text("сегодня").font(.vkMeta)
                    }
                }
            } content: {
                VStack(alignment: .leading, spacing: 10) {
                    Text(${swiftString(surface.content.headline)}).font(.vkSection)
                    Text(${swiftString(surface.content.body)}).font(.vkBody).fixedSize(horizontal: false, vertical: true)
                    ${mediaPlaceholder}
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
            } actions: {
                VStack(alignment: .leading, spacing: 12) {
                    VKPostActions(
                        likes: 18, comments: 4, shares: 2, trailing: "1,2K",
                        onLike: { store.flags["feedLiked", default: false].toggle() },
                        onComment: { store.lastOutcome = "Открываем обсуждение" },
                        onShare: { store.lastOutcome = "Обещание готово к отправке" },
                        onSave: { store.flags["feedSaved", default: false].toggle() }
                    )
                    ${primaryControl}
                }
            }
            GroupGap()
            VKGroup {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Цепочка").font(.vkSection)
                    HStack(spacing: 10) {
                        Avatar(name: "Саша", size: 38)
                        Image(systemName: "arrow.right").foregroundStyle(theme.palette.textSecondary)
                        Avatar(name: ${swiftString(surfacePerson)}, size: 38, online: true)
                        Image(systemName: "arrow.right").foregroundStyle(theme.palette.textSecondary)
                        Avatar(name: "Ты", size: 38)
                        Spacer()
                        Text("4 главы").font(.vkMeta).foregroundStyle(theme.palette.textSecondary)
                    }
                }
                .padding(16)
            }
        }`;
  const actionBody = `VStack(alignment: .leading, spacing: 0) {
            VKGroup {
                VStack(alignment: .leading, spacing: 8) {
                    Text(${swiftString(surface.content.headline)}).font(.vkTabTitle)
                    Text(${swiftString(surface.content.body)}).font(.vkBody).foregroundStyle(theme.palette.textSecondary)
                }
                .padding(16)
            }
            GroupGap()
            VKGroup {
                VStack(spacing: 0) {
${detailRows}
                }
            }
            GroupGap()
            VKPrimaryActionArea { ${primaryControl} }
            ${secondaryControls ? `VKGroup { ${secondaryControls} }` : ""}
            ${outcomeNotices}
        }`;
  const resultBody = `VStack(alignment: .leading, spacing: 0) {
            VKGroup {
                VStack(alignment: .leading, spacing: 10) {
                    Text(${swiftString(surface.content.headline)}).font(.vkTabTitle)
                    Text(${swiftString(surface.content.body)}).font(.vkBody).foregroundStyle(theme.palette.textSecondary)
                    ${mediaPlaceholder}
                    VKInlineNotice(title: ${swiftString(surface.content.summary?.title || "Результат виден")}, detail: ${swiftString(surface.content.summary?.detail || surface.content.body)})
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
            }
            GroupGap()
            VKPrimaryActionArea { ${primaryControl} }
            ${secondaryControls ? `VKGroup { ${secondaryControls} }` : ""}
            ${outcomeNotices}
        }`;
  const rowOnlySupport = ["ownedProfile", "capabilityCenter", "settings"].includes(surface.recipe);
  const supportBody = `VStack(alignment: .leading, spacing: 0) {
            VKGroup {
                VStack(alignment: .leading, spacing: 8) {
                    Text(${swiftString(surface.content.headline)}).font(.vkTabTitle)
                    Text(${swiftString(surface.content.body)}).font(.vkBody).foregroundStyle(theme.palette.textSecondary)
                }
                .padding(16)
            }
            ${primary && !rowOnlySupport ? `GroupGap()
            VKPrimaryActionArea { ${primaryControl} }` : ""}
            ${rowOnlySupport && allRowControls ? `GroupGap()
            VKGroup { ${allRowControls} }` : secondaryControls ? `VKGroup { ${secondaryControls} }` : ""}
            ${outcomeNotices}
        }`;
  const discoveryBody = `VStack(alignment: .leading, spacing: 0) {
            VKGroup {
                VStack(alignment: .leading, spacing: 8) {
                    Text(${swiftString(surface.content.headline)}).font(.vkTabTitle)
                    Text(${swiftString(surface.content.body)}).font(.vkBody).foregroundStyle(theme.palette.textSecondary)
                }.padding(16)
            }
            GroupGap()
            VKGroup {
                VKRow(title: "Кадр из окна одним цветом", subtitle: "Лена · 6 друзей продолжили", icon: "camera.fill")
                RowSeparator()
                VKRow(title: "Доброе дело за пятнадцать минут", subtitle: "Миша · ход доступен сегодня", icon: "heart.fill")
                RowSeparator()
                VKRow(title: "Необычная вывеска по пути", subtitle: "Оля · рядом с вами", icon: "location.fill")
            }
            GroupGap()
            VKPrimaryActionArea { ${primaryControl} }
            ${secondaryControls ? `VKGroup {
                Text("Инструменты поиска").font(.vkSection).padding(.horizontal, 16).padding(.top, 12)
                ${secondaryControls}
            }` : ""}
            ${outcomeNotices}
        }`;
  const conversationsBody = `VStack(alignment: .leading, spacing: 0) {
            VKGroup {
                VKRow(title: "Аня Коваль", subtitle: "Приняла ход · 2 минуты назад", icon: "person.crop.circle.fill")
                RowSeparator()
                VKRow(title: "Саша и ещё 3 участника", subtitle: "В цепочке появилась новая глава", icon: "person.2.fill")
                RowSeparator()
                VKRow(title: "Лена Морозова", subtitle: "Ждёт твоего продолжения сегодня", icon: "clock.fill")
            }
            GroupGap()
            VKPrimaryActionArea { ${primaryControl} }
            ${secondaryControls ? `VKGroup {
                Text("Связь с участниками").font(.vkSection).padding(.horizontal, 16).padding(.top, 12)
                ${secondaryControls}
            }` : ""}
            ${outcomeNotices}
        }`;
  const profileBody = `VStack(alignment: .leading, spacing: 0) {
            VKGroup {
                VStack(spacing: 12) {
                    Avatar(name: ${swiftString(surface.content.author || "Ты")}, size: 86, online: true)
                    Text(${swiftString(surface.content.author || "Ты")}).font(.vkTabTitle)
                    ${surface.content.headline ? `Text(${swiftString(surface.content.headline)}).font(.vkMeta).foregroundStyle(theme.palette.textSecondary)` : ""}
                    Text(${swiftString(surface.content.body)}).font(.vkBody).foregroundStyle(theme.palette.textSecondary).multilineTextAlignment(.center)
                    HStack(spacing: 0) {
                        VStack { Text("3").font(.vkName); Text("активные").font(.vkMeta) }.frame(maxWidth: .infinity)
                        Divider().frame(height: 34)
                        VStack { Text("12").font(.vkName); Text("главы").font(.vkMeta) }.frame(maxWidth: .infinity)
                        Divider().frame(height: 34)
                        VStack { Text("8").font(.vkName); Text("друзей").font(.vkMeta) }.frame(maxWidth: .infinity)
                    }
                }.padding(16)
            }
            ${detailRows ? `VKGroup {
                VKSectionHeader(title: ${swiftString(surface.content.sectionTitle || surface.content.headline)})
                ${detailRows}
            }` : ""}
            VKGroup {
                VKSectionHeader(title: "Профиль и безопасность")
                ${allRowControls}
            }
            ${outcomeNotices}
        }`;
  const publicationBody = `VStack(alignment: .leading, spacing: 0) {
            VKGroup {
                VStack(alignment: .leading, spacing: 8) {
                    Text(${swiftString(surface.content.headline)}).font(.vkTabTitle)
                    Text(${swiftString(surface.content.body)}).font(.vkBody).foregroundStyle(theme.palette.textSecondary)
                }.padding(16)
            }
            GroupGap()
            VKGroup {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Условие").font(.vkSection)
                    Text("Например: найди что-то идеально круглое").font(.vkBody).foregroundStyle(theme.palette.textSecondary)
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(theme.palette.fill)
                        .frame(height: 140)
                        .overlay {
                            VStack(spacing: 8) {
                                Image(systemName: "photo.on.rectangle").font(.system(size: 28, weight: .medium))
                                Text("Первая глава").font(.vkMeta)
                            }.foregroundStyle(theme.palette.textSecondary)
                        }
                }.padding(16)
            }
            GroupGap()
            VKPrimaryActionArea { ${primaryControl} }
            ${secondaryControls ? `VKGroup {
                VKSectionHeader(title: "Добавить материал")
                ${secondaryControls}
            }` : ""}
            ${outcomeNotices}
        }`;
  const recipientBody = `VStack(alignment: .leading, spacing: 0) {
            VKGroup {
                VStack(alignment: .leading, spacing: 8) {
                    Text(${swiftString(surface.content.headline)}).font(.vkTabTitle)
                    Text(${swiftString(surface.content.body)}).font(.vkBody).foregroundStyle(theme.palette.textSecondary)
                }.padding(16)
            }
            GroupGap()
            VKGroup {
                VStack(spacing: 0) {
                    ${recipientRows}
                }
            }
            GroupGap()
            VKInlineNotice(title: "\\(selectedRecipient) получит следующий ход", detail: "Продолжение и условие будут отправлены только выбранному знакомому.")
                .padding(.horizontal, 16)
            VKPrimaryActionArea { ${primaryControl} }
            ${secondaryControls ? `VKGroup {
                VKSectionHeader(title: "Перед отправкой")
                ${secondaryControls}
            }` : ""}
            ${outcomeNotices}
        }`;
  const serviceMenuBody = `VStack(alignment: .leading, spacing: 0) {
            VKGroup {
                VStack(alignment: .leading, spacing: 8) {
                    Text(${swiftString(surface.content.headline)}).font(.vkTabTitle)
                    Text(${swiftString(surface.content.body)}).font(.vkBody).foregroundStyle(theme.palette.textSecondary)
                }.padding(16)
            }
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ${serviceTiles}
            }
            .padding(16)
        }`;
  const featureListBody = `VStack(alignment: .leading, spacing: 0) {
            VKGroup {
                VStack(alignment: .leading, spacing: 8) {
                    Text(${swiftString(surface.content.headline)}).font(.vkTabTitle)
                    Text(${swiftString(surface.content.body)}).font(.vkBody).foregroundStyle(theme.palette.textSecondary)
                }.padding(16)
            }
            ${detailRows ? `GroupGap()
            VKGroup { ${detailRows} }` : ""}
        }`;
  const recipeBody = surface.recipe === "socialDiscovery" ? discoveryBody
    : surface.recipe === "conversationList" ? conversationsBody
      : surface.recipe === "ownedProfile" ? profileBody
        : surface.recipe === "publicationEditor" ? publicationBody
          : surface.recipe === "serviceMenu" ? serviceMenuBody
            : surface.recipe === "featureList" ? featureListBody : supportBody;
  const roleBody = surface.recipe === "recipientPicker" ? recipientBody
    : surface.role === "entry" ? entryBody
    : surface.role === "action" ? actionBody
      : surface.role === "result" ? resultBody : recipeBody;
  const header = surface.role === "action"
    ? `VKModalChrome(title: ${swiftString(surface.title)}, onCancel: { store.route = ProductRoute.allCases[0] })`
    : isRoot && surface.role === "entry"
      ? `VKTabHeader(title: ${swiftString(surface.title)}, avatar: ${swiftString(surfacePerson)}, avatarAction: ${headerAction ? `{ store.perform(.${swiftCase(headerAction.id)}) }` : "nil"}) { EmptyView() }${headerAction ? `
            .nativeAction(${swiftString(`${surface.id}.${headerAction.id}`)})` : ""}`
      : isRoot ? `VKTabHeader(title: ${swiftString(surface.title)}) { EmptyView() }` : "EmptyView()";
  const navigation = !isRoot && surface.role !== "action" ? `
        .vkNavigation(${swiftString(surface.title)})` : "";
  return `private struct ${swiftType(surface.id, "Surface")}: View {
    @Environment(NativeV2ProductStore.self) private var store
    @Environment(Permissions.self) private var permissions
    @Environment(\\.visualLanguage) private var theme
    ${surface.recipe === "recipientPicker" ? `@State private var selectedRecipient = ${swiftString(surface.content.details?.[0]?.title || "Получатель")}` : ""}

    var body: some View {
        VKRootSurface {
            ${header}
        } content: {
            if NativeV2Capture.state == "populated/default" {
                ScrollView {
                    ${roleBody}
                }
                .background(theme.palette.groupedBackground)
            } else {
                NativeV2ServiceState(state: NativeV2Capture.state, title: ${swiftString(surface.title)})
            }
        }
        ${navigation}
        .nativeSurface(${swiftString(surface.id)})
        ${isRoot ? "" : ".toolbar(.hidden, for: .tabBar)"}
    }
}
`;
}

function compileScreens(core, slice, capabilityPlan) {
  const capabilityByAction = new Map(capabilityPlan.bindings.map(item => [item.actionId, item]));
  const person = core.audience.who.split(/[,.;]/)[0];
  const cameraBinding = capabilityPlan.bindings.find(item => item.key === "camera");
  const previewTabs = [
    { id: "discovery", role: "discovery", title: "Поиск" },
    { id: "create", role: "short-video", title: "Создать" },
    { id: "messages", role: "messaging", title: "Ответы" },
    { id: "services", role: "services", title: "Ещё" },
  ];
  const rootTabs = slice.rootTabs || [
    { surfaceId: "feed", role: "feed", title: core.name },
    ...previewTabs.map(item => ({ surfaceId: item.id, role: item.role, title: item.title })),
  ];
  const rootIds = rootTabs.map(item => item.surfaceId);
  const additionalTabSource = rootTabs.slice(1).map(tab => slice.rootTabs ? `
            NavigationStack {
                NativeV2Surface(route: store.route)
            }
                .tabItem {
                    Image(theme.requiredTabIconAsset(role: ${swiftString(tab.role)}, selected: selectedTab == ${swiftString(tab.surfaceId)}))
                        .renderingMode(.template)
                        .accessibilityLabel(${swiftString(tab.title)})
                }
                .tag(${swiftString(tab.surfaceId)})` : `
            NativeV2SlicePlaceholder(title: ${swiftString(tab.title)})
                .tabItem {
                    Image(theme.requiredTabIconAsset(role: ${swiftString(tab.role)}, selected: selectedTab == ${swiftString(tab.surfaceId)}))
                        .renderingMode(.template)
                        .accessibilityLabel(${swiftString(tab.title)})
                }
                .tag(${swiftString(tab.surfaceId)})`).join("\n");
  const cameraPresentation = cameraBinding ? `
        .sheet(isPresented: Binding(
            get: { store.presentedCapability == "camera" },
            set: { if !$0 { store.cancelPresentedCapability() } }
        )) {
            NativeV2CameraPicker(
                onCapture: { _ in store.completePresentedCapability() },
                onCancel: { store.cancelPresentedCapability() }
            )
            .ignoresSafeArea()
        }` : "";
  const cameraPicker = cameraBinding ? `
private struct NativeV2CameraPicker: UIViewControllerRepresentable {
    let onCapture: (Data) -> Void
    let onCancel: () -> Void

    func makeCoordinator() -> Coordinator { Coordinator(parent: self) }
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = UIImagePickerController.isSourceTypeAvailable(.camera) ? .camera : .photoLibrary
        picker.delegate = context.coordinator
        return picker
    }
    func updateUIViewController(_ controller: UIImagePickerController, context: Context) {}

    final class Coordinator: NSObject, UINavigationControllerDelegate, UIImagePickerControllerDelegate {
        let parent: NativeV2CameraPicker
        init(parent: NativeV2CameraPicker) { self.parent = parent }
        func imagePickerController(
            _ picker: UIImagePickerController,
            didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]
        ) {
            guard let image = info[.originalImage] as? UIImage, let data = image.jpegData(compressionQuality: 0.82) else {
                parent.onCancel()
                return
            }
            parent.onCapture(data)
        }
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) { parent.onCancel() }
    }
}
` : "";
  const cases = slice.surfaces.map(surface => `        case .${swiftCase(surface.id)}: ${swiftType(surface.id, "Surface")}()`).join("\n");
  return `import SwiftUI
${cameraBinding ? "import UIKit" : ""}

struct NativeV2ProductRoot: View {
    @Environment(NativeV2ProductStore.self) private var store
    @Environment(\\.visualLanguage) private var theme
    @State private var selectedTab = NativeV2Capture.initialTab([${rootIds.map(swiftString).join(", ")}])

    var body: some View {
        @Bindable var store = store
        TabView(selection: $selectedTab) {
            NavigationStack {
                NativeV2Surface(route: store.route)
            }
            .tabItem {
                Image(theme.requiredTabIconAsset(role: ${swiftString(rootTabs[0].role)}, selected: selectedTab == ${swiftString(rootTabs[0].surfaceId)}))
                    .renderingMode(.template)
                    .accessibilityLabel(${swiftString(rootTabs[0].title)})
            }
            .tag(${swiftString(rootTabs[0].surfaceId)})
${additionalTabSource}
        }
        .tabBarMinimizeBehavior(.never)
        .toolbar([${rootIds.map(swiftString).join(", ")}].contains(store.route.rawValue) ? .visible : .hidden, for: .tabBar)
        .onChange(of: selectedTab) { _, value in
            if let route = ProductRoute(rawValue: value) { store.route = route }
        }
${cameraPresentation}
    }
}

private struct NativeV2SlicePlaceholder: View {
    let title: String
    var body: some View {
        VKRootSurface {
            VKTabHeader(title: title) { EmptyView() }
        } content: {
            VKGroup {
                VKInlineNotice(
                    title: "За границей вертикального среза",
                    detail: "Эта вкладка появится только после приёмки основного механизма."
                )
            }
        }
    }
}

private struct NativeV2ServiceState: View {
    let state: String
    let title: String
    @Environment(\\.visualLanguage) private var theme

    private var copy: (icon: String, title: String, detail: String) {
        switch state {
        case "loading": return ("arrow.triangle.2.circlepath", "Обновляем", "Сохраняем видимый контекст, пока данные загружаются.")
        case "empty": return ("tray", "Пока пусто", "Первое действие заполнит этот раздел понятным результатом.")
        case "error": return ("exclamationmark.circle", "Не удалось завершить", "Введённые данные сохранены; действие можно безопасно повторить.")
        case "offline": return ("wifi.slash", "Нет сети", "Последний подтверждённый результат доступен до восстановления связи.")
        case "permission-denied": return ("lock.slash", "Доступ не дан", "Основной сценарий остаётся доступен, а системное действие можно повторить позже.")
        case "permission-granted": return ("checkmark.circle", "Доступ выполнен", "Системный результат связан с продуктовой сущностью.")
        default: return ("questionmark.circle", title, "Состояние не описано контрактом.")
        }
    }

    var body: some View {
        VStack(spacing: 14) {
            Image(systemName: copy.icon).font(.system(size: 36, weight: .medium)).foregroundStyle(theme.palette.accent)
            Text(copy.title).font(.vkTabTitle)
            Text(copy.detail).font(.vkBody).foregroundStyle(theme.palette.textSecondary).multilineTextAlignment(.center)
            if state == "permission-denied" {
                Button("Открыть настройки") {
                    if let url = URL(string: UIApplication.openSettingsURLString) { UIApplication.shared.open(url) }
                }
                .buttonStyle(.bordered)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(32)
        .background(theme.palette.groupedBackground)
    }
}

private struct NativeV2Surface: View {
    let route: ProductRoute
    @ViewBuilder var body: some View {
        switch route {
${cases}
        }
    }
}

${slice.surfaces.map(surface => compileSurface(surface, core, capabilityByAction, person, rootIds.includes(surface.id))).join("\n")}
${cameraPicker}
`;
}

function compileUITests(core, slice, capabilityPlan) {
  const surfaceByAction = new Map(slice.surfaces.flatMap(surface => surface.actionIds.map(id => [id, surface.id])));
  const capabilityByAction = new Map(capabilityPlan.bindings.map(item => [item.actionId, item]));
  const transitionByAction = new Map((slice.transitions || []).map(item => [item.actionId, item.to]));
  const declaredJourneys = slice.acceptanceJourneys || [slice.acceptanceJourney];
  const journeys = slice.acceptanceJourneys
    ? declaredJourneys.filter((journey, index) => index === 0 || journey.actionIds.some(actionId => !capabilityByAction.has(actionId)))
    : declaredJourneys;
  const journeyTests = journeys.map((journey, index) => {
    const startSurface = surfaceByAction.get(journey.actionIds[0]) || slice.surfaces[0].id;
    const lastAction = journey.actionIds.at(-1);
    const resultSurface = transitionByAction.get(lastAction) || surfaceByAction.get(lastAction) || startSurface;
    const steps = journey.actionIds.map(actionId => {
      const surface = surfaceByAction.get(actionId);
      return `        app.buttons[${swiftString(`action.${surface}.${actionId}`)}].tap()`;
    }).join("\n");
    const method = index === 0 ? "testProductProof" : `testJourney${swiftType(journey.id || `journey-${index + 1}`)}`;
    const capabilityEnvironment = journey.actionIds.map(actionId => capabilityByAction.get(actionId)).filter(Boolean)
      .map(binding => `        app.launchEnvironment["NATIVE_UI_TEST_PERMISSION_${binding.key.toUpperCase()}"] = "granted"`).join("\n");
    return `    func ${method}() {
        let app = XCUIApplication()
        app.launchEnvironment["NATIVE_UI_TESTING"] = "1"
${capabilityEnvironment}
        app.launchArguments = ["-shot", ${swiftString(startSurface)}, "-state", "populated/default"]
        app.launch()
${steps}
        let result = app.descendants(matching: .any)
            .matching(NSPredicate(format: "identifier BEGINSWITH %@", ${swiftString(`surface.${resultSurface}`)}))
            .firstMatch
        XCTAssertTrue(result.exists)
    }`;
  }).join("\n\n");
  const representativeBindings = [];
  const representedSurfaces = new Set();
  for (const binding of capabilityPlan.bindings.filter(item => surfaceByAction.has(item.actionId))) {
    const surface = surfaceByAction.get(binding.actionId);
    if (!representedSurfaces.has(surface)) {
      representedSurfaces.add(surface);
      representativeBindings.push(binding);
    }
  }
  const permissionTests = representativeBindings.map(item => {
    const surface = surfaceByAction.get(item.actionId);
    const grantedDestination = transitionByAction.get(item.actionId);
    const name = `testPermission${swiftType(item.key)}`;
    return `    func ${name}GrantedAndDenied() {
        for answer in ["granted", "denied"] {
            let app = XCUIApplication()
            app.launchEnvironment["NATIVE_UI_TESTING"] = "1"
            app.launchEnvironment["NATIVE_UI_TEST_PERMISSION_${item.key.toUpperCase()}"] = answer
            app.launchArguments = ["-shot", ${swiftString(surface)}, "-state", "populated/default"]
            app.launch()
            app.buttons[${swiftString(`action.${surface}.${item.actionId}`)}].tap()
${grantedDestination ? `            if answer == "granted" {
                XCTAssertTrue(app.descendants(matching: .any)
                    .matching(NSPredicate(format: "identifier BEGINSWITH %@", ${swiftString(`surface.${grantedDestination}`)}))
                    .firstMatch.waitForExistence(timeout: 2))
            } else {
                XCTAssertTrue(app.descendants(matching: .any)["outcome.permission.${item.key}.denied"].waitForExistence(timeout: 2))
            }` : `            XCTAssertTrue(app.descendants(matching: .any)["outcome.permission.${item.key}.\\(answer)"].waitForExistence(timeout: 2))`}
            app.terminate()
        }
    }`;
  }).join("\n\n");
  const tabStabilityTest = slice.rootTabs ? `
    func testRootTabsStayVisibleInCapturedStates() {
        let app = XCUIApplication()
        app.launchEnvironment["NATIVE_UI_TESTING"] = "1"
        app.launchArguments = ["-shot", ${swiftString(slice.rootTabs[2]?.surfaceId || slice.rootTabs[0].surfaceId)}, "-state", "permission-denied"]
        app.launch()
${slice.rootTabs.map(tab => `        XCTAssertTrue(app.tabBars.buttons[${swiftString(tab.title)}].isHittable)`).join("\n")}
    }
` : "";
  return `import XCTest

final class ${swiftType(core.id, slice.acceptanceJourneys ? "FullTests" : "SliceTests")}: XCTestCase {
    // Static coverage is audited for every compiled capability; XCUI executes one
    // granted/denied representative per feature surface to keep cold runs bounded.
    static let capabilityCoverage = [${capabilityPlan.bindings.map(item => swiftString(item.key)).join(", ")}]
${journeyTests}

${permissionTests}
${tabStabilityTest}
}
`;
}

export function compileNativeKernelV2({ productCoreArtifact, capabilityPlan, sliceContract }) {
  const core = productCoreArtifact?.core;
  if (!core || !capabilityPlan || !sliceContract) throw new TypeError("Native Kernel v2 needs verified product, capability and slice contracts");
  const cleanSwift = contents => `${contents.replace(/[ \t]+$/gm, "").trimEnd()}\n`;
  const files = [
    { path: "NativeV2App.swift", contents: compileApp(core) },
    { path: "NativeV2ProductStore.swift", contents: compileStore(core, sliceContract, capabilityPlan) },
    { path: "NativeV2ProductScreens.swift", contents: compileScreens(core, sliceContract, capabilityPlan) },
  ].map(file => Object.freeze({ ...file, contents: cleanSwift(file.contents) }));
  const uiTestFiles = [{ path: `${swiftType(core.id, "SliceTests")}.swift`, contents: compileUITests(core, sliceContract, capabilityPlan) }]
    .map(file => Object.freeze({ ...file, contents: cleanSwift(file.contents) }));
  const captureCatalog = Object.freeze({
    schemaVersion: 1,
    scope: sliceContract.rootTabs ? "full-expansion" : "vertical-slice",
    drivers: Object.freeze(sliceContract.surfaces.flatMap(surface => surface.states.map(state => Object.freeze({
      surface: surface.id,
      state,
      launch: surface.id,
      artifact: `${surface.id.replaceAll("_", "-")}--${state.replaceAll(/[^a-z0-9]+/gi, "-")}`,
      reviewPriority: state === "populated/default" ? "core" : "risk",
    })))),
  });
  const body = { files, uiTestFiles, captureCatalog };
  return Object.freeze({
    ...body,
    receipt: Object.freeze({
      compiler: "native-kernel-v2",
      sourceHash: createHash("sha256").update(JSON.stringify(body)).digest("hex"),
      modelGeneratedSwift: false,
      compilerOwned: Object.freeze(["app-shell", "authentication", "routes", "reducers", "permission-wiring", "capture", "xcui-skeleton"]),
      surfaceCount: sliceContract.surfaces.length,
      actionCount: new Set(sliceContract.surfaces.flatMap(item => item.actionIds)).size,
      capabilityCount: capabilityPlan.bindings.length,
      scope: sliceContract.rootTabs ? "full-expansion" : "vertical-slice",
    }),
  });
}

export function compileNativeSliceBlueprintV2({ productCoreArtifact, capabilityPlan, sliceContract, targetProduct = "vkontakte", strategy = "mimicry" }) {
  const core = productCoreArtifact?.core;
  if (!core) throw new TypeError("Native slice blueprint needs a verified Product Core artifact");
  const actionById = new Map(core.world.actions.map(item => [item.id, item]));
  const owned = new Set(sliceContract.surfaces.flatMap(item => item.actionIds));
  const screens = sliceContract.surfaces.map((surface, index) => ({
    id: surface.id,
    title: surface.title,
    recipe: surface.recipe,
    presentation: index === 0 ? "tab" : "push",
    ...(index === 0 ? {} : { parent: sliceContract.surfaces[index - 1].id }),
    actionIds: [...surface.actionIds],
    entityIds: [...new Set(surface.actionIds
      .map(id => actionById.get(id)?.entityId).filter(Boolean))],
  }));
  const capabilities = capabilityPlan.bindings.map(binding => ({
    key: binding.key,
    actionId: binding.actionId,
    purpose: binding.purpose,
    requestMoment: binding.requestMoment,
    platformEffect: binding.platformEffect,
    observableResult: binding.outcome.proof,
    fallback: binding.fallback,
    testScenario: binding.testScenario,
    outcome: structuredClone(binding.outcome),
    ...(binding.configuration ? { configuration: structuredClone(binding.configuration) } : {}),
  }));
  return Object.freeze({
    schemaVersion: 1,
    deliveryMode: "slice",
    capabilityPolicy: "bounded",
    id: core.id,
    name: core.name,
    thesis: core.thesis,
    audience: structuredClone(core.audience),
    targetProduct,
    strategy,
    world: {
      entities: structuredClone(core.world.entities),
      actions: structuredClone(core.world.actions.filter(action => owned.has(action.id))),
    },
    coreLoop: {
      actionIds: core.proof.steps.map(item => item.actionId),
      returnReason: core.coreLoop.returnReason,
    },
    socialGrammar: {
      primarySurface: "feed",
      authorship: "person-or-community",
      feedbackModes: ["reaction", "share"],
      distribution: "Новые изменения знакомых людей идут первыми, затем завершённые обещания и продолжения.",
    },
    navigation: {
      rootTabs: [{ screenId: screens[0].id, title: screens[0].title, icon: "house" }],
      screens,
    },
    capabilities,
    states: sliceContract.surfaces.map(surface => ({ screenId: surface.id, variants: [...surface.states] })),
    localization: sliceContract.surfaces.flatMap(surface => [
      { key: `screen.${surface.id}.title`, source: surface.title, context: `Заголовок экрана ${surface.title}`, screenIds: [surface.id] },
      { key: `screen.${surface.id}.body`, source: surface.content.body, context: `Основной текст экрана ${surface.title}`, screenIds: [surface.id] },
    ]),
    fixtures: sliceContract.surfaces.map(surface => ({
      id: `fixture-${surface.id}`, entityId: core.world.entities[0].id, purpose: `Канонический контент экрана ${surface.title}`,
      values: [{ key: "headline", value: surface.content.headline }, { key: "body", value: surface.content.body }],
    })),
    acceptanceScenarios: [{
      id: sliceContract.acceptanceJourney.id || "product-proof",
      title: "Доказательство продуктового механизма",
      startScreenId: screens[0].id,
      actionIds: [...sliceContract.acceptanceJourney.actionIds],
      observableResult: core.proof.steps.at(-1).observable,
      failureRecovery: "Последний подтверждённый шаг остаётся видимым, действие можно повторить без потери введённых данных.",
    }],
    delivery: {
      accessibility: ["Порядок чтения следует видимой иерархии", "Все действия имеют имена", "Минимальная цель 44pt", "Dynamic Type не обрезает результат", "Статусы не зависят только от цвета"],
      privacy: { data: ["Локальные действия", "Статус доступа"], principles: ["Минимизация данных", "Контекстный запрос", "Локальное хранение"], retention: "Демо-данные хранятся локально и удаляются вместе с приложением." },
      analytics: { events: ["slice_opened", "core_action", "result_seen", "permission_requested", "fallback_used"], successMetrics: ["Доля завершённых срезов", "Время до результата", "Доля успешных fallback"] },
      risks: ["Механизм может быть непонятен без знакомого автора", "Результат может оказаться ниже первого экрана", "Permission может перетянуть внимание"],
      assumptions: ["Пользователь узнаёт автора", "Первый результат достижим локально"],
    },
  });
}

export function compileNativeFullBlueprintV2({ productCoreArtifact, capabilityPlan, fullContract, targetProduct = "vkontakte", strategy = "mimicry" }) {
  const core = productCoreArtifact?.core;
  if (!core) throw new TypeError("Native full blueprint needs a verified Product Core artifact");
  const actionById = new Map(core.world.actions.map(item => [item.id, item]));
  const rootIds = new Set(fullContract.rootTabs.map(item => item.surfaceId));
  const screens = fullContract.surfaces.map(surface => ({
    id: surface.id,
    title: surface.title,
    recipe: surface.recipe,
    presentation: rootIds.has(surface.id) ? "tab" : "push",
    ...(rootIds.has(surface.id) ? {} : { parent: fullContract.rootTabs[0].surfaceId }),
    actionIds: [...surface.actionIds],
    entityIds: [...new Set(surface.actionIds.map(id => actionById.get(id)?.entityId).filter(Boolean))],
  }));
  const capabilities = capabilityPlan.bindings.map(binding => ({
    key: binding.key,
    actionId: binding.actionId,
    purpose: binding.purpose,
    requestMoment: binding.requestMoment,
    platformEffect: binding.platformEffect,
    observableResult: binding.outcome.proof,
    fallback: binding.fallback,
    testScenario: binding.testScenario,
    outcome: structuredClone(binding.outcome),
    ...(binding.configuration ? { configuration: structuredClone(binding.configuration) } : {}),
  }));
  return Object.freeze({
    schemaVersion: 1,
    deliveryMode: "full",
    statePolicy: "applicable",
    capabilityPolicy: "bounded",
    id: core.id,
    name: core.name,
    thesis: core.thesis,
    audience: structuredClone(core.audience),
    targetProduct,
    strategy,
    world: { entities: structuredClone(core.world.entities), actions: structuredClone(core.world.actions) },
    coreLoop: structuredClone(core.coreLoop),
    socialGrammar: {
      primarySurface: "feed", authorship: "person-or-community", feedbackModes: ["reaction", "share"],
      distribution: "Обещания знакомых людей, ответы и завершённые результаты связаны общей социальной лентой.",
    },
    navigation: {
      rootTabs: fullContract.rootTabs.map(tab => ({ screenId: tab.surfaceId, title: tab.title, icon: tab.role })),
      screens,
    },
    capabilities,
    states: fullContract.surfaces.map(surface => ({ screenId: surface.id, variants: [...surface.states] })),
    localization: fullContract.surfaces.flatMap(surface => [
      { key: `screen.${surface.id}.title`, source: surface.title, context: `Заголовок экрана ${surface.title}`, screenIds: [surface.id] },
      { key: `screen.${surface.id}.body`, source: surface.content.body, context: `Основной текст экрана ${surface.title}`, screenIds: [surface.id] },
    ]),
    fixtures: fullContract.surfaces.map(surface => ({
      id: `fixture-${surface.id}`, entityId: actionById.get(surface.actionIds[0])?.entityId || core.world.entities[0].id,
      purpose: `Канонический контент экрана ${surface.title}`,
      values: [{ key: "headline", value: surface.content.headline }, { key: "body", value: surface.content.body }],
    })),
    acceptanceScenarios: fullContract.acceptanceJourneys.map((journey, index) => ({
      id: journey.id || `journey-${index + 1}`,
      title: journey.title || `Приёмочный сценарий ${index + 1}`,
      startScreenId: actionById.has(journey.actionIds[0])
        ? screens.find(screen => screen.actionIds.includes(journey.actionIds[0]))?.id
        : screens[0].id,
      actionIds: [...journey.actionIds],
      observableResult: journey.observableResult || actionById.get(journey.actionIds.at(-1))?.outcome || "Видимый продуктовый результат",
      failureRecovery: journey.failureRecovery || "Последний подтверждённый шаг сохраняется, действие можно повторить.",
    })),
    delivery: {
      accessibility: ["Порядок чтения следует иерархии", "Все действия имеют имена", "Минимальная цель 44pt", "Dynamic Type не обрезает результат", "Статусы не зависят от цвета"],
      privacy: { data: ["Локальные действия", "Статусы доступов"], principles: ["Минимизация данных", "Контекстный запрос", "Локальное хранение"], retention: "Демо-данные удаляются вместе с приложением." },
      analytics: { events: ["app_opened", "core_action", "result_seen", "permission_requested", "fallback_used"], successMetrics: ["Завершение core loop", "Время до результата"] },
      risks: ["Механизм может быть непонятен без знакомого автора", "Результат может уйти ниже fold", "Permission может перетянуть внимание"],
      assumptions: ["Пользователь узнаёт автора", "Первый результат достижим локально"],
    },
  });
}
