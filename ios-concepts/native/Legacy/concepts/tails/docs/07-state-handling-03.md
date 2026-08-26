## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| create | populated/default | yes | screen.create.state.populated-default.body | open-camera | open-camera:navigate→camera | screen.create.state.populated-default.recovery | fixture.tails.create.default<br>fixture.tails.create.success |
| create | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| create | error | yes | screen.create.state.error.body | open-camera | open-camera:navigate→camera | screen.create.state.error.recovery | fixture.tails.create.error |
| create | offline | yes | screen.create.state.offline.body | open-camera | open-camera:navigate→camera | screen.create.state.offline.recovery | fixture.tails.create.offline |
| create | permission-needed | yes | screen.create.state.permission-needed.body | open-camera<br>permission.camera.fallback<br>permission.photos.fallback | open-camera:navigate→camera | screen.create.state.permission-needed.recovery | fixture.tails.create.permission-needed |
| create | permission-denied | yes | screen.create.state.permission-denied.body | open-camera<br>permission.camera.fallback<br>permission.photos.fallback | open-camera:navigate→camera | screen.create.state.permission-denied.recovery | fixture.tails.create.permission-denied |
| create | permission-restricted | yes | screen.create.state.permission-restricted.body | open-camera<br>permission.camera.fallback<br>permission.photos.fallback | open-camera:navigate→camera | screen.create.state.permission-restricted.recovery | fixture.tails.create.permission-restricted |
| create | permission-limited | yes | screen.create.state.permission-limited.body | open-camera<br>permission.camera.fallback<br>permission.photos.fallback | open-camera:navigate→camera | screen.create.state.permission-limited.recovery | fixture.tails.create.permission-limited |
| camera | loading | yes | screen.camera.state.loading.body | complete-camera | complete-camera:mutate | screen.camera.state.loading.recovery | fixture.tails.camera.loading |
| camera | populated/default | yes | screen.camera.state.populated-default.body | complete-camera | complete-camera:mutate | screen.camera.state.populated-default.recovery | fixture.tails.camera.default |
| camera | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| camera | error | yes | screen.camera.state.error.body | complete-camera | complete-camera:mutate | screen.camera.state.error.recovery | fixture.tails.camera.error |
| camera | offline | yes | screen.camera.state.offline.body | complete-camera | complete-camera:mutate | screen.camera.state.offline.recovery | fixture.tails.camera.offline |
| camera | permission-needed | yes | screen.camera.state.permission-needed.body | complete-camera<br>permission.camera.fallback | complete-camera:mutate | screen.camera.state.permission-needed.recovery | fixture.tails.camera.permission-needed |
| camera | permission-denied | yes | screen.camera.state.permission-denied.body | complete-camera<br>permission.camera.fallback | complete-camera:mutate | screen.camera.state.permission-denied.recovery | fixture.tails.camera.denied |
| camera | permission-restricted | yes | screen.camera.state.permission-restricted.body | complete-camera<br>permission.camera.fallback | complete-camera:mutate | screen.camera.state.permission-restricted.recovery | fixture.tails.camera.permission-restricted |
| camera | permission-limited | yes | screen.camera.state.permission-limited.body | complete-camera<br>permission.camera.fallback | complete-camera:mutate | screen.camera.state.permission-limited.recovery | fixture.tails.camera.permission-limited |
| media | loading | yes | screen.media.state.loading.body | complete-media | complete-media:mutate | screen.media.state.loading.recovery | fixture.tails.media.loading |
| media | populated/default | yes | screen.media.state.populated-default.body | complete-media | complete-media:mutate | screen.media.state.populated-default.recovery | fixture.tails.media.default |
| media | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| media | error | yes | screen.media.state.error.body | complete-media | complete-media:mutate | screen.media.state.error.recovery | fixture.tails.media.error |
| media | offline | yes | screen.media.state.offline.body | complete-media | complete-media:mutate | screen.media.state.offline.recovery | fixture.tails.media.offline |
| media | permission-needed | yes | screen.media.state.permission-needed.body | complete-media<br>permission.photos.fallback | complete-media:mutate | screen.media.state.permission-needed.recovery | fixture.tails.media.permission-needed |
| media | permission-denied | yes | screen.media.state.permission-denied.body | complete-media<br>permission.photos.fallback | complete-media:mutate | screen.media.state.permission-denied.recovery | fixture.tails.media.permission-denied |
| media | permission-restricted | yes | screen.media.state.permission-restricted.body | complete-media<br>permission.photos.fallback | complete-media:mutate | screen.media.state.permission-restricted.recovery | fixture.tails.media.permission-restricted |
| media | permission-limited | yes | screen.media.state.permission-limited.body | complete-media<br>permission.photos.fallback | complete-media:mutate | screen.media.state.permission-limited.recovery | fixture.tails.media.permission-limited |
| places | loading | yes | screen.places.state.loading.body | complete-places | complete-places:mutate | screen.places.state.loading.recovery | fixture.tails.places.loading |
| places | populated/default | yes | screen.places.state.populated-default.body | complete-places | complete-places:mutate | screen.places.state.populated-default.recovery | fixture.tails.places.default |
| places | empty | yes | screen.places.state.empty.body | complete-places | complete-places:mutate | screen.places.state.empty.recovery | fixture.tails.places.empty |
| places | error | yes | screen.places.state.error.body | complete-places | complete-places:mutate | screen.places.state.error.recovery | fixture.tails.places.error |
| places | offline | yes | screen.places.state.offline.body | complete-places | complete-places:mutate | screen.places.state.offline.recovery | fixture.tails.places.offline |
| places | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
