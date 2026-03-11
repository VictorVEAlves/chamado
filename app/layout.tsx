import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Fast PDR Tools | Chamados Internos",
  description: "Sistema interno de chamados da Fast PDR Tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        {children}
        <Toaster
          position="top-right"
          richColors
          theme="dark"
          toastOptions={{
            classNames: {
              toast:
                "border border-border bg-[#141414] text-foreground shadow-glow",
              title: "text-sm font-semibold",
              description: "text-xs text-muted-foreground",
            },
          }}
        />
      </body>
    </html>
  );
}
