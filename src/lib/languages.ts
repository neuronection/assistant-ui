/**
 * Shared language catalog: an ISO 639-1 superset (43 entries)
 * with English name + nativeName (endonym — the default picker label)
 * and an optional `flag` (most-associated country, presentational
 * only; omitted where no uncontroversial primary exists — ar, ca, sw,
 * ta). Data-only export (library ADR-006; family ADR-0024). Consumed
 * via the `@neuronection/assistant-ui/languages` subpath.
 *
 * `nb` (Bokmål) and `no` (macro) both exist; STT surfaces may prefer
 * `nb` where the provider distinguishes. Locale-tag lookups use the
 * language subtag (`pt-BR` → `pt`). `pickLanguages` preserves caller
 * order — Greek-first slices stay Greek-first.
 */

export interface LanguageOption {
  code: string
  name: string
  nativeName: string
  flag?: string
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'български', flag: '🇧🇬' },
  { code: 'bn', name: 'Bangla', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'ca', name: 'Catalan', nativeName: 'català' },
  { code: 'cs', name: 'Czech', nativeName: 'čeština', flag: '🇨🇿' },
  { code: 'da', name: 'Danish', nativeName: 'dansk', flag: '🇩🇰' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'español', flag: '🇪🇸' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷' },
  { code: 'fi', name: 'Finnish', nativeName: 'suomi', flag: '🇫🇮' },
  { code: 'fr', name: 'French', nativeName: 'français', flag: '🇫🇷' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'hr', name: 'Croatian', nativeName: 'hrvatski', flag: '🇭🇷' },
  { code: 'hu', name: 'Hungarian', nativeName: 'magyar', flag: '🇭🇺' },
  { code: 'id', name: 'Indonesian', nativeName: 'Indonesia', flag: '🇮🇩' },
  { code: 'is', name: 'Icelandic', nativeName: 'íslenska', flag: '🇮🇸' },
  { code: 'it', name: 'Italian', nativeName: 'italiano', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ms', name: 'Malay', nativeName: 'Melayu', flag: '🇲🇾' },
  { code: 'nb', name: 'Norwegian Bokmål', nativeName: 'norsk bokmål', flag: '🇳🇴' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'nn', name: 'Norwegian Nynorsk', nativeName: 'norsk nynorsk', flag: '🇳🇴' },
  { code: 'no', name: 'Norwegian', nativeName: 'norsk', flag: '🇳🇴' },
  { code: 'pl', name: 'Polish', nativeName: 'polski', flag: '🇵🇱' },
  { code: 'pt', name: 'Portuguese', nativeName: 'português', flag: '🇵🇹' },
  { code: 'ro', name: 'Romanian', nativeName: 'română', flag: '🇷🇴' },
  { code: 'ru', name: 'Russian', nativeName: 'русский', flag: '🇷🇺' },
  { code: 'sk', name: 'Slovak', nativeName: 'slovenčina', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenian', nativeName: 'slovenščina', flag: '🇸🇮' },
  { code: 'sr', name: 'Serbian', nativeName: 'српски', flag: '🇷🇸' },
  { code: 'sv', name: 'Swedish', nativeName: 'svenska', flag: '🇸🇪' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'українська', flag: '🇺🇦' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
]

export function findLanguage(code?: string): LanguageOption | undefined {
  if (!code) return undefined
  const base = code.trim().toLowerCase().split('-')[0]
  return LANGUAGES.find((entry) => entry.code === base)
}

export function isLanguageCode(code?: string): boolean {
  return findLanguage(code) !== undefined
}

export function pickLanguages(codes: string[]): LanguageOption[] {
  const picked: LanguageOption[] = []
  for (const code of codes) {
    const entry = findLanguage(code)
    if (entry) picked.push(entry)
    else console.warn(`[assistant-ui] pickLanguages: unknown language code ${code}`)
  }
  return picked
}

/** Localized language name via Intl.DisplayNames; falls back to the
 * catalog English name, then the raw code. Never throws. */
export function languageDisplayName(code: string, locale = 'en'): string {
  try {
    const displayed = new Intl.DisplayNames([locale], { type: 'language' }).of(code)
    if (displayed && displayed !== code) return displayed
  } catch {
    // fall through to catalog fallback
  }
  return findLanguage(code)?.name ?? code
}
