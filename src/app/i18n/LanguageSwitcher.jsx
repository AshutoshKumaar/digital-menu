"use client";
import { useState } from "react";
import { useTranslation } from "./LanguageContext";
import { ChevronDown } from "lucide-react";

export default function LanguageSwitcher() {
  const { lang, changeLanguage } = useTranslation();
  const [open, setOpen] = useState(false);

  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिंदी" },
    { code: "hieng", label: "Hinglish" },
  ];

  const selectedLang = languages.find((l) => l.code === lang)?.label;

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="
          flex items-center gap-2
          bg-transparent
          border-2 border-amber-500
          px-3 py-1.5
          rounded-full
          text-yellow-300 
          cursor-pointer
        "
      >
        <span>{selectedLang}</span>
        <span className="text-yellow-400 text-xl">🌐</span>
        <ChevronDown
          className={`w-4 h-4 text-yellow-400 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute right-0 mt-2
            bg-[#1a1a1a]
            border border-amber-600
            rounded-lg
            shadow-lg
            w-32
            z-50
          "
        >
          {languages.map((option) => (
            <button
              key={option.code}
              onClick={() => {
                changeLanguage(option.code);
                setOpen(false);
              }}
              className={`
                block w-full text-left px-4 py-2 
                text-yellow-200
                hover:bg-amber-600/20 
                transition
                ${lang === option.code ? "text-yellow-400 font-bold" : ""}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
