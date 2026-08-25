## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| scan | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| scan | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| scan | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| handover | loading | yes | screen.handover.state.loading.body | open-shoot | open-shoot:navigate→shoot | screen.handover.state.loading.recovery | fixture.peresmenka.handover.loading |
| handover | populated/default | yes | screen.handover.state.populated-default.body | open-shoot | open-shoot:navigate→shoot | screen.handover.state.populated-default.recovery | fixture.peresmenka.handover.default |
| handover | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| handover | error | yes | screen.handover.state.error.body | open-shoot | open-shoot:navigate→shoot | screen.handover.state.error.recovery | fixture.peresmenka.handover.error |
| handover | offline | yes | screen.handover.state.offline.body | open-shoot | open-shoot:navigate→shoot | screen.handover.state.offline.recovery | fixture.peresmenka.handover.offline |
| handover | permission-needed | yes | screen.handover.state.permission-needed.body | open-shoot<br>permission.camera.fallback | open-shoot:navigate→shoot | screen.handover.state.permission-needed.recovery | fixture.peresmenka.handover.permission-needed |
| handover | permission-denied | yes | screen.handover.state.permission-denied.body | open-shoot<br>permission.camera.fallback | open-shoot:navigate→shoot | screen.handover.state.permission-denied.recovery | fixture.peresmenka.handover.permission-denied |
| handover | permission-restricted | yes | screen.handover.state.permission-restricted.body | open-shoot<br>permission.camera.fallback | open-shoot:navigate→shoot | screen.handover.state.permission-restricted.recovery | fixture.peresmenka.handover.permission-restricted |
| handover | permission-limited | yes | screen.handover.state.permission-limited.body | open-shoot<br>permission.camera.fallback | open-shoot:navigate→shoot | screen.handover.state.permission-limited.recovery | fixture.peresmenka.handover.permission-limited |
| shoot | loading | yes | screen.shoot.state.loading.body | complete-shoot | complete-shoot:mutate | screen.shoot.state.loading.recovery | fixture.peresmenka.shoot.loading |
| shoot | populated/default | yes | screen.shoot.state.populated-default.body | complete-shoot | complete-shoot:mutate | screen.shoot.state.populated-default.recovery | fixture.peresmenka.shoot.default |
| shoot | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| shoot | error | yes | screen.shoot.state.error.body | complete-shoot | complete-shoot:mutate | screen.shoot.state.error.recovery | fixture.peresmenka.shoot.error |
| shoot | offline | yes | screen.shoot.state.offline.body | complete-shoot | complete-shoot:mutate | screen.shoot.state.offline.recovery | fixture.peresmenka.shoot.offline |
| shoot | permission-needed | yes | screen.shoot.state.permission-needed.body | complete-shoot<br>permission.camera.fallback | complete-shoot:mutate | screen.shoot.state.permission-needed.recovery | fixture.peresmenka.shoot.permission-needed |
| shoot | permission-denied | yes | screen.shoot.state.permission-denied.body | complete-shoot<br>permission.camera.fallback | complete-shoot:mutate | screen.shoot.state.permission-denied.recovery | fixture.peresmenka.shoot.permission-denied |
| shoot | permission-restricted | yes | screen.shoot.state.permission-restricted.body | complete-shoot<br>permission.camera.fallback | complete-shoot:mutate | screen.shoot.state.permission-restricted.recovery | fixture.peresmenka.shoot.permission-restricted |
| shoot | permission-limited | yes | screen.shoot.state.permission-limited.body | complete-shoot<br>permission.camera.fallback | complete-shoot:mutate | screen.shoot.state.permission-limited.recovery | fixture.peresmenka.shoot.permission-limited |
| brief | loading | yes | screen.brief.state.loading.body | open-record | open-record:navigate→record | screen.brief.state.loading.recovery | fixture.peresmenka.brief.loading |
| brief | populated/default | yes | screen.brief.state.populated-default.body | open-record | open-record:navigate→record | screen.brief.state.populated-default.recovery | fixture.peresmenka.brief.default |
| brief | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| brief | error | yes | screen.brief.state.error.body | open-record | open-record:navigate→record | screen.brief.state.error.recovery | fixture.peresmenka.brief.error |
| brief | offline | yes | screen.brief.state.offline.body | open-record | open-record:navigate→record | screen.brief.state.offline.recovery | fixture.peresmenka.brief.offline |
| brief | permission-needed | yes | screen.brief.state.permission-needed.body | open-record<br>permission.mic.fallback<br>permission.speech.fallback<br>permission.audio.fallback | open-record:navigate→record | screen.brief.state.permission-needed.recovery | fixture.peresmenka.brief.permission-needed |
| brief | permission-denied | yes | screen.brief.state.permission-denied.body | open-record<br>permission.mic.fallback<br>permission.speech.fallback<br>permission.audio.fallback | open-record:navigate→record | screen.brief.state.permission-denied.recovery | fixture.peresmenka.brief.permission-denied |
| brief | permission-restricted | yes | screen.brief.state.permission-restricted.body | open-record<br>permission.mic.fallback<br>permission.speech.fallback<br>permission.audio.fallback | open-record:navigate→record | screen.brief.state.permission-restricted.recovery | fixture.peresmenka.brief.permission-restricted |
| brief | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| record | loading | yes | screen.record.state.loading.body | complete-record | complete-record:mutate | screen.record.state.loading.recovery | fixture.peresmenka.record.loading |
| record | populated/default | yes | screen.record.state.populated-default.body | complete-record | complete-record:mutate | screen.record.state.populated-default.recovery | fixture.peresmenka.record.default |
