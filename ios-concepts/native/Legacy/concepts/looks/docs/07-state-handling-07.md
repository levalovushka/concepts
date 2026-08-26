## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| wardrobe | error | yes | screen.wardrobe.state.error.body | open-saved-look | open-saved-look:navigate→post | screen.wardrobe.state.error.recovery | fixture.looks.wardrobe.error |
| wardrobe | offline | yes | screen.wardrobe.state.offline.body | open-saved-look | open-saved-look:navigate→post | screen.wardrobe.state.offline.recovery | fixture.looks.wardrobe.offline |
| wardrobe | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| wardrobe | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| wardrobe | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| wardrobe | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| event | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| event | populated/default | yes | screen.event.state.populated-default.body | join-event | join-event:mutate | screen.event.state.populated-default.recovery | fixture.looks.event.available<br>fixture.looks.event.joined |
| event | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| event | error | yes | screen.event.state.error.body | join-event | join-event:mutate | screen.event.state.error.recovery | fixture.looks.event.cancelled |
| event | offline | yes | screen.event.state.offline.body | join-event | join-event:mutate | screen.event.state.offline.recovery | fixture.looks.event.offline |
| event | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| event | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| event | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| event | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| ads | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| ads | populated/default | yes | screen.ads.state.populated-default.body | dismiss-ads-explanation | dismiss-ads-explanation:dismiss | screen.ads.state.populated-default.recovery | fixture.looks.ads.default |
| ads | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| ads | error | yes | screen.ads.state.error.body | dismiss-ads-explanation | dismiss-ads-explanation:dismiss | screen.ads.state.error.recovery | fixture.looks.ads.error |
| ads | offline | yes | screen.ads.state.offline.body | dismiss-ads-explanation | dismiss-ads-explanation:dismiss | screen.ads.state.offline.recovery | fixture.looks.ads.offline |
| ads | permission-needed | yes | screen.ads.state.permission-needed.body | dismiss-ads-explanation<br>permission.tracking.fallback | dismiss-ads-explanation:dismiss | screen.ads.state.permission-needed.recovery | fixture.looks.ads.permission-needed |
| ads | permission-denied | yes | screen.ads.state.permission-denied.body | dismiss-ads-explanation<br>permission.tracking.fallback | dismiss-ads-explanation:dismiss | screen.ads.state.permission-denied.recovery | fixture.looks.ads.permission-denied |
| ads | permission-restricted | yes | screen.ads.state.permission-restricted.body | dismiss-ads-explanation<br>permission.tracking.fallback | dismiss-ads-explanation:dismiss | screen.ads.state.permission-restricted.recovery | fixture.looks.ads.permission-restricted |
| ads | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| lock | loading | yes | screen.lock.state.loading.body | request-face-id | request-face-id:request | screen.lock.state.loading.recovery | fixture.looks.lock.loading |
| lock | populated/default | yes | screen.lock.state.populated-default.body | request-face-id | request-face-id:request | screen.lock.state.populated-default.recovery | fixture.looks.lock.default |
| lock | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| lock | error | yes | screen.lock.state.error.body | request-face-id | request-face-id:request | screen.lock.state.error.recovery | fixture.looks.lock.error |
| lock | offline | yes | screen.lock.state.offline.body | request-face-id | request-face-id:request | screen.lock.state.offline.recovery | fixture.looks.lock.offline |
| lock | permission-needed | yes | screen.lock.state.permission-needed.body | request-face-id<br>permission.faceid.fallback | request-face-id:request | screen.lock.state.permission-needed.recovery | fixture.looks.lock.permission-needed |
| lock | permission-denied | yes | screen.lock.state.permission-denied.body | request-face-id<br>permission.faceid.fallback | request-face-id:request | screen.lock.state.permission-denied.recovery | fixture.looks.lock.denied |
| lock | permission-restricted | yes | screen.lock.state.permission-restricted.body | request-face-id<br>permission.faceid.fallback | request-face-id:request | screen.lock.state.permission-restricted.recovery | fixture.looks.lock.permission-restricted |
