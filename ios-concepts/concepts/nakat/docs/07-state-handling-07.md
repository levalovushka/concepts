## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| guestnet | error | yes | screen.guestnet.state.error.body | open-scanwifi | open-scanwifi:navigate→scanwifi | screen.guestnet.state.error.recovery | fixture.nakat.guestnet.error |
| guestnet | offline | yes | screen.guestnet.state.offline.body | open-scanwifi | open-scanwifi:navigate→scanwifi | screen.guestnet.state.offline.recovery | fixture.nakat.guestnet.offline |
| guestnet | permission-needed | yes | screen.guestnet.state.permission-needed.body | open-scanwifi<br>permission.hotspot.fallback | open-scanwifi:navigate→scanwifi | screen.guestnet.state.permission-needed.recovery | fixture.nakat.guestnet.permission-needed |
| guestnet | permission-denied | yes | screen.guestnet.state.permission-denied.body | open-scanwifi<br>permission.hotspot.fallback | open-scanwifi:navigate→scanwifi | screen.guestnet.state.permission-denied.recovery | fixture.nakat.guestnet.permission-denied |
| guestnet | permission-restricted | yes | screen.guestnet.state.permission-restricted.body | open-scanwifi<br>permission.hotspot.fallback | open-scanwifi:navigate→scanwifi | screen.guestnet.state.permission-restricted.recovery | fixture.nakat.guestnet.permission-restricted |
| guestnet | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| scanwifi | loading | yes | screen.scanwifi.state.loading.body | complete-scanwifi | complete-scanwifi:mutate | screen.scanwifi.state.loading.recovery | fixture.nakat.scanwifi.loading |
| scanwifi | populated/default | yes | screen.scanwifi.state.populated-default.body | complete-scanwifi | complete-scanwifi:mutate | screen.scanwifi.state.populated-default.recovery | fixture.nakat.scanwifi.default |
| scanwifi | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| scanwifi | error | yes | screen.scanwifi.state.error.body | complete-scanwifi | complete-scanwifi:mutate | screen.scanwifi.state.error.recovery | fixture.nakat.scanwifi.error |
| scanwifi | offline | yes | screen.scanwifi.state.offline.body | complete-scanwifi | complete-scanwifi:mutate | screen.scanwifi.state.offline.recovery | fixture.nakat.scanwifi.offline |
| scanwifi | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| scanwifi | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| scanwifi | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| scanwifi | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| menu | loading | yes | screen.menu.state.loading.body | open-notif | open-notif:navigate→notif | screen.menu.state.loading.recovery | fixture.nakat.menu.loading |
| menu | populated/default | yes | screen.menu.state.populated-default.body | open-notif | open-notif:navigate→notif | screen.menu.state.populated-default.recovery | fixture.nakat.menu.default |
| menu | empty | yes | screen.menu.state.empty.body | open-notif | open-notif:navigate→notif | screen.menu.state.empty.recovery | fixture.nakat.menu.empty |
| menu | error | yes | screen.menu.state.error.body | open-notif | open-notif:navigate→notif | screen.menu.state.error.recovery | fixture.nakat.menu.error |
| menu | offline | yes | screen.menu.state.offline.body | open-notif | open-notif:navigate→notif | screen.menu.state.offline.recovery | fixture.nakat.menu.offline |
| menu | permission-needed | yes | screen.menu.state.permission-needed.body | open-notif<br>permission.tracking.fallback<br>permission.appgroups.fallback | open-notif:navigate→notif | screen.menu.state.permission-needed.recovery | fixture.nakat.menu.permission-needed |
| menu | permission-denied | yes | screen.menu.state.permission-denied.body | open-notif<br>permission.tracking.fallback<br>permission.appgroups.fallback | open-notif:navigate→notif | screen.menu.state.permission-denied.recovery | fixture.nakat.menu.permission-denied |
| menu | permission-restricted | yes | screen.menu.state.permission-restricted.body | open-notif<br>permission.tracking.fallback<br>permission.appgroups.fallback | open-notif:navigate→notif | screen.menu.state.permission-restricted.recovery | fixture.nakat.menu.permission-restricted |
| menu | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| docs | loading | yes | screen.docs.state.loading.body | complete-docs | complete-docs:mutate | screen.docs.state.loading.recovery | fixture.nakat.docs.loading |
| docs | populated/default | yes | screen.docs.state.populated-default.body | complete-docs | complete-docs:mutate | screen.docs.state.populated-default.recovery | fixture.nakat.docs.default |
| docs | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| docs | error | yes | screen.docs.state.error.body | complete-docs | complete-docs:mutate | screen.docs.state.error.recovery | fixture.nakat.docs.error |
| docs | offline | yes | screen.docs.state.offline.body | complete-docs | complete-docs:mutate | screen.docs.state.offline.recovery | fixture.nakat.docs.offline |
| docs | permission-needed | yes | screen.docs.state.permission-needed.body | complete-docs<br>permission.photos.fallback | complete-docs:mutate | screen.docs.state.permission-needed.recovery | fixture.nakat.docs.permission-needed |
| docs | permission-denied | yes | screen.docs.state.permission-denied.body | complete-docs<br>permission.photos.fallback | complete-docs:mutate | screen.docs.state.permission-denied.recovery | fixture.nakat.docs.permission-denied |
| docs | permission-restricted | yes | screen.docs.state.permission-restricted.body | complete-docs<br>permission.photos.fallback | complete-docs:mutate | screen.docs.state.permission-restricted.recovery | fixture.nakat.docs.permission-restricted |
