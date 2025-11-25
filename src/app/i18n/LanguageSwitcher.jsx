"use client";

import { useTranslation } from "./LanguageContext";

export default function LanguageSwitcher() {
  const { lang, changeLanguage } = useTranslation();

  return (
    <div className="flex items-center justify-center p-2 bg-[#1c1cce] rounded-full shadow-md w-max">
      <select
        value={lang}
        onChange={(e) => changeLanguage(e.target.value)}
        className="
          bg-white 
          text-gray-900 
          font-medium 
          p-2 px-4 
          rounded-full 
          focus:outline-none 
          focus:ring-2 
          focus:ring-blue-500 
          transition 
          duration-300 
          cursor-pointer
        "
      >
        <option value="en">English</option>
        <option value="hi">हिंदी</option>
      </select>
      <span className="ml-3 text-white text-xl select-none">
        🌐
      </span>
    </div>
  );
}
