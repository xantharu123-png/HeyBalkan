'use client';

import { useState, useEffect, useCallback } from 'react';
import { translations, type Locale } from '@/i18n/translations';

export function useLanguage() {
  const [language, setLanguageState] = useState<Locale>('de');

  useEffect(() => {
    const saved = localStorage.getItem('heybalkan_lang') as Locale | null;
    if (saved && translations[saved]) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = useCallback((lang: Locale) => {
    setLanguageState(lang);
    localStorage.setItem('heybalkan_lang', lang);
  }, []);

  const t = useCallback((key: string) => {
    return translations[language]?.[key] || translations.de[key] || key;
  }, [language]);

  return { language, setLanguage, t };
}
