import Contacts
import EventKit
import Security
import SwiftUI
import VisionKit

struct DvorProfileScreen: View {
    @Environment(HouseStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @Environment(Session.self) private var session
    var body: some View {
        VStack(spacing: 0) {
            VStack(spacing: 12) {
                Avatar(name: store.currentResident.name, size: 76)
                Text(store.currentResident.name).font(.system(size: 24, weight: .bold))
                Text("\(store.currentResident.apartment) · \(session.canWriteToHouse ? "адрес подтверждён" : "адрес на проверке")")
                    .font(.vkBody).foregroundStyle(t.textSecondary)
                Label(store.houseName, systemImage: "checkmark.seal")
                    .font(.system(size: 15, weight: .medium)).foregroundStyle(t.accent)
            }.padding(.vertical, 28)
            GroupGap()
            VKRow(title: "Мои публикации", value: "\(store.matters.filter { $0.author == store.currentResident }.count)", chevron: false)
            RowSeparator()
            VKRow(title: "Квартира", value: store.currentResident.apartment, chevron: false)
            Spacer()
        }
        .vkNavigation("Профиль") {
            Button("Готово") { nav.dismiss() }.font(.system(size: 15, weight: .medium))
        }
    }
}

struct NeighbourProfileScreen: View {
    let resident: Resident
    @Environment(HouseStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t

    private var residentMatters: [HouseMatter] {
        store.matters.filter { $0.author.name == resident.name }
    }
    private var sharedConversations: Int {
        max(1, store.conversations.filter { $0.subtitle.contains("сосед") }.count - 1)
    }
    private var replyCount: Int {
        store.matters.reduce(0) { $0 + $1.replies.filter { $0.author.name == resident.name }.count }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                VStack(spacing: 12) {
                    Avatar(name: resident.name, size: 76)
                    Text(resident.name).font(.system(size: 24, weight: .bold))
                    Text([resident.apartment, resident.role].compactMap { $0 }.joined(separator: " · "))
                        .font(.vkBody).foregroundStyle(t.textSecondary)
                    Label("Подтверждённый житель", systemImage: "checkmark.seal.fill")
                        .font(.system(size: 15, weight: .medium)).foregroundStyle(t.accent)
                }
                .padding(.vertical, 28)

                GroupGap()
                VStack(alignment: .leading, spacing: 10) {
                    Text("Общение остаётся в Дворе: номер телефона и точный адрес квартиры не раскрываются.")
                        .font(.vkBody).foregroundStyle(t.textSecondary)
                    DvorPrimaryButton(title: "Написать сообщение", icon: "bubble.left.fill") {
                        nav.push(DvorRoute.chat(store.conversation(with: resident)))
                    }
                    .nativeAction("profile.open-neighbor-chat")
                }
                .padding(t.pad)

                // Хвост профиля: чем сосед занят в доме. Без него экран —
                // визитка на треть высоты и пустое поле под ней.
                if !residentMatters.isEmpty {
                    GroupGap()
                    HStack(spacing: 8) {
                        Text("Дела соседа").font(.system(size: 17, weight: .semibold))
                        Text("\(residentMatters.count)").font(.vkMeta).foregroundStyle(t.textSecondary)
                        Spacer()
                    }
                    .padding(.horizontal, t.pad).padding(.top, 14).padding(.bottom, 4)

                    ForEach(residentMatters) { matter in
                        Button { nav.push(DvorRoute.matter(matter)) } label: {
                            DvorRow(title: matter.title,
                                    subtitle: "\(matter.published) · \(matter.status.rawValue.lowercased())",
                                    icon: matter.kind.systemImage)
                        }
                        .buttonStyle(.plain)
                        RowSeparator(leading: 60)
                    }
                }

                GroupGap()
                VKRow(title: "В доме", value: "с 2019 года", chevron: false)
                RowSeparator()
                VKRow(title: "Общие чаты", value: "\(sharedConversations)", chevron: false)
                RowSeparator()
                VKRow(title: "Ответы соседям", value: "\(replyCount) за месяц", chevron: false)
                Color.clear.frame(height: 24)
            }
        }
        .background(t.background)
        .vkNavigation("Профиль соседа")
    }
}

struct MeterScreen: View {
    @Environment(HouseStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var permissions
    @Environment(\.theme) private var t
    @State private var deadlineUpdates = false
    @State private var submitted = DvorShotMode.state == "submitted"
    @State private var isSubmitting = false
    @State private var fieldError: String?
    var body: some View {
        @Bindable var store = store
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                if submitted {
                    DvorScreenIntro(title: "Показания сохранены", detail: "Квитанция хранится на устройстве. Следующий срок — до 25 сентября.")
                    VStack(spacing: 0) {
                        meterReceiptRow("Холодная вода", value: "\(store.coldWater) м³")
                        RowSeparator()
                        meterReceiptRow("Горячая вода", value: "\(store.hotWater) м³")
                        RowSeparator()
                        meterReceiptRow("Электричество", value: "\(store.electricity) кВт⋅ч")
                    }
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(t.separator))
                    VKButton(title: "Готово") { nav.pop() }
                } else {
                    DvorScreenIntro(title: "Записать до 25 августа", detail: "Двор сохранит значения и квитанцию на этом устройстве.")
                    if DvorShotMode.state == "editing" {
                        AppStatePanel(kind: .success, title: "Черновик изменён", detail: "Новые значения сохраняются на этом устройстве до отправки.")
                    } else if DvorShotMode.state == "error" {
                        AppStatePanel(kind: .error, title: "Не удалось сохранить", detail: "Проверьте значения и повторите попытку.")
                    }
                    if let fieldError {
                        AppStatePanel(kind: .warning, title: "Проверьте показания", detail: fieldError)
                    }
                    meterField("Холодная вода", unit: "м³", text: $store.coldWater)
                    meterField("Горячая вода", unit: "м³", text: $store.hotWater)
                    meterField("Электричество", unit: "кВт⋅ч", text: $store.electricity)
                DvorPrimaryButton(title: "Сохранить показания", loadingTitle: "Сохраняем…", isLoading: isSubmitting) {
                        guard let error = validationError else {
                            isSubmitting = true
                            Task {
                                try? await Task.sleep(for: .milliseconds(650))
                                UserDefaults.standard.set(store.coldWater, forKey: "dvor.meters.cold")
                                UserDefaults.standard.set(store.hotWater, forKey: "dvor.meters.hot")
                                UserDefaults.standard.set(store.electricity, forKey: "dvor.meters.electricity")
                                UserDefaults.standard.set(Date(), forKey: "dvor.meters.lastSubmission")
                                submitted = true
                                isSubmitting = false
                            }
                            return
                        }
                        fieldError = error
                    }
                    .nativeAction("meters.save-readings")
                    Toggle("Напомнить о следующем сроке", isOn: $deadlineUpdates)
                        .font(.system(size: 15))
                        .nativeAction("meters.enable-reminder")
                    Text("Прошлые показания: 112 · 73 · 3744").font(.vkMeta).foregroundStyle(t.textSecondary)
                }
            }.padding(t.pad)
        }.vkNavigation("Счётчики")
        .onChange(of: deadlineUpdates) { _, enabled in
            guard enabled else {
                permissions.cancelMeterDeadlineUpdates()
                return
            }
            Task {
                let granted = await permissions.requestMeterDeadlineUpdates()
                if !granted { deadlineUpdates = false }
                nav.toast(granted ? "Напомним о следующем сроке" : "Срок останется виден на экране счётчиков")
            }
        }
    }
    private var validationError: String? {
        let inputs = [store.coldWater, store.hotWater, store.electricity]
        let values = inputs.compactMap { Double($0.replacingOccurrences(of: ",", with: ".")) }
        guard values.count == 3 else { return "Используйте только числа, например 128 или 128,5." }
        guard values[0] >= 112, values[1] >= 73, values[2] >= 3744 else {
            return "Новые значения не могут быть меньше прошлых: 112 · 73 · 3744."
        }
        guard values[0] < 10_000, values[1] < 10_000, values[2] < 100_000 else {
            return "Похоже на опечатку. Сверьте цифры со счётчиками."
        }
        return nil
    }
    private func meterField(_ title: String, unit: String, text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title).font(.system(size: 15, weight: .medium))
            HStack {
                TextField("0", text: text).keyboardType(.decimalPad).font(.system(size: 22, weight: .semibold))
                Text(unit).font(.vkBody).foregroundStyle(t.textSecondary)
            }.padding(.horizontal, 12).frame(height: 46).background(t.fill, in: RoundedRectangle(cornerRadius: DvorStyle.controlRadius))
        }
    }

    private func meterReceiptRow(_ title: String, value: String) -> some View {
        HStack {
            Text(title).font(.system(size: 15, weight: .medium))
            Spacer()
            Text(value).font(.system(size: 15)).foregroundStyle(t.textSecondary)
        }
        .padding(.horizontal, 14)
        .frame(minHeight: 48)
    }
}

struct GuestAccessScreen: View {
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var permissions
    @Environment(\.theme) private var t
    @State private var connected = DvorShotMode.state == "connected"
    @State private var revealPassword = false
    @State private var showScanner = DvorShotMode.screen == "scan"
    @State private var isConnecting = DvorShotMode.state == "connecting"
    @State private var guestPassword: String?
    @State private var accessError: String?
    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            DvorScreenIntro(title: "Гостевой Wi‑Fi", detail: "Подключите гостя без диктовки пароля. Доступ действует до полуночи.")
            if DvorShotMode.state == "error" {
                AppStatePanel(kind: .error, title: "Не удалось подключиться", detail: "Имя сети и пароль можно открыть для ручного входа.")
            }
            if let accessError {
                AppStatePanel(kind: .warning, title: "Гостевой доступ пока не выдан", detail: accessError)
            }
            DvorCard {
                VStack(spacing: 0) {
                    DvorRow(title: "Сеть", value: "Dvor-Guest", chevron: false)
                    Button { revealPassword.toggle() } label: {
                        DvorRow(title: "Пароль", value: revealPassword ? (guestPassword ?? "Не выдан") : "Показать", chevron: false)
                    }
                    .buttonStyle(.plain).accessibilityLabel(revealPassword ? "Скрыть пароль" : "Показать пароль")
                }
            }
            if connected {
                AppStatePanel(kind: .success, title: "Устройство подключено", detail: "Гостевой доступ действует до полуночи.")
            } else {
                DvorPrimaryButton(title: "Подключить это устройство", loadingTitle: "Подключаем устройство…", isLoading: isConnecting) {
                    Task {
                        guard let guestPassword else {
                            accessError = "Старшая по дому ещё не опубликовала пароль в защищённом хранилище."
                            return
                        }
                        isConnecting = true
                        let ok = await permissions.connectToGuestNetwork(password: guestPassword)
                        connected = ok
                        isConnecting = false
                        nav.toast(ok ? "Гостевая сеть подключена" : "Покажем имя и пароль для ручного входа")
                    }
                }
                .nativeAction("guest.connect-guest")
            }
            VKOutlineButton(title: "Сканировать QR гостя", icon: "qrcode.viewfinder") {
                Task {
                    let granted = await permissions.requestCameraForEvidence()
                    if granted { showScanner = true }
                    else { revealPassword = true }
                }
            }
            .disabled(isConnecting)
            .nativeAction("guest.scan-guest-qr")
            Spacer()
        }
        .padding(t.pad).background(DvorStyle.card).vkNavigation("Гостевая сеть")
        .task { guestPassword = HouseSecretStore.password(for: "guest") }
        .sheet(isPresented: $showScanner) {
            GuestQRScannerScreen { payload in
                Task {
                    connected = await permissions.connectToGuestNetwork(qrPayload: payload)
                    if connected { showScanner = false }
                }
            }
        }
    }
}

private enum HouseSecretStore {
    static func password(for account: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: "com.camo.dvor.house-access",
            kSecAttrAccount as String: account,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]
        var result: CFTypeRef?
        guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
              let data = result as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }
}

struct GuestQRScannerScreen: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(Permissions.self) private var permissions
    @Environment(\.theme) private var t
    let onConnected: (String) -> Void
    @State private var scannedCode: String?

    var body: some View {
        VStack(spacing: 0) {
            DvorModalChrome(title: "Сканировать QR", onCancel: { dismiss() })

            if let scannedCode {
                VStack(spacing: 16) {
                    Spacer()
                    if let network = permissions.guestNetworkName(qrPayload: scannedCode) {
                        AppStatePanel(kind: .success, title: "Найдена гостевая сеть", detail: "Подключиться к \(network)?")
                        DvorPrimaryButton(title: "Подключиться") { onConnected(scannedCode) }
                        VKOutlineButton(title: "Сканировать другой код", tinted: false) { self.scannedCode = nil }
                    } else {
                        AppStatePanel(kind: .error, title: "Это не QR гостевой сети", detail: "Двор подключается только к сети Dvor-Guest этого дома.")
                        DvorPrimaryButton(title: "Сканировать снова") { self.scannedCode = nil }
                    }
                    Spacer()
                }
                .padding(24)
            } else if DataScannerViewController.isSupported && DataScannerViewController.isAvailable {
                GuestQRDataScanner { code in
                    scannedCode = code
                }
                .overlay {
                    RoundedRectangle(cornerRadius: 24, style: .continuous)
                        .stroke(.white, lineWidth: 3).frame(width: 238, height: 238)
                }
                .overlay(alignment: .bottom) {
                    Text("Наведите камеру на QR-код гостевой сети")
                        .font(.system(size: 15, weight: .medium)).foregroundStyle(.white)
                        .padding(.horizontal, 16).frame(minHeight: 44)
                        .background(.black.opacity(0.58), in: Capsule()).padding(.bottom, 28)
                }
            } else {
                VStack(spacing: 16) {
                    Image(systemName: "camera.fill").font(.system(size: 32)).foregroundStyle(t.accent)
                    Text("Сканер недоступен на этом устройстве").font(.system(size: 18, weight: .semibold))
                    Text("Откройте пароль гостевой сети и подключитесь вручную.")
                        .font(.system(size: 15)).foregroundStyle(t.textSecondary).multilineTextAlignment(.center)
                    VKButton(title: "Вернуться к паролю") { dismiss() }
                }
                .padding(24).frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .background(t.background)
    }
}

struct GuestQRDataScanner: UIViewControllerRepresentable {
    let onCode: (String) -> Void

    func makeCoordinator() -> Coordinator { Coordinator(onCode: onCode) }

    func makeUIViewController(context: Context) -> DataScannerViewController {
        let controller = DataScannerViewController(
            recognizedDataTypes: [.barcode(symbologies: [.qr])],
            qualityLevel: .balanced,
            recognizesMultipleItems: false,
            isHighFrameRateTrackingEnabled: true,
            isPinchToZoomEnabled: true,
            isGuidanceEnabled: true,
            isHighlightingEnabled: true
        )
        controller.delegate = context.coordinator
        try? controller.startScanning()
        return controller
    }

    func updateUIViewController(_ uiViewController: DataScannerViewController, context: Context) {}

    final class Coordinator: NSObject, DataScannerViewControllerDelegate {
        let onCode: (String) -> Void
        private var delivered = false
        init(onCode: @escaping (String) -> Void) { self.onCode = onCode }

        func dataScanner(_ dataScanner: DataScannerViewController, didAdd addedItems: [RecognizedItem], allItems: [RecognizedItem]) {
            guard !delivered else { return }
            for item in addedItems {
                guard case let .barcode(code) = item, let value = code.payloadStringValue else { continue }
                delivered = true
                onCode(value)
                return
            }
        }
    }
}

struct EventsScreen: View {
    @Environment(HouseStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var permissions
    @Environment(\.theme) private var t
    @State private var addedEvents = Set<UUID>()
    @State private var calendarError: String?
    @State private var eventBeingAdded: UUID?
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                if store.events.isEmpty {
                    DvorPageState(kind: .empty, title: "Событий пока нет", detail: "Собрания и работы по дому появятся здесь.")
                } else if DvorShotMode.state == "added" {
                    AppStatePanel(kind: .success, title: "Событие добавлено", detail: "Собрание появилось в системном календаре.")
                        .padding(.horizontal, t.pad)
                } else if DvorShotMode.state == "error" {
                    AppStatePanel(kind: .error, title: "Календарь недоступен", detail: "Дата и время останутся видны в Дворе.")
                        .padding(.horizontal, t.pad)
                }
                if let calendarError {
                    AppStatePanel(kind: .error, title: "Не удалось добавить событие", detail: calendarError)
                        .padding(.horizontal, t.pad)
                }
                eventSection(title: "Ближайшие", events: store.upcomingEvents)
                eventSection(title: "Прошедшие", events: store.pastEvents, past: true)
            }
        }
        .vkNavigation("События дома")
        .task { restoreCalendarState() }
    }

    @ViewBuilder
    private func eventSection(title: String, events: [HouseEvent], past: Bool = false) -> some View {
        if !events.isEmpty {
            HStack(spacing: 8) {
                Text(title).font(.system(size: 17, weight: .semibold)).foregroundStyle(t.textPrimary)
                Text("\(events.count)").font(.vkMeta).foregroundStyle(t.textSecondary)
                Spacer()
            }
            .padding(.horizontal, t.pad).padding(.top, 16).padding(.bottom, 6)

            ForEach(events) { event in
                    HStack(alignment: .top, spacing: 14) {
                        Text(event.day).font(.system(size: 14, weight: .semibold)).foregroundStyle(t.accent).frame(width: 56, alignment: .leading)
                        VStack(alignment: .leading, spacing: 4) {
                            Text(event.title).font(.system(size: 17, weight: .semibold))
                            Text(event.detail).font(.vkMeta).foregroundStyle(t.textSecondary)
                            Button(eventBeingAdded == event.id ? "Добавляем…" : (addedEvents.contains(event.id) ? "Добавлено в календарь" : "Добавить в календарь")) {
                                Task {
                                    eventBeingAdded = event.id
                                    let granted = await permissions.request(.calendar)
                                    guard granted else {
                                        calendarError = "Разрешите доступ к календарю в настройках iPhone или добавьте дату вручную."
                                        eventBeingAdded = nil
                                        return
                                    }
                                    do {
                                        let identifier = try saveToCalendar(event)
                                        EventCalendarRegistry.store(identifier: identifier, for: event.id)
                                        addedEvents.insert(event.id)
                                        calendarError = nil
                                    } catch {
                                        calendarError = "Календарь не сохранил событие. Дата и место останутся видны в Дворе."
                                    }
                                    eventBeingAdded = nil
                                }
                            }
                            .font(.vkMeta).padding(.top, 4)
                            .disabled(addedEvents.contains(event.id) || eventBeingAdded != nil)
                            .nativeAction("events.add-calendar")
                            .opacity(past ? 0 : 1)
                            .frame(height: past ? 0 : nil)
                            if past {
                                Text("прошло").font(.vkMeta).foregroundStyle(t.textSecondary)
                            }
                        }
                        Spacer()
                    }.padding(t.pad)
                    .opacity(past ? 0.55 : 1)
                    RowSeparator(leading: 86)
            }
        }
    }

    private func saveToCalendar(_ houseEvent: HouseEvent) throws -> String {
        let eventStore = EKEventStore()
        let event = EKEvent(eventStore: eventStore)
        event.title = houseEvent.title
        event.location = store.address
        guard let calendar = eventStore.defaultCalendarForNewEvents else {
            throw CocoaError(.featureUnsupported)
        }
        event.startDate = houseEvent.startsAt
        event.endDate = houseEvent.startsAt.addingTimeInterval(houseEvent.duration)
        event.location = houseEvent.location
        event.calendar = calendar
        event.notes = "Событие дома: \(store.address)"
        try eventStore.save(event, span: .thisEvent, commit: true)
        guard let identifier = event.eventIdentifier else { throw CocoaError(.fileWriteUnknown) }
        return identifier
    }

    private func restoreCalendarState() {
        let eventStore = EKEventStore()
        addedEvents = Set(store.events.compactMap { event in
            guard let identifier = EventCalendarRegistry.identifier(for: event.id),
                  eventStore.event(withIdentifier: identifier) != nil else { return nil }
            return event.id
        })
    }
}

private enum EventCalendarRegistry {
    private static let key = "dvor.calendar.event-identifiers"

    static func identifier(for eventID: UUID) -> String? {
        records()[eventID.uuidString]
    }

    static func store(identifier: String, for eventID: UUID) {
        var value = records()
        value[eventID.uuidString] = identifier
        UserDefaults.standard.set(value, forKey: key)
    }

    private static func records() -> [String: String] {
        UserDefaults.standard.dictionary(forKey: key) as? [String: String] ?? [:]
    }
}

struct HouseAccessScreen: View {
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var permissions
    @Environment(\.theme) private var t
    @State private var accessCheck: Bool? = DvorShotMode.state == "populated" ? true : nil
    @State private var isChecking = false
    @State private var secretsMissing = false
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                if DvorShotMode.state == "empty" {
                    DvorPageState(kind: .empty, title: "Доступов пока нет", detail: "Домофон и калитка появятся после подтверждения квартиры.")
                } else if DvorShotMode.state == "locked" || accessCheck != true {
                    AppStatePanel(kind: .warning, title: "Доступы заблокированы", detail: "Разблокируйте iPhone, чтобы увидеть коды дома.")
                        .padding(.horizontal, t.pad)
                } else {
                    accessRow("Домофон", value: "48 · вызов")
                    RowSeparator()
                    accessRow("Калитка со двора", value: "••••")
                    RowSeparator()
                    accessRow("Гостевая сеть", value: "Dvor-Guest")
                }
                GroupGap()
                Text("Коды защищены блокировкой устройства и доступны системному AutoFill. Двор не показывает их неподтверждённым жильцам.")
                    .font(.vkMeta).foregroundStyle(t.textSecondary).padding(t.pad)
                if let accessCheck {
                    AppStatePanel(kind: accessCheck ? .success : .warning,
                        title: accessCheck ? "Доступы защищены" : (secretsMissing ? "Доступы ещё не выданы" : "Нужно включить AutoFill"),
                        detail: accessCheck
                            ? "Коды дома готовы для безопасного автозаполнения."
                            : (secretsMissing
                               ? "После публикации домом они появятся в защищённой связке ключей."
                               : "Откройте настройки iPhone → Пароли → Автозаполнение.")
                    )
                    .padding(.horizontal, t.pad).padding(.bottom, 12)
                }
                DvorPrimaryButton(title: accessCheck == true ? "Доступы разблокированы" : "Разблокировать доступы",
                                  loadingTitle: "Проверяем защиту…", isLoading: isChecking,
                                  isDisabled: accessCheck == true) {
                    Task {
                        isChecking = true
                        let deviceOwner = await permissions.authenticateDeviceOwner(reason: "Показать защищённые доступы дома")
                        let group = await permissions.request(.appgroups)
                        let keychain = await permissions.request(.keychain)
                        let autofill = await permissions.request(.autofill)
                        let provisioned = HouseSecretStore.password(for: "door") != nil
                            || HouseSecretStore.password(for: "guest") != nil
                        secretsMissing = !provisioned
                        accessCheck = deviceOwner && group && keychain && autofill && provisioned
                        isChecking = false
                        nav.toast(accessCheck == true
                                  ? "Доступы защищены и готовы к AutoFill"
                                  : (secretsMissing ? "Дом ещё не выдал доступы" : "Включите Двор в «Пароли и автозаполнение»"))
                    }
                }.padding(.horizontal, t.pad)
                    .nativeAction("passwords.unlock-access")
            }
        }.vkNavigation("Доступы дома")
    }
    private func accessRow(_ title: String, value: String) -> some View { VKRow(title: title, value: value, chevron: false) }
}

struct NeighboursScreen: View {
    @Environment(Permissions.self) private var permissions
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var contactsMatched: Bool?
    @State private var matchedNames = Set<String>()
    @State private var isMatching = false
    @Environment(HouseStore.self) private var store
    private var people: [Resident] { store.neighbours }
    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                Text("Номера квартир видят только подтверждённые жильцы. Телефоны и точные адреса не раскрываются.")
                    .font(.vkMeta).foregroundStyle(t.textSecondary).padding(t.pad)
                VKOutlineButton(title: isMatching ? "Сверяем контакты…" : "Найти знакомых в контактах") {
                    Task {
                        isMatching = true
                        let granted = await permissions.request(.contacts)
                        if granted {
                            matchedNames = fetchContactMatches()
                            contactsMatched = !matchedNames.isEmpty
                        } else {
                            contactsMatched = false
                        }
                        isMatching = false
                    }
                }.padding(.horizontal, t.pad).padding(.bottom, 8).disabled(isMatching)
                    .nativeAction("neighbors.match-contacts")
                if let contactsMatched {
                    AppStatePanel(kind: contactsMatched ? .success : .empty,
                        title: contactsMatched ? "Найдены знакомые: \(matchedNames.count)" : "Совпадений не найдено",
                        detail: contactsMatched ? "Совпадения отмечены в списке. Контакты никуда не отправлялись." : "Список соседей доступен без адресной книги."
                    )
                    .padding(.horizontal, t.pad).padding(.bottom, 8)
                }
                if DvorShotMode.state == "empty" {
                    AppStatePanel(kind: .empty, title: "Соседи пока не найдены", detail: "Список появится после подтверждения вашего дома.")
                        .padding(.horizontal, t.pad)
                } else if DvorShotMode.state == "denied" {
                    AppStatePanel(kind: .warning, title: "Контакты недоступны", detail: "Список жильцов работает и без доступа к адресной книге.")
                        .padding(.horizontal, t.pad)
                }
                ForEach(DvorShotMode.state == "empty" ? [] : people) { person in
                    VKPersonRow(name: person.name, subtitle: [person.apartment, person.role].compactMap { $0 }.joined(separator: " · ")) {
                        if matchedNames.contains(person.name) {
                            Image(systemName: "person.crop.circle.badge.checkmark")
                                .foregroundStyle(t.accent).frame(width: 32, height: 44)
                                .accessibilityLabel("Есть в контактах")
                        }
                        VKRowAction(icon: "chevron.right", label: "Открыть профиль") {
                            nav.push(DvorRoute.neighbour(person))
                        }
                        .nativeAction("neighbors.open-neighbor")
                    }
                    RowSeparator(leading: 84)
                }
            }
        }.vkNavigation("Соседи")
    }

    private func fetchContactMatches() -> Set<String> {
        let keys = [CNContactGivenNameKey, CNContactFamilyNameKey] as [CNKeyDescriptor]
        let request = CNContactFetchRequest(keysToFetch: keys)
        var names = Set<String>()
        try? CNContactStore().enumerateContacts(with: request) { contact, _ in
            let fullName = [contact.givenName, contact.familyName].filter { !$0.isEmpty }.joined(separator: " ")
            if people.contains(where: { $0.name.caseInsensitiveCompare(fullName) == .orderedSame }) {
                names.insert(fullName)
            }
        }
        return names
    }
}

struct DvorSettingsScreen: View {
    @Environment(HouseStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var permissions
    @AppStorage("dvor.appLock") private var appLock = false
    @AppStorage("dvor.messageNotifications") private var messageNotifications = false
    @AppStorage("dvor.backgroundUpdates") private var backgroundUpdates = false
    @State private var isHydrating = true
    @AppStorage("dvor.personalizedServices") private var personalizedServicesEnabled = false
    @Environment(Session.self) private var session

    var body: some View {
        ScrollView {
            LazyVStack(spacing: DvorStyle.gap) {
                // Настройки ВК начинаются с карточки аккаунта: аватар, имя,
                // контакт и обводочная кнопка управления.
                VStack(spacing: 8) {
                    Avatar(name: store.currentResident.name, size: 96).padding(.top, 12)
                    Text(store.currentResident.name)
                        .font(.system(size: 22, weight: .semibold)).foregroundStyle(DvorStyle.ink)
                    Text("\(store.currentResident.apartment) · \(store.address)")
                        .font(.system(size: 15)).foregroundStyle(DvorStyle.secondary)
                    VKOutlineButton(title: "Управление аккаунтом", tinted: false) {
                        nav.present(sheet: DvorRoute.profile)
                    }
                    .padding(.horizontal, 16).padding(.top, 6).padding(.bottom, 4)
                }
                .frame(maxWidth: .infinity)
                .background(DvorStyle.card)

                DvorSectionTitle(title: "Мой дом")
                DvorCard {
                    VStack(spacing: 0) {
                        DvorRow(title: "Адрес", subtitle: store.address, icon: "house", value: session.canWriteToHouse ? "Подтверждён" : "На проверке", chevron: false)
                        DvorRow(title: "Домашняя сеть", subtitle: "Используется только для проверки адреса", icon: "wifi", value: "Сохранена", chevron: false)
                    }
                }

                DvorSectionTitle(title: "Уведомления")
                DvorCard {
                    VStack(spacing: 0) {
                        DvorRow(title: "Ответы по делам", subtitle: "Спросим при подписке на дело", icon: "bell", value: statusTitle(permissions.status(.push)), chevron: false)
                        DvorRow(title: "Сообщения соседей", subtitle: "Имя жильца в уведомлении", icon: "bubble.left", toggle: $messageNotifications)
                        DvorRow(title: "Обновлять дом в фоне",
                                subtitle: "Заявки и показания подтянутся до открытия приложения",
                                icon: "arrow.clockwise",
                                toggle: $backgroundUpdates)
                            .nativeAction("settings.enable-background-updates")
                    }
                }

                DvorSectionTitle(title: "Приватность")
                DvorCard {
                    VStack(spacing: 0) {
                        DvorRow(title: "Закрывать приложение", subtitle: "Защитить адрес, квартиры и коды", icon: "faceid", toggle: $appLock)
                            .nativeAction("settings.enable-app-lock")
                        DvorRow(title: "Учитывать интересы", subtitle: "Для местных предложений", icon: "hand.raised", toggle: personalizedServices)
                            .nativeAction("settings.open-personalization")
                    }
                }

                DvorSectionTitle(title: "Дом сейчас")
                DvorCard {
                    VStack(spacing: 0) {
                        DvorRow(title: "Открытые дела", icon: "exclamationmark.circle", value: "\(store.openMatterCount)", chevron: false)
                        DvorRow(title: "Соседи в приложении", icon: "person.2", value: "\(store.neighbourCount)", chevron: false)
                        DvorRow(title: "Последнее обновление", icon: "clock", value: "сейчас", chevron: false)
                    }
                }
            }
            .padding(.bottom, 18)
        }
        .background(DvorStyle.page)
        .vkNavigation("Настройки")
        .onChange(of: appLock) { _, enabled in
            guard !isHydrating, enabled else { return }
            Task {
                let granted = await permissions.request(.faceid)
                if !granted { appLock = false; nav.toast("Останется код-пароль устройства") }
            }
        }
        .onChange(of: backgroundUpdates) { _, enabled in
            guard !isHydrating, enabled else { return }
            Task {
                let granted = await permissions.requestBackgroundHouseUpdates()
                if !granted {
                    backgroundUpdates = false
                    nav.toast("Дом обновится при открытии приложения")
                }
            }
        }
        .onChange(of: messageNotifications) { _, enabled in
            guard !isHydrating, enabled else { return }
            Task {
                let granted = await permissions.requestMessageNotifications()
                if !granted { messageNotifications = false }
                nav.toast(granted ? "Уведомления о сообщениях включены" : "Останутся обычные уведомления")
            }
        }
        .task {
            isHydrating = false
        }
    }

    private var personalizedServices: Binding<Bool> {
        Binding(
            get: { personalizedServicesEnabled },
            set: { enabled in
                if enabled { nav.present(sheet: DvorRoute.ads) }
                else { personalizedServicesEnabled = false }
            }
        )
    }

    private func statusTitle(_ status: Permissions.Status) -> String {
        switch status {
        case .unknown: "Спросим позже"
        case .granted: "Включено"
        case .denied: "Не разрешено"
        }
    }
}

struct DvorAdsScreen: View {
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var permissions
    @Environment(\.theme) private var t
    @AppStorage("dvor.personalizedServices") private var personalizedServicesEnabled = false
    @State private var decision: Bool? = {
        if DvorShotMode.state == "accepted" { return true }
        if DvorShotMode.state == "declined" { return false }
        return nil
    }()

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            DvorScreenIntro(
                title: "Местные предложения",
                detail: "Можно учитывать интересы, чтобы показывать полезные предложения рядом с домом. Адрес и дела соседей рекламодателям не передаются."
            )
            if decision == true {
                DvorPageState(kind: .success, title: "Персонализация включена", detail: "Выбор можно изменить в настройках iPhone.")
            } else if decision == false {
                DvorPageState(kind: .empty, title: "Предложения останутся общими", detail: "Двор работает полностью и без персонализации.")
            } else {
                VKButton(title: "Учитывать интересы") {
                    Task {
                        let granted = await permissions.request(.tracking)
                        personalizedServicesEnabled = granted
                        decision = granted
                        nav.toast(granted ? "Местные предложения стали точнее" : "Предложения останутся общими")
                    }
                }
                .nativeAction("ads.enable-personalization")
                VKOutlineButton(title: "Не сейчас", tinted: false) {
                    personalizedServicesEnabled = false
                    decision = false
                }
                .nativeAction("ads.decline-personalization")
            }
            Spacer()
        }
        .padding(t.pad)
        .vkNavigation("Реклама") {
            Button("Готово") { nav.dismiss() }.font(.system(size: 15, weight: .medium))
        }
    }
}
