import SwiftUI

struct ItemDetailView: View {
    let itemID: String
    @Environment(PolkaStore.self) private var store
    @Environment(AccessStore.self) private var access

    private var item: LoanItem { store.items.first(where: { $0.id == itemID }) ?? store.items[0] }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                ItemArtwork(item: item, height: 360, cornerRadius: 0)
                    .overlay(alignment: .bottomLeading) {
                        LinearGradient(colors: [.clear, .black.opacity(0.72)], startPoint: .top, endPoint: .bottom)
                            .frame(height: 170)
                            .overlay(alignment: .bottomLeading) {
                                VStack(alignment: .leading, spacing: 7) {
                                    StatusPill(text: "свободна на выходные")
                                        .background(.white.opacity(0.92), in: Capsule())
                                    Text(item.title)
                                        .font(.system(size: 28, weight: .bold))
                                        .foregroundStyle(.white)
                                }
                                .padding(18)
                            }
                    }

                VStack(alignment: .leading, spacing: 20) {
                    HStack(spacing: 12) {
                        PolkaAvatar(initials: item.ownerInitials, size: 46)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(item.owner).font(.system(size: 16, weight: .semibold)).foregroundStyle(D.ink)
                            Text("Вы друзья · отвечает обычно за час")
                                .font(.system(size: 13)).foregroundStyle(D.sub)
                        }
                        Spacer()
                        Button { store.show("Диалог с \(item.owner) открыт") } label: {
                            Image(systemName: "message.fill")
                                .font(.system(size: 16))
                                .foregroundStyle(D.accent)
                                .frame(width: 40, height: 40)
                                .background(D.accent.opacity(0.1), in: Circle())
                        }
                        .buttonStyle(.plain)
                    }

                    PrimaryButton(title: "Поделиться вещью", icon: "square.and.arrow.up", quiet: true) {
                        Task {
                            let ok = await access.request(
                                [.associateddomains], on: "item",
                                value: "https://polka.app/item/\(item.id)"
                            )
                            store.show(ok ? "Ссылка на вещь готова" : Access.associateddomains.fallback)
                        }
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        Text("О вещи").font(.system(size: 19, weight: .bold)).foregroundStyle(D.ink)
                        Text(item.detail).font(.system(size: 16)).foregroundStyle(D.ink).fixedSize(horizontal: false, vertical: true)
                    }

                    VStack(alignment: .leading, spacing: 11) {
                        Text("Свободные даты").font(.system(size: 19, weight: .bold)).foregroundStyle(D.ink)
                        HStack(spacing: 8) {
                            dateCard("Пт", "5", selected: true)
                            dateCard("Сб", "6", selected: true)
                            dateCard("Вс", "7", selected: true)
                            dateCard("Пн", "8", selected: false)
                            dateCard("Вт", "9", selected: false)
                        }
                        Text(item.availability).font(.system(size: 13)).foregroundStyle(D.green)
                    }

                    HStack(alignment: .top, spacing: 10) {
                        Image(systemName: "arrow.uturn.backward.circle.fill").foregroundStyle(D.accent)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Вернуть в том же виде").font(.system(size: 14, weight: .semibold)).foregroundStyle(D.ink)
                            Text("Без залога и денег. Дата возврата попадёт в передачу.")
                                .font(.system(size: 13)).foregroundStyle(D.sub)
                        }
                    }
                    .padding(13)
                    .background(D.accent.opacity(0.07), in: RoundedRectangle(cornerRadius: 14))
                }
                .padding(16)
            }
        }
        .background(D.page)
        .ignoresSafeArea(edges: .top)
        .safeAreaInset(edge: .bottom, spacing: 0) {
            PrimaryButton(title: "Попросить на выходные") { store.request(item) }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(.ultraThinMaterial)
        }
        .toolbarBackground(.hidden, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
        .accessibilityIdentifier("screen.item")
    }

    private func dateCard(_ day: String, _ date: String, selected: Bool) -> some View {
        VStack(spacing: 3) {
            Text(day).font(.system(size: 11, weight: .medium))
            Text(date).font(.system(size: 17, weight: .bold))
        }
        .foregroundStyle(selected ? .white : D.sub)
        .frame(maxWidth: .infinity)
        .frame(height: 58)
        .background(selected ? D.accent : D.quiet, in: RoundedRectangle(cornerRadius: 12))
    }
}

struct RequestSheet: View {
    let item: LoanItem
    @Environment(PolkaStore.self) private var store
    @Environment(AccessStore.self) private var access
    @Environment(\.dismiss) private var dismiss
    @State private var note = "Едем на озеро в субботу, верну в понедель вечером."
    @State private var notify = true

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    HStack(spacing: 12) {
                        ItemArtwork(item: item, height: 82, cornerRadius: 14).frame(width: 104)
                        VStack(alignment: .leading, spacing: 4) {
                            Text(item.title).font(.system(size: 18, weight: .bold)).foregroundStyle(D.ink)
                            Text(item.owner).font(.system(size: 13)).foregroundStyle(D.sub)
                            StatusPill(text: "5–7 сентября")
                        }
                    }
                    .padding(12)
                    .background(D.card, in: RoundedRectangle(cornerRadius: 17))

                    VStack(alignment: .leading, spacing: 9) {
                        Text("Даты").font(.system(size: 19, weight: .bold))
                        HStack(spacing: 8) {
                            selection("Взять", "пятница, 5 сентября")
                            selection("Вернуть", "понедельник, 8 сентября")
                        }
                    }

                    VStack(alignment: .leading, spacing: 9) {
                        Text("Лене").font(.system(size: 19, weight: .bold))
                        TextEditor(text: $note)
                            .font(.system(size: 16))
                            .scrollContentBackground(.hidden)
                            .frame(minHeight: 104)
                            .padding(10)
                            .background(D.card, in: RoundedRectangle(cornerRadius: 14))
                    }

                    HStack(spacing: 8) {
                        PrimaryButton(title: "Голосом", icon: "waveform", quiet: true) {
                            Task {
                                let ok = await access.request([.mic, .speech, .audio], on: "request")
                                store.show(ok ? "Голосовое записано и расшифровано" : "Оставим текстовое сообщение")
                            }
                        }
                        PrimaryButton(title: "Позвонить", icon: "phone", quiet: true) {
                            Task {
                                let call = await access.request([.voip], on: "request")
                                _ = await access.request([.commnotif], on: "request")
                                store.show(call ? "Звонок владельцу начат" : Access.voip.fallback)
                            }
                        }
                    }

                    Toggle(isOn: $notify) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Сообщить об ответе").font(.system(size: 15, weight: .semibold))
                            Text("Одно уведомление от Полки").font(.system(size: 13)).foregroundStyle(D.sub)
                        }
                    }
                    .padding(14)
                    .background(D.card, in: RoundedRectangle(cornerRadius: 14))

                    DeniedNotice(key: .push)

                    PrimaryButton(title: "Отправить запрос", icon: "paperplane.fill") {
                        Task {
                            if notify {
                                _ = await access.request([.push], on: "request")
                                _ = await access.request([.remotenotif], on: "request")
                            }
                            store.requestSent = true
                            dismiss()
                            store.tab = .requests
                            store.showsIncomingRequests = false
                            store.show("Запрос отправлен Лене")
                        }
                    }
                }
                .padding(16)
            }
            .background(D.page)
            .navigationTitle("Попросить вещь")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .topBarLeading) { Button("Отмена") { dismiss() } } }
        }
        .presentationDetents([.large])
        .accessibilityIdentifier("screen.request")
    }

    private func selection(_ title: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(title).font(.system(size: 12)).foregroundStyle(D.sub)
            Text(value).font(.system(size: 14, weight: .semibold)).foregroundStyle(D.ink)
        }
        .padding(12)
        .frame(maxWidth: .infinity, minHeight: 76, alignment: .leading)
        .background(D.card, in: RoundedRectangle(cornerRadius: 14))
    }
}

struct AddItemSheet: View {
    @Environment(PolkaStore.self) private var store
    @Environment(AccessStore.self) private var access
    @Environment(\.dismiss) private var dismiss
    @State private var title = ""
    @State private var note = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    ZStack {
                        LinearGradient(colors: [Color(hex: "465D82"), Color(hex: "8BA7C8")], startPoint: .topLeading, endPoint: .bottomTrailing)
                        Image(systemName: "camera.fill")
                            .font(.system(size: 44, weight: .medium))
                            .foregroundStyle(.white.opacity(0.92))
                    }
                    .frame(height: 220)
                    .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                    .overlay(alignment: .bottom) {
                        HStack(spacing: 9) {
                            mediaButton("Снять", "camera", .camera)
                            mediaButton("Выбрать", "photo.on.rectangle", .photos)
                        }
                        .padding(12)
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Название").font(.system(size: 13, weight: .semibold)).foregroundStyle(D.sub)
                        TextField("Например, вафельница", text: $title)
                            .font(.system(size: 16)).padding(13).background(D.card, in: RoundedRectangle(cornerRadius: 13))
                        Text("Что важно знать").font(.system(size: 13, weight: .semibold)).foregroundStyle(D.sub)
                        TextField("Комплект, состояние, как вернуть", text: $note, axis: .vertical)
                            .lineLimit(3...5).font(.system(size: 16)).padding(13).background(D.card, in: RoundedRectangle(cornerRadius: 13))
                    }

                    HStack {
                        Label("Видно только друзьям", systemImage: "person.2.fill")
                        Spacer()
                        Image(systemName: "chevron.right").foregroundStyle(D.mute)
                    }
                    .font(.system(size: 15)).padding(14).background(D.card, in: RoundedRectangle(cornerRadius: 14))

                    Button {
                        Task {
                            let shared = await access.request([.appgroups], on: "add")
                            let session = await access.request([.keychain], on: "add")
                            store.show(shared && session ? "Быстрое добавление включено" : Access.appgroups.fallback)
                        }
                    } label: {
                        HStack(spacing: 11) {
                            Image(systemName: "square.and.arrow.down.fill")
                                .foregroundStyle(D.accent).frame(width: 28)
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Добавлять из меню «Поделиться»").font(.system(size: 15, weight: .semibold))
                                Text("Черновик и вход защищены системно").font(.system(size: 13)).foregroundStyle(D.sub)
                            }
                            Spacer()
                            Image(systemName: "chevron.right").foregroundStyle(D.mute)
                        }
                        .foregroundStyle(D.ink).padding(14)
                        .background(D.card, in: RoundedRectangle(cornerRadius: 14))
                    }
                    .buttonStyle(.plain)

                }
                .padding(16)
            }
            .background(D.page)
            .safeAreaInset(edge: .bottom, spacing: 0) {
                PrimaryButton(title: "Добавить на полку", icon: "plus") {
                    dismiss()
                    store.show(title.isEmpty ? "Черновик вещи сохранён" : "\(title) добавлена на полку")
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(.ultraThinMaterial)
            }
            .navigationTitle("Новая вещь")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .topBarLeading) { Button("Отмена") { dismiss() } } }
        }
        .accessibilityIdentifier("screen.add")
    }

    private func mediaButton(_ title: String, _ icon: String, _ key: Access) -> some View {
        Button {
            Task { _ = await access.request([key], on: "add") }
        } label: {
            Label(title, systemImage: icon)
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity, minHeight: 44)
                .background(.black.opacity(0.24), in: RoundedRectangle(cornerRadius: 12))
        }
        .buttonStyle(.plain)
    }
}

struct HandoffView: View {
    let requestID: String
    @Environment(PolkaStore.self) private var store
    @Environment(AccessStore.self) private var access
    @State private var codeRevealed = false

    var body: some View {
        PolkaPage(spacing: 16) {
            VStack(spacing: 10) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 38)).foregroundStyle(D.green)
                Text("Лена подтвердила").font(.system(size: 22, weight: .bold)).foregroundStyle(D.ink)
                Text("Палатка на троих · 5–7 сентября").font(.system(size: 14)).foregroundStyle(D.sub)
            }
            .frame(maxWidth: .infinity)

            VStack(spacing: 14) {
                ZStack {
                    QRCodePattern().blur(radius: codeRevealed ? 0 : 12)
                    if !codeRevealed {
                        Button {
                            Task {
                                codeRevealed = await access.request([.faceid], on: "handoff")
                                if !codeRevealed { store.show(Access.faceid.fallback) }
                            }
                        } label: {
                            Label("Показать по Face ID", systemImage: "faceid")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundStyle(.white)
                                .padding(.horizontal, 14).frame(height: 44)
                                .background(.black.opacity(0.78), in: Capsule())
                        }
                        .buttonStyle(.plain)
                    }
                }
                .frame(width: 190, height: 190)
                VStack(spacing: 3) {
                    Text("Код получения").font(.system(size: 13)).foregroundStyle(D.sub)
                    Text(codeRevealed ? "5 8 2 4" : "••••")
                        .font(.system(size: 27, weight: .bold, design: .rounded)).kerning(5)
                }
                Text("Покажите код при встрече — у обоих появится срок возврата.")
                    .font(.system(size: 13)).foregroundStyle(D.sub).multilineTextAlignment(.center)
            }
            .padding(20)
            .frame(maxWidth: .infinity)
            .background(D.card, in: RoundedRectangle(cornerRadius: 20))

            SectionTitle(title: "Встреча")
            VStack(spacing: 0) {
                row("mappin.circle.fill", "Кофейня у парка", "сегодня, 19:30") {
                    Task { _ = await access.request([.location], on: "handoff") }
                }
                Divider().padding(.leading, 54)
                row("calendar", "Вернуть 8 сентября", "до 21:00") {
                    Task {
                        let ok = await access.request([.calendar], on: "handoff")
                        store.show(ok ? "Срок добавлен в календарь" : Access.calendar.fallback)
                    }
                }
                Divider().padding(.leading, 54)
                row("wifi", "Проверить сеть кофейни", "подтвердить, что вы оба на месте") {
                    Task {
                        let ok = await access.request([.wifiinfo], on: "handoff")
                        store.show(ok ? "Вы в сети места передачи" : Access.wifiinfo.fallback)
                    }
                }
                Divider().padding(.leading, 54)
                row("personalhotspot", "Подключить гостевой Wi‑Fi", "без ручного ввода пароля") {
                    Task {
                        let ok = await access.request([.hotspot], on: "handoff", value: "Polka-Guest")
                        store.show(ok ? "Гостевая сеть подключена" : Access.hotspot.fallback)
                    }
                }
            }
            .background(D.card, in: RoundedRectangle(cornerRadius: 16))

            Button {
                Task {
                    let ok = await access.request([.autofill], on: "handoff")
                    store.show(ok ? "Аккаунт сохранён для автозаполнения" : Access.autofill.fallback)
                }
            } label: {
                Label("Сохранить вход для страницы передачи", systemImage: "key.fill")
                    .font(.system(size: 14, weight: .semibold)).foregroundStyle(D.accent)
                    .frame(maxWidth: .infinity).padding(14)
                    .background(D.accent.opacity(0.08), in: RoundedRectangle(cornerRadius: 14))
            }
            .buttonStyle(.plain)

        }
        .safeAreaInset(edge: .bottom, spacing: 0) {
            PrimaryButton(title: "Вещь передана", icon: "checkmark") { store.show("Передача зафиксирована") }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(.ultraThinMaterial)
        }
        .navigationTitle("Передача")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(D.page, for: .navigationBar)
        .accessibilityIdentifier("screen.handoff")
    }

    private func row(_ icon: String, _ title: String, _ subtitle: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 11) {
                Image(systemName: icon).font(.system(size: 19)).foregroundStyle(D.accent).frame(width: 32)
                VStack(alignment: .leading, spacing: 2) {
                    Text(title).font(.system(size: 15, weight: .semibold)).foregroundStyle(D.ink)
                    Text(subtitle).font(.system(size: 13)).foregroundStyle(D.sub)
                }
                Spacer()
                Image(systemName: "chevron.right").font(.system(size: 12, weight: .semibold)).foregroundStyle(D.mute)
            }
            .padding(13)
        }
        .buttonStyle(.plain)
    }
}

private struct QRCodePattern: View {
    private let on: Set<Int> = [0,1,2,3,4,5,6,7,13,14,20,21,27,28,29,30,31,32,33,34,9,11,16,17,18,23,25,26,36,38,40,43,44,46,47,48]

    var body: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 3), count: 7), spacing: 3) {
            ForEach(0..<49, id: \.self) { index in
                RoundedRectangle(cornerRadius: 2)
                    .fill(on.contains(index) ? D.ink : D.quiet)
                    .aspectRatio(1, contentMode: .fit)
            }
        }
        .padding(12)
        .background(.white)
        .overlay { RoundedRectangle(cornerRadius: 15).stroke(D.line) }
        .clipShape(RoundedRectangle(cornerRadius: 15))
    }
}
