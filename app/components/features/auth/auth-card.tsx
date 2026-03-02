import { Logo } from "../../common/logo";

export const AuthCard = ({ children, subtitle }: { children: React.ReactNode, subtitle: string }) => (
  <div className="w-full max-w-105 min-h-[75vh] bg-zinc-900/40 backdrop-blur-2xl border border-zinc-800 rounded-[2.5rem] p-10 flex flex-col justify-center shadow-2xl relative">
    {/* Inner top glow for depth */}
    <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-zinc-700 to-transparent" />
    
    <header className="mb-10 text-center flex flex-col items-center">
      <Logo />
      
      {/* NITROBERRY Wordmark */}
      <h1 className="mt-3 text-white text-xl font-black tracking-[0.2em] ml-[0.3em]">
        NITROBERRY
      </h1>

      <p className="mt-2 text-zinc-500 text-xs font-bold uppercase tracking-[0.15em]" style={{ 
        fontSize: '8px', 
        fontFamily: 'cursive' 
      }}>
        {subtitle}
      </p>
    </header>
    
    {children}
  </div>
);