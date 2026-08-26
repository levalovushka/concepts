## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| settings | permission-restricted | yes | screen.settings.state.permission-restricted.body | toggle-background-feed<br>permission.push.fallback<br>permission.remotenotif.fallback<br>permission.fetch.fallback<br>permission.appgroups.fallback<br>permission.autofill.fallback<br>permission.faceid.fallback<br>permission.shareext.fallback | toggle-background-feed:mutate | screen.settings.state.permission-restricted.recovery | fixture.looks.settings.permission-restricted |
| settings | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| widget | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| widget | populated/default | yes | screen.widget.state.populated-default.body |  |  | screen.widget.state.populated-default.recovery | fixture.looks.widget.default |
| widget | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| widget | error | N/A | The operating system or external application owns failure presentation. |  |  | — |  |
| widget | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| widget | permission-needed | yes | screen.widget.state.permission-needed.body | permission.keychain.fallback |  | screen.widget.state.permission-needed.recovery | fixture.looks.widget.permission-needed |
| widget | permission-denied | yes | screen.widget.state.permission-denied.body | permission.keychain.fallback |  | screen.widget.state.permission-denied.recovery | fixture.looks.widget.permission-denied |
| widget | permission-restricted | yes | screen.widget.state.permission-restricted.body | permission.keychain.fallback |  | screen.widget.state.permission-restricted.recovery | fixture.looks.widget.permission-restricted |
| widget | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| fill | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| fill | populated/default | yes | screen.fill.state.populated-default.body |  |  | screen.fill.state.populated-default.recovery | fixture.looks.fill.default |
| fill | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| fill | error | N/A | The operating system or external application owns failure presentation. |  |  | — |  |
| fill | offline | N/A | The operating system or external application owns connectivity presentation. |  |  | — |  |
| fill | permission-needed | yes | screen.fill.state.permission-needed.body | permission.autofill.fallback |  | screen.fill.state.permission-needed.recovery | fixture.looks.fill.permission-needed |
| fill | permission-denied | yes | screen.fill.state.permission-denied.body | permission.autofill.fallback |  | screen.fill.state.permission-denied.recovery | fixture.looks.fill.permission-denied |
| fill | permission-restricted | yes | screen.fill.state.permission-restricted.body | permission.autofill.fallback |  | screen.fill.state.permission-restricted.recovery | fixture.looks.fill.permission-restricted |
| fill | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| mates | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| mates | populated/default | yes | screen.mates.state.populated-default.body | open-contact-profile | open-contact-profile:navigate→profile | screen.mates.state.populated-default.recovery | fixture.looks.mates.default |
| mates | empty | yes | screen.mates.state.empty.body | open-contact-profile | open-contact-profile:navigate→profile | screen.mates.state.empty.recovery | fixture.looks.mates.empty |
| mates | error | yes | screen.mates.state.error.body | open-contact-profile | open-contact-profile:navigate→profile | screen.mates.state.error.recovery | fixture.looks.mates.error |
| mates | offline | yes | screen.mates.state.offline.body | open-contact-profile | open-contact-profile:navigate→profile | screen.mates.state.offline.recovery | fixture.looks.mates.offline |
| mates | permission-needed | yes | screen.mates.state.permission-needed.body | open-contact-profile<br>permission.contacts.fallback | open-contact-profile:navigate→profile | screen.mates.state.permission-needed.recovery | fixture.looks.mates.permission-needed |
| mates | permission-denied | yes | screen.mates.state.permission-denied.body | open-contact-profile<br>permission.contacts.fallback | open-contact-profile:navigate→profile | screen.mates.state.permission-denied.recovery | fixture.looks.mates.denied |
| mates | permission-restricted | yes | screen.mates.state.permission-restricted.body | open-contact-profile<br>permission.contacts.fallback | open-contact-profile:navigate→profile | screen.mates.state.permission-restricted.recovery | fixture.looks.mates.permission-restricted |
| mates | permission-limited | yes | screen.mates.state.permission-limited.body | open-contact-profile<br>permission.contacts.fallback | open-contact-profile:navigate→profile | screen.mates.state.permission-limited.recovery | fixture.looks.mates.permission-limited |
| wardrobe | loading | yes | screen.wardrobe.state.loading.body | open-saved-look | open-saved-look:navigate→post | screen.wardrobe.state.loading.recovery | fixture.looks.wardrobe.loading |
| wardrobe | populated/default | yes | screen.wardrobe.state.populated-default.body | open-saved-look | open-saved-look:navigate→post | screen.wardrobe.state.populated-default.recovery | fixture.looks.wardrobe.populated |
| wardrobe | empty | yes | screen.wardrobe.state.empty.body | open-saved-look | open-saved-look:navigate→post | screen.wardrobe.state.empty.recovery | fixture.looks.wardrobe.empty |
