"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import {
  PlatformState,
  StaffAccount,
  loadPlatformState,
  getActiveStaffSession,
  syncFromSupabaseCloud,
} from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import AdminDashboard from "@/components/AdminDashboard";

export default function AdminRoutePage() {
  const [state, setState] = useState<PlatformState>(() => loadPlatformState());
  const [activeStaff, setActiveStaff] = useState<StaffAccount | null>(null);
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
    setState(loadPlatformState());
    setActiveStaff(getActiveStaffSession());
  }, []);

  useEffect(() => {
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 stroke-indigo-400"
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
              <span className="ml-2.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Administrasi Sistem BK
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Beranda Utama
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AdminDashboard
          state={state}
          activeStaff={activeStaff}
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
