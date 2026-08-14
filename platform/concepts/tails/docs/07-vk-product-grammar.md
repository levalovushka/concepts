# VK product grammar for Tails

Research date: 2026-08-14. Scope: the current VK mobile/social-network grammar that is useful for a pet-owner network. Sources are first-party only: VK/VKUI documentation, VK-owned repositories and VK's official store listings. Statements labelled **Inference** are design recommendations derived from those sources, not claims that VK documents the exact Tails screen.

Source note: VK announced that its apps were removed from Apple's App Store on 2026-06-25, so current listing-screen evidence below comes from VK's live Google Play listing; stale third-party App Store archives were not used. [VK removal notice](https://vk.company.ru/ru/press/releases/12343/)

## Product frame

- VK describes the current social product as one place for private messages, calls, subscriptions to public pages and celebrities, finding friends, and creating or supporting communities. Its official Google Play description even names keeping a pet diary as an in-app use case. This supports a Tails model built around owner identity + pet identity + posts + topical communities + private conversations, rather than a collection of unrelated pet utilities. [Official VK Google Play listing](https://play.google.com/store/apps/details?hl=ru&id=com.vkontakte.android)
- VK says its Q4 2024 feed/editor redesign focused on immersion in content, a minimalist interface and simple navigation. Treat that as the north star: content and relationships should dominate; UI chrome should recede. [VK 2024 results / product update](https://vk.company.ru/ru/press/releases/11976/)
- The same official listing describes thematic feeds and personalized recommendations, while subscriptions connect people to public pages and authors. **Inference:** Tails' feed should visibly mix followed owners, joined communities and relevant recommendations, with a clear source/relationship label when an item is recommended. [Official VK Google Play listing](https://play.google.com/store/apps/details?id=com.vkontakte.android)

## App shell and navigation

- VKUI defines three levels: a screen (`Panel`), a task flow (`View`) and a major section (`Root`/`Epic`). `Epic` is explicitly the pattern used by VK-style mobile apps with a persistent bottom `Tabbar`; switching major sections has no transition animation, while deeper screens live inside the selected section. [VKUI navigation guide](https://vkui.io/overview/navigation/)
- Use five stable root tabs for this concept: **Feed**, **Nearby**, **Create**, **Messages**, **Profile**. Communities remain a first-class social destination reached from Feed and Settings; opening a post, community, chat, pet or settings page pushes within the current tab's stack. Returning to a root tab must restore its scroll position and nested state; selecting another root tab should be immediate. This is an **inference** mapped onto VKUI's `Epic → Root/View → Panel` hierarchy.
- VKUI's tab items normally use 28 px icons, a text label, a selected state and an optional small counter/badge. Use one consistent outline icon family and filled/accent treatment only for the active tab; reserve counters for unread messages or actionable notifications. [VKUI Epic/Tabbar](https://vkui.io/components/epic/)
- Every pushed screen needs a real back action in the header. VKUI's `PanelHeaderBack` is specifically for back navigation inside a scenario, and `View` supports iOS edge-swipe back. Modal flows use close/cancel; if a modal navigates forward, the header changes to back. [VKUI PanelHeader](https://vkui.io/components/panel-header/), [VKUI View](https://vkui.io/components/view/), [VKUI ModalPageHeader](https://vkui.io/components/modal-page-header/)
- Mobile header action icons are 28 px; a header avatar is normally 36 px. VKUI explicitly removes the header divider when search, tabs, a banner or another visually separating element follows. **Inference:** avoid automatic rules around every bar/card; spacing, background changes and media edges should do most separation. [VKUI PanelHeader](https://vkui.io/components/panel-header/)
- The root must own safe-area insets, scroll behavior and modal scroll locking. VKUI also supports a `plain` layout with no shadows or rounding. At 376×812, keep the top header and bottom tabbar outside the content scroll region and include bottom safe-area padding so the last row/action is never obscured. [VKUI AppRoot](https://vkui.io/components/app-root/)

## Feed grammar

- The current official listing screenshot shows a horizontal story/avatar rail, then a dense author row (avatar, names, overflow), a large near-edge photo with restrained rounding, a short caption, compact reaction/comment/share controls and time. A four-item bottom tabbar remains visible, with the active item in the accent color. [Official current feed screenshot](https://play-lh.googleusercontent.com/mVKBoDnTrKLoasE1TdTwejp-M3rKg2XCwbXwNMEtjWMY9EEShinlx8nn30-3VWkXOAMjuqxOR4IcR49Puj7ZAVs=w1052-h592)
- Primary rhythm: compact author row → post text → optional edge-to-edge or consistently inset media → one quiet social-action row. The author row should expose avatar, owner/community name, recency and optional context; secondary metadata must not compete with the post. **Inference**, supported by VKUI's `RichCell` anatomy (40/48/72 px avatars; distinct subtitle/meta slots; small primary/secondary actions). [VKUI RichCell](https://vkui.io/components/rich-cell/)
- Posts should use real pet content states: owner update, pet milestone, lost/found notice, question, community announcement. Keep one obvious primary action per exceptional state (for example “Помочь найти”), while like/comment/share/save remain compact icon actions. **Inference:** this preserves VK's content-first feed while giving pet-specific content a clear job.
- Use pull-to-refresh on touch screens, preserve loaded content during refresh and show the refresh state without blocking the whole app. Use full-screen blocking only for genuinely modal asynchronous work. [VKUI PullToRefresh](https://vkui.io/components/pull-to-refresh/), [VKUI ScreenSpinner](https://vkui.io/components/screen-spinner/)
- Empty and error states must be compact, textual and actionable: name the missing content or failed operation, then offer one relevant CTA. VKUI's `Placeholder` supports one or grouped actions; do not substitute decorative illustration space for useful recovery. [VKUI Placeholder](https://vkui.io/components/placeholder/)

## Owners and pets

- The owner profile is the social identity: photo, name, short status/location, relationship counts and high-frequency actions (`Message`, `Follow`/`Following`, overflow). Pet profiles are linked identity pages owned by a person, with species/breed/age and a post/media history. **Inference:** do not merge the owner and pet into one ambiguous account; show ownership explicitly (“Питомец Анны”) and make both identities navigable.
- Use a strong profile header followed by compact facts and tabs such as **Posts / Pets / Media**. VKUI recommends grouped `InfoRow` facts inside list cells; tabs have an explicit selected state and can scroll to the selected item. [VKUI InfoRow](https://vkui.io/components/info-row/), [VKUI Tabs](https://vkui.io/components/tabs/)
- Keep editing/settings out of the public action hierarchy: the current owner sees `Edit profile`; visitors see `Message` and follow state. A pet page's owner-only edit control belongs in the header/overflow, not beside the public social CTA. **Inference.**

## Communities

- VK's official product model supports discovering, joining/supporting and creating communities. Tails should therefore distinguish **Joined** from **Recommended**, expose topic/location/member count, and provide a single unambiguous `Join`/`Joined` control in lists and community headers. [Official VK Google Play listing](https://play.google.com/store/apps/details?hl=ru&id=com.vkontakte.android)
- The current official communities screenshot uses a back button, compact search field and create `+` in one top row; **Following** is a horizontal rail of round identities, **Recent** is a dismissible overlay sheet, and recommendations begin below as a separate visual mode. [Official current communities screenshot](https://play-lh.googleusercontent.com/c2CN3FmatLG6Xn2KF0hMs7mp5LD7en8CujvG3OzDzPZpUVjgiYpTQLfDmHN-LtbWHJBItpEOAOY4-MDi60dgFsA=w1052-h592)
- A community screen should read like a social destination: avatar/cover, name, purpose, member/social proof, join state, then tabs for posts and useful community information. Avoid dashboard tiles and oversized empty hero cards. **Inference**, following VK's content-first direction and VKUI's compact rich-cell/action patterns.
- Community lists should be dense rows with 48–72 px identity imagery, one or two lines of metadata and a small action. Recommended items need a reason (“Рядом с вами”, “О породе корги”), not an unexplained algorithmic badge. **Inference.**

## Messages

- VK's official messenger supports direct and group chats, phone/VK contacts, text, voice and video messages, photos, video and shared VK posts; the separate messenger also uses a dedicated folder for business notifications. Tails can simplify this to conversation list + direct/group chat + pet/post attachments, while keeping the same recognizable hierarchy. [Official VK Messenger Google Play listing](https://play.google.com/store/apps/details?hl=ru&id=com.vk.im)
- The current official messenger screenshot shows a full-screen conversation without the root tabbar, several compact message types (text, sticker, voice and call), and a bottom composer with add, text, smiley, send/play and microphone controls above a visible safe-area inset. [Official current messenger screenshot](https://play-lh.googleusercontent.com/Vn0EmhqLgQk-FV7Gbmi9rVlS1N_WI9rwQSngCKPdKa6pzQ0fz4HTFaSwHt-8cKNIiz3oWEFuVUjtAS5MGZ_rsA=w1052-h592)
- Conversation rows: 48 px avatar, name, one-line preview, time, unread mark/counter and explicit delivery/read state where relevant. Keep row height compact and let unread typography/indicator carry emphasis. **Inference**, mapped to `RichCell` before/content/meta slots.
- Chat header: back, 36 px avatar, peer/community name and presence/context; secondary call/info actions on the right. Composer: attachment on the left, multiline text field, send/voice state on the right. VKUI specifies attach/send presets and 28 px controls in regular density (24 px compact), with accessible labels. [VKUI WriteBar](https://vkui.io/components/write-bar/), [VKUI PanelHeader](https://vkui.io/components/panel-header/)
- Keep the composer above the bottom safe area and keyboard, and remove the root tabbar while a chat is open. Failed sends stay in context with retry; do not discard composed text on back/temporary failure. **Inference.**

## Permissions, denial and recovery

- Ask only at the moment a feature needs access, after a short in-product explanation of the benefit. A platform permission request can reject: VK's bridge models permission requests as promises, and its official API schema distinguishes denial/privacy/access failures rather than treating all failures as generic. [VK Bridge repository](https://github.com/VKCOM/vk-bridge), [VK API error schema](https://github.com/VKCOM/vk-api-schema/blob/master/errors.json)
- Every denial must return to a complete usable screen. Camera denial keeps manual media selection/cancel; contacts denial keeps username/community search; notification denial keeps messaging with in-app unread state; microphone denial keeps text chat. Offer `Open settings` only when it can actually resolve the state, plus `Not now`/back. This is an **inference** from the recoverable permission/error model.
- Destructive or consequential confirmations should use verbs naming the action, not “Yes/No”; cancel and dismiss should be equivalent and accessible. [VKUI Alert](https://vkui.io/components/alert/)
- Use a snackbar for lightweight success/undo feedback and keep it above the tabbar/safe area; use an inline error near the failed item for recoverable failures. VKUI snackbars support a compact icon/avatar, one action and a short default lifetime. [VKUI Snackbar](https://vkui.io/components/snackbar/)

## Visual tokens to borrow, not copy

- Borrow the hierarchy, not VK branding: neutral near-white surfaces, dark primary text, quiet secondary metadata, one Tails accent, semantic red/green, and very few strokes. VK's official tokens demonstrate this semantic split and a compact mobile type scale (for example 24/28 title, 20/26 title, 16/20 text, 15/20 paragraph, 13/18 footnote, 12/16 caption). [VKUI tokens](https://vkcom.github.io/vkui-tokens/)
- Use the Lucide equivalents of VK's familiar metaphors—newsfeed/home, users/community, messages, user/profile, search, more, back, camera, attachment, send—at the same optical size within a context. Never use emoji as interface icons. VK's official icon catalog provides the corresponding product vocabulary. [VK Icons](https://vkcom.github.io/icons/)
- Recommended Tails density at 376 px: 16 px side gutters, 8 px base rhythm, 44–48 px minimum tap targets, 28 px root/header icons, 36 px header avatars, 48 px list avatars, and restrained 12–16 px radii only where a container truly needs grouping. The exact spacing/radii are **Tails implementation recommendations**, not copied VK specifications.

## Screen-level acceptance checklist

- Root tabs are stable, labelled, safe-area aware and restore each section's state.
- Every non-root screen has working back behavior; chat/detail screens do not show the root tabbar.
- Feed, owner, pet, community list/detail, conversations and chat all have loading, empty, populated and error/denied behavior appropriate to their task.
- Identity is never ambiguous: owner, pet and community names/avatars link to the correct entity.
- All social state changes are visible (`Follow` → `Following`, `Join` → `Joined`, unread → read, send → sent/error).
- Search, permission denial and network failure always leave a usable fallback and a route back.
- No screen depends on decorative placeholders, emoji UI, giant empty cards or repeated borders to communicate structure.
