"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Lock,
  UserCheck,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  registerOrLoginStudent,
  authenticateStaff,
} from "@/lib/store";

type LoginType = "siswa" | "staf";

export default function MasukPage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<LoginType>("siswa");

  // Form Siswa
  const [nick, setNick] = useState("");
  const [cls, setCls] = useState<"X" | "XI" | "XII" | "">("");
  const [code, setCode] = useState("");
  const [agree, setAgree] = useState(false);

  // Form Staf (Guru BK / Admin — terdeteksi otomatis berdasarkan role akun)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg("");
    if (!cls) {
      setErrMsg("Silakan pilih jenjang kelas (X, XI, atau XII).");
      return;
    }
    setLoading(true);
    const res = await registerOrLoginStudent(nick, cls, code, agree);
    setLoading(false);
    if (!res.ok) {
      setErrMsg(res.error || "Gagal masuk ke ruang siswa.");
      return;
    }
    router.push("/siswa");
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg("");
    setLoading(true);
    const res = await authenticateStaff(email, password);
    setLoading(false);
    if (!res.ok || !res.staff) {
      setErrMsg(res.error || "Email atau kata sandi tidak valid.");
      return;
    }
    if (res.staff.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/guru-bk");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Panel Visual Kiri */}
      <div className="lg:w-5/12 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-200 hover:text-white transition mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 stroke-sky-300"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              >
                <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                jedadulu<span className="text-sky-400">.id</span>
              </span>
              <p className="text-xs text-indigo-200">
                Layanan Bimbingan & Konseling SMA/MA
              </p>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-4">
            Ruang Aman untuk Berjeda & Memutuskan dengan Sadar.
          </h1>
          <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed">
            Bantu dirimu mengenali dorongan mengikuti tren media sosial (FOMO) melalui refleksi terstruktur, jurnal pribadi, dan layanan konsultasi langsung bersama Guru BK sekolahmu.
          </p>
        </div>

        <div className="relative z-10 mt-12 space-y-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-2 text-xs text-indigo-100">
            <div className="flex items-center gap-2 font-bold text-sky-300">
              <ShieldCheck className="w-4 h-4" />
              Jaminan Kerahasiaan & Etika BK
            </div>
            <p className="leading-relaxed text-indigo-100/80">
              Platform ini mematuhi standar etika konselor sekolah (ASCA, 2022) dan prinsip perlindungan data pendidikan (UNESCO, 2023). Tidak ada skor pelabelan dan tidak ada diagnosis psikologis otomatis.
            </p>
          </div>
          <p className="text-[11px] text-indigo-300/70">
            © 2026 jedadulu.id · Program Studi Bimbingan dan Konseling Pendidikan Islam, UIN Raden Intan Lampung.
          </p>
        </div>
      </div>

      {/* Panel Formulir Kanan */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Masuk ke Layanan
            </h2>
            <p className="text-sm text-slate-500">
              Pilih peranmu untuk melanjutkan ke ruang layanan yang sesuai.
            </p>
          </div>

          {/* Tab Pemilih Siswa vs Konselor/Staf */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-200/80 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setLoginType("siswa");
                setErrMsg("");
              }}
              className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                loginType === "siswa"
                  ? "bg-white text-indigo-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Siswa SMA/MA
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType("staf");
                setErrMsg("");
              }}
              className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
                loginType === "staf"
                  ? "bg-white text-indigo-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              Guru BK / Pengelola
            </button>
          </div>

          {errMsg && (
            <div
              role="alert"
              className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errMsg}</span>
            </div>
          )}

          {loginType === "siswa" ? (
            <form
              onSubmit={handleStudentSubmit}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Nama Panggilan atau Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={nick}
                  onChange={(e) => setNick(e.target.value)}
                  placeholder="Masukkan namamu"
                  maxLength={40}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Kelas
                  </label>
                  <select
                    required
                    value={cls}
                    onChange={(e) =>
                      setCls(e.target.value as "X" | "XI" | "XII" | "")
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  >
                    <option value="">Pilih Kelas</option>
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Kode Sekolah
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Dari Guru BK"
                    maxLength={15}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm uppercase font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  />
                </div>
              </div>

              {/* Informasi Persetujuan (Informed Consent) */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-slate-600 space-y-1.5 leading-relaxed">
                <p className="font-bold text-indigo-950">
                  Ketentuan Privasi & Persetujuan Layanan:
                </p>
                <p>
                  Hasil refleksi dan pesan konsultasi hanya dapat diakses oleh Guru BK yang berwenang di sekolahmu. Isi jurnal pribadimu sepenuhnya terkunci kecuali kamu memilih untuk membagikannya.
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-indigo-600"
                />
                <span className="text-xs text-slate-700 font-medium leading-relaxed">
                  Saya telah memahami ketentuan privasi di atas dan setuju menggunakan layanan ini secara sadar.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-600/15 transition flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                {loading ? "Memproses..." : "Masuk Ruang Refleksi"}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleStaffSubmit}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Email Resmi Konselor / Pengelola
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@sekolah.sch.id"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-indigo-950 hover:bg-indigo-900 disabled:opacity-50 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                {loading ? "Memverifikasi..." : "Masuk Dashboard"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
