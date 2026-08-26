## Canonical UX state handling

Every canonical state is explicit. `N/A` is permitted only with the recorded rationale.

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| phone | loading | yes | screen.phone.state.loading.body | open-code | open-code:navigate→code | screen.phone.state.loading.recovery | fixture.tails.phone.loading |
| phone | populated/default | yes | screen.phone.state.populated-default.body | open-code | open-code:navigate→code | screen.phone.state.populated-default.recovery | fixture.tails.phone.default |
| phone | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| phone | error | yes | screen.phone.state.error.body | open-code | open-code:navigate→code | screen.phone.state.error.recovery | fixture.tails.phone.error |
| phone | offline | yes | screen.phone.state.offline.body | open-code | open-code:navigate→code | screen.phone.state.offline.recovery | fixture.tails.phone.offline |
| phone | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| code | loading | yes | screen.code.state.loading.body | open-codefail | open-codefail:navigate→codefail | screen.code.state.loading.recovery | fixture.tails.code.loading |
| code | populated/default | yes | screen.code.state.populated-default.body | open-codefail | open-codefail:navigate→codefail | screen.code.state.populated-default.recovery | fixture.tails.code.default |
| code | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| code | error | yes | screen.code.state.error.body | open-codefail | open-codefail:navigate→codefail | screen.code.state.error.recovery | fixture.tails.code.error |
| code | offline | yes | screen.code.state.offline.body | open-codefail | open-codefail:navigate→codefail | screen.code.state.offline.recovery | fixture.tails.code.offline |
| code | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| codefail | loading | yes | screen.codefail.state.loading.body | complete-codefail | complete-codefail:mutate | screen.codefail.state.loading.recovery | fixture.tails.codefail.loading |
| codefail | populated/default | yes | screen.codefail.state.populated-default.body | complete-codefail | complete-codefail:mutate | screen.codefail.state.populated-default.recovery | fixture.tails.codefail.default |
| codefail | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| codefail | error | yes | screen.codefail.state.error.body | complete-codefail | complete-codefail:mutate | screen.codefail.state.error.recovery | fixture.tails.codefail.error |
| codefail | offline | yes | screen.codefail.state.offline.body | complete-codefail | complete-codefail:mutate | screen.codefail.state.offline.recovery | fixture.tails.codefail.offline |
| codefail | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| home | loading | yes | screen.home.state.loading.body | open-pet | open-pet:navigate→pet | screen.home.state.loading.recovery | fixture.tails.home.loading |
| home | populated/default | yes | screen.home.state.populated-default.body | open-pet | open-pet:navigate→pet | screen.home.state.populated-default.recovery | fixture.tails.home.default |
| home | empty | yes | screen.home.state.empty.body | open-pet | open-pet:navigate→pet | screen.home.state.empty.recovery | fixture.tails.home.empty |
| home | error | yes | screen.home.state.error.body | open-pet | open-pet:navigate→pet | screen.home.state.error.recovery | fixture.tails.home.error |
| home | offline | yes | screen.home.state.offline.body | open-pet | open-pet:navigate→pet | screen.home.state.offline.recovery | fixture.tails.home.offline |
