## Screen, state, and action matrix

| Surface | Product task | Presentation | States | Actions |
|---|---|---|---|---|
| phone | Войти | root | default<br>loading<br>error | Продолжить → navigate:code |
| code | Подтвердить вход | push | default<br>loading<br>error | Продолжить → navigate:home |
| codefail | Показать ошибку OTP и вернуть к вводу | push | default<br>loading<br>error | Продолжить → navigate:code |
| home | Следить за авторами | tab | default<br>empty | Открыть публикацию → navigate:post |
| search | Найти образы, вещи и авторов | tab | default<br>query<br>empty<br>loading | Открыть результат → navigate:post |
| notifications | Вернуться к реакциям, комментариям и новым подпискам | push | unread<br>read<br>empty | Открыть уведомление → navigate:post |
| post | Обсудить образ | push | default | Сохранить образ → mutate:savedLooks |
| nearby | Найти своп или автора поблизости | push | default<br>empty | Смотреть подборку → navigate:event<br>Разрешить геопозицию → request |
| clip | Посмотреть серию | tab | default | Собрать свою версию → mutate:outfits |
| create | Опубликовать момент | push | default<br>error<br>success | Снять образ → navigate:camera |
| camera | Снять момент | cover | default<br>denied | Сделать снимок → request |
| media | Выбрать фото | system | default | System/contract-owned outcome |
| chats | Вернуться к диалогам | tab | default<br>empty | Открыть диалог → navigate:chat |
| chat | Договориться | push | default | Отправить сообщение → mutate:localConversation |
| voice | Записать голос | sheet | default<br>denied | Отправить → mutate:localConversation |
| profile | Управлять профилем | push | default | Изменить информацию о себе → mutate:profileBio |
| services | Открыть гардероб, свопы, знакомых и настройки | tab | default<br>loading | Открыть гардероб → navigate:wardrobe |
| settings | Держать доступы и системные функции под рукой | push | default | Обновлять ленту в фоне → mutate:backgroundFeedEnabled |
| widget | Поставить виджет сохранённого образа на экран «Домой» | system | default | System/contract-owned outcome |
| fill | Войти на сайт марки сохранённым в «Образах» входом | system | default | System/contract-owned outcome |
| mates | Найти знакомых среди тех, кто уже публикует | push | default<br>empty<br>denied | Открыть профиль → navigate:profile |
| wardrobe | Управлять вещами, из которых собираются образы | push | populated<br>empty<br>loading | Открыть сохранённый образ → navigate:post |
| event | Проверить условия свопа и присоединиться | push | available<br>joined<br>cancelled | Присоединиться → mutate:joinedEvents |
| ads | Объяснить обмен до системного запроса ATT | sheet | default | Продолжить → dismiss |
| lock | Закрыть подборки и черновики биометрией | push | default<br>denied | Замок Face ID → request |
| subtitles | Собрать и поправить субтитры перед публикацией | push | default<br>error<br>success | Опубликовать клип → mutate:localPublishedClips |
| talk | Слушать разбор и продолжать в фоне | push | default<br>loading<br>error | Слушать → request |
| background | Показать, что звук продолжается при погашенном экране | cover | default<br>loading<br>error | Вернуться к разбору → navigate:talk |
| call | Договориться о встрече, не раскрывая номер | state | default | System/contract-owned outcome |
| swap | Собрать всё о свопе и положить дату в календарь | push | default | Добавить в Календарь → request |
| checkin | Подтвердить присутствие сетью площадки | push | default<br>error<br>denied | Отметиться на свопе → request |
| netqr | Подключиться к гостевой сети площадки | sheet | default<br>error | Подключиться → request |
