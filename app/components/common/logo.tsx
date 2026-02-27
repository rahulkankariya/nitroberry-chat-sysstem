export const Logo = ({ variant = "header" }: { variant?: "login" | "header" }) => {
  const isHeader = variant === "header";

  return (
    /* Added justify-center for horizontal centering and w-full to ensure it takes up space */
    <div className={`flex items-center justify-center ${isHeader ? "flex-row gap-2" : "flex-col gap-3 w-full text-center"}`}>
      
      {/* Icon Box */}
      <div className={`
        bg-[#7f56d9] rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(127,86,217,0.3)]
        ${isHeader ? "w-8 h-8" : "w-14 h-14 shadow-[0_0_20px_rgba(127,86,217,0.4)] rounded-2xl"}
      `}>
        <svg className={`${isHeader ? "w-5 h-5" : "w-8 h-8"} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      {/* Text */}
      <h1 className={`
        font-black tracking-tighter uppercase leading-none
        ${isHeader ? "text-lg text-white" : "text-2xl text-white"}
      `}>
        Nitroberry
      </h1>
    </div>
  );
};