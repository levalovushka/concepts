import AuthenticationServices
import SwiftUI
import Security

@MainActor
@Observable
final class Session {
    enum ResidenceStatus: String, Equatable {
        case unverified
        case pendingReview
        case verified
    }

    private(set) var isAuthenticated: Bool
    private(set) var residenceStatus: ResidenceStatus
    private(set) var appleUserIdentifier: String?
    private let storageNamespace: String
    private let validatesAppleCredential: Bool

    var canWriteToHouse: Bool { isAuthenticated && residenceStatus == .verified }

    init(authenticated: Bool = false, residenceStatus: ResidenceStatus = .unverified,
         appleUserIdentifier: String? = nil, storageNamespace: String = "native.session",
         validatesAppleCredential: Bool = false) {
        isAuthenticated = authenticated
        self.residenceStatus = residenceStatus
        self.appleUserIdentifier = appleUserIdentifier
        self.storageNamespace = storageNamespace
        self.validatesAppleCredential = validatesAppleCredential
    }

    static func restored(storageNamespace: String = "native.session", validatesAppleCredential: Bool = false) -> Session {
        let defaults = UserDefaults.standard
        let authenticated = SessionCredentialStore.contains(namespace: storageNamespace)
            || defaults.bool(forKey: "\(storageNamespace).authenticated")
        let status = defaults.string(forKey: "\(storageNamespace).residence")
            .flatMap(ResidenceStatus.init(rawValue:)) ?? .unverified
        return Session(
            authenticated: authenticated,
            residenceStatus: status,
            appleUserIdentifier: defaults.string(forKey: "\(storageNamespace).appleUser"),
            storageNamespace: storageNamespace,
            validatesAppleCredential: validatesAppleCredential
        )
    }

    func signIn() {
        isAuthenticated = true
        persist()
    }

    func signIn(appleUserIdentifier: String) {
        isAuthenticated = true
        self.appleUserIdentifier = appleUserIdentifier
        persist()
    }
    func verifyResidence() {
        isAuthenticated = true
        residenceStatus = .verified
        persist()
    }
    func submitResidenceForReview() {
        isAuthenticated = true
        residenceStatus = .pendingReview
        persist()
    }
    func signOut() {
        isAuthenticated = false
        residenceStatus = .unverified
        appleUserIdentifier = nil
        persist()
    }

    /// Restored Apple sessions are trusted only while the system credential is
    /// still authorised. Revoked or transferred credentials return to entry.
    func validateRestoredCredential() async -> Bool {
        guard validatesAppleCredential else { return isAuthenticated }
        guard isAuthenticated, let appleUserIdentifier else { return !isAuthenticated }
        let state = await withCheckedContinuation { continuation in
            ASAuthorizationAppleIDProvider().getCredentialState(forUserID: appleUserIdentifier) { state, _ in
                continuation.resume(returning: state)
            }
        }
        guard state == .authorized else {
            signOut()
            return false
        }
        return true
    }

    private func persist() {
        let defaults = UserDefaults.standard
        defaults.set(isAuthenticated, forKey: "\(storageNamespace).authenticated")
        defaults.set(residenceStatus.rawValue, forKey: "\(storageNamespace).residence")
        defaults.set(appleUserIdentifier, forKey: "\(storageNamespace).appleUser")
        if isAuthenticated { SessionCredentialStore.save(namespace: storageNamespace) }
        else { SessionCredentialStore.remove(namespace: storageNamespace) }
    }
}

private enum SessionCredentialStore {
    private static let service = "com.camo.native.session"

    static func contains(namespace: String) -> Bool {
        var item: CFTypeRef?
        let status = SecItemCopyMatching([
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: namespace,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ] as CFDictionary, &item)
        return status == errSecSuccess
    }

    static func save(namespace: String) {
        remove(namespace: namespace)
        SecItemAdd([
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: namespace,
            kSecValueData as String: Data("authenticated".utf8),
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
        ] as CFDictionary, nil)
    }

    static func remove(namespace: String) {
        SecItemDelete([
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: namespace,
        ] as CFDictionary)
    }
}
