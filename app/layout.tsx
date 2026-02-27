import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Metadata } from "next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { notify } from "@/app/utils/toast";
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
  title: "Nitroberry ",
  icons: {
    icon: "/logo.svg", 
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning is required on <html> when using next-themes
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${inter.variable} ${jakarta.variable} font-sans antialiased bg-white dark:bg-[#0c0a09] transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Main Content */}
          {children}
 <ToastContainer theme="dark" />
          {/* Notifications */}
          {/* <Toaster position="bottom-right" richColors /> */}
        </ThemeProvider>
      </body>
    </html>
  );
}