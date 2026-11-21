"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Database,
  CheckCircle2,
  BookOpenCheck,
} from "lucide-react";
import {
  PlatformState,
  StudentRecord,
  StaffAccount,
  loadPlatformState,
  getActiveStudentId,
  getActiveStaffSession,
} from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase";
import StudentPortal from "@/components/StudentPortal";
import CounselorDashboard from "@/components/CounselorDashboard";
import AdminDashboard from "@/components/AdminDashboard";

type RoleWorkspace = "siswa" | "guru_bk" | "admin";

export default function HomePage() {
  const [roleView, setRoleView] = useState<RoleWorkspace>("siswa");
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<PlatformState | null>(null);
  const [activeStudent, setActiveStudent] = useState<StudentRecord | null>(null);
  const [activeStaff, setActiveStaff] = useState<StaffAccount | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
  }, []);

  useEffect(() => {
    if (!toastMsg) return;
    const timer = setTimeout(() => setToastMsg(null), 3200);
    return () => clearTimeout(timer);
  }, [toastMsg]);

  const refreshData = useCallback(() => {
    const current = loadPlatformState();
    setState(current);
    const stuId = getActiveStudentId();
    const foundStu = stuId
      ? current.students.find((s) => s.id === stuId) || null
      : null;
    setActiveStudent(foundStu);
    setActiveStaff(getActiveStaffSession());
  }, []);

  useEffect(() => {
    setMounted(true);
    refreshData();
    const handleSync = () => refreshData();
    window.addEventListener("jedadulu-sync", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("jedadulu-sync", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [refreshData]);

  if (!mounted || !state) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-sky-400 font-bold text-sm animate-pulse">
          <div className="w-8 h-8 rounded-xl bg-brand-950 border border-sky-500/40 flex items-center justify-center">
            ✦
          </div>
          Memuat Platform Layanan BK jedadulu.id...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100">
      {/* Top Navbar Profesional */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-brand-950 border border-sky-500/40 shadow-lg shadow-sky-500/10 flex items-center justify-center shrink-0">
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 stroke-sky-400"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              >
                <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                  jedadulu<span className="text-sky-400">.id</span>
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300">
                  <BookOpenCheck className="w-3 h-3" />
                  Teknologi BK
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                FOMO atau Emang Aku Mau? · Decision Tree & Live Konseling SMA/MA
              </p>
            </div>
          </div>

          {/* Switcher 3 Portal Utama: Siswa | Guru BK | Admin */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setRoleView("siswa")}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                roleView === "siswa"
                  ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/70"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Portal Siswa</span>
            </button>

            <button
              onClick={() => setRoleView("guru_bk")}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                roleView === "guru_bk"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/70"
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Dashboard Guru BK</span>
            </button>

            <button
              onClick={() => setRoleView("admin")}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                roleView === "admin"
                  ? "bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/70"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Dashboard Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sub-bar Status Database & Info Cepat */}
      <div className="bg-slate-950/60 border-b border-slate-900 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span>
              Status Database:{" "}
              {isSupabaseConfigured ? (
                <b className="text-emerald-400">
                  Supabase PostgreSQL + Realtime Connected
                </b>
              ) : (
                <b className="text-sky-300">
                  Mode Hybrid (LocalStorage + Siap Sambung Supabase Cloud)
                </b>
              )}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span>
              Kode Sekolah Demo: <b className="text-sky-300">JEDA-01</b>
            </span>
            <span>·</span>
            <span>
              Guru BK:{" "}
              <b className="text-emerald-300">
                guru@sekolah-contoh.sch.id / bk12345
              </b>
            </span>
            <span>·</span>
            <span>
              Admin:{" "}
              <b className="text-purple-300">
                admin@sekolah-contoh.sch.id / admin12345
              </b>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area (Full Width Web Layout, Tanpa Frame HP Sempit) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {roleView === "siswa" && (
          <StudentPortal
            state={state}
            activeStudent={activeStudent}
            onRefresh={refreshData}
            showToast={showToast}
          />
        )}

        {roleView === "guru_bk" && (
          <CounselorDashboard
            state={state}
            activeStaff={activeStaff}
            onRefresh={refreshData}
            showToast={showToast}
          />
        )}

        {roleView === "admin" && (
          <AdminDashboard
            state={state}
            activeStaff={activeStaff}
            onRefresh={refreshData}
            showToast={showToast}
          />
        )}
      </main>

      {/* Footer Akademik & Etika BK */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-400 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-bold text-slate-200">
              jedadulu.id · &ldquo;FOMO atau Emang Aku Mau?&rdquo; — Website Layanan BK Interaktif Berbasis Decision Tree
            </p>
            <p>
              Disusun oleh <b className="text-sky-300">Larasati Adi Ningrum</b> (NPM: 2411080031 · Kelas B/V) · Dosen Pengampu:{" "}
              <b className="text-slate-200">Mega Aria Monica, M.Pd</b>
            </p>
            <p className="text-slate-500">
              Program Studi Bimbingan dan Konseling Pendidikan Islam · Fakultas Tarbiyah dan Keguruan · UIN Raden Intan Lampung (2026)
            </p>
          </div>
          <div className="sm:text-right space-y-1 max-w-xs">
            <span className="inline-block px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-semibold">
              Bukan Diagnosis & Bukan Pengganti Konselor
            </span>
            <p className="text-[11px] text-slate-500">
              Berpedoman pada Standar Etika ASCA (2022) & UNESCO (2023).
            </p>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 max-w-md px-4 py-3 rounded-2xl bg-sky-500 text-slate-950 font-bold text-sm shadow-2xl shadow-sky-500/30 flex items-center gap-2.5 animate-bounce"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
