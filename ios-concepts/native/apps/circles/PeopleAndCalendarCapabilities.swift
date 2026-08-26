import SwiftUI
import ContactsUI
import EventKit
import UIKit

struct CirclesContactPicker: UIViewControllerRepresentable {
    @Binding var selectedNames: [String]
    @Environment(\.dismiss) private var dismiss

    func makeCoordinator() -> Coordinator { Coordinator(parent: self) }
    func makeUIViewController(context: Context) -> CNContactPickerViewController {
        let picker = CNContactPickerViewController()
        picker.delegate = context.coordinator
        picker.predicateForEnablingContact = NSPredicate(value: true)
        return picker
    }
    func updateUIViewController(_ controller: CNContactPickerViewController, context: Context) {}

    final class Coordinator: NSObject, CNContactPickerDelegate {
        let parent: CirclesContactPicker
        init(parent: CirclesContactPicker) { self.parent = parent }

        func contactPicker(_ picker: CNContactPickerViewController, didSelect contacts: [CNContact]) {
            parent.selectedNames = contacts.compactMap { CNContactFormatter.string(from: $0, style: .fullName) }
            parent.dismiss()
        }
        func contactPickerDidCancel(_ picker: CNContactPickerViewController) { parent.dismiss() }
    }
}

@MainActor
enum CirclesCalendarWriter {
    static func add(_ plan: CirclePlan, using permissions: Permissions) async -> String? {
        guard await permissions.request(.calendar) else { return nil }
        let store = EKEventStore()
        let event = EKEvent(eventStore: store)
        event.title = plan.title
        event.location = plan.place
        event.notes = "План круга «\(plan.circle)»"
        event.startDate = Date().addingTimeInterval(3 * 24 * 60 * 60)
        event.endDate = event.startDate.addingTimeInterval(90 * 60)
        event.calendar = store.defaultCalendarForNewEvents
        do {
            try store.save(event, span: .thisEvent, commit: true)
            return event.eventIdentifier
        } catch {
            return nil
        }
    }
}

enum CirclesSharePayloadWriter {
    struct Result { let url: URL; let appGroupStored: Bool }

    static func share(_ post: CirclePost, storeInAppGroup: Bool) -> Result {
        let url = URL(string: "https://circles.local/post/\(post.id)")!
        let payload: [String: String] = [
            "id": post.id,
            "title": post.title,
            "text": post.text,
            "url": url.absoluteString,
        ]
        var stored = false
        if storeInAppGroup, let bundleID = Bundle.main.bundleIdentifier,
           let defaults = UserDefaults(suiteName: "group.\(bundleID)"),
           let data = try? JSONSerialization.data(withJSONObject: payload) {
            defaults.set(data, forKey: "circles.pendingSharePayload")
            stored = defaults.data(forKey: "circles.pendingSharePayload") == data
        }
        UIPasteboard.general.url = url
        return Result(url: url, appGroupStored: stored)
    }
}
