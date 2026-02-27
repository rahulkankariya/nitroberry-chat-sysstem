export const Loader = ({ message = "Loading..." }: { message?: string }) => {
  return (
    /* fixed inset-0 centers the div across the entire screen */
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 z-50 bg-[#020202]/10 backdrop-blur-sm">
      
      {/* Increased from w-12 h-12 to w-20 h-20 */}
      <div className="relative w-50 h-50">
        <div className="absolute inset-0 border-4 border-[#7f56d9]/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-[#7f56d9] rounded-full border-t-transparent animate-spin"></div>
      </div>
      
      {/* Your 8px branding style */}
      <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] animate-pulse" 
         style={{ fontSize: '8px', fontFamily: 'var(--font-jakarta)' }}>
        {message}
      </p>
    </div>
  );
};