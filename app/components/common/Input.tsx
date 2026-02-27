interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = ({ label, error, ...props }: InputProps) => (
  <div className="flex flex-col gap-1.5 w-full font-sans">
    <label className="text-xs font-bold text-zinc-400 uppercase ml-1 tracking-wider">
      {label}
    </label>
    <input 
      {...props} 
      className={`
        w-full bg-zinc-950/50 border rounded-xl p-3.5 text-zinc-100 transition-all
        ${error ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-zinc-800 focus:border-[#7f56d9]'}
      `} 
    />
    {error && (
      <span className="text-[10px] text-red-400 font-medium ml-1 mt-1 animate-pulse">
        {error}
      </span>
    )}
  </div>
);