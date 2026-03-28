import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext({
  language: "en",
  toggleLanguage: () => {},
  isArabic: false,
});

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lang") || "en";
    }
    return "en";
  });

  const isArabic = language === "ar";

  useEffect(() => {
    localStorage.setItem("lang", language);
    document.documentElement.setAttribute("dir", isArabic ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", language);
  }, [language, isArabic]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ar" : "en"));
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, isArabic }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export default LanguageContext;
