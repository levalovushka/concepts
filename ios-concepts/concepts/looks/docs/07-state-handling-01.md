## Canonical UX state handling

Every canonical state is explicit. `N/A` is permitted only with the recorded rationale.

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| phone | loading | yes | screen.phone.state.loading.body | continue-email | continue-email:navigate→code | screen.phone.state.loading.recovery | fixture.looks.phone.loading |
| phone | populated/default | yes | screen.phone.state.populated-default.body | continue-email | continue-email:navigate→code | screen.phone.state.populated-default.recovery | fixture.looks.phone.default |
| phone | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| phone | error | yes | screen.phone.state.error.body | continue-email | continue-email:navigate→code | screen.phone.state.error.recovery | fixture.looks.phone.error |
| phone | offline | yes | screen.phone.state.offline.body | continue-email | continue-email:navigate→code | screen.phone.state.offline.recovery | fixture.looks.phone.offline |
| phone | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| code | loading | yes | screen.code.state.loading.body | confirm-code | confirm-code:navigate→home | screen.code.state.loading.recovery | fixture.looks.code.loading |
| code | populated/default | yes | screen.code.state.populated-default.body | confirm-code | confirm-code:navigate→home | screen.code.state.populated-default.recovery | fixture.looks.code.default |
| code | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| code | error | yes | screen.code.state.error.body | confirm-code | confirm-code:navigate→home | screen.code.state.error.recovery | fixture.looks.code.error |
| code | offline | yes | screen.code.state.offline.body | confirm-code | confirm-code:navigate→home | screen.code.state.offline.recovery | fixture.looks.code.offline |
| code | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| codefail | loading | yes | screen.codefail.state.loading.body | retry-code | retry-code:navigate→code | screen.codefail.state.loading.recovery | fixture.looks.codefail.loading |
| codefail | populated/default | yes | screen.codefail.state.populated-default.body | retry-code | retry-code:navigate→code | screen.codefail.state.populated-default.recovery | fixture.looks.codefail.default |
| codefail | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| codefail | error | yes | screen.codefail.state.error.body | retry-code | retry-code:navigate→code | screen.codefail.state.error.recovery | fixture.looks.codefail.error |
| codefail | offline | yes | screen.codefail.state.offline.body | retry-code | retry-code:navigate→code | screen.codefail.state.offline.recovery | fixture.looks.codefail.offline |
| codefail | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| home | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| home | populated/default | yes | screen.home.state.populated-default.body | open-feed-post | open-feed-post:navigate→post | screen.home.state.populated-default.recovery | fixture.looks.home.default |
| home | empty | yes | screen.home.state.empty.body | open-feed-post | open-feed-post:navigate→post | screen.home.state.empty.recovery | fixture.looks.home.empty |
| home | error | yes | screen.home.state.error.body | open-feed-post | open-feed-post:navigate→post | screen.home.state.error.recovery | fixture.looks.home.error |
| home | offline | yes | screen.home.state.offline.body | open-feed-post | open-feed-post:navigate→post | screen.home.state.offline.recovery | fixture.looks.home.offline |
