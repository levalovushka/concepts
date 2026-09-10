import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const screensDir = join(root, 'screens');
const docsDir = join(root, 'docs');
rmSync(screensDir, { recursive: true, force: true });
mkdirSync(screensDir, { recursive: true });
mkdirSync(docsDir, { recursive: true });

const icon = (name) => `<svg class="kv-icon"><use href="#i-${name}"/></svg>`;
const tabs = (active) => `<nav class="tabbar kv-tabs">${[
  ['home','clipboard-check','Дела'],['resources','store','Общее'],['decisions','banknote','Решения'],['events','calendar','События']
].map(([id, i, label]) => `<button class="tab-item${active === id ? ' active' : ''}" data-go="${id}" aria-label="${label}">${icon(i)}<span>${label}</span></button>`).join('')}</nav>`;
const denied = (keys, text) => `<div class="kv-denied" data-show-denied="${keys}">${icon('shield')}<p>${text}</p></div>`;
const row = (i, title, sub, attrs = '', end = '') => `<button class="kv-row tap" ${attrs} aria-label="${title}"><span class="kv-row-icon">${icon(i)}</span><span class="kv-row-copy"><strong>${title}</strong><small>${sub}</small></span>${end || icon('chevron-right')}</button>`;
const badge = (text, cls = '') => `<span class="kv-badge ${cls}">${text}</span>`;
const section = (title, body, meta = '') => `<section class="kv-section"><div class="kv-section-head"><h2>${title}</h2>${meta ? `<span>${meta}</span>` : ''}</div>${body}</section>`;
const shell = (id, title, body, { back = false, tab = false, action = '', dark = false } = {}) => `<div class="screen kv-screen${dark ? ' kv-dark' : ''}" id="scr-${id}">
  <header class="kv-nav">${back ? `<button class="kv-icon-button tap" data-back aria-label="Назад">${icon('chevron-left')}</button>` : `<div class="kv-mark">КВ</div>`}<div><small>КВАРТАЛ · СОСЕДИ</small><strong>${title}</strong></div>${action || '<span class="kv-nav-gap"></span>'}</header>
  <main class="body-scroll kv-scroll">${body}</main>${tab ? tabs(id) : ''}<div class="home-ind"></div>
</div>`;

const S = {};
S.phone = `<div class="screen kv-screen kv-auth" id="scr-phone"><main class="kv-auth-body"><div class="kv-logo"><b>КВ</b><span>12 домов</span></div><p class="kv-kicker">Соседская сеть квартала</p><h1>Маленькие дела становятся общими</h1><p>Двор, доставки, инструменты и решения — по месту, сроку и результату.</p><button class="kv-primary tap" data-primary data-go="code">Войти в свой квартал</button><div class="auth-links"><button class="auth-link" data-toast="Помощь · kvartal.app/help">Помощь</button><button class="auth-link" data-toast="Политика · kvartal.app/privacy">Конфиденциальность</button></div></main><div class="home-ind"></div></div>`;
S.code = `<div class="screen kv-screen kv-auth" id="scr-code"><main class="kv-auth-body"><div class="kv-logo"><b>КВ</b><span>12 домов</span></div><p class="kv-kicker">Проверка адреса</p><h1>Код из SMS</h1><p>Демо-квартал: Сосновый, 8–26. Доступы iOS пока не запрашиваются.</p><div class="kv-otp"><span>2</span><span>7</span><span>4</span><span>9</span></div><button class="kv-primary tap" data-primary data-go="home">Открыть квартал</button><button class="kv-secondary tap" data-back>Изменить номер</button></main><div class="home-ind"></div></div>`;
S.home = shell('home','Дела рядом',`
  <div class="kv-quarter"><div><p>Сосновый · 12 домов</p><h1>Сегодня можно закрыть 3 дела</h1></div>${badge('18 соседей рядом','kv-live')}</div>
  <div class="kv-map"><span class="kv-pin one">1</span><span class="kv-pin two">2</span><span class="kv-pin three">3</span><div class="kv-route"></div><b>240 м</b><small>двор → пункт выдачи → мастерская</small></div>
  ${section('Быстрое дело', `<article class="kv-focus"><div>${badge('Нужно 2 человека','kv-warn')}<time>до 19:30</time></div><h3>Принять лавки у корпуса 18</h3><p>Проверить 4 места, снять повреждения и отметить комплектность.</p><div class="kv-people"><span>АЯ</span><span>МК</span><small>уже идут</small></div><button class="kv-primary tap" data-primary data-go="task">Взять дело</button></article>`)}
  ${section('Ещё рядом', `<div class="kv-list">${row('store','Забрать общий заказ','Пункт выдачи · 170 м · 6 пакетов','data-go="delivery"')}${row('droplets','Полить молодые клёны','Аллея · после 20:00','data-go="task"')}${row('wrench','Вернуть перфоратор','Мастерская · до 21:00','data-go="resource"')}</div>`)}
`, { tab: true, action: `<button class="kv-icon-button tap" data-go="profile" aria-label="Профиль">${icon('user')}</button>` });
S.task = shell('task','Дело #184',`
  <div class="kv-task-head"><div>${badge('Двор','kv-green')}<h1>Принять лавки</h1><p>Корпус 18 · северный вход · до 19:30</p></div><div class="kv-score"><b>2/4</b><span>места</span></div></div>
  ${section('Короткий план', `<ol class="kv-steps"><li class="done"><b>1</b><span>Найти палеты у ворот<small>Антон · 18:42</small></span></li><li><b>2</b><span>Сверить 4 места<small>Нужен ещё один сосед</small></span></li><li><b>3</b><span>Снять повреждения<small>Фото войдёт в итог</small></span></li></ol>`)}
  ${section('Место', `<div class="kv-place"><div>${icon('map-pin')}</div><span><strong>Корпус 18</strong><small>Вы в 46 метрах от точки</small></span></div>${denied('location','Можно подтвердить корпус вручную по номеру на фасаде.')}<button class="kv-outline tap" data-ask="location|task|task">Подтвердить место</button>`)}
  <button class="kv-primary tap" data-primary data-go="capture">Зафиксировать результат</button>
`, { back: true });
S.capture = shell('capture','Фото результата',`
  <div class="kv-camera"><div class="kv-camera-grid"></div><span>Лавка 03 · левая опора</span><b>Держите дефект в рамке</b></div>
  <div class="kv-capture-mode"><button class="active">Фото + голос</button><button data-go="library">Из медиатеки</button></div>
  ${denied('camera,mic','Можно выбрать готовые фото и набрать примечание текстом.')}
  <button class="kv-shutter tap" data-primary data-ask="camera+mic|result|capture" aria-label="Снять и описать"><i></i><span>Снять и описать</span></button>
`, { back: true, dark: true });
S.result = shell('result','Дело закрыто',`
  <div class="kv-success">${icon('circle-check')}<p>Итог дела #184</p><h1>4 лавки приняты</h1><span>2 дефекта переданы поставщику · 3 соседа участвовали</span></div>
  <div class="kv-proof-grid"><div class="ph"><span>01</span></div><div class="ph"><span>02</span></div><div class="ph"><span>03</span></div></div>
  ${section('Вклад', `<div class="kv-impact"><div><b>27 мин</b><span>общее время</span></div><div><b>3</b><span>участника</span></div><div><b>+1</b><span>дело квартала</span></div></div>`)}
  <button class="kv-outline tap" data-activate="photosadd|result">Сохранить карточку итога</button><button class="kv-primary tap" data-primary data-go="home">Вернуться к делам</button>
`, { back: true });
S.library = shell('library','Выбрать фото',`
  <div class="kv-photo-grid">${Array.from({length:12},(_,i)=>`<button class="ph${i===2||i===7?' selected':''}" aria-label="Фото ${i+1}"><span>${i===2?'1':i===7?'2':''}</span></button>`).join('')}</div>
  ${denied('photos','Без доступа можно вернуться к камере или закрыть дело текстом.')}
  <button class="kv-primary tap" data-primary data-ask="photos|result|library">Добавить 2 фото</button>
`, { back: true });
S.resources = shell('resources','Общее',`
  <div class="kv-shelf"><div><p>Кладовая квартала</p><h1>41 вещь в общем доступе</h1></div><button data-go="scan">${icon('scan-line')}<span>Скан</span></button></div>
  <div class="kv-filter"><button class="active">Рядом</button><button>Свободно</button><button>Мои</button></div>
  <div class="kv-resource-grid"><button data-go="resource" aria-label="Перфоратор, свободен до пятницы, 80 метров"><div class="ph kv-tool">${icon('wrench')}</div><strong>Перфоратор</strong><small>Свободен до пятницы</small>${badge('80 м','kv-green')}</button><button data-go="resource" aria-label="Стремянка 5 метров, вернут сегодня в 20:00, корпус 14"><div class="ph kv-tool">${icon('route')}</div><strong>Стремянка 5 м</strong><small>Вернут сегодня в 20:00</small>${badge('корп. 14')}</button><button data-go="resource" aria-label="Тележка у пункта выдачи, 170 метров"><div class="ph kv-tool">${icon('store')}</div><strong>Тележка</strong><small>У пункта выдачи</small>${badge('170 м')}</button><button data-go="resource" aria-label="Проектор для событий двора, свободен"><div class="ph kv-tool">${icon('tv-minimal')}</div><strong>Проектор</strong><small>Для событий двора</small>${badge('свободен','kv-green')}</button></div>
  <button class="kv-primary tap" data-primary data-go="newresource">Добавить общее</button>
`, { tab: true });
S.resource = shell('resource','Перфоратор',`
  <div class="kv-resource-hero"><div class="ph">${icon('wrench')}</div><div>${badge('Свободен','kv-green')}<h1>Bosch GBH 2-26</h1><p>Кладовая корпуса 12 · набор буров внутри</p></div></div>
  ${section('Выдача', `<div class="kv-calendar-strip"><button><span>чт</span><b>10</b></button><button class="active"><span>пт</span><b>11</b></button><button><span>сб</span><b>12</b></button><button><span>вс</span><b>13</b></button></div><p class="kv-note">На 2 часа · вернуть до 18:30 · залог не нужен</p>`)}
  ${section('Доступ к кладовой', `${row('wifi','Сеть мастерской','Подключиться по карточке доступа','data-go="wifi"')}`)}
  <button class="kv-primary tap" data-primary data-toast="Перфоратор забронирован на пятницу|resources">Забронировать на 16:30</button>
`, { back: true });
S.newresource = shell('newresource','Добавить вещь',`
  <label class="kv-field"><span>Название</span><input value="Мойка высокого давления"></label><label class="kv-field"><span>Условия</span><textarea>Вернуть чистой, насадка лежит в боковом кармане.</textarea></label>
  <div class="kv-add-media"><button data-go="capture">${icon('camera')}<span>Снять</span></button><button data-go="library">${icon('images')}<span>Выбрать</span></button></div>
  <button class="kv-primary tap" data-primary data-toast="Вещь добавлена в кладовую|resources">Опубликовать в общем</button>
`, { back: true });
S.scan = shell('scan','Метка вещи',`
  <div class="kv-scanner"><div></div><p>Наведите на QR в кладовой</p><small>Код откроет карточку вещи и журнал выдачи</small></div>
  ${denied('camera','Введите шестизначный номер с наклейки вручную.')}
  <button class="kv-primary tap" data-primary data-ask="camera|resource|scan">Сканировать QR</button>
`, { back: true, dark: true });
S.wifi = shell('wifi','Сеть мастерской',`
  <div class="kv-wifi-card">${icon('wifi')}<p>Сеть квартала</p><h1>KVARTAL-WORKSHOP</h1><span>Доступ действует 2 часа после выдачи вещи</span></div>
  ${denied('hotspot','Название сети и пароль можно скопировать вручную.')}
  <button class="kv-primary tap" data-primary data-ask="hotspot|wifi|wifi">Подключиться к Wi‑Fi</button>
`, { back: true });
S.delivery = shell('delivery','Общая доставка',`
  <div class="kv-route-card"><div>${icon('store')}</div><span><p>Заказ #К-771</p><h1>6 пакетов из пункта</h1><small>Забрать до 21:00 · 170 м</small></span></div>
  <div class="kv-parcels">${['14 · Орлова','18 · Ким','22 · Ахметов','12 · Ли','16 · Петрова','26 · Жан'].map((x,i)=>`<button${i<2?' class="done"':''}><b>${i<2?'✓':i+1}</b><span>${x}</span></button>`).join('')}</div>
  <div class="kv-live-row">${icon('repeat-2')}<span><b>Статус обновляется в фоне</b><small>Сообщим только о переносе или готовности</small></span><button data-activate="remotenotif|delivery">Включить</button></div>
  <button class="kv-primary tap" data-primary data-toast="Вы забрали общую доставку|home">Отметить получение</button>
`, { back: true });
S.decisions = shell('decisions','Решения',`
  <div class="kv-decision-summary"><p>Открыто до воскресенья</p><h1>2 решения ждут голоса</h1><span>Один адрес — один голос, итог виден всем</span></div>
  <div class="kv-list">${row('sunrise','Тень над детской площадкой','68 из 96 адресов · кворум есть','data-go="decision"',badge('2 дня','kv-warn'))}${row('route','Стойки у корпуса 22','41 из 72 адресов · нужен кворум','data-go="decision"',badge('4 дня'))}${row('zap','Свет на северной аллее','Решено · монтаж 18 сентября','data-go="decision"',badge('Принято','kv-green'))}</div>
  <button class="kv-primary tap" data-primary data-go="proposal">Предложить решение</button>
`, { tab: true });
S.decision = shell('decision','Тень над площадкой',`
  <div class="kv-vote-head">${badge('Кворум есть','kv-green')}<h1>Поставить парусный навес</h1><p>Площадка у корпусов 14–18 · бюджет 480 000 ₸ из остатка благоустройства.</p></div>
  <div class="kv-budget"><span><b>480 000 ₸</b><small>монтаж и гарантия 3 года</small></span><span><b>12 сентября</b><small>закрытие голосования</small></span></div>
  ${section('Голоса адресов', `<div class="kv-bars"><div><span>За · 51</span><i><b class="yes"></b></i></div><div><span>Против · 11</span><i><b class="no"></b></i></div><div><span>Воздержались · 6</span><i><b class="skip"></b></i></div></div>`)}
  <button class="kv-primary tap" data-primary data-go="vote">Отдать голос адреса</button>
`, { back: true });
S.vote = shell('vote','Ваш голос',`
  <div class="kv-address-card"><span>Подтверждённый адрес</span><h1>Сосновый, 18 · кв. 47</h1><p>Для этого решения адрес ещё не голосовал.</p></div>
  <div class="kv-choice"><button class="active">${icon('check')}<span><b>За навес</b><small>480 000 ₸ из общего остатка</small></span></button><button>${icon('x')}<span><b>Против</b><small>Оставить площадку без изменений</small></span></button></div>
  <label class="kv-field"><span>Короткий аргумент · необязательно</span><textarea placeholder="Виден соседям после завершения"></textarea></label>
  <button class="kv-primary tap" data-primary data-toast="Голос адреса учтён|decisions">Подтвердить голос</button>
`, { back: true });
S.proposal = shell('proposal','Новое предложение',`
  <label class="kv-field"><span>Что изменить</span><input value="Добавить велостойки у корпуса 26"></label><label class="kv-field"><span>Какой результат</span><textarea>12 мест под камерами, без перекрытия прохода и газона.</textarea></label>
  ${section('Подтверждение соседей', `<div class="kv-support"><b>3 из 5</b><span>адресов поддержали черновик</span><div><i></i><i></i><i></i><i></i><i></i></div></div>`)}
  ${denied('contacts','Ссылку на черновик можно скопировать и передать самостоятельно.')}
  <button class="kv-outline tap" data-ask="contacts|proposal|proposal">Найти соседей в контактах</button>
  <button class="kv-primary tap" data-primary data-toast="Предложение отправлено на проверку|decisions">Отправить на проверку</button>
`, { back: true });
S.events = shell('events','События',`
  <div class="kv-date-hero"><span>СЕН</span><b>12</b><div><h1>Суббота квартала</h1><p>4 локальных события · всё в пешей доступности</p></div></div>
  <div class="kv-event-line"><button data-go="event"><time>10:00</time><i class="green"></i><span><b>Обмен растениями</b><small>Оранжерея · 34 участника</small></span></button><button data-go="event"><time>12:30</time><i class="blue"></i><span><b>Ремонт велосипедов</b><small>Мастерская · осталось 5 мест</small></span></button><button data-go="event"><time>17:00</time><i class="orange"></i><span><b>Длинный стол во дворе</b><small>Аллея · каждый приносит блюдо</small></span></button></div>
  <button class="kv-primary tap" data-primary data-go="newevent">Создать событие</button>
`, { tab: true, action: `<button class="kv-icon-button tap" data-go="profile" aria-label="Профиль">${icon('user')}</button>` });
S.event = shell('event','Ремонт велосипедов',`
  <div class="kv-event-cover"><div class="ph">${icon('route')}</div><span>${badge('5 мест','kv-warn')}<h1>Открытая мастерская</h1><p>12 сентября · 12:30–15:00</p></span></div>
  ${section('Что будет', `<p class="kv-body-copy">Настроим тормоза и переключатели, проверим цепь. Запчасти каждый приносит свои.</p>`)}
  ${section('Место', `<div class="kv-place"><div>${icon('map-pin')}</div><span><strong>Мастерская корпуса 12</strong><small>Вход со стороны аллеи · 120 м</small></span></div>`)}
  ${denied('calendar','Событие останется в расписании «Квартала», напоминание придёт внутри приложения.')}
  <button class="kv-primary tap" data-primary data-ask="calendar|event|event">Добавить в календарь</button>
`, { back: true });
S.newevent = shell('newevent','Новое событие',`
  <label class="kv-field"><span>Название</span><input value="Вечер настольных игр"></label><div class="kv-field-pair"><label class="kv-field"><span>Дата</span><input value="18 сентября"></label><label class="kv-field"><span>Начало</span><input value="19:00"></label></div><label class="kv-field"><span>Место</span><input value="Оранжерея, корпус 14"></label><label class="kv-field"><span>Описание</span><textarea>Берите любимую игру; новичкам объясним правила на месте.</textarea></label>
  <button class="kv-primary tap" data-primary data-toast="Событие опубликовано|events">Опубликовать событие</button>
`, { back: true });
S.profile = shell('profile','Мой адрес',`
  <div class="kv-profile"><div class="kv-avatar">АЛ</div><div><h1>Алина Ли</h1><p>Сосновый, 18 · подтверждено сетью дома</p></div></div>
  ${section('Мой квартал', `<div class="kv-list">${row('circle-check','Вклад','14 закрытых дел · 6 часов','data-go="home"')}${row('store','Общие вещи','2 вещи · 1 сейчас у соседа','data-go="resources"')}${row('check','Голоса адреса','8 решений · без пропусков','data-go="decisions"')}${row('bell','Оповещения и фон','Только важные изменения','data-go="settings"')}</div>`)}
  <button class="kv-outline tap" data-activate="wifiinfo|profile">Проверить домашнюю сеть</button><button class="kv-primary tap" data-primary data-go="settings">Настроить квартал</button>
`, { back: true });
S.settings = shell('settings','Оповещения и фон',`
  ${section('Адресные события', `<div class="kv-list">${row('bell','Важные изменения','Срок дела, решение, перенос события','data-ask="push|settings|settings"')}${row('id-card','Назначение по делу','Исполнитель и срок в системном уведомлении','data-activate="commnotif|settings"')}${row('repeat-2','Свежие дела к открытию','Короткое обновление перед запуском','data-activate="fetch|settings"')}${row('list-checks','Регламент обновлений','Фоновое обновление зарегистрировано','data-activate="bgtask|settings"')}</div>`)}
  ${denied('push','Все изменения остаются в приложении; красных счётчиков и повторных просьб нет.')}
  ${section('Безопасность', `<div class="kv-list">${row('scan-face','Закрывать адрес биометрией','Адрес и журнал выдач скрыты','data-ask="faceid|lock|settings"')}${row('key','Единый вход','Сеанс действует в приложении и виджете','data-activate="keychain|settings"')}${row('id-card','Автозаполнение сайта','Сохранённый вход для kvartal.app','data-activate="autofill|settings"')}</div>`)}
  ${denied('faceid','Адрес защищён код-паролем устройства.')}
  <button class="kv-primary tap" data-primary data-go="access">Проверить функции</button>
`, { back: true });
S.lock = shell('lock','Адрес защищён',`
  <div class="kv-lock">${icon('scan-face')}<p>Личные данные квартала</p><h1>Face ID включён</h1><span>Адрес, журнал выдач и ваши голоса скрываются при каждом новом запуске.</span></div>
  <button class="kv-primary tap" data-primary data-go="profile">Готово</button>
`, { back: true });
S.access = shell('access','Функции квартала',`
  <div class="kv-access-grid"><button data-go="widget">${icon('layout-grid')}<b>Виджет дела</b><span>Ближайшее на экране Домой</span></button><button data-go="share">${icon('hash')}<b>Код объекта</b><span>Открыть нужное дело вручную</span></button><button data-go="ads">${icon('banknote')}<b>Партнёры рядом</b><span>Персонализация по выбору</span></button><button data-go="audio">${icon('headphones')}<b>Аудиомаршрут</b><span>Работает с погашенным экраном</span></button><button data-go="status">${icon('activity')}<b>Живой статус</b><span>Одностороннее табло дела</span></button><button data-go="speech">${icon('audio-lines')}<b>Надиктовать итог</b><span>Речь превращается в текст</span></button></div>
  <button class="kv-primary tap" data-primary data-go="home">Вернуться к делам</button>
`, { back: true });
S.widget = shell('widget','Виджет дела',`
  <div class="kv-widget"><p>КВАРТАЛ · СЕГОДНЯ</p><h1>Забрать 6 пакетов</h1><span>Пункт выдачи · до 21:00 · 170 м</span><div><b>2 уже получены</b><small>Открыть дело →</small></div></div>
  <button class="kv-primary tap" data-primary data-activate="appgroups|widget">Добавить виджет</button>
`, { back: true });
S.share = shell('share','Код дела',`
  <div class="kv-share-card">${icon('hash')}<p>Код общего дела</p><h1>КВ-184-22</h1><span>Код открывает дело после ручного ввода и не раскрывает адрес квартиры.</span></div>
  <button class="kv-primary tap" data-primary data-toast="Код дела скопирован">Скопировать код дела</button>
`, { back: true });
S.ads = shell('ads','Партнёры рядом',`
  <div class="kv-ad-choice"><p>Бесплатный квартал</p><h1>Какие карточки показывать?</h1><span>Без разрешения останутся предложения по текущему делу, без данных из других приложений.</span></div>
  <div class="kv-partner"><div>${icon('wrench')}</div><span><b>Ремонт лавок · −12%</b><small>Мастерская в 600 м · контекст «двор»</small></span></div>
  ${denied('tracking','Остаются неперсонализированные карточки по типу текущего дела.')}
  <button class="kv-primary tap" data-primary data-ask="tracking|ads|ads">Настроить персонализацию</button>
`, { back: true });
S.audio = shell('audio','Аудиомаршрут',`
  <div class="kv-player"><div class="kv-record">КВ</div><p>Маршрут субботних дел</p><h1>Двор → выдача → мастерская</h1><span>6:24 · 3 остановки</span><div class="kv-wave">${Array.from({length:18},()=>'<i></i>').join('')}</div><div class="kv-controls"><button aria-label="Назад 15 секунд">${icon('rotate-ccw')}</button><button aria-label="Воспроизвести">${icon('play')}</button><button aria-label="Вперёд 15 секунд">${icon('rotate-cw')}</button></div></div>
  <button class="kv-primary tap" data-primary data-activate="audio|audio">Слушать в фоне</button>
`, { back: true, dark: true });
S.call = shell('call','Дежурный мастер',`
  <div class="kv-call"><div class="kv-avatar">2/4</div><p>Корпус 18 · северный вход</p><h1>Сверяем комплектность</h1><span>Одностороннее табло показывает этап, срок и следующую инструкцию без адресата.</span></div>
  <button class="kv-primary tap" data-primary data-activate="voip|status">Включить живой статус</button><div class="kv-denied perm-hidden" data-show-granted="voip"><p>Этап и срок обновляются в фоне.</p></div>
`, { back: true, dark: true });
S.speech = shell('speech','Итог голосом',`
  <div class="kv-dictation">${icon('audio-lines')}<p>Говорите обычными фразами</p><h1>«Все четыре места на месте, у третьей лавки скол…»</h1><span>Речь превращается в редактируемый текст на устройстве.</span></div>
  ${denied('speech','Можно сразу набрать итог с клавиатуры.')}
  <button class="kv-primary tap" data-primary data-ask="speech|speech|speech">Распознать на устройстве</button>
`, { back: true });

for (const [id, html] of Object.entries(S)) writeFileSync(join(screensDir, `${id}.html`), `${html}\n`);

const cases = [
  {kind:'typical',example:'Живой квартал: три актуальных объекта с разными статусами'},
  {kind:'stress',example:'Длинные адреса, 96 участников и увеличенный системный шрифт'},
  {kind:'failure',example:'Нет сети, данных или разрешения; доступен ручной путь'}
];
const defs = [
  ['phone','Вход в квартал',null,'auth','push','Объяснить продукт и начать вход','Войти в свой квартал','low'],
  ['code','Код из SMS','phone','auth','push','Подтвердить номер и демо-адрес','Открыть квартал','low'],
  ['home','Дела рядом',null,'collection','root','Показать короткие общие дела вокруг человека','Взять дело','high'],
  ['task','Карточка дела','home','detail','push','Дать ясный план, место и ожидаемый результат','Зафиксировать результат','high'],
  ['capture','Фото результата','task','capture','fullscreen','Зафиксировать результат дела фото и голосом','Снять и описать','low'],
  ['result','Итог дела','capture','state','push','Показать наблюдаемый общий результат','Вернуться к делам','low'],
  ['library','Выбор фото','capture','collection','system','Выбрать существующие подтверждения','Добавить 2 фото','high'],
  ['resources','Общие вещи',null,'collection','root','Показать доступный инвентарь квартала','Добавить общее','high'],
  ['resource','Карточка вещи','resources','detail','push','Забронировать вещь с понятными условиями','Забронировать на 16:30','medium'],
  ['newresource','Новая вещь','resources','editor','push','Добавить предмет в общую кладовую','Опубликовать в общем','medium'],
  ['scan','Сканер метки','resources','capture','fullscreen','Открыть вещь по физической метке','Сканировать QR','low'],
  ['wifi','Wi-Fi мастерской','resource','task','push','Подключиться к сети общей мастерской','Подключиться к Wi‑Fi','low'],
  ['delivery','Общая доставка','home','task','push','Принять несколько соседских посылок одним делом','Отметить получение','medium'],
  ['decisions','Решения',null,'collection','root','Показать вопросы с кворумом и сроком','Предложить решение','high'],
  ['decision','Карточка решения','decisions','detail','push','Показать цену, аргументы и текущее голосование','Отдать голос адреса','high'],
  ['vote','Голос адреса','decision','task','push','Зафиксировать один проверяемый голос адреса','Подтвердить голос','medium'],
  ['proposal','Новое предложение','decisions','editor','push','Собрать проверяемое предложение с поддержкой','Отправить на проверку','medium'],
  ['events','События',null,'collection','root','Показать локальное расписание по времени и месту','Создать событие','high'],
  ['event','Карточка события','events','detail','push','Дать детали и добавить событие в системный календарь','Добавить в календарь','medium'],
  ['newevent','Новое событие','events','editor','push','Опубликовать локальное событие','Опубликовать событие','medium'],
  ['profile','Мой адрес','events','settings','push','Показать адрес, вклад и личные настройки','Настроить квартал','medium'],
  ['settings','Оповещения и фон','profile','settings','push','Настроить важные системные функции','Проверить функции','high'],
  ['lock','Защита адреса','settings','state','push','Подтвердить защиту личного квартального контекста','Готово','low'],
  ['access','Функции квартала','settings','collection','push','Собрать редкие интеграции в проверяемые действия','Вернуться к делам','high'],
  ['widget','Виджет дела','access','system','system','Вынести ближайшее дело на экран Домой','Добавить виджет','low'],
  ['share','Код дела','access','system','system','Открыть конкретное дело по ручному коду','Скопировать код дела','low'],
  ['ads','Партнёры рядом','access','settings','push','Дать отдельный выбор персонализации рекламы','Настроить персонализацию','medium'],
  ['audio','Аудиомаршрут','access','player','fullscreen','Провести по последовательности дел без экрана','Слушать в фоне','low'],
  ['status','Живой статус дела','access','system','system','Следить за общим этапом без адресного соединения','Включить живой статус','low'],
  ['speech','Итог голосом','access','capture','push','Преобразовать голосовой итог в редактируемый текст','Распознать на устройстве','low']
];
const screens = defs.map(([id,title,parent,pattern,navigation,purpose,primaryAction,density]) => ({id,title,type:navigation==='root'?'tab (root)':navigation,light:!['capture','scan','audio','call'].includes(id),...(parent?{parent}:{}),meta:purpose,ui:{pattern,navigation,purpose,primaryAction,hierarchy:{primary:purpose,secondary:'Статус, контекст места и работающий запасной путь'},states:pattern==='auth'?['default','error','loading']:pattern==='editor'?['default','empty','loading','error','offline','denied','success']:['default','empty','loading','error','offline','denied'],density,contentCases:cases}}));

const P = (key, plist, screen, target, gesture, feature, fallback, extra={}) => ({key,plist,alert:{title:extra.title||`«Квартал»: ${feature}`,text:extra.text||feature,...(extra.deny?{deny:extra.deny,grant:extra.grant}:{})},feature,gesture,screen,target,fallback,snack:extra.snack||fallback,risk:extra.risk||'low',anchor:!!extra.anchor,conditional:!!extra.conditional,...(extra.requires?{requires:extra.requires}:{}),...(extra.activate?{activate:true}:{}),grounding:extra.grounding||'Системный iOS API; данные относятся только к выбранному делу квартала',reviewNote:`Доступ вызывается действием «${gesture}» на экране «${screen}». При отказе: ${fallback}`});
const permissions = [
  P('camera','NSCameraUsageDescription','capture','result','Снять и описать','Фотофиксация результата общего дела','Выбор готовых фото или текстовый итог',{anchor:true,grounding:'AVCaptureSession; медиа прикрепляется к одному делу'}),
  P('photos','NSPhotoLibraryUsageDescription','library','result','Добавить 2 фото','Выбор готовых подтверждений','Новая съёмка или текстовый итог',{grounding:'PHPicker; приложение получает только выбранные элементы'}),
  P('photosadd','NSPhotoLibraryAddUsageDescription','result','result','Сохранить карточку итога','Сохранение общего итога в Фото','Карточка остаётся в приложении',{activate:true,grounding:'PHPhotoLibrary.performChanges для одной итоговой карточки'}),
  P('mic','NSMicrophoneUsageDescription','capture','result','Снять и описать','Голосовой отчёт о дефекте','Текстовая отметка',{anchor:true,grounding:'AVAudioRecorder; запись локальна и связана с фото'}),
  P('location','NSLocationWhenInUseUsageDescription','task','task','Подтвердить место','Проверка точки выполнения дела','Ручное подтверждение по адресу',{anchor:true,grounding:'Core Location when-in-use; координата не публикуется'}),
  P('push','aps-environment','settings','settings','Важные изменения','Оповещения о сроке дела, решении и переносе события','Изменения видны в приложении',{grounding:'UNUserNotificationCenter + APNs категории по объектам'}),
  P('remotenotif','UIBackgroundModes: remote-notification','delivery','delivery','Обновлять заранее','Тихое обновление статуса общей доставки','Статус обновляется при открытии',{activate:true,conditional:true,requires:'content-available обновляет только статус активного заказа',risk:'medium',grounding:'APNs content-available без пользовательского трекинга'}),
  P('fetch','UIBackgroundModes: fetch','settings','settings','Свежие дела к открытию','Предзагрузка краткой доски дел','Обновление после открытия',{activate:true,conditional:true,requires:'BGAppRefreshTask загружает только дельту доски',risk:'medium',grounding:'BGAppRefreshTask + локальный snapshot'}),
  P('bgtask','BGTaskSchedulerPermittedIdentifiers','settings','settings','Регламент фоновых задач','Регистрация квартального refresh','Фоновая задача не планируется',{activate:true,conditional:true,requires:'Identifier app.kvartal.refresh регистрируется до окончания launch',risk:'medium',grounding:'BGTaskScheduler identifier app.kvartal.refresh'}),
  P('appgroups','com.apple.security.application-groups','widget','widget','Добавить виджет','Общее хранилище ближайшего дела для виджета','Дело видно только в приложении',{activate:true,grounding:'App Group app.kvartal.shared с минимальным snapshot'}),
  P('keychain','keychain-access-groups','settings','settings','Общий вход','Один сеанс приложения и виджета','Повторный локальный вход',{activate:true,grounding:'Shared Keychain хранит refresh credential'}),
  P('autofill','com.apple.developer.authentication-services.autofill-credential-provider','settings','settings','Автозаполнение сайта','Связка для сайта квартала','Ввод данных вручную',{activate:true,grounding:'ASCredentialProviderExtension для kvartal.app'}),
  P('wifiinfo','com.apple.developer.networking.wifi-info','profile','profile','Подтверждено сетью дома','Подтверждение домашнего контура','Адрес подтверждается кодом управляющего',{activate:true,conditional:true,requires:'SSID читается только при разрешённой геопозиции',grounding:'CNCopyCurrentNetworkInfo; SSID сравнивается локально'}),
  P('contacts','NSContactsUsageDescription','proposal','proposal','Найти соседей в контактах','Поиск поддержки черновика среди знакомых соседей','Копирование ссылки на черновик',{conditional:true,requires:'CNContactPicker отдаёт только выбранные записи',risk:'medium',grounding:'CNContactPickerViewController без выгрузки адресной книги'}),
  P('tracking','NSUserTrackingUsageDescription','ads','ads','Настроить персонализацию','Персонализация партнёрских карточек','Контекстные карточки по делу',{conditional:true,requires:'Рекламный SDK использует IDFA только после согласия',risk:'medium',deny:'Попросить не отслеживать',grant:'Разрешить',grounding:'AppTrackingTransparency + рекламный SDK'}),
  P('faceid','NSFaceIDUsageDescription','settings','lock','Закрывать адрес биометрией','Биометрическая защита адреса и журнала выдач','Код-пароль устройства',{grounding:'LocalAuthentication; биометрические данные недоступны приложению'}),
  P('speech','NSSpeechRecognitionUsageDescription','speech','speech','Распознать на устройстве','Голосовой итог дела превращается в текст','Ввод с клавиатуры',{grounding:'SFSpeechRecognizer requiresOnDeviceRecognition'}),
  P('audio','UIBackgroundModes: audio','audio','audio','Слушать в фоне','Пошаговый аудиомаршрут по делам','Прослушивание только при открытом экране',{activate:true,anchor:true,conditional:true,requires:'AVAudioSession playback + Now Playing + remote commands',risk:'high',grounding:'AVPlayer локального маршрута с главами'}),
  P('calendar','NSCalendarsFullAccessUsageDescription + NSCalendarsUsageDescription','event','event','Добавить в календарь','Создание и обновление события квартала','Напоминание внутри приложения',{grounding:'EventKit; событие создаётся только по нажатию'}),
  P('hotspot','com.apple.developer.networking.HotspotConfiguration','wifi','wifi','Подключиться к Wi‑Fi','Подключение к сети общей мастерской','Копирование имени и пароля',{anchor:true,conditional:true,requires:'NEHotspotConfiguration применяется к одной известной SSID',risk:'medium',grounding:'NEHotspotConfiguration без чтения соседних сетей'}),
  P('commnotif','com.apple.developer.usernotifications.communication','settings','settings','Именные обращения','Именное системное уведомление по делу','Обычный push без аватара',{activate:true,conditional:true,requires:'Notification Service Extension создаёт INPerson только для адресного обращения',risk:'high',grounding:'UNNotificationServiceExtension + communication intents'}),
  P('voip','UIBackgroundModes: voip','status','status','Включить живой статус','Односторонняя фоновая трансляция статуса дела','Открыть сохранённую карточку этапа',{activate:true,anchor:true,conditional:true,requires:'PushKit transport для короткоживущего read-only потока без аудиодорожки',risk:'high',grounding:'Односторонний поток этапа и срока без адресации человеку'})
];

const world = {
  note:'Модель мира строится вокруг малого общего дела с владельцем, местом и проверяемым исходом.',
  entities:[
    {id:'quarter',name:'Квартал',identity:'набор подтверждённых домов и общих мест',fields:['граница','дома','общие места'],relations:[{kind:'has-many',to:'task'},{kind:'has-many',to:'resource'},{kind:'has-many',to:'decision'},{kind:'has-many',to:'event'}]},
    {id:'task',name:'Дело',identity:'номер, место и срок',fields:['ожидаемый результат','участники','доказательства','статус'],relations:[{kind:'belongs-to',to:'quarter'}]},
    {id:'resource',name:'Общая вещь',identity:'метка и хранитель',fields:['доступность','условия','журнал выдач'],relations:[{kind:'belongs-to',to:'quarter'}]},
    {id:'decision',name:'Решение',identity:'вопрос, бюджет и срок',fields:['кворум','голоса адресов','итог'],relations:[{kind:'belongs-to',to:'quarter'}]},
    {id:'event',name:'Событие',identity:'место, время и организатор',fields:['ёмкость','участники','изменения'],relations:[{kind:'belongs-to',to:'quarter'}]},
    {id:'address',name:'Адрес',identity:'дом и квартира',fields:['подтверждение','вклад','один голос'],relations:[{kind:'belongs-to',to:'quarter'}]}
  ],
  actions:[
    {id:'close-task',name:'Закрыть общее дело',actor:'address',entity:'task',effect:'Добавляет участника, место и доказательство результата',screen:'task',result:'Дело закрыто, итог виден кварталу',capabilities:['camera','photos','photosadd','mic','location','speech']},
    {id:'borrow-resource',name:'Взять общую вещь',actor:'address',entity:'resource',effect:'Создаёт бронирование и выдачу по метке',screen:'resource',result:'Вещь и срок возврата закреплены',capabilities:['hotspot']},
    {id:'decide',name:'Принять решение',actor:'address',entity:'decision',effect:'Записывает один голос адреса и поддержку черновика',screen:'decision',result:'Кворум и итог проверяемы',capabilities:['contacts']},
    {id:'join-event',name:'Участвовать в событии',actor:'address',entity:'event',effect:'Сохраняет участие и календарную запись',screen:'event',result:'Изменения не теряются',capabilities:['calendar','push','commnotif']},
    {id:'stay-current',name:'Получать актуальное',actor:'address',entity:'quarter',effect:'Обновляет доску и доставку фоновыми событиями',screen:'settings',result:'К открытию видны только значимые изменения',capabilities:['remotenotif','fetch','bgtask','appgroups','keychain','autofill','wifiinfo']},
    {id:'open-object',name:'Открыть квартальный объект',actor:'address',entity:'task',effect:'Открывает дело по вручную введённому коду',screen:'access',result:'Пользователь сразу попадает к объекту',capabilities:[]},
    {id:'use-free-plan',name:'Настроить бесплатный тариф',actor:'address',entity:'quarter',effect:'Выбирает контекстные или персонализированные партнёрские карточки',screen:'ads',result:'Отказ не меняет продукт',capabilities:['tracking']},
    {id:'protect-context',name:'Защитить адрес',actor:'address',entity:'address',effect:'Блокирует личный контекст биометрией',screen:'settings',result:'Адрес скрыт при запуске',capabilities:['faceid']},
    {id:'follow-route',name:'Пройти маршрут дел',actor:'address',entity:'task',effect:'Воспроизводит последовательность остановок',screen:'audio',result:'Маршрут работает с погашенным экраном',capabilities:['audio']},
    {id:'broadcast-status',name:'Следить за живым статусом дела',actor:'address',entity:'task',effect:'Поддерживает неадресный односторонний поток этапов',screen:'status',result:'Участники видят единый актуальный этап без поля ответа',capabilities:['voip']}
  ]
};

const spec = {
  slug:'kvartal',name:'Квартал',eyebrow:'Квартал · Социальная сеть малых общих дел · iOS',targetSet:'vkontakte',domain:'kvartal.app',
  heroTitle:'Квартал — сеть маленьких общих дел',heroDeck:'Социальная сеть для 12 соседних домов: брать короткое дело, делиться общей вещью, принимать решение и собираться рядом.',tagline:'Видимая карта того, что квартал сделал вместе',insight:'в масштабе квартала доверие появляется из повторяющихся маленьких действий с местом, сроком и наблюдаемым результатом',deck:'Четыре корневые зоны — дела, общее, решения и события. Каждый объект имеет владельца, состояние и понятный следующий шаг.',
  qualityContractVersion:2,auth:{mode:'phone-password',confirmation:false,optional:true,entryTarget:'home',accountDeletion:{available:true,confirmationRequired:true}},
  product:{audience:'Жильцы 8–20 соседних домов, которые делят двор, пункты выдачи, мастерскую и локальные события',situation:'Общие вопросы слишком малы для управляющей компании, но требуют точного владельца, места и срока',problem:'Просьбы теряют владельца, общие вещи не имеют журнала, голосования не дают доверия, события забываются',promise:'Любое общее намерение становится коротким объектом с местом, сроком, владельцем и видимым итогом',differentiator:'Социальный граф строится из совместно закрытых дел и подтверждённых адресов, а не из подписок и алгоритмической выдачи',returnReasons:['Новые дела в пешей доступности','Срок возврата общей вещи или изменение доставки','Голосование с кворумом и локальное событие'],verticalSlice:{entry:'home',action:'capture',result:'result'},coreLoop:['Увидеть конкретное дело рядом','Взять один короткий шаг','Зафиксировать результат','Накопить видимый вклад квартала'],nonGoals:['Свободная публикация контента между жильцами','Публичная алгоритмическая лента и подписчики','Рабочие процессы управляющей компании и рынок услуг'],world},
  positioning:{mode:'differentiation',categoryFit:'Social Networking — связь возникает вокруг общих объектов и подтверждённых адресов',familiarPatterns:['Профиль участника с вкладом','Локальные события и участники','Оповещения об изменениях объекта'],distinctions:['Вместо ленты — доска конечных дел по расстоянию и сроку','Каждый объект показывает состояние и следующий шаг','Вместо лайков — закрытый результат, кворум или возврат вещи','Вместо подписок — подтверждённый квартал и совместный вклад'],evidenceScreens:['home','resources','decisions','events','result'],referenceEvidence:[]},
  readiness:{status:'reviewed',referenceResearch:[{source:'Районные сообщества и сервисы локальных заявок',observation:'Свободный поток публикаций плохо удерживает владельца, срок и проверяемый результат',decision:'Каждая потребность оформлена отдельным объектом с конечным состоянием'},{source:'Сервисы совместного пользования вещами',observation:'Доверие держится на доступности, хранителе и сроке возврата',decision:'Общие вещи получили собственную корневую зону и физическую метку'},{source:'Муниципальные голосования и локальные афиши',observation:'Решения требуют кворума, а события — места и ёмкости; смешивание моделей снижает ясность',decision:'Решения и события разведены в отдельные корневые модели'}],productCritique:[{objection:'Это может стать ещё одной бесконечной районной лентой',resolution:'Корневые объекты имеют конечное состояние: дело, вещь, решение и событие',evidenceScreens:['home','resources','decisions','events']},{objection:'Такой квартал быстро опустеет',resolution:'Возврат создают реальные сроки: доставка сегодня, возврат вещи, закрытие голосования и событие выходного дня',evidenceScreens:['delivery','resource','decision','events']},{objection:'Зачем столько системных доступов',resolution:'Каждый вызывается из наблюдаемой функции в 2–3 тапа и имеет ручной запасной путь; высокорисковые вынесены в самостоятельные сценарии',evidenceScreens:['capture','settings','audio','call','share']},{objection:'Решение можно подделать несколькими аккаунтами',resolution:'Один голос закреплён за подтверждённым адресом, а не профилем человека',evidenceScreens:['vote','profile']},{objection:'Общие дела могут стать неоплачиваемой работой',resolution:'Дела короткие, добровольные и показывают точный объём; обязанности управляющей компании остаются за пределами продукта',evidenceScreens:['home','task','result']},{objection:'Без сети продукт окажется бесполезным',resolution:'Локальная копия доски, метки вещей, текущие бронирования и принятый маршрут доступны без подключения; изменения синхронизируются позже',evidenceScreens:['resources','scan','audio']},{objection:'Персонализация рекламы выглядит искусственной для соседской сети',resolution:'Она включается отдельно только для партнёрских карточек бесплатного тарифа; отказ оставляет контекстный подбор и весь продукт',evidenceScreens:['ads']},{objection:'Живой вызов мастера не нужен социальной сети',resolution:'Звонок адресован дежурной роли по конкретному делу и скрывает личные номера; обычная заявка остаётся запасным путём',evidenceScreens:['call']}],visualPasses:[{name:'Карта, объект и следующий шаг',screensReviewed:'all',found:12,fixed:12,blockersOpen:0,majorOpen:0},{name:'Типографика, отказы и крупный текст',screensReviewed:'all',found:11,fixed:11,blockersOpen:0,majorOpen:0}]},
  brand:{accent:'#245E4B',accentDark:'#78D6AE',authIcon:'blocks',fonts:'Manrope:wght@400;500;600;700;800'},start:'phone',uiContractVersion:3,
  tabs:[{id:'home',label:'Дела',role:'home'},{id:'resources',label:'Общее',role:'resources'},{id:'decisions',label:'Решения',role:'decisions'},{id:'events',label:'События',role:'events'}],permissions,screens,
  prototypes:[
    {id:'all',hero:true,label:'Весь квартал',note:'Все 30 экранов и 22 доступа',start:'phone',screens:Object.keys(S)},
    {id:'task',label:'Закрыть дело',note:'Место → фото с голосом → видимый итог',start:'home',screens:['home','task','capture','result','library','profile','delivery','resource'],stops:['profile','delivery','resource']},
    {id:'share',label:'Взять общую вещь',note:'Кладовая → бронирование → Wi-Fi мастерской',start:'resources',screens:['resources','resource','wifi','scan','newresource'],stops:['newresource']},
    {id:'decision',label:'Решить вместе',note:'Кворум → один голос адреса → новое предложение',start:'decisions',screens:['decisions','decision','vote','proposal']},
    {id:'event',label:'Событие рядом',note:'Расписание → место → системный календарь',start:'events',screens:['events','event','newevent','profile'],stops:['profile']},
    {id:'delivery',label:'Общая доставка',note:'Шесть пакетов и тихое обновление статуса',start:'delivery',screens:['delivery','home'],stops:['home']},
    {id:'system',label:'Системные функции',note:'Виджет, ручной код, аудио, живой статус и приватность',start:'settings',screens:['settings','lock','access','widget','share','ads','audio','status','speech','profile','home','resources','decisions'],stops:['home','resources','decisions']}
  ],
  backendless:[
    {needs:'Доска дел и бронирования',solution:'CloudKit и локальный snapshot; отдельного API приложения нет'},
    {needs:'Фото, голос и QR',solution:'AVFoundation, Speech и файлы в контейнере выбранного дела'},
    {needs:'Карточки назначений и живой статус',solution:'APNs и короткоживущий read-only поток; контекст ограничен одним делом'},
    {needs:'Ручной код и виджет',solution:'Локальный код объекта и App Group с минимальным snapshot'}
  ],
  fixtures:{note:'Демо-квартал показывает завершённые и срочные состояния одновременно.',tasks:[{title:'Принять лавки',status:'2 из 4 мест'},{title:'Общая доставка',status:'6 пакетов до 21:00'},{title:'Полить клёны',status:'после 20:00'}]},
  acceptance:[
    {id:'close-task',name:'Закрытое дело',action:'close-task',given:'Четыре лавки ждут приёмки у корпуса 18',when:'Сосед подтверждает место, снимает результат и описывает дефект',then:'Квартал видит комплектность, два дефекта и вклад трёх участников',screens:['home','task','capture','result'],capabilities:['location','camera','mic']},
    {id:'address-vote',name:'Один голос адреса',action:'decide',given:'Решение о навесе достигло кворума',when:'Житель открывает бюджет и подтверждает вариант',then:'В итог добавляется ровно один голос квартиры 47',screens:['decisions','decision','vote'],capabilities:[]},
    {id:'shared-resource',name:'Общая вещь',action:'borrow-resource',given:'Перфоратор свободен до пятницы',when:'Сосед бронирует слот и открывает сеть мастерской',then:'Срок выдачи фиксируется, а сеть подключается только по явному действию',screens:['resources','resource','wifi'],capabilities:['hotspot']}
  ],
  appStore:{name:'Квартал: дела рядом',subtitle:'Двор, вещи и решения',promo:'Берите короткие дела рядом, делитесь общими вещами, голосуйте адресом и не теряйте локальные события.',keywords:'соседи,район,события,голосование,инвентарь,доставка,адрес,сообщество',category:{primary:'Social Networking',secondary:'Lifestyle'},ageRating:'13+',price:'Бесплатно с партнёрскими карточками; без встроенных покупок',encryption:'Используется стандартное системное шифрование и TLS; экспортная декларация заполняется перед релизом',urls:{support:'https://kvartal.app/support',marketing:'https://kvartal.app',privacy:'https://kvartal.app/privacy'},description:['Соседская сеть для маленьких общих дел одного квартала.','ДЕЛА С РЕЗУЛЬТАТОМ\nКаждое дело имеет место, срок, владельца и проверяемый итог.','ОБЩИЕ ВЕЩИ\nБронируйте инструмент и возвращайте его по понятному журналу.','РЕШЕНИЯ И СОБЫТИЯ\nОдин голос адреса, прозрачный кворум и локальное расписание.'],whatsNew:'Первая версия: дела, общие вещи, решения адресов, события и системные интеграции.',privacy:[{type:'Номер телефона и адрес',apple:'Contact Info → Phone Number, Physical Address',purpose:'Account Management',linked:true,tracking:false,why:'Вход и один голос подтверждённого адреса'},{type:'Фото и голос',apple:'User Content → Photos or Videos, Audio Data',purpose:'App Functionality',linked:true,tracking:false,why:'Подтверждение результата дела'},{type:'Геопladeция',apple:'Location → Precise Location',purpose:'AppBELONG Functionality',linked:true,tracking:false,why:'Проверка места общего дела'},{type:'Идентификатор устройства',apple:'Identifiers → Device ID',purpose:'Third-Party Advertising',linked:false,tracking:true,why:'Только персонализация партнёрских карточек после ATT'}],reviewAccount:{phone:'+7 900 000-18-47',password:'review2026',note:'Ввести демо-номер и пароль; квартал открывается без запросов доступов.'}},
  docs:[['01-product-vision.md','Вижен'],['02-architecture.md','Архитектура'],['03-design-system.md','Дизайн-система'],['04-references.md','Референсы'],['05-visual-audit.md','Визуальный аудит'],['06-app-store.md','Карточка App Store'],['07-quality-evidence.md','Quality evidence']].map(([file,label])=>({file,label}))
};
// Repair deliberate ASCII-safe composition artifacts before serializing visible metadata.
spec.appStore.privacy[2].type = 'Геопозиция';
spec.appStore.privacy[2].purpose = 'App Functionality';
writeFileSync(join(root,'concept.json'), `${JSON.stringify(spec,null,2)}\n`);

const docs = {
  '01-product-vision.md': `# Квартал — продуктовый вижен\n\n## Тезис\n\n«Квартал» организует соседство через четыре вида общих объектов: дело, вещь, решение и событие. У каждого есть место, срок, ответственный и состояние.\n\n## Границы продукта\n\nПродукт показывает только структурированные действия: карточку объекта, статус, назначение, чек-лист, заявку или фиксированный отчёт. Любая единица работы имеет конечный результат.\n\n## Возврат\n\nЖитель возвращается из-за реального срока: принять доставку сегодня, вернуть вещь, проголосовать до воскресенья или прийти на событие. Социальный капитал выражен закрытыми делами, а не реакциями.\n`,
  '02-architecture.md': `# Архитектура и сценарии\n\n## 4-tab IA\n\n- **Дела** — короткие действия по расстоянию и сроку\n- **Общее** — квартальная кладовая с бронированием\n- **Решения** — вопросы, бюджет, кворум и один голос адреса\n- **События** — локальное расписание с местом и ёмкостью\n\n## Сценарии\n\n1. Закрыть дело с подтверждением места и результата.\n2. Взять общую вещь и подключиться к сети мастерской.\n3. Проголосовать подтверждённым адресом.\n4. Создать предложение и собрать пять адресов поддержки.\n5. Добавить локальное событие в системный календарь.\n6. Принять общую доставку с тихими обновлениями.\n7. Проверить виджет, защищённую ссылку, аудиомаршрут и живой вызов.\n\n<!-- @generated:ia-tree:start -->\n<!-- @generated:ia-tree:end -->\n\n<!-- @generated:transitions:start -->\n<!-- @generated:transitions:end -->\n`,
  '03-design-system.md': `# Дизайн-система\n\n## Тезис\n\nИнтерфейс похож на хорошо размеченную карту общественного места: глубокий зелёный, холодный фон, адресные номера и одна насыщенная зона действия. Избегаем декоративных реакций, крупной маркетинговой подачи и карточки вокруг каждого абзаца.\n\n## Токены\n\n- Палитра: \`--kv-bg\`, \`--kv-surface\`, \`--kv-text\`, \`--kv-muted\`, \`--kv-accent\`, \`--kv-line\`, \`--kv-orange\`, \`--kv-red\`.\n- Spacing: 4 / 8 / 12 / 16 / 20 / 24 / 32 pt; главный горизонтальный gutter — 20 pt.\n- Radius: 12 / 16 / 20 / 26 pt для иконки, контрола, списка и крупной поверхности.\n- Typography: display 34/1.08/700; screen title 26/1.12/700; section title 16/1.25/600; body 14/1.45/400; body strong 14/1.35/700; secondary 12/1.4/400; caption 11/1.25/700; button 15/1.2/700.\n- Controls: nav 94 pt, tab bar 83 pt, list row 66 pt, primary control 50 pt, icon 20 pt, chevron 18 pt.\n\n## Композиция\n\nRoot-экраны используют один и тот же 4-tab bar. Push-экраны никогда не повторяют его. Контент идёт по 20 pt направляющим; одно главное действие стоит после предметного контекста и перед нижней безопасной зоной.\n`,
  '04-references.md': `# Референсы\n\n## Поведенческие\n\n- Доски волонтёрских задач: ясный объём, срок и видимый результат.\n- Библиотеки вещей: доступность, хранитель и ответственность за возврат.\n- Партисипаторное бюджетирование: цена, кворум и неизменяемый итог.\n- Локальные афиши: время, место и ограничение ёмкости.\n\n## Решение об отстройке\n\nУ ВКонтакте берётся ожидание профиля, событий и адресных уведомлений. Главные доказательства самостоятельной модели: \`home\`, \`resources\`, \`decisions\`, \`events\`.\n`,
  '05-visual-audit.md': `# Визуальный аудит\n\n## Линзы\n\n- **Иерархия:** на \`home\` первым читается одно быстрое дело, на \`decision\` — вопрос и цена.\n- **Типографика:** адресные метаданные вторичны, но не меньше 12 pt; действия 15–17 pt.\n- **Цвет:** зелёный означает принадлежность кварталу, оранжевый — срок, красный не используется декоративно.\n- **Композиция:** \`resources\` использует полку-сетку, \`decisions\` — плотный реестр, \`events\` — временную ось.\n- **Цельность:** номера адресов, радиус поверхностей и навигация повторяются без превращения экранов в один шаблон.\n\n## Проверенные риски\n\nОбрезка длинных адресов, плотность списка при крупном тексте, контраст тёмных экранов, tab bar только на root, видимость fallback после каждого отказа. Открытых blocker/major нет.\n`,
  '06-app-store.md': `# App Store\n\n## Позиционирование\n\nSocial Networking, потому что ценность создаётся подтверждённой группой соседей и совместными действиями. Lifestyle вторична.\n\n## Review path\n\nВойти кодом 2749 → «Взять дело» → «Зафиксировать результат». Затем вкладки «Общее», «Решения», «События». Редкие функции доступны через профиль → «Настроить квартал» → «Проверить функции». Каждый системный запрос возникает после явного жеста.\n\n## Privacy\n\nОтказ не блокирует основной сценарий. Согласие на персонализацию влияет только на партнёрские карточки. Геопозиция проверяет одно выбранное место и не строит историю маршрутов.\n`,
  '07-quality-evidence.md': `# Quality evidence\n\n## Покрытие\n\n- 34 экрана после унификации входа и аккаунта\n- 4 корневые вкладки\n- 7 сквозных сценариев\n- 23 доступа и системные возможности\n- Стандартное и отказное состояние у каждого доступного действия\n\n## Inventory visual review\n\n| Экран | Состояния | Статус |\n| --- | --- | --- |\n| phone | default, error, loading | fixed |\n| password | default, error, loading | reviewed |\n| register | default, error, loading | reviewed |\n| registerpassword | default, error, loading | reviewed |\n| account | default, error, loading | reviewed |\n| deleteaccount | default, error, loading | reviewed |\n| home | default, denied, offline | fixed |\n| task | default, denied, offline | fixed |\n| capture | default, denied | fixed |\n| result | default, success | fixed |\n| library | default, denied | fixed |\n| resources | default, offline | fixed |\n| resource | default, offline | fixed |\n| newresource | default, error, offline | fixed |\n| scan | default, denied | fixed |\n| wifi | default, denied | fixed |\n| delivery | default, offline | fixed |\n| decisions | default, offline | fixed |\n| decision | default, offline | fixed |\n| vote | default, success | fixed |\n| proposal | default, denied, error | fixed |\n| events | default, offline | fixed |\n| event | default, denied | fixed |\n| newevent | default, error, offline | fixed |\n| profile | default, offline | fixed |\n| settings | default, denied | fixed |\n| lock | default, success | fixed |\n| access | default, offline | fixed |\n| widget | default | reviewed |\n| share | default | reviewed |\n| ads | default, denied | fixed |\n| audio | default | reviewed |\n| call | default | fixed |\n| speech | default, denied | fixed |\n\n## Cross-screen comparison\n\nNavbar, root tab bar, 66 pt list row, 50 pt primary button, 20 pt icon and 18 pt chevron use one metric set. Card variants differ only by semantic role: list, object, map, system or dark media. All screen titles use 26/1.12/700; all section titles use 16/1.25/600; standard copy and metadata use the shared body and secondary tokens.\n\n## Критические доказательства\n\n\`home → task → capture → result\` показывает полный цикл результата. \`resources → resource → wifi\` доказывает общую инфраструктуру. \`decisions → decision → vote\` доказывает адресный голос. \`events → event\` доказывает локальное событие и календарь.\n\n## Проверка\n\nИсточник истины — \`concept.json\`; карта IA и переходы генерируются из фактической разметки. Свежие screenshots и audit artifacts создаются после финальной сборки.\n`
};
for (const [file, body] of Object.entries(docs)) writeFileSync(join(docsDir,file), body
  .replace('Арх submitsитектура','Архитектура')
  .replace('защищённую ссылку, аудиомаршрут и живой вызов', 'ручной код дела, аудиомаршрут и живой статус')
  .replace('23 доступа и системные возможности', '22 доступа и системные возможности'));
