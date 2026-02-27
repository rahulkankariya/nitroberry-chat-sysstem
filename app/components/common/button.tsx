export const Button = ({ children, isLoading, ...props }: any) => (
  <button 
    {...props}
    disabled={isLoading}
    className="w-full bg-[#7f56d9] hover:bg-[#6b46c1] text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] shadow-[0_10px_20px_rgba(127,86,217,0.2)] disabled:opacity-50"
  >
    {isLoading ? "Signing in..." : children}
  </button>
);