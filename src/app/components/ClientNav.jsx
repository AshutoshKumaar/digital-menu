"use client";

import React from "react";
import DigitalBharatMenuLogo from "./DigitalBharatMenuLogo";
import LanguageSwitcher from "../i18n/LanguageSwitcher";

function ClientNav({ ownerId }) {

  // const goToRestaurant = () => {
  //   const currentUrl = window.location.pathname;
  //   console.log("Current URL:", currentUrl);
  //   const targetUrl = `/restaurant/${ownerId}`;

  //   // ✔ If already on same restaurant page → do nothing
  //   if (currentUrl === targetUrl) return;

  //   // ✔ Otherwise redirect
  //   window.location.href = targetUrl;
  // };

  return (
    <div
      className="
        w-full
        flex
        justify-between
        flex-row 
        bg-black/30
        items-center
        py-4
        px-2
        shadow-md
        fixed
        top-0
        left-0
        z-50
        backdrop-blur-sm
      "
    >
      {/* Left Side Logo */}
      <div className="cursor-pointer">
        <DigitalBharatMenuLogo />
      </div>

      {/* Right Side Language Switcher */}
      <div>
        <LanguageSwitcher />
      </div>
    </div>
  );
}

export default ClientNav;
