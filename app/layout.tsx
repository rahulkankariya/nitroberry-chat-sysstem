import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { Metadata } from "next";
export const metadata: Metadata = {
 title: "Nitroberry",
  description: "Secure Centralized Dashboard",
  // This explicitly tells the browser where the icon is
  icons: {
    icon: "/logo.svg", 
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} dark`}>
      {/* Add suppressHydrationWarning={true} here */}
      <body 
        className="bg-[#020202] font-sans antialiased text-zinc-200"
        suppressHydrationWarning={true}
      >
        {children}
        <ToastContainer theme="dark" />
      </body>
    </html>
  );
}