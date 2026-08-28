import SwiftUI

struct PolkaPage<Content: View>: View {
    var spacing: CGFloat = 18
    @ViewBuilder var content: Content

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: spacing) { content }
                .padding(.horizontal, D.inset)
                .padding(.top, 12)
                .padding(.bottom, 110)
        }
        .background(D.page)
        .scrollDismissesKeyboard(.interactively)
    }
}

struct RootTitle<Trailing: View>: View {
    let title: String
    var subtitle: String?
    @ViewBuilder var trailing: Trailing

    var body: some View {
        HStack(alignment: .center) {
            VStack(alignment: .leading, spacing: 1) {
                Text(title)
                    .font(.system(size: 30, weight: .bold))
                    .foregroundStyle(D.ink)
                if let subtitle {
                    Text(subtitle).font(.system(size: 13)).foregroundStyle(D.sub)
                }
            }
            Spacer()
            trailing
        }
    }
}

extension RootTitle where Trailing == EmptyView {
    init(_ title: String, subtitle: String? = nil) {
        self.init(title: title, subtitle: subtitle) { EmptyView() }
    }
}

struct CircleIconButton: View {
    let icon: String
    let label: String
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.system(size: 17, weight: .semibold))
                .foregroundStyle(D.accent)
                .frame(width: 42, height: 42)
                .background(D.card, in: Circle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(label)
    }
}

struct PolkaAvatar: View {
    let initials: String
    var color = "7C5CE7"
    var size: CGFloat = 42

    var body: some View {
        Circle()
            .fill(Color(hex: color).gradient)
            .frame(width: size, height: size)
            .overlay {
                Text(initials)
                    .font(.system(size: size * 0.34, weight: .semibold))
                    .foregroundStyle(.white)
            }
    }
}

struct ItemArtwork: View {
    let item: LoanItem
    var height: CGFloat = 190
    var cornerRadius: CGFloat = 18

    private var colors: [Color] { item.colors.map(Color.init(hex:)) }

    var body: some View {
        ZStack {
            LinearGradient(
                colors: colors.isEmpty ? [D.accent, Color(hex: "73A9E8")] : colors,
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            Circle()
                .fill(.white.opacity(0.12))
                .frame(width: height * 0.92)
                .offset(x: height * 0.34, y: -height * 0.24)
            Circle()
                .fill(.black.opacity(0.08))
                .frame(width: height * 0.72)
                .offset(x: -height * 0.38, y: height * 0.34)
            Image(systemName: item.icon)
                .font(.system(size: height * 0.31, weight: .medium))
                .symbolRenderingMode(.hierarchical)
                .foregroundStyle(.white.opacity(0.94))
                .shadow(color: .black.opacity(0.12), radius: 16, y: 8)
        }
        .frame(maxWidth: .infinity)
        .frame(height: height)
        .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
    }
}

struct StatusPill: View {
    let text: String
    var tint = D.green

    var body: some View {
        HStack(spacing: 5) {
            Circle().fill(tint).frame(width: 6, height: 6)
            Text(text).font(.system(size: 12, weight: .medium))
        }
        .foregroundStyle(tint)
        .padding(.horizontal, 9)
        .padding(.vertical, 6)
        .background(tint.opacity(0.11), in: Capsule())
    }
}

struct SectionTitle: View {
    let title: String
    var action: String?
    var onAction: () -> Void = {}

    var body: some View {
        HStack(alignment: .firstTextBaseline) {
            Text(title)
                .font(.system(size: 21, weight: .bold))
                .foregroundStyle(D.ink)
            Spacer()
            if let action {
                Button(action, action: onAction)
                    .font(.system(size: 14))
                    .buttonStyle(.plain)
                    .foregroundStyle(D.accent)
            }
        }
    }
}

struct FeaturedItemCard: View {
    let item: LoanItem

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            ItemArtwork(item: item, height: 210, cornerRadius: 0)
                .overlay(alignment: .topLeading) {
                    StatusPill(text: "свободна")
                        .background(.ultraThinMaterial, in: Capsule())
                        .padding(14)
                }
            VStack(alignment: .leading, spacing: 8) {
                Text(item.title)
                    .font(.system(size: 21, weight: .bold))
                    .foregroundStyle(D.ink)
                HStack(spacing: 8) {
                    PolkaAvatar(initials: item.ownerInitials, size: 28)
                    Text(item.owner).font(.system(size: 14, weight: .medium)).foregroundStyle(D.ink)
                    Text("·").foregroundStyle(D.mute)
                    Text(item.availability).font(.system(size: 13)).foregroundStyle(D.sub).lineLimit(1)
                }
            }
            .padding(14)
        }
        .background(D.card)
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .shadow(color: .black.opacity(0.04), radius: 12, y: 4)
    }
}

struct ItemTile: View {
    let item: LoanItem

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ItemArtwork(item: item, height: 132, cornerRadius: 14)
            Text(item.title)
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(D.ink)
                .lineLimit(2)
            HStack(spacing: 6) {
                PolkaAvatar(initials: item.ownerInitials, size: 22)
                Text(item.owner.components(separatedBy: " ").first ?? item.owner)
                    .font(.system(size: 12))
                    .foregroundStyle(D.sub)
                    .lineLimit(1)
            }
        }
        .padding(10)
        .background(D.card, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
    }
}

struct PrimaryButton: View {
    let title: String
    var icon: String? = nil
    var quiet = false
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if let icon { Image(systemName: icon) }
                Text(title)
            }
            .font(.system(size: 16, weight: .semibold))
            .foregroundStyle(quiet ? D.accent : .white)
            .frame(maxWidth: .infinity, minHeight: 50)
            .background(quiet ? D.accent.opacity(0.11) : D.accent,
                        in: RoundedRectangle(cornerRadius: 13, style: .continuous))
        }
        .buttonStyle(.plain)
    }
}

struct SearchField: View {
    @Binding var text: String

    var body: some View {
        HStack(spacing: 9) {
            Image(systemName: "magnifyingglass").foregroundStyle(D.mute)
            TextField("Вещь или категория", text: $text)
                .textInputAutocapitalization(.never)
            if !text.isEmpty {
                Button { text = "" } label: {
                    Image(systemName: "xmark.circle.fill").foregroundStyle(D.mute)
                }
                .buttonStyle(.plain)
            }
        }
        .font(.system(size: 16))
        .padding(.horizontal, 13)
        .frame(height: 44)
        .background(D.card, in: RoundedRectangle(cornerRadius: 13, style: .continuous))
    }
}
