import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./themeProvider";
import { ModeToggle } from "@/components/ModeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Formify",
  description: '🚀 Formify – Smart Forms, Seamless Flow.',
  icons: {
    icon: [
      { url: '/assets/icons/icon.svg' },
      { url: '/assets/icons/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/assets/icons/icon.png' },
    ],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
          <ModeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
