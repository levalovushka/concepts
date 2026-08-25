import XCTest

final class LooksSmokeTests: XCTestCase {
    private func launch(_ screen: String, state: String = "default",
                        environment: [String: String] = [:], dynamicType: Bool = false) -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-shot", screen, "-state", state]
        if dynamicType {
            app.launchArguments += ["-UIPreferredContentSizeCategoryName", "UICTContentSizeCategoryAccessibilityExtraExtraExtraLarge"]
        }
        app.launchEnvironment = environment
        app.launch()
        return app
    }

    func testAuthPrimaryCTAIsHittableAccessibleAndSurvivesDynamicType() {
        let app = launch("phone", environment: ["NATIVE_UI_TESTING": "1"], dynamicType: true)
        let email = app.textFields["Почта"]
        let action = app.buttons["action.phone.continue-email"]
        XCTAssertTrue(email.waitForExistence(timeout: 5))
        XCTAssertTrue(email.isHittable)
        XCTAssertTrue(action.exists)
        XCTAssertTrue(action.isHittable)
        XCTAssertFalse(action.isEnabled)
        email.tap()
        email.typeText("nika@example.com")
        XCTAssertTrue(action.isEnabled)
        action.tap()
        XCTAssertTrue(app.buttons["action.code.confirm-code"].waitForExistence(timeout: 3))
    }

    func testHomeIconAndTabControlsHaveLabelsAndRealHitTargets() {
        let app = launch("home")
        let notifications = app.buttons.matching(
            NSPredicate(format: "label BEGINSWITH %@", "Уведомления")
        ).firstMatch
        XCTAssertTrue(notifications.waitForExistence(timeout: 5))
        XCTAssertTrue(notifications.isHittable)
        XCTAssertEqual(notifications.elementType, .button)
        let servicesTab = app.buttons["Меню"]
        XCTAssertTrue(servicesTab.exists)
        XCTAssertTrue(servicesTab.isHittable)
    }

    func testPrimaryRowAndCTAProduceNavigationAndMutation() {
        let nearby = launch("nearby", environment: [
            "NATIVE_UI_TESTING": "1",
            "NATIVE_UI_TEST_PERMISSION_LOCATION": "pregranted"
        ])
        let row = nearby.buttons.matching(identifier: "action.nearby.open-nearby-event").firstMatch
        XCTAssertTrue(row.waitForExistence(timeout: 5))
        XCTAssertTrue(row.isHittable)
        row.tap()
        let join = nearby.buttons["action.event.join-event"]
        XCTAssertTrue(join.waitForExistence(timeout: 3))
        XCTAssertTrue(join.isHittable)
        let initialLabel = join.label
        join.tap()
        let mutationCompleted = XCTNSPredicateExpectation(
            predicate: NSPredicate(format: "label != %@", initialLabel), object: join
        )
        XCTAssertEqual(XCTWaiter.wait(for: [mutationCompleted], timeout: 3), .completed)
    }

    func testPermissionCTAReachesLocationAdapterWithoutDrivingTCCChrome() {
        let app = launch("nearby", environment: [
            "NATIVE_UI_TESTING": "1",
            "NATIVE_UI_TEST_PERMISSION_LOCATION": "granted"
        ])
        let action = app.buttons["action.nearby.enable-location"]
        XCTAssertTrue(action.waitForExistence(timeout: 5))
        XCTAssertTrue(action.isHittable)
        action.tap()
        let requestCompleted = XCTNSPredicateExpectation(
            predicate: NSPredicate(format: "exists == false"), object: action
        )
        XCTAssertEqual(XCTWaiter.wait(for: [requestCompleted], timeout: 3), .completed)
    }
}
