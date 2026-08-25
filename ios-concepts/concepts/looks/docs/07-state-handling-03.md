## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| nearby | populated/default | yes | screen.nearby.state.populated-default.body | open-nearby-event<br>enable-location | open-nearby-event:navigate→event<br>enable-location:request | screen.nearby.state.populated-default.recovery | fixture.looks.nearby.default |
| nearby | empty | yes | screen.nearby.state.empty.body | open-nearby-event<br>enable-location | open-nearby-event:navigate→event<br>enable-location:request | screen.nearby.state.empty.recovery | fixture.looks.nearby.empty |
| nearby | error | yes | screen.nearby.state.error.body | open-nearby-event<br>enable-location | open-nearby-event:navigate→event<br>enable-location:request | screen.nearby.state.error.recovery | fixture.looks.nearby.error |
| nearby | offline | yes | screen.nearby.state.offline.body | open-nearby-event<br>enable-location | open-nearby-event:navigate→event<br>enable-location:request | screen.nearby.state.offline.recovery | fixture.looks.nearby.offline |
| nearby | permission-needed | yes | screen.nearby.state.permission-needed.body | open-nearby-event<br>enable-location<br>permission.location.fallback | open-nearby-event:navigate→event<br>enable-location:request | screen.nearby.state.permission-needed.recovery | fixture.looks.nearby.permission-needed |
| nearby | permission-denied | yes | screen.nearby.state.permission-denied.body | open-nearby-event<br>enable-location<br>permission.location.fallback | open-nearby-event:navigate→event<br>enable-location:request | screen.nearby.state.permission-denied.recovery | fixture.looks.nearby.permission-denied |
| nearby | permission-restricted | yes | screen.nearby.state.permission-restricted.body | open-nearby-event<br>enable-location<br>permission.location.fallback | open-nearby-event:navigate→event<br>enable-location:request | screen.nearby.state.permission-restricted.recovery | fixture.looks.nearby.permission-restricted |
| nearby | permission-limited | yes | screen.nearby.state.permission-limited.body | open-nearby-event<br>enable-location<br>permission.location.fallback | open-nearby-event:navigate→event<br>enable-location:request | screen.nearby.state.permission-limited.recovery | fixture.looks.nearby.permission-limited |
| clip | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| clip | populated/default | yes | screen.clip.state.populated-default.body | remix-clip | remix-clip:mutate | screen.clip.state.populated-default.recovery | fixture.looks.clip.default |
| clip | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| clip | error | yes | screen.clip.state.error.body | remix-clip | remix-clip:mutate | screen.clip.state.error.recovery | fixture.looks.clip.error |
| clip | offline | yes | screen.clip.state.offline.body | remix-clip | remix-clip:mutate | screen.clip.state.offline.recovery | fixture.looks.clip.offline |
| clip | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| clip | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| clip | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| clip | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| create | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| create | populated/default | yes | screen.create.state.populated-default.body | open-camera | open-camera:navigate→camera | screen.create.state.populated-default.recovery | fixture.looks.create.default<br>fixture.looks.create.success |
| create | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| create | error | yes | screen.create.state.error.body | open-camera | open-camera:navigate→camera | screen.create.state.error.recovery | fixture.looks.create.error |
| create | offline | yes | screen.create.state.offline.body | open-camera | open-camera:navigate→camera | screen.create.state.offline.recovery | fixture.looks.create.offline |
| create | permission-needed | yes | screen.create.state.permission-needed.body | open-camera<br>permission.camera.fallback<br>permission.photos.fallback<br>permission.speech.fallback | open-camera:navigate→camera | screen.create.state.permission-needed.recovery | fixture.looks.create.permission-needed |
| create | permission-denied | yes | screen.create.state.permission-denied.body | open-camera<br>permission.camera.fallback<br>permission.photos.fallback<br>permission.speech.fallback | open-camera:navigate→camera | screen.create.state.permission-denied.recovery | fixture.looks.create.permission-denied |
| create | permission-restricted | yes | screen.create.state.permission-restricted.body | open-camera<br>permission.camera.fallback<br>permission.photos.fallback<br>permission.speech.fallback | open-camera:navigate→camera | screen.create.state.permission-restricted.recovery | fixture.looks.create.permission-restricted |
| create | permission-limited | yes | screen.create.state.permission-limited.body | open-camera<br>permission.camera.fallback<br>permission.photos.fallback<br>permission.speech.fallback | open-camera:navigate→camera | screen.create.state.permission-limited.recovery | fixture.looks.create.permission-limited |
| camera | loading | yes | screen.camera.state.loading.body | capture-photo | capture-photo:request | screen.camera.state.loading.recovery | fixture.looks.camera.loading |
| camera | populated/default | yes | screen.camera.state.populated-default.body | capture-photo | capture-photo:request | screen.camera.state.populated-default.recovery | fixture.looks.camera.default |
| camera | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| camera | error | yes | screen.camera.state.error.body | capture-photo | capture-photo:request | screen.camera.state.error.recovery | fixture.looks.camera.error |
| camera | offline | yes | screen.camera.state.offline.body | capture-photo | capture-photo:request | screen.camera.state.offline.recovery | fixture.looks.camera.offline |
| camera | permission-needed | yes | screen.camera.state.permission-needed.body | capture-photo<br>permission.camera.fallback | capture-photo:request | screen.camera.state.permission-needed.recovery | fixture.looks.camera.permission-needed |
