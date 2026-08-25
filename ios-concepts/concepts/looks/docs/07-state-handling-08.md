## Canonical UX state handling

| Surface | State | Applies | Content key / rationale | Available actions | Transitions | Recovery | Fixtures |
|---|---|---:|---|---|---|---|---|
| lock | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| subtitles | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| subtitles | populated/default | yes | screen.subtitles.state.populated-default.body | publish-captioned-clip | publish-captioned-clip:mutate | screen.subtitles.state.populated-default.recovery | fixture.looks.subtitles.default<br>fixture.looks.subtitles.success |
| subtitles | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| subtitles | error | yes | screen.subtitles.state.error.body | publish-captioned-clip | publish-captioned-clip:mutate | screen.subtitles.state.error.recovery | fixture.looks.subtitles.error |
| subtitles | offline | yes | screen.subtitles.state.offline.body | publish-captioned-clip | publish-captioned-clip:mutate | screen.subtitles.state.offline.recovery | fixture.looks.subtitles.offline |
| subtitles | permission-needed | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| subtitles | permission-denied | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| subtitles | permission-restricted | N/A | No permission is requested from or resolved on this surface. |  |  | — |  |
| subtitles | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| talk | loading | yes | screen.talk.state.loading.body | start-background-audio | start-background-audio:request | screen.talk.state.loading.recovery | fixture.looks.talk.loading |
| talk | populated/default | yes | screen.talk.state.populated-default.body | start-background-audio | start-background-audio:request | screen.talk.state.populated-default.recovery | fixture.looks.talk.default |
| talk | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| talk | error | yes | screen.talk.state.error.body | start-background-audio | start-background-audio:request | screen.talk.state.error.recovery | fixture.looks.talk.error |
| talk | offline | yes | screen.talk.state.offline.body | start-background-audio | start-background-audio:request | screen.talk.state.offline.recovery | fixture.looks.talk.offline |
| talk | permission-needed | yes | screen.talk.state.permission-needed.body | start-background-audio<br>permission.audio.fallback | start-background-audio:request | screen.talk.state.permission-needed.recovery | fixture.looks.talk.permission-needed |
| talk | permission-denied | yes | screen.talk.state.permission-denied.body | start-background-audio<br>permission.audio.fallback | start-background-audio:request | screen.talk.state.permission-denied.recovery | fixture.looks.talk.permission-denied |
| talk | permission-restricted | yes | screen.talk.state.permission-restricted.body | start-background-audio<br>permission.audio.fallback | start-background-audio:request | screen.talk.state.permission-restricted.recovery | fixture.looks.talk.permission-restricted |
| talk | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| background | loading | yes | screen.background.state.loading.body | return-to-talk | return-to-talk:navigate→talk | screen.background.state.loading.recovery | fixture.looks.background.loading |
| background | populated/default | yes | screen.background.state.populated-default.body | return-to-talk | return-to-talk:navigate→talk | screen.background.state.populated-default.recovery | fixture.looks.background.default |
| background | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| background | error | yes | screen.background.state.error.body | return-to-talk | return-to-talk:navigate→talk | screen.background.state.error.recovery | fixture.looks.background.error |
| background | offline | yes | screen.background.state.offline.body | return-to-talk | return-to-talk:navigate→talk | screen.background.state.offline.recovery | fixture.looks.background.offline |
| background | permission-needed | yes | screen.background.state.permission-needed.body | return-to-talk<br>permission.audio.fallback | return-to-talk:navigate→talk | screen.background.state.permission-needed.recovery | fixture.looks.background.permission-needed |
| background | permission-denied | yes | screen.background.state.permission-denied.body | return-to-talk<br>permission.audio.fallback | return-to-talk:navigate→talk | screen.background.state.permission-denied.recovery | fixture.looks.background.permission-denied |
| background | permission-restricted | yes | screen.background.state.permission-restricted.body | return-to-talk<br>permission.audio.fallback | return-to-talk:navigate→talk | screen.background.state.permission-restricted.recovery | fixture.looks.background.permission-restricted |
| background | permission-limited | N/A | The linked capabilities have no useful limited-data mode. |  |  | — |  |
| call | loading | N/A | This surface owns no asynchronous or loading operation. |  |  | — |  |
| call | populated/default | yes | screen.call.state.populated-default.body |  |  | screen.call.state.populated-default.recovery | fixture.looks.call.default |
| call | empty | N/A | The surface represents one required task or system-owned object, not a collection. |  |  | — |  |
| call | error | yes | screen.call.state.error.body |  |  | screen.call.state.error.recovery | fixture.looks.call.error |
