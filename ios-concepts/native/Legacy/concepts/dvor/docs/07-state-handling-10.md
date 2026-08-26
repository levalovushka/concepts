## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| pending | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| pending | populated/default | yes | screen.pending.state.populated-default.body |  |  | screen.pending.state.populated-default.recovery | fixture.dvor.pending.default |
| pending | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| pending | error | yes | screen.pending.state.error.body |  |  | screen.pending.state.error.recovery | fixture.dvor.pending.error |
| pending | offline | yes | screen.pending.state.offline.body |  |  | screen.pending.state.offline.recovery | fixture.dvor.pending.offline |
| pending | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| pending | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| pending | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| pending | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
