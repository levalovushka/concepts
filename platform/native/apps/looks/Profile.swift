import SwiftUI

// Профиль ВК: серый фон, белые карточки радиус 16 с полем 8, круглые кнопки
// поверх, аватар по центру, пилюли-табы с белой активной капсулой.

struct ProfileScreen: View {
    @Environment(LooksStore.self) private var store
    @Environment(Nav.self) private var nav
    @Environment(\.theme) private var t
    @State private var tab = 0
    @State private var showMenu = false
    @State private var showBioEditor = false
    @State private var bio = ""

    private let name = "Ника Орлова"
    private var garments: [Garment] { store.garments }

    var body: some View {
        Group {
            t.groupGap.ignoresSafeArea()
                .overlay {
                    ScrollView {
                        VStack(spacing: 8) {
                            header
                            cards
                            tabsRow
                            section
                            Color.clear.frame(height: 120)
                        }
                        .padding(.horizontal, 8)
                    }
                }
        }
        .vkNavigation("Профиль") {
            Button { showMenu = true } label: {
                Image(systemName: "ellipsis")
                    .font(.system(size: 19, weight: .medium))
                    .frame(width: 44, height: 44)
            }
            .accessibilityLabel("Ещё")
        }
        .confirmationDialog("", isPresented: $showMenu, titleVisibility: .hidden) {
            Button("Поделиться профилем") { nav.toast("Ссылка на профиль скопирована") }
            Button("Отмена", role: .cancel) {}
        }
        .sheet(isPresented: $showBioEditor) { BioEditor(text: $bio) }
    }

    // MARK: шапка

    private var header: some View {
        VStack(spacing: 10) {
            Avatar(name: name, size: 128, online: true)
                .padding(.top, 20)
            Text(name).font(.system(size: 28, weight: .bold))
                .foregroundStyle(t.textPrimary)
            Button { showBioEditor = true } label: {
                HStack(spacing: 5) {
                    Text(bio.isEmpty ? "Укажите информацию о себе" : bio).font(.system(size: 17))
                    Image(systemName: "chevron.right.circle").font(.system(size: 15))
                }
                .foregroundStyle(t.accent)
            }
            .buttonStyle(.plain)
        }
        .padding(.bottom, 6)
    }

    // MARK: карточки

    @ViewBuilder private var cards: some View {
        statusCard
        friendsCard
        publishCard
    }

    private var statusCard: some View {
        card {
            HStack(spacing: 8) {
                Image(systemName: "hanger").font(.system(size: 16))
                    .foregroundStyle(t.textSecondary)
                Text("\(plural(store.garments.count, "вещь", "вещи", "вещей")) в гардеробе").font(.system(size: 17))
                    .foregroundStyle(t.textPrimary)
                Text("·").foregroundStyle(t.textSecondary)
                Button { nav.push(LooksRoute.wardrobe) } label: {
                    Text("Открыть").font(.system(size: 17)).foregroundStyle(t.accent)
                }
                .buttonStyle(.plain)
                Spacer(minLength: 0)
            }
            .padding(.horizontal, 16).padding(.vertical, 14)
        }
    }

    private var friendsCard: some View {
        card {
            HStack(spacing: 8) {
                Text("1,3K подписчиков").font(.system(size: 17, weight: .semibold)).lineLimit(1)
                    .foregroundStyle(t.textPrimary)
                Text("·").foregroundStyle(t.textSecondary)
                Button { nav.push(LooksRoute.mates) } label: {
                    Text("знакомые").font(.system(size: 17)).foregroundStyle(t.accent)
                }
                .buttonStyle(.plain)
                Spacer(minLength: 8)
                HStack(spacing: -10) {
                    ForEach(["Аня Котова", "Марк Львов", "Даша Ким"], id: \.self) { n in
                        Avatar(name: n, size: 30)
                            .overlay(Circle().stroke(.white, lineWidth: 2))
                    }
                }
            }
            .padding(.horizontal, 16).padding(.vertical, 12)
        }
    }

    private var publishCard: some View {
        card {
            Button { nav.present(cover: LooksRoute.create) } label: {
                HStack(spacing: 8) {
                    Image(systemName: "plus.circle").font(.system(size: 20))
                    Text("Опубликовать образ").font(.system(size: 17))
                }
                .foregroundStyle(t.accent)
                .frame(maxWidth: .infinity).padding(.vertical, 15)
            }
            .buttonStyle(.plain)
        }
    }

    // MARK: пилюли-табы

    private let tabTitles = ["Главная", "Образы", "Вещи", "Свопы", "Клипы"]

    private var tabsRow: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 6) {
                ForEach(tabTitles.indices, id: \.self) { i in
                    Button {
                        withAnimation(.easeOut(duration: 0.18)) { tab = i }
                    } label: {
                        Text(tabTitles[i])
                            .font(.system(size: 17, weight: tab == i ? .medium : .regular))
                            .foregroundStyle(tab == i ? t.accent : t.textSecondary)
                            .padding(.horizontal, 16).frame(height: 40)
                            .background {
                                if tab == i {
                                    Capsule().fill(.white)
                                        .shadow(color: .black.opacity(0.08), radius: 4, y: 2)
                                }
                            }
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 8)
        }
        .scrollClipDisabled()
        .padding(.vertical, 4)
    }

    // MARK: контент вкладки

    @ViewBuilder private var section: some View {
        if tab == 2 {
            contentSection(title: "Вещи") {
                ForEach(garments.prefix(6)) { g in
                    contentCard(glyph: g.glyph, title: g.title,
                                sub: g.state.label, seed: g.title.count)
                }
            }
        } else if tab == 3 {
            contentSection(title: "Свопы") {
                ForEach(store.events) { e in
                    contentCard(glyph: "arrow.left.arrow.right", title: e.title,
                                sub: e.when, seed: e.going)
                }
            }
        } else {
            contentSection(title: "Образы") {
                ForEach(store.outfits) { o in
                    contentCard(glyph: o.items.first?.glyph ?? "tshirt.fill",
                                title: o.items.first?.title ?? "Образ",
                                sub: "\(o.likes) отметок «нравится»", seed: o.seed)
                }
            }
        }
    }

    private func contentSection<C: View>(title: String,
                                         @ViewBuilder content: () -> C) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(title).font(.vkSection).foregroundStyle(t.textPrimary)
                .padding(.horizontal, 8).padding(.bottom, 12)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(alignment: .top, spacing: 12) { content() }
                    .padding(.horizontal, 8)
            }
            .scrollClipDisabled()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.top, 8)
    }

    private func contentCard(glyph: String, title: String, sub: String, seed: Int) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            VKMedia(assetName: LooksMediaAssets.detail(seed), height: 145)
                .frame(width: 145)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.system(size: 15)).foregroundStyle(t.textPrimary)
                    .lineLimit(1)
                Text(sub).font(.vkMeta).foregroundStyle(t.textSecondary).lineLimit(1)
            }
            .frame(width: 145, alignment: .leading)
        }
    }

    private func card<C: View>(@ViewBuilder _ content: () -> C) -> some View {
        VStack(spacing: 0) { content() }
            .frame(maxWidth: .infinity)
            .background(.white, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}

private struct BioEditor: View {
    @Binding var text: String
    @Environment(\.dismiss) private var dismiss
    @State private var draft = ""

    var body: some View {
        NavigationStack {
            TextEditor(text: $draft)
                .padding(12)
                .navigationTitle("О себе")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) { Button("Отмена") { dismiss() } }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Готово") { text = draft.trimmingCharacters(in: .whitespacesAndNewlines); dismiss() }
                    }
                }
                .onAppear { draft = text }
        }
        .presentationDetents([.medium])
    }
}
