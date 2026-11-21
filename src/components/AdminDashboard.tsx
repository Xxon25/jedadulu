"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  BarChart3,
  UserCog,
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
      setLoginErr("Akun ini tidak memiliki hak akses Administrator.");
      return;
    }
    onRefresh();
    showToast(`Selamat datang, ${res.staff.fullName}`);
  };

  const handleLogout = () => {
    setActiveStaffSession(null);
    onRefresh();
    showToast("Telah keluar dari Administrasi Sistem.");
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
            Administrasi Tata Kelola Sistem
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Masuk Pengelola Sistem
          </h2>
          <p className="text-sm text-slate-500">
            Khusus pengelola untuk mengatur akun Guru BK, kode sekolah, dan struktur pertanyaan Decision Tree.
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
              Email Pengelola
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sekolah.sch.id"
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
            Masuk Administrasi Sistem
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

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Tata Kelola & Etika Data Layanan BK
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">
            {activeStaff.fullName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ID: {activeStaff.nip} · Pengelolaan Konselor, Direktori Privasi, & Konten Decision Tree
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              resetDemoState();
              onRefresh();
              showToast("Data sistem telah dikembalikan ke pengaturan awal.");
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Atur Ulang Data
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

      <div className="flex flex-wrap gap-2">
        {[
          {
            id: "analitik",
            label: "Statistik Agregat & Etika",
            icon: <BarChart3 className="w-4 h-4" />,
          },
          {
            id: "guru",
            label: `Akun Guru BK (${state.staffUsers.length})`,
            icon: <UserCog className="w-4 h-4" />,
          },
          {
            id: "siswa",
            label: `Direktori & Privasi Siswa (${state.students.length})`,
            icon: <Users className="w-4 h-4" />,
          },
          {
            id: "konten",
            label: "Konten Decision Tree",
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
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "analitik" && (
        <div className="space-y-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Sebaran Siswa per Jenjang Kelas
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Kelas X", val: countClassX, color: "bg-indigo-600" },
                  {
                    label: "Kelas XI",
                    val: countClassXI,
                    color: "bg-sky-500",
                  },
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

            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-sm">
                <ShieldCheck className="w-5 h-5" />
                Kepatuhan Etika & Perlindungan Data BK
              </div>
              <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <li>
                  • <b>Pemisahan Wewenang:</b> Pengelola sistem hanya memantau data agregat dan akun konselor, serta <b>tidak dapat mengakses isi jurnal maupun percakapan konseling siswa</b>.
                </li>
                <li>
                  • <b>Minimisasi Data:</b> Sistem tidak memungut data sensitif di luar kebutuhan refleksi awal.
                </li>
                <li>
                  • <b>Mekanisme Penghapusan:</b> Tersedia fitur penghapusan data siswa sesuai standar perlindungan data.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

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
                        {st.role === "admin" ? "Pengelola" : "Guru BK"}
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
                      {st.email} · NIP/ID: {st.nip} · {st.schoolName}
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

      {tab === "siswa" && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Manajemen Data Siswa (Hak Koreksi & Penghapusan Data)
            </h3>
            <p className="text-xs text-slate-500">
              Pengelola dapat menghapus rekaman siswa atas permintaan siswa/wali atau setelah masa layanan berakhir. Isi jurnal dan percakapan konseling tetap terlindungi dari pengelola.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Kode Sekolah</th>
                  <th className="py-3 px-4">Status Refleksi</th>
                  <th className="py-3 px-4">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {state.students.map((s) => (
                  <tr key={s.id}>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {s.nickname}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      Kelas {s.classLevel}
                    </td>
                    <td className="py-3 px-4 text-indigo-600 font-mono text-xs font-bold">
                      {s.schoolCode}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {s.resultCode ? "Sudah Mengisi" : "Belum Mengisi"}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteStudent(s.id, s.nickname)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition"
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

      {tab === "konten" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Daftar Skenario Situasi Decision Tree
                </h3>
                <p className="text-xs text-slate-500">
                  Kelola pilihan situasi awal yang relevan dengan keseharian media sosial siswa.
                </p>
              </div>
              <button
                onClick={handleResetDefaultContent}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
              >
                Kembalikan ke Standar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {state.customSituations.map((sit, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-800 font-medium"
                >
                  <span>
                    <b>#{i + 1}.</b> {sit}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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
            <h3 className="text-base font-extrabold text-slate-900">
              Struktur 4 Pertanyaan Inti Decision Tree (P1–P4)
            </h3>
            <div className="space-y-3">
              {state.customQuestions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-700">
                      {q.code} · {q.theoryBasis}
                    </span>
                    <span className="text-emerald-700 font-bold">
                      Terverifikasi BK
                    </span>
                  </div>
                  <p className="text-sm font-extrabold text-slate-900">
                    {q.question}
                  </p>
                  <p className="text-xs text-slate-600">
                    Opsi: 1) {q.options[0]} · 2) {q.options[1]} · 3){" "}
                    {q.options[2]}
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
