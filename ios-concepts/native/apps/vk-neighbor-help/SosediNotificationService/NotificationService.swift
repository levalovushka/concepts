import UserNotifications

final class NotificationService: UNNotificationServiceExtension {
    private var handler: ((UNNotificationContent)->Void)?
    private var content: UNMutableNotificationContent?
    override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent)->Void) {
        handler=contentHandler; content=(request.content.mutableCopy() as? UNMutableNotificationContent)
        guard let content else { contentHandler(request.content); return }
        let defaults=UserDefaults(suiteName:"group.example.sosedi")
        content.title=defaults?.string(forKey:"snapshotAuthor") ?? "Марина Соколова"
        content.subtitle=defaults?.string(forKey:"snapshotSubject") ?? "Отдам детский стул"
        contentHandler(content)
    }
    override func serviceExtensionTimeWillExpire() { if let handler, let content { handler(content) } }
}
