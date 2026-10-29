export const LANG_NAME: Record<string, string> = { en: "English", bn: "বাংলা", ur: "اردو", ar: "العربية", id: "Indonesia", ms: "Melayu", tr: "Türkçe", hi: "हिन्दी" };
export const COUNTRY_LANG: Record<string, string> = {
  BD: "bn", PK: "ur", IN: "ur", ID: "id", MY: "ms", BN: "ms", TR: "tr",
  SA: "ar", EG: "ar", AE: "ar", MA: "ar", DZ: "ar", IQ: "ar", JO: "ar", KW: "ar", QA: "ar", LB: "ar", SY: "ar", YE: "ar", LY: "ar", TN: "ar", OM: "ar", SD: "ar", PS: "ar", AF: "ar", IR: "ar",
};
// Detects the language of a search or title from its script and a few romanised cue words.
export function detectLang(s: string): string | null {
  if (/[\u0980-\u09FF]/.test(s)) return "bn";
  if (/[\u0900-\u097F]/.test(s)) return "hi";
  if (/[ٹڈڑںےگپچژ]/.test(s)) return "ur";
  if (/[\u0600-\u06FF]/.test(s)) return "ar";
  if (/[ğışĞİ]/.test(s)) return "tr";
  if (/\b(kajian|ceramah|ustadz|ustaz|sholat|shalat|murottal|tilawah)\b/i.test(s)) return "id";
  if (/\b(waz|bangla|mahfil|mahfil)\b/i.test(s)) return "bn";
  return null;
}
