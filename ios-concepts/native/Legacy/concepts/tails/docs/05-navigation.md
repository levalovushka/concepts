## Information architecture and navigation

**Navigation model.** Идентифицированные люди публикуют социальные единицы, отвечают, переписываются и возвращаются через знакомую плотную структуру VK.
**Reference fit.** Питомец естественно становится профилем, Момент — социальной единицей, а Прогулка — ответом и перепиской в узнаваемой модели VK.

**Deep links:** None declared.

| Surface | Presentation | Parent | Entry | Exit | Guards | Back / dismiss |
|---|---|---|---|---|---|---|
| phone | root | — | launch:application | present:null<br>navigate:open-code | none | none:none |
| code | push | phone | parent:phone<br>action:phone.open-code | present:null<br>navigate:open-codefail | always | pop:phone |
| codefail | push | code | parent:code<br>action:code.open-codefail | mutate:complete-codefail | always | pop:code |
| home | tab | — | tab:home<br>permission:refresh.bgtask<br>permission:widget.keychain | present:null<br>present:null<br>present:null<br>navigate:open-pet<br>permission:location | session.authenticated<br>capability.bgtask.requested<br>capability.keychain.requested | none:none |
| pet | push | home | parent:home<br>action:home.open-pet | present:null<br>present:null<br>navigate:open-vetnote<br>permission:speech | always | pop:home |
| nearby | tab | — | tab:nearby<br>permission:home.location | present:null<br>navigate:open-walk | session.authenticated<br>capability.location.requested | none:none |
| walk | push | nearby | parent:nearby<br>action:nearby.open-walk<br>permission:walk.remotenotif<br>permission:walk.wifiinfo | present:null<br>navigate:open-netqr<br>permission:remotenotif<br>permission:wifiinfo | always<br>capability.remotenotif.requested<br>capability.wifiinfo.requested | pop:nearby |
| create | tab | — | tab:create | present:null<br>present:null<br>navigate:open-camera<br>permission:camera<br>permission:photos | session.authenticated | none:none |
| camera | cover | create | parent:create<br>action:create.open-camera<br>permission:create.camera | mutate:complete-camera | always<br>capability.camera.requested | dismiss:create; interactive-or-action:create |
| media | push | create | parent:create<br>permission:create.photos | mutate:complete-media | capability.photos.requested | pop:create |
| places | push | home | parent:home | mutate:complete-places | none | pop:home |
| chats | tab | — | tab:chats | present:null<br>navigate:open-chat | session.authenticated | none:none |
| chat | push | chats | parent:chats<br>action:chats.open-chat<br>permission:chat.commnotif | present:null<br>present:null<br>navigate:open-voice<br>permission:mic<br>permission:commnotif<br>permission:voip | always<br>capability.commnotif.requested | pop:chats |
| voice | sheet | chat | parent:chat<br>action:chat.open-voice<br>permission:chat.mic | mutate:complete-voice | always<br>capability.mic.requested | dismiss:chat; interactive-or-action:chat |
| profile | tab | — | tab:profile<br>permission:ads.tracking | present:null<br>present:null<br>navigate:open-settings<br>permission:contacts | session.authenticated<br>capability.tracking.requested | none:none |
| settings | push | profile | parent:profile<br>action:profile.open-settings<br>permission:settings.push<br>permission:settings.fetch | present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>navigate:open-widget<br>permission:push<br>permission:fetch<br>permission:appgroups<br>permission:autofill<br>permission:faceid<br>permission:shareext | always<br>capability.push.requested<br>capability.fetch.requested | pop:profile |
| widget | cover | settings | parent:settings<br>action:settings.open-widget<br>permission:settings.appgroups | mutate:complete-widget<br>permission:keychain | always<br>capability.appgroups.requested | dismiss:settings; interactive-or-action:settings |
| fill | cover | settings | parent:settings<br>permission:settings.autofill | mutate:complete-fill | capability.autofill.requested | dismiss:settings; interactive-or-action:settings |
| refresh | push | settings | parent:settings | mutate:complete-refresh<br>permission:bgtask | none | pop:settings |
| mates | push | profile | parent:profile<br>permission:profile.contacts | mutate:complete-mates | capability.contacts.requested | pop:profile |
| ads | sheet | settings | parent:settings | mutate:complete-ads<br>permission:tracking | none | dismiss:settings; interactive-or-action:settings |
| lock | push | settings | parent:settings<br>permission:settings.faceid | mutate:complete-lock | capability.faceid.requested | pop:settings |
| vetnote | push | pet | parent:pet<br>action:pet.open-vetnote<br>permission:pet.speech | mutate:complete-vetnote | always<br>capability.speech.requested | pop:pet |
| course | push | home | parent:home | present:null<br>navigate:open-background<br>permission:audio | none | pop:home |
| background | cover | course | parent:course<br>action:course.open-background<br>permission:course.audio | mutate:complete-background | always<br>capability.audio.requested | dismiss:course; interactive-or-action:course |
| call | cover | chat | parent:chat<br>permission:chat.voip | mutate:complete-call | capability.voip.requested | dismiss:chat; interactive-or-action:chat |
| vaccine | push | pet | parent:pet<br>permission:vaccine.calendar | mutate:complete-vaccine<br>permission:calendar | capability.calendar.requested | pop:pet |
| netqr | sheet | walk | parent:walk<br>action:walk.open-netqr<br>permission:netqr.hotspot | mutate:complete-netqr<br>permission:hotspot | always<br>capability.hotspot.requested | dismiss:walk; interactive-or-action:walk |
| shareext | sheet | settings | parent:settings<br>permission:settings.shareext | mutate:complete-shareext | capability.shareext.requested | dismiss:settings; interactive-or-action:settings |
