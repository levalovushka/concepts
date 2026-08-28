import SwiftUI

/// Раскладки страниц «Двора».

/// Серая страница со скроллом — базовая раскладка почти всех экранов.
struct Page<Content: View>: View {
    var title: String?
    var spacing: CGFloat = 10
    @ViewBuilder var content: Content

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: spacing) {
                if let title {
                    Text(title)
                        .font(.system(size: 26, weight: .bold))
                        .foregroundStyle(D.ink)
                        .padding(.top, 2)
                }
                content
            }
            .padding(.horizontal, D.inset)
            .padding(.vertical, D.inset)
        }
        .background(D.page)
        .scrollDismissesKeyboard(.interactively)
    }
}

/// Заголовок экрана в стеке: без large title — их концепт не использует.
struct StackPage<Content: View>: View {
    let title: String
    var spacing: CGFloat = 10
    @ViewBuilder var content: Content

    var body: some View {
        Page(spacing: spacing) { content }
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(D.page, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
    }
}
