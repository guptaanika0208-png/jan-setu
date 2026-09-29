/**
 * Registry of every language Jan Setu is designed to support:
 * the 22 languages in the Eighth Schedule of the Indian Constitution,
 * plus English. `translated: true` means a complete locale JSON exists
 * in src/i18n/locales/ - everything else falls back to English at
 * runtime via i18next's fallbackLng, so the app is always usable while
 * a translation is filled in (see docs/I18N.md for the contribution flow).
 *
 * This list itself is the "translation architecture": adding a language
 * is: (1) drop a new locales/<code>.json using en.json as the key
 * template, (2) flip `translated` to true, (3) it appears in the
 * LanguageSelector automatically. No other code changes needed.
 */
export const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", translated: true },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", translated: true },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া", translated: false },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", translated: false },
  { code: "bo", name: "Bodo", nativeName: "बड़ो", translated: false },
  { code: "doi", name: "Dogri", nativeName: "डोगरी", translated: false },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", translated: false },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", translated: false },
  { code: "ks", name: "Kashmiri", nativeName: "کٲشُر", translated: false },
  { code: "kok", name: "Konkani", nativeName: "कोंकणी", translated: false },
  { code: "mai", name: "Maithili", nativeName: "मैथिली", translated: false },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", translated: false },
  { code: "mni", name: "Manipuri", nativeName: "মৈতৈলোন্", translated: false },
  { code: "mr", name: "Marathi", nativeName: "मराठी", translated: false },
  { code: "ne", name: "Nepali", nativeName: "नेपाली", translated: false },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", translated: false },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", translated: false },
  { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्", translated: false },
  { code: "sat", name: "Santali", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ", translated: false },
  { code: "sd", name: "Sindhi", nativeName: "سنڌي", translated: false },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", translated: false },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", translated: false },
  { code: "ur", name: "Urdu", nativeName: "اردو", translated: false },
];

export const getLanguageByCode = (code) => LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
