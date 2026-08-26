import XCTest

final class TailsSmokeTests: XCTestCase {
    func testAnyCompleteLocalCodeEntersTheConcept() {
        let app = XCUIApplication()
        app.launch()
        let email = app.textFields["emailField"]
        XCTAssertTrue(email.waitForExistence(timeout: 5))
        email.tap()
        email.typeText("demo@example.com")
        app.buttons["phone.open-code"].tap()
        let code = app.textFields["codeField"]
        XCTAssertTrue(code.waitForExistence(timeout: 3))
        code.tap()
        code.typeText("1234")
        app.buttons["code.open-codefail"].tap()
        XCTAssertTrue(app.buttons["Главная"].waitForExistence(timeout: 5))
        XCTAssertFalse(app.staticTexts["Неверный код"].exists)
    }

    private func launch() -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-ui-demo"]
        app.launch()
        return app
    }

    func testConversationOpensAndSentMessageRemainsVisible() {
        let app = launch()
        let messages = app.buttons["Сообщения"]
        XCTAssertTrue(messages.waitForExistence(timeout: 5))
        messages.tap()
        let dialog = app.staticTexts["Марта и Лена"].firstMatch
        XCTAssertTrue(dialog.waitForExistence(timeout: 5))
        dialog.tap()
        let field = app.textFields["Сообщение"]
        XCTAssertTrue(field.waitForExistence(timeout: 5))
        field.tap()
        field.typeText("Будем у входа")
        let send = app.buttons["Отправить сообщение"]
        XCTAssertTrue(send.waitForExistence(timeout: 3))
        send.tap()
        XCTAssertTrue(app.staticTexts["Будем у входа"].waitForExistence(timeout: 3))
    }

    func testProfileHasOneOwnedEntryAndSurvivesAccessibilityType() {
        let app = XCUIApplication()
        app.launchArguments = ["-ui-demo"]
        app.launchEnvironment["UICTContentSizeCategory"] = "UICTContentSizeCategoryAccessibilityExtraExtraExtraLarge"
        app.launch()
        let profile = app.buttons["Профиль"]
        XCTAssertTrue(profile.waitForExistence(timeout: 5))
        profile.tap()
        XCTAssertTrue(app.staticTexts["Бруно"].firstMatch.waitForExistence(timeout: 5))
        XCTAssertEqual(app.staticTexts.matching(identifier: "Профиль").count, 1)
        app.swipeUp()
        XCTAssertTrue(app.buttons["Редактировать профиль"].waitForExistence(timeout: 3))
    }
}
