// components/DigitalBharatMenuLogo.jsx

import React from 'react';
import { Utensils } from 'lucide-react'; // Lucide से Utensils आइकॉन इम्पोर्ट किया गया

const DigitalBharatMenuLogo = ({ className = 'h-16', textColor = 'text-gray-900' }) => {
  // अब हम मैन्युअल SVG पाथ्स की जगह Lucide Icon का उपयोग कर रहे हैं।
  // Icon के रंग और साइज़ को Tailwind classes से नियंत्रित किया जाएगा।
  const IconComponent = (
    <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16">
      <Utensils 
        // Icon का रंग: Saffron/Orange (BHARAT) और Teal/Blue (DIGITAL) का मिश्रण
        // हमने यहाँ Utensils आइकॉन को नीला (Digital/Tech) रंग दिया है
        className="w-10 h-10 md:w-12 md:h-12 text-blue-700" 
        strokeWidth={2} // Icon की मोटाई
      />
      
      {/* एडवांस 'Digital' टच के लिए, हम Icon के बगल में एक छोटा सा 
        डिजिटल/कनेक्टिविटी सिंबल (जैसे Dot) लगा सकते हैं।
      */}
      <div className="absolute ml-8 mb-8 w-2 h-2 rounded-full bg-orange-500 border-2 border-white"></div>
    </div>
  );

  return (
    <div className="flex items-start space-x-3">
      {/* 1. The Professional Lucide Icon */}
      <div className={className}>
        {IconComponent}
      </div>

      {/* 2. The Text Stack (Hierarchy: BHARAT is the main focus) */}
      <div className={`flex flex-col items-start font-sans ${textColor} pt-1`}>
        {/* Line 1: Digital (Small, Tech Feel) */}
        <div className="text-xs uppercase tracking-widest text-blue-700 font-semibold">
          Digital
        </div>

        {/* Line 2: BHARAT (Largest, Boldest, Main Brand) */}
        <div className="text-3xl font-extrabold tracking-wider text-orange-600">
          BHARAT
        </div>
        
        {/* Line 3: menu (Standard, descriptive) */}
        <div className="text-lg font-medium text-gray-500 leading-2">
          menu
        </div>
      </div>
    </div>
  );
};

export default DigitalBharatMenuLogo;