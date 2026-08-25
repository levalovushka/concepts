## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| home | permission-needed | yes | screen.home.state.permission-needed.body | open-feed-post<br>permission.location.fallback | open-feed-post:navigate→post | screen.home.state.permission-needed.recovery | fixture.looks.home.permission-needed |
| home | permission-denied | yes | screen.home.state.permission-denied.body | open-feed-post<br>permission.location.fallback | open-feed-post:navigate→post | screen.home.state.permission-denied.recovery | fixture.looks.home.permission-denied |
| home | permission-restricted | yes | screen.home.state.permission-restricted.body | open-feed-post<br>permission.location.fallback | open-feed-post:navigate→post | screen.home.state.permission-restricted.recovery | fixture.looks.home.permission-restricted |
| home | permission-limited | yes | screen.home.state.permission-limited.body | open-feed-post<br>permission.location.fallback | open-feed-post:navigate→post | screen.home.state.permission-limited.recovery | fixture.looks.home.permission-limited |
| search | loading | yes | screen.search.state.loading.body | open-search-result | open-search-result:navigate→post | screen.search.state.loading.recovery | fixture.looks.search.loading |
| search | populated/default | yes | screen.search.state.populated-default.body | open-search-result | open-search-result:navigate→post | screen.search.state.populated-default.recovery | fixture.looks.search.default<br>fixture.looks.search.query |
| search | empty | yes | screen.search.state.empty.body | open-search-result | open-search-result:navigate→post | screen.search.state.empty.recovery | fixture.looks.search.empty |
| search | error | yes | screen.search.state.error.body | open-search-result | open-search-result:navigate→post | screen.search.state.error.recovery | fixture.looks.search.error |
| search | offline | yes | screen.search.state.offline.body | open-search-result | open-search-result:navigate→post | screen.search.state.offline.recovery | fixture.looks.search.offline |
| search | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| search | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| search | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| search | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| notifications | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| notifications | populated/default | yes | screen.notifications.state.populated-default.body | open-notification | open-notification:navigate→post | screen.notifications.state.populated-default.recovery | fixture.looks.notifications.unread<br>fixture.looks.notifications.read |
| notifications | empty | yes | screen.notifications.state.empty.body | open-notification | open-notification:navigate→post | screen.notifications.state.empty.recovery | fixture.looks.notifications.empty |
| notifications | error | yes | screen.notifications.state.error.body | open-notification | open-notification:navigate→post | screen.notifications.state.error.recovery | fixture.looks.notifications.error |
| notifications | offline | yes | screen.notifications.state.offline.body | open-notification | open-notification:navigate→post | screen.notifications.state.offline.recovery | fixture.looks.notifications.offline |
| notifications | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| notifications | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| notifications | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| notifications | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| post | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| post | populated/default | yes | screen.post.state.populated-default.body | save-look | save-look:mutate | screen.post.state.populated-default.recovery | fixture.looks.post.default |
| post | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| post | error | yes | screen.post.state.error.body | save-look | save-look:mutate | screen.post.state.error.recovery | fixture.looks.post.error |
| post | offline | yes | screen.post.state.offline.body | save-look | save-look:mutate | screen.post.state.offline.recovery | fixture.looks.post.offline |
| post | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| post | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| post | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| post | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| nearby | loading | yes | screen.nearby.state.loading.body | open-nearby-event<br>enable-location | open-nearby-event:navigate→event<br>enable-location:request | screen.nearby.state.loading.recovery | fixture.looks.nearby.loading |
