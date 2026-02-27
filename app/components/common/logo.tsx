"use client";

export const Logo = ({ variant = "header" }: { variant?: "login" | "header" }) => {
  const isHeader = variant === "header";

  return (
    <div 
      className={`flex items-center justify-center transition-all duration-300 
      ${isHeader ? "flex-row gap-2" : "flex-col gap-4 w-full text-center"}`}
    >
      
      {/* Icon Box: Using your DART PRO brand purple */}
      <div className={`
        bg-[#7f56d9] flex items-center justify-center 
        transition-transform duration-500 hover:scale-110
        ${isHeader 
          ? "w-8 h-8 rounded-lg shadow-[0_2px_8px_rgba(127,86,217,0.3)]" 
          : "w-16 h-16 rounded-2xl shadow-[0_0_25px_rgba(127,86,217,0.4)]"
        }
      `}>
        <svg 
          className={`${isHeader ? "w-5 h-5" : "w-10 h-10"} text-white`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2.5" 
            d="M13 10V3L4 14h7v7l9-11h-7z" 
          />
        </svg>
      </div>

      {/* Text: Managed by next-theme variables */}
      <div className="flex flex-col items-start">
        <h1 className={`
          font-black tracking-tighter uppercase leading-none transition-colors duration-300
          text-app-text  /* This uses your theme-aware variable */
          ${isHeader ? "text-lg" : "text-3xl"}
        `}>
          Nitroberry
        </h1>
        
        {!isHeader && (
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-app-accent mt-1">
            System Interface
          </span>
        )}
      </div>
    </div>
  );
};