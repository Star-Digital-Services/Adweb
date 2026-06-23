import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { siteContent } from "@/config/site-content";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Spicy Content Premium — Secure Content Access",
  description: siteContent.brand.name + " — exclusive content gated behind secure payments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${cormorant.variable} font-sans antialiased bg-zinc-950 text-zinc-100`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
