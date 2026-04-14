import { i18n, parseLocale, type Locale, type TranslationKey } from '../src/shared/i18n';
import localesData from '../src/i18n/locales.json';

// Reset locale before each test to avoid state leaking between tests
beforeEach(() => {
  i18n.setLocale('en');
});

// ─── parseLocale ──────────────────────────────────────────────────────────────

describe('parseLocale', () => {
  it('maps ru-RU to ru', () => {
    expect(parseLocale('ru-RU')).toBe('ru');
  });

  it('maps ru to ru', () => {
    expect(parseLocale('ru')).toBe('ru');
  });

  it('maps es-ES to es', () => {
    expect(parseLocale('es-ES')).toBe('es');
  });

  it('maps es to es', () => {
    expect(parseLocale('es')).toBe('es');
  });

  it('maps en-US to en', () => {
    expect(parseLocale('en-US')).toBe('en');
  });

  it('maps zh-CN to zh', () => {
    expect(parseLocale('zh-CN')).toBe('zh');
  });

  it('maps de-DE to de', () => {
    expect(parseLocale('de-DE')).toBe('de');
  });

  it('maps fr-FR to fr', () => {
    expect(parseLocale('fr-FR')).toBe('fr');
  });

  it('maps it-IT to it', () => {
    expect(parseLocale('it-IT')).toBe('it');
  });

  it('maps ar-SA to ar', () => {
    expect(parseLocale('ar-SA')).toBe('ar');
  });

  it('maps pt-BR to pt', () => {
    expect(parseLocale('pt-BR')).toBe('pt');
  });

  it('maps hi-IN to hi', () => {
    expect(parseLocale('hi-IN')).toBe('hi');
  });

  it('maps unknown tag to en', () => {
    expect(parseLocale('ja-JP')).toBe('en');
  });

  it('is case-insensitive', () => {
    expect(parseLocale('RU-RU')).toBe('ru');
    expect(parseLocale('ES')).toBe('es');
    expect(parseLocale('DE-at')).toBe('de');
    expect(parseLocale('FR')).toBe('fr');
  });
});

// ─── Locales completeness ─────────────────────────────────────────────────────

describe('locales.json completeness', () => {
  const enKeys = Object.keys(localesData['en']) as TranslationKey[];

  const allNonEn: Locale[] = ['zh', 'es', 'de', 'fr', 'it', 'ar', 'pt', 'hi', 'ru'];

  allNonEn.forEach((locale) => {
    it(`${locale} has all keys that en has`, () => {
      enKeys.forEach((key) => {
        expect(localesData[locale]).toHaveProperty(key);
      });
    });

    it(`${locale} has no empty strings`, () => {
      enKeys.forEach((key) => {
        expect(localesData[locale][key].length).toBeGreaterThan(0);
      });
    });
  });

  it('all locales have exactly the same set of keys', () => {
    allNonEn.forEach((locale) => {
      expect(Object.keys(localesData[locale]).sort()).toEqual(enKeys.sort());
    });
  });
});

// ─── i18n.t() ─────────────────────────────────────────────────────────────────

describe('i18n.t()', () => {
  it('returns English translation by default', () => {
    expect(i18n.t('apply')).toBe('Apply');
  });

  it('returns Russian translation after setLocale("ru")', () => {
    i18n.setLocale('ru');
    expect(i18n.t('apply')).toBe('Применить');
  });

  it('returns Spanish translation after setLocale("es")', () => {
    i18n.setLocale('es');
    expect(i18n.t('apply')).toBe('Aplicar');
  });

  it('returns correct value for every key in every locale', () => {
    const enKeys = Object.keys(localesData['en']) as TranslationKey[];
    (['en', 'zh', 'es', 'de', 'fr', 'it', 'ar', 'pt', 'hi', 'ru'] as Locale[]).forEach((locale) => {
      i18n.setLocale(locale);
      enKeys.forEach((key) => {
        const result = i18n.t(key);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });
});

// ─── i18n.setLocale() ─────────────────────────────────────────────────────────

describe('i18n.setLocale()', () => {
  it('updates getLocale()', () => {
    i18n.setLocale('ru');
    expect(i18n.getLocale()).toBe('ru');
  });

  it('does not fire listener when locale is unchanged', () => {
    i18n.setLocale('en');
    const listener = jest.fn();
    i18n.onLocaleChange(listener);
    i18n.setLocale('en');
    expect(listener).not.toHaveBeenCalled();
  });
});

// ─── i18n.onLocaleChange() ────────────────────────────────────────────────────

describe('i18n.onLocaleChange()', () => {
  it('fires listener when locale changes', () => {
    const listener = jest.fn();
    i18n.onLocaleChange(listener);
    i18n.setLocale('ru');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('unsubscribe function stops firing', () => {
    const listener = jest.fn();
    const unsubscribe = i18n.onLocaleChange(listener);
    unsubscribe();
    i18n.setLocale('ru');
    expect(listener).not.toHaveBeenCalled();
  });

  it('supports multiple independent listeners', () => {
    const a = jest.fn();
    const b = jest.fn();
    i18n.onLocaleChange(a);
    i18n.onLocaleChange(b);
    i18n.setLocale('es');
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });
});

// ─── i18n.getAvailableLocales() ───────────────────────────────────────────────

describe('i18n.getAvailableLocales()', () => {
  it('returns all ten supported locales', () => {
    expect(i18n.getAvailableLocales()).toEqual(['en', 'zh', 'es', 'de', 'fr', 'it', 'ar', 'pt', 'hi', 'ru']);
  });
});
