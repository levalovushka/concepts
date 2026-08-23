import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const appRoot = join(import.meta.dirname, "../apps/dvor");
const source = Object.fromEntries(
  readdirSync(appRoot)
    .filter(file => file.endsWith(".swift"))
    .map(file => [file, readFileSync(join(appRoot, file), "utf8")]),
);
const allSwift = Object.values(source).join("\n");

test("Dvor root screens use the product design-system compositions", () => {
  assert.match(source["Home.swift"], /DvorComposer/);
  assert.match(source["Home.swift"], /MatterCard/);
  assert.doesNotMatch(source["Tabs.swift"], /DvorCourtyardPlan/);
  assert.match(source["Tabs.swift"], /Сейчас во дворе/);
  assert.match(source["Tabs.swift"], /DvorStat/);
  assert.match(source["Services.swift"], /DvorSectionTitle/);
  assert.match(source["Services.swift"], /DvorRow/);
});

test("Dvor home exposes the primary feed without unearned mimicry layers", () => {
  const home = source["Home.swift"];
  assert.doesNotMatch(home, /storyStrip|func story\(/);
  assert.doesNotMatch(home, /DvorRoute\.chronicle/);
  assert.match(home, /DvorComposer/);
  assert.match(home, /ForEach\(visibleMatters\)/);
});

test("Dvor home passes the social-feed product gate", () => {
  const home = source["Home.swift"];
  const domain = source["Domain.swift"];
  assert.ok(home.indexOf("DvorComposer(") < home.indexOf("ForEach(visibleMatters"));
  assert.match(home, /Image\(mediaAsset\)/);
  assert.match(home, /icon: store\.liked\.contains\(matter\.id\) \? "heart\.fill" : "heart"/);
  assert.match(home, /MatterReaction\(icon: "message"/);
  assert.match(home, /ShareLink/);
  assert.match(home, /systemImage: "eye"/);
  for (const kind of ["post", "incident", "announcement", "question", "event", "poll"]) {
    assert.match(domain, new RegExp(`case ${kind} =`));
  }
  const anatomy = home.slice(home.indexOf("@ViewBuilder private var postContent"));
  assert.ok(anatomy.indexOf("matter.author.name") < anatomy.indexOf("matter.title"));
});

test("Dvor notification affordance opens a notification center, never an arbitrary first matter", () => {
  const home = source["Home.swift"];
  // Экран уведомлений живёт отдельным файлом: правило «в ленте нет чужих
  // входов» проверяется по Home.swift целиком, а уведомления к ленте не
  // относятся и тянут переходы в хронику, сеть и соседей.
  const notifications = source["Notifications.swift"];
  assert.match(home, /openNotifications: \{ nav\.push\(DvorRoute\.notifications\) \}/);
  assert.doesNotMatch(home, /Button \{ nav\.push\(DvorRoute\.matter\(store\.matters\[0\]\)\) \} label: \{ Image\(systemName: "bell"\)/);
  assert.match(notifications, /struct HouseNotificationsScreen/);
  assert.doesNotMatch(home, /nav\.push\(DvorRoute\.matter\(store\.matters\[0\]\)\)/);
  assert.match(notifications, /first\(where: \{ \$0\.kind == \.incident \}\)/);
  assert.match(notifications, /nav\.push\(DvorRoute\.meters\)/);
});

test("Dvor has no feedback-only button stubs", () => {
  assert.doesNotMatch(allSwift, /Button[^\n]*\{\s*nav\.toast/);
  assert.doesNotMatch(allSwift, /VK\w*Button[^\n]*\{\s*nav\.toast/);
  assert.doesNotMatch(allSwift, /VKRowAction[^\n]*\{\s*nav\.toast/);
});

test("Dvor does not reintroduce decorative gradients or forced uppercase", () => {
  assert.doesNotMatch(allSwift, /LinearGradient/);
  assert.doesNotMatch(allSwift, /\.uppercased\(\)/);
});

test("Dvor hides the root dock on pushed product screens", () => {
  assert.match(source["App.swift"], /destination[\s\S]*toolbar\(\.hidden, for: \.tabBar\)/);
});

test("Dvor keeps the native system tab bar for Liquid Glass", () => {
  assert.match(source["App.swift"], /TabView\(selection:/);
  assert.doesNotMatch(source["App.swift"], /VKTabBar|safeAreaInset\(edge:\s*\.bottom/);
});

test("Dvor secondary screens do not use oversized marketing headlines", () => {
  assert.doesNotMatch(allSwift, /Text\([^\n]*\)[^\n]*\.font\(\.system\(size:\s*(?:2[6-9]|[3-9]\d)/);
});

test("Dvor keeps product copy in sentence case", () => {
  assert.doesNotMatch(allSwift, /"DVOR-GUEST"/);
});

test("Dvor optical gate keeps critical geometry on a four-point grid", () => {
  const ds = source["DvorDesignSystem.swift"];
  const home = source["Home.swift"];
  assert.match(ds, /space1: CGFloat = 4/);
  assert.match(ds, /space2: CGFloat = 8/);
  assert.match(ds, /space3: CGFloat = 12/);
  assert.match(ds, /space4: CGFloat = 16/);
  assert.match(ds, /hitTarget: CGFloat = 44/);
  assert.match(home, /DvorStyle\.contentInset/);
  assert.match(home, /frame\(minHeight: DvorStyle\.hitTarget\)/);
  assert.match(home, /LazyVStack\(spacing: DvorStyle\.sectionGap\)/);
});

test("Dvor social controls expose one destination, interaction feedback and accessible names", () => {
  const home = source["Home.swift"];
  const composer = home.slice(home.indexOf("struct DvorComposer"), home.indexOf("struct MatterCard"));
  assert.match(composer, /Button\(action: action\)/);
  assert.equal((composer.match(/Button\(/g) || []).length, 1);
  assert.match(home, /struct MatterReactionPressStyle: ButtonStyle/);
  assert.match(home, /accessibilityLabel\(store\.liked\.contains/);
  assert.match(home, /accessibilityLabel\("Открыть комментарии/);
  assert.match(home, /accessibilityLabel\("Поделиться публикацией"\)/);
  assert.match(home, /accessibilityLabel\("Действия с публикацией"\)/);
  assert.match(home, /state: "poll-voted"/);
});

test("matter detail is an edge-to-edge VK surface", () => {
  const detail = source["Matters.swift"].slice(
    source["Matters.swift"].indexOf("struct MatterScreen"),
    source["Matters.swift"].indexOf("struct IncidentReportScreen"),
  );
  assert.doesNotMatch(detail, /MatterCard\(matter:\s*matter\)\.padding\(\.horizontal/);
});

test("onboarding, forms, services and empty states share Dvor compositions", () => {
  assert.match(source["Onboarding.swift"], /DvorScreenIntro/);
  assert.match(source["Onboarding.swift"], /DvorFormField/);
  assert.match(source["Matters.swift"], /DvorScreenIntro/);
  assert.match(source["Matters.swift"], /DvorFormField/);
  assert.match(source["Matters.swift"], /AppStatePanel/);
  assert.doesNotMatch(allSwift, /DvorStateBlock/);
  assert.match(source["Services.swift"], /DvorScreenIntro/);
  assert.match(source["Services.swift"], /DvorRow/);
});
