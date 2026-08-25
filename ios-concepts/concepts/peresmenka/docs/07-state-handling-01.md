## Canonical UX state handling

Every canonical state is explicit. `N/A` is permitted only with the recorded rationale.

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| phone | loading | yes | screen.phone.state.loading.body | open-code | open-code:navigate→code | screen.phone.state.loading.recovery | fixture.peresmenka.phone.loading |
| phone | populated/default | yes | screen.phone.state.populated-default.body | open-code | open-code:navigate→code | screen.phone.state.populated-default.recovery | fixture.peresmenka.phone.default |
| phone | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| phone | error | yes | screen.phone.state.error.body | open-code | open-code:navigate→code | screen.phone.state.error.recovery | fixture.peresmenka.phone.error |
| phone | offline | yes | screen.phone.state.offline.body | open-code | open-code:navigate→code | screen.phone.state.offline.recovery | fixture.peresmenka.phone.offline |
| phone | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| code | loading | yes | screen.code.state.loading.body | open-codefail | open-codefail:navigate→codefail | screen.code.state.loading.recovery | fixture.peresmenka.code.loading |
| code | populated/default | yes | screen.code.state.populated-default.body | open-codefail | open-codefail:navigate→codefail | screen.code.state.populated-default.recovery | fixture.peresmenka.code.default |
| code | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| code | error | yes | screen.code.state.error.body | open-codefail | open-codefail:navigate→codefail | screen.code.state.error.recovery | fixture.peresmenka.code.error |
| code | offline | yes | screen.code.state.offline.body | open-codefail | open-codefail:navigate→codefail | screen.code.state.offline.recovery | fixture.peresmenka.code.offline |
| code | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| codefail | loading | yes | screen.codefail.state.loading.body | complete-codefail | complete-codefail:mutate | screen.codefail.state.loading.recovery | fixture.peresmenka.codefail.loading |
| codefail | populated/default | yes | screen.codefail.state.populated-default.body | complete-codefail | complete-codefail:mutate | screen.codefail.state.populated-default.recovery | fixture.peresmenka.codefail.default |
| codefail | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| codefail | error | yes | screen.codefail.state.error.body | complete-codefail | complete-codefail:mutate | screen.codefail.state.error.recovery | fixture.peresmenka.codefail.error |
| codefail | offline | yes | screen.codefail.state.offline.body | complete-codefail | complete-codefail:mutate | screen.codefail.state.offline.recovery | fixture.peresmenka.codefail.offline |
| codefail | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| join | loading | yes | screen.join.state.loading.body | open-manual | open-manual:navigate→manual | screen.join.state.loading.recovery | fixture.peresmenka.join.loading |
| join | populated/default | yes | screen.join.state.populated-default.body | open-manual | open-manual:navigate→manual | screen.join.state.populated-default.recovery | fixture.peresmenka.join.default |
| join | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| join | error | yes | screen.join.state.error.body | open-manual | open-manual:navigate→manual | screen.join.state.error.recovery | fixture.peresmenka.join.error |
| join | offline | yes | screen.join.state.offline.body | open-manual | open-manual:navigate→manual | screen.join.state.offline.recovery | fixture.peresmenka.join.offline |
