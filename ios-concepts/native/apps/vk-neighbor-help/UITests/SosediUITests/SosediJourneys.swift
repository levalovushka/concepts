import XCTest

final class SosediJourneys: XCTestCase {
    private func app(_ arguments:[String]=["--reset-session"])->XCUIApplication { let app=XCUIApplication(); app.launchArguments=arguments; app.launch(); return app }

    func testJourneyAuthBrowseRespond() {
        let app=app(); app.textFields["emailField"].tap(); app.textFields["emailField"].typeText("demo@example.com"); app.buttons["submitEmail"].tap(); app.textFields["codeField"].tap(); app.textFields["codeField"].typeText("246810"); app.buttons["verifyCode"].tap()
        XCTAssertTrue(app.staticTexts["Рядом"].waitForExistence(timeout:2)); app.buttons["open-post-marina-chair"].tap(); app.buttons["openResponse"].tap(); app.buttons["sendResponse"].tap(); XCTAssertTrue(app.navigationBars["Договорённость"].waitForExistence(timeout:2))
    }

    func testJourneyCreateManualArea() {
        let app=app(["--capture-screen","nearby-feed","--capture-state","permission-denied"]); app.buttons["openCreate"].tap(); app.textFields["postDescription"].tap(); app.textFields["postDescription"].typeText("Нужна помощь с книгами"); XCTAssertTrue(app.buttons["publishPost"].isEnabled); app.buttons["publishPost"].tap(); XCTAssertTrue(app.staticTexts["Рядом"].exists)
    }

    func testJourneyCompleteAgreement() {
        let app=app(["--capture-screen","messages-list","--capture-state","populated/default"]); app.buttons["openConversation"].tap(); app.buttons["sendMessage"].tap(); app.buttons["completeAgreement"].tap(); XCTAssertTrue(app.staticTexts["Помощь завершена"].waitForExistence(timeout:2))
    }

    func testJourneyShareExtensionDraft() {
        let app=app(["--capture-screen","nearby-feed","--capture-state","populated/default","--shared-draft"]); app.buttons["openCreate"].tap(); XCTAssertTrue(app.staticTexts["Черновик из меню «Поделиться»"].exists); XCTAssertFalse(app.buttons["publishPost"].isEnabled)
    }

    func testJourneyNotificationSnapshot() {
        let app=app(["--capture-screen","nearby-feed","--capture-state","populated/default"]); XCTAssertTrue(app.buttons["open-post-marina-chair"].exists); app.buttons["open-post-marina-chair"].tap(); XCTAssertTrue(app.staticTexts["Отдам детский стул"].exists)
    }

    func testAuthLoadingHasNoActions() {
        let app=app(["--capture-screen","auth-email","--capture-state","loading","--reset-session"]); XCTAssertTrue(app.descendants(matching:.any)["authLoading"].waitForExistence(timeout:2)); XCTAssertFalse(app.buttons["submitEmail"].exists); XCTAssertFalse(app.textFields["emailField"].exists)
    }
}
