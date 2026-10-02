import React, { useState } from "react";

interface CompanyLogoProps {
  companyName: string;
  logoUrl?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  xs: "w-6 h-6 rounded-md text-[10px]",
  sm: "w-8 h-8 rounded-lg text-xs",
  md: "w-10 h-10 rounded-xl text-sm",
  lg: "w-12 h-12 rounded-2xl text-base",
  xl: "w-13 h-13 sm:w-14 sm:h-14 rounded-2xl text-lg",
};

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  companyName,
  logoUrl,
  size = "md",
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);

  const cleanName = (companyName || "").trim().toLowerCase();

  // If a custom logo URL is provided and hasn't errored out, display it
  if (logoUrl && !imageError) {
    return (
      <div
        className={`${sizeClasses[size]} bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-1.5 overflow-hidden shrink-0 ${className}`}
      >
        <img
          src={logoUrl}
          alt={companyName}
          className="w-full h-full object-contain"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // --- 1. TCS (Tata Consultancy Services) ---
  if (cleanName.includes("tcs") || cleanName.includes("tata consultancy")) {
    return (
      <div
        className={`${sizeClasses[size]} bg-white border border-blue-200/80 shadow-xs flex items-center justify-center p-2 shrink-0 group-hover:scale-105 transition-transform overflow-hidden ${className}`}
        title="Tata Consultancy Services"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Tata Oval Shield */}
          <rect width="100" height="100" rx="20" fill="#004C97" />
          {/* Iconic Tata Twin Arc / T mark */}
          <path
            d="M32 28 C38 28, 48 35, 48 54 L48 74 C48 75.5, 46.5 77, 45 77 C43.5 77, 42 75.5, 42 74 L42 54 C42 41, 35 34, 30 34 C28.5 34, 27 32.5, 27 31 C27 29.5, 28.5 28, 30 28 Z"
            fill="#FFFFFF"
          />
          <path
            d="M68 28 C62 28, 52 35, 52 54 L52 74 C52 75.5, 53.5 77, 55 77 C56.5 77, 58 75.5, 58 74 L58 54 C58 41, 65 34, 70 34 C71.5 34, 73 32.5, 73 31 C73 29.5, 71.5 28, 70 28 Z"
            fill="#FFFFFF"
          />
          {/* TCS text mark */}
          <text
            x="50"
            y="90"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="18"
            fontWeight="900"
            letterSpacing="2"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            TCS
          </text>
        </svg>
      </div>
    );
  }

  // --- 2. Microsoft / Microsoft IDC ---
  if (cleanName.includes("microsoft") || cleanName.includes("msft")) {
    return (
      <div
        className={`${sizeClasses[size]} bg-white border border-slate-200/90 shadow-xs flex items-center justify-center p-2.5 shrink-0 group-hover:scale-105 transition-transform overflow-hidden ${className}`}
        title="Microsoft"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
          <rect x="2" y="2" width="9.2" height="9.2" rx="1" fill="#F25022" />
          <rect x="12.8" y="2" width="9.2" height="9.2" rx="1" fill="#7FBA00" />
          <rect x="2" y="12.8" width="9.2" height="9.2" rx="1" fill="#00A4EF" />
          <rect x="12.8" y="12.8" width="9.2" height="9.2" rx="1" fill="#FFB900" />
        </svg>
      </div>
    );
  }

  // --- 3. Google / Google Cloud ---
  if (cleanName.includes("google") || cleanName.includes("alphabet")) {
    return (
      <div
        className={`${sizeClasses[size]} bg-white border border-slate-200/90 shadow-xs flex items-center justify-center p-2.5 shrink-0 group-hover:scale-105 transition-transform overflow-hidden ${className}`}
        title="Google Cloud"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.28v3.15C3.25 21.32 7.31 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27A7.09 7.09 0 0 1 4.9 12c0-.79.14-1.56.38-2.27V6.58H1.28A11.97 11.97 0 0 0 0 12c0 1.92.45 3.74 1.28 5.42l4-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.68 1.28 6.58l4 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
      </div>
    );
  }

  // --- 4. Amazon Web Services / Amazon / AWS ---
  if (cleanName.includes("amazon") || cleanName.includes("aws")) {
    return (
      <div
        className={`${sizeClasses[size]} bg-[#232F3E] border border-slate-700 shadow-xs flex items-center justify-center p-2 shrink-0 group-hover:scale-105 transition-transform overflow-hidden ${className}`}
        title="Amazon Web Services"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          <text
            x="50"
            y="45"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="26"
            fontWeight="900"
            letterSpacing="1"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            aws
          </text>
          {/* Orange Smile Arrow */}
          <path
            d="M20 62 C38 78, 65 78, 80 62"
            stroke="#FF9900"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M74 58 L82 63 L74 72"
            stroke="#FF9900"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#FF9900"
          />
        </svg>
      </div>
    );
  }

  // --- 5. Goldman Sachs ---
  if (cleanName.includes("goldman") || cleanName.includes("sachs")) {
    return (
      <div
        className={`${sizeClasses[size]} bg-[#7399C6] border border-blue-300 shadow-xs flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition-transform overflow-hidden ${className}`}
        title="Goldman Sachs"
      >
        <div className="w-full h-full flex flex-col items-center justify-center text-white font-serif font-black leading-none text-center select-none">
          <span className="text-[11px] sm:text-[13px] tracking-tight">GS</span>
          <span className="text-[6px] sm:text-[7px] uppercase tracking-widest opacity-95">Goldman</span>
        </div>
      </div>
    );
  }

  // --- 6. Qualcomm / Qualcomm India ---
  if (cleanName.includes("qualcomm")) {
    return (
      <div
        className={`${sizeClasses[size]} bg-[#002B49] border border-slate-800 shadow-xs flex items-center justify-center p-2 shrink-0 group-hover:scale-105 transition-transform overflow-hidden ${className}`}
        title="Qualcomm"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          <circle cx="50" cy="50" r="34" stroke="#3253DC" strokeWidth="8" />
          <path
            d="M50 36 C42 36 36 42 36 50 C36 58 42 64 50 64 C58 64 64 58 64 50 C64 42 58 36 50 36 Z"
            stroke="#FFFFFF"
            strokeWidth="6"
          />
          <path
            d="M58 58 L72 74"
            stroke="#3253DC"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M58 58 L70 72"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // --- 7. Cisco Systems / Cisco ---
  if (cleanName.includes("cisco")) {
    return (
      <div
        className={`${sizeClasses[size]} bg-white border border-cyan-200 shadow-xs flex items-center justify-center p-2 shrink-0 group-hover:scale-105 transition-transform overflow-hidden ${className}`}
        title="Cisco Systems"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="#049FD9">
          <rect x="2" y="16" width="1.6" height="6" rx="0.8" />
          <rect x="4.25" y="12" width="1.6" height="10" rx="0.8" />
          <rect x="6.5" y="8" width="1.6" height="14" rx="0.8" />
          <rect x="8.75" y="4" width="1.6" height="18" rx="0.8" />
          <rect x="11" y="2" width="1.6" height="20" rx="0.8" />
          <rect x="13.25" y="4" width="1.6" height="18" rx="0.8" />
          <rect x="15.5" y="8" width="1.6" height="14" rx="0.8" />
          <rect x="17.75" y="12" width="1.6" height="10" rx="0.8" />
          <rect x="20" y="16" width="1.6" height="6" rx="0.8" />
        </svg>
      </div>
    );
  }

  // --- 8. Infosys ---
  if (cleanName.includes("infosys")) {
    return (
      <div
        className={`${sizeClasses[size]} bg-[#007CC3] border border-blue-400 shadow-xs flex items-center justify-center p-2 shrink-0 group-hover:scale-105 transition-transform overflow-hidden ${className}`}
        title="Infosys"
      >
        <div className="w-full h-full flex items-center justify-center text-white font-bold tracking-tight text-center select-none text-[11px] sm:text-xs">
          infosys
        </div>
      </div>
    );
  }

  // --- 9. Wipro ---
  if (cleanName.includes("wipro")) {
    return (
      <div
        className={`${sizeClasses[size]} bg-white border border-slate-200 shadow-xs flex items-center justify-center p-2 shrink-0 group-hover:scale-105 transition-transform overflow-hidden ${className}`}
        title="Wipro"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="30" r="10" fill="#E2211C" />
          <circle cx="68" cy="42" r="10" fill="#F5A800" />
          <circle cx="68" cy="62" r="10" fill="#00A859" />
          <circle cx="50" cy="74" r="10" fill="#0072CE" />
          <circle cx="32" cy="62" r="10" fill="#4B286D" />
          <circle cx="32" cy="42" r="10" fill="#8C1D40" />
        </svg>
      </div>
    );
  }

  // --- 10. Accenture ---
  if (cleanName.includes("accenture")) {
    return (
      <div
        className={`${sizeClasses[size]} bg-white border border-purple-200 shadow-xs flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition-transform overflow-hidden ${className}`}
        title="Accenture"
      >
        <div className="flex items-center justify-center">
          <span className="text-[#A100FF] font-black text-xl leading-none select-none">&gt;</span>
        </div>
      </div>
    );
  }

  // --- 11. Cognizant ---
  if (cleanName.includes("cognizant")) {
    return (
      <div
        className={`${sizeClasses[size]} bg-[#0033A0] border border-blue-800 shadow-xs flex items-center justify-center p-2 shrink-0 group-hover:scale-105 transition-transform overflow-hidden ${className}`}
        title="Cognizant"
      >
        <div className="text-white font-black text-base select-none">C</div>
      </div>
    );
  }

  // --- 12. IBM ---
  if (cleanName.includes("ibm")) {
    return (
      <div
        className={`${sizeClasses[size]} bg-[#1F70C1] border border-blue-400 shadow-xs flex items-center justify-center p-2 shrink-0 group-hover:scale-105 transition-transform overflow-hidden ${className}`}
        title="IBM"
      >
        <div className="text-white font-mono font-black tracking-widest text-xs select-none">IBM</div>
      </div>
    );
  }

  // --- 13. Oracle ---
  if (cleanName.includes("oracle")) {
    return (
      <div
        className={`${sizeClasses[size]} bg-[#C74634] border border-red-400 shadow-xs flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition-transform overflow-hidden ${className}`}
        title="Oracle"
      >
        <div className="w-5 h-3 rounded-full border-2 border-white flex items-center justify-center" />
      </div>
    );
  }

  // --- 14. Apple ---
  if (cleanName.includes("apple")) {
    return (
      <div
        className={`${sizeClasses[size]} bg-slate-900 border border-slate-700 shadow-xs flex items-center justify-center p-2 shrink-0 group-hover:scale-105 transition-transform overflow-hidden ${className}`}
        title="Apple"
      >
        <svg viewBox="0 0 170 170" className="w-full h-full" fill="#FFFFFF">
          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.77-11.72-14.19-6.04-9.35-10.74-19.68-14.1-31-3.36-11.31-5.04-22.18-5.04-32.61 0-14.58 3.73-26.68 11.2-36.31 7.46-9.63 16.9-14.52 28.3-14.67 4.7.11 9.94 1.25 15.73 3.42 5.79 2.18 9.53 3.33 11.22 3.47 1.8.14 5.74-.95 11.83-3.26 6.09-2.31 11.2-3.41 15.34-3.31 10.33.54 18.9 4.13 25.72 10.76 6.81 6.63 11.32 14.9 13.53 24.8-9.46 5.76-14.07 13.8-13.82 24.13.25 8.16 3.42 14.96 9.51 20.4 6.09 5.43 13.41 8.87 21.96 10.33-1.85 5.54-4.14 11.09-6.86 16.65zM119.22 33.09c0-6.74 2.45-13.11 7.36-19.11 4.91-6 10.96-9.87 18.15-11.61.11 1.09.16 2.07.16 2.94 0 6.63-2.58 13.06-7.75 19.28-5.16 6.23-11.29 10.02-18.39 11.38-.1-1.09-.16-2.07-.16-2.88z" />
        </svg>
      </div>
    );
  }

  // --- 15. Meta ---
  if (cleanName.includes("meta") || cleanName.includes("facebook")) {
    return (
      <div
        className={`${sizeClasses[size]} bg-white border border-blue-200 shadow-xs flex items-center justify-center p-2 shrink-0 group-hover:scale-105 transition-transform overflow-hidden ${className}`}
        title="Meta"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="#0668E1">
          <path d="M16.666 4.606C14.747 4.606 13.08 5.61 12 7.085c-1.08-1.475-2.747-2.479-4.666-2.479C3.784 4.606 1 7.39 1 10.822c0 4.145 3.738 7.64 8.79 10.155.673.334 1.464.523 2.21.523.746 0 1.537-.189 2.21-.523 5.052-2.515 8.79-6.01 8.79-10.155 0-3.432-2.784-6.216-6.334-6.216zm-7.666 9.61c-2.316 0-4.2-1.884-4.2-4.2 0-2.316 1.884-4.2 4.2-4.2 1.637 0 3.05.94 3.744 2.315-.65.918-1.503 1.986-2.47 3.018-.466.495-.91.956-1.274 1.067zm6 0c-.364-.111-.808-.572-1.274-1.067-.967-1.032-1.82-2.1-2.47-3.018.694-1.375 2.107-2.315 3.744-2.315 2.316 0 4.2 1.884 4.2 4.2 0 2.316-1.884 4.2-4.2 4.2z" />
        </svg>
      </div>
    );
  }

  // --- 16. Adobe ---
  if (cleanName.includes("adobe")) {
    return (
      <div
        className={`${sizeClasses[size]} bg-[#FA0F00] border border-red-600 shadow-xs flex items-center justify-center p-2 shrink-0 group-hover:scale-105 transition-transform overflow-hidden ${className}`}
        title="Adobe"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="#FFFFFF">
          <polygon points="0,0 38,100 0,100" />
          <polygon points="100,0 62,100 100,100" />
          <polygon points="50,32 72,82 55,82 48,65 35,65" />
        </svg>
      </div>
    );
  }

  // --- 17. Intel ---
  if (cleanName.includes("intel")) {
    return (
      <div
        className={`${sizeClasses[size]} bg-[#0068B5] border border-blue-400 shadow-xs flex items-center justify-center p-2 shrink-0 group-hover:scale-105 transition-transform overflow-hidden ${className}`}
        title="Intel"
      >
        <div className="text-white font-sans font-bold tracking-tight text-xs select-none">intel</div>
      </div>
    );
  }

  // --- 18. Uber ---
  if (cleanName.includes("uber")) {
    return (
      <div
        className={`${sizeClasses[size]} bg-black border border-slate-700 shadow-xs flex items-center justify-center p-2 shrink-0 group-hover:scale-105 transition-transform overflow-hidden ${className}`}
        title="Uber"
      >
        <div className="text-white font-sans font-black tracking-wider text-xs select-none">Uber</div>
      </div>
    );
  }

  // --- 19. Flipkart ---
  if (cleanName.includes("flipkart")) {
    return (
      <div
        className={`${sizeClasses[size]} bg-[#2874F0] border border-blue-400 shadow-xs flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition-transform overflow-hidden ${className}`}
        title="Flipkart"
      >
        <div className="w-full h-full bg-[#FFD200] rounded-md flex items-center justify-center text-[#2874F0] font-black italic text-sm select-none">
          f
        </div>
      </div>
    );
  }

  // --- Default Fallback: Sleek Colorful Brand Tile ---
  // Generate consistent vibrant color based on company name
  const colors = [
    "from-indigo-600 to-violet-600",
    "from-blue-600 to-cyan-600",
    "from-emerald-600 to-teal-600",
    "from-purple-600 to-pink-600",
    "from-rose-600 to-orange-600",
    "from-amber-600 to-yellow-600",
  ];
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const initial = (companyName || "C").trim().slice(0, 2).toUpperCase();

  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-tr ${colors[colorIndex]} text-white font-black flex items-center justify-center shadow-xs border border-white/20 shrink-0 group-hover:scale-105 transition-transform overflow-hidden select-none ${className}`}
      title={companyName}
    >
      <span>{initial}</span>
    </div>
  );
};
