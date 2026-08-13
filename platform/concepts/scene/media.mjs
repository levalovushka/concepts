import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(fileURLToPath(new URL('.', import.meta.url)), 'assets', 'media');
mkdirSync(out, { recursive: true });

const svg = (body, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<defs>
  <filter id="blur"><feGaussianBlur stdDeviation="34"/></filter>
  <filter id="glow"><feGaussianBlur stdDeviation="8"/></filter>
  <linearGradient id="shade" x2="0" y2="1"><stop stop-color="#08090d" stop-opacity="0"/><stop offset="1" stop-color="#08090d" stop-opacity=".85"/></linearGradient>
  ${extra}
</defs>${body}</svg>`;

const audience = (y = 505, count = 18) => `<g fill="#07080b">${Array.from({ length: count }, (_, i) => {
  const x = 18 + i * (770 / (count - 1));
  const yy = y + (i % 4) * 13;
  return `<circle cx="${x}" cy="${yy}" r="25"/><path d="M${x - 30} 600v-${74 - (i % 3) * 8}q30-24 60 0v${74 - (i % 3) * 8}"/>`;
}).join('')}</g>`;

const write = (name, body, extra = '') => writeFileSync(join(out, name), svg(body, extra));

write('mayak-band.svg', `
  <rect width="800" height="600" fill="#090912"/>
  <ellipse cx="190" cy="130" rx="210" ry="170" fill="#5743dd" opacity=".55" filter="url(#blur)"/>
  <ellipse cx="640" cy="130" rx="230" ry="170" fill="#d52b72" opacity=".46" filter="url(#blur)"/>
  <path d="M80 62l252 340M730 30L468 410" stroke="#806cff" stroke-width="20" opacity=".36"/>
  <g transform="translate(400 155)">
    <path d="M-24 70q24-22 48 0l24 185h-96z" fill="#2d3194"/>
    <ellipse cy="28" rx="28" ry="35" fill="#b96f52"/>
    <path d="M-31 22q7-42 42-27 20 10 14 39l-10-17-46 20z" fill="#17131d"/>
    <path d="M22 103l78 63M-24 108l-60 85" stroke="#b96f52" stroke-width="18" stroke-linecap="round"/>
    <path d="M91 166h74" stroke="#ddd5ff" stroke-width="7" stroke-linecap="round"/>
    <path d="M158 165v125" stroke="#ddd5ff" stroke-width="6"/>
  </g>
  <g transform="translate(190 250) rotate(-10)"><ellipse cx="30" cy="25" rx="24" ry="29" fill="#87533f"/><path d="M4 58h52l30 150H-18z" fill="#182335"/><path d="M22 90l126 82" stroke="#87533f" stroke-width="16" stroke-linecap="round"/><path d="M70 116l85 55-43 69-84-55z" fill="#f1b54a" stroke="#291b18" stroke-width="8"/><circle cx="104" cy="176" r="19" fill="#2a1d19"/></g>
  <g transform="translate(590 250)"><ellipse cx="20" cy="22" rx="24" ry="29" fill="#d79b7d"/><path d="M-7 54h55l24 151H-28z" fill="#27342e"/><rect x="70" y="93" width="112" height="74" rx="8" fill="#171a20" stroke="#82ead0" stroke-width="5"/><path d="M78 119h96M90 145h72" stroke="#82ead0" stroke-width="4" opacity=".7"/></g>
  <g transform="translate(500 310)"><circle cx="45" cy="42" r="58" fill="none" stroke="#e8628f" stroke-width="8"/><circle cx="45" cy="42" r="12" fill="#e8628f"/><path d="M-28 127h146M6-10l-26-70M85-8l35-76" stroke="#9291a6" stroke-width="7"/></g>
  <path d="M0 470q400-84 800 0v130H0z" fill="url(#shade)"/>${audience()}
`);

write('electric-duo.svg', `
  <rect width="800" height="600" fill="#061621"/>
  <circle cx="190" cy="120" r="220" fill="#007fc6" opacity=".55" filter="url(#blur)"/>
  <circle cx="620" cy="150" r="240" fill="#782be8" opacity=".48" filter="url(#blur)"/>
  <g stroke="#55e5ff" stroke-width="8" opacity=".45"><path d="M0 140h800M0 220h800M0 300h800"/><path d="M110 0v410M300 0v410M500 0v410M690 0v410"/></g>
  <g transform="translate(210 190)"><path d="M0 86q42-54 84 0l34 196H-36z" fill="#161825"/><ellipse cx="42" cy="37" rx="34" ry="41" fill="#bd8169"/><path d="M4 26q15-54 67-27l9 54-20-28-56 22z" fill="#11131a"/><path d="M70 122l93 45" stroke="#bd8169" stroke-width="18" stroke-linecap="round"/></g>
  <g transform="translate(500 180)"><path d="M0 95q42-54 84 0l28 186H-30z" fill="#341e59"/><ellipse cx="42" cy="42" rx="34" ry="41" fill="#8e5e4b"/><path d="M5 30q8-54 64-30l13 60-27-32-50 23z" fill="#11131a"/><path d="M22 128l-88 49" stroke="#8e5e4b" stroke-width="18" stroke-linecap="round"/></g>
  <path d="M110 370h580l55 130H55z" fill="#11141d"/><g fill="#63ecff">${Array.from({length:18},(_,i)=>`<rect x="${105+i*34}" y="397" width="18" height="6" rx="3" opacity="${.3+(i%4)*.18}"/>`).join('')}</g>
  ${audience(500, 20)}
`);

write('ada-closeup.svg', `
  <rect width="800" height="600" fill="#1c0d13"/>
  <circle cx="650" cy="110" r="270" fill="#ff4f79" opacity=".44" filter="url(#blur)"/>
  <circle cx="90" cy="260" r="230" fill="#d76c24" opacity=".36" filter="url(#blur)"/>
  <g transform="translate(315 74)">
    <path d="M-12 208q95-60 190 0l52 330H-62z" fill="#d94e28"/>
    <ellipse cx="82" cy="110" rx="72" ry="92" fill="#e8a47f"/>
    <path d="M6 93q11-118 112-83 56 24 34 131l-32-70-114 80z" fill="#26131a"/>
    <path d="M42 127q38 24 76 0" stroke="#8c4938" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M136 240l112-102" stroke="#e8a47f" stroke-width="26" stroke-linecap="round"/>
    <rect x="230" y="85" width="24" height="120" rx="12" fill="#d7d9e4" transform="rotate(27 242 145)"/>
    <circle cx="273" cy="72" r="24" fill="#21222a"/>
  </g>
  <path d="M0 470q400-60 800 0v130H0z" fill="url(#shade)"/>${audience(520, 17)}
`);

write('sunrise-festival.svg', `
  <rect width="800" height="600" fill="#07161a"/>
  <circle cx="400" cy="155" r="170" fill="#ffb43b" opacity=".58" filter="url(#blur)"/>
  <path d="M70 80h660v350H70z" fill="#0b1217"/><path d="M70 80l110 350M730 80L620 430M70 80h660M110 210h580" stroke="#66757b" stroke-width="9"/>
  <g fill="#f18b36"><circle cx="165" cy="145" r="10"/><circle cx="640" cy="145" r="10"/><circle cx="290" cy="120" r="10"/><circle cx="520" cy="120" r="10"/></g>
  <g transform="translate(270 235)"><ellipse cx="30" cy="25" rx="24" ry="29" fill="#b97759"/><path d="M3 56h53l20 130H-18z" fill="#176554"/><path d="M24 90l85 60" stroke="#b97759" stroke-width="15"/><path d="M85 129l62 40-31 52-64-39z" fill="#f3c75d"/></g>
  <g transform="translate(470 230)"><ellipse cx="26" cy="25" rx="24" ry="29" fill="#e4a07e"/><path d="M0 56h52l20 130H-17z" fill="#ad3845"/><path d="M26 88v110" stroke="#e4a07e" stroke-width="15"/><rect x="85" y="85" width="95" height="60" rx="7" fill="#182329"/></g>
  <g transform="translate(382 215)"><ellipse cx="20" cy="22" rx="24" ry="29" fill="#8f5a43"/><path d="M-6 52h52l16 142H-23z" fill="#5943c2"/><path d="M19 80l-60 42M26 81l65 41" stroke="#8f5a43" stroke-width="15"/></g>
  ${audience(455, 24)}
`);

write('mayak-portrait.svg', `
  <rect width="800" height="600" fill="#100f1b"/>
  <ellipse cx="160" cy="260" rx="230" ry="270" fill="#4a38cb" opacity=".5" filter="url(#blur)"/>
  <path d="M90 0l300 500M760 20L435 500" stroke="#ea427c" stroke-width="20" opacity=".24"/>
  <g transform="translate(385 38)">
    <path d="M-130 342q125-98 250 0l75 300H-205z" fill="#252c75"/>
    <ellipse cx="0" cy="180" rx="105" ry="132" fill="#ba7558"/>
    <path d="M-104 168q-4-164 122-150 93 14 91 135l-42-73-166 128z" fill="#17131d"/>
    <path d="M-41 216q43 29 86 0" fill="none" stroke="#734132" stroke-width="10" stroke-linecap="round"/>
    <path d="M-75 174l35-10M35 164l34 9" stroke="#503026" stroke-width="10" stroke-linecap="round"/>
    <path d="M100 330l145-150" stroke="#ba7558" stroke-width="32" stroke-linecap="round"/>
    <circle cx="250" cy="160" r="29" fill="#20212a"/><rect x="237" y="174" width="26" height="165" rx="13" fill="#d6d7df" transform="rotate(16 250 255)"/>
  </g>
  <rect y="500" width="800" height="100" fill="url(#shade)"/>
`);

write('mayak-moment.svg', `
  <rect width="800" height="600" fill="#09090f"/>
  <circle cx="590" cy="140" r="250" fill="#ef396f" opacity=".4" filter="url(#blur)"/>
  <path d="M0 80l420 380M800 20L470 430" stroke="#6558ed" stroke-width="18" opacity=".35"/>
  <g transform="translate(360 80)"><ellipse cx="10" cy="92" rx="66" ry="82" fill="#b96f52"/><path d="M-55 79q5-102 92-83 61 18 43 111l-32-52-102 78z" fill="#17131d"/><path d="M-80 178q90-70 180 0l45 330H-135z" fill="#343b91"/><path d="M72 222l146 92" stroke="#b96f52" stroke-width="27" stroke-linecap="round"/><path d="M150 256l143 94-83 129-142-95z" fill="#e7ad47" stroke="#291b18" stroke-width="12"/><circle cx="207" cy="371" r="34" fill="#39241c"/><path d="M-52 221l-120 88" stroke="#b96f52" stroke-width="27" stroke-linecap="round"/></g>
  <circle cx="170" cy="292" r="30" fill="#20212a"/><path d="M188 303l155 90" stroke="#d7d8df" stroke-width="15"/>
  ${audience(525, 19)}
`);

write('audience-camera.svg', `
  <rect width="800" height="600" fill="#120d1b"/>
  <ellipse cx="400" cy="100" rx="260" ry="150" fill="#e93f79" opacity=".42" filter="url(#blur)"/>
  <path d="M120 100h560v320H120z" fill="#171224"/><g transform="translate(330 165)"><ellipse cx="70" cy="40" rx="36" ry="44" fill="#bd795d"/><path d="M30 83h80l30 180H0z" fill="#5344d2"/><path d="M32 125l-88 77M108 126l94 70" stroke="#bd795d" stroke-width="20"/></g>
  <g fill="#08080c">${Array.from({length:14},(_,i)=>`<path d="M${i*62-20} 600v-${120+(i%3)*28}q31-35 62 0v${120+(i%3)*28}z"/><circle cx="${i*62+11}" cy="${455-(i%3)*28}" r="30"/>`).join('')}</g>
  <g transform="translate(590 390) rotate(7)"><rect width="80" height="142" rx="16" fill="#24252d" stroke="#dcdce4" stroke-width="6"/><rect x="10" y="14" width="60" height="104" rx="7" fill="#6e4ae0"/><circle cx="40" cy="130" r="6" fill="#b7b7c1"/></g>
`);

write('venue.svg', `
  <rect width="800" height="600" fill="#111219"/><path d="M40 90h720v410H40z" fill="#201c2b"/>
  <path d="M90 130h620v310H90z" fill="#090a0e"/>
  <g stroke="#78758a" stroke-width="9"><path d="M40 90l95 410M760 90L665 500M40 90h720M70 225h660"/></g>
  <path d="M190 310h420v145H190z" fill="#191425"/><g fill="#6657ed">${Array.from({length:11},(_,i)=>`<rect x="${205+i*37}" y="338" width="20" height="85" rx="10" opacity="${.3+(i%4)*.14}"/>`).join('')}</g>
  <circle cx="400" cy="280" r="90" fill="#f14a78" opacity=".34" filter="url(#blur)"/>${audience(510, 22)}
`);

write('map.svg', `<rect width="800" height="600" fill="#17171d"/><g fill="none" stroke="#30303a" stroke-width="24"><path d="M-20 130Q320 280 820 120"/><path d="M120-20Q260 250 110 630"/><path d="M610-20Q490 290 650 630"/></g><circle cx="390" cy="285" r="32" fill="#6757f5"/>`);

export default {
  'assets/media/mayak-band.svg': 'Группа «Маяк»: вокалист, гитарист, клавишник и барабаны',
  'assets/media/electric-duo.svg': 'Электронный дуэт за пультами',
  'assets/media/ada-closeup.svg': 'Крупный план певицы Ады Мороз с микрофоном',
  'assets/media/sunrise-festival.svg': 'Фестивальная сцена с группой и толпой',
  'assets/media/mayak-portrait.svg': 'Портрет фронтмена группы «Маяк»',
  'assets/media/mayak-moment.svg': 'Крупный концертный момент с гитарой',
  'assets/media/audience-camera.svg': 'Выступление из зрительного зала с телефоном в кадре',
  'assets/media/venue.svg': 'Архитектура большой концертной площадки',
  'assets/media/map.svg': 'Схема площадок'
};
