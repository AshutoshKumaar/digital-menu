"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "./index";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("language");
    if (saved) setLang(saved);
  }, []);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem("language", newLang);
  };

  const t = (key) => {
    return translations?.[lang]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ t, lang, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
