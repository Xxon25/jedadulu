"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  GitBranch,
  BookOpen,
  CalendarCheck,
  MessageCircle,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  Trash2,
  Save,
  Send,
  UserCheck,
  LogOut,
  HeartHandshake,
  Clock,
  Info,
} from "lucide-react";
import {
  PlatformState,
  StudentRecord,
  registerOrLoginStudent,
  submitDecisionTreeResult,
  saveStudentJournal,
  deleteStudentJournal,
  createConsultationRequest,
  sendLiveChatMessage,
  setActiveStudentId,
} from "@/lib/store";
import { DECISION_OUTCOMES, CONSULTATION_TOPICS } from "@/lib/bk-data";

interface StudentPortalProps {
  state: PlatformState;
  activeStudent: StudentRecord | null;
  onRefresh: () => void;
  showToast: (msg: string) => void;
}

type StudentTab = "beranda" | "tree" | "jurnal" | "konsul" | "chat" | "cetak";

export default function StudentPortal({
  state,
  activeStudent,
  onRefresh,
  showToast,
}: StudentPortalProps) {
  const [tab, setTab] = useState<StudentTab>("beranda");

  // Form Identitas & Persetujuan (Tanpa kode sekolah)
  const [nick, setNick] = useState("");
  const [cls, setCls] = useState<"X" | "XI" | "XII" | "">("");
  const [agree, setAgree] = useState(false);

  // Form Decision Tree
  const [sitIdx, setSitIdx] = useState<number>(-1);
  const [answers, setAnswers] = useState<number[]>([-1, -1, -1, -1]);
  const [showTreeForm, setShowTreeForm] = useState<boolean>(false);

  // Form Jurnal Refleksi
  const [jSeen, setJSeen] = useState("");
  const [jFelt, setJFelt] = useState("");
  const [jUnseen, setJUnseen] = useState("");
  const [jShare, setJShare] = useState(false);

  // Form Permintaan Konsultasi
  const [cTopic, setCTopic] = useState("");
  const [cNote, setCNote] = useState("");
  const [cAgree, setCAgree] = useState(false);

  // Form Live Chat
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeStudent) {
      setSitIdx(activeStudent.situationIdx);
      setAnswers(
        Array.isArray(activeStudent.answers) && activeStudent.answers.length === 4
          ? activeStudent.answers
          : [-1, -1, -1, -1]
      );
      setShowTreeForm(!activeStudent.resultCode);
      setJSeen(activeStudent.journal.seen || "");
      setJFelt(activeStudent.journal.felt || "");
      setJUnseen(activeStudent.journal.unseen || "");
      setJShare(Boolean(activeStudent.journal.sharedWithCounselor));
    } else {
      try {
        const draft = localStorage.getItem("jedadulu_journal_draft");
        if (draft) {
          const parsed = JSON.parse(draft);
          setJSeen(parsed.seen || "");
          setJFelt(parsed.felt || "");
          setJUnseen(parsed.unseen || "");
        }
      } catch {
        // abaikan
      }
    }
  }, [activeStudent]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "jedadulu_journal_draft",
        JSON.stringify({ seen: jSeen, felt: jFelt, unseen: jUnseen })
      );
    } catch {
      // abaikan
    }
  }, [jSeen, jFelt, jUnseen]);

  useEffect(() => {
    if (tab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [tab, state.chatMessages.length]);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cls) {
      showToast("Pilih jenjang kelas X, XI, atau XII terlebih dahulu.");
      return;
    }
    const res = await registerOrLoginStudent(nick, cls, "JEDA-01", agree);
    if (!res.ok) {
      showToast(res.error || "Gagal masuk.");
      return;
    }
    onRefresh();
    showToast(`Selamat datang, ${res.student?.nickname}!`);
  };

  const handleStudentLogout = () => {
    setActiveStudentId(null);
    onRefresh();
    setTab("beranda");
    showToast("Kamu telah keluar dari sesi siswa.");
  };

  const handleSubmitTree = async () => {
    if (!activeStudent) {
      showToast("Silakan lengkapi nama dan kode sekolah di Beranda terlebih dahulu.");
      setTab("beranda");
      return;
    }
    const res = await submitDecisionTreeResult(activeStudent.id, sitIdx, answers);
    if (!res.ok) {
      showToast(res.error || "Lengkapi seluruh pertanyaan terlebih dahulu.");
      return;
    }
    setShowTreeForm(false);
    onRefresh();
    showToast(`Refleksi selesai: Hasil ${res.resultCode}`);
  };

  const handleSaveJournal = async () => {
    if (!activeStudent) {
      showToast("Silakan lengkapi identitas siswa di Beranda terlebih dahulu.");
      setTab("beranda");
      return;
    }
    const res = await saveStudentJournal(
      activeStudent.id,
      jSeen,
      jFelt,
      jUnseen,
      jShare
    );
    if (!res.ok) {
      showToast(res.error || "Gagal menyimpan jurnal.");
      return;
    }
    onRefresh();
    showToast(
      jShare
        ? "Jurnal disimpan & diizinkan untuk dibaca Guru BK."
        : "Jurnal disimpan secara privat di perangkatmu."
    );
  };

  const handleDeleteJournal = async () => {
    if (!activeStudent) return;
    await deleteStudentJournal(activeStudent.id);
    setJSeen("");
    setJFelt("");
    setJUnseen("");
    setJShare(false);
    localStorage.removeItem("jedadulu_journal_draft");
    onRefresh();
    showToast("Catatan jurnal telah dihapus.");
  };

  const handleCreateConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) {
      showToast("Silakan masuk sebagai siswa terlebih dahulu.");
      setTab("beranda");
      return;
    }
    const res = await createConsultationRequest(
      activeStudent.id,
      cTopic,
      cNote,
      cAgree
    );
    if (!res.ok) {
      showToast(res.error || "Gagal membuat permintaan konsultasi.");
      return;
    }
    setCTopic("");
    setCNote("");
    setCAgree(false);
    onRefresh();
    showToast("Permintaan jadwal konsultasi berhasil dikirim ke Guru BK.");
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) {
      showToast("Masuk sebagai siswa terlebih dahulu untuk mengirim pesan.");
      return;
    }
    const res = await sendLiveChatMessage(
      activeStudent.id,
      "siswa",
      activeStudent.nickname,
      chatInput
    );
    if (!res.ok) {
      showToast(res.error || "Gagal mengirim pesan.");
      return;
    }
    setChatInput("");
    onRefresh();
  };

  const studentConsultations = activeStudent
    ? state.consultations.filter((c) => c.studentId === activeStudent.id)
    : [];

  const studentChats = activeStudent
    ? state.chatMessages.filter((m) => m.studentId === activeStudent.id)
    : [];

  const navItems: {
    id: StudentTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    { id: "beranda", label: "Ringkasan & Profil", icon: <Sparkles className="w-4 h-4" /> },
    {
      id: "tree",
      label: "Decision Tree",
      icon: <GitBranch className="w-4 h-4" />,
      badge: activeStudent?.resultCode ? `Hasil ${activeStudent.resultCode}` : undefined,
    },
    {
      id: "jurnal",
      label: "Jurnal Refleksi",
      icon: <BookOpen className="w-4 h-4" />,
      badge: activeStudent?.journal.saved ? "Tersimpan" : undefined,
    },
    {
      id: "konsul",
      label: "Jadwal Konsultasi",
      icon: <CalendarCheck className="w-4 h-4" />,
      badge:
        studentConsultations.length > 0 ? `${studentConsultations.length}` : undefined,
    },
    {
      id: "chat",
      label: "Live Chat Guru BK",
      icon: <MessageCircle className="w-4 h-4" />,
    },
    {
      id: "cetak",
      label: "Lembar Cetak (PDF)",
      icon: <Printer className="w-4 h-4" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Sidebar Navigasi Siswa */}
      <aside className="lg:col-span-3 space-y-5 print:hidden">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                Siswa Aktif
              </span>
              <h2 className="text-base font-extrabold text-slate-900 mt-0.5">
                {activeStudent
                  ? `${activeStudent.nickname} · Kelas ${activeStudent.classLevel}`
                  : "Belum Terdaftar"}
              </h2>
            </div>
            {activeStudent && (
              <button
                onClick={handleStudentLogout}
                title="Keluar Sesi"
                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          <nav className="space-y-1.5" aria-label="Menu Ruang Siswa">
            {navItems.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {item.icon}
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Kartu Tahapan Refleksi */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Tahapan Refleksi
          </h3>
          <ul className="space-y-2 text-xs">
            {[
              { label: "1. Persetujuan & Profil", done: Boolean(activeStudent) },
              {
                label: "2. Decision Tree (4 Pertanyaan)",
                done: Boolean(activeStudent?.resultCode),
              },
              {
                label: "3. Jurnal 'My Life, Their Highlight'",
                done: Boolean(activeStudent?.journal.saved),
              },
              {
                label: "4. Konsultasi / Diskusi Guru BK",
                done: studentConsultations.length > 0 || studentChats.length > 0,
              },
            ].map((step, i) => (
              <li
                key={i}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${
                  step.done
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                    : "bg-slate-50 border-slate-200/70 text-slate-500"
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 ${
                    step.done ? "text-emerald-600" : "text-slate-300"
                  }`}
                />
                <span className="font-semibold">{step.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Jaminan Etika BK */}
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-3xl p-5 text-xs text-slate-600 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-indigo-950">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Ruang Aman & Privat
          </div>
          <p className="leading-relaxed">
            Layanan ini memberikan <b>saran refleksi non-diagnostik</b>, tanpa skor dan tanpa pelabelan psikologis.
          </p>
        </div>
      </aside>

      {/* Area Konten Utama */}
      <section className="lg:col-span-9 space-y-6">
        {/* TAB 1: BERANDA & IDENTITAS */}
        {tab === "beranda" && (
          <div className="space-y-6">
            {/* Banner Sambutan */}
            <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white p-7 sm:p-9 shadow-lg">
              <div className="max-w-2xl space-y-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-sky-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Layanan Bimbingan & Konseling · Refleksi Mandiri
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  FOMO atau{" "}
                  <span className="text-sky-300">Emang Aku Mau?</span>
                </h1>
                <p className="text-indigo-100/90 text-sm sm:text-base leading-relaxed">
                  Ambil jeda sejenak sebelum mengikuti tren, membeli barang yang sedang ramai dibicarakan, atau terus memantau unggahan orang lain. Kenali kebutuhanmu dan putuskan dengan tenang.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => setTab("tree")}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-indigo-50 text-indigo-950 font-bold text-sm transition shadow-sm"
                  >
                    Mulai Decision Tree
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTab("jurnal")}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/15 transition"
                  >
                    <BookOpen className="w-4 h-4 text-sky-300" />
                    Tulis Jurnal Refleksi
                  </button>
                  <button
                    onClick={() => setTab("chat")}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-semibold text-sm border border-emerald-400/30 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Hubungi Guru BK
                  </button>
                </div>
              </div>
            </div>

            {!activeStudent ? (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Langkah Awal · Persetujuan & Identitas Singkat
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    Mulai Sesi Refleksimu
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Cukup isi nama panggilan dan pilih kelasmu untuk memulai ruang refleksi.
                  </p>
                </div>

                <form onSubmit={handleStudentLogin} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                        Nama Panggilan / Lengkap
                      </label>
                      <input
                        type="text"
                        required
                        value={nick}
                        onChange={(e) => setNick(e.target.value)}
                        placeholder="Masukkan namamu"
                        maxLength={40}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                      />
                    </div>
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
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                      >
                        <option value="">Pilih Kelas</option>
                        <option value="X">Kelas X</option>
                        <option value="XI">Kelas XI</option>
                        <option value="XII">Kelas XII</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-50/70 border-l-4 border-indigo-600 text-xs text-slate-700 space-y-1.5 leading-relaxed">
                    <p>
                      <strong className="text-slate-900">Data yang dicatat:</strong> Nama panggilan, kelas, hasil refleksi decision tree, jurnal (hanya apabila kamu memilih untuk membagikannya), serta permintaan konsultasi.
                    </p>
                    <p>
                      <strong className="text-slate-900">Akses & Kerahasiaan:</strong> Hanya Guru BK yang berwenang di sekolahmu yang dapat meninjau tindak lanjut layanan. Guru mata pelajaran tidak memiliki akses.
                    </p>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      className="mt-0.5 w-5 h-5 rounded accent-indigo-600"
                    />
                    <span className="text-sm text-slate-700 font-medium">
                      Saya telah membaca penjelasan privasi di atas dan setuju menggunakan ruang refleksi ini.
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    Setuju & Mulai Refleksi
                  </button>
                </form>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setTab("tree")}
                  className="text-left p-6 rounded-3xl bg-white hover:border-indigo-300 border border-slate-200/90 shadow-sm transition group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
                      <GitBranch className="w-5 h-5" />
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        activeStudent.resultCode
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {activeStudent.resultCode
                        ? `Hasil ${activeStudent.resultCode}`
                        : "Belum Mengisi"}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition">
                    Decision Tree FOMO
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {activeStudent.resultCode
                      ? DECISION_OUTCOMES[activeStudent.resultCode].title
                      : "Jawab 4 pertanyaan berjenjang untuk menimbang doronganmu."}
                  </p>
                </button>

                <button
                  onClick={() => setTab("jurnal")}
                  className="text-left p-6 rounded-3xl bg-white hover:border-indigo-300 border border-slate-200/90 shadow-sm transition group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2.5 rounded-2xl bg-sky-50 text-sky-600">
                      <BookOpen className="w-5 h-5" />
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        activeStudent.journal.saved
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {activeStudent.journal.saved
                        ? activeStudent.journal.sharedWithCounselor
                          ? "Dibagikan ke BK"
                          : "Tersimpan Privat"
                        : "Belum Ditulis"}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 group-hover:text-sky-600 transition">
                    Jurnal &ldquo;My Life, Their Highlight&rdquo;
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Kelola perbandingan sosial dengan membedakan apa yang tampak di layar dan kenyataan.
                  </p>
                </button>

                <button
                  onClick={() => setTab("chat")}
                  className="text-left p-6 rounded-3xl bg-white hover:border-indigo-300 border border-slate-200/90 shadow-sm transition group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
                      <MessageCircle className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                      {studentChats.length} Pesan
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 group-hover:text-emerald-600 transition">
                    Live Chat & Konsultasi BK
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Diskusi langsung secara privat dengan Guru BK atau jadwalkan sesi tatap muka.
                  </p>
                </button>
              </div>
            )}

            {/* Pengingat Jeda & Muhasabah */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 text-center space-y-2 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                Jeda Reflektif · Muhasabah & Qana&apos;ah
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Tarik napas dalam... hembuskan perlahan.
              </h3>
              <p className="text-sm text-slate-600 max-w-xl mx-auto">
                &ldquo;Apakah keinginan ini sungguh berangkat dari kebutuhanku, atau hanya karena aku khawatir tertinggal dari apa yang dilakukan orang lain?&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: DECISION TREE */}
        {tab === "tree" && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-5">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Decision Tree Interaktif · 4 Pertanyaan Reflektif
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                FOMO atau Emang Aku Mau?
              </h2>
              <p className="text-sm text-slate-500">
                Pilih jawaban yang paling menggambarkan keadaanmu saat ini. Tidak ada skor maupun penilaian benar/salah.
              </p>
            </div>

            {!showTreeForm && activeStudent?.resultCode ? (
              <div className="space-y-6">
                {(() => {
                  const res = DECISION_OUTCOMES[activeStudent.resultCode];
                  const colorStyles =
                    res.code === "A"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                      : res.code === "B"
                      ? "bg-amber-50 border-amber-200 text-amber-950"
                      : "bg-rose-50 border-rose-200 text-rose-950";
                  const badgeStyle =
                    res.code === "A"
                      ? "bg-emerald-600 text-white"
                      : res.code === "B"
                      ? "bg-amber-600 text-white"
                      : "bg-rose-600 text-white";
                  return (
                    <div className={`p-6 rounded-3xl border-2 ${colorStyles} space-y-3`}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={`text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${badgeStyle}`}
                        >
                          {res.badge}
                        </span>
                        <span className="text-xs font-semibold opacity-75">
                          Situasi:{" "}
                          {state.customSituations[activeStudent.situationIdx] || "-"}
                        </span>
                      </div>
                      <h3 className="text-2xl font-extrabold">{res.title}</h3>
                      <p className="text-sm sm:text-base leading-relaxed opacity-90">
                        {res.text}
                      </p>
                    </div>
                  );
                })()}

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    Langkah Kecil yang Bisa Kamu Coba Sekarang:
                  </h4>
                  <ul className="list-disc list-inside text-sm text-slate-700 space-y-1.5">
                    {DECISION_OUTCOMES[activeStudent.resultCode].tips.map(
                      (tip, idx) => (
                        <li key={idx}>{tip}</li>
                      )
                    )}
                  </ul>
                  <div className="pt-3 border-t border-slate-200 text-xs text-indigo-700 font-medium italic">
                    {DECISION_OUTCOMES[activeStudent.resultCode].muhasabah}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  <b>Catatan Layanan BK:</b> Hasil di atas merupakan saran refleksi mandiri berdasarkan alur jawabanmu, <b>bukan diagnosis psikologis</b> dan bukan pelabelan diri.
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setTab("jurnal")}
                    className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Tulis Refleksi di Jurnal
                  </button>
                  <button
                    onClick={() => setTab("chat")}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Bicarakan dengan Guru BK
                  </button>
                  <button
                    onClick={() => {
                      setSitIdx(-1);
                      setAnswers([-1, -1, -1, -1]);
                      setShowTreeForm(true);
                    }}
                    className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Ulangi dengan Situasi Lain
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Pilihan Situasi */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
                  <label className="block text-sm font-extrabold text-slate-900">
                    Langkah Awal: Pilih situasi media sosial yang sedang kamu hadapi
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {state.customSituations.map((sit, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSitIdx(idx)}
                        className={`text-left p-3.5 rounded-xl border text-sm font-semibold transition ${
                          sitIdx === idx
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-700 hover:border-indigo-300"
                        }`}
                      >
                        {sit}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4 Pertanyaan Berjenjang */}
                <div className="space-y-4">
                  {state.customQuestions.map((q, qIndex) => (
                    <div
                      key={q.id}
                      className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Pertanyaan {q.code} (Langkah {qIndex + 1} dari 4)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {q.theoryBasis}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        {q.question}
                      </h3>
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const selected = answers[qIndex] === optIdx;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => {
                                const next = [...answers];
                                next[qIndex] = optIdx;
                                setAnswers(next);
                              }}
                              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition flex items-center justify-between ${
                                selected
                                  ? "bg-indigo-600 border-indigo-600 text-white font-bold shadow-sm"
                                  : "bg-white border-slate-200 text-slate-700 hover:border-indigo-300"
                              }`}
                            >
                              <span>{opt}</span>
                              {selected && (
                                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <p className="text-xs text-slate-500">
                    Pastikan situasi dan keempat pertanyaan telah dipilih sebelum melihat hasil.
                  </p>
                  <button
                    type="button"
                    onClick={handleSubmitTree}
                    className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition flex items-center gap-2 shadow-md shadow-indigo-600/20"
                  >
                    Lihat Hasil Refleksi
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: JURNAL REFLEKSI */}
        {tab === "jurnal" && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-5">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Jurnal Refleksi Perbandingan Sosial (Septianto et al., 2025)
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                My Life, Their Highlight
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Unggahan orang lain di media sosial umumnya hanya menampilkan sisi terbaik hidup mereka. Mari beri ruang yang jujur untuk ceritamu sendiri.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  1. Hal apa yang baru saja kamu lihat atau temui di media sosial?
                </label>
                <textarea
                  rows={3}
                  value={jSeen}
                  onChange={(e) => setJSeen(e.target.value)}
                  placeholder="Contoh: Teman-teman mengunggah keseruan acara atau membeli barang yang sedang ramai..."
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  2. Apa yang kamu rasakan setelah melihat unggahan tersebut?
                </label>
                <textarea
                  rows={3}
                  value={jFelt}
                  onChange={(e) => setJFelt(e.target.value)}
                  placeholder="Tuliskan perasaanmu dengan jujur tanpa perlu menghakimi diri sendiri..."
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  3. Bagian apa dari cerita mereka yang mungkin TIDAK tampak di balik unggahan itu?
                </label>
                <textarea
                  rows={3}
                  value={jUnseen}
                  onChange={(e) => setJUnseen(e.target.value)}
                  placeholder="Contoh: Usaha panjang, biaya yang harus ditabung, atau kesulitan yang tidak ditampilkan di layar..."
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={jShare}
                    onChange={(e) => setJShare(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded accent-indigo-600"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      Izinkan Guru BK membaca jurnal ini
                    </span>
                    <span className="text-xs text-slate-500">
                      Apabila tidak dicentang, catatan jurnal ini hanya tersimpan untuk dirimu sendiri dan terkunci di ruang Guru BK.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleSaveJournal}
                    className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Jurnal Refleksi
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteJournal}
                    className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-sm border border-slate-200 transition flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus Jurnal
                  </button>
                </div>
                <span className="text-xs text-slate-500">
                  ✓ Draf tersimpan otomatis di perangkat ini
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="font-bold block text-sm">
                  Merasa Tidak Aman atau Membutuhkan Bantuan Segera?
                </strong>
                <p className="leading-relaxed">
                  Sistem tidak memindai isi jurnal secara otomatis. Jika kamu merasa tidak aman atau mengalami tekanan berat, segera hubungi Guru BK secara langsung atau orang dewasa tepercaya di sekitarmu.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PERMINTAAN KONSULTASI BK */}
        {tab === "konsul" && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-5">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Layanan Responsif BK · Pengajuan Konseling
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                  Jadwalkan Sesi Konsultasi dengan Guru BK
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Pilih topik yang ingin kamu bicarakan agar Guru BK dapat menyiapkan waktu layanan yang sesuai.
                </p>
              </div>

              <form onSubmit={handleCreateConsult} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    Topik Pembicaraan
                  </label>
                  <select
                    value={cTopic}
                    onChange={(e) => setCTopic(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  >
                    <option value="">-- Pilih Topik Konsultasi --</option>
                    {CONSULTATION_TOPICS.map((t, i) => (
                      <option key={i} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    Ringkasan Singkat (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    value={cNote}
                    onChange={(e) => setCNote(e.target.value)}
                    placeholder="Tuliskan hal yang ingin kamu sampaikan terlebih dahulu kepada Guru BK..."
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={cAgree}
                    onChange={(e) => setCAgree(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded accent-indigo-600"
                  />
                  <span className="text-sm text-slate-700">
                    Saya setuju mengirimkan permintaan konsultasi ini kepada Guru BK di sekolah saya.
                  </span>
                </label>

                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition flex items-center gap-2"
                >
                  <CalendarCheck className="w-4 h-4" />
                  Kirim Permintaan Konsultasi
                </button>
              </form>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-extrabold text-slate-900">
                Riwayat Pengajuan Konsultasimu ({studentConsultations.length})
              </h3>
              {studentConsultations.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Belum ada permintaan jadwal konsultasi yang dikirim.
                </p>
              ) : (
                <div className="space-y-3">
                  {studentConsultations.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {req.topic}
                          </span>
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              req.status === "Baru"
                                ? "bg-amber-100 text-amber-800"
                                : req.status === "Dijadwalkan"
                                ? "bg-indigo-100 text-indigo-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        {req.note && (
                          <p className="text-xs text-slate-600">
                            Catatanmu: &ldquo;{req.note}&rdquo;
                          </p>
                        )}
                        {req.counselorNote && (
                          <p className="text-xs text-indigo-900 bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-200 mt-2">
                            <b>Tanggapan Guru BK:</b> {req.counselorNote}{" "}
                            {req.scheduledDate ? `(${req.scheduledDate})` : ""}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setTab("chat")}
                        className="shrink-0 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-indigo-600 transition flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Buka Diskusi
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: LIVE CHAT KONSELING BK */}
        {tab === "chat" && (
          <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[560px]">
            <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-white text-sm sm:text-base">
                      Ruang Diskusi & Live Chat Guru BK
                    </h2>
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Aktif
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Percakapan bersifat rahasia antara kamu dan Guru BK sekolahmu
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50">
              {!activeStudent ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <MessageCircle className="w-10 h-10 text-slate-400" />
                  <h3 className="font-extrabold text-slate-900">
                    Lengkapi Identitas Singkat untuk Memulai Chat
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md">
                    Silakan isi nama panggilan dan kode sekolah di tab Ringkasan & Profil terlebih dahulu agar Guru BK dapat mengenali dan membalas pesanmu.
                  </p>
                  <button
                    onClick={() => setTab("beranda")}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                  >
                    Lengkapi Profil Sekarang
                  </button>
                </div>
              ) : studentChats.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <MessageCircle className="w-10 h-10 text-indigo-400" />
                  <p className="text-sm font-bold text-slate-900">
                    Mulai Percakapan dengan Guru BK
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Kamu dapat menyapa Guru BK dan menceritakan hasil refleksi Decision Tree-mu atau hal yang sedang membuatmu ragu.
                  </p>
                </div>
              ) : (
                studentChats.map((msg) => {
                  const isMe = msg.senderRole === "siswa";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isMe ? "items-end" : "items-start"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[11px] font-bold text-slate-500">
                          {isMe ? `${msg.senderName} (Kamu)` : msg.senderName}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(msg.createdAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div
                        className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                          isMe
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
              onSubmit={handleSendChat}
              className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2.5"
            >
              <input
                type="text"
                disabled={!activeStudent}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={
                  activeStudent
                    ? "Tulis pesan untuk Guru BK..."
                    : "Lengkapi profil siswa terlebih dahulu..."
                }
                className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-indigo-600 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!activeStudent || !chatInput.trim()}
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-sm transition flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Kirim</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 6: VERSI CETAK ALUR */}
        {tab === "cetak" && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Aksesibilitas & Kesetaraan Akses (UNESCO, 2023)
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                  Lembar Cetak Alur Decision Tree & Jurnal Refleksi
                </h2>
                <p className="text-sm text-slate-500">
                  Dapat dicetak atau disimpan sebagai PDF bagi siswa yang memiliki keterbatasan akses internet.
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition flex items-center gap-2 print:hidden"
              >
                <Printer className="w-4 h-4" />
                Cetak / Simpan PDF
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="font-extrabold text-slate-900 mb-3">
                  A. 4 Pertanyaan Pemandu Decision Tree &ldquo;FOMO atau Emang Aku Mau?&rdquo;
                </h3>
                <ol className="list-decimal list-inside space-y-2.5 text-slate-700">
                  {state.customQuestions.map((q) => (
                    <li key={q.id}>
                      <b className="text-slate-900">{q.question}</b>
                      <div className="pl-5 text-xs text-slate-500 mt-0.5">
                        Pilihan: (a) {q.options[0]} · (b) {q.options[1]} · (c){" "}
                        {q.options[2]}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(["A", "B", "C"] as const).map((k) => (
                  <div
                    key={k}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5"
                  >
                    <span className="text-xs font-bold text-indigo-600">
                      {DECISION_OUTCOMES[k].badge}
                    </span>
                    <h4 className="font-bold text-slate-900">
                      {DECISION_OUTCOMES[k].title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {DECISION_OUTCOMES[k].text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-extrabold text-slate-900">
                  B. Panduan Jurnal Refleksi Mandiri &ldquo;My Life, Their Highlight&rdquo;
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  1. Hal apa yang baru saja kamu lihat atau temui di media sosial? <br />
                  2. Apa yang kamu rasakan setelah melihat unggahan tersebut? <br />
                  3. Bagian apa dari kehidupan mereka yang mungkin tidak tampak di layar?
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
                <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  jedadulu.id · Program Studi Bimbingan dan Konseling Pendidikan Islam, UIN Raden Intan Lampung (2026).
                </span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
