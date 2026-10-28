// WHITELIST: only these channels are ever loaded. Verify each @handle on YouTube and edit freely.
export const CHANNELS: string[] = [
  "@MercifulServant", "@YasirQadhi", "@muftimenkofficial", "@BayyinahInstitute",
  "@Quran_Weekly", "@IslamQA", "@HudaTV", "@AssimAlHakeem",
];

// Second safety layer: any video whose title/description contains these is dropped.
export const BLOCK: string[] = [
  "music video", "official video", "lyrics", "song", "movie", "trailer", "gaming", "gameplay",
  "prank", "vlog", "reaction", "remix", "dj ", "betting", "casino", "dating",
];

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
export type Channel = { id: string; title: string; thumb: string; handle: string; vids: Video[] };
