import { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LANGUAGES, getLanguageByCode } from "../i18n/languages";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();
  const [languageCode, setLanguageCode] = useState(() => localStorage.getItem("jansetu_language") || "en");
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem("jansetu_high_contrast") === "true");

  useEffect(() => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem("jansetu_language", languageCode);
    document.documentElement.lang = languageCode;
  }, [languageCode, i18n]);

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast);
    localStorage.setItem("jansetu_high_contrast", String(highContrast));
  }, [highContrast]);

  const currentLanguage = getLanguageByCode(languageCode);

  return (
    <LanguageContext.Provider
      value={{
        languageCode,
        setLanguageCode,
        currentLanguage,
        languages: LANGUAGES,
        highContrast,
        setHighContrast,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
