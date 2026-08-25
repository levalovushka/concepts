## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| shareext | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| shareext | populated/default | yes | screen.shareext.state.populated-default.body | save-shared-draft | save-shared-draft:mutate | screen.shareext.state.populated-default.recovery | fixture.looks.shareext.default<br>fixture.looks.shareext.success |
| shareext | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| shareext | error | yes | screen.shareext.state.error.body | save-shared-draft | save-shared-draft:mutate | screen.shareext.state.error.recovery | fixture.looks.shareext.error |
| shareext | offline | yes | screen.shareext.state.offline.body | save-shared-draft | save-shared-draft:mutate | screen.shareext.state.offline.recovery | fixture.looks.shareext.offline |
| shareext | permission-needed | yes | screen.shareext.state.permission-needed.body | save-shared-draft<br>permission.shareext.fallback | save-shared-draft:mutate | screen.shareext.state.permission-needed.recovery | fixture.looks.shareext.permission-needed |
| shareext | permission-denied | yes | screen.shareext.state.permission-denied.body | save-shared-draft<br>permission.shareext.fallback | save-shared-draft:mutate | screen.shareext.state.permission-denied.recovery | fixture.looks.shareext.permission-denied |
| shareext | permission-restricted | yes | screen.shareext.state.permission-restricted.body | save-shared-draft<br>permission.shareext.fallback | save-shared-draft:mutate | screen.shareext.state.permission-restricted.recovery | fixture.looks.shareext.permission-restricted |
| shareext | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
