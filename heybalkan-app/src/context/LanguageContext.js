import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../i18n/translations';

const LanguageContext = createContext({});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('de');

  React.useEffect(() => {
    // Load saved language
    AsyncStorage.getItem('heybalkan_language').then((saved) => {
      if (saved && translations[saved]) {
        setLanguageState(saved);
      }
    });
  }, []);

  const setLanguage = async (lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
      await AsyncStorage.setItem('heybalkan_language', lang);
    }
  };

  const t = (key) => {
    return translations[language]?.[key] || translations.de[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
