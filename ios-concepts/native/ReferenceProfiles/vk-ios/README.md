# VK iOS reference UI kit

This kit is calibrated from the reviewed «Образы» concept and is the executable visual source for `vkontakte` mimicry. Product entities, actions and copy never come from «Образы».

## Required compositions

| Surface | Composition | Invariant |
|---|---|---|
| Root | `VKRootSurface` + `VKTabHeader` | White top safe area; one profile entry at most |
| Feed | `LazyVStack` + `VKAuthoredPost` + `GroupGap` | Authorship first; actions attached to the post |
| Detail | `VKNavigationChrome` + the same content anatomy | Back is predictable; no glass capsule |
| Modal/form | `VKModalChrome` + native fields + `VKPrimaryActionArea` | One completion action; 16 pt bottom space |
| List | `VKGroup` + `VKRow`/`VKPersonRow` | Chevron only when the whole row navigates |
| Messages | conversation row + `VKChatHeader` + composer | Every conversation and action has one destination |
| Permission recovery | product control + system prompt + `VKInlineNotice` | Contextual request and usable fallback |

## Tokens

The source of truth is `profile.json` and `NativeVisualLanguage`. VK mimicry uses `#0077FF` accent, white content/root surfaces, `#F2F3F5` group gaps, `#E7E8EC` separators, black primary text and `#818C99` metadata. Arbitrary local hex values are not allowed outside avatars and canonical media.

## Generator rules

- Five root tabs are allowed only when each owns distinct product content and an acceptance journey.
- Lucide template assets are used for product/tab chrome; SF Symbols remain for platform actions.
- Functional icons are semibold or bold.
- No decorative tabs, filters, chevrons, badges, gradients, colored placeholders or duplicate profile controls.
- Loading, empty, error and offline reuse the same screen composition; they do not introduce a new visual language.
