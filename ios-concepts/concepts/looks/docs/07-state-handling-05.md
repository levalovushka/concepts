## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| voice | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| voice | error | yes | screen.voice.state.error.body | send-voice | send-voice:mutate | screen.voice.state.error.recovery | fixture.looks.voice.error |
| voice | offline | yes | screen.voice.state.offline.body | send-voice | send-voice:mutate | screen.voice.state.offline.recovery | fixture.looks.voice.offline |
| voice | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| voice | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| voice | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| voice | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| profile | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| profile | populated/default | yes | screen.profile.state.populated-default.body | edit-bio | edit-bio:mutate | screen.profile.state.populated-default.recovery | fixture.looks.profile.default |
| profile | empty | yes | screen.profile.state.empty.body | edit-bio | edit-bio:mutate | screen.profile.state.empty.recovery | fixture.looks.profile.empty |
| profile | error | yes | screen.profile.state.error.body | edit-bio | edit-bio:mutate | screen.profile.state.error.recovery | fixture.looks.profile.error |
| profile | offline | yes | screen.profile.state.offline.body | edit-bio | edit-bio:mutate | screen.profile.state.offline.recovery | fixture.looks.profile.offline |
| profile | permission-needed | yes | screen.profile.state.permission-needed.body | edit-bio<br>permission.keychain.fallback<br>permission.contacts.fallback<br>permission.tracking.fallback | edit-bio:mutate | screen.profile.state.permission-needed.recovery | fixture.looks.profile.permission-needed |
| profile | permission-denied | yes | screen.profile.state.permission-denied.body | edit-bio<br>permission.keychain.fallback<br>permission.contacts.fallback<br>permission.tracking.fallback | edit-bio:mutate | screen.profile.state.permission-denied.recovery | fixture.looks.profile.permission-denied |
| profile | permission-restricted | yes | screen.profile.state.permission-restricted.body | edit-bio<br>permission.keychain.fallback<br>permission.contacts.fallback<br>permission.tracking.fallback | edit-bio:mutate | screen.profile.state.permission-restricted.recovery | fixture.looks.profile.permission-restricted |
| profile | permission-limited | yes | screen.profile.state.permission-limited.body | edit-bio<br>permission.keychain.fallback<br>permission.contacts.fallback<br>permission.tracking.fallback | edit-bio:mutate | screen.profile.state.permission-limited.recovery | fixture.looks.profile.permission-limited |
| services | loading | yes | screen.services.state.loading.body | open-wardrobe | open-wardrobe:navigate→wardrobe | screen.services.state.loading.recovery | fixture.looks.services.loading |
| services | populated/default | yes | screen.services.state.populated-default.body | open-wardrobe | open-wardrobe:navigate→wardrobe | screen.services.state.populated-default.recovery | fixture.looks.services.default |
| services | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| services | error | yes | screen.services.state.error.body | open-wardrobe | open-wardrobe:navigate→wardrobe | screen.services.state.error.recovery | fixture.looks.services.error |
| services | offline | yes | screen.services.state.offline.body | open-wardrobe | open-wardrobe:navigate→wardrobe | screen.services.state.offline.recovery | fixture.looks.services.offline |
| services | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| services | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| services | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| services | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| settings | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| settings | populated/default | yes | screen.settings.state.populated-default.body | toggle-background-feed | toggle-background-feed:mutate | screen.settings.state.populated-default.recovery | fixture.looks.settings.default |
| settings | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| settings | error | yes | screen.settings.state.error.body | toggle-background-feed | toggle-background-feed:mutate | screen.settings.state.error.recovery | fixture.looks.settings.error |
| settings | offline | yes | screen.settings.state.offline.body | toggle-background-feed | toggle-background-feed:mutate | screen.settings.state.offline.recovery | fixture.looks.settings.offline |
| settings | permission-needed | yes | screen.settings.state.permission-needed.body | toggle-background-feed<br>permission.push.fallback<br>permission.remotenotif.fallback<br>permission.fetch.fallback<br>permission.appgroups.fallback<br>permission.autofill.fallback<br>permission.faceid.fallback<br>permission.shareext.fallback | toggle-background-feed:mutate | screen.settings.state.permission-needed.recovery | fixture.looks.settings.permission-needed |
| settings | permission-denied | yes | screen.settings.state.permission-denied.body | toggle-background-feed<br>permission.push.fallback<br>permission.remotenotif.fallback<br>permission.fetch.fallback<br>permission.appgroups.fallback<br>permission.autofill.fallback<br>permission.faceid.fallback<br>permission.shareext.fallback | toggle-background-feed:mutate | screen.settings.state.permission-denied.recovery | fixture.looks.settings.permission-denied |
