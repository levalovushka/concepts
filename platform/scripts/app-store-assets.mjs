#!/usr/bin/env node
/**
 * App Store screenshots from the same live prototype used by the launcher.
 *
 *   node scripts/app-store-assets.mjs scene
 *   node scripts/app-store-assets.mjs scene --template studio
 *   node scripts/app-store-assets.mjs scene --screens home,watch,moment
 *
 * The generator deliberately keeps the composition in HTML/CSS. It makes the
 * result reproducible, reviewable and portable between concepts without a
 * Figma file or manually maintained device mockups.
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { build } from './build.mjs';
import { conceptDir, esc, readSpec } from './lib.mjs';

export const TEMPLATES = ['studio'];

export const DEVICE_TARGETS = {
  'iphone-6.9': {
    label: 'iPhone 6.9″', width: 1320, height: 2868, source: 'phone', orientation: 'portrait', required: true,
  },
  'iphone-6.5': {
    label: 'iPhone 6.5″', width: 1284, height: 2778, source: 'phone', orientation: 'portrait', required: false,
  },
  'iphone-6.3': {
    label: 'iPhone 6.3″', width: 1206, height: 2622, source: 'phone', orientation: 'portrait', required: false,
  },
  'iphone-6.1': {
    label: 'iPhone 6.1″', width: 1170, height: 2532, source: 'phone', orientation: 'portrait', required: false,
  },
  'ipad-13-landscape': {
    label: 'iPad 13″', width: 2752, height: 2064, source: 'ipad', orientation: 'landscape', required: true,
  },
};

const fallbackScreens = (spec) => {
  const candidates = [
    ...(spec.positioning?.evidenceScreens || []),
    spec.product?.verticalSlice?.action,
    spec.product?.verticalSlice?.result,
    ...(spec.screens || []).map((screen) => screen.id),
  ].filter(Boolean);
  return [...new Set(candidates)].filter((id) => !['phone', 'password', 'register', 'registerpassword', 'account', 'deleteaccount'].includes(id)).slice(0, 5);
};

const copyWords = (value) => String(value || '')
  .toLocaleLowerCase('ru-RU')
  .replace(/[^a-zа-яё0-9\s-]/giu, ' ')
  .split(/\s+/)
  .filter((word) => word.length > 3)
  .map((word) => word.slice(0, 5));

const humanizeTechnicalCopy = (value) => String(value || '')
  .replace(/\b(?:Photo Library|PHPicker|UIDocumentPicker)\b/giu, 'медиатека')
  .replace(/\b(?:Location|MapKit|MKLocalSearch)\b/giu, 'карта')
  .replace(/\baps-environment\b/giu, 'уведомления')
  .replace(/\bon-device\b/giu, 'на устройстве')
  .replace(/\boffline\b/giu, 'без сети')
  .replace(/\b(?:Core Data|FileManager|MPNowPlayingInfoCenter|FTS|ID3|MP4|SDK|API)\b/giu, '')
  .replace(/\bPhotos\b/giu, 'медиатеки')
  .replace(/\bFiles\b/giu, 'файлов')
  .replace(/\bTempo\b/giu, 'Темп')
  .replace(/\bmood tags\b/giu, 'настроение')
  .replace(/root-разделе/giu, 'главном разделе')
  .replace(/корень IA/giu, 'главный экран')
  .replace(/\s+·\s+/gu, ' и ')
  .replace(/\s{2,}/g, ' ')
  .trim();

const COPY_DANGLING_WORD = /(?:^|\s)(?:а|без|в|во|да|для|до|за|и|из|или|к|ко|на|над|не|но|о|об|от|по|под|при|про|с|со|у|что|чтобы|через)$/iu;

const firstSentence = (value, maxWords = 12) => {
  const sentence = humanizeTechnicalCopy(value).split(/(?<=[.!?])\s+/u)[0].replace(/[.!?]+$/u, '');
  const wordCount = (text) => text.split(/\s+/).filter(Boolean).length;
  if (wordCount(sentence) <= maxWords && !COPY_DANGLING_WORD.test(sentence)) return sentence;
  const clauses = sentence.split(/[,;:—]+/u)
    .map((part) => part.trim().replace(/^(?:а|и|но)\s+/iu, ''))
    .filter((part) => wordCount(part) >= 3 && !COPY_DANGLING_WORD.test(part));
  return clauses.find((part) => wordCount(part) <= maxWords)
    || clauses.sort((a, b) => wordCount(a) - wordCount(b))[0]
    || sentence;
};

function marketingSections(spec) {
  return (spec.appStore?.description || []).flatMap((entry) => {
    const [first, ...rest] = String(entry).split('\n').map((part) => part.trim()).filter(Boolean);
    if (!rest.length || !first) return [];
    const heading = first.replace(/[.!?]+$/u, '');
    return [{ heading: heading.charAt(0) + heading.slice(1).toLocaleLowerCase('ru-RU'), body: rest.join(' ') }];
  });
}

function actionHeadline(screen, title) {
  const value = `${screen} ${title || ''}`.toLocaleLowerCase('ru-RU');
  const patterns = [
    [/\b(чат|сообщ|раци|канал)/u, 'Обсуждайте важное вместе'],
    [/\b(профил|паспорт|человек|участник)/u, 'Сохраняйте важные связи'],
    [/\b(маршрут|карт|двор|рядом|мест)/u, 'Всё нужное рядом'],
    [/\b(камер|запис|прогон|снят|кадр)/u, 'Запишите главное'],
    [/\b(плеер|экран погас|фон|голос)/u, 'Слушайте без отвлечений'],
    [/\b(архив|библиотек|моя музык|записи)/u, 'Всё сохранённое под рукой'],
    [/\b(отчёт|акт|итог|черновик|результат)/u, 'Получите готовый результат'],
    [/\b(объяв|публикац|памят|объект)/u, 'Не пропускайте главное'],
    [/\b(поиск|определит|сравнен|разбор)/u, 'Найдите нужное быстрее'],
  ];
  return patterns.find(([pattern]) => pattern.test(value))?.[1] || 'Всё главное на одном экране';
}

/* Текущие концепты проходят редакторскую проверку: заголовок называет
   пользу кадра, а не title экрана. Для будущих концептов остаётся semantic fallback. */
const REVIEWED_HEADLINES = {
  breath:{home:'Выберите свой ритм',detail:'Настройтесь на дыхание',player:'Следуйте за музыкой',studio:'Создайте тихий визуал',background:'Дышите с погасшим экраном'},
  druzya:{feed:'Только свои в ленте',post:'Делитесь со своим кругом',messages:'Оставайтесь на связи',profile:'Помните, когда виделись',music:'Слушайте музыку вместе'},
  ekspeditsiya:{route:'Держите маршрут перед глазами',checkpoint:'Фиксируйте наблюдения на месте',report:'Соберите полевой отчёт',welcome:'Подготовьтесь к выходу',journal:'Восстановите весь путь'},
  karavan:{trips:'Вся поездка в одном месте',live:'Держите караван вместе',channel:'Говорите с экипажами на ходу',album:'Соберите итоги поездки',plan:'Согласуйте план заранее'},
  klass:{feed:'Важное для всего СНТ',post:'Не пропускайте объявления',messages:'Решайте вопросы с соседями',profile:'Знайте, кто живёт рядом',records:'Храните общую историю'},
  liga:{home:'Матч начинается здесь',watch:'Смотрите игру в эфире',clips:'Пересматривайте лучшие моменты',camera:'Снимайте матч с трибуны',moments:'Сохраняйте главные секунды'},
  looks:{home:'Находите готовые образы',post:'Разбирайте сочетания по вещам',nearby:'Смотрите, что носят рядом',create:'Соберите свой образ',profile:'Сохраните живой гардероб'},
  loop:{home:'Найдите луп для старта',detail:'Услышьте каждый слой',player:'Соберите ремикс на ходу',studio:'Запишите свой звук',background:'Слушайте с погасшим экраном'},
  nakat:{theory:'Разбирайте теорию на ходу',ticket:'Разберите каждый билет',player:'Слушайте в дороге',lessons:'Все занятия перед глазами',reschedule:'Перенесите занятие без звонка'},
  obyekt:{journal:'Вся работа в журнале',zones:'Контролируйте каждую зону',defects:'Держите дефекты под контролем',sync:'Синхронизируйтесь без интернета',act:'Соберите готовый акт'},
  pereezd:{today:'Весь переезд перед глазами',boxes:'Знайте, где каждая коробка',route:'Следите за всеми машинами',box:'Найдите нужное по метке',scan:'Сканируйте коробки на ходу'},
  peresmenka:{shifts:'Все смены в одном графике',checkin:'Отмечайтесь на смене',swaps:'Найдите подмену быстрее',person:'Понимайте, кто выйдет на смену',brief:'Передайте смену без потерь'},
  petlya:{lessons:'Вяжите вместе с уроком',lesson:'Смотрите, не отпуская спиц',counter:'Считайте ряды голосом',projects:'Храните весь прогресс проекта',cast:'Выведите урок на большой экран'},
  ploshchadka:{day:'Вся смена в одном ритме',timing:'Следуйте за таймингом',map:'Смотрите всю площадку',shots:'Закрывайте кадр за кадром',radio:'Держите команду на связи'},
  ptitsy:{season:'Слушайте, кто рядом',identify:'Определите птицу без сети',result:'Сравните похожие голоса',bird:'Узнайте птицу ближе',player:'Слушайте с погасшим экраном'},
  radius:{home:'Открывайте места через истории',nearby:'Смотрите, что происходит рядом',clips:'Переноситесь в место за минуту',channel:'Подписывайтесь на места',create:'Делитесь тем, что рядом'},
  rasklad:{home:'Начните с одной карты',scan:'Наведите камеру на карту',player:'Слушайте с закрытыми глазами',diary:'Сохраняйте свои мысли',scanfail:'Выберите карту вручную'},
  rehearsal:{today:'Подготовьтесь к выступлению',recording:'Пройдите весь прогон',analysis:'Найдите затянутые моменты',moment:'Повторите нужный фрагмент',setup:'Задайте точный тайминг'},
  rodnya:{feed:'Собирайте историю семьи',post:'Добавляйте год к каждому воспоминанию',chats:'Говорите с родными',profile:'Смотрите связи между близкими',voices:'Сохраняйте голоса семьи'},
  seans:{session:'Найдите показ рядом',join:'Подключитесь к залу',hall:'Слушайте звук в наушниках',curator:'Слушайте живой голос куратора',clips:'Возвращайтесь к лучшим сценам'},
  set:{home:'Найдите сет на сегодня',detail:'Откройте весь треклист',player:'Слушайте сет целиком',studio:'Найдите сет по афише',background:'Оставьте музыку в фоне'},
  shellac:{archive:'Найдите запись по этикетке',record:'Узнайте историю пластинки',player:'Слушайте сторону целиком',shelf:'Храните свою полку',background:'Продолжайте слушать в фоне'},
  skleyka:{projects:'Все видеопроекты на устройстве',project:'Соберите все фрагменты',processing:'Получите черновик автоматически',draft:'Проверьте готовую склейку',editor:'Наведите порядок в пару касаний'},
  strochka:{program:'Вся программа концерта рядом',notes:'Найдите свою партию',journal:'Храните ноты и записи вместе',releases:'Получайте обновления партии',piece:'Учите свой голос отдельно'},
  stuk:{sound:'Найдите поломку по звуку',record:'Запишите стук машины',compare:'Сравните с эталоном',symptom:'Узнайте возможную причину',watch:'Смотрите разбор целиком'},
  today:{home:'Покажите, чего хочется сегодня',nearby:'Найдите совпадение с друзьями',plan:'Соберите план за минуту',chats:'Договоритесь о деталях',profile:'Оставьте только своих'},
  volna:{home:'Выберите настроение на час',station:'Запустите музыку в дорогу',player:'Слушайте без интернета',search:'Найдите трек на устройстве',library:'Храните музыку у себя'},
  vypusk:{chronicle:'Соберите хронику выпуска',memory:'Верните имена старым снимкам',messages:'Говорите с одноклассниками',member:'Смотрите, кого уже нашли',archive:'Сохраняйте голоса выпуска'},
  zemlyaki:{city:'Узнавайте город заново',object:'Собирайте историю каждого места',messages:'Говорите с земляками',passport:'Покажите свою точку на карте',live:'Слушайте городской эфир'},
};

const REVIEWED_BODIES = {
  breath:{home:'Выберите длительность и начните спокойную дыхательную сессию',detail:'Музыка мягко подсказывает темп вдоха и выдоха',player:'Следуйте за ритмом без оценок, серий и соревнования',studio:'Создайте спокойный визуальный фон для своей практики',background:'Сессия продолжается, даже когда экран телефона погас'},
  double:{home:'Короткий план показывает, что стоит повторить сегодня',reference:'Анализ отмечает точный момент расхождения с референсом',camera:'Силуэт помогает сохранить движение и положение в кадре',analysis:'Сравнивайте попытки кадр за кадром сразу после записи',retry:'Повторяйте сложный фрагмент, не начиная всё движение заново'},
  druzya:{feed:'В ленте остаются публикации только вашего близкого круга',post:'Оценки открыты и видны всем участникам вашего круга',messages:'Общайтесь лично или группой, голосом и по видео',profile:'Смотрите общие круги, встречи и публикации друга',music:'Собирайте общие плейлисты и слушайте их в фоне'},
  dvor:{home:'Объявления, заявки и события доступны только жителям дома',chats:'Чаты дома и подъезда не теряются в общей ленте',yard:'Сервисы, парковка и события собраны на схеме двора',post:'Ответы, сроки и уведомления остаются в одном объявлении'},
  ekspeditsiya:{route:'Маршрут и ближайшая точка всегда остаются перед глазами',checkpoint:'Добавляйте фото, координаты и заметки прямо на месте',report:'Наблюдения автоматически складываются в понятный полевой отчёт',welcome:'Проверьте маршрут и снаряжение перед началом выхода',journal:'Вернитесь к каждой точке и восстановите весь путь'},
  karavan:{trips:'Маршрут, остановки и экипажи собраны в одной поездке',live:'Смотрите положение экипажей, пока караван находится в пути',channel:'Отвечайте голосом и сообщайте, что услышали команду',album:'Фото и заметки складываются в общий альбом поездки',plan:'Согласуйте маршрут, остановки и время выезда заранее'},
  klass:{feed:'Важные новости товарищества не теряются в общем чате',post:'Обсуждайте отключения, ремонт и собрания в одной теме',messages:'Общайтесь с соседями, не публикуя личный номер',profile:'Профиль связывает соседа с участком и общими делами',records:'Фотографии и записи собраний хранят общую историю товарищества'},
  liga:{home:'Счёт и ключевые события матча всегда перед глазами',watch:'Смотрите прямой эфир вместе со счётом и событиями',clips:'Пересматривайте голы, броски и лучшие моменты матча',camera:'Записывайте матч и сразу отмечайте ключевые события',moments:'Сохраняйте важные секунды в короткие видео'},
  looks:{home:'Находите готовые образы и отмеченные на фото вещи',post:'Открывайте каждую вещь и разбирайте сочетание по деталям',nearby:'Смотрите образы людей рядом и сохраняйте удачные сочетания',create:'Добавьте фото, отметьте вещи и опубликуйте новый образ',profile:'Собирайте сохранённые вещи и образы в личном гардеробе'},
  loop:{studio:'Запишите свой звук и сразу добавьте его в ремикс',background:'Музыка продолжает играть, когда экран погас или телефон заблокирован'},
  nakat:{theory:'Короткие аудиоразборы помогают повторять теорию в дороге',ticket:'Разберите ошибки и сразу закрепите сложные вопросы',player:'Продолжайте слушать разбор с погасшим экраном',lessons:'Свободные занятия недели видны в одном расписании',reschedule:'Выберите свободное время и перенесите занятие без звонка'},
  obyekt:{journal:'Все изменения по зонам сохраняются в едином журнале работ',zones:'Смотрите ответственных, прогресс и присутствие в каждой зоне',defects:'Ответственный, срок и приёмка дефекта собраны в одной карточке',sync:'Передавайте изменения прорабу по локальной сети без интернета',act:'Фото, дефекты и сроки собираются в один проверяемый документ'},
  pereezd:{today:'Текущий этап и ближайшая задача всегда перед глазами',boxes:'Метки показывают, где находится каждая коробка',route:'Следите за машинами и временем прибытия в одной карте',box:'Откройте метку и сразу найдите содержимое коробки',scan:'Сканируйте коробки при погрузке и разгрузке на ходу'},
  peresmenka:{swaps:'Смотрите запросы на подмену и свободных коллег рядом',person:'Карточка показывает опыт, роль и подтверждённые смены коллеги',brief:'Фото и чек-лист сохраняют состояние точки между сменами'},
  petlya:{lessons:'Управляйте уроком голосом, не отпуская спиц',lesson:'Продолжайте вязать, пока урок идёт перед глазами',counter:'Скажите «ряд», чтобы прибавить значение счётчика',projects:'Заметки и прогресс сохраняются внутри каждого проекта',cast:'Петли и руки мастера хорошо видны на телевизоре'},
  ploshchadka:{day:'Тайминг, зоны и результат смены видны на одном экране',timing:'Откройте смену и сразу увидите ближайшие задачи по времени',map:'Карта показывает зоны, команду и текущие задачи смены',radio:'Короткие голосовые команды доступны всей съёмочной группе сразу'},
  ptitsy:{result:'Сравнивайте запись с похожими голосами и уточняйте определение'},
  radius:{home:'Истории открывают знакомые места с новой стороны',nearby:'Находите свежие истории в нескольких минутах ходьбы',clips:'Смотрите, что происходит в районе прямо сейчас',channel:'Следите за двором, парком, набережной или автором',create:'Добавьте видео и место, чтобы поделиться историей'},
  rasklad:{home:'Одна карта помогает спокойно сформулировать вопрос на сегодня',scan:'Камера узнаёт карту и открывает связанное размышление',player:'Аудио-размышление ведёт от образа карты к своим мыслям',diary:'Сохраняйте выводы и возвращайтесь к ним позже',scanfail:'Колода и номер помогут найти карту, если камера не справилась'},
  rehearsal:{today:'Структура и целевой тайминг выступления всегда перед глазами',recording:'Запишите полный прогон и сравните его с планом',analysis:'Шкала покажет затянутые блоки и места для повтора',moment:'Повторяйте нужный фрагмент отдельно от полного выступления',setup:'Задайте длительность блоков перед первым прогоном'},
  rodnya:{profile:'Профиль показывает ветви семьи и связь с каждым родственником'},
  seans:{session:'Смотрите ближайшие показы и изменения расписания',join:'Подключитесь к показу и выберите звуковую дорожку',hall:'Синхронный звук показа играет в ваших наушниках',curator:'Слушайте комментарии ведущего прямо во время показа',clips:'Короткие фрагменты возвращают к лучшим сценам'},
  set:{home:'Выбирайте выступление по площадке, дате или жанру',detail:'Треклист сохраняет порядок каждого сета от начала до финала',player:'Живое выступление играет целиком без разрывов между треками',studio:'Наведите камеру на афишу, чтобы найти нужный сет',background:'Музыка продолжает играть на заблокированном экране'},
  shellac:{archive:'Наведите камеру на этикетку и найдите нужную запись',record:'Откройте историю издания, исполнителей и самой пластинки',player:'Слушайте всю сторону подряд без деления на отдельные треки',shelf:'Храните состояние, фото конверта и заметки о каждом экземпляре',background:'Сторона продолжает играть при заблокированном экране'},
  skleyka:{projects:'Проекты хранят исходники, черновики и готовые экспорты',project:'Соберите видео из камеры, медиатеки и файлов',processing:'Приложение само собирает черновик из фрагментов',draft:'Проверьте склейку целиком перед финальным экспортом',editor:'Меняйте порядок и убирайте лишнее без сложного монтажа'},
  strochka:{program:'Порядок номеров и ваши партии собраны в программе концерта',notes:'Поиск находит произведение, композитора и нужную голосовую партию',journal:'Ноты, записи и история занятий остаются в одном месте',releases:'Получайте уведомления о новой записи партии или изменениях',piece:'Слушайте свою партию отдельно и учите её в удобном темпе'},
  stuk:{sound:'Запишите звук у колеса или под капотом',record:'Короткая запись сохраняет характер стука',compare:'Сравните свою запись с похожим эталоном',symptom:'Получите возможную причину и следующие шаги',watch:'Разбор показывает порядок работ и нужные детали'},
  today:{chats:'Чат собирает время, место и детали конкретной встречи',profile:'Смотрите только друзей, которых сами добавили в свой круг'},
  volna:{home:'Музыка из файлов и медиатеки превращается в готовые волны',library:'Альбомы, папки и сохранённые треки доступны в одном разделе'},
  vypusk:{chronicle:'Снимки и истории складываются в общую хронику выпуска',memory:'Добавляйте имена и годы к старым школьным фотографиям',member:'Профиль показывает выпуск, роль, вклад и статус будущей встречи'},
  zemlyaki:{city:'События, районы и городские истории собраны по знакомым адресам',object:'Адрес связывает архивные снимки, воспоминания и современный вид места',passport:'Покажите родную точку, период жизни и связанные с ней места'},
};

function fallbackMarketingCopy(spec, screen, index, screenById) {
  const model = screenById[screen] || {};
  const haystack = new Set(copyWords(`${screen} ${model.title || ''} ${model.meta || ''}`));
  const ranked = marketingSections(spec).map((section) => ({
    ...section,
    score: copyWords(`${section.heading} ${section.body}`).filter((word) => haystack.has(word)).length,
  })).sort((a, b) => b.score - a.score);
  const matched = ranked[0]?.score ? ranked[0] : null;
  const evidence = (spec.positioning?.referenceEvidence || []).find((item) => item.screen === screen);
  const distinction = (spec.positioning?.distinctions || [])[index % Math.max(1, spec.positioning?.distinctions?.length || 1)];
  const headline = REVIEWED_HEADLINES[spec.slug]?.[screen] || matched?.heading || actionHeadline(screen, model.title);
  const body = REVIEWED_BODIES[spec.slug]?.[screen]
    || firstSentence(matched?.body || evidence?.behavior || distinction || spec.tagline);
  return { headline, body };
}

export function assetPlan(spec, { template, screenIds } = {}) {
  const config = spec.appStore?.assets || {};
  const configured = Array.isArray(config.screens) ? config.screens : [];
  const ids = screenIds?.length
    ? screenIds
    : configured.length
      ? configured.map((item) => typeof item === 'string' ? item : item.screen)
      : fallbackScreens(spec);
  const titleById = Object.fromEntries((spec.screens || []).map((screen) => [screen.id, screen.title]));
  const screenById = Object.fromEntries((spec.screens || []).map((screen) => [screen.id, screen]));
  const configuredById = Object.fromEntries(configured.map((item) => [typeof item === 'string' ? item : item.screen, item]));
  const screens = ids.map((screen, index) => {
    const override = configuredById[screen] || {};
    const fallback = fallbackMarketingCopy(spec, screen, index, screenById);
    return {
      screen,
      headline: cleanStoreCopy(override.headline || fallback.headline || titleById[screen] || screen),
      body: cleanStoreCopy(override.body || fallback.body || spec.appStore?.subtitle || spec.tagline),
    };
  });
  const iphoneDevices = ['iphone-6.9', 'iphone-6.5', 'iphone-6.3', 'iphone-6.1'];
  const devices = config.devices || (spec.targetSet === 'vk-video'
    ? [...iphoneDevices, 'ipad-13-landscape']
    : iphoneDevices);
  return {
    locale: config.locale || 'ru-RU',
    template: template || config.template || 'studio',
    tone: config.tone || (screenById[ids[0]]?.light ? 'light' : 'dark'),
    devices,
    screens,
  };
}

function assertPlan(spec, plan) {
  if (!TEMPLATES.includes(plan.template)) throw new Error(`неизвестный шаблон ${plan.template}; доступны: ${TEMPLATES.join(', ')}`);
  if (!plan.screens.length) throw new Error(`${spec.slug}: не удалось выбрать продуктовые экраны`);
  if (!['light', 'dark'].includes(plan.tone)) throw new Error(`${spec.slug}: appStore.assets.tone должен быть light или dark`);
  if (plan.screens.length > 10) throw new Error(`${spec.slug}: App Store принимает не более 10 скриншотов на размер устройства`);
  const known = new Set((spec.screens || []).map((screen) => screen.id));
  for (const item of plan.screens) if (!known.has(item.screen)) throw new Error(`${spec.slug}: неизвестный экран ${item.screen}`);
  for (const device of plan.devices) if (!DEVICE_TARGETS[device]) throw new Error(`${spec.slug}: неизвестный размер ${device}`);
  if (plan.devices.includes('ipad-13-landscape') && spec.targetSet !== 'vk-video' && spec.appStore?.assets?.ipad !== true) {
    throw new Error(`${spec.slug}: iPad включается автоматически только для vk-video; для другого набора укажите appStore.assets.ipad = true`);
  }
}

function interfaceAccent(spec) {
  if (spec.appStore?.assets?.accent) return spec.appStore.assets.accent;
  const styles = join(conceptDir(spec.slug), 'styles.css');
  if (existsSync(styles)) {
    const source = readFileSync(styles, 'utf8');
    const match = source.match(/--[\w-]+-(?:accent|tint)\s*:\s*(#[\da-f]{3,8})/i);
    if (match) return match[1];
  }
  return spec.brand?.accent || '#3478dc';
}

const css = (accent, tone, target) => {
  const isLight = tone === 'light';
  const meta = DEVICE_TARGETS[target];
  const scale = meta.orientation === 'portrait' ? meta.width / 1320 : meta.width / 2752;
  const px = (value) => `${Math.round(value * scale)}px`;
  const background = isLight ? '#f7f7f4' : '#0b0d12';
  const foreground = isLight ? '#111318' : '#f7f8fa';
  const muted = isLight ? '#555b65' : '#afb5c0';
  return `
    *{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden}body{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif}
    .canvas{position:relative;width:100vw;height:100vh;overflow:hidden;background:${background};color:${foreground};isolation:isolate}
    .canvas:before,.canvas:after{content:"";position:absolute;z-index:-1;pointer-events:none}
    .canvas:before{width:76%;aspect-ratio:1;right:-28%;top:-17%;border-radius:50%;background:${accent};filter:blur(${px(150)});opacity:${isLight ? '.075' : '.16'}}
    .canvas:after{left:-18%;bottom:-15%;width:64%;aspect-ratio:1;border-radius:50%;background:${accent};filter:blur(${px(190)});opacity:${isLight ? '.035' : '.075'}}
    .copy{position:absolute;z-index:4}.headline{margin:0;letter-spacing:-.035em;font-weight:590;text-wrap:balance}.body{margin:0;color:${muted};letter-spacing:-.012em;font-weight:430;text-wrap:balance}
    .device{position:absolute;z-index:3;background:#090a0c;border:${px(2)} solid #24272d;box-shadow:0 ${px(46)} ${px(120)} rgba(5,8,14,${isLight ? '.2' : '.52'}),inset 0 0 0 ${px(2)} rgba(255,255,255,.035)}
    .device img{display:block;width:100%;height:100%;object-fit:cover;background:#000}
    .portrait .copy{left:${px(92)};right:${px(92)};top:${px(205)};text-align:center;display:flex;flex-direction:column;align-items:center}
    .portrait .headline{max-width:${px(1120)};font-size:${px(104)};line-height:1.01}
    .portrait .body{max-width:${px(1040)};margin-top:${px(28)};font-size:${px(43)};line-height:1.22}
    .portrait .device{left:${px(120)};top:${px(630)};width:${px(1080)};aspect-ratio:375/812;padding:${px(18)};border-radius:${px(122)}}
    .portrait .device img{border-radius:${px(101)}}
    .landscape .copy{left:${px(210)};right:${px(210)};top:${px(122)};height:${px(250)};display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:${px(120)};align-items:end}
    .landscape .headline{max-width:${px(1480)};font-size:${px(100)};line-height:1.01}
    .landscape .body{width:100%;padding-bottom:${px(7)};font-size:${px(40)};line-height:1.24}
    .landscape .device{left:${px(210)};top:${px(430)};width:${px(2332)};aspect-ratio:4/3;padding:${px(22)};border-radius:${px(82)}}
    .landscape .device img{border-radius:${px(61)}}
    .landscape .device:after{content:"";position:absolute;inset:${px(-22)};border-radius:${px(102)};border:${px(1)} solid rgba(255,255,255,${isLight ? '.28' : '.1'});pointer-events:none}
  `;
};

const cleanStoreCopy = (value) => String(value || '').trim().replace(/[.!?…]+$/u, '');
const cleanHeadline = (value) => cleanStoreCopy(value).replace(/[.!?…]+/gu, '');
const preventRussianHangingWords = (value) => String(value)
  .replace(/—\s+/gu, '—\u00a0')
  .replace(
    /(^|[\s(«„])((?:а|без|в|во|да|для|до|за|и|из|или|к|ко|на|над|но|о|об|от|по|под|при|про|с|со|у|через))\s+/giu,
    '$1$2\u00a0',
  );
const preventTextWidow = (value) => String(value).replace(/(\S+)\s+(\S+)$/u, '$1\u00a0$2');
export const beautifyStoreCopy = (value) => preventTextWidow(preventRussianHangingWords(value));

function frameHtml({ spec, frame, screenshot, target, template, index }) {
  const meta = DEVICE_TARGETS[target];
  const accent = interfaceAccent(spec);
  const headline = cleanHeadline(frame.headline);
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css(accent, frame.tone, target)}</style></head>
    <body><main class="canvas ${meta.orientation} ${template}">
      <section class="copy"><h1 class="headline">${esc(beautifyStoreCopy(headline))}</h1><p class="body">${esc(beautifyStoreCopy(cleanStoreCopy(frame.body)))}</p></section>
      <div class="device"><img src="data:image/png;base64,${screenshot.toString('base64')}" alt=""></div>
    </main></body></html>`;
}

async function selectScreen(page, selector, screenId, ipad) {
  await page.evaluate(({ selector, screenId, ipad }) => {
    const root = document.querySelector(selector);
    root.classList.toggle('is-ipad', ipad);
    root.style.boxShadow = 'none';
    root.style.border = '0';
    root.style.outline = '0';
    root.querySelectorAll('.screen').forEach((screen) => {
      screen.classList.remove('is-on');
      screen.classList.toggle('has-ipad-tabbar', ipad && Boolean(screen.querySelector('.tabbar')));
    });
    root.querySelector(`[data-screen="${screenId}"]`)?.classList.add('is-on');
    root.querySelector('.sysask')?.classList.remove('is-on');
    root.querySelector('.snackbar')?.classList.remove('is-on');
  }, { selector, screenId, ipad });
  await page.waitForTimeout(120);
}

async function captureScreens(browser, spec, plan) {
  const hero = (spec.prototypes || []).find((prototype) => prototype.hero) || (spec.prototypes || [])[0];
  if (!hero) throw new Error(`${spec.slug}: нет hero prototype`);
  const selector = `#pr-${hero.id}`;
  const page = await browser.newPage({ viewport: { width: 1500, height: 1500 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(join(conceptDir(spec.slug), '..', '..', 'dist', spec.slug, 'index.html')).href, { waitUntil: 'networkidle' });
  await page.locator(selector).waitFor({ state: 'visible' });
  const shots = { phone: {}, ipad: {} };
  for (const source of [...new Set(plan.devices.map((device) => DEVICE_TARGETS[device].source))]) {
    for (const frame of plan.screens) {
      await selectScreen(page, selector, frame.screen, source === 'ipad');
      shots[source][frame.screen] = await page.locator(selector).screenshot({ type: 'png' });
    }
  }
  await page.close();
  return shots;
}

async function render(browser, html, { width, height, type = 'jpeg', quality = 92 }) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.locator('.device img').waitFor({ state: 'visible' });
  const fitResult = await page.evaluate(() => {
    const lineWordCounts = (element) => {
      const node = element.firstChild;
      if (!node || node.nodeType !== Node.TEXT_NODE) return [];
      const lines = new Map();
      for (const match of node.textContent.matchAll(/\S+/gu)) {
        const range = document.createRange();
        range.setStart(node, match.index);
        range.setEnd(node, match.index + match[0].length);
        const top = Math.round(range.getBoundingClientRect().top);
        lines.set(top, (lines.get(top) || 0) + 1);
      }
      return [...lines.values()];
    };
    const fit = (selector, maxLines, minSize) => {
      const element = document.querySelector(selector);
      let size = Number.parseFloat(getComputedStyle(element).fontSize);
      const lines = () => element.getBoundingClientRect().height / Number.parseFloat(getComputedStyle(element).lineHeight);
      while (lines() > maxLines + .08 && size > minSize) {
        size -= 2;
        element.style.fontSize = `${size}px`;
      }
      return { selector, lines: lines(), size, lineWordCounts: lineWordCounts(element) };
    };
    const ratio = document.querySelector('.canvas').classList.contains('portrait') ? innerWidth / 1320 : innerWidth / 2752;
    return [fit('.headline', 2, 72 * ratio), fit('.body', 2, 34 * ratio)];
  });
  for (const result of fitResult) {
    if (result.lines > 2.08) throw new Error(`${result.selector} не помещается в две строки даже при ${result.size}px`);
    if (result.lineWordCounts.length > 1 && result.lineWordCounts.at(-1) === 1) {
      throw new Error(`${result.selector} оставляет одно слово в последней строке`);
    }
  }
  const buffer = await page.screenshot(type === 'jpeg' ? { type, quality } : { type });
  await page.close();
  return buffer;
}

async function previewSheet(browser, spec, plan, shots, template, outFile) {
  const thumbs = [];
  for (let index = 0; index < Math.min(3, plan.screens.length); index++) {
    const frame = { ...plan.screens[index], tone: plan.tone, total: plan.screens.length };
    const html = frameHtml({ spec, frame, screenshot: shots.phone[frame.screen], target: 'iphone-6.9', template, index });
    thumbs.push(await render(browser, html, { width: 1320, height: 2868, quality: 86 }));
  }
  const images = thumbs.map((buffer, index) => `<figure><img src="data:image/jpeg;base64,${buffer.toString('base64')}" alt=""><figcaption>${index + 1}</figcaption></figure>`).join('');
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><style>*{box-sizing:border-box}body{margin:0;padding:54px 62px;background:#e8e7e3;color:#15171b;font-family:-apple-system,sans-serif}header{display:flex;align-items:end;justify-content:space-between;margin-bottom:34px}h1{margin:0;font-size:52px;letter-spacing:-.05em}p{margin:0;color:#686b72;font-size:21px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:32px}figure{margin:0}img{display:block;width:100%;border-radius:24px;box-shadow:0 18px 50px rgba(20,24,32,.16)}figcaption{display:none}</style><header><h1>${esc(spec.name)} · ${template}</h1><p>App Store template preview</p></header><main class="grid">${images}</main>`);
  writeFileSync(outFile, await page.screenshot({ type: 'jpeg', quality: 90 }));
  await page.close();
}

const readme = (spec, plan) => `# ${spec.name} — App Store assets

Сгенерировано из живого прототипа командой \`npm run app-store -- ${spec.slug}\`.

- Локаль: ${plan.locale}
- Шаблон полного экспорта: ${plan.template}
- Кадров в серии: ${plan.screens.length}
- Размеры: ${plan.devices.map((id) => `${DEVICE_TARGETS[id].label} ${DEVICE_TARGETS[id].width}×${DEVICE_TARGETS[id].height}`).join(', ')}
- Визуальная система: ${TEMPLATES.join(', ')}

Тексты и порядок экранов задаются в \`concept.json → appStore.assets.screens\`. Если блока нет, серия выводится из \`positioning.evidenceScreens\` и метаданных экранов. Заголовки автоматически укладываются максимум в две строки; висячие предлоги и конечная пунктуация убираются.

Перед загрузкой в App Store Connect проверьте каждый кадр в полном размере: интерфейс, локализацию, актуальность контента и отсутствие тестовых/чужих данных.
`;

function zipAssets(root, slug) {
  const zip = `${slug}-app-store-assets.zip`;
  const target = join(root, zip);
  rmSync(target, { force: true });
  try {
    const entries = readdirSync(root).filter((entry) => entry !== zip);
    execFileSync('zip', ['-r', '-q', zip, ...entries], { cwd: root });
  } catch {
    console.warn('внимание: ZIP не создан — нужен CLI zip');
  }
  return target;
}

export async function generateAppStoreAssets(slug, options = {}) {
  const sourceSpec = readSpec(slug);
  const plan = assetPlan(sourceSpec, options);
  assertPlan(sourceSpec, plan);
  build(slug);
  const spec = readSpec(slug);
  const root = join(conceptDir(slug), 'assets', 'app-store');
  const exportRoot = join(root, plan.locale, plan.template);
  rmSync(root, { recursive: true, force: true });
  mkdirSync(exportRoot, { recursive: true });
  mkdirSync(join(root, 'previews'), { recursive: true });

  const browser = await chromium.launch();
  try {
    const shots = await captureScreens(browser, spec, plan);
    for (const device of plan.devices) {
      const meta = DEVICE_TARGETS[device];
      const outDir = join(exportRoot, device);
      mkdirSync(outDir, { recursive: true });
      for (let index = 0; index < plan.screens.length; index++) {
        const frame = { ...plan.screens[index], tone: plan.tone, total: plan.screens.length };
        const html = frameHtml({ spec, frame, screenshot: shots[meta.source][frame.screen], target: device, template: plan.template, index });
        const file = `${String(index + 1).padStart(2, '0')}-${frame.screen}.jpg`;
        writeFileSync(join(outDir, file), await render(browser, html, meta));
        console.log('ok', device, file);
      }
    }
    if (!shots.phone[plan.screens[0].screen]) {
      const phonePlan = { ...plan, devices: ['iphone-6.9'] };
      Object.assign(shots, await captureScreens(browser, spec, phonePlan));
    }
    for (const template of TEMPLATES) {
      await previewSheet(browser, spec, plan, shots, template, join(root, 'previews', `${template}.jpg`));
      console.log('ok preview', template);
    }
  } finally {
    await browser.close();
  }

  const icon = join(conceptDir(slug), 'assets', 'app-icon.png');
  if (existsSync(icon)) cpSync(icon, join(root, 'app-icon-source.png'));
  writeFileSync(join(root, 'README.md'), readme(spec, plan));
  const targets = Object.fromEntries(plan.devices.map((id) => [id, DEVICE_TARGETS[id]]));
  const manifest = { requirementsChecked: '2026-09-01', slug, ...plan, targets };
  writeFileSync(join(root, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  zipAssets(root, slug);
  build(slug);
  return { root, plan };
}

function cliOptions(args) {
  const value = (flag) => {
    const index = args.indexOf(flag);
    return index === -1 ? undefined : args[index + 1];
  };
  return {
    template: value('--template'),
    screenIds: value('--screens')?.split(',').map((id) => id.trim()).filter(Boolean),
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [slug, ...args] = process.argv.slice(2);
  if (!slug) {
    console.error('нужен slug: node scripts/app-store-assets.mjs scene');
    process.exit(1);
  }
  const result = await generateAppStoreAssets(slug, cliOptions(args));
  console.log('готово:', result.root);
}
