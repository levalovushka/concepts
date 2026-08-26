import UIKit
import Social

final class ShareViewController: SLComposeServiceViewController {
    override func isContentValid() -> Bool { true }
    override func didSelectPost() {
        let shared = UserDefaults(suiteName: "group.example.sosedi")
        shared?.set(contentText ?? "", forKey: "sharedDraftText")
        shared?.set("importedEndpoint", forKey: "sharedDraftStatus")
        extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
    }
    override func configurationItems() -> [Any]! { [] }
}
