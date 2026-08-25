## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| record | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| record | error | yes | screen.record.state.error.body | complete-record | complete-record:mutate | screen.record.state.error.recovery | fixture.peresmenka.record.error |
| record | offline | yes | screen.record.state.offline.body | complete-record | complete-record:mutate | screen.record.state.offline.recovery | fixture.peresmenka.record.offline |
| record | permission-needed | yes | screen.record.state.permission-needed.body | complete-record<br>permission.mic.fallback<br>permission.speech.fallback | complete-record:mutate | screen.record.state.permission-needed.recovery | fixture.peresmenka.record.permission-needed |
| record | permission-denied | yes | screen.record.state.permission-denied.body | complete-record<br>permission.mic.fallback<br>permission.speech.fallback | complete-record:mutate | screen.record.state.permission-denied.recovery | fixture.peresmenka.record.permission-denied |
| record | permission-restricted | yes | screen.record.state.permission-restricted.body | complete-record<br>permission.mic.fallback<br>permission.speech.fallback | complete-record:mutate | screen.record.state.permission-restricted.recovery | fixture.peresmenka.record.permission-restricted |
| record | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| player | loading | yes | screen.player.state.loading.body | complete-player | complete-player:mutate | screen.player.state.loading.recovery | fixture.peresmenka.player.loading |
| player | populated/default | yes | screen.player.state.populated-default.body | complete-player | complete-player:mutate | screen.player.state.populated-default.recovery | fixture.peresmenka.player.default |
| player | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| player | error | yes | screen.player.state.error.body | complete-player | complete-player:mutate | screen.player.state.error.recovery | fixture.peresmenka.player.error |
| player | offline | yes | screen.player.state.offline.body | complete-player | complete-player:mutate | screen.player.state.offline.recovery | fixture.peresmenka.player.offline |
| player | permission-needed | yes | screen.player.state.permission-needed.body | complete-player<br>permission.audio.fallback | complete-player:mutate | screen.player.state.permission-needed.recovery | fixture.peresmenka.player.permission-needed |
| player | permission-denied | yes | screen.player.state.permission-denied.body | complete-player<br>permission.audio.fallback | complete-player:mutate | screen.player.state.permission-denied.recovery | fixture.peresmenka.player.permission-denied |
| player | permission-restricted | yes | screen.player.state.permission-restricted.body | complete-player<br>permission.audio.fallback | complete-player:mutate | screen.player.state.permission-restricted.recovery | fixture.peresmenka.player.permission-restricted |
| player | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| swaps | loading | yes | screen.swaps.state.loading.body | open-swap | open-swap:navigate→swap | screen.swaps.state.loading.recovery | fixture.peresmenka.swaps.loading |
| swaps | populated/default | yes | screen.swaps.state.populated-default.body | open-swap | open-swap:navigate→swap | screen.swaps.state.populated-default.recovery | fixture.peresmenka.swaps.default |
| swaps | empty | yes | screen.swaps.state.empty.body | open-swap | open-swap:navigate→swap | screen.swaps.state.empty.recovery | fixture.peresmenka.swaps.empty |
| swaps | error | yes | screen.swaps.state.error.body | open-swap | open-swap:navigate→swap | screen.swaps.state.error.recovery | fixture.peresmenka.swaps.error |
| swaps | offline | yes | screen.swaps.state.offline.body | open-swap | open-swap:navigate→swap | screen.swaps.state.offline.recovery | fixture.peresmenka.swaps.offline |
| swaps | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| swaps | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| swaps | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| swaps | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| swap | loading | yes | screen.swap.state.loading.body | complete-swap | complete-swap:mutate | screen.swap.state.loading.recovery | fixture.peresmenka.swap.loading |
| swap | populated/default | yes | screen.swap.state.populated-default.body | complete-swap | complete-swap:mutate | screen.swap.state.populated-default.recovery | fixture.peresmenka.swap.default |
| swap | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| swap | error | yes | screen.swap.state.error.body | complete-swap | complete-swap:mutate | screen.swap.state.error.recovery | fixture.peresmenka.swap.error |
| swap | offline | yes | screen.swap.state.offline.body | complete-swap | complete-swap:mutate | screen.swap.state.offline.recovery | fixture.peresmenka.swap.offline |
| swap | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| swap | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
