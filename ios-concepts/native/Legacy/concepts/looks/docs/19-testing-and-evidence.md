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
- code--default
- code--loading
- code--error
- codefail--default
- codefail--loading
- codefail--error
- home--default
- home--empty
- search--default
- search--query
- search--empty
- search--loading
- notifications--unread
- notifications--read
- notifications--empty
- post--default
- nearby--default
- nearby--empty
- clip--default
- create--default
- create--error
- create--success
- camera--default
- camera--denied
- media--default
- chats--default
- chats--empty
- chat--default
- voice--default
- voice--denied
- profile--default
- services--default
- services--loading
- settings--default
- widget--default
- fill--default
- mates--default
- mates--empty
- mates--denied
- wardrobe--populated
- wardrobe--empty
- wardrobe--loading
- event--available
- event--joined
- event--cancelled
- ads--default
- lock--default
- lock--denied
- subtitles--default
- subtitles--error
- subtitles--success
- talk--default
- talk--loading
- talk--error
- background--default
- background--loading
- background--error
- call--default
- swap--default
- checkin--default
- checkin--error
- checkin--denied
- netqr--default
- netqr--error
- shareext--default
- shareext--success

**Evidence provenance**

- approved-product-direction · user-input · approved · concepts/looks/concept.json: accepted product, positioning, and scope before this selection review
- implemented-native-observation · experiment · observed · native/apps/looks plus deterministic action, replay, capture, and build checks
- vk-reference-profile · reference-profile · approved · native/ReferenceProfiles/vk-ios/profile.json and its declared screenshot evidence
- market-validation-needed · assumption · needs-validation · Product hypotheses in concepts/looks/concept.json require interviews and a live cohort pilot
