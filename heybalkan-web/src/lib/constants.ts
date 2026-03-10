export const COUNTRIES = [
  { code: 'RS', name: 'Srbija', flag: '\u{1F1F7}\u{1F1F8}' },
  { code: 'HR', name: 'Hrvatska', flag: '\u{1F1ED}\u{1F1F7}' },
  { code: 'BA', name: 'Bosna i Hercegovina', flag: '\u{1F1E7}\u{1F1E6}' },
  { code: 'ME', name: 'Crna Gora', flag: '\u{1F1F2}\u{1F1EA}' },
  { code: 'MK', name: 'Severna Makedonija', flag: '\u{1F1F2}\u{1F1F0}' },
  { code: 'XK', name: 'Kosovo', flag: '\u{1F1FD}\u{1F1F0}' },
  { code: 'SI', name: 'Slovenija', flag: '\u{1F1F8}\u{1F1EE}' },
];

export const DACH_COUNTRIES = [
  { code: 'CH', name: 'Schweiz', flag: '\u{1F1E8}\u{1F1ED}' },
  { code: 'DE', name: 'Deutschland', flag: '\u{1F1E9}\u{1F1EA}' },
  { code: 'AT', name: 'Oesterreich', flag: '\u{1F1E6}\u{1F1F9}' },
];

export const SPOKEN_LANGUAGES = [
  'Deutsch', 'English', 'Srpski', 'Hrvatski', 'Bosanski',
  'Shqip', 'Makedonski', 'Slovenski', 'Crnogorski', 'Tuerkisch',
];

export const RELIGIONS = [
  'Orthodox', 'Katholisch', 'Islam', 'Andere', 'Keine Angabe',
];

export const RELATIONSHIP_GOALS = [
  { key: 'serious', emoji: '\u{1F48D}', de: 'Feste Beziehung', en: 'Serious relationship', sr: 'Ozbiljna veza', sq: 'Lidhje serioze' },
  { key: 'casual', emoji: '\u{1F60A}', de: 'Etwas Lockeres', en: 'Something casual', sr: 'Nesto opusteno', sq: 'Dicka e lehte' },
  { key: 'friendship', emoji: '\u{1F91D}', de: 'Freundschaft', en: 'Friendship', sr: 'Prijateljstvo', sq: 'Miqesi' },
  { key: 'open', emoji: '\u{1F30D}', de: 'Offen fuer alles', en: 'Open to anything', sr: 'Otvoren za sve', sq: 'Hapur per gjithcka' },
];

// Regionen pro Land - die wichtigsten/bekanntesten Regionen
export const REGIONS: Record<string, { code: string; name: string }[]> = {
  RS: [
    { code: 'RS-BG', name: 'Beograd' },
    { code: 'RS-VO', name: 'Vojvodina' },
    { code: 'RS-SU', name: 'Sumadija' },
    { code: 'RS-NI', name: 'Nis / Jug Srbije' },
    { code: 'RS-ZS', name: 'Zapadna Srbija' },
    { code: 'RS-SB', name: 'Sandzak' },
  ],
  HR: [
    { code: 'HR-ZG', name: 'Zagreb' },
    { code: 'HR-DA', name: 'Dalmacija (Split, Zadar, Dubrovnik)' },
    { code: 'HR-IS', name: 'Istra / Kvarner' },
    { code: 'HR-SL', name: 'Slavonija' },
    { code: 'HR-ZA', name: 'Zagorje / Medjimurje' },
  ],
  BA: [
    { code: 'BA-SA', name: 'Sarajevo' },
    { code: 'BA-TU', name: 'Tuzla / Sjeveroistok' },
    { code: 'BA-MO', name: 'Mostar / Hercegovina' },
    { code: 'BA-BL', name: 'Banja Luka / Krajina' },
    { code: 'BA-ZE', name: 'Zenica / Centralna BiH' },
    { code: 'BA-BR', name: 'Brcko / Posavina' },
  ],
  ME: [
    { code: 'ME-PG', name: 'Podgorica' },
    { code: 'ME-PO', name: 'Primorje (Bar, Budva, Kotor)' },
    { code: 'ME-NK', name: 'Niksic / Sjever' },
  ],
  MK: [
    { code: 'MK-SK', name: 'Skopje' },
    { code: 'MK-OH', name: 'Ohrid / Jugozapad' },
    { code: 'MK-BT', name: 'Bitola / Prilep' },
    { code: 'MK-ST', name: 'Stip / Istok' },
  ],
  XK: [
    { code: 'XK-PR', name: 'Prishtina' },
    { code: 'XK-PZ', name: 'Prizren' },
    { code: 'XK-PE', name: 'Peja / Decan' },
    { code: 'XK-MI', name: 'Mitrovica' },
    { code: 'XK-GJ', name: 'Gjilan / Ferizaj' },
  ],
  SI: [
    { code: 'SI-LJ', name: 'Ljubljana' },
    { code: 'SI-MB', name: 'Maribor / Stajerska' },
    { code: 'SI-KP', name: 'Koper / Primorska' },
  ],
};

export const APP_LANGUAGES = [
  { code: 'de', name: 'Deutsch', flag: 'DE' },
  { code: 'en', name: 'English', flag: 'EN' },
  { code: 'sr', name: 'Srpski/Hrvatski', flag: 'SR' },
  { code: 'sq', name: 'Shqip', flag: 'SQ' },
];
