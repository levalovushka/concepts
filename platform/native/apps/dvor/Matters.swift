import PhotosUI
import SwiftUI
import UIKit

struct MatterScreen: View {
    let matterID: UUID
    @Environment(HouseStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var permissions
    @Environment(Session.self) private var session
    @Environment(\.theme) private var t
    @State private var replyText = ""

    private var matter: HouseMatter { store.matters.first { $0.id == matterID } ?? store.matters[0] }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                MatterCard(matter: matter, open: nil)
                GroupGap()
                VStack(alignment: .leading, spacing: 14) {
                    VKSectionHeader(title: "Комментарии", count: "\(matter.replies.count)")
                        .padding(.horizontal, -t.pad)
                    if matter.replies.isEmpty {
                        Text("Комментариев пока нет. Начните разговор с соседями.")
                            .font(.vkBody).foregroundStyle(t.textSecondary)
                    } else {
                        ForEach(matter.replies) { reply in
                            HStack(alignment: .top, spacing: 10) {
                                Avatar(name: reply.author.name, size: 34)
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(reply.author.name).font(.vkName)
                                    Text(reply.text).font(.vkBody).foregroundStyle(t.textPrimary)
                                    Text(reply.time).font(.vkMeta).foregroundStyle(t.textSecondary)
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal, t.pad).padding(.bottom, 18)
                GroupGap()
                VStack(spacing: 10) {
                    if !session.canWriteToHouse {
                        AppStatePanel(
                            kind: .warning,
                            title: "Адрес ещё проверяется",
                            detail: "Читать публикации можно уже сейчас. Комментарии и чаты откроются после подтверждения квартиры."
                        )
                    }
                    HStack(spacing: 10) {
                        TextField("Написать комментарий", text: $replyText)
                            .padding(.horizontal, 14).frame(height: 44).background(t.fill, in: Capsule())
                        Button {
                            let value = replyText.trimmingCharacters(in: .whitespacesAndNewlines)
                            guard !value.isEmpty else { return }
                            store.addReply(to: matter, text: value)
                            replyText = ""
                        } label: {
                            Image(systemName: "arrow.up.circle.fill").font(.system(size: 30)).frame(width: 44, height: 44)
                        }
                        .disabled(replyText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                        .accessibilityLabel("Отправить комментарий")
                        .nativeAction("post.send-comment")
                    }
                    if matter.kind == .incident && matter.status != .resolved {
                        VKButton(
                            title: store.following.contains(matter.id) ? "Вы следите за делом" : "Следить за изменениями",
                            icon: store.following.contains(matter.id) ? "checkmark" : "bell"
                        ) {
                            Task {
                                if !store.following.contains(matter.id) {
                                    let granted = await permissions.requestHouseNotifications()
                                    store.toggleFollowing(matter)
                                    nav.toast(granted ? "Будем сообщать об изменениях" : "Ответы останутся видны в ленте")
                                } else {
                                    store.toggleFollowing(matter)
                                    nav.toast("Уведомления по делу выключены")
                                }
                            }
                        }
                        .nativeAction("post.follow-post")
                    }
                }
                .disabled(!session.canWriteToHouse)
                .padding(t.pad)
            }
        }
        .background(t.background)
        // «Написать в чат дома» уехало под «···»: внизу экрана оно спорило
        // с полем комментария за одно и то же действие.
        .vkNavigation(matter.kind == .incident ? "Проблема" : "Публикация") {
            Menu {
                Button {
                    nav.push(DvorRoute.chat(store.conversations[0]))
                } label: {
                    Label("Написать в чат дома", systemImage: "bubble.left")
                }
                .nativeAction("post.open-house-chat")
            } label: {
                Image(systemName: "ellipsis")
                    .frame(width: 44, height: 44).contentShape(Rectangle())
            }
            .accessibilityLabel("Ещё")
        }
    }
}

struct IncidentReportScreen: View {
    @Environment(HouseStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var permissions
    @Environment(\.theme) private var t
    @State private var title = ""
    @State private var details = ""
    @State private var place = "Двор"
    @State private var isSubmitting = DvorShotMode.state == "submitting"
    @State private var evidenceItem: PhotosPickerItem?
    @State private var evidenceData: Data?
    @State private var showCamera = false
    @State private var cameraUnavailable = false
    @State private var submitError: String?
    @State private var createdMatterID: UUID?

    private var isReadyToSubmit: Bool {
        title.trimmingCharacters(in: .whitespacesAndNewlines).count >= 5
            && !place.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    /// Равные по весу способы приложить кадр.
    private func evidenceAction(icon: String, title: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: icon).font(.system(size: 17))
            Text(title).font(.role(.action))
        }
        .foregroundStyle(t.accent)
        .frame(maxWidth: .infinity).frame(height: 48)
        .background(t.accentSoft, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
    }

    var body: some View {
        VStack(spacing: 0) {
            DvorModalChrome(title: "Новое дело", onCancel: { nav.dismiss() }, cancelActionID: "problem.cancel-problem")

            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    if DvorShotMode.state == "success" || createdMatterID != nil {
                        DvorScreenIntro(title: "Дело создано", detail: "Оно уже появилось в ленте дома. Вы будете видеть ответы и изменения статуса.")
                        DvorCard {
                            VStack(spacing: 0) {
                                DvorRow(title: "Статус", value: "Открыто", chevron: false)
                                DvorRow(title: "Место", value: place, chevron: false)
                            }
                        }
                        VKButton(title: "Готово") { nav.dismiss() }
                    } else {
                        DvorScreenIntro(title: "Что случилось?", detail: "Соседи увидят дело в ленте дома и смогут помочь или уточнить детали.")
                        if DvorShotMode.state == "error" {
                            AppStatePanel(kind: .error, title: "Не удалось отправить", detail: "Черновик сохранён. Попробуйте снова, когда появится сеть.")
                        }
                        if let submitError {
                            AppStatePanel(kind: .warning, title: "Проверьте данные", detail: submitError)
                        }
                        DvorFormField(title: "Коротко", placeholder: "Например, не горит фонарь", text: $title)
                        DvorFormField(title: "Где", placeholder: "Подъезд, этаж или место во дворе", text: $place)
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Подробности").font(.role(.pill))
                            TextEditor(text: $details).font(.role(.body))
                                .padding(10).frame(height: 104)
                                .scrollContentBackground(.hidden)
                                .background(t.fill, in: RoundedRectangle(cornerRadius: 12))
                        }
                        if let evidenceData, let image = UIImage(data: evidenceData) {
                            Image(uiImage: image)
                                .resizable().scaledToFill().frame(maxWidth: .infinity).frame(height: 180)
                                .clipped().clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                                .overlay(alignment: .topTrailing) {
                                    Button { self.evidenceData = nil; evidenceItem = nil } label: {
                                        Image(systemName: "xmark.circle.fill").font(.system(size: 24))
                                            .symbolRenderingMode(.palette).foregroundStyle(.white, .black.opacity(0.55))
                                            .frame(width: 44, height: 44)
                                    }
                                    .accessibilityLabel("Удалить приложенное фото")
                                }
                        }
                        // Один ряд из двух равных действий: карточка с обводкой
                        // рядом с голубой ссылкой читалась как два разных по
                        // важности способа сделать одно и то же.
                        HStack(spacing: 10) {
                            PhotosPicker(selection: $evidenceItem, matching: .images) {
                                evidenceAction(icon: "photo",
                                               title: evidenceData == nil ? "Из медиатеки" : "Заменить")
                            }
                            .buttonStyle(.plain)
                            Button {
                                Task {
                                    let granted = await permissions.requestCameraForEvidence()
                                    guard granted else { cameraUnavailable = true; return }
                                    if UIImagePickerController.isSourceTypeAvailable(.camera) { showCamera = true }
                                    else { cameraUnavailable = true }
                                }
                            } label: {
                                evidenceAction(icon: "camera", title: "Снять фото")
                            }
                            .buttonStyle(.plain)
                            .nativeAction("problem.add-evidence")
                        }
                        Text("Фото помогает быстрее найти место и проверить проблему.")
                            .font(.vkMeta).foregroundStyle(t.textSecondary)
                        if cameraUnavailable {
                            Text("Камера недоступна на этом устройстве — выберите готовый снимок выше.")
                                .font(.vkMeta).foregroundStyle(t.textSecondary)
                        }
                        Text("Сообщение увидят подтверждённые жильцы дома. Адрес за пределы дома не публикуется.")
                            .font(.vkMeta).foregroundStyle(t.textSecondary)
                        VKButton(title: isSubmitting ? "Отправляем…" : "Сообщить") {
                            let cleanTitle = title.trimmingCharacters(in: .whitespacesAndNewlines)
                            let cleanPlace = place.trimmingCharacters(in: .whitespacesAndNewlines)
                            guard cleanTitle.count >= 5 else { submitError = "Коротко опишите проблему — хотя бы пять символов."; return }
                            guard !cleanPlace.isEmpty else { submitError = "Укажите подъезд, этаж или место во дворе."; return }
                            submitError = nil
                            isSubmitting = true
                            Task {
                                try? await Task.sleep(for: .milliseconds(650))
                                guard let created = store.createIncident(
                                    title: cleanTitle,
                                    details: details.isEmpty ? "Нужно проверить на месте." : details,
                                    place: cleanPlace,
                                    mediaData: evidenceData
                                ) else {
                                    submitError = "Адрес ещё проверяется. После подтверждения вы сможете создать дело."
                                    isSubmitting = false
                                    return
                                }
                                createdMatterID = created.id
                                isSubmitting = false
                            }
                        }
                        .nativeAction("problem.submit-problem")
                        // Кнопка, активная на пустой форме, обещает исход, которого
                        // не будет: ошибка после нажатия предотвращается до него.
                        .disabled(isSubmitting || !isReadyToSubmit)
                    }
                }
                .padding(t.pad)
            }
            .background(t.background)
        }
        .onChange(of: evidenceItem) { _, item in
            guard let item else { return }
            Task { evidenceData = try? await item.loadTransferable(type: Data.self) }
        }
        .sheet(isPresented: $showCamera) {
            EvidenceCameraPicker(imageData: $evidenceData)
                .ignoresSafeArea()
        }
    }

}

struct ChronicleScreen: View {
    @Environment(HouseStore.self) private var store
    @Environment(Permissions.self) private var permissions
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var selectedPhotos: [PhotosPickerItem] = []
    @State private var selectedData: [Data] = []
    @State private var published = false
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                if DvorShotMode.state == "scanning" {
                    AppStatePanel(kind: .loading, title: "Открываем медиатеку", detail: "Снимки не загружаются в Двор без вашего выбора.")
                } else if DvorShotMode.state == "populated" || DvorShotMode.state == "selected" {
                    // Коллекция показывается сеткой миниатюр: заявить «4 снимка»
                    // и показать один кадр — это демо-случай, а не продукт.
                    // Медиа-источник для концептов пока не решён (решение заказчика),
                    // поэтому снимок в приложении один. Показываем сетку ровно там,
                    // где она правдива — сегодняшняя съёмка, — а месяц сводим
                    // строкой: двенадцать одинаковых плиток честнее не делают.
                    let selecting = DvorShotMode.state == "selected"
                    chronicleSection(title: "Сегодня", count: selecting ? 2 : 3,
                                     selected: selecting ? [0, 1] : [])
                    VStack(spacing: 0) {
                        chronicleGroup("Этот месяц", detail: "8 снимков")
                        RowSeparator()
                        chronicleGroup("Июль", detail: "14 снимков")
                    }
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(t.separator))

                    // Хвост экрана: что из хроники уже ушло соседям, а что
                    // осталось только на устройстве. Без него экран кончался
                    // на середине высоты.
                    HStack(spacing: 8) {
                        Text("Уже в хронике").font(.role(.cardTitle))
                        Text("\(chronicleEntries.count)").font(.role(.meta)).foregroundStyle(t.textSecondary)
                        Spacer()
                    }
                    .padding(.top, 6)
                    VStack(spacing: 0) {
                        ForEach(Array(chronicleEntries.enumerated()), id: \.offset) { index, entry in
                            HStack(spacing: 12) {
                                Image(systemName: entry.2 ? "person.2" : "lock")
                                    .font(.system(size: 17))
                                    .foregroundStyle(entry.2 ? t.accent : t.textSecondary)
                                    .frame(width: 28)
                                VStack(alignment: .leading, spacing: 1) {
                                    Text(entry.0).font(.role(.body)).foregroundStyle(t.textPrimary)
                                    Text(entry.2 ? "в ленте дома" : "только у вас")
                                        .font(.role(.meta)).foregroundStyle(t.textSecondary)
                                }
                                Spacer()
                                Text(entry.1).font(.role(.meta)).foregroundStyle(t.textSecondary)
                            }
                            .frame(minHeight: 52)
                            if index < chronicleEntries.count - 1 { RowSeparator(leading: 40) }
                        }
                    }
                } else if DvorShotMode.state == "denied" {
                    AppStatePanel(kind: .error, title: "Медиатека недоступна", detail: "Хроника останется пустой. Доступ можно включить позже в настройках iPhone.")
                } else {
                    AppStatePanel(kind: .empty, title: "Подходящих снимков пока нет", detail: "Можно открыть медиатеку или снять новое фото во время сообщения о проблеме.")
                }
                if !selectedData.isEmpty {
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                        ForEach(Array(selectedData.enumerated()), id: \.offset) { _, data in
                            if let image = UIImage(data: data) {
                                Image(uiImage: image).resizable().scaledToFill().frame(height: 132)
                                    .clipped().clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                            }
                        }
                    }
                    AppStatePanel(kind: .success, title: "Выбрано снимков: \(selectedData.count)", detail: "Они остаются на устройстве, пока вы сами не опубликуете их.")
                    VKButton(title: published ? "Опубликовано" : "Поделиться в ленте дома") {
                        guard !selectedData.isEmpty else { return }
                        _ = store.createPost(kind: .post, text: "Фото из хроники нашего двора", mediaItems: selectedData)
                        published = true
                    }
                    .disabled(published)
                    .nativeAction("chronicle.share-chronicle")
                }
                PhotosPicker(selection: $selectedPhotos, maxSelectionCount: 4, matching: .images) {
                    Text(selectedData.isEmpty ? "Выбрать из медиатеки" : "Изменить выбор")
                        .font(.role(.button)).foregroundStyle(.white)
                        .frame(maxWidth: .infinity, minHeight: 48).background(t.accent, in: RoundedRectangle(cornerRadius: 10))
                }
                .simultaneousGesture(TapGesture().onEnded {
                    Task { _ = await permissions.request(.photos) }
                })
                .nativeAction("chronicle.select-photos")
            }.padding(t.pad)
        }
        .vkNavigation("Хроника двора")
        .onChange(of: selectedPhotos) { _, items in
            Task {
                selectedData = await withTaskGroup(of: Data?.self, returning: [Data].self) { group in
                    for item in items { group.addTask { try? await item.loadTransferable(type: Data.self) } }
                    var result: [Data] = []
                    for await data in group { if let data { result.append(data) } }
                    return result
                }
            }
        }
    }

    /// Секция коллекции: заголовок с числом и сетка миниатюр 3 в ряд.
    @ViewBuilder
    private func chronicleSection(title: String, count: Int, selected: Set<Int>) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                Text(title).font(.role(.cardTitle)).foregroundStyle(t.textPrimary)
                Text(plural(count, "снимок", "снимка", "снимков"))
                    .font(.vkMeta).foregroundStyle(t.textSecondary)
                Spacer()
                if !selected.isEmpty {
                    Text("выбрано \(selected.count)").font(.vkMeta).foregroundStyle(t.accent)
                }
            }
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 3), count: 3), spacing: 3) {
                ForEach(0..<count, id: \.self) { index in
                    Image("CourtyardCleanup")
                        .resizable()
                        .scaledToFill()
                        .frame(height: 108)
                        .scaleEffect(1 + Double(index % 3) * 0.14, anchor: anchors[index % anchors.count])
                        .clipped()
                        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                        .overlay(alignment: .topTrailing) {
                            if selected.contains(index) {
                                Image(systemName: "checkmark.circle.fill")
                                    .font(.system(size: 20))
                                    .foregroundStyle(.white, t.accent)
                                    .padding(6)
                            }
                        }
                }
            }
        }
    }

    private var anchors: [UnitPoint] { [.top, .center, .bottomTrailing, .topLeading, .bottom, .leading] }

    /// Записи хроники: часть ушла соседям, часть осталась на устройстве.
    private let chronicleEntries: [(String, String, Bool)] = [
        ("Субботник у второго подъезда", "сегодня", true),
        ("Новая лавочка после покраски", "вчера", true),
        ("Разбитый плафон у входа", "21 авг", false),
        ("Клумба после пересадки", "19 авг", true),
        ("Снег на детской площадке", "12 фев", false),
    ]

    private func chronicleGroup(_ title: String, detail: String) -> some View {
        HStack {
            Text(title).font(.role(.action))
            Spacer()
            Text(detail).font(.vkMeta).foregroundStyle(t.textSecondary)
        }
        .padding(.horizontal, 14)
        .frame(minHeight: 46)
    }
}

struct EvidenceCameraPicker: UIViewControllerRepresentable {
    @Binding var imageData: Data?
    @Environment(\.dismiss) private var dismiss

    func makeCoordinator() -> Coordinator { Coordinator(parent: self) }

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}

    final class Coordinator: NSObject, UINavigationControllerDelegate, UIImagePickerControllerDelegate {
        let parent: EvidenceCameraPicker
        init(parent: EvidenceCameraPicker) { self.parent = parent }

        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            if let image = info[.originalImage] as? UIImage { parent.imageData = image.jpegData(compressionQuality: 0.86) }
            parent.dismiss()
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) { parent.dismiss() }
    }
}
