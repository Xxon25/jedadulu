import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "jedadulu.id — FOMO atau Emang Aku Mau? · Layanan BK Digital SMA/MA",
  description:
    "Platform Layanan Bimbingan dan Konseling Interaktif Berbasis Decision Tree untuk Membantu Siswa SMA/MA Mengambil Keputusan Sadar di Media Sosial.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body
        className={`${plusJakarta.variable} font-sans antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
