## Information architecture and navigation

**Navigation model.** Идентифицированные люди публикуют социальные единицы, находят их в ленте или профиле, отвечают через реакции и сообщения и возвращают вклад в граф.
**Reference fit.** Дело дома естественно читается как публикация, жилец — как профиль, обсуждение — как чат, а адресный граф ограничивает знакомые VK-паттерны одним House.

**Deep links:** None declared.

| Surface | Presentation | Parent | Entry | Exit | Guards | Back / dismiss |
|---|---|---|---|---|---|---|
| phone | root | — | launch:application | present:null<br>present:null<br>navigate:continue-email | none | none:none |
| code | push | phone | parent:phone<br>action:phone.continue-email<br>action:codefail.complete-codefail | present:null<br>navigate:confirm-code | input.email.valid<br>always | pop:phone |
| codefail | push | code | parent:code | navigate:complete-codefail | none | pop:code |
| join | push | phone | parent:phone<br>action:code.confirm-code | present:null<br>present:null<br>request:verify-location<br>navigate:manual-address<br>permission:location | input.code.complete | pop:phone |
| verify | sheet | join | parent:join<br>permission:join.location | request:verify-network<br>navigate:manual-verification<br>permission:wifiinfo | capability.location.requested | dismiss:join; interactive-or-action:join |
| manual | push | join | parent:join<br>action:join.manual-address<br>action:verify.manual-verification | mutate:submit-residence | always | pop:join |
| home | tab | — | tab:home<br>permission:verify.wifiinfo<br>permission:widget.keychain | present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>navigate:create-post<br>navigate:open-notifications<br>navigate:open-post<br>mutate:like-post<br>external:share-post<br>permission:photos | session.authenticated<br>capability.wifiinfo.requested<br>capability.keychain.requested | none:none |
| createpost | sheet | home | parent:home<br>action:home.create-post | mutate:publish-post<br>dismiss:cancel-post<br>mutate:change-type<br>request:add-photo | always | dismiss:home; interactive-or-action:home |
| notifications | push | home | parent:home<br>action:home.open-notifications | navigate:open-source<br>mutate:mark-all-read | always | pop:home |
| post | push | home | parent:home<br>action:home.open-post<br>action:notifications.open-source<br>action:yard.open-incident<br>permission:post.push | mutate:follow-post<br>navigate:open-house-chat<br>mutate:send-comment<br>permission:push | always<br>capability.push.requested | pop:home |
| problem | sheet | home | parent:home | present:null<br>mutate:submit-problem<br>request:add-evidence<br>dismiss:cancel-problem<br>permission:camera | none | dismiss:home; interactive-or-action:home |
| shoot | system | problem | parent:problem<br>permission:problem.camera |  | capability.camera.requested | system-return:problem |
| chronicle | push | home | parent:home<br>permission:home.photos | request:select-photos<br>mutate:share-chronicle | capability.photos.requested | pop:home |
| chats | tab | — | tab:chats | present:null<br>navigate:open-chat | session.authenticated | none:none |
| chat | push | chats | parent:chats<br>action:post.open-house-chat<br>action:chats.open-chat<br>action:profile.open-neighbor-chat | present:null<br>present:null<br>mutate:send-message<br>request:attach-photo<br>request:record-voice<br>permission:mic<br>permission:speech<br>permission:commnotif | always | pop:chats |
| voice | sheet | chat | parent:chat<br>permission:chat.mic<br>permission:chat.speech | mutate:send-voice<br>dismiss:cancel-voice | capability.mic.requested<br>capability.speech.requested | dismiss:chat; interactive-or-action:chat |
| lockscreen | system | chat | parent:chat<br>permission:chat.commnotif |  | capability.commnotif.requested | system-return:chat |
| yard | tab | — | tab:yard | present:null<br>present:null<br>present:null<br>navigate:open-incident<br>navigate:open-yard-event<br>navigate:open-guest<br>navigate:open-meters<br>navigate:open-events | session.authenticated | none:none |
| guest | push | yard | parent:yard<br>action:yard.open-guest<br>permission:guest.hotspot | present:null<br>request:connect-guest<br>request:scan-guest-qr<br>permission:hotspot | always<br>capability.hotspot.requested | pop:yard |
| scan | system | guest | parent:guest |  | none | system-return:guest |
| meters | push | yard | parent:yard<br>action:yard.open-meters<br>permission:background.bgtask | present:null<br>mutate:save-readings<br>request:enable-reminder<br>permission:remotenotif | always<br>capability.bgtask.requested | pop:yard |
| background | system | meters | parent:meters<br>permission:meters.remotenotif<br>permission:settings.fetch | permission:bgtask | capability.remotenotif.requested<br>capability.fetch.requested | system-return:meters |
| events | push | yard | parent:yard<br>action:yard.open-yard-event<br>action:yard.open-events<br>permission:events.calendar | request:add-calendar<br>permission:calendar | always<br>capability.calendar.requested | pop:yard |
| menu | tab | — | tab:menu<br>permission:ads.tracking | present:null<br>present:null<br>present:null<br>present:null<br>navigate:open-access<br>navigate:open-neighbors<br>navigate:open-settings<br>permission:contacts | session.authenticated<br>capability.tracking.requested | none:none |
| passwords | push | menu | parent:menu<br>action:menu.open-access | present:null<br>request:unlock-access<br>permission:autofill | always | pop:menu |
| fill | system | passwords | parent:passwords<br>permission:passwords.autofill |  | capability.autofill.requested | system-return:passwords |
| neighbors | push | menu | parent:menu<br>action:menu.open-neighbors<br>permission:menu.contacts | request:match-contacts<br>navigate:open-neighbor | always<br>capability.contacts.requested | pop:menu |
| profile | push | menu | parent:menu<br>action:neighbors.open-neighbor | navigate:open-neighbor-chat | always | pop:menu |
| settings | push | menu | parent:menu<br>action:menu.open-settings | present:null<br>present:null<br>present:null<br>request:enable-app-lock<br>navigate:open-personalization<br>request:enable-background-updates<br>permission:fetch<br>permission:appgroups<br>permission:faceid | always | pop:menu |
| ads | sheet | settings | parent:settings<br>action:settings.open-personalization | request:enable-personalization<br>mutate:decline-personalization<br>permission:tracking | always | dismiss:settings; interactive-or-action:settings |
| lock | system | settings | parent:settings<br>permission:settings.faceid |  | capability.faceid.requested | system-return:settings |
| widget | system | settings | parent:settings<br>permission:settings.appgroups | permission:keychain | capability.appgroups.requested | system-return:settings |
