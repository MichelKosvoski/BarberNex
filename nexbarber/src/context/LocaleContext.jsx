/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import brFlag from "../assets/br.png";
import esFlag from "../assets/es.png";
import usFlag from "../assets/us.png";

const STORAGE_KEY = "NexCut_language";

const LANGUAGE_META = {
  "pt-BR": {
    code: "pt-BR",
    label: "Português",
    shortLabel: "PT-BR",
    locale: "pt-BR",
    currency: "BRL",
    flag: brFlag,
  },
  es: {
    code: "es",
    label: "Español",
    shortLabel: "ES",
    locale: "es-ES",
    currency: "EUR",
    flag: esFlag,
  },
  en: {
    code: "en",
    label: "English",
    shortLabel: "EN",
    locale: "en-US",
    currency: "USD",
    flag: usFlag,
  },
};

const EXCHANGE_FROM_BRL = {
  BRL: 1,
  USD: 0.2,
  EUR: 0.18,
};

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && LANGUAGE_META[saved] ? saved : "pt-BR";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = LANGUAGE_META[language]?.locale || "pt-BR";
  }, [language]);

  const value = useMemo(() => {
    const currentLanguage = LANGUAGE_META[language] || LANGUAGE_META["pt-BR"];

    function convertCurrencyFromBrl(value) {
      const numeric = Number(value || 0);
      const factor = EXCHANGE_FROM_BRL[currentLanguage.currency] || 1;
      return numeric * factor;
    }

    function formatCurrencyFromBrl(value) {
      return new Intl.NumberFormat(currentLanguage.locale, {
        style: "currency",
        currency: currentLanguage.currency,
        minimumFractionDigits: 2,
      }).format(convertCurrencyFromBrl(value));
    }

    function formatDate(value, options = {}) {
      return new Intl.DateTimeFormat(currentLanguage.locale, options).format(value);
    }

    return {
      language,
      setLanguage,
      languages: Object.values(LANGUAGE_META),
      currentLanguage,
      currency: currentLanguage.currency,
      locale: currentLanguage.locale,
      convertCurrencyFromBrl,
      formatCurrencyFromBrl,
      formatDate,
    };
  }, [language]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  return context;
}

