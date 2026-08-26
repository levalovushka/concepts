## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| createpost | populated/default | yes | screen.createpost.state.populated-default.body | publish-post<br>cancel-post<br>change-type<br>add-photo | publish-post:mutate<br>cancel-post:dismiss<br>change-type:mutate<br>add-photo:request | screen.createpost.state.populated-default.recovery | fixture.dvor.createpost.default |
| createpost | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| createpost | error | yes | screen.createpost.state.error.body | publish-post<br>cancel-post<br>change-type<br>add-photo | publish-post:mutate<br>cancel-post:dismiss<br>change-type:mutate<br>add-photo:request | screen.createpost.state.error.recovery | fixture.dvor.createpost.error |
| createpost | offline | yes | screen.createpost.state.offline.body | publish-post<br>cancel-post<br>change-type<br>add-photo | publish-post:mutate<br>cancel-post:dismiss<br>change-type:mutate<br>add-photo:request | screen.createpost.state.offline.recovery | fixture.dvor.createpost.offline |
| createpost | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| createpost | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| createpost | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| createpost | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| notifications | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| notifications | populated/default | yes | screen.notifications.state.populated-default.body | open-source<br>mark-all-read | open-source:navigate→post<br>mark-all-read:mutate | screen.notifications.state.populated-default.recovery | fixture.dvor.notifications.default |
| notifications | empty | yes | screen.notifications.state.empty.body | open-source<br>mark-all-read | open-source:navigate→post<br>mark-all-read:mutate | screen.notifications.state.empty.recovery | fixture.dvor.notifications.empty |
| notifications | error | yes | screen.notifications.state.error.body | open-source<br>mark-all-read | open-source:navigate→post<br>mark-all-read:mutate | screen.notifications.state.error.recovery | fixture.dvor.notifications.error |
| notifications | offline | yes | screen.notifications.state.offline.body | open-source<br>mark-all-read | open-source:navigate→post<br>mark-all-read:mutate | screen.notifications.state.offline.recovery | fixture.dvor.notifications.offline |
| notifications | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| notifications | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| notifications | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| notifications | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| post | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| post | populated/default | yes | screen.post.state.populated-default.body | follow-post<br>open-house-chat<br>send-comment | follow-post:mutate<br>open-house-chat:navigate→chat<br>send-comment:mutate | screen.post.state.populated-default.recovery | fixture.dvor.post.default<br>fixture.dvor.post.following<br>fixture.dvor.post.resolved |
| post | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| post | error | yes | screen.post.state.error.body | follow-post<br>open-house-chat<br>send-comment | follow-post:mutate<br>open-house-chat:navigate→chat<br>send-comment:mutate | screen.post.state.error.recovery | fixture.dvor.post.error |
| post | offline | yes | screen.post.state.offline.body | follow-post<br>open-house-chat<br>send-comment | follow-post:mutate<br>open-house-chat:navigate→chat<br>send-comment:mutate | screen.post.state.offline.recovery | fixture.dvor.post.offline |
| post | permission-needed | yes | screen.post.state.permission-needed.body | follow-post<br>open-house-chat<br>send-comment<br>permission.push.fallback | follow-post:mutate<br>open-house-chat:navigate→chat<br>send-comment:mutate | screen.post.state.permission-needed.recovery | fixture.dvor.post.permission-needed |
| post | permission-denied | yes | screen.post.state.permission-denied.body | follow-post<br>open-house-chat<br>send-comment<br>permission.push.fallback | follow-post:mutate<br>open-house-chat:navigate→chat<br>send-comment:mutate | screen.post.state.permission-denied.recovery | fixture.dvor.post.permission-denied |
| post | permission-restricted | yes | screen.post.state.permission-restricted.body | follow-post<br>open-house-chat<br>send-comment<br>permission.push.fallback | follow-post:mutate<br>open-house-chat:navigate→chat<br>send-comment:mutate | screen.post.state.permission-restricted.recovery | fixture.dvor.post.permission-restricted |
| post | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| problem | loading | yes | screen.problem.state.loading.body | submit-problem<br>add-evidence<br>cancel-problem | submit-problem:mutate<br>add-evidence:request<br>cancel-problem:dismiss | screen.problem.state.loading.recovery | fixture.dvor.problem.submitting |
| problem | populated/default | yes | screen.problem.state.populated-default.body | submit-problem<br>add-evidence<br>cancel-problem | submit-problem:mutate<br>add-evidence:request<br>cancel-problem:dismiss | screen.problem.state.populated-default.recovery | fixture.dvor.problem.default<br>fixture.dvor.problem.success |
| problem | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| problem | error | yes | screen.problem.state.error.body | submit-problem<br>add-evidence<br>cancel-problem | submit-problem:mutate<br>add-evidence:request<br>cancel-problem:dismiss | screen.problem.state.error.recovery | fixture.dvor.problem.error |
| problem | offline | yes | screen.problem.state.offline.body | submit-problem<br>add-evidence<br>cancel-problem | submit-problem:mutate<br>add-evidence:request<br>cancel-problem:dismiss | screen.problem.state.offline.recovery | fixture.dvor.problem.offline |
| problem | permission-needed | yes | screen.problem.state.permission-needed.body | submit-problem<br>add-evidence<br>cancel-problem<br>permission.camera.fallback | submit-problem:mutate<br>add-evidence:request<br>cancel-problem:dismiss | screen.problem.state.permission-needed.recovery | fixture.dvor.problem.permission-needed |
