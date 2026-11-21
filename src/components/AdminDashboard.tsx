"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  BarChart3,
  UserCog,
  KeyRound,
  FileEdit,
  Plus,
  Trash2,
  LogOut,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Users,
} from "lucide-react";
import {
  PlatformState,
  StaffAccount,
  authenticateStaff,
  setActiveStaffSession,
  savePlatformState,
  resetDemoState,
} from "@/lib/store";
import { DEFAULT_QUESTIONS, DEFAULT_SITUATIONS } from "@/lib/bk-data";

interface AdminDashboardProps {
  state: PlatformState;
  activeStaff: StaffAccount | null;
  onRefresh: () => void;
  showToast: (msg: string) => void;
}

type AdminTab = "analitik" | "guru" | "siswa" | "konten";

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

  // Form Tambah Guru BK
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newNip, setNewNip] = useState("");
  const [newSchool, setNewSchool] = useState("SMA Negeri 1 Contoh");

  // Form Tambah Situasi Baru
  const [newSituation, setNewSituation] = useState("");

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
      setLoginErr(
        "Akun ini berstatus Guru BK, bukan Administrator Sistem. Gunakan akun admin@sekolah-contoh.sch.id."
      );
      return;
    }
    onRefresh();
    showToast(`Selamat datang di Dashboard Admin, ${res.staff.fullName}!`);
  };

  const handleFillDemoAdmin = () => {
    setEmail("admin@sekolah-contoh.sch.id");
    setPassword("admin12345");
    setLoginErr("");
  };

  const handleLogout = () => {
    setActiveStaffSession(null);
    onRefresh();
    showToast("Telah keluar dari Dashboard Admin.");
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
    showToast("Akun Guru BK baru berhasil ditambahkan!");
  };

  const handleToggleStaffStatus = (id: string) => {
    const idx = state.staffUsers.findIndex((u) => u.id === id);
    if (idx === -1) return;
    if (state.staffUsers[idx].role === "admin") {
      showToast("Akun Admin utama tidak dapat dinonaktifkan.");
      return;
    }
    state.staffUsers[idx].isActive = !state.staffUsers[idx].isActive;
    savePlatformState(state);
    onRefresh();
    showToast(
      `Status akun ${state.staffUsers[idx].fullName} diperbarui.`
    );
  };

  const handleDeleteStudent = (studentId: string, nick: string) => {
    state.students = state.students.filter((s) => s.id !== studentId);
    state.consultations = state.consultations.filter(
      (c) => c.studentId !== studentId
    );
    state.chatMessages = state.chatMessages.filter(
      (m) => m.studentId !== studentId
    );
    savePlatformState(state);
    onRefresh();
    showToast(`Data siswa ${nick} telah dihapus sesuai mekanisme penghapusan data.`);
  };

  const handleAddSituation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSituation.trim()) return;
    state.customSituations.push(newSituation.trim());
    savePlatformState(state);
    setNewSituation("");
    onRefresh();
    showToast("Pilihan situasi baru ditambahkan ke Decision Tree.");
  };

  const handleResetDefaultContent = () => {
    state.customSituations = [...DEFAULT_SITUATIONS];
    state.customQuestions = JSON.parse(JSON.stringify(DEFAULT_QUESTIONS));
    savePlatformState(state);
    onRefresh();
    showToast("Konten Decision Tree dikembalikan ke standar Proposal.");
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-lg mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            Tata Kelola Sistem & Etika Data BK
          </span>
          <h2 className="text-2xl font-extrabold text-white">
            Login Dashboard Administrator
          </h2>
          <p className="text-sm text-slate-400">
            Kelola akun Guru BK, kode sekolah, konten pertanyaan Decision Tree, dan pantau statistik agregat tanpa mengakses isi jurnal/chat privat siswa.
          </p>
        </div>

        {loginErr && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 font-medium">
            {loginErr}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Email Administrator
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sekolah-contoh.sch.id"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Kata Sandi
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-sm transition"
            >
              Masuk Dashboard Admin
            </button>
            <button
              type="button"
              onClick={handleFillDemoAdmin}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 font-semibold text-xs transition"
            >
              Isi Akun Contoh (Admin BK)
            </button>
          </div>
        </form>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
          <p className="font-bold text-slate-300">Akun Demo Administrator:</p>
          <p>
            Email: <code className="text-purple-300">admin@sekolah-contoh.sch.id</code> · Sandi:{" "}
            <code className="text-purple-300">admin12345</code>
          </p>
        </div>
      </div>
    );
  }

  const countA = state.students.filter((s) => s.resultCode === "A").length;
  const countB = state.students.filter((s) => s.resultCode === "B").length;
  const countC = state.students.filter((s) => s.resultCode === "C").length;
  const countClassX = state.students.filter((s) => s.classLevel === "X").length;
  const countClassXI = state.students.filter((s) => s.classLevel === "XI").length;
  const countClassXII = state.students.filter((s) => s.classLevel === "XII").length;

  return (
    <div className="space-y-6">
      {/* Header Admin */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
            Dashboard Administrator Sistem · Tata Kelola & Etika Layanan BK
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-0.5">
            {activeStaff.fullName}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            NPM/ID: {activeStaff.nip} · Pengelolaan Guru BK, Kode Sekolah, Konten Decision Tree, & Statistik Agregat
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              resetDemoState();
              onRefresh();
              showToast("Seluruh data demo telah di-reset ke kondisi awal.");
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Data Demo
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 text-xs font-bold border border-slate-700 transition flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </div>

      {/* Menu Navigasi Admin */}
      <div className="flex flex-wrap gap-2">
        {[
          {
            id: "analitik",
            label: "Statistik Agregat & Etika",
            icon: <BarChart3 className="w-4 h-4" />,
          },
          {
            id: "guru",
            label: `Kelola Akun Guru BK (${state.staffUsers.length})`,
            icon: <UserCog className="w-4 h-4" />,
          },
          {
            id: "siswa",
            label: `Direktori Siswa & Privasi (${state.students.length})`,
            icon: <Users className="w-4 h-4" />,
          },
          {
            id: "konten",
            label: "Konten Decision Tree & Situasi",
            icon: <FileEdit className="w-4 h-4" />,
          },
        ].map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id as AdminTab)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                active
                  ? "bg-purple-500 text-slate-950 shadow-lg shadow-purple-500/20"
                  : "bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ANALITIK AGREGAT (TANPA MELANGGAR PRIVASI JURNAL/CHAT SISWA) */}
      {tab === "analitik" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
              <span className="text-xs font-bold text-emerald-400">
                Hasil A · Lanjutkan secara Sadar
              </span>
              <div className="text-3xl font-extrabold text-white">{countA} Siswa</div>
              <p className="text-xs text-slate-400">
                Keinginan sejalan dengan minat, waktu, dan biaya.
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
              <span className="text-xs font-bold text-amber-400">
                Hasil B · Tunda atau Sesuaikan
              </span>
              <div className="text-3xl font-extrabold text-white">{countB} Siswa</div>
              <p className="text-xs text-slate-400">
                Perlu menimbang ulang waktu, biaya, atau prioritas.
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
              <span className="text-xs font-bold text-rose-400">
                Hasil C · Ambil Jeda Refleksi
              </span>
              <div className="text-3xl font-extrabold text-white">{countC} Siswa</div>
              <p className="text-xs text-slate-400">
                Dorongan didominasi kekhawatiran tertinggal (FOMO).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white">
                Sebaran Siswa per Jenjang Kelas
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Kelas X", val: countClassX, color: "bg-sky-500" },
                  { label: "Kelas XI (Fokus Utama)", val: countClassXI, color: "bg-purple-500" },
                  { label: "Kelas XII", val: countClassXII, color: "bg-emerald-500" },
                ].map((row, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span>{row.label}</span>
                      <span>{row.val} Siswa</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
                      <div
                        className={`h-full ${row.color}`}
                        style={{
                          width: `${
                            state.students.length
                              ? Math.round((row.val / state.students.length) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                Kepatuhan Etika & Perlindungan Data (Tabel 6 Proposal)
              </div>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li>
                  • <b>Pemisahan Wewenang:</b> Administrator mengelola infrastruktur, akun Guru BK, dan konten pertanyaan, tetapi <b>tidak dapat membaca isi jurnal maupun isi chat konseling siswa</b>.
                </li>
                <li>
                  • <b>Minimisasi Data:</b> Sistem tidak mewajibkan NIK/NISN atau alamat rumah siswa.
                </li>
                <li>
                  • <b>Hak Koreksi & Penghapusan:</b> Tersedia mekanisme penghapusan akun/riwayat siswa secara transparan.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KELOLA AKUN GURU BK */}
      {tab === "guru" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-400" />
              Daftarkan Akun Guru BK Baru
            </h3>
            <form onSubmit={handleAddCounselor} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Nama Lengkap & Gelar Guru BK
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Pak Ahmad Fauzi, M.Pd."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Email Resmi Sekolah
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ahmad.bk@sekolah-contoh.sch.id"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Kata Sandi Awal
                  </label>
                  <input
                    type="text"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    NIP / NUPTK
                  </label>
                  <input
                    type="text"
                    value={newNip}
                    onChange={(e) => setNewNip(e.target.value)}
                    placeholder="1990..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Unit Sekolah
                </label>
                <input
                  type="text"
                  value={newSchool}
                  onChange={(e) => setNewSchool(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold transition"
              >
                Simpan Akun Guru BK
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">
              Daftar Staf & Konselor Terdaftar
            </h3>
            <div className="space-y-3">
              {state.staffUsers.map((st) => (
                <div
                  key={st.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {st.fullName}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          st.role === "admin"
                            ? "bg-purple-500/20 text-purple-300"
                            : "bg-sky-500/20 text-sky-300"
                        }`}
                      >
                        {st.role === "admin" ? "Admin" : "Guru BK"}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          st.isActive
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {st.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {st.email} · NIP/ID: {st.nip} · {st.schoolName}
                    </p>
                  </div>
                  {st.role !== "admin" && (
                    <button
                      onClick={() => handleToggleStaffStatus(st.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
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

      {/* TAB 3: DIREKTORI SISWA & MEKANISME PENGHAPUSAN DATA */}
      {tab === "siswa" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Manajemen Data Siswa (Hak Koreksi & Penghapusan Data)
            </h3>
            <p className="text-xs text-slate-400">
              Sesuai Tabel 6 Proposal (Mitigasi Akses & Privasi), Admin dapat menghapus rekaman siswa jika diminta oleh siswa/wali atau setelah masa layanan berakhir. Isi jurnal dan chat tetap terenkripsi/tersembunyi dari Admin.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-xs uppercase border-b border-slate-800">
                  <th className="py-3 px-4">Nama Panggilan</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Kode Sekolah</th>
                  <th className="py-3 px-4">Status Refleksi</th>
                  <th className="py-3 px-4">Aksi Privasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {state.students.map((s) => (
                  <tr key={s.id}>
                    <td className="py-3 px-4 font-bold text-white">
                      {s.nickname}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      Kelas {s.classLevel}
                    </td>
                    <td className="py-3 px-4 text-sky-300 font-mono text-xs">
                      {s.schoolCode}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-300">
                      {s.resultCode ? "Sudah Mengisi" : "Belum Mengisi"}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteStudent(s.id, s.nickname)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold border border-rose-800/40 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus Data
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: KELOLA KONTEN PERTANYAAN & SITUASI DECISION TREE */}
      {tab === "konten" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Daftar Skenario Situasi Decision Tree
                </h3>
                <p className="text-xs text-slate-400">
                  Mendukung pengembangan lanjutan (Tabel 1 Proposal: penambahan ragam skenario keputusan).
                </p>
              </div>
              <button
                onClick={handleResetDefaultContent}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Kembalikan ke Standar Proposal
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {state.customSituations.map((sit, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-200"
                >
                  <span>
                    <b>#{i + 1}.</b> {sit}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
              ))}
            </div>

            <form onSubmit={handleAddSituation} className="flex gap-2.5 pt-2">
              <input
                type="text"
                value={newSituation}
                onChange={(e) => setNewSituation(e.target.value)}
                placeholder="Tambah skenario situasi baru (misal: Tantangan JOMO akhir pekan)..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs"
              >
                + Tambah Situasi
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">
              Verifikasi 4 Pertanyaan Inti Decision Tree (P1–P4)
            </h3>
            <div className="space-y-3">
              {state.customQuestions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-300">
                      {q.code} · {q.theoryBasis}
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      Terverifikasi BK
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white">{q.question}</p>
                  <p className="text-xs text-slate-400">
                    Opsi: 1) {q.options[0]} · 2) {q.options[1]} · 3) {q.options[2]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
