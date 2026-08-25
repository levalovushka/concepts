## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| theory | empty | yes | screen.theory.state.empty.body | open-ticket | open-ticket:navigate→ticket | screen.theory.state.empty.recovery | fixture.nakat.theory.empty |
| theory | error | yes | screen.theory.state.error.body | open-ticket | open-ticket:navigate→ticket | screen.theory.state.error.recovery | fixture.nakat.theory.error |
| theory | offline | yes | screen.theory.state.offline.body | open-ticket | open-ticket:navigate→ticket | screen.theory.state.offline.recovery | fixture.nakat.theory.offline |
| theory | permission-needed | yes | screen.theory.state.permission-needed.body | open-ticket<br>permission.bgtask.fallback | open-ticket:navigate→ticket | screen.theory.state.permission-needed.recovery | fixture.nakat.theory.permission-needed |
| theory | permission-denied | yes | screen.theory.state.permission-denied.body | open-ticket<br>permission.bgtask.fallback | open-ticket:navigate→ticket | screen.theory.state.permission-denied.recovery | fixture.nakat.theory.permission-denied |
| theory | permission-restricted | yes | screen.theory.state.permission-restricted.body | open-ticket<br>permission.bgtask.fallback | open-ticket:navigate→ticket | screen.theory.state.permission-restricted.recovery | fixture.nakat.theory.permission-restricted |
| theory | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| ticket | loading | yes | screen.ticket.state.loading.body | open-player | open-player:navigate→player | screen.ticket.state.loading.recovery | fixture.nakat.ticket.loading |
| ticket | populated/default | yes | screen.ticket.state.populated-default.body | open-player | open-player:navigate→player | screen.ticket.state.populated-default.recovery | fixture.nakat.ticket.default |
| ticket | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| ticket | error | yes | screen.ticket.state.error.body | open-player | open-player:navigate→player | screen.ticket.state.error.recovery | fixture.nakat.ticket.error |
| ticket | offline | yes | screen.ticket.state.offline.body | open-player | open-player:navigate→player | screen.ticket.state.offline.recovery | fixture.nakat.ticket.offline |
| ticket | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| ticket | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| ticket | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| ticket | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| player | loading | yes | screen.player.state.loading.body | open-background | open-background:navigate→background | screen.player.state.loading.recovery | fixture.nakat.player.loading |
| player | populated/default | yes | screen.player.state.populated-default.body | open-background | open-background:navigate→background | screen.player.state.populated-default.recovery | fixture.nakat.player.default |
| player | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| player | error | yes | screen.player.state.error.body | open-background | open-background:navigate→background | screen.player.state.error.recovery | fixture.nakat.player.error |
| player | offline | yes | screen.player.state.offline.body | open-background | open-background:navigate→background | screen.player.state.offline.recovery | fixture.nakat.player.offline |
| player | permission-needed | yes | screen.player.state.permission-needed.body | open-background<br>permission.audio.fallback | open-background:navigate→background | screen.player.state.permission-needed.recovery | fixture.nakat.player.permission-needed |
| player | permission-denied | yes | screen.player.state.permission-denied.body | open-background<br>permission.audio.fallback | open-background:navigate→background | screen.player.state.permission-denied.recovery | fixture.nakat.player.permission-denied |
| player | permission-restricted | yes | screen.player.state.permission-restricted.body | open-background<br>permission.audio.fallback | open-background:navigate→background | screen.player.state.permission-restricted.recovery | fixture.nakat.player.permission-restricted |
| player | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| background | loading | yes | screen.background.state.loading.body |  |  | screen.background.state.loading.recovery | fixture.nakat.background.loading |
| background | populated/default | yes | screen.background.state.populated-default.body |  |  | screen.background.state.populated-default.recovery | fixture.nakat.background.default |
| background | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| background | error | yes | screen.background.state.error.body |  |  | screen.background.state.error.recovery | fixture.nakat.background.error |
| background | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| background | permission-needed | yes | screen.background.state.permission-needed.body | permission.audio.fallback |  | screen.background.state.permission-needed.recovery | fixture.nakat.background.permission-needed |
| background | permission-denied | yes | screen.background.state.permission-denied.body | permission.audio.fallback |  | screen.background.state.permission-denied.recovery | fixture.nakat.background.permission-denied |
