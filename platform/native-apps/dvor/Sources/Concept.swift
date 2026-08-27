import Foundation

/// Дом, житель и гостевая сеть — из fixtures концепта, не копией в коде.
struct House: Decodable {
    let address: String
    let ssid: String
    let radiusMeters: Int
    let corpuses: Int
    let flats: Int
}

struct Me: Decodable {
    let name: String
    let flatNumber: Int
    let entrance: Int
    let role: String
}

struct GuestNetwork: Decodable {
    let ssid: String
    let password: String
    let qrLocation: String
}

enum Concept {
    static let house: House = Fixtures.load("house")
    static let me: Me = Fixtures.load("me")
    static let guest: GuestNetwork = Fixtures.load("guestNetwork")
}
