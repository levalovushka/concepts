import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const nativeRoot = join(import.meta.dirname, "..");
const appRoot = join(nativeRoot, "apps");
const slugs = ["dvor", "looks", "nakat", "peresmenka", "tails", "today"];

function swiftSources(slug) {
  const directory = join(appRoot, slug);
  return readdirSync(directory)
    .filter(file => file.endsWith(".swift"))
    .map(file => readFileSync(join(directory, file), "utf8"))
    .join("\n");
}

test("every concept enters through one shared email auth grammar", () => {
  const sharedAuth = readFileSync(join(nativeRoot, "DesignSystem/NativeEmailAuth.swift"), "utf8");
  assert.match(sharedAuth, /NativeActionButton\(title: "Получить код"/);
  assert.match(sharedAuth, /NativeOTPField\(code: \$code, length: codeLength/);
  assert.match(sharedAuth, /CaptureIdentity\.report\(surface: initialSurface, state: captureState \?\? "default"\)/);
  assert.doesNotMatch(sharedAuth, /Продолжить с Google/);

  for (const slug of slugs) {
    const source = swiftSources(slug);
    assert.match(source, /NativeEmailAuth\(/, `${slug}: entry must use NativeEmailAuth`);
    assert.doesNotMatch(source, /struct\s+AuthScreen\s*:/, `${slug}: local auth geometry is forbidden`);
    assert.doesNotMatch(source, /Продолжить с Google/, `${slug}: undeclared auth provider is forbidden`);
  }
});

test("message collections attach navigation to each conversation", () => {
  const tails = swiftSources("tails");
  assert.match(tails, /struct TailsChats:[\s\S]*?VKTabHeader\(title: "Сообщения"/);
  assert.match(tails, /struct TailsChats:[\s\S]*?VKSearchField\(/);
  assert.match(tails, /NavigationLink\(value: "chat"\) \{ TailsDialogRow\(dialog: dialog\) \}/);
  assert.doesNotMatch(tails, /NativeContractActionControl\(surfaceID: "chats"/);
  assert.match(tails, /struct TailsConversation:[\s\S]*?VKChatHeader/);

  const dvor = swiftSources("dvor");
  assert.match(dvor, /struct HouseChatsScreen:[\s\S]*?VKTabHeader\([\s\S]*?VKSearchField\(/);
  assert.match(dvor, /ForEach\(filteredConversations\)/);
  assert.match(dvor, /Button \{ nav\.push\(DvorRoute\.chat\(conversation\)\) \}/);
});

test("light concepts own a surface behind the status bar", () => {
  const dvor = swiftSources("dvor");
  assert.match(dvor, /background\(visualLanguage\.palette\.surface\.ignoresSafeArea\(\)\)/);
});

test("dvor keeps one profile entry point in the menu tab", () => {
  const dvor = swiftSources("dvor");
  assert.doesNotMatch(dvor, /DvorHomeHeader[\s\S]*?openProfile:/);
  assert.doesNotMatch(dvor, /VKTabHeader\([\s\S]{0,160}?avatarAction:/);
  assert.match(dvor, /struct HouseMenuScreen[\s\S]*?DvorRoute\.profile/);
});

test("tails attaches pet navigation to pet objects and avoids a duplicate root profile avatar", () => {
  const tails = swiftSources("tails");
  assert.match(tails, /ForEach\(\["Бруно"[\s\S]*?NavigationLink\(value: "pet"\)/);
  assert.doesNotMatch(tails, /NativeContractActionControl\(surfaceID: "home", title: "Открыть профиль Бруно"/);
  assert.doesNotMatch(tails, /VKTabHeader\(title: "Главная", avatar:/);
});

test("profile surfaces explain capability value and avoid generic primary CTAs", () => {
  const tails = swiftSources("tails");
  assert.match(tails, /struct TailsProfile:[\s\S]*?Редактировать профиль/);
  assert.match(tails, /struct TailsProfile:[\s\S]*?Знакомые владельцы рядом/);
  assert.doesNotMatch(tails, /NativeContractActionControl\(surfaceID: "profile"/);
});

test("generic contract actions cannot be detached from an inset List", () => {
  for (const slug of slugs) {
    const source = swiftSources(slug);
    assert.doesNotMatch(
      source,
      /NativeContractActionControl\([^)]*\)\s*\.listRowInsets\(EdgeInsets\(\)\)/,
      `${slug}: attach the action to the relevant row/card instead of a full-bleed orphan CTA`,
    );
  }
});
