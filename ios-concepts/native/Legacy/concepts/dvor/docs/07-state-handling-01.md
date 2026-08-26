## Canonical UX state handling

Every canonical state is explicit. `N/A` is permitted only with the recorded rationale.

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| phone | loading | yes | screen.phone.state.loading.body | continue-email | continue-email:navigate→code | screen.phone.state.loading.recovery | fixture.dvor.phone.loading |
| phone | populated/default | yes | screen.phone.state.populated-default.body | continue-email | continue-email:navigate→code | screen.phone.state.populated-default.recovery | fixture.dvor.phone.default |
| phone | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| phone | error | yes | screen.phone.state.error.body | continue-email | continue-email:navigate→code | screen.phone.state.error.recovery | fixture.dvor.phone.error |
| phone | offline | yes | screen.phone.state.offline.body | continue-email | continue-email:navigate→code | screen.phone.state.offline.recovery | fixture.dvor.phone.offline |
| phone | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| phone | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| code | loading | yes | screen.code.state.loading.body | confirm-code | confirm-code:navigate→join | screen.code.state.loading.recovery | fixture.dvor.code.loading |
| code | populated/default | yes | screen.code.state.populated-default.body | confirm-code | confirm-code:navigate→join | screen.code.state.populated-default.recovery | fixture.dvor.code.default |
| code | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| code | error | yes | screen.code.state.error.body | confirm-code | confirm-code:navigate→join | screen.code.state.error.recovery | fixture.dvor.code.error |
| code | offline | yes | screen.code.state.offline.body | confirm-code | confirm-code:navigate→join | screen.code.state.offline.recovery | fixture.dvor.code.offline |
| code | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| code | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| codefail | loading | yes | screen.codefail.state.loading.body | complete-codefail | complete-codefail:navigate→code | screen.codefail.state.loading.recovery | fixture.dvor.codefail.loading |
| codefail | populated/default | yes | screen.codefail.state.populated-default.body | complete-codefail | complete-codefail:navigate→code | screen.codefail.state.populated-default.recovery | fixture.dvor.codefail.default |
| codefail | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| codefail | error | yes | screen.codefail.state.error.body | complete-codefail | complete-codefail:navigate→code | screen.codefail.state.error.recovery | fixture.dvor.codefail.error |
| codefail | offline | yes | screen.codefail.state.offline.body | complete-codefail | complete-codefail:navigate→code | screen.codefail.state.offline.recovery | fixture.dvor.codefail.offline |
| codefail | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| codefail | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| join | loading | yes | screen.join.state.loading.body | verify-location<br>manual-address | verify-location:request<br>manual-address:navigate→manual | screen.join.state.loading.recovery | fixture.dvor.join.searching |
| join | populated/default | yes | screen.join.state.populated-default.body | verify-location<br>manual-address | verify-location:request<br>manual-address:navigate→manual | screen.join.state.populated-default.recovery | fixture.dvor.join.default |
| join | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| join | error | yes | screen.join.state.error.body | verify-location<br>manual-address | verify-location:request<br>manual-address:navigate→manual | screen.join.state.error.recovery | fixture.dvor.join.error |
| join | offline | yes | screen.join.state.offline.body | verify-location<br>manual-address | verify-location:request<br>manual-address:navigate→manual | screen.join.state.offline.recovery | fixture.dvor.join.offline |
