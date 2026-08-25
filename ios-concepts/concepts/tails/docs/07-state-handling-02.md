## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| home | permission-needed | yes | screen.home.state.permission-needed.body | open-pet<br>permission.location.fallback<br>permission.bgtask.fallback<br>permission.keychain.fallback | open-pet:navigate→pet | screen.home.state.permission-needed.recovery | fixture.tails.home.permission-needed |
| home | permission-denied | yes | screen.home.state.permission-denied.body | open-pet<br>permission.location.fallback<br>permission.bgtask.fallback<br>permission.keychain.fallback | open-pet:navigate→pet | screen.home.state.permission-denied.recovery | fixture.tails.home.permission-denied |
| home | permission-restricted | yes | screen.home.state.permission-restricted.body | open-pet<br>permission.location.fallback<br>permission.bgtask.fallback<br>permission.keychain.fallback | open-pet:navigate→pet | screen.home.state.permission-restricted.recovery | fixture.tails.home.permission-restricted |
| home | permission-limited | yes | screen.home.state.permission-limited.body | open-pet<br>permission.location.fallback<br>permission.bgtask.fallback<br>permission.keychain.fallback | open-pet:navigate→pet | screen.home.state.permission-limited.recovery | fixture.tails.home.permission-limited |
| pet | loading | yes | screen.pet.state.loading.body | open-vetnote | open-vetnote:navigate→vetnote | screen.pet.state.loading.recovery | fixture.tails.pet.loading |
| pet | populated/default | yes | screen.pet.state.populated-default.body | open-vetnote | open-vetnote:navigate→vetnote | screen.pet.state.populated-default.recovery | fixture.tails.pet.default |
| pet | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| pet | error | yes | screen.pet.state.error.body | open-vetnote | open-vetnote:navigate→vetnote | screen.pet.state.error.recovery | fixture.tails.pet.error |
| pet | offline | yes | screen.pet.state.offline.body | open-vetnote | open-vetnote:navigate→vetnote | screen.pet.state.offline.recovery | fixture.tails.pet.offline |
| pet | permission-needed | yes | screen.pet.state.permission-needed.body | open-vetnote<br>permission.speech.fallback | open-vetnote:navigate→vetnote | screen.pet.state.permission-needed.recovery | fixture.tails.pet.permission-needed |
| pet | permission-denied | yes | screen.pet.state.permission-denied.body | open-vetnote<br>permission.speech.fallback | open-vetnote:navigate→vetnote | screen.pet.state.permission-denied.recovery | fixture.tails.pet.permission-denied |
| pet | permission-restricted | yes | screen.pet.state.permission-restricted.body | open-vetnote<br>permission.speech.fallback | open-vetnote:navigate→vetnote | screen.pet.state.permission-restricted.recovery | fixture.tails.pet.permission-restricted |
| pet | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| nearby | loading | yes | screen.nearby.state.loading.body | open-walk | open-walk:navigate→walk | screen.nearby.state.loading.recovery | fixture.tails.nearby.loading |
| nearby | populated/default | yes | screen.nearby.state.populated-default.body | open-walk | open-walk:navigate→walk | screen.nearby.state.populated-default.recovery | fixture.tails.nearby.default |
| nearby | empty | yes | screen.nearby.state.empty.body | open-walk | open-walk:navigate→walk | screen.nearby.state.empty.recovery | fixture.tails.nearby.empty |
| nearby | error | yes | screen.nearby.state.error.body | open-walk | open-walk:navigate→walk | screen.nearby.state.error.recovery | fixture.tails.nearby.error |
| nearby | offline | yes | screen.nearby.state.offline.body | open-walk | open-walk:navigate→walk | screen.nearby.state.offline.recovery | fixture.tails.nearby.offline |
| nearby | permission-needed | yes | screen.nearby.state.permission-needed.body | open-walk<br>permission.location.fallback | open-walk:navigate→walk | screen.nearby.state.permission-needed.recovery | fixture.tails.nearby.permission-needed |
| nearby | permission-denied | yes | screen.nearby.state.permission-denied.body | open-walk<br>permission.location.fallback | open-walk:navigate→walk | screen.nearby.state.permission-denied.recovery | fixture.tails.nearby.permission-denied |
| nearby | permission-restricted | yes | screen.nearby.state.permission-restricted.body | open-walk<br>permission.location.fallback | open-walk:navigate→walk | screen.nearby.state.permission-restricted.recovery | fixture.tails.nearby.permission-restricted |
| nearby | permission-limited | yes | screen.nearby.state.permission-limited.body | open-walk<br>permission.location.fallback | open-walk:navigate→walk | screen.nearby.state.permission-limited.recovery | fixture.tails.nearby.permission-limited |
| walk | loading | yes | screen.walk.state.loading.body | open-netqr | open-netqr:navigate→netqr | screen.walk.state.loading.recovery | fixture.tails.walk.loading |
| walk | populated/default | yes | screen.walk.state.populated-default.body | open-netqr | open-netqr:navigate→netqr | screen.walk.state.populated-default.recovery | fixture.tails.walk.default |
| walk | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| walk | error | yes | screen.walk.state.error.body | open-netqr | open-netqr:navigate→netqr | screen.walk.state.error.recovery | fixture.tails.walk.error |
| walk | offline | yes | screen.walk.state.offline.body | open-netqr | open-netqr:navigate→netqr | screen.walk.state.offline.recovery | fixture.tails.walk.offline |
| walk | permission-needed | yes | screen.walk.state.permission-needed.body | open-netqr<br>permission.remotenotif.fallback<br>permission.wifiinfo.fallback | open-netqr:navigate→netqr | screen.walk.state.permission-needed.recovery | fixture.tails.walk.permission-needed |
| walk | permission-denied | yes | screen.walk.state.permission-denied.body | open-netqr<br>permission.remotenotif.fallback<br>permission.wifiinfo.fallback | open-netqr:navigate→netqr | screen.walk.state.permission-denied.recovery | fixture.tails.walk.permission-denied |
| walk | permission-restricted | yes | screen.walk.state.permission-restricted.body | open-netqr<br>permission.remotenotif.fallback<br>permission.wifiinfo.fallback | open-netqr:navigate→netqr | screen.walk.state.permission-restricted.recovery | fixture.tails.walk.permission-restricted |
| walk | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| create | loading | yes | screen.create.state.loading.body | open-camera | open-camera:navigate→camera | screen.create.state.loading.recovery | fixture.tails.create.loading |
