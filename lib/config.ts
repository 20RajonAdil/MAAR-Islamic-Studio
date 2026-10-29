// ===== WHITELIST (trusted Islamic channels) =====
// By @handle. Each is still verified as Islamic before use. Edit freely.
export const CHANNELS: string[] = [
  "@MercifulServant", "@YasirQadhi", "@muftimenkofficial", "@BayyinahInstitute",
  "@Quran_Weekly", "@IslamQA", "@HudaTV", "@AssimAlHakeem",
];
// By channel NAME (found with YouTube search, then verified as Islamic). Use this when you are unsure of a handle.
export const CHANNEL_NAMES: string[] = [
  "Merciful Servant", "Eternity", "Mufti Menk", "Nouman Ali Khan", "Omar Suleiman", "Let The Quran Speak",
  "Mohammed Hijab", "Yaqeen Institute", "Mishary Rashid Alafasy", "Dr Zakir Naik", "Abdur Rahman Quran", "Shaykh Uthman",
];
export const HOME_PER_CHANNEL = 80; // newest videos per channel on Home (channel pages load EVERYTHING)

// ===== FILTERS =====
// Hard block: non-Islamic entertainment. Always applied (title for trusted channels, title+description otherwise).
export const BLOCK: string[] = [
  "music video", "official video", "lyrics", "movie", "trailer", "gaming", "gameplay", "prank", "vlog",
  "reaction", "remix", "dj ", "betting", "casino", "dating", "dua lipa", "lgbt", "transgender", "abortion",
];
// Only applied to channels that are NOT trusted (discovered / searched): politics and ideology.
export const BLOCK_UNTRUSTED: string[] = [
  "feminis", "wake up america", "trump", "biden", "republican", "democrat", "election", "maga", "woke", "politic",
];
// Islamophobic / anti-Islam content. A video whose title matches any of these is removed, even if it contains Islamic keywords.
export const HOSTILE: string[] = [
  "islam.{0,14}(evil|cult|lie|fake|violent|dangerous|terror|exposed)", "(quran|koran).{0,24}(evil|fake|lies|errors|contradiction|exposed|debunk)",
  "muhammad (was )?(a )?(pedophile|paedophile|false prophet|terrorist|fraud)", "(stop|ban|end|fight|destroy)(ing)? (the )?islam",
  "islamization", "islamofascis", "radical islam", "islamic terror", "muslim (invasion|takeover|problem|rape)",
  "sharia (is )?(coming|takeover|threat)", "ex-?muslim", "apostate", "leaving islam", "why i left islam",
  "(truth|dark side|real face) of islam", "islam exposed", "exposing islam", "jihad watch", "no-?go zone", "great replacement",
];
export const HOSTILE_CHANNEL: string[] = [
  "ex-?muslim", "apostate", "jihad watch", "acts ?17", "david wood", "robert spencer", "sam shamoun", "pat condell",
  "anti-?islam", "islam exposed", "answering islam", "wake up america",
];
export const BLOCKED_CHANNELS: string[] = []; // channel IDs (UC...) that must never appear

// STRICT: videos from non-trusted channels need an Islamic keyword. Trusted channels are never keyword-filtered.
export const STRICT_KEYWORDS = true;
export const ISLAMIC =
  "islam|muslim|quran|qur'an|koran|allah|prophet|sunnah|hadith|\\bdua\\b|salah|salat|ramadan|hajj|umrah|khutbah|jumu|tafsir|seerah|sahaba|fiqh|halal|haram|iman|taqwa|jannah|dhikr|sheikh|shaykh|ustadh|imam|mufti|surah|ayah|sharia|deen|ummah|\\beid\\b|masjid|mosque|bismillah|alhamdulillah|subhanallah|inshallah|aqeedah|tawheed|nasheed|ceramah|kajian|ustadz|ustaz|murottal|shalat|sholat|kuran|namaz|hutbe|ইসলাম|কুরআন|কোরআন|হাদিস|হাদীস|আল্লাহ|নবী|ওয়াজ|মাহফিল|নামাজ|রমজান|দোয়া|সুন্নাহ|মুসলিম|इस्लाम|कुरान|[\\u0600-\\u06FF]";

// ===== TOPIC CHIPS =====
export const TOPICS: Record<string, string> = {
  All: "",
  Quran: "quran|qur'an|tafsir|surah|recitation|কুরআন|قرآن",
  Hadith: "hadith|sunnah|bukhari|muslim|হাদিস|حديث",
  Seerah: "seerah|prophet|muhammad|sahaba|companions|সিরাত",
  Fiqh: "fiqh|halal|haram|ruling|fatwa|prayer|salah|fasting|নামাজ|فقه",
  Dua: "dua|dhikr|adhkar|remembrance|দোয়া|دعاء",
  Khutbah: "khutbah|jumu'ah|friday|খুতবা|خطبة",
  Ramadan: "ramadan|taraweeh|eid|hajj|umrah|রমজান|رمضان",
  Lectures: "lecture|series|talk|reminder|class|ওয়াজ|বয়ান|محاضرة",
};

// ===== DISCOVERY (each query = 100 API units, cached 12h) =====
export const DISCOVER_ON = true;
export const DISCOVER: string[] = [
  "Quran recitation", "Islamic lecture", "Islamic reminder", "Seerah of the Prophet", "hadith explained",
  "tafsir of the Quran", "Islamic khutbah", "dua and dhikr", "Ramadan Islamic", "Islamic history", "fiqh Islamic ruling",
];
// Local-language Islamic queries, used when a visitor's country, browser or searches point to that language.
export const LANG_QUERIES: Record<string, string[]> = {
  bn: ["ইসলামিক ওয়াজ বাংলা", "কুরআন তিলাওয়াত", "বাংলা ইসলামিক বয়ান", "হাদিসের আলোচনা", "ওয়াজ মাহফিল"],
  ur: ["اسلامی بیان اردو", "قرآن تلاوت", "اردو بیان مولانا", "حدیث کی تشریح"],
  ar: ["محاضرة إسلامية", "تلاوة القرآن الكريم", "خطبة الجمعة", "تفسير القرآن"],
  id: ["ceramah islam", "kajian islam", "murottal quran", "kajian hadits"],
  ms: ["ceramah agama", "kuliah islam", "bacaan quran"],
  tr: ["islami sohbet", "kuran tilaveti", "cuma hutbesi"],
  hi: ["इस्लामी बयान", "कुरान तिलावत", "इस्लामिक तकरीर"],
};

export type Video = { id: string; title: string; desc: string; date: string; thumb: string; ch: string; chTitle: string; lang?: string };
export type Channel = { id: string; title: string; thumb: string; handle: string; vids: Video[]; partial?: boolean; total?: number };
