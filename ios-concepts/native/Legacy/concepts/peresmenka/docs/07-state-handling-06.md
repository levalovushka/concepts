## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| swap | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| swap | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| people | loading | yes | screen.people.state.loading.body | open-mates | open-mates:navigate→mates | screen.people.state.loading.recovery | fixture.peresmenka.people.loading |
| people | populated/default | yes | screen.people.state.populated-default.body | open-mates | open-mates:navigate→mates | screen.people.state.populated-default.recovery | fixture.peresmenka.people.default |
| people | empty | yes | screen.people.state.empty.body | open-mates | open-mates:navigate→mates | screen.people.state.empty.recovery | fixture.peresmenka.people.empty |
| people | error | yes | screen.people.state.error.body | open-mates | open-mates:navigate→mates | screen.people.state.error.recovery | fixture.peresmenka.people.error |
| people | offline | yes | screen.people.state.offline.body | open-mates | open-mates:navigate→mates | screen.people.state.offline.recovery | fixture.peresmenka.people.offline |
| people | permission-needed | yes | screen.people.state.permission-needed.body | open-mates<br>permission.contacts.fallback | open-mates:navigate→mates | screen.people.state.permission-needed.recovery | fixture.peresmenka.people.permission-needed |
| people | permission-denied | yes | screen.people.state.permission-denied.body | open-mates<br>permission.contacts.fallback | open-mates:navigate→mates | screen.people.state.permission-denied.recovery | fixture.peresmenka.people.permission-denied |
| people | permission-restricted | yes | screen.people.state.permission-restricted.body | open-mates<br>permission.contacts.fallback | open-mates:navigate→mates | screen.people.state.permission-restricted.recovery | fixture.peresmenka.people.permission-restricted |
| people | permission-limited | yes | screen.people.state.permission-limited.body | open-mates<br>permission.contacts.fallback | open-mates:navigate→mates | screen.people.state.permission-limited.recovery | fixture.peresmenka.people.permission-limited |
| mates | loading | yes | screen.mates.state.loading.body | complete-mates | complete-mates:mutate | screen.mates.state.loading.recovery | fixture.peresmenka.mates.loading |
| mates | populated/default | yes | screen.mates.state.populated-default.body | complete-mates | complete-mates:mutate | screen.mates.state.populated-default.recovery | fixture.peresmenka.mates.default |
| mates | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| mates | error | yes | screen.mates.state.error.body | complete-mates | complete-mates:mutate | screen.mates.state.error.recovery | fixture.peresmenka.mates.error |
| mates | offline | yes | screen.mates.state.offline.body | complete-mates | complete-mates:mutate | screen.mates.state.offline.recovery | fixture.peresmenka.mates.offline |
| mates | permission-needed | yes | screen.mates.state.permission-needed.body | complete-mates<br>permission.contacts.fallback | complete-mates:mutate | screen.mates.state.permission-needed.recovery | fixture.peresmenka.mates.permission-needed |
| mates | permission-denied | yes | screen.mates.state.permission-denied.body | complete-mates<br>permission.contacts.fallback | complete-mates:mutate | screen.mates.state.permission-denied.recovery | fixture.peresmenka.mates.permission-denied |
| mates | permission-restricted | yes | screen.mates.state.permission-restricted.body | complete-mates<br>permission.contacts.fallback | complete-mates:mutate | screen.mates.state.permission-restricted.recovery | fixture.peresmenka.mates.permission-restricted |
| mates | permission-limited | yes | screen.mates.state.permission-limited.body | complete-mates<br>permission.contacts.fallback | complete-mates:mutate | screen.mates.state.permission-limited.recovery | fixture.peresmenka.mates.permission-limited |
| person | loading | yes | screen.person.state.loading.body | open-call | open-call:navigate→call | screen.person.state.loading.recovery | fixture.peresmenka.person.loading |
| person | populated/default | yes | screen.person.state.populated-default.body | open-call | open-call:navigate→call | screen.person.state.populated-default.recovery | fixture.peresmenka.person.default |
| person | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| person | error | yes | screen.person.state.error.body | open-call | open-call:navigate→call | screen.person.state.error.recovery | fixture.peresmenka.person.error |
| person | offline | yes | screen.person.state.offline.body | open-call | open-call:navigate→call | screen.person.state.offline.recovery | fixture.peresmenka.person.offline |
| person | permission-needed | yes | screen.person.state.permission-needed.body | open-call<br>permission.voip.fallback | open-call:navigate→call | screen.person.state.permission-needed.recovery | fixture.peresmenka.person.permission-needed |
| person | permission-denied | yes | screen.person.state.permission-denied.body | open-call<br>permission.voip.fallback | open-call:navigate→call | screen.person.state.permission-denied.recovery | fixture.peresmenka.person.permission-denied |
| person | permission-restricted | yes | screen.person.state.permission-restricted.body | open-call<br>permission.voip.fallback | open-call:navigate→call | screen.person.state.permission-restricted.recovery | fixture.peresmenka.person.permission-restricted |
| person | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| call | loading | yes | screen.call.state.loading.body | complete-call | complete-call:mutate | screen.call.state.loading.recovery | fixture.peresmenka.call.loading |
| call | populated/default | yes | screen.call.state.populated-default.body | complete-call | complete-call:mutate | screen.call.state.populated-default.recovery | fixture.peresmenka.call.default |
| call | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
