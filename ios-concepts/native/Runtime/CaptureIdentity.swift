import Foundation

/// Runtime handshake used by the screenshot verifier. A capture is accepted only
/// after the app itself confirms which product surface and state reached the view tree.
enum CaptureIdentity {
    static func report(surface: String, state: String, safeAreaTop: CGFloat = 0,
                       contentMinY: CGFloat = 0) {
        guard ProcessInfo.processInfo.arguments.contains("-shot") else { return }
        merge([
            "surface": surface, "state": state,
            "safeAreaTop": safeAreaTop, "contentMinY": contentMinY,
        ])
    }

    static func reportNavigationChrome(minY: CGFloat) {
        guard ProcessInfo.processInfo.arguments.contains("-shot") else { return }
        merge(["navigationChromeMinY": minY])
    }

    private static func merge(_ fields: [String: Any]) {
        guard let directory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else { return }
        let url = directory.appendingPathComponent("capture-identity.json")
        var payload = ((try? Data(contentsOf: url)).flatMap {
            try? JSONSerialization.jsonObject(with: $0) as? [String: Any]
        }) ?? [:]
        payload.merge(fields) { _, new in new }
        guard let data = try? JSONSerialization.data(withJSONObject: payload, options: [.sortedKeys]) else { return }
        try? data.write(to: url, options: .atomic)
    }
}
