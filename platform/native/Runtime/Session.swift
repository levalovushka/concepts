import AuthenticationServices
import SwiftUI

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

    var canWriteToHouse: Bool { isAuthenticated && residenceStatus == .verified }

    init(authenticated: Bool = false, residenceStatus: ResidenceStatus = .unverified,
         appleUserIdentifier: String? = nil) {
        isAuthenticated = authenticated
        self.residenceStatus = residenceStatus
        self.appleUserIdentifier = appleUserIdentifier
    }

    static func restored() -> Session {
        let defaults = UserDefaults.standard
        let authenticated = defaults.bool(forKey: "dvor.session.authenticated")
        let status = defaults.string(forKey: "dvor.session.residence")
            .flatMap(ResidenceStatus.init(rawValue:)) ?? .unverified
        return Session(
            authenticated: authenticated,
            residenceStatus: status,
            appleUserIdentifier: defaults.string(forKey: "dvor.session.appleUser")
        )
    }

    /// Идентификатор Apple есть не у всех концептов: набор vkontakte входит по
    /// почте, и там подписывать сессию нечем.
    func signIn(appleUserIdentifier: String? = nil) {
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
        defaults.set(isAuthenticated, forKey: "dvor.session.authenticated")
        defaults.set(residenceStatus.rawValue, forKey: "dvor.session.residence")
        defaults.set(appleUserIdentifier, forKey: "dvor.session.appleUser")
    }
}
