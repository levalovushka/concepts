import XCTest

final class DvorSmokeTests: XCTestCase {
    private func launch(_ screen: String, dynamicType: Bool = false) -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-shot", screen, "-state", "default"]
        if dynamicType {
            app.launchArguments += ["-UIPreferredContentSizeCategoryName", "UICTContentSizeCategoryAccessibilityExtraExtraExtraLarge"]
        }
        app.launch()
        return app
    }

    func testVKMimicryTabsAreLabelledAndHittable() {
        let app = launch("home")
        for label in ["Дом", "Чаты", "Двор", "Меню"] {
            let tab = app.buttons[label]
            XCTAssertTrue(tab.waitForExistence(timeout: 5), label)
            XCTAssertTrue(tab.isHittable, label)
        }
    }

    func testHomeNavigationSurvivesAccessibilityDynamicType() {
        let app = launch("home", dynamicType: true)
        let notifications = app.buttons.matching(
            NSPredicate(format: "label BEGINSWITH %@", "Уведомления")
        ).firstMatch
        XCTAssertTrue(notifications.waitForExistence(timeout: 5))
        XCTAssertTrue(notifications.isHittable)
        notifications.tap()
        XCTAssertTrue(app.buttons["Прочитать всё"].waitForExistence(timeout: 3))
    }
}
