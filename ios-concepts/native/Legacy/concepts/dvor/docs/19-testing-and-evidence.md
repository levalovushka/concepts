## Testing, evidence, and capture plan

**Levels**

- Product artifact reproduction
- UX contract and interaction replay
- Swift and XCUI smoke
- Deterministic capture comparison
- Independent product and visual review

**Evidence**

- Не повышать статус market-validation-needed без источника
- Разделять реализованность, reference evidence и пользовательский спрос
- Записывать provenance каждого нового продуктового утверждения

**Capture identifiers**

- phone--default
- phone--loading
- phone--error
- join--default
- join--searching
- join--denied
- verify--default
- verify--checking
- verify--success
- verify--mismatch
- verify--denied
- manual--default
- manual--submitted
- manual--error
- home--default
- home--empty
- home--loading
- home--liked
- home--poll
- home--poll-voted
- home--end
- createpost--default
- createpost--error
- notifications--default
- notifications--empty
- post--default
- post--following
- post--resolved
- problem--default
- problem--submitting
- problem--success
- problem--error
- shoot--default
- shoot--denied
- chronicle--default
- chronicle--scanning
- chronicle--populated
- chronicle--selected
- chronicle--empty
- chronicle--denied
- chats--default
- chats--empty
- chats--loading
- chat--default
- chat--empty
- voice--default
- voice--recording
- voice--transcribing
- voice--ready
- voice--denied
- lockscreen--default
- lockscreen--fallback
- yard--default
- guest--default
- guest--connecting
- guest--connected
- guest--error
- scan--default
- scan--denied
- scan--error
- meters--default
- meters--editing
- meters--submitted
- meters--error
- background--current
- background--stale
- background--error
- events--default
- events--empty
- events--added
- events--error
- menu--default
- passwords--default
- passwords--populated
- passwords--empty
- passwords--locked
- fill--default
- fill--empty
- neighbors--default
- neighbors--empty
- neighbors--denied
- profile--default
- settings--default
- ads--default
- ads--accepted
- ads--declined
- lock--locked
- lock--unlocked
- lock--fallback
- widget--current
- widget--stale
- widget--empty
- pending--default

**Evidence provenance**

- approved-product-direction · user-input · approved · concepts/dvor/concept.json: accepted product, positioning, and scope before this selection review
- implemented-native-observation · experiment · observed · native/apps/dvor plus deterministic action, replay, capture, and build checks
- vk-reference-profile · reference-profile · approved · native/ReferenceProfiles/vk-ios/profile.json and its declared screenshot evidence
- market-validation-needed · assumption · needs-validation · Product hypotheses in concepts/dvor/concept.json require interviews and a live cohort pilot
