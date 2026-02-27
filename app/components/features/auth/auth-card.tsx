import { Logo } from "../../common/logo";

export const AuthCard = ({ children, subtitle }: { children: React.ReactNode, subtitle: string }) => (
  <div className="w-full max-w-105 min-h-[75vh] bg-zinc-900/40 backdrop-blur-2xl border border-zinc-800 rounded-[2.5rem] p-10 flex flex-col justify-center shadow-2xl relative">
    {/* Inner top glow for depth */}
    <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-zinc-700 to-transparent" />
    
    <header className="mb-10 text-center">
      <Logo />
      <p className="mt-4 text-zinc-500 text-xs font-bold uppercase tracking-[0.15em]" style={{ 
    fontSize: '8px', 
    fontFamily: 'cursive' 
  }}>{subtitle}</p>
    </header>
    {children}
  </div>
);