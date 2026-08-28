import Foundation
import Observation

struct Me: Decodable {
    let name: String
    let initials: String
    let city: String
    let friends: Int
}

struct Person: Decodable, Identifiable {
    let id: String
    let name: String
    let initials: String
    let relation: String
    let color: String
}

struct LoanItem: Decodable, Identifiable, Hashable {
    let id: String
    let title: String
    let owner: String
    let ownerInitials: String
    let category: String
    let availability: String
    let detail: String
    let icon: String
    let colors: [String]
    let featured: Bool
}

struct LoanRequest: Decodable, Identifiable {
    let id: String
    let person: String
    let initials: String
    let item: String
    let dates: String
    let status: String
    let incoming: Bool
}

enum PolkaData {
    static let me: Me = Fixtures.load("me")
    static let people: [Person] = Fixtures.load("people")
    static let items: [LoanItem] = Fixtures.load("items")
    static let requests: [LoanRequest] = Fixtures.load("requests")
}

enum PolkaTab: Hashable { case shelf, discover, requests, profile }
enum PolkaRoute: Hashable { case item(String), handoff(String) }

@MainActor
@Observable
final class PolkaStore {
    var tab: PolkaTab = .shelf
    var captureScreen: String?
    var showsIncomingRequests = true
    var selectedItemID = "tent"
    var showRequest = false
    var showAdd = false
    var requestSent = false
    var toast: String?

    let me = PolkaData.me
    let people = PolkaData.people
    let items = PolkaData.items
    let requests = PolkaData.requests

    init(arguments: [String] = ProcessInfo.processInfo.arguments) {
        captureScreen = arguments.first(where: { $0.hasPrefix("-capture:screen=") })?
            .replacingOccurrences(of: "-capture:screen=", with: "")
        guard let raw = arguments.first(where: { $0.hasPrefix("-capture:tab=") })?
            .replacingOccurrences(of: "-capture:tab=", with: "") else { return }
        switch raw {
        case "discover": tab = .discover
        case "requests": tab = .requests
        case "profile": tab = .profile
        default: tab = .shelf
        }
    }

    var selectedItem: LoanItem {
        items.first(where: { $0.id == selectedItemID }) ?? items[0]
    }

    func request(_ item: LoanItem) {
        selectedItemID = item.id
        showRequest = true
    }

    func show(_ message: String) {
        toast = message
        Task {
            try? await Task.sleep(for: .seconds(2.2))
            if toast == message { toast = nil }
        }
    }
}
