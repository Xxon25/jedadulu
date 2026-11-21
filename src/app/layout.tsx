import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "jedadulu.id · FOMO atau Emang Aku Mau? — Layanan BK Interaktif",
  description:
    "Website Layanan Bimbingan dan Konseling Interaktif Berbasis Decision Tree untuk Membantu Siswa SMA/MA Mengambil Keputusan Sadar di Media Sosial. Disusun oleh Larasati Adi Ningrum (UIN Raden Intan Lampung).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body
        className={`${plusJakarta.variable} font-sans antialiased min-h-screen flex flex-col selection:bg-sky-500 selection:text-slate-950`}
      >
        {children}
      </body>
    </html>
  );
}
