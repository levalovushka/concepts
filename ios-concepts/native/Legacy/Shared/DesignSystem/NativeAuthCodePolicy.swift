import Foundation

enum NativeAuthCodePolicy {
    static func accepts(_ code: String, length: Int, demoCode: String, isFailureFixture: Bool) -> Bool {
        guard code.count == length, code.allSatisfy(\.isNumber) else { return false }
        return isFailureFixture ? code == demoCode : true
    }
}
