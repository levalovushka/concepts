## Information architecture and navigation

**Navigation model.** Продукт сохраняет идентифицированные связи и коммуникацию, но строит собственную задачно-ориентированную навигацию.
**Reference fit.** Идентифицированная связь ученика и инструктора использует сообщения и вызовы, но собственная навигация остаётся учебной, без социальной ленты.

**Deep links:** None declared.

| Surface | Presentation | Parent | Entry | Exit | Guards | Back / dismiss |
|---|---|---|---|---|---|---|
| phone | root | — | launch:application | present:null<br>navigate:open-code | none | none:none |
| code | push | phone | parent:phone<br>action:phone.open-code | present:null<br>navigate:open-codefail | always | pop:phone |
| codefail | push | code | parent:code<br>action:code.open-codefail | mutate:complete-codefail | always | pop:code |
| lessons | tab | — | tab:lessons<br>permission:bg.fetch<br>permission:widget.keychain | present:null<br>navigate:open-lesson | session.authenticated<br>capability.fetch.requested<br>capability.keychain.requested | none:none |
| lesson | push | lessons | parent:lessons<br>action:lessons.open-lesson<br>permission:lesson.calendar | present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>navigate:open-call<br>permission:voip<br>permission:camera<br>permission:location<br>permission:calendar | always<br>capability.calendar.requested | pop:lessons |
| call | cover | lesson | parent:lesson<br>action:lesson.open-call<br>permission:lesson.voip | mutate:complete-call | always<br>capability.voip.requested | dismiss:lesson; interactive-or-action:lesson |
| pickup | push | lesson | parent:lesson<br>permission:lesson.location | mutate:complete-pickup | capability.location.requested | pop:lesson |
| scan | cover | lesson | parent:lesson<br>permission:lesson.camera | mutate:complete-scan | capability.camera.requested | dismiss:lesson; interactive-or-action:lesson |
| drive | push | lesson | parent:lesson | present:null<br>navigate:open-note<br>permission:mic<br>permission:speech | none | pop:lesson |
| note | push | drive | parent:drive<br>action:drive.open-note<br>permission:drive.mic<br>permission:drive.speech | mutate:complete-note | always<br>capability.mic.requested<br>capability.speech.requested | pop:drive |
| reschedule | sheet | lesson | parent:lesson | mutate:complete-reschedule | none | dismiss:lesson; interactive-or-action:lesson |
| chat | push | lesson | parent:lesson | present:null<br>navigate:open-lockscreen<br>permission:commnotif | none | pop:lesson |
| lockscreen | system | chat | parent:chat<br>action:chat.open-lockscreen<br>permission:chat.commnotif |  | always<br>capability.commnotif.requested | system-return:chat |
| notif | push | menu | parent:menu<br>action:menu.open-notif<br>permission:notif.push | mutate:complete-notif<br>permission:push | always<br>capability.push.requested | pop:menu |
| theory | tab | — | tab:theory<br>permission:bg.bgtask | present:null<br>present:null<br>present:null<br>navigate:open-ticket | session.authenticated<br>capability.bgtask.requested | none:none |
| ticket | push | theory | parent:theory<br>action:theory.open-ticket | present:null<br>navigate:open-player | always | pop:theory |
| player | cover | ticket | parent:ticket<br>action:ticket.open-player | present:null<br>navigate:open-background<br>permission:audio | always | dismiss:ticket; interactive-or-action:ticket |
| background | system | player | parent:player<br>action:player.open-background<br>permission:player.audio |  | always<br>capability.audio.requested | system-return:player |
| checklist | push | theory | parent:theory | mutate:complete-checklist | none | pop:theory |
| classroom | push | theory | parent:theory<br>permission:attend.wifiinfo | present:null<br>present:null<br>navigate:open-attend | capability.wifiinfo.requested | pop:theory |
| attend | push | classroom | parent:classroom<br>action:classroom.open-attend | mutate:complete-attend<br>permission:wifiinfo | always | pop:classroom |
| guestnet | push | classroom | parent:classroom<br>permission:guestnet.hotspot | present:null<br>navigate:open-scanwifi<br>permission:hotspot | capability.hotspot.requested | pop:classroom |
| scanwifi | cover | guestnet | parent:guestnet<br>action:guestnet.open-scanwifi | mutate:complete-scanwifi | always | dismiss:guestnet; interactive-or-action:guestnet |
| menu | tab | — | tab:menu<br>permission:ads.tracking | present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>navigate:open-notif<br>permission:appgroups | session.authenticated<br>capability.tracking.requested | none:none |
| docs | push | menu | parent:menu<br>permission:docs.photos | mutate:complete-docs<br>permission:photos | capability.photos.requested | pop:menu |
| lock | push | menu | parent:menu<br>permission:lock.faceid | mutate:complete-lock<br>permission:faceid | capability.faceid.requested | pop:menu |
| passwords | push | menu | parent:menu | present:null<br>navigate:open-fill<br>permission:autofill | none | pop:menu |
| fill | system | passwords | parent:passwords<br>action:passwords.open-fill<br>permission:passwords.autofill |  | always<br>capability.autofill.requested | system-return:passwords |
| widget | system | menu | parent:menu<br>permission:bg.remotenotif<br>permission:menu.appgroups | permission:keychain | capability.remotenotif.requested<br>capability.appgroups.requested | system-return:menu |
| bg | push | menu | parent:menu | mutate:complete-bg<br>permission:fetch<br>permission:remotenotif<br>permission:bgtask | none | pop:menu |
| ads | push | menu | parent:menu | mutate:complete-ads<br>permission:tracking | none | pop:menu |
