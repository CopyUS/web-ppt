import localesData from '../i18n/locales.json';

export type Locale = 'en' | 'zh' | 'es' | 'de' | 'fr' | 'it' | 'ar' | 'pt' | 'hi' | 'ru';
export type TranslationKey = keyof typeof localesData['en'];

/** Maps a BCP 47 language tag to a supported Locale. */
export function parseLocale(langTag: string): Locale {
  const tag = langTag.toLowerCase();
  if (tag.startsWith('zh')) return 'zh';
  if (tag.startsWith('es')) return 'es';
  if (tag.startsWith('de')) return 'de';
  if (tag.startsWith('fr')) return 'fr';
  if (tag.startsWith('it')) return 'it';
  if (tag.startsWith('ar')) return 'ar';
  if (tag.startsWith('pt')) return 'pt';
  if (tag.startsWith('hi')) return 'hi';
  if (tag.startsWith('ru')) return 'ru';
  return 'en';
}

class I18n {
  private locale: Locale;
  private readonly listeners = new Set<() => void>();

  constructor() {
    this.locale = this.detectLocale();
  }

  private detectLocale(): Locale {
    if (typeof navigator === 'undefined') return 'en';
    return parseLocale(navigator.language ?? 'en');
  }

  /** Translate a key in the current locale. Falls back to English, then the key itself. */
  t(key: TranslationKey): string {
    return (
      localesData[this.locale][key] ??
      localesData['en'][key] ??
      key
    );
  }

  getLocale(): Locale {
    return this.locale;
  }

  getAvailableLocales(): Locale[] {
    return ['en', 'zh', 'es', 'de', 'fr', 'it', 'ar', 'pt', 'hi', 'ru'];
  }

  /** Switch locale and notify all listeners. */
  setLocale(locale: Locale): void {
    if (this.locale === locale) return;
    this.locale = locale;
    this.listeners.forEach((fn) => fn());
  }

  /**
   * Subscribe to locale changes.
   * @returns Unsubscribe function.
   */
  onLocaleChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

/** Singleton i18n instance shared across the add-in. */
export const i18n = new I18n();
