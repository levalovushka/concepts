## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| yard | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| yard | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| guest | loading | yes | screen.guest.state.loading.body | connect-guest<br>scan-guest-qr | connect-guest:request<br>scan-guest-qr:request | screen.guest.state.loading.recovery | fixture.dvor.guest.connecting |
| guest | populated/default | yes | screen.guest.state.populated-default.body | connect-guest<br>scan-guest-qr | connect-guest:request<br>scan-guest-qr:request | screen.guest.state.populated-default.recovery | fixture.dvor.guest.default<br>fixture.dvor.guest.connected |
| guest | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| guest | error | yes | screen.guest.state.error.body | connect-guest<br>scan-guest-qr | connect-guest:request<br>scan-guest-qr:request | screen.guest.state.error.recovery | fixture.dvor.guest.error |
| guest | offline | yes | screen.guest.state.offline.body | connect-guest<br>scan-guest-qr | connect-guest:request<br>scan-guest-qr:request | screen.guest.state.offline.recovery | fixture.dvor.guest.offline |
| guest | permission-needed | yes | screen.guest.state.permission-needed.body | connect-guest<br>scan-guest-qr<br>permission.hotspot.fallback | connect-guest:request<br>scan-guest-qr:request | screen.guest.state.permission-needed.recovery | fixture.dvor.guest.permission-needed |
| guest | permission-denied | yes | screen.guest.state.permission-denied.body | connect-guest<br>scan-guest-qr<br>permission.hotspot.fallback | connect-guest:request<br>scan-guest-qr:request | screen.guest.state.permission-denied.recovery | fixture.dvor.guest.permission-denied |
| guest | permission-restricted | yes | screen.guest.state.permission-restricted.body | connect-guest<br>scan-guest-qr<br>permission.hotspot.fallback | connect-guest:request<br>scan-guest-qr:request | screen.guest.state.permission-restricted.recovery | fixture.dvor.guest.permission-restricted |
| guest | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| scan | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| scan | populated/default | yes | screen.scan.state.populated-default.body |  |  | screen.scan.state.populated-default.recovery | fixture.dvor.scan.default |
| scan | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| scan | error | yes | screen.scan.state.error.body |  |  | screen.scan.state.error.recovery | fixture.dvor.scan.error |
| scan | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| scan | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| scan | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| scan | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| scan | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| meters | loading | yes | screen.meters.state.loading.body | save-readings<br>enable-reminder | save-readings:mutate<br>enable-reminder:request | screen.meters.state.loading.recovery | fixture.dvor.meters.editing |
| meters | populated/default | yes | screen.meters.state.populated-default.body | save-readings<br>enable-reminder | save-readings:mutate<br>enable-reminder:request | screen.meters.state.populated-default.recovery | fixture.dvor.meters.default<br>fixture.dvor.meters.submitted |
| meters | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| meters | error | yes | screen.meters.state.error.body | save-readings<br>enable-reminder | save-readings:mutate<br>enable-reminder:request | screen.meters.state.error.recovery | fixture.dvor.meters.error |
| meters | offline | yes | screen.meters.state.offline.body | save-readings<br>enable-reminder | save-readings:mutate<br>enable-reminder:request | screen.meters.state.offline.recovery | fixture.dvor.meters.offline |
| meters | permission-needed | yes | screen.meters.state.permission-needed.body | save-readings<br>enable-reminder<br>permission.remotenotif.fallback<br>permission.bgtask.fallback | save-readings:mutate<br>enable-reminder:request | screen.meters.state.permission-needed.recovery | fixture.dvor.meters.permission-needed |
| meters | permission-denied | yes | screen.meters.state.permission-denied.body | save-readings<br>enable-reminder<br>permission.remotenotif.fallback<br>permission.bgtask.fallback | save-readings:mutate<br>enable-reminder:request | screen.meters.state.permission-denied.recovery | fixture.dvor.meters.permission-denied |
| meters | permission-restricted | yes | screen.meters.state.permission-restricted.body | save-readings<br>enable-reminder<br>permission.remotenotif.fallback<br>permission.bgtask.fallback | save-readings:mutate<br>enable-reminder:request | screen.meters.state.permission-restricted.recovery | fixture.dvor.meters.permission-restricted |
| meters | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| background | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| background | populated/default | yes | screen.background.state.populated-default.body |  |  | screen.background.state.populated-default.recovery | fixture.dvor.background.current |
| background | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
