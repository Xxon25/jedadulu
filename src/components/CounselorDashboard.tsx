"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Users,
  CalendarCheck,
  MessageSquare,
  KeyRound,
  Lock,
  Eye,
  X,
  Send,
  Plus,
  LogOut,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Filter,
  Sparkles,
} from "lucide-react";
import {
  PlatformState,
  StaffAccount,
  StudentRecord,
  authenticateStaff,
  setActiveStaffSession,
  savePlatformState,
  sendLiveChatMessage,
} from "@/lib/store";
import { DECISION_OUTCOMES } from "@/lib/bk-data";

interface CounselorDashboardProps {
  state: PlatformState;
  activeStaff: StaffAccount | null;
  onRefresh: () => void;
  showToast: (msg: string) => void;
}

type CounselorTab = "hasil" | "konsul" | "chat" | "kode";

export default function CounselorDashboard({
  state,
  activeStaff,
  onRefresh,
  showToast,
}: CounselorDashboardProps) {
  const [tab, setTab] = useState<CounselorTab>("hasil");

  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");

  // Filter Hasil Siswa
  const [filterClass, setFilterClass] = useState<string>("");
  const [filterResult, setFilterResult] = useState<string>("");
  const [selectedJournalStudent, setSelectedJournalStudent] =
    useState<StudentRecord | null>(null);

  // Tanggapan Konsultasi
  const [replyNotes, setReplyNotes] = useState<Record<string, string>>({});
  const [scheduleDates, setScheduleDates] = useState<Record<string, string>>({});

  // Live Chat Guru BK
  const [selectedChatStudentId, setSelectedChatStudentId] = useState<string>(
    state.students[0]?.id || "stu-d1"
  );
  const [chatMessage, setChatMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [tab, selectedChatStudentId, state.chatMessages.length]);

  const isCounselorLoggedIn =
    activeStaff && (activeStaff.role === "guru_bk" || activeStaff.role === "admin");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr("");
    const res = await authenticateStaff(email, password);
    if (!res.ok) {
      setLoginErr(res.error || "Gagal masuk.");
      return;
    }
    onRefresh();
    showToast(`Selamat datang di Ruang Guru BK, ${res.staff?.fullName}!`);
  };

  const handleFillDemoCounselor = () => {
    setEmail("guru@sekolah-contoh.sch.id");
    setPassword("bk12345");
    setLoginErr("");
  };

  const handleLogout = () => {
    setActiveStaffSession(null);
    onRefresh();
    showToast("Telah keluar dari Ruang Guru BK.");
  };

  const handleUpdateConsultStatus = (
    reqId: string,
    newStatus: "Baru" | "Dijadwalkan" | "Selesai"
  ) => {
    const idx = state.consultations.findIndex((c) => c.id === reqId);
    if (idx === -1) return;
    state.consultations[idx].status = newStatus;
    if (replyNotes[reqId] !== undefined) {
      state.consultations[idx].counselorNote = replyNotes[reqId];
    }
    if (scheduleDates[reqId] !== undefined) {
      state.consultations[idx].scheduledDate = scheduleDates[reqId];
    }
    savePlatformState(state);
    onRefresh();
    showToast(`Status konsultasi diperbarui menjadi: ${newStatus}`);
  };

  const handleCreateSchoolCode = () => {
    let newCode = "";
    do {
      newCode = `JEDA-${Math.floor(10 + Math.random() * 90)}`;
    } while (state.schoolCodes.some((c) => c.code === newCode));

    state.schoolCodes.unshift({
      id: `sc-${Date.now()}`,
      code: newCode,
      schoolName: activeStaff?.schoolName || "SMA Negeri 1 Contoh",
      note: "Kelas X–XII · Dibuat oleh Guru BK",
      isActive: true,
      createdAt: new Date().toISOString(),
    });
    savePlatformState(state);
    onRefresh();
    showToast(`Kode sekolah baru dibuat: ${newCode}`);
  };

  const handleToggleCode = (codeId: string) => {
    const idx = state.schoolCodes.findIndex((c) => c.id === codeId);
    if (idx === -1) return;
    state.schoolCodes[idx].isActive = !state.schoolCodes[idx].isActive;
    savePlatformState(state);
    onRefresh();
    showToast(
      `Kode ${state.schoolCodes[idx].code} kini ${
        state.schoolCodes[idx].isActive ? "Aktif" : "Nonaktif"
      }.`
    );
  };

  const handleSendCounselorChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatStudentId) return;
    const senderName = activeStaff?.fullName || "Bu Dewi, S.Pd., Kons.";
    const res = await sendLiveChatMessage(
      selectedChatStudentId,
      "guru_bk",
      senderName,
      chatMessage
    );
    if (!res.ok) {
      showToast(res.error || "Gagal mengirim pesan.");
      return;
    }
    setChatMessage("");
    onRefresh();
  };

  if (!isCounselorLoggedIn) {
    return (
      <div className="max-w-lg mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-bold">
            <Lock className="w-3.5 h-3.5" />
            Akses Terbatas · Konselor Sekolah (ASCA, 2022)
          </span>
          <h2 className="text-2xl font-extrabold text-white">
            Login Dashboard Guru BK
          </h2>
          <p className="text-sm text-slate-400">
            Masuk menggunakan akun Guru BK untuk meninjau hasil refleksi siswa, membaca jurnal yang diizinkan, mengelola jadwal konsultasi, dan membalas Live Chat.
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
              Email Guru BK
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="guru@sekolah-contoh.sch.id"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500"
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
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition"
            >
              Masuk Ruang Guru BK
            </button>
            <button
              type="button"
              onClick={handleFillDemoCounselor}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold text-xs transition"
            >
              Isi Akun Contoh (Bu Dewi)
            </button>
          </div>
        </form>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
          <p className="font-bold text-slate-300">Akun Demo Guru BK:</p>
          <p>
            Email: <code className="text-sky-300">guru@sekolah-contoh.sch.id</code> · Sandi:{" "}
            <code className="text-sky-300">bk12345</code>
          </p>
        </div>
      </div>
    );
  }

  const totalStudents = state.students.length;
  const reflectedCount = state.students.filter((s) => s.resultCode).length;
  const newConsultCount = state.consultations.filter((c) => c.status === "Baru").length;
  const sharedJournalCount = state.students.filter(
    (s) => s.journal.saved && s.journal.sharedWithCounselor
  ).length;

  const filteredStudents = state.students.filter(
    (s) =>
      (!filterClass || s.classLevel === filterClass) &&
      (!filterResult || s.resultCode === filterResult)
  );

  const selectedChatStudent = state.students.find(
    (s) => s.id === selectedChatStudentId
  );
  const currentStudentChats = state.chatMessages.filter(
    (m) => m.studentId === selectedChatStudentId
  );

  return (
    <div className="space-y-6">
      {/* Header Dashboard Guru BK */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            Dashboard Profesional Guru BK · {activeStaff.schoolName}
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-0.5">
            Halo, {activeStaff.fullName}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            NIP: {activeStaff.nip} · Pemantauan Refleksi Decision Tree, Jurnal Terbuka, Jadwal Konsultasi, & Live Chat Siswa
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 text-xs font-bold border border-slate-700 transition flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>

      {/* 4 Kartu Statistik Ringkas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400">Siswa Terdaftar</span>
          <div className="text-3xl font-extrabold text-white mt-1">{totalStudents}</div>
          <span className="text-[11px] text-sky-400">Kelas X, XI, XII</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400">Sudah Refleksi Tree</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">
            {reflectedCount}
          </div>
          <span className="text-[11px] text-slate-400">
            Hasil A, B, atau C (Non-diagnostik)
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400">Jurnal Dibagikan</span>
          <div className="text-3xl font-extrabold text-purple-400 mt-1">
            {sharedJournalCount}
          </div>
          <span className="text-[11px] text-slate-400">Atas persetujuan siswa</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-slate-400">Konsultasi Baru</span>
          <div className="text-3xl font-extrabold text-amber-400 mt-1">
            {newConsultCount}
          </div>
          <span className="text-[11px] text-slate-400">Menunggu jadwal tindak lanjut</span>
        </div>
      </div>

      {/* Tab Navigasi Guru BK */}
      <div className="flex flex-wrap gap-2">
        {[
          {
            id: "hasil",
            label: "Hasil Refleksi & Jurnal Siswa",
            icon: <Users className="w-4 h-4" />,
          },
          {
            id: "konsul",
            label: `Permintaan Konsultasi (${newConsultCount} Baru)`,
            icon: <CalendarCheck className="w-4 h-4" />,
          },
          {
            id: "chat",
            label: `Live Chat Konseling (${state.chatMessages.length})`,
            icon: <MessageSquare className="w-4 h-4" />,
          },
          {
            id: "kode",
            label: "Kelola Kode Sekolah",
            icon: <KeyRound className="w-4 h-4" />,
          },
        ].map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id as CounselorTab)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                active
                  ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20"
                  : "bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>

      {/* ISI TAB 1: HASIL REFLEKSI & JURNAL SISWA */}
      {tab === "hasil" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Filter className="w-4 h-4 text-sky-400" />
              Filter Daftar Siswa
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value="">Semua Kelas (X, XI, XII)</option>
                <option value="X">Kelas X</option>
                <option value="XI">Kelas XI</option>
                <option value="XII">Kelas XII</option>
              </select>
              <select
                value={filterResult}
                onChange={(e) => setFilterResult(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              >
                <option value="">Semua Hasil Decision Tree</option>
                <option value="A">Hasil A · Lanjutkan secara Sadar</option>
                <option value="B">Hasil B · Tunda atau Sesuaikan</option>
                <option value="C">Hasil C · Ambil Jeda Refleksi</option>
              </select>
            </div>
          </div>

          {/* Modal / Panel Baca Jurnal yang Diizinkan Siswa */}
          {selectedJournalStudent && (
            <div className="p-5 rounded-2xl bg-sky-950/30 border border-sky-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                    Jurnal &ldquo;My Life, Their Highlight&rdquo; · Dibagikan atas Izin Siswa
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {selectedJournalStudent.nickname} (Kelas{" "}
                    {selectedJournalStudent.classLevel})
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedJournalStudent(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <strong className="text-sky-300 block mb-1">
                    1. Yang Dilihat di Media Sosial:
                  </strong>
                  <p className="text-slate-200 leading-relaxed">
                    {selectedJournalStudent.journal.seen || "-"}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <strong className="text-purple-300 block mb-1">
                    2. Perasaan yang Muncul:
                  </strong>
                  <p className="text-slate-200 leading-relaxed">
                    {selectedJournalStudent.journal.felt || "-"}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <strong className="text-emerald-300 block mb-1">
                    3. Hal yang Tidak Terlihat di Kamera:
                  </strong>
                  <p className="text-slate-200 leading-relaxed">
                    {selectedJournalStudent.journal.unseen || "-"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tabel Siswa */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                  <th className="py-3.5 px-4">Nama Siswa</th>
                  <th className="py-3.5 px-4">Kelas</th>
                  <th className="py-3.5 px-4">Hasil Decision Tree</th>
                  <th className="py-3.5 px-4">Jurnal Refleksi</th>
                  <th className="py-3.5 px-4">Tindak Lanjut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredStudents.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-950/40">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {stu.nickname}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      Kelas {stu.classLevel}
                    </td>
                    <td className="py-3.5 px-4">
                      {stu.resultCode ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              stu.resultCode === "A"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : stu.resultCode === "B"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-rose-500/20 text-rose-300"
                            }`}
                          >
                            Hasil {stu.resultCode}
                          </span>
                          <span className="text-xs text-slate-300">
                            {DECISION_OUTCOMES[stu.resultCode].title}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">
                          Belum mengisi
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {stu.journal.saved && stu.journal.sharedWithCounselor ? (
                        <button
                          onClick={() => setSelectedJournalStudent(stu)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 underline underline-offset-4"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Baca Jurnal
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          <Lock className="w-3 h-3" />
                          Tidak Dibagikan
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => {
                          setSelectedChatStudentId(stu.id);
                          setTab("chat");
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-sky-500/20 text-xs font-semibold text-sky-300 border border-slate-700 transition flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Hubungi Chat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Guru BK hanya dapat membaca jurnal yang secara eksplisit diizinkan oleh siswa. Tidak ada skor total, pelabelan psikologis, ataupun peringkat antarsiswa.
            </span>
          </div>
        </div>
      )}

      {/* ISI TAB 2: PERMINTAAN KONSULTASI */}
      {tab === "konsul" && (
        <div className="space-y-4">
          {state.consultations.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
              Belum ada permintaan konsultasi dari siswa.
            </div>
          ) : (
            state.consultations.map((req) => (
              <div
                key={req.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {req.studentNick} · Kelas {req.studentClass}
                    </h3>
                    <p className="text-xs text-sky-400 font-semibold">
                      Topik: {req.topic}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      req.status === "Baru"
                        ? "bg-amber-500/20 text-amber-300"
                        : req.status === "Dijadwalkan"
                        ? "bg-sky-500/20 text-sky-300"
                        : "bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    Status: {req.status}
                  </span>
                </div>

                {req.note ? (
                  <p className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-200 italic">
                    &ldquo;{req.note}&rdquo;
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">Tanpa catatan tambahan.</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Catatan/balasan Guru BK (misal: Ruang BK Selasa)..."
                    value={
                      replyNotes[req.id] !== undefined
                        ? replyNotes[req.id]
                        : req.counselorNote
                    }
                    onChange={(e) =>
                      setReplyNotes({ ...replyNotes, [req.id]: e.target.value })
                    }
                    className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Jadwal waktu (misal: Selasa, 10:15 WIB)"
                    value={
                      scheduleDates[req.id] !== undefined
                        ? scheduleDates[req.id]
                        : req.scheduledDate || ""
                    }
                    onChange={(e) =>
                      setScheduleDates({
                        ...scheduleDates,
                        [req.id]: e.target.value,
                      })
                    }
                    className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap gap-2">
                    {(["Baru", "Dijadwalkan", "Selesai"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdateConsultStatus(req.id, st)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                          req.status === st
                            ? "bg-sky-500 text-slate-950"
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        Set {st}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedChatStudentId(req.studentId);
                      setTab("chat");
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Buka Live Chat Siswa Ini
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ISI TAB 3: LIVE CHAT REALTIME GURU BK <-> SISWA */}
      {tab === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl min-h-[540px]">
          {/* Daftar Siswa di Sisi Kiri */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">
              Pilih Siswa untuk Konseling Chat
            </h3>
            <div className="space-y-1.5 max-h-[450px] overflow-y-auto">
              {state.students.map((stu) => {
                const count = state.chatMessages.filter(
                  (m) => m.studentId === stu.id
                ).length;
                const active = selectedChatStudentId === stu.id;
                return (
                  <button
                    key={stu.id}
                    onClick={() => setSelectedChatStudentId(stu.id)}
                    className={`w-full text-left p-3 rounded-2xl transition flex items-center justify-between ${
                      active
                        ? "bg-sky-600 text-white"
                        : "hover:bg-slate-900 text-slate-300"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm">
                        {stu.nickname} · Kelas {stu.classLevel}
                      </div>
                      <div
                        className={`text-[11px] ${
                          active ? "text-sky-100" : "text-slate-400"
                        }`}
                      >
                        {stu.resultCode
                          ? `Decision Tree: Hasil ${stu.resultCode}`
                          : "Belum mengisi tree"}
                      </div>
                    </div>
                    {count > 0 && (
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-slate-800 text-sky-300"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Jendela Percakapan di Sisi Kanan */}
          <div className="lg:col-span-8 flex flex-col h-[540px]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">
                  Percakapan Konseling: {selectedChatStudent?.nickname || "-"} (Kelas{" "}
                  {selectedChatStudent?.classLevel || "-"})
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedChatStudent?.resultCode
                    ? `Hasil Refleksi: Hasil ${selectedChatStudent.resultCode} (${
                        DECISION_OUTCOMES[selectedChatStudent.resultCode].title
                      })`
                    : "Siswa belum menyelesaikan Decision Tree"}
                </p>
              </div>
              {selectedChatStudent?.journal.saved &&
                selectedChatStudent.journal.sharedWithCounselor && (
                  <button
                    onClick={() => {
                      setSelectedJournalStudent(selectedChatStudent);
                      setTab("hasil");
                    }}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30"
                  >
                    Lihat Jurnal Siswa
                  </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/30">
              {currentStudentChats.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs p-6">
                  <Sparkles className="w-8 h-8 text-slate-600 mb-2" />
                  Belum ada pesan dengan {selectedChatStudent?.nickname}. Guru BK dapat menyapa siswa lebih dulu.
                </div>
              ) : (
                currentStudentChats.map((msg) => {
                  const isCounselor = msg.senderRole === "guru_bk";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isCounselor ? "items-end" : "items-start"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[11px] font-bold text-slate-400">
                          {msg.senderName}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(msg.createdAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          isCounselor
                            ? "bg-emerald-600 text-white rounded-br-none"
                            : "bg-slate-800 border border-slate-700 text-slate-100 rounded-bl-none"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <form
              onSubmit={handleSendCounselorChat}
              className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder={`Balas pesan ke ${selectedChatStudent?.nickname || "siswa"}...`}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={!chatMessage.trim()}
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-sm transition flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                Kirim
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ISI TAB 4: KELOLA KODE SEKOLAH */}
      {tab === "kode" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">
                Daftar Kode Akses Sekolah
              </h3>
              <p className="text-xs text-slate-400">
                Bagikan kode aktif ini kepada siswa kelas X–XII untuk masuk ke ruang refleksi.
              </p>
            </div>
            <button
              onClick={handleCreateSchoolCode}
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Buat Kode Sekolah Baru
            </button>
          </div>

          <div className="space-y-3">
            {state.schoolCodes.map((sc) => (
              <div
                key={sc.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-extrabold text-sky-300 tracking-wider">
                      {sc.code}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        sc.isActive
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      {sc.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {sc.schoolName} · {sc.note}
                  </p>
                </div>
                <button
                  onClick={() => handleToggleCode(sc.id)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  {sc.isActive ? "Nonaktifkan" : "Aktifkan Kembali"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
