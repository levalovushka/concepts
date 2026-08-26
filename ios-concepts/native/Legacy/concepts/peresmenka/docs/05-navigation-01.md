## Information architecture and navigation

**Navigation model.** Продукт сохраняет идентифицированные связи и коммуникацию, но строит собственную задачно-ориентированную навигацию.
**Reference fit.** Профили, общие связи, чат и вызов знакомы, но собственная навигация организована вокруг Смены, а не ленты и подписок.

**Deep links:** None declared.

| Surface | Presentation | Parent | Entry | Exit | Guards | Back / dismiss |
|---|---|---|---|---|---|---|
| phone | root | — | launch:application | present:null<br>navigate:open-code | none | none:none |
| code | push | phone | parent:phone<br>action:phone.open-code | present:null<br>present:null<br>navigate:open-codefail | always | pop:phone |
| codefail | push | code | parent:code<br>action:code.open-codefail | mutate:complete-codefail | always | pop:code |
| join | push | code | parent:code<br>permission:join.location | present:null<br>navigate:open-manual<br>permission:location | capability.location.requested | pop:code |
| manual | push | join | parent:join<br>action:join.open-manual | mutate:complete-manual | always | pop:join |
| shifts | tab | — | tab:shifts<br>permission:background.bgtask<br>permission:widget.keychain | present:null<br>present:null<br>navigate:open-import<br>permission:photos | session.authenticated<br>capability.bgtask.requested<br>capability.keychain.requested | none:none |
| import | push | shifts | parent:shifts<br>action:shifts.open-import<br>permission:shifts.photos | mutate:complete-import | always<br>capability.photos.requested | pop:shifts |
| shift | push | shifts | parent:shifts<br>permission:shift.push<br>permission:shift.calendar | present:null<br>present:null<br>present:null<br>navigate:open-checkin<br>permission:push<br>permission:remotenotif<br>permission:calendar | capability.push.requested<br>capability.calendar.requested | pop:shifts |
| checkin | sheet | shift | parent:shift<br>action:shift.open-checkin<br>permission:checkin.wifiinfo | present:null<br>navigate:open-netqr<br>permission:wifiinfo | always<br>capability.wifiinfo.requested | dismiss:shift; interactive-or-action:shift |
| netqr | push | checkin | parent:checkin<br>action:checkin.open-netqr<br>permission:netqr.hotspot | present:null<br>navigate:open-scan<br>permission:hotspot | always<br>capability.hotspot.requested | pop:checkin |
| scan | push | netqr | parent:netqr<br>action:netqr.open-scan | mutate:complete-scan | always | pop:netqr |
| handover | push | shift | parent:shift | present:null<br>navigate:open-shoot<br>permission:camera | none | pop:shift |
| shoot | push | handover | parent:handover<br>action:handover.open-shoot<br>permission:handover.camera | mutate:complete-shoot | always<br>capability.camera.requested | pop:handover |
| brief | push | shift | parent:shift | present:null<br>present:null<br>navigate:open-record<br>permission:mic<br>permission:speech<br>permission:audio | none | pop:shift |
| record | sheet | brief | parent:brief<br>action:brief.open-record<br>permission:brief.mic<br>permission:brief.speech | mutate:complete-record | always<br>capability.mic.requested<br>capability.speech.requested | dismiss:brief; interactive-or-action:brief |
| player | push | brief | parent:brief<br>permission:brief.audio | mutate:complete-player | capability.audio.requested | pop:brief |
| swaps | tab | — | tab:swaps | present:null<br>navigate:open-swap | session.authenticated | none:none |
| swap | push | swaps | parent:swaps<br>action:swaps.open-swap | mutate:complete-swap | always | pop:swaps |
| people | tab | — | tab:people | present:null<br>present:null<br>navigate:open-mates<br>permission:contacts | session.authenticated | none:none |
| mates | push | people | parent:people<br>action:people.open-mates<br>permission:people.contacts | mutate:complete-mates | always<br>capability.contacts.requested | pop:people |
| person | push | people | parent:people | present:null<br>present:null<br>navigate:open-call<br>permission:voip | none | pop:people |
| call | push | person | parent:person<br>action:person.open-call<br>permission:person.voip | mutate:complete-call | always<br>capability.voip.requested | pop:person |
| chat | push | person | parent:person | present:null<br>navigate:open-lockscreen<br>permission:commnotif | none | pop:person |
| lockscreen | push | chat | parent:chat<br>action:chat.open-lockscreen<br>permission:chat.commnotif | mutate:complete-lockscreen | always<br>capability.commnotif.requested | pop:chat |
| menu | tab | — | tab:menu<br>permission:ads.tracking | present:null<br>present:null<br>present:null<br>present:null<br>navigate:open-lock<br>permission:faceid | session.authenticated<br>capability.tracking.requested | none:none |
| lock | push | menu | parent:menu<br>action:menu.open-lock<br>permission:menu.faceid | mutate:complete-lock | always<br>capability.faceid.requested | pop:menu |
| money | push | menu | parent:menu | mutate:complete-money | none | pop:menu |
| passwords | push | menu | parent:menu | present:null<br>navigate:open-fill<br>permission:autofill | none | pop:menu |
| fill | push | passwords | parent:passwords<br>action:passwords.open-fill<br>permission:passwords.autofill | mutate:complete-fill | always<br>capability.autofill.requested | pop:passwords |
| settings | push | menu | parent:menu | present:null<br>present:null<br>present:null<br>navigate:open-background<br>permission:fetch<br>permission:appgroups | none | pop:menu |
| background | push | settings | parent:settings<br>action:settings.open-background<br>permission:shift.remotenotif<br>permission:settings.fetch | mutate:complete-background<br>permission:bgtask | always<br>capability.remotenotif.requested<br>capability.fetch.requested | pop:settings |
| widget | push | settings | parent:settings<br>permission:settings.appgroups | mutate:complete-widget<br>permission:keychain | capability.appgroups.requested | pop:settings |
