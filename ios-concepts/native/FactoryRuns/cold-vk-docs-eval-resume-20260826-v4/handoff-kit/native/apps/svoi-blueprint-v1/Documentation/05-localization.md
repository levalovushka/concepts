# Локализация

| Ключ | Русская строка | Контекст | Экраны |
|---|---|---|---|
| auth.title | Вход | Заголовок входа | login |
| auth.email | Почта | Поле почты для локального кода | login |
| auth.send | Получить код | Запрос кода входа | login |
| auth.code | Код из письма | Поле кода; в локальной сборке код показан рядом | login |
| auth.enter | Войти | Проверка кода | login |
| feed.title | Лента | Первая вкладка | feed |
| feed.notifications | Уведомления | Открывает центр уведомлений | feed |
| deed.support | Поддержать | Однократная реакция поддержки | feed, post_detail |
| deed.help | Предложить помощь | Создание конкретного предложения | feed, post_detail |
| deed.follow | Следить за результатом | Подписка на изменения | feed, post_detail |
| deed.comments | Комментарии | Открытие отдельной ветки | feed, post_detail |
| deed.share | Продолжить у себя | Публикация со ссылкой на исходное дело | feed, post_detail |
| deed.save | Сохранить | Добавление в сохранённые | feed, post_detail |
| comment.placeholder | Напишите по делу | Поле комментария | comments |
| comment.send | Отправить | Публикация комментария или сообщения | comments, conversation |
| create.title | Новое дело | Третья вкладка | create |
| create.result | Какой результат должен появиться? | Главное поле дела | create |
| create.details | Что уже известно и где нужна помощь? | Описание дела | create |
| media.camera | Снять фото | Открытие камеры | create, complete |
| media.library | Выбрать фото | Открытие медиатеки | create, complete |
| media.voice | Записать голосом | Начало записи | create, post_detail |
| place.add | Добавить место | Выбор места дела | create |
| deed.publish | Опубликовать дело | Публикация валидного черновика | create |
| deed.update | Добавить обновление | Новое обновление | post_detail |
| deed.contribution | Добавить свой вклад | Фиксация помощи участника | post_detail |
| deed.complete | Завершить с доказательством | Переход к завершению | post_detail |
| deed.thank | Поблагодарить помощников | Выбор участников после завершения | complete |
| deed.baton | Забрать продолжение | Создание связанного черновика | post_detail |
| search.title | Поиск | Вторая вкладка | search |
| search.placeholder | Дела, люди и сообщества | Поле поиска без декоративных фильтров | search |
| messages.title | Сообщения | Четвёртая вкладка | messages |
| call.start | Позвонить | Локальный CallKit-звонок | conversation |
| profile.title | Профиль | Пятая вкладка | profile |
| profile.saved | Сохранённые | Список сохранённых дел | profile |
| profile.settings | Настройки | Настройки продукта | profile |
| profile.private | Приватные дела | Защищённый список | profile |
| settings.accesses | Доступы | Сводка системных доступов без кнопок запроса | settings, accesses |
| settings.contacts | Найти своих в контактах | Контекстный импорт | settings |
| settings.messages | Уведомления о сообщениях | Коммуникационные уведомления | settings |
| settings.digest | Дайджест изменений | Фоновая подготовка дайджеста | settings |
| settings.measurement | Измерять продвигаемые публикации | Отдельная добровольная настройка tracking | settings |
| settings.credential | Сохранить способ входа | Credential Provider | settings |
| speech.transcribe | Расшифровать | Преобразование голоса в текст | post_detail |
| calendar.add | Добавить срок в календарь | Создание события | post_detail |
| network.join | Подключиться к сети площадки | Подключение к опубликованной сети | post_detail |
| network.verify | Подтвердить площадку по сети | Проверка текущего SSID | post_detail |
| error.required | Опишите конкретный результат. | Ошибка пустого дела | create |
| empty.notifications | Здесь появятся изменения дел, за которыми вы следите. | Пустой центр уведомлений | notifications |
| empty.search | Ничего не найдено. Попробуйте имя или часть результата. | Пустой поиск | search |
| screen.saved.title | Сохранённые | Заголовок экрана Сохранённые | saved |
| screen.saved.empty | Здесь пока ничего нет | Пустое состояние экрана Сохранённые | saved |
| screen.private_deeds.title | Приватные дела | Заголовок экрана Приватные дела | private_deeds |
| screen.private_deeds.empty | Здесь пока ничего нет | Пустое состояние экрана Приватные дела | private_deeds |

Renderer не должен изобретать пользовательские термины вне этого каталога. Fixture-контент хранится отдельно от UI copy.
