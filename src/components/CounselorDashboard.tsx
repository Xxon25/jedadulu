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
    activeStaff &&
    (activeStaff.role === "guru_bk" || activeStaff.role === "admin");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr("");
    const res = await authenticateStaff(email, password);
    if (!res.ok) {
      setLoginErr(res.error || "Gagal masuk.");
      return;
    }
    onRefresh();
    showToast(`Selamat datang, ${res.staff?.fullName}`);
  };

  const handleLogout = () => {
    setActiveStaffSession(null);
    onRefresh();
    showToast("Telah keluar dari Ruang Konselor BK.");
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
    showToast(`Kode sekolah baru berhasil dibuat: ${newCode}`);
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
      <div className="max-w-md mx-auto my-8 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
            <Lock className="w-3.5 h-3.5" />
            Akses Terbatas Konselor Sekolah
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Masuk Ruang Guru BK
          </h2>
          <p className="text-sm text-slate-500">
            Gunakan akun konselor yang terdaftar untuk meninjau hasil refleksi siswa, mengelola jadwal konsultasi, dan membalas pesan siswa.
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
              Email Guru BK
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@sekolah.sch.id"
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
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-sm"
          >
            Masuk Workspace Guru BK
          </button>
        </form>
      </div>
    );
  }

  const totalStudents = state.students.length;
  const reflectedCount = state.students.filter((s) => s.resultCode).length;
  const newConsultCount = state.consultations.filter(
    (c) => c.status === "Baru"
  ).length;
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
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Layanan Bimbingan & Konseling · {activeStaff.schoolName}
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">
            {activeStaff.fullName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            NIP: {activeStaff.nip} · Pemantauan Refleksi Decision Tree, Jurnal Siswa, Jadwal Konsultasi, & Diskusi Konseling
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold border border-slate-200 transition flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Keluar Sesi
        </button>
      </div>

      {/* 4 Kartu Ringkasan Layanan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Siswa Terdaftar</span>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">
            {totalStudents}
          </div>
          <span className="text-[11px] text-indigo-600 font-semibold">
            Kelas X, XI, XII
          </span>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500">
            Selesai Decision Tree
          </span>
          <div className="text-3xl font-extrabold text-emerald-600 mt-1">
            {reflectedCount}
          </div>
          <span className="text-[11px] text-slate-500">
            Hasil A, B, atau C
          </span>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500">
            Jurnal Dibagikan
          </span>
          <div className="text-3xl font-extrabold text-indigo-600 mt-1">
            {sharedJournalCount}
          </div>
          <span className="text-[11px] text-slate-500">
            Atas persetujuan siswa
          </span>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500">
            Pengajuan Konsultasi Baru
          </span>
          <div className="text-3xl font-extrabold text-amber-600 mt-1">
            {newConsultCount}
          </div>
          <span className="text-[11px] text-slate-500">
            Menunggu penjadwalan
          </span>
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
            label: `Jadwal Konsultasi (${newConsultCount} Baru)`,
            icon: <CalendarCheck className="w-4 h-4" />,
          },
          {
            id: "chat",
            label: `Live Chat Konseling (${state.chatMessages.length})`,
            icon: <MessageSquare className="w-4 h-4" />,
          },
          {
            id: "kode",
            label: "Kode Akses Sekolah",
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

      {/* TAB 1: HASIL REFLEKSI & JURNAL SISWA */}
      {tab === "hasil" && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <Filter className="w-4 h-4 text-indigo-600" />
              Daftar Refleksi Siswa
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
              >
                <option value="">Semua Kelas (X, XI, XII)</option>
                <option value="X">Kelas X</option>
                <option value="XI">Kelas XI</option>
                <option value="XII">Kelas XII</option>
              </select>
              <select
                value={filterResult}
                onChange={(e) => setFilterResult(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
              >
                <option value="">Semua Hasil Decision Tree</option>
                <option value="A">Hasil A · Lanjutkan secara Sadar</option>
                <option value="B">Hasil B · Tunda atau Sesuaikan</option>
                <option value="C">Hasil C · Ambil Jeda Refleksi</option>
              </select>
            </div>
          </div>

          {selectedJournalStudent && (
            <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                    Jurnal &ldquo;My Life, Their Highlight&rdquo; · Dibagikan atas Persetujuan Siswa
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {selectedJournalStudent.nickname} (Kelas{" "}
                    {selectedJournalStudent.classLevel})
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedJournalStudent(null)}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <strong className="text-indigo-700 block mb-1">
                    1. Yang Dilihat di Media Sosial:
                  </strong>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedJournalStudent.journal.seen || "-"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <strong className="text-sky-700 block mb-1">
                    2. Perasaan yang Muncul:
                  </strong>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedJournalStudent.journal.felt || "-"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <strong className="text-emerald-700 block mb-1">
                    3. Hal yang Tidak Terlihat di Layar:
                  </strong>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedJournalStudent.journal.unseen || "-"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Nama Siswa</th>
                  <th className="py-3.5 px-4">Kelas</th>
                  <th className="py-3.5 px-4">Hasil Decision Tree</th>
                  <th className="py-3.5 px-4">Jurnal Refleksi</th>
                  <th className="py-3.5 px-4">Tindak Lanjut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredStudents.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {stu.nickname}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      Kelas {stu.classLevel}
                    </td>
                    <td className="py-3.5 px-4">
                      {stu.resultCode ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              stu.resultCode === "A"
                                ? "bg-emerald-100 text-emerald-800"
                                : stu.resultCode === "B"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            Hasil {stu.resultCode}
                          </span>
                          <span className="text-xs text-slate-700 font-medium">
                            {DECISION_OUTCOMES[stu.resultCode].title}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Belum mengisi
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {stu.journal.saved && stu.journal.sharedWithCounselor ? (
                        <button
                          onClick={() => setSelectedJournalStudent(stu)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-4"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Baca Jurnal
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          <Lock className="w-3 h-3" />
                          Privat
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => {
                          setSelectedChatStudentId(stu.id);
                          setTab("chat");
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-xs font-bold text-indigo-700 border border-indigo-200 transition flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Diskusi Chat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Guru BK hanya dapat membaca jurnal yang diizinkan oleh siswa. Tidak ada skor total, pelabelan psikologis, ataupun peringkat antarsiswa.
            </span>
          </div>
        </div>
      )}

      {/* TAB 2: PERMINTAAN KONSULTASI */}
      {tab === "konsul" && (
        <div className="space-y-4">
          {state.consultations.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 text-center text-slate-500">
              Belum ada pengajuan jadwal konsultasi dari siswa.
            </div>
          ) : (
            state.consultations.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {req.studentNick} · Kelas {req.studentClass}
                    </h3>
                    <p className="text-xs text-indigo-600 font-bold">
                      Topik: {req.topic}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      req.status === "Baru"
                        ? "bg-amber-100 text-amber-800"
                        : req.status === "Dijadwalkan"
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    Status: {req.status}
                  </span>
                </div>

                {req.note ? (
                  <p className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-700 italic">
                    &ldquo;{req.note}&rdquo;
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">Tanpa catatan pengantar.</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Tanggapan Guru BK (misal: Ruang BK hari Selasa)..."
                    value={
                      replyNotes[req.id] !== undefined
                        ? replyNotes[req.id]
                        : req.counselorNote
                    }
                    onChange={(e) =>
                      setReplyNotes({ ...replyNotes, [req.id]: e.target.value })
                    }
                    className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="Waktu terjadwal (misal: Selasa, 10:15 WIB)"
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
                    className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
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
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        Tandai {st}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedChatStudentId(req.studentId);
                      setTab("chat");
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Hubungi Siswa via Chat
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: LIVE CHAT GURU BK */}
      {tab === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm min-h-[540px]">
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50 p-4 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 px-2">
              Daftar Siswa
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
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "hover:bg-white text-slate-700"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm">
                        {stu.nickname} · Kelas {stu.classLevel}
                      </div>
                      <div
                        className={`text-[11px] ${
                          active ? "text-indigo-100" : "text-slate-500"
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
                            : "bg-indigo-50 text-indigo-700"
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

          <div className="lg:col-span-8 flex flex-col h-[540px]">
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Ruang Konseling: {selectedChatStudent?.nickname || "-"} (Kelas{" "}
                  {selectedChatStudent?.classLevel || "-"})
                </h3>
                <p className="text-xs text-slate-500">
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
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200"
                  >
                    Baca Jurnal Siswa
                  </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {currentStudentChats.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs p-6">
                  <Sparkles className="w-8 h-8 text-slate-300 mb-2" />
                  Belum ada riwayat percakapan dengan{" "}
                  {selectedChatStudent?.nickname}.
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
                        <span className="text-[11px] font-bold text-slate-500">
                          {msg.senderName}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(msg.createdAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                          isCounselor
                            ? "bg-indigo-600 text-white rounded-br-none"
                            : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
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
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder={`Kirim tanggapan konseling ke ${
                  selectedChatStudent?.nickname || "siswa"
                }...`}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-indigo-600"
              />
              <button
                type="submit"
                disabled={!chatMessage.trim()}
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-sm transition flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                Kirim
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: KELOLA KODE SEKOLAH */}
      {tab === "kode" && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Kode Akses Sekolah
              </h3>
              <p className="text-xs text-slate-500">
                Berikan kode aktif ini kepada siswa di kelas bimbinganmu untuk mengakses ruang refleksi.
              </p>
            </div>
            <button
              onClick={handleCreateSchoolCode}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Buat Kode Baru
            </button>
          </div>

          <div className="space-y-3">
            {state.schoolCodes.map((sc) => (
              <div
                key={sc.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-extrabold text-indigo-700 tracking-wider">
                      {sc.code}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        sc.isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {sc.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {sc.schoolName} · {sc.note}
                  </p>
                </div>
                <button
                  onClick={() => handleToggleCode(sc.id)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
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
