"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  LogOut,
  GraduationCap,
} from "lucide-react";
import {
  PlatformState,
  StudentRecord,
  loadPlatformState,
  getActiveStudentId,
  setActiveStudentId,
  syncFromSupabaseCloud,
} from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import StudentPortal from "@/components/StudentPortal";

export default function SiswaRoutePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<PlatformState | null>(null);
  const [activeStudent, setActiveStudent] = useState<StudentRecord | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
  }, []);

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 3200);
    return () => clearTimeout(t);
  }, [toastMsg]);

  const refreshData = useCallback(() => {
    const current = loadPlatformState();
    setState(current);
    const stuId = getActiveStudentId();
    const found = stuId
      ? current.students.find((s) => s.id === stuId) || null
      : null;
    setActiveStudent(found);
  }, []);

  useEffect(() => {
    setMounted(true);
    refreshData();
    syncFromSupabaseCloud();

    const handleSync = () => refreshData();
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
  }, [refreshData]);

  if (!mounted || !state) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-sm font-bold text-indigo-600 animate-pulse">
          Memuat Ruang Refleksi Siswa...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header Portal Siswa */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
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
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                jedadulu<span className="text-indigo-600">.id</span>
              </span>
              <span className="hidden sm:inline-block ml-2.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                Ruang Refleksi Siswa
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {activeStudent ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>
                    {activeStudent.nickname} · Kelas {activeStudent.classLevel}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveStudentId(null);
                    router.push("/masuk");
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold border border-slate-200 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Keluar
                </button>
              </>
            ) : (
              <Link
                href="/masuk"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition"
              >
                Masuk Akun Siswa
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <StudentPortal
          state={state}
          activeStudent={activeStudent}
          onRefresh={refreshData}
          showToast={showToast}
        />
      </main>

      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 max-w-md px-4 py-3 rounded-2xl bg-slate-900 text-white font-semibold text-sm shadow-xl flex items-center gap-2.5"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
