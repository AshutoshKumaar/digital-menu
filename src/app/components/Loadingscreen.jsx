"use client";
import { Mooli } from "next/font/google";

const mooli = Mooli({ weight: "400", subsets: ["latin"] });

export default function LoadingScreen({ message = "Loading...", subtitle = "", ownerName = "" }) {
  return (
    <div
      className={`flex items-center justify-center min-h-screen p-6 ${mooli.className}`}
      style={{
        backgroundColor: "#0f1720",
        backgroundImage: "radial-gradient(circle at 10% 10%, rgba(255,255,255,0.03), transparent 25%)",
        color: "#f8fafc",
      }}
    >
      <div className="w-full max-w-md text-center">
        {/* Card */}
        <div className="bg-gradient-to-b from-gray-900/60 to-gray-800/40 border border-gray-700 rounded-2xl p-6 shadow-2xl">
          {/* Spinner + Owner */}
          <div className="flex items-center justify-center gap-4">
            {/* Spinner */}
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400/20 to-yellow-400/10 border border-yellow-400/20 shadow-inner">
              <svg className="w-10 h-10 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="3" strokeOpacity="0.15"></circle>
                <path d="M22 12a10 10 0 0 1-10 10" strokeWidth="3" strokeLinecap="round"></path>
              </svg>
            </div>

            {/* Text */}
            <div className="text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-yellow-400">
                {ownerName ? ownerName : "Please wait"}
              </h3>
              <p className="text-sm text-gray-300 mt-1">{message}</p>

              {/* Animated dots */}
              <div className="mt-3 flex items-center gap-1">
                <Dot delay="0" />
                <Dot delay="150" />
                <Dot delay="300" />
              </div>

              {subtitle && <p className="text-xs text-gray-400 mt-3">{subtitle}</p>}
            </div>
          </div>

          {/* Optional subtle progress bar */}
          <div className="mt-6 w-full bg-gray-800 h-1 rounded-full overflow-hidden">
            <div className="h-1 bg-yellow-400/80 animate-[loading_2.2s_linear_infinite]" style={{ width: "80%" }} />
          </div>
        </div>

        {/* small helper text */}
        <p className="mt-4 text-xs text-gray-500">
          If this takes too long, try refreshing the page or check your connection.
        </p>
      </div>

      {/* Inline styles for the small animation used above */}
      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-6px); opacity: 0.2; width: 20%; }
          50% { transform: translateX(0); opacity: 1; width: 60%; }
          100% { transform: translateX(6px); opacity: 0.2; width: 20%; }
        }
      `}</style>
    </div>
  );
}

function Dot({ delay = "0" }) {
  return (
    <span
      className="inline-block w-2.5 h-2.5 bg-yellow-400 rounded-full opacity-90"
      style={{
        animation: `loadingDots 900ms ${delay}ms infinite`,
      }}
    />
  );
}

/* Add global keyframes for dots (using a small style tag below is fine in client component) */
