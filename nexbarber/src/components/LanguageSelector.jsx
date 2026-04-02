import { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useLocale } from "../context/LocaleContext";

export default function LanguageSelector({ className = "", compact = false }) {
  const { language, setLanguage, languages, currentLanguage } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const labels = useMemo(
    () => ({
      "pt-BR": "Português BR",
      es: "Español",
      en: "English",
    }),
    [],
  );

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`language-select ${compact ? "is-compact" : ""} ${open ? "is-open" : ""} ${className}`.trim()}
    >
      <button
        type="button"
        className="language-select-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="language-select-flag" aria-hidden="true">
          <img src={currentLanguage.flag} alt={currentLanguage.label} />
        </span>

        <span className="language-select-label">{labels[language] || currentLanguage.label}</span>

        <span className="language-select-chevron" aria-hidden="true">
          <FiChevronDown />
        </span>
      </button>

      {open ? (
        <div className="language-select-menu" role="listbox" aria-label="Selecionar idioma">
          {languages.map((item) => (
            <button
              key={item.code}
              type="button"
              className={`language-select-option${item.code === language ? " is-active" : ""}`}
              onClick={() => {
                setLanguage(item.code);
                setOpen(false);
              }}
            >
              <span className="language-select-flag" aria-hidden="true">
                <img src={item.flag} alt={item.label} />
              </span>
              <span>{labels[item.code] || item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
