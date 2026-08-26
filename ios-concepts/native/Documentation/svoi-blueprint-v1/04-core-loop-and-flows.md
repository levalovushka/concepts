# Core loop and critical flows

**Core loop:** create_deed — Создан черновик дела. → edit_deed_text — Сохранены результат и описание дела. → publish_deed — Дело опубликовано в ленте со статусом active. → support_deed — Текущий пользователь добавлен в supporters; счётчик поддержки увеличен один раз.

**Return reason:** Обновления и предложения помощи возвращают подписчиков к развивающейся истории; доказательство завершения и эстафета создают следующий авторский пост.

| Flow | Start | Actions | Outcome |
|---|---|---|---|
| Пользователь публикует конкретное дело | create | create_deed → edit_deed_text → choose_deed_photo → choose_deed_place → publish_deed | Новое active-дело появляется первым среди дел близкого круга с импортированным фото и местом. |
| Друг поддерживает дело, предлагает помощь и подписывается | feed | support_deed → offer_help → follow_result | У deed-bench увеличена поддержка, создан contribution kind=offer и user-marina записан в followers. |
| Отказ в tracking не влияет на основной цикл | settings | enable_promotion_measurement → open_feed → support_deed | Сохраняется contextualOnly, лента не меняет порядок, поддержка дела работает. |
