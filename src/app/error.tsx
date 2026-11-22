"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
        <h2 className="text-xl font-extrabold text-slate-900">
          Memuat Ulang Halaman
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Terjadi pembaruan modul di latar belakang ({error?.message || "Sinkronisasi"}). Klik tombol di bawah untuk melanjutkan.
        </p>
        <button
          onClick={() => {
            reset();
            window.location.reload();
          }}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition"
        >
          Muat Ulang Sekarang
        </button>
      </div>
    </div>
  );
}
