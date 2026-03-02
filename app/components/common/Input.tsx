import React from "react";

// 1. Update the interface to include 'suffix'
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: React.ReactNode; // Add this line
}

export const Input = ({ 
  label, 
  error, 
  suffix, 
  className = "", 
  ...props 
}: InputProps) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-medium text-zinc-400 ml-1 uppercase tracking-wider">
          {label}
        </label>
      )}
      
      <div className="relative flex items-center">
        <input
          {...props}
          className={`
            w-full bg-zinc-950/50 border border-zinc-800 
            text-white placeholder:text-zinc-600 
            p-3.5 rounded-2xl text-sm transition-all
            focus:outline-none focus:ring-2 focus:ring-[rgb(var(--app-accent))]/20 focus:border-[rgb(var(--app-accent))]
            ${error ? "border-red-500/50" : ""}
            ${suffix ? "pr-12" : "pr-4"} 
            ${className}
          `}
        />
        
        {/* 2. Render the suffix inside the input area */}
        {suffix && (
          <div className="absolute right-4 flex items-center justify-center">
            {suffix}
          </div>
        )}
      </div>

      {error && (
        <p className="text-[10px] text-red-500 font-medium ml-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};