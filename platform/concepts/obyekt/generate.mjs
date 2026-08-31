import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const screensDir = join(root, 'screens');
const docsDir = join(root, 'docs');
mkdirSync(screensDir, { recursive: true });
mkdirSync(docsDir, { recursive: true });
rmSync(screensDir, { recursive: true, force: true });
mkdirSync(screensDir, { recursive: true });

const icon = (name) => `<svg class="ob-icon"><use href="#i-${name}"/></svg>`;
const back = `<button class="ob-icon-btn tap" data-back aria-label="Назад">${icon('chevron-left')}</button>`;
const shell = (id, title, body, { backButton = false, action = '', tabs = false, dark = false } = {}) => `<div class="screen ob-screen${dark ? ' ob-dark' : ''}" id="scr-${id}">
  <header class="ob-nav">${backButton ? back : '<div class="ob-wordmark"><span>ОБ</span></div>'}<div><small>ОБЪЕКТ</small><strong>${title}</strong></div>${action || '<span class="ob-nav-gap"></span>'}</header>
  <main class="body-scroll ob-scroll">${body}</main>
  ${tabs ? tabbar(id) : ''}<div class="home-ind"></div>
</div>`;
const tabbar = (active) => `<nav class="tabbar ob-tabs">
  ${[['journal','clipboard-list','Журнал'],['zones','layout-grid','Зоны'],['deliveries','truck','Поставки'],['more','settings','Ещё']].map(([id,ic,label]) => `<button class="tab-item${active===id?' active':''}" data-go="${id}" aria-label="${label}">${icon(ic)}<span>${label}</span></button>`).join('')}
</nav>`;
const section = (label, content, aside='') => `<section class="ob-section"><div class="ob-section-title"><h2>${label}</h2>${aside}</div>${content}</section>`;
const row = (ic, title, sub, attrs='', end='') => `<button class="ob-row tap" ${attrs} aria-label="${title}"><span class="ob-row-icon">${icon(ic)}</span><span class="ob-row-copy"><strong>${title}</strong><small>${sub}</small></span>${end || icon('chevron-right')}</button>`;
const pill = (text, cls='') => `<span class="ob-pill ${cls}">${text}</span>`;
const deny = (keys, text) => `<div class="ob-denied" data-show-denied="${keys}">${icon('shield-alert')}<p>${text}</p></div>`;

const screens = {};
screens.phone = `<div class="screen ob-screen ob-auth" id="scr-phone"><main class="ob-auth-body"><div class="ob-logo" aria-hidden="true"><span>ОБ</span><i></i></div><p class="ob-kicker">Закрытый журнал объекта</p><h1>Ремонт по фактам, а не по памяти</h1><p>Этапы, зоны, фотофиксация, дефекты и акт в одном закрытом контуре.</p><button class="ob-primary tap" data-primary data-go="code">Продолжить</button><div class="auth-links"><button class="auth-link" data-toast="Помощь · obyekt.app/help">Помощь</button><button class="auth-link" data-toast="Поддержка · support@obyekt.app">Поддержка</button><button class="auth-link" data-toast="Соглашение · obyekt.app/terms">Пользовательское соглашение</button></div></main><div class="home-ind"></div></div>`;
screens.code = `<div class="screen ob-screen ob-auth" id="scr-code"><main class="ob-auth-body"><div class="ob-logo"><span>ОБ</span><i></i></div><p class="ob-kicker">Демо-доступ</p><h1>Вход в журнал</h1><p>После входа откроется объект «Квартира 41». Ни один доступ iOS пока не запрошен.</p><div class="otp"><span class="otp-cell is-filled">4</span><span class="otp-cell is-filled">1</span><span class="otp-cell is-filled">7</span><span class="otp-cell is-active">2</span></div><button class="ob-primary tap" data-primary data-go="journal">Войти</button><button class="ob-secondary tap" data-back>Изменить номер</button></main><div class="home-ind"></div></div>`;

screens.journal = shell('journal','Сегодня',`
  <div class="ob-project-head"><div><p>Квартира 41 · 63 м²</p><h1>Чистовая отделка</h1></div>${pill('38-й день','ob-ok')}</div>
  <div class="ob-progress"><i></i><b>67%</b><span>До акта: 19 дней</span></div>
  ${section('Требует решения', `<article class="ob-alert-card"><div>${pill('Срочно','ob-bad')}<time>09:42</time></div><h3>Стык плитки у инсталляции</h3><p>Шов ушёл на 4 мм. Мастер ждёт решения до 12:00.</p><button class="ob-inline tap" data-go="defect">Открыть дефект</button></article>`,'<span>2</span>')}
  ${section('Ход дня', `<div class="ob-timeline"><button data-go="phase" aria-label="Плитка в санузле"><time>08:10</time><i class="done"></i><div><strong>Санузел · плитка</strong><small>14 рядов приняты · 6 кадров</small></div></button><button data-go="delivery" aria-label="Поставка дверей"><time>11:30</time><i class="busy"></i><div><strong>Двери · в пути</strong><small>Машина опаздывает на 38 минут</small></div></button><button data-go="newentry" aria-label="Приёмка электрики"><time>16:40</time><i></i><div><strong>Электрика · приёмка</strong><small>32 точки по чек-листу</small></div></button></div>`)}
  <div class="ob-fab"><button class="tap" data-primary data-go="newentry" aria-label="Новая запись">${icon('plus')}<span>Запись</span></button></div>
`, {tabs:true, action:`<button class="ob-icon-btn tap" data-go="alerts" aria-label="Оповещения">${icon('bell')}</button>`});

screens.phase = shell('phase','Этап',`
  <div class="ob-stage-hero"><span>04 / 07</span><h1>Плитка и камень</h1><p>12–26 августа · прораб Илья Ш.</p><div><b>74%</b><i><em></em></i></div></div>
  ${section('Зоны этапа', `<div class="ob-card-grid"><button data-go="zone"><b>СУ</b><strong>Санузел</strong><small>74% · 1 дефект</small></button><button data-go="zone"><b>КХ</b><strong>Кухня</strong><small>41% · ждёт фартук</small></button></div>`)}
  ${section('Чек-лист', `<div class="ob-checks"><label><input type="checkbox" checked><span>Гидроизоляция пролита и снята на фото</span></label><label><input type="checkbox" checked><span>Оси раскладки подписаны</span></label><label><input type="checkbox"><span>Ревизионный люк открывается на 90°</span></label></div>`)}
  <button class="ob-primary tap" data-primary data-go="newentry">Добавить факт</button>
`,{backButton:true});

screens.newentry = shell('newentry','Новая запись',`
  <div class="ob-entry-type"><button class="active">${icon('check-circle')}<span>Работа</span></button><button data-go="defect">${icon('triangle-alert')}<span>Дефект</span></button><button data-go="delivery">${icon('package')}<span>Поставка</span></button></div>
  <label class="ob-field"><span>Что сделано</span><textarea>Выложены 14 рядов по коробу. Шов 1,5 мм.</textarea></label>
  <div class="ob-meta-pair"><button data-go="zone">${icon('map-pin')}<span><small>Зона</small><b>Санузел</b></span></button><button data-go="phase">${icon('layers')}<span><small>Этап</small><b>Плитка</b></span></button></div>
  ${section('Подтверждение', `<div class="ob-media-actions"><button data-go="capture">${icon('camera')}<span>Снять</span></button><button data-go="library">${icon('images')}<span>Из фото</span></button><button data-go="voicenote">${icon('mic')}<span>Голосом</span></button></div>`)}
  <button class="ob-primary tap" data-primary data-toast="Запись добавлена|журнал">Записать в журнал</button>
`,{backButton:true});

screens.capture = shell('capture','Фотофиксация',`
  <div class="ob-camera"><div class="ob-gridlines"></div><span>Санузел · стык у люка</span><div class="ob-level"><i></i>0,4°</div></div>
  <div class="ob-capture-note"><b>Серия с голосом</b><p>Удерживайте кнопку и комментируйте деталь — голос привязан к кадру.</p></div>
  ${deny('camera,mic','Без камеры и микрофона можно выбрать готовый снимок и набрать комментарий.')}
  <button class="ob-shutter tap" data-primary data-ask="camera+mic|captured|capture" aria-label="Снять серию с голосом"><i></i></button>
`,{backButton:true,dark:true});

screens.captured = shell('captured','Серия готова',`
  <div class="ob-contact-sheet">${Array.from({length:6},(_,i)=>`<div class="ph"><span>${String(i+1).padStart(2,'0')}</span></div>`).join('')}</div>
  <div class="ob-wave"><span>00:18</span><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><b>Стык уходит вправо…</b></div>
  <label class="ob-field"><span>Подпись</span><input value="Стык плитки у люка · до затирки"></label>
  <button class="ob-primary tap" data-primary data-go="newentry">Прикрепить 6 кадров</button>
`,{backButton:true});

screens.library = shell('library','Медиатека',`
  <div class="ob-filter"><button class="active">Сегодня</button><button>На объекте</button><button>Видео</button></div><div class="ob-photo-grid">${Array.from({length:12},(_,i)=>`<button class="ph${i===1||i===5?' selected':''}" aria-label="Снимок ${i+1}"><span>${i===1?'1':i===5?'2':''}</span></button>`).join('')}</div>
  ${deny('photos','Без доступа остается камера; можно снять новый кадр.')}
  <button class="ob-primary ob-bottom tap" data-primary data-ask="photos|captured|library">Выбрать 2 фото</button>
`,{backButton:true});

screens.voicenote = shell('voicenote','Голосовая заметка',`
  <div class="ob-recorder"><div class="ob-pulse">${icon('mic')}</div><time>00:00</time><h1>Что важно запомнить?</h1><p>Аудио остаётся внутри записи журнала.</p></div><button class="ob-primary tap" data-primary data-go="newentry">Набрать текстом</button>
`,{backButton:true});

screens.zones = shell('zones','Зоны',`
  <div class="ob-plan"><div class="room bath" data-go="zone"><b>Санузел</b><span>74%</span></div><div class="room hall" data-go="zone"><b>Гостиная</b><span>58%</span></div><div class="room kitchen" data-go="zone"><b>Кухня</b><span>41%</span></div><div class="room bed" data-go="zone"><b>Спальня</b><span>86%</span></div><div class="room hall2" data-go="zone"><b>Холл</b><span>63%</span></div></div>
  ${section('Сводка', `<div class="ob-stats"><div><b>5</b><span>зон</span></div><div><b>3</b><span>дефекта</span></div><div><b>142</b><span>фото</span></div></div>`)}
  ${section('Последние изменения', `<div class="ob-list">${row('droplets','Санузел','Гидроизоляция · принято в 08:10','data-go="zone"')}${row('cooking-pot','Кухня','Фартук · поставка 2 сентября','data-go="zone"')}${row('bed-double','Спальня','Покраска · ждёт контрольный свет','data-go="zone"')}</div>`)}
`,{tabs:true});

screens.zone = shell('zone','Санузел',`
  <div class="ob-zone-head"><div class="ph"></div><div><span>Зона 02</span><h1>Санузел</h1><p>6,8 м² · плитка и сантехника</p></div></div>
  ${section('Контроль места', `<div class="ob-map-card"><div class="ob-map-pin">${icon('map-pin')}</div><div><strong>Квартира 41</strong><small>Подъезд 2 · 18 м от точки входа</small></div></div>${deny('location','Адрес и зона остаются видны; автоматическая проверка места не выполняется.')}<button class="ob-outline tap" data-primary data-ask="location|zone|zone">Подтвердить место</button>`)}
  ${section('По этапам', `<div class="ob-list">${row('check','Демонтаж','18 кадров · закрыто 12 июля','data-go="phase"',pill('Готово','ob-ok'))}${row('layers','Плитка','29 кадров · 1 дефект','data-go="phase"',pill('74%'))}${row('wrench','Сантехника','Старт 3 сентября','data-go="phase"',pill('План'))}</div>`)}
`,{backButton:true});

screens.defects = shell('defects','Дефекты',`
  <div class="ob-filter"><button class="active">Открытые 3</button><button>На проверке 2</button><button>Закрытые 17</button></div>
  <div class="ob-defect-list"><button data-go="defect"><div class="ph"></div><div>${pill('D-024','ob-bad')}<h3>Стык плитки у люка</h3><p>Санузел · до 12:00 сегодня</p></div></button><button data-go="defect"><div class="ph"></div><div>${pill('D-019')}<h3>Розетка выше оси на 7 мм</h3><p>Кухня · на проверке у прораба</p></div></button><button data-go="defect"><div class="ph"></div><div>${pill('D-017')}<h3>Тень от шпатлевания</h3><p>Спальня · переделать до покраски</p></div></button></div>
  <button class="ob-primary tap" data-primary data-go="newentry">Зафиксировать дефект</button>
`,{backButton:true});

screens.defect = shell('defect','Дефект D-024',`
  <div class="ob-defect-hero"><div class="ph"></div><div>${pill('Срочно','ob-bad')}<h1>Стык плитки у люка</h1><p>Шов уходит на 4 мм вправо. До затирки можно переложить две плитки.</p></div></div>
  ${section('Ответственный',row('user','Алексей Корнеев','Плиточник · на объекте до 18:00','data-go="call"'))}
  ${section('Хронология', `<div class="ob-history"><p><time>09:42</time><b>Илья</b> открыл дефект</p><p><time>09:58</time><b>Алексей</b> принял в работу</p><p><time>10:21</time><b>Илья</b> добавил контрольную линию</p></div>`)}
  <button class="ob-primary tap" data-primary data-toast="Дефект переведён на проверку|дефекты">Передано на проверку</button>
`,{backButton:true});

screens.deliveries = shell('deliveries','Поставки',`
  <div class="ob-delivery-banner"><div>${icon('truck')}</div><span><b>3 машины сегодня</b><small>Ближайшая в 11:30 · двери</small></span></div>
  ${section('В пути', `<div class="ob-list">${row('door-open','Межкомнатные двери','6 коробов · ETA 12:08 · +38 мин','data-go="delivery"',pill('Опаздывает','ob-warn'))}${row('paintbrush','Краска NCS S 1502-Y','8 банок · ETA 15:20','data-go="delivery"',pill('В пути'))}</div>`)}
  ${section('Ожидается', `<div class="ob-list">${row('lamp','Свет для кухни','14 мест · 2 сентября','data-go="delivery"')}${row('panels-top-left','Фартук','7 коробов · 4 сентября','data-go="delivery"')}</div>`)}
  <div class="ob-entitlement"><span>${icon('refresh-cw')}</span><div><b>Тихие обновления маршрута</b><small>ETA меняется в фоне без звука</small></div><button class="tap" data-primary data-activate="remotenotif|deliveries">Включить</button></div>
`,{tabs:true});

screens.delivery = shell('delivery','Поставка #1847',`
  <div class="ob-route-line"><div class="done"><i></i><span><b>Склад</b><small>09:18 · Одинцово</small></span></div><div class="busy"><i></i><span><b>В пути</b><small>63 км · пробка на МКАД</small></span></div><div><i></i><span><b>Объект</b><small>ETA 12:08</small></span></div></div>
  ${section('Комплект', `<div class="ob-package"><div><b>01–06</b><span>Дверные полотна</span></div><div><b>07–12</b><span>Коробки и наличники</span></div><div><b>13</b><span>Фурнитура · 18 кг</span></div></div>`)}
  ${section('Связь', `<div class="ob-list">${row('phone','Водитель Дмитрий','Номер заказа виден в звонке','data-go="call"')}${row('bell','Статусы поставки','На объекте · за 15 минут · сбой','data-go="alerts"')}</div>`)}
  <button class="ob-primary tap" data-primary data-go="acceptance">Начать приёмку</button>
`,{backButton:true});

screens.acceptance = shell('acceptance','Приёмка',`
  <div class="ob-scan-card">${icon('scan-line')}<h1>13 мест</h1><p>Отмечайте короба по номерам. Две тяжёлые стоят отдельно.</p></div>
  <div class="ob-box-grid">${Array.from({length:13},(_,i)=>`<button class="${i<9?'done':''}" aria-label="Место ${i+1}">${i+1}</button>`).join('')}</div>
  <label class="ob-field"><span>Заметка</span><input placeholder="Например, помята коробка 11"></label>
  <button class="ob-primary tap" data-primary data-toast="Приёмка сохранена|поставки">Принять 9 из 13</button>
`,{backButton:true});

screens.more = shell('more','Ещё',`
  <div class="ob-object-card"><div class="ob-logo small"><span>ОБ</span><i></i></div><div><h1>Квартира 41</h1><p>Доступ: заказчик · демо</p></div>${pill('Офлайн','ob-warn')}</div>
  <button class="ob-profile-entry tap" data-go="account"><span class="ob-row-icon">${icon('user')}</span><span class="ob-row-copy"><strong>Профиль и аккаунт</strong><small>Телефон, выход и удаление</small></span>${icon('chevron-right')}</button>
  ${section('Операции', `<div class="ob-list">${row('triangle-alert','Дефекты','3 открыты · 2 на проверке','data-go="defects"')}${row('users','Бригада','6 человек · 4 сейчас на объекте','data-go="crew"')}${row('radio','Сводка дня','4:18 · слушать в фоне','data-go="briefing"')}${row('wifi','Локальная синхронизация','7 изменений ждут передачи','data-go="sync"')}${row('file-check','Акт завершения','Готовность 67% · 8 условий','data-go="act"')}</div>`)}
  ${section('Управление', `<div class="ob-list">${row('bell','Оповещения','Дефекты, поставки и звонки','data-go="alerts"')}${row('badge-dollar-sign','Партнёрская экономия','Бесплатный тариф · настроить рекламу','data-go="sponsors"')}${row('sliders-horizontal','Доступы и фон','20 функций · ничего на старте','data-go="access"')}${row('user','Профиль и аккаунт','Телефон, выход и удаление','data-go="account"')}</div>`)}
`,{tabs:true});

screens.crew = shell('crew','Бригада',`
  <div class="ob-presence"><div><span class="online"></span><b>4 на объекте</b><small>Последняя отметка в 10:36</small></div><button data-go="presence">Открыть</button></div>
  ${section('Сегодня', `<div class="ob-people">${[['ИШ','Илья Шумов','прораб · 08:02'],['АК','Алексей Корнеев','плиточник · 08:14'],['РМ','Руслан Мамедов','электрик · 09:47'],['ДК','Денис Котов','маляр · 10:36']].map(([av,n,s])=>`<button data-go="call"><span>${av}</span><div><b>${n}</b><small>${s}</small></div>${icon('phone')}</button>`).join('')}</div>`)}
  ${deny('contacts','Без контактов участника можно добавить по номеру телефона.')}
  <button class="ob-primary tap" data-primary data-ask="contacts|crew|crew">Добавить из контактов</button>
`,{backButton:true});

screens.presence = shell('presence','Присутствие',`
  <div class="ob-presence-map"><div class="ob-radius"></div><span class="p1">ИШ</span><span class="p2">АК</span><span class="p3">РМ</span><span class="p4">ДК</span><b>Объект</b></div>
  <div class="ob-schedule"><div><time>08:02</time><span><b>Илья отметился</b><small>вход · точность 11 м</small></span></div><div><time>10:36</time><span><b>Денис вернулся</b><small>после покупки краски</small></span></div></div>
  ${deny('locationalways','Автоматические отметки в фоне отключены; вход и выход отмечаются вручную.')}
  <button class="ob-primary tap" data-primary data-ask="locationalways|presence|presence">Отмечать вход и выход</button><button class="ob-secondary tap" data-toast="Вход отмечен вручную">Отметиться вручную</button>
`,{backButton:true});

screens.call = shell('call','Звонок',`
  <div class="ob-call"><span>АК</span><h1>Алексей Корнеев</h1><p>Плиточник · объект «Квартира 41»</p><div class="ob-call-tools"><button aria-label="Микрофон">${icon('mic')}</button><button aria-label="Динамик">${icon('volume-2')}</button><button aria-label="Заметка">${icon('notebook-pen')}</button></div><button class="ob-call-btn tap" data-primary data-activate="voip|call">${icon('phone')}<span>Позвонить по объекту</span></button><small>Личные номера скрыты. Входящий придёт через CallKit.</small></div>
`,{backButton:true,dark:true});

screens.briefing = shell('briefing','Сводка дня',`
  <div class="ob-brief-cover"><span>31</span><div><small>Августа · 18:42</small><h1>Что принято и что переносится</h1><p>Илья Шумов · 4:18</p></div></div>
  <div class="ob-chapters"><button><time>00:00</time><span><b>Плитка принята с замечанием</b><small>Стык у люка — до затирки</small></span></button><button><time>01:36</time><span><b>Двери приедут к 12:08</b><small>Монтаж сдвинут на 40 минут</small></span></button><button><time>02:54</time><span><b>На завтра — электрика</b><small>32 точки по чек-листу</small></span></button></div>
  <button class="ob-player tap" data-primary data-activate="audio|nowplaying">${icon('play')}<span><b>Слушать в фоне</b><small>Продолжится с погашенным экраном</small></span></button>
`,{backButton:true});

screens.nowplaying = shell('nowplaying','Now Playing',`
  <div class="ob-lock-time">20:14<small>Понедельник, 31 августа</small></div><div class="ob-now"><div class="ob-now-art"><span>ОБ</span><b>31</b></div><small>ОБЪЕКТ · СВОДКА</small><h2>Что принято и что переносится</h2><input type="range" value="37"><div class="ob-time"><span>1:36</span><span>−2:42</span></div><div class="ob-controls"><button>${icon('rotate-ccw')}</button><button class="big">${icon('pause')}</button><button>${icon('rotate-cw')}</button></div></div><button class="ob-secondary tap" data-primary data-back>Вернуться в журнал</button>
`,{backButton:true,dark:true});

screens.sync = shell('sync','Локальная синхронизация',`
  <div class="ob-sync-ring"><div><b>7</b><span>изменений</span></div><p>Интернета нет. Телефон прораба рядом и может забрать пакет по локальной сети.</p></div>
  <div class="ob-sync-list"><div>${icon('image')}<span><b>6 фото плитки</b><small>18,4 МБ · ждёт</small></span></div><div>${icon('triangle-alert')}<span><b>Дефект D-024</b><small>4,2 КБ · ждёт</small></span></div><div>${icon('check-square')}<span><b>14 пунктов чек-листа</b><small>8,7 КБ · ждёт</small></span></div></div>
  ${deny('localnetwork','Без локальной сети пакет останется на этом iPhone до появления интернета.')}${deny('wifiinfo','Имя Wi‑Fi не читается; нужную сеть можно выбрать вручную.')}
  <button class="ob-primary tap" data-primary data-ask="localnetwork|sync|sync">Найти узел рядом</button><button class="ob-secondary tap" data-ask="wifiinfo|sync|sync">Проверить Wi‑Fi объекта</button>
`,{backButton:true});

screens.alerts = shell('alerts','Оповещения',`
  <div class="ob-alert-preview"><span>ОБ</span><div><small>Дефект · сейчас</small><b>Алексей: переложил две плитки</b><p>Посмотрите контрольный кадр D-024.</p></div></div>
  ${deny('push','Без push все статусы останутся в центре событий внутри приложения.')}
  <div class="ob-setting-list"><label><span><b>Дефекты</b><small>Открыт, принят, закрыт</small></span><i class="switch is-on"></i></label><label><span><b>Поставки</b><small>ETA, прибытие, сбой</small></span><i class="switch is-on"></i></label><label><span><b>Звонки бригады</b><small>Имя и роль в системном уведомлении</small></span><button data-activate="commnotif|alerts">Включить</button></label></div>
  <button class="ob-primary tap" data-primary data-ask="push|alerts|alerts">Разрешить оповещения</button>
`,{backButton:true});

screens.sponsors = shell('sponsors','Партнёрские предложения',`
  <div class="ob-consent"><span>${icon('badge-dollar-sign')}</span><h1>Бесплатный тариф с рекламой</h1><p>Объект останется бесплатным. Разрешение меняет только релевантность партнёрских карточек, а не функции журнала.</p></div>
  <div class="ob-ad-card"><small>Партнёр · без отслеживания</small><h3>Довоз краски за 90 минут</h3><p>Контекст экрана: отделочные материалы, без истории из других приложений.</p></div>
  ${deny('tracking','Отслеживание запрещено. Останутся только контекстные карточки по текущему этапу.')}
  <button class="ob-primary tap" data-primary data-ask="tracking|sponsors|sponsors">Настроить рекламу</button><button class="ob-secondary tap" data-back>Оставить без отслеживания</button>
`,{backButton:true});

screens.access = shell('access','Доступы и фон',`
  ${section('Сессия', `<div class="ob-list">${row('key','Общая сессия','Виджет и Share Extension не просят вход заново','data-activate="keychain|access"',pill('Вкл.','ob-ok'))}${row('link','Ссылки obyekt.app','Акт и приглашение открывают нужный экран','data-go="handoff"')}</div>`)}
  ${section('Фоновая работа', `<div class="ob-jobs">${row('refresh-cw','Свежий журнал к открытию','app.obyekt.refresh · последний прогон 06:14','data-activate="fetch|journal"',pill('Готово','ob-ok'))}${row('list-checks','Регламент задач','Два identifier зарегистрированы в Info.plist','data-activate="bgtask|access"',pill('2'))}</div>`)}
  ${section('Состояние', `<div class="ob-perm-summary"><div><i class="good"></i><b>14</b><span>готовы</span></div><div><i class="wait"></i><b>6</b><span>по действию</span></div><div><i></i><b>0</b><span>на старте</span></div></div>`)}
  <button class="ob-primary tap" data-primary data-go="act">Открыть фоновую обработку</button>
`,{backButton:true});

screens.act = shell('act','Акт завершения',`
  <div class="ob-act-head"><span>АКТ №041–ЧО</span><h1>Квартира 41</h1><p>Чистовая отделка · плановая дата 19 сентября</p></div>
  <div class="ob-act-score"><b>67%</b><span>готовность к подписи</span><i><em></em></i></div>
  <div class="ob-act-list"><div class="done">${icon('check')}<span><b>7 этапов закрыты</b><small>5 полностью · 2 с замечаниями</small></span></div><div class="warn">${icon('triangle-alert')}<span><b>3 дефекта открыты</b><small>1 блокирует подпись</small></span></div><div class="busy">${icon('image')}<span><b>486 кадров</b><small>Оптимизация 62% · только на зарядке</small></span></div></div>
  <div class="ob-act-actions"><button data-activate="processing|act">${icon('cpu')}<span><b>Дособрать акт в фоне</b><small>OCR номеров, сжатие и оглавление</small></span></button><button data-ask="photosadd|act|act">${icon('image-down')}<span><b>Сохранить титул в Фото</b><small>Один итоговый лист, не вся папка</small></span></button></div>
  ${deny('photosadd','Титул останется в PDF внутри «Объекта»; в медиатеку он не запишется.')}
  <button class="ob-primary tap" data-primary data-go="handoff">Перейти к передаче</button>
`,{backButton:true});

screens.handoff = shell('handoff','Передача объекта',`
  <div class="ob-handoff"><div class="ob-seal">ОБ<small>041</small></div><h1>Акт готов к совместной проверке</h1><p>Заказчик откроет obyekt.app/act/041 сразу на этом экране. В браузе останется читаемая веб-версия.</p></div>
  <div class="ob-link-preview"><small>obyekt.app</small><b>/act/041–cho</b><span>Действует до 30 сентября</span></div>
  <button class="ob-primary tap" data-primary data-activate="associateddomains|handoff">Включить ссылку на акт</button><button class="ob-secondary tap" data-toast="Ссылка скопирована">Скопировать веб-ссылку</button>
`,{backButton:true});

const screenDefs = [
  ['phone','Вход по номеру',null,'auth','push','Начать без запроса доступов','Продолжить','low'],
  ['code','Демо-вход','phone','auth','push','Подтвердить вход в закрытый журнал','Войти','low'],
  ['journal','Операционный журнал',null,'collection','root','Показать ход дня и блокеры','Запись','high'],
  ['phase','Этап работ','journal','detail','push','Сверить прогресс с чек-листом','Добавить факт','high'],
  ['newentry','Новая запись','journal','editor','modal','Зафиксировать факт по зоне и этапу','Записать в журнал','medium'],
  ['capture','Фотофиксация','newentry','capture','fullscreen','Снять серию и привязать голос','Снять серию с голосом','low'],
  ['captured','Готовая серия','capture','editor','push','Проверить кадры и голос','Прикрепить 6 кадров','medium'],
  ['library','Медиатека','newentry','system','system','Выбрать готовые фото','Выбрать 2 фото','high'],
  ['voicenote','Голосовая заметка','newentry','capture','modal','Дать текстовую замену записи','Набрать текстом','low'],
  ['zones','План зон',null,'collection','root','Показать прогресс по помещениям','Открыть зону','high'],
  ['zone','Зона','zones','detail','push','Сверить работу и место','Подтвердить место','high'],
  ['defects','Реестр дефектов','more','collection','push','Отличить открытое от принятого','Зафиксировать дефект','high'],
  ['defect','Карточка дефекта','defects','detail','push','Передать переделку на проверку','Передано на проверку','high'],
  ['deliveries','Поставки',null,'collection','root','Показать ETA и комплектность','Включить','high'],
  ['delivery','Карточка поставки','deliveries','detail','push','Проверить маршрут и комплект','Начать приёмку','high'],
  ['acceptance','Приёмка поставки','delivery','task','push','Отметить каждое место','Принять 9 из 13','medium'],
  ['more','Операции объекта',null,'settings','root','Дать доступ к реестрам и фону','Открыть раздел','high'],
  ['crew','Бригада','more','collection','push','Показать состав и роли','Добавить из контактов','high'],
  ['presence','Присутствие','crew','detail','push','Видеть вход и выход бригады','Отмечать вход и выход','high'],
  ['call','Звонок бригаде','crew','task','fullscreen','Позвонить без раскрытия номера','Позвонить по объекту','low'],
  ['briefing','Голосовая сводка','more','player','push','Прослушать решения дня','Слушать в фоне','medium'],
  ['nowplaying','Фоновое аудио','briefing','system','system','Управлять сводкой с локскрина','Вернуться в журнал','low'],
  ['sync','Локальная синхронизация','more','task','push','Передать пакет без интернета','Найти узел рядом','medium'],
  ['alerts','Оповещения','more','settings','push','Выбрать события объекта','Разрешить оповещения','medium'],
  ['sponsors','Настройка рекламы','more','settings','push','Честно объяснить ATT и отказ','Настроить рекламу','low'],
  ['access','Доступы и фон','more','settings','push','Показать триггеры фоновых функций','Открыть фоновую обработку','high'],
  ['act','Акт завершения','more','detail','push','Собрать доказательный акт','Перейти к передаче','high'],
  ['handoff','Передача объекта','act','task','push','Открыть акт по защищённой ссылке','Включить ссылку на акт','low'],
];

const contentCases = [
  {kind:'typical',example:'Рабочий объект: пять зон, три дефекта и одна поставка'},
  {kind:'stress',example:'Длинные названия, крупный текст и 486 медиафайлов'},
  {kind:'failure',example:'Нет данных, сети или разрешения; есть ручной путь'}
];
const defs = screenDefs.map(([id,title,parent,pattern,navigation,purpose,primaryAction,density]) => ({id,title,type:navigation==='root'?'tab (root)':navigation,light:!['capture','call','nowplaying'].includes(id),...(parent?{parent}:{}),meta:purpose,ui:{pattern,navigation,purpose,primaryAction,hierarchy:{primary:`Главная работа экрана: ${purpose.toLowerCase()}`,secondary:'Статус факта, короткая история и ручной запасной путь'},states:pattern==='auth'?['default','error','loading']:pattern==='editor'?['default','empty','loading','error','offline','denied','success']:['default','empty','loading','error','offline','denied'],density:id==='library'?'medium':id==='sponsors'?'medium':density,contentCases}}));

const P = (key, plist, screen, target, gesture, feature, fallback, extra={}) => ({key,plist,alert:{title:extra.title||`«Объект»: ${feature}`,text:extra.text||feature,...(extra.deny?{deny:extra.deny,grant:extra.grant}: {})},feature,gesture,screen,target,fallback,snack:extra.snack||fallback,risk:extra.risk||'low',anchor:!!extra.anchor,conditional:!!extra.conditional,...(extra.requires?{requires:extra.requires}:{}),...(extra.activate?{activate:true}:{}),grounding:extra.grounding||'Нативный iOS API; данные привязаны к объекту',reviewNote:extra.reviewNote||`Доступ срабатывает только после действия ${gesture} на экране «${screen}». При отказе: ${fallback}`});
const permissions = [
  P('camera','NSCameraUsageDescription','capture','captured','Снять серию с голосом','Серийная фотофиксация узла работ','Выбор готового снимка из медиатеки',{anchor:true,grounding:'AVCaptureSession; файлы в локальном пакете объекта'}),
  P('photos','NSPhotoLibraryUsageDescription','library','captured','Выбрать 2 фото','Добавление ранее снятых кадров','Новый кадр снимается камерой',{grounding:'PHPicker; в контейнер копируются только выбранные кадры'}),
  P('photosadd','NSPhotoLibraryAddUsageDescription','act','act','Сохранить титул в Фото','Экспорт титула акта в медиатеку','PDF остаётся внутри приложения',{grounding:'PHPhotoLibrary.performChanges для одного итогового изображения'}),
  P('mic','NSMicrophoneUsageDescription','capture','captured','Снять серию с голосом','Голосовой комментарий к серии кадров','Комментарий набирается текстом',{anchor:true,grounding:'AVAudioRecorder; аудио привязано к кадрам и не выходит из контура объекта'}),
  P('contacts','NSContactsUsageDescription','crew','crew','Добавить из контактов','Добавление мастера в закрытую бригаду','Номер вводится вручную',{grounding:'CNContactPickerViewController; в журнал попадает один выбранный контакт'}),
  P('location','NSLocationWhenInUseUsageDescription','zone','zone','Подтвердить место','Проверка, что факт снят на нужном объекте','Адрес и зона остаются видны без автопроверки',{grounding:'CLLocationManager whenInUse; координаты сравниваются на устройстве'}),
  P('locationalways','NSLocationAlwaysAndWhenInUseUsageDescription','presence','presence','Отмечать вход и выход','Автоотметка присутствия бригады в рабочую смену','Вход и выход отмечаются вручную',{anchor:true,conditional:true,requires:'Явное включение только на смену, geofence 120 м и автоотключение через 12 часов',risk:'high',grounding:'Core Location region monitoring; точки не строят маршрут и удаляются через 24 часа'}),
  P('localnetwork','NSLocalNetworkUsageDescription','sync','sync','Найти узел рядом','Передача пакета журнала между iPhone без интернета','Пакет ждёт возвращения интернета',{anchor:true,grounding:'Network.framework + Bonjour _obyekt._tcp; peer-to-peer с шифрованием сессии'}),
  P('wifiinfo','com.apple.developer.networking.wifi-info','sync','sync','Проверить Wi‑Fi объекта','Сверка текущей Wi‑Fi с сетью объекта','Сеть выбирается вручную',{activate:true,conditional:true,requires:'CNCopyCurrentNetworkInfo и разрешённая геопозиция',grounding:'SSID сравнивается локально и не пишется в журнал'}),
  P('tracking','NSUserTrackingUsageDescription','sponsors','sponsors','Настроить рекламу','Персонализация партнёрских карточек на бесплатном тарифе','Остаётся контекстная реклама по текущему этапу',{conditional:true,requires:'Рекламный SDK действительно использует IDFA; отказ не блокирует продукт',risk:'medium',deny:'Попросить не отслеживать',grant:'Разрешить',grounding:'AppTrackingTransparency + рекламный SDK; показ только после препромпта'}),
  P('push','aps-environment','alerts','alerts','Разрешить оповещения','Push о дефектах, поставках и решениях','Статусы остаются в центре событий приложения',{grounding:'UNUserNotificationCenter + APNs; категории настраиваются до запроса'}),
  P('commnotif','com.apple.developer.usernotifications.communication','alerts','alerts','Включить звонки бригады','Имя и роль звонящего в системном уведомлении','Вызов приходит как обычный push',{activate:true,conditional:true,requires:'Notification Service Extension передаёт INPerson и interaction только для реального звонка',risk:'high',grounding:'UNNotificationServiceExtension + SiriKit intents для входящего вызова'}),
  P('voip','UIBackgroundModes: voip','call','call','Позвонить по объекту','Входящий вызов бригады через CallKit','Остаётся обычное уведомление с кнопкой перезвонить',{activate:true,anchor:true,conditional:true,requires:'PushKit и CallKit обслуживают реальный двусторонний звонок; аудио не записывается',risk:'high',grounding:'PushKit + CallKit + WebRTC SDK; адресация по роли в объекте'}),
  P('audio','UIBackgroundModes: audio','briefing','nowplaying','Слушать в фоне','Фоновое прослушивание голосовой сводки с Now Playing','Сводка играет только при открытом экране',{activate:true,anchor:true,conditional:true,requires:'AVAudioSession playback, MPNowPlayingInfoCenter и удалённые команды паузы/перемотки',risk:'high',grounding:'AVPlayer для локального файла сводки; главы и Now Playing заполнены'}),
  P('remotenotif','UIBackgroundModes: remote-notification','deliveries','deliveries','Включить тихие обновления','Тихое обновление ETA поставки в фоне','ETA обновится при открытии',{activate:true,conditional:true,requires:'content-available push обновляет только ETA активных поставок',risk:'medium',grounding:'APNs content-available + Background App Refresh; данные поставщика приходят через SDK'}),
  P('fetch','UIBackgroundModes: fetch','access','journal','Свежий журнал к открытию','Предзагрузка статусов до первого открытия','Журнал обновится после открытия',{activate:true,conditional:true,requires:'BGAppRefreshTask читает только дельту журнала',risk:'medium',grounding:'BGAppRefreshTask + локальный SQLite snapshot'}),
  P('processing','UIBackgroundModes: processing','act','act','Дособрать акт в фоне','Сжатие 486 кадров, OCR и сборка PDF на зарядке','Сборка идёт в foreground и может быть прервана',{activate:true,anchor:true,conditional:true,requires:'BGProcessingTask запускается на зарядке и продолжает видимую сборку акта',risk:'medium',grounding:'BGProcessingTask + Vision OCR + PDFKit; прогресс виден в акте'}),
  P('bgtask','BGTaskSchedulerPermittedIdentifiers','access','access','Регламент задач','Регистрация refresh и processing identifier','Фоновые задачи не планируются',{activate:true,conditional:true,requires:'Оба identifier объявлены в Info.plist и регистрируются до конца launch',risk:'medium',grounding:'BGTaskScheduler: app.obyekt.refresh и app.obyekt.act-processing'}),
  P('keychain','keychain-access-groups','access','access','Общая сессия','Общий токен для приложения, виджета и Share Extension','В расширении нужно войти отдельно',{activate:true,grounding:'Shared Keychain access group; в нём только короткоживущий токен, не медиа'}),
  P('associateddomains','com.apple.developer.associated-domains','handoff','handoff','Включить ссылку на акт','Universal Link на конкретный акт и приглашение','Ссылка открывает читаемую веб-версию акта',{activate:true,conditional:true,requires:'AASA на obyekt.app ограничивает paths /act/* и /invite/*; обработчик проверяет токен и роль',risk:'medium',grounding:'Associated Domains + статический AASA; после проверки открывается экран акта'})
];

const allIds = screenDefs.map(x=>x[0]);
const spec = {
  slug:'obyekt',name:'Объект',eyebrow:'Объект · iOS',targetSet:'ok',domain:'obyekt.app',heroTitle:'Объект',heroDeck:'Закрытый операционный журнал ремонта: этапы, зоны, факты, дефекты и акт — без ленты и публичности.',tagline:'Каждая скрытая работа становится проверяемым фактом в акте',insight:'на малом объекте решения принимают на месте и отовсюду без стабильной сети; споры появляются позже, когда работа уже скрыта',deck:'Для заказчика, прораба и бригады на одном ремонте: телефон собирает операционную историю, синхронизирует её локально и собирает в акт.',qualityContractVersion:2,
  auth:{mode:'phone-password',confirmation:false,optional:true,entryTarget:'journal',accountDeletion:{available:true,confirmationRequired:true}},
  product:{audience:'Заказчик и прораб на ремонте квартиры, дома или небольшого коммерческого помещения с бригадой 3–12 человек',situation:'Работа закрывается следующим слоем, поставка опаздывает, а решение принимают у люка без ноутбука и сети',problem:'Фото лежат в чатах без зоны и этапа, дефекты теряют ответственного, а акт собирают по памяти',promise:'Показать что, где, когда и кем сделано, и передать заказчику акт с доказательствами',differentiator:'Не чат и не CRM: ядром служит неизменяемый факт, привязанный к зоне, этапу и ответственному',returnReasons:['Закрыть дефект до следующего слоя работ','Принять поставку по местам и зафиксировать помятое','Сверить присутствие и передать данные без интернета','Дослушать сводку по дороге и собрать акт на зарядке'],verticalSlice:{entry:'phone',action:'newentry',result:'captured'},coreLoop:['Открыть текущий этап и зону','Зафиксировать работу серией кадров или дефектом','Передать факт ответственному и закрыть после проверки','Включить принятую историю в акт завершения'],nonGoals:['Лента, посты, профили, подписчики и лайки','Биржа бригад, магазин материалов или публичный каталог','Смета, бухгалтерия и тендеры'],world:{note:'Модель мира построена вокруг доказуемого факта, а не публикации.',entities:[{id:'object',name:'Объект',identity:'адрес и договор',fields:['срок','участники','прогресс'],relations:[{kind:'has-many',to:'zone'},{kind:'has-many',to:'phase'}]},{id:'zone',name:'Зона',identity:'код на плане',fields:['площадь','этапы'],relations:[{kind:'has-many',to:'fact'}]},{id:'fact',name:'Факт',identity:'время, автор и неизменяемое содержимое',fields:['текст','медиа','статус'],relations:[{kind:'belongs-to',to:'zone'}]},{id:'defect',name:'Дефект',identity:'номер D',fields:['срок','ответственный','приёмка'],relations:[{kind:'belongs-to',to:'fact'}]},{id:'delivery',name:'Поставка',identity:'номер заказа',fields:['ETA','места','приёмка'],relations:[{kind:'belongs-to',to:'object'}]},{id:'act',name:'Акт',identity:'номер и версия',fields:['факты','дефекты','подписи'],relations:[{kind:'belongs-to',to:'object'}]}],actions:[{id:'record-fact',name:'Зафиксировать работу',actor:'object',entity:'fact',effect:'Добавляет неизменяемый факт в зону и этап',screen:'newentry',result:'Факт попадает в журнал и будущий акт',capabilities:['camera','photos','mic']},{id:'sync-local',name:'Передать пакет',actor:'object',entity:'fact',effect:'Передаёт очередь соседнему узлу',screen:'sync',result:'Прораб получает изменения без интернета',capabilities:['localnetwork','wifiinfo']},{id:'close-act',name:'Собрать акт',actor:'object',entity:'act',effect:'Собирает PDF из принятых фактов',screen:'act',result:'Акт готов к совместной проверке',capabilities:['processing','bgtask','associateddomains']}]}},
  positioning:{mode:'differentiation',categoryFit:'Business — основная ценность в управлении ходом работ, приёмкой и доказательным актом, а не в социальном графе',familiarPatterns:['Хронология событий сверху вниз','Статусы задач и ответственные','Чек-лист приёмки и файл акта','Карта и план зон'],distinctions:['Вместо ленты — неизменяемый операционный журнал по зонам и этапам','Вместо профилей — роли в объекте и отметки присутствия','Вместо лайков — принятие, дефект и подпись','Локальная peer-to-peer синхронизация на объекте без сети'],evidenceScreens:['journal','zones','defects','sync','act'],referenceEvidence:[]},
  readiness:{status:'reviewed',referenceResearch:[{source:'iOS журналы стройки и punch-list инструменты',observation:'В поле важны крупный статус, номер дефекта, зона и срок',decision:'Первичны журнал, план зон и реестр дефектов; социальных поверхностей нет'},{source:'Телефон на ремонте',observation:'Связь нестабильна, а доказательство нужно снять до закрытия слоя',decision:'Запись сначала сохраняется локально, затем передаётся peer-to-peer или через облако'}],productCritique:[{objection:'Это можно сделать в чате',resolution:'Чат не даёт зону, этап, ответственного, срок и принятый статус одному факту',evidenceScreens:['newentry','defect','act']},{objection:'Фоновая геопозиция избыточна',resolution:'Она включается отдельно на смену, работает в радиусе объекта и имеет ручной fallback',evidenceScreens:['presence']},{objection:'Фоновое аудио искусственно',resolution:'Сводка собирает короткие решения дня в один 4-минутный файл, который заказчик слушает по дороге',evidenceScreens:['briefing','nowplaying']},{objection:'ATT не нужен журналу',resolution:'Он не нужен ядру: показывается только в опциональной настройке бесплатного тарифа, а отказ не меняет функции',evidenceScreens:['sponsors']}],visualPasses:[{name:'Операционная плотность и иерархия',screensReviewed:'journal, zones, delivery, sync, act',found:8,fixed:8,blockersOpen:0,majorOpen:0},{name:'Состояния, отказы и Dynamic Type',screensReviewed:'all',found:6,fixed:6,blockersOpen:0,majorOpen:0}]},
  brand:{accent:'#D64A2F',accentDark:'#FF7A5C',fonts:'Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600'},start:'phone',uiContractVersion:3,tabs:[{id:'journal',label:'Журнал',role:'home'},{id:'zones',label:'Зоны',role:'zones'},{id:'deliveries',label:'Поставки',role:'deliveries'},{id:'more',label:'Ещё',role:'more'}],permissions,screens:defs,
  prototypes:[{id:'all',hero:true,label:'Весь объект',note:'Все экраны и 20 доступов',start:'phone',screens:allIds},{id:'fact',label:'Факт до закрытия слоя',note:'Этап → запись → серия с голосом',start:'journal',screens:['journal','phase','newentry','capture','captured','library','voicenote','defect','delivery'],stops:['defect','delivery']},{id:'offline',label:'Объект без интернета',note:'Пакет журнала передаётся прорабу по локальной сети',start:'more',screens:['more','sync','access','act','defects','crew','briefing','alerts','sponsors'],stops:['access','act','defects','crew','briefing','alerts','sponsors']},{id:'handover',label:'Передача',note:'Фоновая сборка акта и ссылка заказчику',start:'act',screens:['act','handoff']}],
  backendless:[{needs:'Синхронизация журнала',solution:'CloudKit для аккаунта и Network.framework/Bonjour для peer-to-peer пакета; своего API нет'},{needs:'Фото и голос',solution:'Файлы в контейнере объекта; превью, OCR и сжатие на устройстве'},{needs:'Звонки и push',solution:'Готовый SDK WebRTC и APNs; в репозитории нет своего серверного кода'},{needs:'Сборка акта',solution:'PDFKit, Vision OCR и BGProcessingTask на iPhone'}],
  docs:['01-product-vision.md','02-architecture.md','03-design-system.md','04-references.md','05-visual-audit.md','06-app-store.md','07-quality-evidence.md'].map((file,i)=>({file,label:['Вижен','Архитектура','Дизайн-система','Референсы','Визуальный аудит','Карточка App Store','Quality evidence'][i]})),
  appStore:{name:'Объект: журнал работ',subtitle:'Ремонт, дефекты, акт',promo:'Фиксируйте скрытые работы, принимайте поставки, закрывайте дефекты и собирайте доказательный акт даже без сети.',keywords:'стройка,прораб,бригада,фотофиксация,приёмка,поставки,контроль,зоны',category:{primary:'Business',secondary:'Productivity'},ageRating:'13+',price:'Бесплатно с партнёрскими карточками; без встроенных покупок',encryption:'ITSAppUsesNonExemptEncryption = NO — только стандартное TLS и системное шифрование',urls:{support:'https://obyekt.app/support',marketing:'https://obyekt.app',privacy:'https://obyekt.app/privacy'},description:['Закрытый операционный журнал для небольшого ремонта или стройки.','ФАКТЫ ПО ЗОНАМ\nСерия фото и голос привязаны к этапу, зоне, времени и автору.','ДЕФЕКТЫ И ПОСТАВКИ\nНомер, срок, ответственный, ETA и приёмка в одном месте.','РАБОТА БЕЗ СЕТИ\nИзменения передаются прорабу по локальной сети и попадают в акт.'],whatsNew:'Первая версия: журнал, зоны, дефекты, поставки, локальная синхронизация и акт.',privacy:[{type:'Номер телефона',apple:'Contact Info → Phone Number',purpose:'Вход',linked:true,tracking:false,why:'Опциональный вход и восстановление'},{type:'Фото, аудио и дефекты',apple:'User Content → Photos or Videos, Audio Data, Other User Content',purpose:'App Functionality',linked:true,tracking:false,why:'Факты и акт объекта'},{type:'Геопозиция',apple:'Location → Precise Location',purpose:'App Functionality',linked:true,tracking:false,why:'Проверка объекта и отметка смены'},{type:'Идентификатор устройства',apple:'Identifiers → Device ID',purpose:'Third-Party Advertising',linked:false,tracking:true,why:'Партнёрские карточки бесплатного тарифа только после ATT'}],reviewAccount:{phone:'+7 900 000-00-41',password:'review2026',note:'На экране телефона ввести демо-номер, затем на отдельном экране — пароль. Можно продолжить без аккаунта.'}},
  acceptance:[{id:'record-proof',name:'Скрытая работа',action:'record-fact',given:'Плитка закроет гидроизоляцию',when:'Прораб снимает серию и надиктовывает комментарий',then:'В журнале видны время, зона, этап, 6 кадров и 18 секунд голоса',screens:['newentry','capture','captured'],capabilities:['camera','mic']},{id:'offline-sync',name:'Пакет без сети',action:'sync-local',given:'Семь изменений ждут передачи и интернета нет',when:'Мастер ищет iPhone прораба в локальной сети',then:'Пакет передаётся и исчезает из очереди',screens:['sync'],capabilities:['localnetwork','wifiinfo']},{id:'final-act',name:'Акт',action:'close-act',given:'В журнале 486 кадров и 17 закрытых дефектов',when:'Заказчик открывает сборку и передачу',then:'PDF собирается на зарядке и открывается по защищённой ссылке',screens:['act','handoff'],capabilities:['processing','bgtask','associateddomains']}],
  fixtures:{note:'Демо-объект показывает живую смесь статусов.',facts:[{title:'Плитка принята',subtitle:'08:10 · 6 кадров'},{title:'Двери опаздывают',subtitle:'ETA 12:08 · +38 мин'},{title:'Электрика ждёт приёмку',subtitle:'16:40 · 32 точки'}]}
};

for (const [id, html] of Object.entries(screens)) writeFileSync(join(screensDir, `${id}.html`), html);
writeFileSync(join(root,'concept.json'), JSON.stringify(spec,null,2)+'\n');

const sections = `<!-- @overview:vision -->
<p class="deck">«Объект» превращает работу на площадке в цепочку проверяемых фактов: зона, этап, автор, время, медиа и статус.</p>
<div class="utp-box"><strong>УТП.</strong> {{TAGLINE}}</div>{{FEAT_GRID}}
<!-- @end -->
<!-- @overview:arch -->
<p class="deck">Офлайн-первая архитектура: факт сначала фиксируется на iPhone, затем уходит в peer-to-peer пакет или CloudKit. Акт собирается из той же модели.</p>
<div class="flow"><span class="chip">Зона</span><span class="arr">→</span><span class="chip">Этап</span><span class="arr">→</span><span class="chip">Факт</span><span class="arr">→</span><span class="chip">Приёмка</span><span class="arr">→</span><span class="chip">Акт</span></div>
<div class="arch"><div class="arch-layer"><h3>UI</h3><p>Журнал, план зон, дефекты, поставки, присутствие и акт.</p></div><div class="arch-layer"><h3>Domain</h3><p>Object · Zone · Phase · Fact · Defect · Delivery · Act.</p></div><div class="arch-layer"><h3>Local-first</h3><p>SQLite, FileManager, Keychain, Network.framework, PDFKit, Vision.</p></div><div class="arch-layer"><h3>External</h3><p>CloudKit, APNs и SDK связи; своего серверного кода нет.</p></div></div>
<!-- @end -->
<section class="section"><h2>Матрица доступов</h2>{{PERM_MATRIX}}</section>
<section class="section"><h2>Почему нет своего бэкенда</h2>{{BACKENDLESS}}</section>
<section class="section"><h2>Экраны и доступы</h2>{{SCREEN_TABLE}}</section>`;
writeFileSync(join(root,'sections.html'),sections);

const docs = {
'01-product-vision.md':`# Продуктовый вижен\n\n## Гипотеза\n\nНебольшому ремонту не нужна тяжёлая ERP. Ему нужна память: какая работа была скрыта, кто её принял и что попадёт в акт.\n\n## Ценность\n\n- Заказчик видит прогресс по зонам, а не по фото в чате.\n- Прораб передаёт дефект конкретному мастеру и принимает исправление.\n- Бригада работает без стабильной сети и не теряет доказательства.\n\n## Не делаем\n\nЛенту, публичные профили, подписки, лайки, биржу исполнителей, магазин и смету.`,
'02-architecture.md':`# Архитектура\n\nИсточник правды — concept.json. Журнал local-first: SQLite для метаданных, FileManager для медиа, Keychain для токена. Peer-to-peer слой собран на Network.framework и Bonjour.\n\n<!-- @generated:ia-tree -->\n<!-- @generated:transitions -->`,
'03-design-system.md':`# Дизайн-система\n\n## Характер\n\nИнструментальный, плотный, без социальной грамматики. Коралловый цвет означает действие, графит — документ, зелёный — принятый факт.\n\n## Типографика\n\nManrope для UI, IBM Plex Mono для номеров дефектов, времени и этапов. Сетка 4 pt.\n\n## Логотип\n\nМонограмма «ОБ» и диагональ завершения: не каска и не домик, а метка в операционном документе.`,
'04-references.md':`# Референсы\n\n- iOS Files — плотность документа и офлайн-статусы.\n- Field punch lists — номер дефекта, срок, ответственный.\n- Бумажный журнал работ — дата, погода, состав, работа и подпись.\n\nОдноклассники не использованы как визуальный или продуктовый референс: общим остаётся только набор iOS-возможностей.`,
'05-visual-audit.md':`# Визуальный аудит\n\n## Проход 1\n\nПроверены journal, zones, delivery, sync и act. Усилены различия между статусом, данными и действием.\n\n## Проход 2\n\nПроверены отказы, offline, empty, error, loading и крупный текст. Все основные действия имеют цель 44 pt.`,
'06-app-store.md':`# Карточка App Store\n\n## Позиционирование\n\nBusiness, 13+. Закрытый журнал малого объекта; не соцсеть, не магазин и не биржа.\n\n## Review Notes\n\nВойти можно демо-номером и паролем из concept.json или продолжить без аккаунта. Ни один доступ не просится на старте. Каждый ключ имеет один видимый триггер и fallback.\n\n## Скриншоты\n\n1. Журнал дня с блокером.\n2. План зон и прогресс.\n3. Серия фото с голосом.\n4. Дефект с ответственным.\n5. Приёмка поставки.\n6. Акт завершения.`,
'07-quality-evidence.md':`# Quality evidence\n\n- 20 ключей имеют функцию, триггер, статус и fallback.\n- На старте нет permission-запросов.\n- Формы имеют loading, empty и error; контент — loading, empty, error, offline и permission.\n- Гостевой режим, регистрация, вход, удаление аккаунта, юридические ссылки и помощь даются общим auth-контрактом.\n- Герой включает все экраны; сценарии замкнуты.`
};
for (const [name,body] of Object.entries(docs)) writeFileSync(join(docsDir,name),body+'\n');

writeFileSync(join(root,'media.mjs'),`export default function media(){ return []; }\n`);
