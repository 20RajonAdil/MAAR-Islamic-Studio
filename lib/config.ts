// WHITELIST: only these channels are ever loaded. Verify each @handle on YouTube and edit freely.
export const CHANNELS: string[] = [
  "@MercifulServant", "@YasirQadhi", "@muftimenkofficial", "@BayyinahInstitute",
  "@Quran_Weekly", "@IslamQA", "@HudaTV", "@AssimAlHakeem",
];

// Second safety layer: any video whose title/description contains these is dropped.
export const BLOCK: string[] = [
  "music video", "official video", "lyrics", "song", "movie", "trailer", "gaming", "gameplay",
  "prank", "vlog", "reaction", "remix", "dj ", "betting", "casino", "dating", "dua lipa",
  // politics and ideology topics are never allowed
  "feminis", "wake up america", "trump", "biden", "republican", "democrat", "election", "maga", "woke",
  "lgbt", "transgender", "abortion", "politic",
];

// STRICT: a video is only shown if its title or description contains at least one Islamic keyword.
export const STRICT_KEYWORDS = true;
export const ISLAMIC =
  "islam|muslim|quran|qur'an|allah|prophet|sunnah|hadith|\\bdua\\b|salah|salat|ramadan|hajj|umrah|khutbah|jumu|tafsir|seerah|sahaba|fiqh|halal|haram|iman|taqwa|jannah|dhikr|sheikh|shaykh|ustadh|imam|mufti|surah|ayah|sharia|deen|ummah|\\beid\\b|masjid|mosque|bismillah|alhamdulillah|subhanallah|inshallah|aqeedah|tawheed|nasheed|[\\u0600-\\u06FF]";

// Topic chips: keyword filters over the approved videos.
export const TOPICS: Record<string, string> = {
  All: "",
  Quran: "quran|qur'an|tafsir|surah|recitation",
  Hadith: "hadith|sunnah|bukhari|muslim",
  Seerah: "seerah|prophet|muhammad|sahaba|companions",
  Fiqh: "fiqh|halal|haram|ruling|fatwa|prayer|salah|fasting",
  Dua: "dua|dhikr|adhkar|remembrance",
  Khutbah: "khutbah|jumu'ah|friday",
  Ramadan: "ramadan|taraweeh|eid|hajj|umrah",
  Lectures: "lecture|series|talk|reminder|class",
};

export type Video = { id: string; title: string; desc: string; date: string; thumb: string; ch: string; chTitle: string };
export type Channel = { id: string; title: string; thumb: string; handle: string; vids: Video[]; partial?: boolean };

// DISCOVERY: finds more Islamic videos and channels beyond the whitelist. Every result still passes the
// channel check, keyword check and blocklist. Each query costs 100 YouTube API units (cached 12h).
export const DISCOVER_ON = true;
export const DISCOVER: string[] = [
  "Quran recitation", "Islamic lecture", "Islamic reminder", "Seerah of the Prophet", "hadith explained",
  "tafsir of the Quran", "Islamic khutbah", "dua and dhikr", "Ramadan Islamic", "Islamic history", "fiqh Islamic ruling",
];
// Channel IDs (UC...) that must never appear anywhere.
export const BLOCKED_CHANNELS: string[] = [];
