"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  BarChart3,
  UserCog,
  FileEdit,
  Plus,
  Trash2,
  LogOut,
  CheckCircle2,
  RotateCcw,
  Users,
  LayoutTemplate,
  GraduationCap,
  HeartHandshake,
  Save,
  Eye,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import {
  PlatformState,
  StaffAccount,
  StudentRecord,
  LandingPageConfig,
  DEFAULT_LANDING_CONFIG,
  authenticateStaff,
  setActiveStaffSession,
  savePlatformState,
  resetDemoState,
  getActiveStudentId,
  setActiveStudentId,
} from "@/lib/store";
import {
  DEFAULT_QUESTIONS,
  DEFAULT_SITUATIONS,
  DECISION_OUTCOMES,
} from "@/lib/bk-data";
import StudentPortal from "@/components/StudentPortal";
import CounselorDashboard from "@/components/CounselorDashboard";

interface AdminDashboardProps {
  state: PlatformState;
  activeStaff: StaffAccount | null;
  onRefresh: () => void;
  showToast: (msg: string) => void;
}

type AdminTab =
  | "analitik"
  | "landing"
  | "view_guru"
  | "view_siswa"
  | "guru"
  | "siswa"
  | "konten";

export default function AdminDashboard({
  state,
  activeStaff,
  onRefresh,
  showToast,
}: AdminDashboardProps) {
  const [tab, setTab] = useState<AdminTab>("analitik");

  // Login Admin
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");

  // Form Edit Tampilan Depan (Landing Page CMS)
  const [landingForm, setLandingForm] = useState<LandingPageConfig>(
    state.landingConfig || DEFAULT_LANDING_CONFIG
  );

  // Form Tambah Guru BK
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newNip, setNewNip] = useState("");
  const [newSchool, setNewSchool] = useState("SMA Negeri 1 Contoh");

  // Form Tambah Situasi Baru
  const [newSituation, setNewSituation] = useState("");

  // Inspect Detail Siswa (Full Access Admin: Jurnal + Chat + Hasil)
  const [inspectedStudent, setInspectedStudent] =
    useState<StudentRecord | null>(null);

  // Pilih Siswa saat Admin membuka "Dashboard Siswa"
  const [previewStudentId, setPreviewStudentId] = useState<string>(
    getActiveStudentId() || state.students[0]?.id || ""
  );

  useEffect(() => {
    if (state.landingConfig) {
      setLandingForm(state.landingConfig);
    }
  }, [state.landingConfig]);

  const isAdminLoggedIn = activeStaff && activeStaff.role === "admin";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr("");
    const res = await authenticateStaff(email, password);
    if (!res.ok) {
      setLoginErr(res.error || "Gagal masuk.");
      return;
    }
    if (res.staff?.role !== "admin") {
      setLoginErr("Akun ini tidak memiliki hak akses Administrator.");
      return;
    }
    onRefresh();
    showToast(`Selamat datang di Panel Super Admin, ${res.staff.fullName}`);
  };

  const handleLogout = () => {
    setActiveStaffSession(null);
    onRefresh();
    showToast("Telah keluar dari Administrasi Sistem.");
  };

  const handleSaveLandingConfig = (e: React.FormEvent) => {
    e.preventDefault();
    state.landingConfig = { ...landingForm };
    savePlatformState(state);
    onRefresh();
    showToast(
      "Tampilan Halaman Depan (Landing Page) berhasil diperbarui & disimpan ke Cloud!"
    );
  };

  const handleResetLandingConfig = () => {
    setLandingForm(DEFAULT_LANDING_CONFIG);
    state.landingConfig = { ...DEFAULT_LANDING_CONFIG };
    savePlatformState(state);
    onRefresh();
    showToast("Tampilan Depan dikembalikan ke teks default proposal.");
  };

  const handleAddCounselor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPw.trim()) {
      showToast("Nama, Email, dan Kata Sandi Guru BK wajib diisi.");
      return;
    }
    if (
      state.staffUsers.some(
        (u) => u.email.toLowerCase() === newEmail.trim().toLowerCase()
      )
    ) {
      showToast("Email tersebut sudah terdaftar.");
      return;
    }

    state.staffUsers.push({
      id: `st-${Date.now()}`,
      email: newEmail.trim().toLowerCase(),
      password: newPw.trim(),
      fullName: newName.trim(),
      role: "guru_bk",
      nip: newNip.trim() || "-",
      schoolName: newSchool.trim() || "SMA Negeri 1 Contoh",
      isActive: true,
    });
    savePlatformState(state);
    setNewName("");
    setNewEmail("");
    setNewPw("");
    setNewNip("");
    onRefresh();
    showToast("Akun Guru BK baru berhasil ditambahkan.");
  };

  const handleToggleStaffStatus = (id: string) => {
    const idx = state.staffUsers.findIndex((u) => u.id === id);
    if (idx === -1) return;
    if (state.staffUsers[idx].role === "admin") {
      showToast("Akun Administrator utama tidak dapat dinonaktifkan.");
      return;
    }
    state.staffUsers[idx].isActive = !state.staffUsers[idx].isActive;
    savePlatformState(state);
    onRefresh();
    showToast(`Status akun ${state.staffUsers[idx].fullName} diperbarui.`);
  };

  const handleDeleteStudent = (studentId: string, nick: string) => {
    state.students = state.students.filter((s) => s.id !== studentId);
    state.consultations = state.consultations.filter(
      (c) => c.studentId !== studentId
    );
    state.chatMessages = state.chatMessages.filter(
      (m) => m.studentId !== studentId
    );
    if (inspectedStudent?.id === studentId) setInspectedStudent(null);
    savePlatformState(state);
    onRefresh();
    showToast(`Data siswa ${nick} telah dihapus dari sistem.`);
  };

  const handleAddSituation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSituation.trim()) return;
    state.customSituations.push(newSituation.trim());
    savePlatformState(state);
    setNewSituation("");
    onRefresh();
    showToast("Skenario situasi baru ditambahkan ke Decision Tree.");
  };

  const handleUpdateQuestionText = (
    qIndex: number,
    newQuestionText: string
  ) => {
    state.customQuestions[qIndex].question = newQuestionText;
    savePlatformState(state);
    onRefresh();
  };

  const handleUpdateQuestionOption = (
    qIndex: number,
    optIndex: number,
    newOptText: string
  ) => {
    state.customQuestions[qIndex].options[optIndex] = newOptText;
    savePlatformState(state);
    onRefresh();
  };

  const handleResetDefaultContent = () => {
    state.customSituations = [...DEFAULT_SITUATIONS];
    state.customQuestions = JSON.parse(JSON.stringify(DEFAULT_QUESTIONS));
    savePlatformState(state);
    onRefresh();
    showToast("Konten Decision Tree dikembalikan ke pengaturan awal.");
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-8 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            Super Admin · Full Access Control
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Masuk Dashboard Admin
          </h2>
          <p className="text-sm text-slate-500">
            Akses penuh untuk mengedit tampilan halaman depan, melihat & mengoperasikan Dashboard Guru BK, Dashboard Siswa, serta seluruh basis data.
          </p>
        </div>

        {loginErr && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {loginErr}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Email Administrator
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sekolah-contoh.sch.id"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-indigo-600"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-indigo-600"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition shadow-sm"
          >
            Masuk Super Admin
          </button>
        </form>
      </div>
    );
  }

  const countA = state.students.filter((s) => s.resultCode === "A").length;
  const countB = state.students.filter((s) => s.resultCode === "B").length;
  const countC = state.students.filter((s) => s.resultCode === "C").length;
  const countClassX = state.students.filter((s) => s.classLevel === "X").length;
  const countClassXI = state.students.filter(
    (s) => s.classLevel === "XI"
  ).length;
  const countClassXII = state.students.filter(
    (s) => s.classLevel === "XII"
  ).length;

  const activePreviewStudent =
    state.students.find((s) => s.id === previewStudentId) ||
    state.students[0] ||
    null;

  return (
    <div className="space-y-6">
      {/* Header Super Admin dengan Pintasan Cepat ke Semua Portal */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Super Administrator · Full Access Control
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">
            {activeStaff.fullName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ID: {activeStaff.nip} · Akses Penuh: Edit Tampilan Depan, Lihat Dashboard Guru BK, Lihat Dashboard Siswa, & Kelola Semua Data
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Lihat Web Depan
          </Link>
          <button
            onClick={() => {
              resetDemoState();
              onRefresh();
              showToast("Data sistem telah dikembalikan ke pengaturan awal.");
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Data
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold border border-slate-200 transition flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </div>

      {/* Navigasi Super Admin Lengkap */}
      <div className="flex flex-wrap gap-2">
        {[
          {
            id: "analitik",
            label: "Ringkasan & Statistik",
            icon: <BarChart3 className="w-4 h-4" />,
          },
          {
            id: "landing",
            label: "Edit Tampilan Depan",
            icon: <LayoutTemplate className="w-4 h-4" />,
          },
          {
            id: "view_guru",
            label: "Buka Dashboard Guru BK",
            icon: <HeartHandshake className="w-4 h-4" />,
          },
          {
            id: "view_siswa",
            label: "Buka Dashboard Siswa",
            icon: <GraduationCap className="w-4 h-4" />,
          },
          {
            id: "siswa",
            label: `Data Lengkap Siswa (${state.students.length})`,
            icon: <Users className="w-4 h-4" />,
          },
          {
            id: "guru",
            label: `Akun Guru BK (${state.staffUsers.length})`,
            icon: <UserCog className="w-4 h-4" />,
          },
          {
            id: "konten",
            label: "Edit Pertanyaan Decision Tree",
            icon: <FileEdit className="w-4 h-4" />,
          },
        ].map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id as AdminTab)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                active
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ANALITIK & PINTASAN CEPAT */}
      {tab === "analitik" && (
        <div className="space-y-6">
          {/* 3 Kartu Pintasan Cepat Super Admin */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setTab("landing")}
              className="text-left p-5 rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md hover:opacity-95 transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-2xl bg-white/15">
                  <LayoutTemplate className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20">
                  CMS Editor
                </span>
              </div>
              <h3 className="text-lg font-extrabold">
                Edit Tampilan Halaman Depan
              </h3>
              <p className="text-xs text-indigo-100 leading-relaxed">
                Ubah judul Hero, deskripsi, tombol CTA, kartu 3 fitur utama, hingga nama penyusun di footer secara langsung.
              </p>
            </button>

            <button
              onClick={() => setTab("view_guru")}
              className="text-left p-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md hover:opacity-95 transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-2xl bg-white/15">
                  <HeartHandshake className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20">
                  Full Akses
                </span>
              </div>
              <h3 className="text-lg font-extrabold">
                Lihat & Operasikan Dashboard Guru BK
              </h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Pantau hasil refleksi siswa, jadwal konsultasi, dan balas Live Chat siswa langsung dari ruang Admin.
              </p>
            </button>

            <button
              onClick={() => setTab("view_siswa")}
              className="text-left p-5 rounded-3xl bg-gradient-to-br from-sky-600 to-blue-700 text-white shadow-md hover:opacity-95 transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-2xl bg-white/15">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20">
                  Mode Preview Siswa
                </span>
              </div>
              <h3 className="text-lg font-extrabold">
                Lihat & Uji Dashboard Murid / Siswa
              </h3>
              <p className="text-xs text-sky-100 leading-relaxed">
                Pilih akun siswa mana saja untuk melihat tampilan Decision Tree, Jurnal, Konsultasi, & Live Chat dari sudut pandang murid.
              </p>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-1">
              <span className="text-xs font-bold text-emerald-700">
                Hasil A · Lanjutkan secara Sadar
              </span>
              <div className="text-3xl font-extrabold text-slate-900">
                {countA} Siswa
              </div>
              <p className="text-xs text-slate-500">
                Keinginan sejalan dengan minat, waktu, dan biaya.
              </p>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-1">
              <span className="text-xs font-bold text-amber-700">
                Hasil B · Tunda atau Sesuaikan
              </span>
              <div className="text-3xl font-extrabold text-slate-900">
                {countB} Siswa
              </div>
              <p className="text-xs text-slate-500">
                Perlu menimbang ulang waktu, biaya, atau prioritas.
              </p>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-1">
              <span className="text-xs font-bold text-rose-700">
                Hasil C · Ambil Jeda Refleksi
              </span>
              <div className="text-3xl font-extrabold text-slate-900">
                {countC} Siswa
              </div>
              <p className="text-xs text-slate-500">
                Dorongan didominasi kekhawatiran tertinggal (FOMO).
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Sebaran Siswa per Jenjang Kelas
            </h3>
            <div className="space-y-3">
              {[
                { label: "Kelas X", val: countClassX, color: "bg-indigo-600" },
                { label: "Kelas XI", val: countClassXI, color: "bg-sky-500" },
                {
                  label: "Kelas XII",
                  val: countClassXII,
                  color: "bg-emerald-500",
                },
              ].map((row, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{row.label}</span>
                    <span>{row.val} Siswa</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${row.color}`}
                      style={{
                        width: `${
                          state.students.length
                            ? Math.round(
                                (row.val / state.students.length) * 100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EDIT TAMPILAN DEPAN (LANDING PAGE CMS) */}
      {tab === "landing" && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Content Management System (CMS) · Halaman Utama
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                Edit Tampilan Halaman Depan (Landing Page)
              </h2>
              <p className="text-sm text-slate-500">
                Semua perubahan di bawah ini akan langsung tampil di halaman depan (`/`) dan tersimpan ke Supabase Cloud.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleResetLandingConfig}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
              >
                Reset ke Default
              </button>
              <Link
                href="/"
                target="_blank"
                className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-xs font-bold text-indigo-700 border border-indigo-200 flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Pratinjau Halaman Depan
              </Link>
            </div>
          </div>

          <form onSubmit={handleSaveLandingConfig} className="space-y-6">
            {/* Bagian 1: Hero Banner */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                1. Bagian Hero Utama (Atas)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Label Badge Atas
                  </label>
                  <input
                    type="text"
                    value={landingForm.badgeText}
                    onChange={(e) =>
                      setLandingForm({
                        ...landingForm,
                        badgeText: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judul Utama (Hitam)
                  </label>
                  <input
                    type="text"
                    value={landingForm.heroTitleMain}
                    onChange={(e) =>
                      setLandingForm({
                        ...landingForm,
                        heroTitleMain: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judul Highlight (Biru/Indigo)
                  </label>
                  <input
                    type="text"
                    value={landingForm.heroTitleHighlight}
                    onChange={(e) =>
                      setLandingForm({
                        ...landingForm,
                        heroTitleHighlight: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi Paragraf Hero
                </label>
                <textarea
                  rows={3}
                  value={landingForm.heroDescription}
                  onChange={(e) =>
                    setLandingForm({
                      ...landingForm,
                      heroDescription: e.target.value,
                    })
                  }
                  className="w-full p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teks Tombol Utama (CTA 1)
                  </label>
                  <input
                    type="text"
                    value={landingForm.ctaPrimaryText}
                    onChange={(e) =>
                      setLandingForm({
                        ...landingForm,
                        ctaPrimaryText: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teks Tombol Kedua (CTA 2)
                  </label>
                  <input
                    type="text"
                    value={landingForm.ctaSecondaryText}
                    onChange={(e) =>
                      setLandingForm({
                        ...landingForm,
                        ctaSecondaryText: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 2: Kartu 3 Fitur Utama */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                2. Bagian Fitur Layanan BK (3 Kartu)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judul Seksi Fitur
                  </label>
                  <input
                    type="text"
                    value={landingForm.featureSectionTitle}
                    onChange={(e) =>
                      setLandingForm({
                        ...landingForm,
                        featureSectionTitle: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subjudul Seksi Fitur
                  </label>
                  <input
                    type="text"
                    value={landingForm.featureSectionSubtitle}
                    onChange={(e) =>
                      setLandingForm({
                        ...landingForm,
                        featureSectionSubtitle: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-indigo-700">
                    Kartu Fitur 1
                  </label>
                  <input
                    type="text"
                    value={landingForm.feature1Title}
                    onChange={(e) =>
                      setLandingForm({
                        ...landingForm,
                        feature1Title: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900"
                  />
                  <textarea
                    rows={3}
                    value={landingForm.feature1Desc}
                    onChange={(e) =>
                      setLandingForm({
                        ...landingForm,
                        feature1Desc: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-sky-700">
                    Kartu Fitur 2
                  </label>
                  <input
                    type="text"
                    value={landingForm.feature2Title}
                    onChange={(e) =>
                      setLandingForm({
                        ...landingForm,
                        feature2Title: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900"
                  />
                  <textarea
                    rows={3}
                    value={landingForm.feature2Desc}
                    onChange={(e) =>
                      setLandingForm({
                        ...landingForm,
                        feature2Desc: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-emerald-700">
                    Kartu Fitur 3
                  </label>
                  <input
                    type="text"
                    value={landingForm.feature3Title}
                    onChange={(e) =>
                      setLandingForm({
                        ...landingForm,
                        feature3Title: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900"
                  />
                  <textarea
                    rows={3}
                    value={landingForm.feature3Desc}
                    onChange={(e) =>
                      setLandingForm({
                        ...landingForm,
                        feature3Desc: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 3: Identitas Footer & Akademik */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                3. Bagian Footer & Identitas Akademik
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Penyusun
                  </label>
                  <input
                    type="text"
                    value={landingForm.authorName}
                    onChange={(e) =>
                      setLandingForm({
                        ...landingForm,
                        authorName: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NPM Penyusun
                  </label>
                  <input
                    type="text"
                    value={landingForm.authorNpm}
                    onChange={(e) =>
                      setLandingForm({
                        ...landingForm,
                        authorNpm: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dosen Pengampu
                  </label>
                  <input
                    type="text"
                    value={landingForm.lecturerName}
                    onChange={(e) =>
                      setLandingForm({
                        ...landingForm,
                        lecturerName: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Program Studi / Fakultas / Universitas
                </label>
                <input
                  type="text"
                  value={landingForm.universityName}
                  onChange={(e) =>
                    setLandingForm({
                      ...landingForm,
                      universityName: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan Tampilan Depan
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: LIHAT & OPERASIKAN DASHBOARD GURU BK LANGSUNG DI DALAM ADMIN */}
      {tab === "view_guru" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs font-bold text-emerald-900">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span>
                Mode Super Admin: Anda sedang melihat & mengoperasikan penuh{" "}
                <b>Dashboard Guru BK</b>
              </span>
            </div>
            <Link
              href="/guru-bk"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              Buka di Halaman Penuh (/guru-bk)
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <CounselorDashboard
            state={state}
            activeStaff={activeStaff}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        </div>
      )}

      {/* TAB 4: LIHAT & OPERASIKAN DASHBOARD SISWA LANGSUNG DI DALAM ADMIN */}
      {tab === "view_siswa" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-sky-600" />
                Lihat Dashboard Siswa Sebagai:
              </span>
              <select
                value={activePreviewStudent?.id || ""}
                onChange={(e) => {
                  setPreviewStudentId(e.target.value);
                  setActiveStudentId(e.target.value);
                  onRefresh();
                }}
                className="px-3 py-1.5 rounded-xl bg-white border border-sky-300 text-xs font-bold text-slate-900"
              >
                {state.students.map((stu) => (
                  <option key={stu.id} value={stu.id}>
                    {stu.nickname} (Kelas {stu.classLevel}) —{" "}
                    {stu.resultCode ? `Hasil ${stu.resultCode}` : "Belum isi tree"}
                  </option>
                ))}
              </select>
            </div>
            <Link
              href="/siswa"
              className="text-xs font-bold text-sky-700 hover:underline flex items-center gap-1"
            >
              Buka di Halaman Penuh (/siswa)
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <StudentPortal
            state={state}
            activeStudent={activePreviewStudent}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        </div>
      )}

      {/* TAB 5: DIREKTORI LENGKAP SISWA (FULL ACCESS ADMIN: BACA SEMUA JURNAL & CHAT) */}
      {tab === "siswa" && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Data Lengkap Seluruh Siswa (Full Access Super Admin)
            </h3>
            <p className="text-xs text-slate-500">
              Sebagai Super Admin, Anda dapat melihat detail penuh setiap siswa (Hasil Decision Tree, Isi Jurnal, & Riwayat Chat), masuk sebagai siswa tersebut, atau menghapus datanya.
            </p>
          </div>

          {inspectedStudent && (
            <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Inspeksi Detail Siswa · Full Access Admin
                  </span>
                  <h4 className="text-lg font-extrabold text-slate-900">
                    {inspectedStudent.nickname} · Kelas{" "}
                    {inspectedStudent.classLevel}
                  </h4>
                </div>
                <button
                  onClick={() => setInspectedStudent(null)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700"
                >
                  Tutup Detail
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                  <strong className="text-indigo-700 block">
                    Hasil Decision Tree:
                  </strong>
                  <p className="text-slate-800 font-semibold">
                    {inspectedStudent.resultCode
                      ? `Hasil ${inspectedStudent.resultCode} — ${
                          DECISION_OUTCOMES[inspectedStudent.resultCode].title
                        }`
                      : "Belum menyelesaikan Decision Tree"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                  <strong className="text-sky-700 block">
                    Isi Jurnal Refleksi Siswa:
                  </strong>
                  {inspectedStudent.journal.saved ? (
                    <div className="space-y-1 text-slate-700">
                      <p>
                        <b>Dilihat:</b> {inspectedStudent.journal.seen || "-"}
                      </p>
                      <p>
                        <b>Dirasakan:</b> {inspectedStudent.journal.felt || "-"}
                      </p>
                      <p>
                        <b>Tak tampak:</b>{" "}
                        {inspectedStudent.journal.unseen || "-"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">Belum menulis jurnal</p>
                  )}
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                  <strong className="text-emerald-700 block">
                    Riwayat Live Chat ({
                      state.chatMessages.filter(
                        (m) => m.studentId === inspectedStudent.id
                      ).length
                    }{" "}
                    pesan):
                  </strong>
                  <div className="max-h-28 overflow-y-auto space-y-1 text-slate-700">
                    {state.chatMessages
                      .filter((m) => m.studentId === inspectedStudent.id)
                      .map((m) => (
                        <p key={m.id}>
                          <b>{m.senderName}:</b> {m.message}
                        </p>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                  <th className="py-3.5 px-4">Nama Siswa</th>
                  <th className="py-3.5 px-4">Kelas</th>
                  <th className="py-3.5 px-4">Hasil Tree</th>
                  <th className="py-3.5 px-4">Status Jurnal</th>
                  <th className="py-3.5 px-4">Kontrol Penuh Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {state.students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {s.nickname}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      Kelas {s.classLevel}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold">
                      {s.resultCode ? (
                        <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                          Hasil {s.resultCode}
                        </span>
                      ) : (
                        <span className="text-slate-400">Belum Mengisi</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {s.journal.saved
                        ? s.journal.sharedWithCounselor
                          ? "Tersimpan (Dibagikan)"
                          : "Tersimpan (Privat)"
                        : "Kosong"}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => setInspectedStudent(s)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Detail & Jurnal
                        </button>
                        <button
                          onClick={() => {
                            setPreviewStudentId(s.id);
                            setActiveStudentId(s.id);
                            setTab("view_siswa");
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 transition"
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          Buka sbg Siswa
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(s.id, s.nickname)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: KELOLA AKUN GURU BK */}
      {tab === "guru" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              Tambah Akun Guru BK Baru
            </h3>
            <form onSubmit={handleAddCounselor} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lengkap & Gelar Guru BK
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Ahmad Fauzi, M.Pd."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Resmi Sekolah
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="nama@sekolah.sch.id"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kata Sandi Awal
                  </label>
                  <input
                    type="text"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    NIP / NUPTK
                  </label>
                  <input
                    type="text"
                    value={newNip}
                    onChange={(e) => setNewNip(e.target.value)}
                    placeholder="1990..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Unit Sekolah
                </label>
                <input
                  type="text"
                  value={newSchool}
                  onChange={(e) => setNewSchool(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition"
              >
                Simpan Akun Guru BK
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Daftar Konselor & Pengelola
            </h3>
            <div className="space-y-3">
              {state.staffUsers.map((st) => (
                <div
                  key={st.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {st.fullName}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          st.role === "admin"
                            ? "bg-slate-200 text-slate-800"
                            : "bg-indigo-100 text-indigo-800"
                        }`}
                      >
                        {st.role === "admin" ? "Super Admin" : "Guru BK"}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          st.isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {st.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Email: <b>{st.email}</b> · Sandi:{" "}
                      <b>{st.password || "(Supabase Auth)"}</b> · NIP/ID:{" "}
                      {st.nip}
                    </p>
                  </div>
                  {st.role !== "admin" && (
                    <button
                      onClick={() => handleToggleStaffStatus(st.id)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700"
                    >
                      {st.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: EDIT PERTANYAAN & SITUASI DECISION TREE */}
      {tab === "konten" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Daftar Skenario Situasi Decision Tree
                </h3>
                <p className="text-xs text-slate-500">
                  Kelola pilihan situasi awal yang dapat dipilih oleh siswa.
                </p>
              </div>
              <button
                onClick={handleResetDefaultContent}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
              >
                Kembalikan ke Standar Proposal
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {state.customSituations.map((sit, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs text-slate-800 font-medium"
                >
                  <span>
                    <b>#{i + 1}.</b> {sit}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (state.customSituations.length <= 1) return;
                      state.customSituations.splice(i, 1);
                      savePlatformState(state);
                      onRefresh();
                      showToast("Situasi dihapus.");
                    }}
                    className="text-rose-600 hover:text-rose-800 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddSituation} className="flex gap-2.5 pt-2">
              <input
                type="text"
                value={newSituation}
                onChange={(e) => setNewSituation(e.target.value)}
                placeholder="Tambah skenario situasi baru..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                + Tambah Situasi
              </button>
            </form>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Edit Redaksi 4 Pertanyaan & Pilihan Jawaban Decision Tree (P1–P4)
              </h3>
              <p className="text-xs text-slate-500">
                Anda dapat mengedit teks pertanyaan maupun ketiga opsi jawaban secara langsung.
              </p>
            </div>
            <div className="space-y-4">
              {state.customQuestions.map((q, qIdx) => (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-700">
                      Pertanyaan {q.code} · {q.theoryBasis}
                    </span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Tersimpan Otomatis
                    </span>
                  </div>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) =>
                      handleUpdateQuestionText(qIdx, e.target.value)
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-900"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx}>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          Opsi {optIdx + 1}
                        </label>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) =>
                            handleUpdateQuestionOption(
                              qIdx,
                              optIdx,
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
