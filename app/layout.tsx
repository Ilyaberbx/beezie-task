import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { DialogScrim } from "@/components/ui/dialog";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Beezie — Claw",
  description:
    "Every pull is a statement piece, every grail secured with Brink's and tokenized on Beezie.",
};

export const viewport: Viewport = {
  themeColor: "#131313",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <Providers>{children}</Providers>
        <DialogScrim />
      </body>
    </html>
  );
}
