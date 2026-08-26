## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| shareext | offline | yes | screen.shareext.state.offline.body | complete-shareext | complete-shareext:mutate | screen.shareext.state.offline.recovery | fixture.tails.shareext.offline |
| shareext | permission-needed | yes | screen.shareext.state.permission-needed.body | complete-shareext<br>permission.shareext.fallback | complete-shareext:mutate | screen.shareext.state.permission-needed.recovery | fixture.tails.shareext.permission-needed |
| shareext | permission-denied | yes | screen.shareext.state.permission-denied.body | complete-shareext<br>permission.shareext.fallback | complete-shareext:mutate | screen.shareext.state.permission-denied.recovery | fixture.tails.shareext.permission-denied |
| shareext | permission-restricted | yes | screen.shareext.state.permission-restricted.body | complete-shareext<br>permission.shareext.fallback | complete-shareext:mutate | screen.shareext.state.permission-restricted.recovery | fixture.tails.shareext.permission-restricted |
| shareext | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
