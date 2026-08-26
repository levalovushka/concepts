## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| passwords | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| fill | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| fill | populated/default | yes | screen.fill.state.populated-default.body |  |  | screen.fill.state.populated-default.recovery | fixture.dvor.fill.default |
| fill | empty | yes | screen.fill.state.empty.body |  |  | screen.fill.state.empty.recovery | fixture.dvor.fill.empty |
| fill | error | N/A | The operating system or external application owns failure presentation. |  |  | — |  |
| fill | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| fill | permission-needed | yes | screen.fill.state.permission-needed.body | permission.autofill.fallback |  | screen.fill.state.permission-needed.recovery | fixture.dvor.fill.permission-needed |
| fill | permission-denied | yes | screen.fill.state.permission-denied.body | permission.autofill.fallback |  | screen.fill.state.permission-denied.recovery | fixture.dvor.fill.permission-denied |
| fill | permission-restricted | yes | screen.fill.state.permission-restricted.body | permission.autofill.fallback |  | screen.fill.state.permission-restricted.recovery | fixture.dvor.fill.permission-restricted |
| fill | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| neighbors | loading | yes | screen.neighbors.state.loading.body | match-contacts<br>open-neighbor | match-contacts:request<br>open-neighbor:navigate→profile | screen.neighbors.state.loading.recovery | fixture.dvor.neighbors.loading |
| neighbors | populated/default | yes | screen.neighbors.state.populated-default.body | match-contacts<br>open-neighbor | match-contacts:request<br>open-neighbor:navigate→profile | screen.neighbors.state.populated-default.recovery | fixture.dvor.neighbors.default |
| neighbors | empty | yes | screen.neighbors.state.empty.body | match-contacts<br>open-neighbor | match-contacts:request<br>open-neighbor:navigate→profile | screen.neighbors.state.empty.recovery | fixture.dvor.neighbors.empty |
| neighbors | error | yes | screen.neighbors.state.error.body | match-contacts<br>open-neighbor | match-contacts:request<br>open-neighbor:navigate→profile | screen.neighbors.state.error.recovery | fixture.dvor.neighbors.error |
| neighbors | offline | yes | screen.neighbors.state.offline.body | match-contacts<br>open-neighbor | match-contacts:request<br>open-neighbor:navigate→profile | screen.neighbors.state.offline.recovery | fixture.dvor.neighbors.offline |
| neighbors | permission-needed | yes | screen.neighbors.state.permission-needed.body | match-contacts<br>open-neighbor<br>permission.contacts.fallback | match-contacts:request<br>open-neighbor:navigate→profile | screen.neighbors.state.permission-needed.recovery | fixture.dvor.neighbors.permission-needed |
| neighbors | permission-denied | yes | screen.neighbors.state.permission-denied.body | match-contacts<br>open-neighbor<br>permission.contacts.fallback | match-contacts:request<br>open-neighbor:navigate→profile | screen.neighbors.state.permission-denied.recovery | fixture.dvor.neighbors.denied |
| neighbors | permission-restricted | yes | screen.neighbors.state.permission-restricted.body | match-contacts<br>open-neighbor<br>permission.contacts.fallback | match-contacts:request<br>open-neighbor:navigate→profile | screen.neighbors.state.permission-restricted.recovery | fixture.dvor.neighbors.permission-restricted |
| neighbors | permission-limited | yes | screen.neighbors.state.permission-limited.body | match-contacts<br>open-neighbor<br>permission.contacts.fallback | match-contacts:request<br>open-neighbor:navigate→profile | screen.neighbors.state.permission-limited.recovery | fixture.dvor.neighbors.permission-limited |
| profile | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| profile | populated/default | yes | screen.profile.state.populated-default.body | open-neighbor-chat | open-neighbor-chat:navigate→chat | screen.profile.state.populated-default.recovery | fixture.dvor.profile.default |
| profile | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| profile | error | yes | screen.profile.state.error.body | open-neighbor-chat | open-neighbor-chat:navigate→chat | screen.profile.state.error.recovery | fixture.dvor.profile.error |
| profile | offline | yes | screen.profile.state.offline.body | open-neighbor-chat | open-neighbor-chat:navigate→chat | screen.profile.state.offline.recovery | fixture.dvor.profile.offline |
| profile | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| profile | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| profile | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| profile | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| settings | loading | yes | screen.settings.state.loading.body | enable-app-lock<br>open-personalization<br>enable-background-updates | enable-app-lock:request<br>open-personalization:navigate→ads<br>enable-background-updates:request | screen.settings.state.loading.recovery | fixture.dvor.settings.loading |
| settings | populated/default | yes | screen.settings.state.populated-default.body | enable-app-lock<br>open-personalization<br>enable-background-updates | enable-app-lock:request<br>open-personalization:navigate→ads<br>enable-background-updates:request | screen.settings.state.populated-default.recovery | fixture.dvor.settings.default |
| settings | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| settings | error | yes | screen.settings.state.error.body | enable-app-lock<br>open-personalization<br>enable-background-updates | enable-app-lock:request<br>open-personalization:navigate→ads<br>enable-background-updates:request | screen.settings.state.error.recovery | fixture.dvor.settings.error |
