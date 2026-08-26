import Foundation
import CallKit
import AVFoundation

@MainActor
@Observable
final class CirclesCallCoordinator: NSObject, CXProviderDelegate {
    enum State: Equatable { case idle, connecting, active, failed }

    private let controller = CXCallController()
    private let provider: CXProvider
    private var activeCall: UUID?
    private(set) var state: State = .idle

    override init() {
        let configuration = CXProviderConfiguration()
        configuration.supportsVideo = false
        configuration.maximumCallsPerCallGroup = 1
        configuration.supportedHandleTypes = [.generic]
        provider = CXProvider(configuration: configuration)
        super.init()
        provider.setDelegate(self, queue: nil)
    }

    func start(name: String) async -> Bool {
        guard state == .idle || state == .failed else { return state == .active }
        let id = UUID()
        let handle = CXHandle(type: .generic, value: name)
        let action = CXStartCallAction(call: id, handle: handle)
        action.isVideo = false
        do {
            try await controller.request(CXTransaction(action: action))
            activeCall = id
            state = .connecting
            provider.reportOutgoingCall(with: id, startedConnectingAt: Date())
            provider.reportOutgoingCall(with: id, connectedAt: Date())
            state = .active
            return true
        } catch {
            state = .failed
            return false
        }
    }

    func end() async {
        guard let activeCall else { return }
        try? await controller.request(CXTransaction(action: CXEndCallAction(call: activeCall)))
        self.activeCall = nil
        state = .idle
    }

    nonisolated func providerDidReset(_ provider: CXProvider) {
        Task { @MainActor in self.state = .idle; self.activeCall = nil }
    }

    nonisolated func provider(_ provider: CXProvider, perform action: CXStartCallAction) {
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playAndRecord, mode: .voiceChat, options: [.allowBluetoothHFP, .defaultToSpeaker])
            action.fulfill()
        } catch {
            action.fail()
        }
    }

    nonisolated func provider(_ provider: CXProvider, perform action: CXEndCallAction) {
        action.fulfill()
        Task { @MainActor in self.state = .idle; self.activeCall = nil }
    }
}
