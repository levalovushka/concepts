## Information architecture and navigation

**Navigation model.** Идентифицированные люди публикуют социальные единицы, находят их в ленте или профиле, отвечают через реакции и сообщения и возвращают вклад в граф.
**Reference fit.** Публикация образа естественно занимает место поста, автор и гардероб — профиля, ремикс — социального ответа, а обсуждение — сообщения.

**Deep links:** None declared.

| Surface | Presentation | Parent | Entry | Exit | Guards | Back / dismiss |
|---|---|---|---|---|---|---|
| phone | root | — | launch:application | present:null<br>navigate:continue-email | none | none:none |
| code | push | phone | parent:phone<br>action:phone.continue-email<br>action:codefail.retry-code | present:null<br>present:null<br>navigate:confirm-code | input.email.valid<br>input.code.complete | pop:phone |
| codefail | push | code | parent:code | navigate:retry-code | none | pop:code |
| home | tab | code | tab:home<br>parent:code<br>action:code.confirm-code | present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>navigate:open-feed-post<br>permission:location | session.authenticated<br>input.code.complete | none:none |
| search | tab | home | tab:search<br>parent:home | navigate:open-search-result | session.authenticated | none:none |
| notifications | push | home | parent:home | navigate:open-notification | none | pop:home |
| post | push | home | parent:home<br>action:home.open-feed-post<br>action:search.open-search-result<br>action:notifications.open-notification<br>action:wardrobe.open-saved-look | mutate:save-look | always | pop:home |
| nearby | push | services | parent:services<br>permission:home.location | present:null<br>navigate:open-nearby-event<br>request:enable-location | capability.location.requested | pop:services |
| clip | tab | home | tab:clip<br>parent:home | present:null<br>mutate:remix-clip | session.authenticated | none:none |
| create | push | home | parent:home<br>permission:create.photos<br>permission:create.speech | present:null<br>present:null<br>present:null<br>navigate:open-camera<br>permission:camera<br>permission:photos<br>permission:speech | capability.photos.requested<br>capability.speech.requested | pop:home |
| camera | cover | create | parent:create<br>action:create.open-camera<br>permission:create.camera | request:capture-photo | always<br>capability.camera.requested | dismiss:create; interactive-or-action:create |
| media | system | create | parent:create |  | none | system-return:create |
| chats | tab | — | tab:chats | present:null<br>navigate:open-chat | session.authenticated | none:none |
| chat | push | chats | parent:chats<br>action:chats.open-chat<br>permission:chat.mic<br>permission:chat.commnotif | present:null<br>present:null<br>mutate:send-message<br>permission:mic<br>permission:commnotif<br>permission:voip | always<br>capability.mic.requested<br>capability.commnotif.requested | pop:chats |
| voice | sheet | chat | parent:chat | mutate:send-voice | none | dismiss:chat; interactive-or-action:chat |
| profile | push | home | parent:home<br>action:mates.open-contact-profile<br>permission:widget.keychain<br>permission:ads.tracking | present:null<br>mutate:edit-bio<br>permission:contacts | always<br>capability.keychain.requested<br>capability.tracking.requested | pop:home |
| services | tab | home | tab:services<br>parent:home | present:null<br>present:null<br>present:null<br>navigate:open-wardrobe | session.authenticated | none:none |
| settings | push | services | parent:services<br>permission:settings.push<br>permission:settings.remotenotif<br>permission:settings.fetch<br>permission:settings.appgroups | present:null<br>present:null<br>present:null<br>present:null<br>present:null<br>mutate:toggle-background-feed<br>permission:push<br>permission:remotenotif<br>permission:fetch<br>permission:appgroups<br>permission:autofill<br>permission:faceid<br>permission:shareext | capability.push.requested<br>capability.remotenotif.requested<br>capability.fetch.requested<br>capability.appgroups.requested | pop:services |
| widget | system | settings | parent:settings | permission:keychain | none | system-return:settings |
| fill | system | settings | parent:settings<br>permission:settings.autofill |  | capability.autofill.requested | system-return:settings |
| mates | push | profile | parent:profile<br>permission:profile.contacts | navigate:open-contact-profile | capability.contacts.requested | pop:profile |
| wardrobe | push | services | parent:services<br>action:services.open-wardrobe | navigate:open-saved-look | always | pop:services |
| event | push | nearby | parent:nearby<br>action:nearby.open-nearby-event | mutate:join-event | always | pop:nearby |
| ads | sheet | settings | parent:settings | dismiss:dismiss-ads-explanation<br>permission:tracking | none | dismiss:settings; interactive-or-action:settings |
| lock | push | settings | parent:settings<br>permission:settings.faceid | request:request-face-id | capability.faceid.requested | pop:settings |
| subtitles | push | create | parent:create | mutate:publish-captioned-clip | none | pop:create |
| talk | push | home | parent:home<br>action:background.return-to-talk | present:null<br>request:start-background-audio<br>permission:audio | always | pop:home |
| background | cover | talk | parent:talk<br>permission:talk.audio | navigate:return-to-talk | capability.audio.requested | dismiss:talk; interactive-or-action:talk |
| call | state | chat | parent:chat<br>permission:chat.voip |  | capability.voip.requested | none:none |
| swap | push | clip | parent:clip<br>permission:swap.calendar | present:null<br>request:add-swap-calendar<br>permission:calendar | capability.calendar.requested | pop:clip |
| checkin | push | swap | parent:swap<br>permission:checkin.wifiinfo | present:null<br>request:confirm-swap-checkin<br>permission:wifiinfo | capability.wifiinfo.requested | pop:swap |
| netqr | sheet | checkin | parent:checkin<br>permission:netqr.hotspot | request:join-venue-network<br>permission:hotspot | capability.hotspot.requested | dismiss:checkin; interactive-or-action:checkin |
