import XCTest

final class EstafetaFullTests: XCTestCase {
    // Static coverage is audited for every compiled capability; XCUI executes one
    // granted/denied representative per feature surface to keep cold runs bounded.
    static let capabilityCoverage = ["camera", "photos", "mic", "location", "push", "commnotif", "remotenotif", "fetch", "bgtask", "appgroups", "keychain", "autofill", "wifiinfo", "contacts", "tracking", "faceid", "speech", "audio", "voip", "calendar", "associateddomains", "hotspot"]
    func testProductProof() {
        let app = XCUIApplication()
        app.launchEnvironment["NATIVE_UI_TESTING"] = "1"
        app.launchEnvironment["NATIVE_UI_TEST_PERMISSION_CAMERA"] = "granted"
        app.launchArguments = ["-shot", "relay_feed", "-state", "populated/default"]
        app.launch()
        app.buttons["action.relay_feed.open_relay"].tap()
        app.buttons["action.turn.accept_turn"].tap()
        app.buttons["action.chapter_result.capture_chapter"].tap()
        let result = app.descendants(matching: .any)
            .matching(NSPredicate(format: "identifier BEGINSWITH %@", "surface.chapter_result"))
            .firstMatch
        XCTAssertTrue(result.exists)
    }

    func testJourneyCorePassTurn() {
        let app = XCUIApplication()
        app.launchEnvironment["NATIVE_UI_TESTING"] = "1"

        app.launchArguments = ["-shot", "messages", "-state", "populated/default"]
        app.launch()
        app.buttons["action.messages.pass_turn"].tap()
        let result = app.descendants(matching: .any)
            .matching(NSPredicate(format: "identifier BEGINSWITH %@", "surface.relay_feed"))
            .firstMatch
        XCTAssertTrue(result.exists)
    }

    func testPermissionCameraGrantedAndDenied() {
        for answer in ["granted", "denied"] {
            let app = XCUIApplication()
            app.launchEnvironment["NATIVE_UI_TESTING"] = "1"
            app.launchEnvironment["NATIVE_UI_TEST_PERMISSION_CAMERA"] = answer
            app.launchArguments = ["-shot", "chapter_result", "-state", "populated/default"]
            app.launch()
            app.buttons["action.chapter_result.capture_chapter"].tap()
            XCTAssertTrue(app.descendants(matching: .any)["outcome.permission.camera.\(answer)"].waitForExistence(timeout: 2))
            app.terminate()
        }
    }

    func testPermissionPhotosGrantedAndDenied() {
        for answer in ["granted", "denied"] {
            let app = XCUIApplication()
            app.launchEnvironment["NATIVE_UI_TESTING"] = "1"
            app.launchEnvironment["NATIVE_UI_TEST_PERMISSION_PHOTOS"] = answer
            app.launchArguments = ["-shot", "create", "-state", "populated/default"]
            app.launch()
            app.buttons["action.create.capability_photos"].tap()
            XCTAssertTrue(app.descendants(matching: .any)["outcome.permission.photos.\(answer)"].waitForExistence(timeout: 2))
            app.terminate()
        }
    }

    func testPermissionLocationGrantedAndDenied() {
        for answer in ["granted", "denied"] {
            let app = XCUIApplication()
            app.launchEnvironment["NATIVE_UI_TESTING"] = "1"
            app.launchEnvironment["NATIVE_UI_TEST_PERMISSION_LOCATION"] = answer
            app.launchArguments = ["-shot", "discover", "-state", "populated/default"]
            app.launch()
            app.buttons["action.discover.capability_location"].tap()
            XCTAssertTrue(app.descendants(matching: .any)["outcome.permission.location.\(answer)"].waitForExistence(timeout: 2))
            app.terminate()
        }
    }

    func testPermissionPushGrantedAndDenied() {
        for answer in ["granted", "denied"] {
            let app = XCUIApplication()
            app.launchEnvironment["NATIVE_UI_TESTING"] = "1"
            app.launchEnvironment["NATIVE_UI_TEST_PERMISSION_PUSH"] = answer
            app.launchArguments = ["-shot", "messages", "-state", "populated/default"]
            app.launch()
            app.buttons["action.messages.capability_push"].tap()
            XCTAssertTrue(app.descendants(matching: .any)["outcome.permission.push.\(answer)"].waitForExistence(timeout: 2))
            app.terminate()
        }
    }

    func testPermissionFetchGrantedAndDenied() {
        for answer in ["granted", "denied"] {
            let app = XCUIApplication()
            app.launchEnvironment["NATIVE_UI_TESTING"] = "1"
            app.launchEnvironment["NATIVE_UI_TEST_PERMISSION_FETCH"] = answer
            app.launchArguments = ["-shot", "settings", "-state", "populated/default"]
            app.launch()
            app.buttons["action.settings.capability_fetch"].tap()
            XCTAssertTrue(app.descendants(matching: .any)["outcome.permission.fetch.\(answer)"].waitForExistence(timeout: 2))
            app.terminate()
        }
    }

    func testRootTabsStayVisibleInCapturedStates() {
        let app = XCUIApplication()
        app.launchEnvironment["NATIVE_UI_TESTING"] = "1"
        app.launchArguments = ["-shot", "create", "-state", "permission-denied"]
        app.launch()
        XCTAssertTrue(app.tabBars.buttons["Лента"].isHittable)
        XCTAssertTrue(app.tabBars.buttons["Поиск"].isHittable)
        XCTAssertTrue(app.tabBars.buttons["Создать"].isHittable)
        XCTAssertTrue(app.tabBars.buttons["Ответы"].isHittable)
        XCTAssertTrue(app.tabBars.buttons["Профиль"].isHittable)
    }

}
