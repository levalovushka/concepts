/**
 * Xcode extension knowledge belongs to the native compiler, never concept.json.
 * The concept names a product extension; this catalog owns bundle structure,
 * extension-point identifiers and the smallest honest implementation that builds.
 */
export const IOS_EXTENSION_CATALOG = Object.freeze({
  "notification-service": {
    displayName: ({ productName }) => `${productName}: уведомления`,
    productSuffix: "NotificationService",
    bundleSuffix: "notificationservice",
    extensionPoint: "com.apple.usernotifications.service",
    frameworks: ["UserNotifications"],
    sourceFile: "NotificationService.swift",
    source: `import UserNotifications

final class NotificationService: UNNotificationServiceExtension {
    private var handler: ((UNNotificationContent) -> Void)?
    private var content: UNMutableNotificationContent?

    override func didReceive(
        _ request: UNNotificationRequest,
        withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void
    ) {
        handler = contentHandler
        content = request.content.mutableCopy() as? UNMutableNotificationContent
        contentHandler(content ?? request.content)
    }

    override func serviceExtensionTimeWillExpire() {
        if let handler, let content { handler(content) }
    }
}
`,
  },
  "credential-provider": {
    displayName: ({ productName }) => `${productName}: пароли`,
    productSuffix: "CredentialProvider",
    bundleSuffix: "credentials",
    extensionPoint: "com.apple.authentication-services-credential-provider-ui",
    frameworks: ["AuthenticationServices", "Security"],
    entitlements: ({ bundleId }) => [
      { key: "com.apple.developer.authentication-services.autofill-credential-provider", value: true },
      { key: "keychain-access-groups", value: [`$(AppIdentifierPrefix)${bundleId}.shared`] },
    ],
    sourceFile: "CredentialProviderViewController.swift",
    source: ({ productName, bundleId, slug }) => {
      const house = slug === "dvor";
      const title = house ? "Доступы дома" : `Пароли · ${productName}`;
      const firstTitle = house ? "Домофон · квартира 48" : `Аккаунт · ${productName}`;
      const secondTitle = house ? "Гостевая сеть · Dvor-Guest" : "Резервный аккаунт";
      const firstUser = house ? "Квартира 48" : "Основной аккаунт";
      const secondUser = house ? "Dvor-Guest" : "Резервный аккаунт";
      const keychainService = `${bundleId}.${house ? "house-access" : "credentials"}`;
      return `import AuthenticationServices
import Security
import UIKit

final class CredentialProviderViewController: ASCredentialProviderViewController {
    override func prepareCredentialList(for serviceIdentifiers: [ASCredentialServiceIdentifier]) {
        let title = UILabel()
        title.text = "${title}"
        title.font = .preferredFont(forTextStyle: .title2)
        title.textAlignment = .center
        let detail = UILabel()
        detail.text = "Выберите доступ для безопасной подстановки"
        detail.textColor = .secondaryLabel
        detail.textAlignment = .center
        let door = UIButton(type: .system)
        door.setTitle("${firstTitle}", for: .normal)
        door.addTarget(self, action: #selector(selectDoor), for: .touchUpInside)
        let guest = UIButton(type: .system)
        guest.setTitle("${secondTitle}", for: .normal)
        guest.addTarget(self, action: #selector(selectGuest), for: .touchUpInside)
        let stack = UIStackView(arrangedSubviews: [title, detail, door, guest])
        stack.axis = .vertical
        stack.spacing = 16
        stack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(stack)
        NSLayoutConstraint.activate([
            stack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
            stack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24),
            stack.centerYAnchor.constraint(equalTo: view.centerYAnchor),
        ])
    }

    override func provideCredentialWithoutUserInteraction(for credentialIdentity: ASPasswordCredentialIdentity) {
        let error = NSError(
            domain: ASExtensionErrorDomain,
            code: ASExtensionError.userInteractionRequired.rawValue
        )
        extensionContext.cancelRequest(withError: error)
    }

    override func prepareInterfaceToProvideCredential(for credentialIdentity: ASPasswordCredentialIdentity) {
        complete(recordIdentifier: credentialIdentity.recordIdentifier)
    }

    @objc private func selectDoor() { complete(recordIdentifier: "door") }
    @objc private func selectGuest() { complete(recordIdentifier: "guest") }

    private func complete(recordIdentifier: String?) {
        let record = recordIdentifier == "guest" ? "guest" : "door"
        guard let password = Self.password(for: record) else {
            let error = NSError(
                domain: ASExtensionErrorDomain,
                code: ASExtensionError.credentialIdentityNotFound.rawValue
            )
            extensionContext.cancelRequest(withError: error)
            return
        }
        let user = record == "guest" ? "${secondUser}" : "${firstUser}"
        let credential = ASPasswordCredential(user: user, password: password)
        extensionContext.completeRequest(withSelectedCredential: credential, completionHandler: nil)
    }

    private static func password(for account: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: "${keychainService}",
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
`;
    },
  },
  "share-extension": {
    displayName: ({ productName }) => `Добавить в «${productName}»`,
    productSuffix: "ShareExtension",
    bundleSuffix: "share",
    extensionPoint: "com.apple.share-services",
    frameworks: ["UniformTypeIdentifiers"],
    activationRule: {
      NSExtensionActivationSupportsImageWithMaxCount: 10,
      NSExtensionActivationSupportsMovieWithMaxCount: 1,
    },
    sourceFile: "ShareViewController.swift",
    source: ({ productName }) => `import UIKit
import UniformTypeIdentifiers

final class ShareViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        let label = UILabel()
        label.text = "Материал будет добавлен в черновики приложения «${productName}»"
        label.numberOfLines = 0
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        let save = UIButton(type: .system)
        save.setTitle("Сохранить в черновик", for: .normal)
        save.titleLabel?.font = .preferredFont(forTextStyle: .headline)
        save.addTarget(self, action: #selector(saveDraft), for: .touchUpInside)
        save.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(label)
        view.addSubview(save)
        NSLayoutConstraint.activate([
            label.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
            label.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24),
            label.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            save.topAnchor.constraint(equalTo: label.bottomAnchor, constant: 24),
            save.centerXAnchor.constraint(equalTo: view.centerXAnchor),
        ])
    }

    @objc private func saveDraft() {
        guard let item = extensionContext?.inputItems.first as? NSExtensionItem else {
            extensionContext?.cancelRequest(withError: NSError(domain: "${productName}.share", code: 1))
            return
        }
        let hasSupportedItem = (item.attachments ?? []).contains { provider in
            provider.hasItemConformingToTypeIdentifier(UTType.image.identifier)
                || provider.hasItemConformingToTypeIdentifier(UTType.movie.identifier)
                || provider.hasItemConformingToTypeIdentifier(UTType.url.identifier)
        }
        guard hasSupportedItem else {
            extensionContext?.cancelRequest(withError: NSError(domain: "${productName}.share", code: 2))
            return
        }
        extensionContext?.completeRequest(returningItems: [item], completionHandler: nil)
    }
}
`,
  },
  widget: {
    displayName: ({ productName }) => productName,
    productSuffix: "Widget",
    bundleSuffix: "widget",
    extensionPoint: "com.apple.widgetkit-extension",
    frameworks: ["SwiftUI", "WidgetKit"],
    sourceFile: "ProductWidget.swift",
    source: ({ productName, slug }) => {
      const title = slug === "looks" ? "Образ дня" : productName;
      const detail = slug === "looks"
        ? "Соберите сочетание из сохранённых вещей"
        : "Актуальные данные доступны в приложении";
      return `import SwiftUI
import WidgetKit

struct ProductEntry: TimelineEntry { let date: Date }

struct ProductProvider: TimelineProvider {
    func placeholder(in context: Context) -> ProductEntry { ProductEntry(date: .now) }
    func getSnapshot(in context: Context, completion: @escaping (ProductEntry) -> Void) {
        completion(ProductEntry(date: .now))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<ProductEntry>) -> Void) {
        completion(Timeline(entries: [ProductEntry(date: .now)], policy: .after(.now.addingTimeInterval(3600))))
    }
}

struct ProductWidgetView: View {
    var entry: ProductEntry
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("${title}").font(.headline)
            Text("${detail}")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .containerBackground(.fill.tertiary, for: .widget)
    }
}

@main
struct ProductWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "${slug}.summary", provider: ProductProvider()) { ProductWidgetView(entry: $0) }
            .configurationDisplayName("${productName}")
            .description("Актуальные данные из приложения")
            .supportedFamilies([.systemSmall, .systemMedium])
    }
}
`;
    },
  },
});

export function resolveExtension(id, context = {}) {
  const definition = IOS_EXTENSION_CATALOG[id];
  if (!definition) return null;
  const productContext = {
    productName: context.productName || "Приложение",
    slug: context.slug || "app",
    bundleId: context.bundleId || `com.camo.${context.slug || "app"}`,
  };
  return {
    id,
    ...Object.fromEntries(Object.entries(definition).map(([key, value]) => [
      key,
      typeof value === "function" ? value(productContext) : value,
    ])),
  };
}
