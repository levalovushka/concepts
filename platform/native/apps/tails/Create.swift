import SwiftUI
import PhotosUI

// «Момент» — создание публикации. Самое заряженное место по доступам:
// камера и медиатека живут здесь, и до них два тапа от ленты.

struct CreateScreen: View {
    @Environment(TailsStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(Permissions.self) private var perms
    @Environment(\.dismiss) private var dismiss
    @Environment(\.theme) private var t
    @State private var text = ""
    @State private var kind: MomentKind = .walk
    @State private var picked = ShotMode.isScreen("create", state: "success")
    @State private var pickerItem: PhotosPickerItem?
    @State private var cameraDenied = ShotMode.isScreen("camera", state: "denied")

    private var isReady: Bool { text.trimmingCharacters(in: .whitespacesAndNewlines).count >= 5 }
    /// Модальное открытие приходит из ленты, вкладка — из таб-бара.
    @Environment(\.isPresented) private var isModal

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                if ShotMode.isScreen("create", state: "error") {
                    AppStatePanel(kind: .error, title: "Момент не отправился",
                                  detail: "Черновик сохранён на этом iPhone — попробуйте, когда появится сеть.")
                }
                if ShotMode.isScreen("create", state: "success") {
                    AppStatePanel(kind: .success, title: "Момент опубликован",
                                  detail: "Он уже в ленте района и в профиле Буси.")
                    VKRow(title: "Просмотров", icon: "eye", value: "12", chevron: false)
                    RowSeparator(leading: 60)
                    VKRow(title: "Отклики", icon: "bubble.right", value: "2", chevron: false)
                }
                if cameraDenied {
                    AppStatePanel(kind: .warning, title: "Камера недоступна",
                                  detail: "Выберите готовый снимок из медиатеки — остальное работает как обычно.")
                }

                Text("Что произошло на прогулке?").textStyle(.section)

                VKFilterPills(items: [("Прогулка", "figure.walk"), ("Находка", "sparkle.magnifyingglass"),
                                      ("Вопрос", "bubble.left.and.bubble.right"), ("Пропал", "exclamationmark.triangle")],
                              selection: kindBinding)

                TextEditor(text: $text)
                    .font(.role(.body)).frame(height: 132)
                    .scrollContentBackground(.hidden)
                    .padding(10)
                    .background(t.fill, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                    .overlay(alignment: .topLeading) {
                        if text.isEmpty {
                            Text("Где гуляли, как вёл себя питомец, кого встретили")
                                .textStyle(.body).foregroundStyle(t.textSecondary)
                                .padding(.horizontal, 15).padding(.top, 18)
                                .allowsHitTesting(false)
                        }
                    }

                HStack(spacing: 10) {
                    Button {
                        Task {
                            let ok = await perms.request(.camera)
                            if ok { withAnimation { picked = true } }
                            else { withAnimation { cameraDenied = true } }
                        }
                    } label: { mediaAction(icon: "camera", title: "Снять") }
                    .buttonStyle(.plain)

                    PhotosPicker(selection: $pickerItem, matching: .images) {
                        mediaAction(icon: "photo.on.rectangle", title: "Из медиатеки")
                    }
                    .buttonStyle(.plain)
                    .simultaneousGesture(TapGesture().onEnded {
                        Task { _ = await perms.request(.photos) }
                    })
                }

                if picked {
                    HStack(spacing: 12) {
                        Image(systemName: "checkmark.circle.fill").font(.system(size: 20))
                            .foregroundStyle(t.positive)
                        Text("Кадр прикреплён").textStyle(.body)
                        Spacer()
                        Button("Убрать") { withAnimation { picked = false } }
                            .textStyle(.action)
                    }
                    .padding(12)
                    .background(t.fill, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                }

                VKRow(title: "Место", icon: "mappin.and.ellipse", value: "Двор 24/7")
                RowSeparator(leading: 60)
                VKRow(title: "Кому видно", icon: "person.2", value: "Соседям с питомцами")

                Text("Момент увидят владельцы питомцев вашего района. Точный адрес не публикуется.")
                    .textStyle(.meta)

                VKButton(title: "Опубликовать") {
                    store.addMoment(kind: kind, text: text)
                    dismiss()
                }
                .disabled(!isReady)
                .opacity(isReady ? 1 : 0.45)
            }
            .padding(t.pad)
        }
        .background(t.background)
        // Экран живёт и вкладкой, и модальным листом: в первом случае у него
        // шапка вкладки с мини-аватаром, во втором — «Отмена».
        .rootHeaderBar {
            VKTabHeader(title: "Момент", avatar: store.me.name,
                        avatarAction: { nav.push(TailsRoute.pet(store.me)) }) {
                if isModal {
                    Button("Отмена") { dismiss() }.textStyle(.action)
                }
            }
        }
    }

    private var kindBinding: Binding<Int> {
        Binding(
            get: { [MomentKind.walk, .found, .question, .lost].firstIndex(of: kind) ?? 0 },
            set: { kind = [MomentKind.walk, .found, .question, .lost][$0] }
        )
    }

    private func mediaAction(icon: String, title: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: icon).font(.system(size: 17))
            Text(title).textStyle(.action)
        }
        .foregroundStyle(t.accent)
        .frame(maxWidth: .infinity).frame(height: 48)
        .background(t.accentSoft, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}
