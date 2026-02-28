import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Metadata } from "next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "./components/chatSystem/theme-provider";
import "./globals.css";

// Configure Fonts
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter" 
});

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: "--font-jakarta" 
});

export const metadata: Metadata = {
  title: "Nitroberry",
  icons: {
    icon: "/logo.svg", 
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        // Adding this property fixes the mismatch caused by browser extensions 
        // like "cz-shortcut-listen" or Google Translate.
        suppressHydrationWarning={true} 
        className={`${inter.variable} ${jakarta.variable} font-sans antialiased bg-white dark:bg-[#0c0a09] text-[#171717] dark:text-[#ededed] transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {/* Managed Toast Theme to match system */}
          <ToastContainer theme="dark" />
        </ThemeProvider>
      </body>
    </html>
  );
}