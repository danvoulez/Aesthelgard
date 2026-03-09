import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css"; // Global styles
import { NarrativeProvider } from "@/lib/narrative-context";
import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import canonData from "@/config/canon.json";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: canonData.meta.title,
  description: canonData.meta.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100" suppressHydrationWarning>
        <ThemeProvider>
          <NarrativeProvider>
            <div className="flex h-[100dvh] w-full overflow-hidden">
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto pb-[calc(72px+env(safe-area-inset-bottom))] md:pb-0 relative">
                {children}
              </div>
            </div>
          </NarrativeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
