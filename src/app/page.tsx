"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  GitBranch,
  BookOpen,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  HeartHandshake,
  Brain,
  Scale,
  Compass,
  Lock,
} from "lucide-react";
import {
  DEFAULT_LANDING_CONFIG,
  LandingPageConfig,
  loadPlatformState,
  syncFromSupabaseCloud,
} from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function LandingPage() {
  const [cfg, setCfg] = useState<LandingPageConfig>(DEFAULT_LANDING_CONFIG);

  const refreshConfig = useCallback(() => {
    const state = loadPlatformState();
    if (state.landingConfig) {
      setCfg(state.landingConfig);
    }
  }, []);

  useEffect(() => {
    refreshConfig();
    syncFromSupabaseCloud();

    const handleSync = () => refreshConfig();
    window.addEventListener("jedadulu-sync", handleSync);
    window.addEventListener("storage", handleSync);

    let channel: ReturnType<NonNullable<typeof supabase>["channel"]> | null =
      null;
    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel("jedadulu-realtime")
        .on("broadcast", { event: "state_updated" }, () => {
          syncFromSupabaseCloud();
        })
        .subscribe();
    }

    return () => {
      window.removeEventListener("jedadulu-sync", handleSync);
      window.removeEventListener("storage", handleSync);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [refreshConfig]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Navbar Utama */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/20">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 stroke-white"
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
              >
                <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                jedadulu<span className="text-indigo-600">.id</span>
              </span>
              <span className="hidden md:inline-block ml-2.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                Layanan Bimbingan & Konseling
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#fitur" className="hover:text-indigo-600 transition">
              Fitur Layanan
            </a>
            <a href="#alur" className="hover:text-indigo-600 transition">
              Alur Decision Tree
            </a>
            <a href="#landasan" className="hover:text-indigo-600 transition">
              Landasan BK
            </a>
            <a href="#etika" className="hover:text-indigo-600 transition">
              Etika & Privasi
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/masuk"
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition"
            >
              Masuk
            </Link>
            <Link
              href="/siswa"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm shadow-indigo-600/20 transition flex items-center gap-2"
            >
              <span>Mulai Refleksi</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section (Dinamis dari Pengaturan Admin) */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-gradient-to-b from-white via-indigo-50/40 to-slate-50 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              {cfg.badgeText}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              {cfg.heroTitleMain}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-600">
                {cfg.heroTitleHighlight}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              {cfg.heroDescription}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/siswa"
                className="px-7 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-600/20 transition flex items-center gap-2.5"
              >
                <span>{cfg.ctaPrimaryText}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/masuk"
                className="px-6 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm sm:text-base border border-slate-300 shadow-sm transition"
              >
                {cfg.ctaSecondaryText}
              </Link>
            </div>

            <div className="pt-4 grid grid-cols-3 gap-4 max-w-lg border-t border-slate-200/80 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tanpa Skor & Label</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Non-Diagnostik</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Privasi Terlindungi</span>
              </div>
            </div>
          </div>

          {/* Kartu Visual Preview Alur */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                    Alur Refleksi Terpandu
                  </span>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Bagaimana Kamu Mengambil Keputusan?
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  4 Langkah
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    step: "P1",
                    title: "Kenali Sumber Dorongan",
                    desc: "Memilah keinginan dari minat sendiri (otonomi) vs dorongan agar diterima kelompok.",
                  },
                  {
                    step: "P2",
                    title: "Amati Perasaan Saat Tidak Ikut",
                    desc: "Mengidentifikasi apakah muncul rasa cemas berlebihan karena takut tertinggal.",
                  },
                  {
                    step: "P3",
                    title: "Timbang Waktu, Biaya, & Prioritas",
                    desc: "Mengecek kesiapan uang saku dan jadwal kegiatan utama secara rasional.",
                  },
                  {
                    step: "P4",
                    title: "Uji Pikiran Otomatis",
                    desc: "Mengevaluasi dampak jangka panjang lewat restrukturisasi kognitif & muhasabah.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70"
                  >
                    <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-indigo-950 text-white flex items-center justify-between gap-4">
                <div className="text-xs">
                  <span className="font-bold text-sky-300 block">
                    Tersambung dengan Guru BK
                  </span>
                  <span className="text-indigo-100">
                    Dilengkapi Jurnal Refleksi & Live Chat Konseling
                  </span>
                </div>
                <Link
                  href="/siswa"
                  className="px-4 py-2 rounded-xl bg-white text-indigo-950 font-bold text-xs shrink-0 hover:bg-indigo-50 transition"
                >
                  Mulai →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Fitur Utama Layanan (Dinamis dari Pengaturan Admin) */}
      <section
        id="fitur"
        className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
      >
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
            Fitur Utama Layanan BK
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {cfg.featureSectionTitle}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            {cfg.featureSectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <GitBranch className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {cfg.feature1Title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {cfg.feature1Desc}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {cfg.feature2Title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {cfg.feature2Desc}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {cfg.feature3Title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {cfg.feature3Desc}
            </p>
          </div>
        </div>
      </section>

      {/* 3 Hasil Rekomendasi Decision Tree */}
      <section id="alur" className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Keluaran Non-Diagnostik
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Tiga Muara Refleksi Tanpa Pelabelan
            </h2>
            <p className="text-sm text-slate-600">
              Setiap rekomendasi dilengkapi langkah kecil yang praktis serta pengingat muhasabah (introspeksi diri) dan qana&apos;ah (merasa cukup).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl p-6 bg-emerald-50/70 border border-emerald-200 space-y-2">
              <span className="inline-block text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-600 text-white">
                Hasil A
              </span>
              <h3 className="text-lg font-extrabold text-emerald-950">
                Lanjutkan Keputusan secara Sadar
              </h3>
              <p className="text-xs sm:text-sm text-emerald-900/80 leading-relaxed">
                Diberikan ketika keinginanmu selaras dengan minat dan prioritas pribadi, serta masih terjangkau dari segi waktu maupun biaya.
              </p>
            </div>

            <div className="rounded-3xl p-6 bg-amber-50/70 border border-amber-200 space-y-2">
              <span className="inline-block text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-600 text-white">
                Hasil B
              </span>
              <h3 className="text-lg font-extrabold text-amber-950">
                Tunda atau Sesuaikan Keputusan
              </h3>
              <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed">
                Mengarahkanmu untuk menunda sejenak (misalnya 24 jam) atau menyesuaikan rencana saat waktu dan biaya belum sepenuhnya mendukung.
              </p>
            </div>

            <div className="rounded-3xl p-6 bg-rose-50/70 border border-rose-200 space-y-2">
              <span className="inline-block text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-rose-600 text-white">
                Hasil C
              </span>
              <h3 className="text-lg font-extrabold text-rose-950">
                Ambil Jeda untuk Refleksi
              </h3>
              <p className="text-xs sm:text-sm text-rose-900/80 leading-relaxed">
                Mengajakmu berhenti sejenak, menarik napas, dan menulis jurnal saat dorongan ikut tren lebih dipicu oleh rasa takut tertinggal atau takut dinilai orang lain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Landasan Teori BK & Etika */}
      <section
        id="landasan"
        className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Basis Ilmiah Bimbingan & Konseling
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Berpijak pada Kajian Teori & Etika Konselor
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Setiap pertanyaan dan fitur di dalam <b>jedadulu.id</b> dirancang berdasarkan sintesis literatur Bimbingan dan Konseling mutakhir serta nilai BK Pendidikan Islam.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <Compass className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Teori Determinasi Diri
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Membantu siswa memisahkan motivasi otonom (minat & nilai pribadi) dari kebutuhan keterhubungan sosial yang maladaptif di media sosial (Ajra et al., 2025).
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <Scale className="w-5 h-5 text-sky-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Teori Perbandingan Sosial
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mendasari jurnal <i>&ldquo;My Life, Their Highlight&rdquo;</i> untuk meredam dampak perbandingan ke atas (upward social comparison) pada remaja (Septianto et al., 2025).
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <Brain className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Restrukturisasi Kognitif & Regulasi Diri
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Menguji pikiran otomatis <i>&ldquo;kalau tidak ikut, aku ketinggalan&rdquo;</i> serta melatih jeda sebelum bertindak (Taufiqurrohman & Muwakhidah, 2025; Armilyana et al., 2025).
              </p>
            </div>

            <div
              id="etika"
              className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2"
            >
              <Lock className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Minimisasi Data & Batas Otomatisasi
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mengikuti standar etika ASCA (2022) dan UNESCO (2023): tidak meminta data sensitif yang tidak perlu, bukan alat diagnosis, dan keputusan layanan tetap dipegang Guru BK.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Resmi (Dinamis dari Pengaturan Admin) */}
      <footer className="mt-auto bg-slate-900 text-slate-300 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-800">
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 stroke-white"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  fill="none"
                >
                  <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
                </svg>
              </div>
              <span className="text-lg font-extrabold text-white">
                jedadulu<span className="text-sky-400">.id</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Website Layanan Bimbingan dan Konseling Interaktif Berbasis Decision Tree &ldquo;{cfg.heroTitleMain} {cfg.heroTitleHighlight}&rdquo; untuk Membantu Siswa SMA/MA Mengambil Keputusan Sadar di Media Sosial.
            </p>
          </div>

          <div className="md:col-span-3 space-y-2 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider">
              Navigasi Layanan
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <Link href="/siswa" className="hover:text-white transition">
                  Ruang Refleksi Siswa
                </Link>
              </li>
              <li>
                <Link href="/masuk" className="hover:text-white transition">
                  Portal Masuk Layanan
                </Link>
              </li>
              <li>
                <Link href="/guru-bk" className="hover:text-white transition">
                  Ruang Konselor (Guru BK)
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition">
                  Administrasi Sistem
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-2 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider">
              Informasi Akademik
            </h4>
            <p className="text-slate-400 leading-relaxed">
              {cfg.universityName}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            Disusun oleh <b className="text-slate-300">{cfg.authorName}</b> (NPM:{" "}
            {cfg.authorNpm}) · Dosen Pengampu:{" "}
            <b className="text-slate-300">{cfg.lecturerName}</b>
          </p>
          <p className="flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-indigo-400" />
            <span>Media Refleksi Pendukung Layanan BK · Bukan Pengganti Konselor</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
