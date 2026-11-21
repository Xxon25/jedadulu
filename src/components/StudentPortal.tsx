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
import {
  DECISION_OUTCOMES,
  CONSULTATION_TOPICS,
} from "@/lib/bk-data";

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

  // Form Identitas & Persetujuan
  const [nick, setNick] = useState("");
  const [cls, setCls] = useState<"X" | "XI" | "XII" | "">("");
  const [code, setCode] = useState("");
  const [agree, setAgree] = useState(false);

  // Form Decision Tree
  const [sitIdx, setSitIdx] = useState<number>(-1);
  const [answers, setAnswers] = useState<number[]>([-1, -1, -1, -1]);
  const [showTreeForm, setShowTreeForm] = useState<boolean>(false);

  // Form Jurnal Refleksi (dengan auto-save draft lokal)
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

  // Sinkronisasi state form saat siswa aktif berubah
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
      // Load draft lokal jika belum login
      try {
        const draft = localStorage.getItem("jedadulu_journal_draft");
        if (draft) {
          const parsed = JSON.parse(draft);
          setJSeen(parsed.seen || "");
          setJFelt(parsed.felt || "");
          setJUnseen(parsed.unseen || "");
        }
      } catch {
        // abaikan error localStorage
      }
    }
  }, [activeStudent]);

  // Auto-save draft jurnal di perangkat
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
      showToast("Pilih kelas X, XI, atau XII terlebih dahulu.");
      return;
    }
    const res = await registerOrLoginStudent(nick, cls, code, agree);
    if (!res.ok) {
      showToast(res.error || "Gagal masuk.");
      return;
    }
    onRefresh();
    showToast(`Selamat datang, ${res.student?.nickname}!`);
  };

  const handleFillDemoIdentity = () => {
    setNick("Rani");
    setCls("XI");
    setCode("JEDA-01");
    setAgree(true);
    showToast("Data contoh siswa (Rani · Kelas XI) telah diisi.");
  };

  const handleStudentLogout = () => {
    setActiveStudentId(null);
    onRefresh();
    setTab("beranda");
    showToast("Kamu telah keluar dari sesi siswa.");
  };

  const handleFillDemoTree = () => {
    setSitIdx(2);
    setAnswers([1, 2, 1, 1]);
    showToast("Jawaban contoh telah diisi. Klik 'Lihat Hasil Refleksi'.");
  };

  const handleSubmitTree = async () => {
    if (!activeStudent) {
      showToast("Silakan isi identitas & persetujuan di Beranda terlebih dahulu.");
      setTab("beranda");
      return;
    }
    const res = await submitDecisionTreeResult(activeStudent.id, sitIdx, answers);
    if (!res.ok) {
      showToast(res.error || "Lengkapi seluruh pertanyaan.");
      return;
    }
    setShowTreeForm(false);
    onRefresh();
    showToast(`Refleksi selesai: Hasil ${res.resultCode}`);
  };

  const handleSaveJournal = async () => {
    if (!activeStudent) {
      showToast("Silakan isi identitas & persetujuan terlebih dahulu.");
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
        : "Jurnal disimpan secara privat hanya untukmu."
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
    showToast("Jurnal berhasil dihapus.");
  };

  const handleCreateConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) {
      showToast("Masuk sebagai siswa terlebih dahulu.");
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
    showToast("Permintaan konsultasi berhasil dikirim ke Guru BK!");
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) {
      showToast("Masuk sebagai siswa terlebih dahulu untuk memulai Live Chat.");
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

  const navItems: { id: StudentTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "beranda", label: "Beranda", icon: <Sparkles className="w-4 h-4" /> },
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
      label: "Konsultasi BK",
      icon: <CalendarCheck className="w-4 h-4" />,
      badge: studentConsultations.length > 0 ? `${studentConsultations.length}` : undefined,
    },
    {
      id: "chat",
      label: "Live Chat BK",
      icon: <MessageCircle className="w-4 h-4" />,
      badge: "Realtime",
    },
    {
      id: "cetak",
      label: "Versi Cetak Alur",
      icon: <Printer className="w-4 h-4" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Sidebar Navigasi Siswa */}
      <aside className="lg:col-span-3 space-y-4 print:hidden">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">
                Portal Siswa SMA/MA
              </span>
              <h2 className="text-base font-bold text-white">
                {activeStudent ? `${activeStudent.nickname} (Kelas ${activeStudent.classLevel})` : "Belum Masuk"}
              </h2>
            </div>
            {activeStudent && (
              <button
                onClick={handleStudentLogout}
                title="Keluar Sesi Siswa"
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          <nav className="space-y-1.5" aria-label="Menu Portal Siswa">
            {navItems.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    active
                      ? "bg-sky-600 text-white shadow-lg shadow-sky-600/25"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {item.icon}
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-slate-800 text-sky-300 border border-slate-700"
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

        {/* Kartu Progres Alur Siswa */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Progres Refleksi Mandiri
          </h3>
          <ul className="space-y-2 text-xs">
            {[
              { label: "1. Identitas & Persetujuan", done: Boolean(activeStudent) },
              {
                label: "2. Decision Tree (4 Pertanyaan)",
                done: Boolean(activeStudent?.resultCode),
              },
              {
                label: "3. Jurnal 'My Life, Their Highlight'",
                done: Boolean(activeStudent?.journal.saved),
              },
              {
                label: "4. Konsultasi / Live Chat Guru BK",
                done: studentConsultations.length > 0 || studentChats.length > 0,
              },
            ].map((step, i) => (
              <li
                key={i}
                className={`flex items-center gap-2.5 p-2 rounded-xl border ${
                  step.done
                    ? "bg-emerald-950/30 border-emerald-800/50 text-emerald-300"
                    : "bg-slate-950/40 border-slate-800/80 text-slate-400"
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 ${
                    step.done ? "text-emerald-400" : "text-slate-600"
                  }`}
                />
                <span className="font-medium">{step.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Etika & Batas Layanan Sesuai Proposal */}
        <div className="bg-sky-950/30 border border-sky-800/40 rounded-2xl p-4 text-xs text-sky-200/90 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-sky-300">
            <ShieldCheck className="w-4 h-4" />
            Prinsip Etika & Privasi BK
          </div>
          <p className="leading-relaxed text-slate-300">
            Website ini memberikan <b>saran refleksi non-diagnostik</b>, tanpa skor dan tanpa pelabelan. Keputusan layanan tetap dipegang oleh Guru BK sebagai konselor profesional (ASCA, 2022; UNESCO, 2023).
          </p>
        </div>
      </aside>

      {/* Konten Utama Portal Siswa */}
      <section className="lg:col-span-9 space-y-6">
        {/* TAB 1: BERANDA & IDENTITAS */}
        {tab === "beranda" && (
          <div className="space-y-6">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 border border-sky-500/20 p-6 sm:p-8 shadow-2xl">
              <div className="max-w-2xl space-y-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Ruang Jeda Digital · Layanan Bimbingan & Konseling SMA/MA
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  FOMO atau{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
                    Emang Aku Mau?
                  </span>
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Sebelum ikut tren, membeli barang yang sedang viral, atau terus-menerus mengecek unggahan teman, ambil jeda sejenak. Kenali asal doronganmu dan ambil keputusan dengan lebih sadar.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => setTab("tree")}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-sky-500/20"
                  >
                    Mulai Decision Tree
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTab("jurnal")}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition"
                  >
                    <BookOpen className="w-4 h-4 text-sky-400" />
                    Buka Jurnal Refleksi
                  </button>
                  <button
                    onClick={() => setTab("chat")}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold text-sm border border-emerald-500/30 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Live Chat Guru BK
                  </button>
                </div>
              </div>
            </div>

            {/* Kartu Identitas / Status Siswa */}
            {!activeStudent ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                      Langkah Pertama · Minimisasi Data & Persetujuan
                    </span>
                    <h2 className="text-xl font-bold text-white mt-1">
                      Kenalan Dulu Sebelum Mulai Refleksi
                    </h2>
                    <p className="text-sm text-slate-400 mt-0.5">
                      Cukup gunakan nama panggilan, kelas, dan kode sekolah dari Guru BK-mu.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillDemoIdentity}
                    className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 transition"
                  >
                    Isi Data Contoh (Rani · Kelas XI)
                  </button>
                </div>

                <form onSubmit={handleStudentLogin} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                        Nama Panggilan / Lengkap
                      </label>
                      <input
                        type="text"
                        value={nick}
                        onChange={(e) => setNick(e.target.value)}
                        placeholder="Contoh: Rani"
                        maxLength={40}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                        Kelas
                      </label>
                      <select
                        value={cls}
                        onChange={(e) => setCls(e.target.value as "X" | "XI" | "XII" | "")}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
                      >
                        <option value="">Pilih Kelas</option>
                        <option value="X">Kelas X</option>
                        <option value="XI">Kelas XI</option>
                        <option value="XII">Kelas XII</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                        Kode Sekolah
                      </label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="Contoh: JEDA-01"
                        maxLength={15}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm uppercase focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  {/* Kotak Informasi Persetujuan (Informed Consent) sesuai Tabel 6 Proposal */}
                  <div className="p-4 rounded-2xl bg-slate-950/90 border-l-4 border-sky-500 text-xs text-slate-300 space-y-1.5 leading-relaxed">
                    <p>
                      <strong className="text-white">Data yang dicatat:</strong> Nama panggilan, kelas, hasil refleksi decision tree, jurnal (hanya jika kamu mengizinkan untuk dibagikan), serta pesan konsultasi/live chat.
                    </p>
                    <p>
                      <strong className="text-white">Siapa yang dapat melihat:</strong> Hanya Guru BK yang berwenang di sekolahmu. Guru mata pelajaran atau siswa lain tidak memiliki akses.
                    </p>
                    <p>
                      <strong className="text-white">Jaminan Privasi:</strong> Tidak ada skor pelabelan, tidak ada diagnosis psikologis, dan jurnal bisa kamu hapus kapan saja.
                    </p>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      className="mt-0.5 w-5 h-5 rounded accent-sky-500"
                    />
                    <span className="text-sm text-slate-200 font-medium">
                      Aku sudah membaca informasi di atas dan setuju menggunakan ruang refleksi ini dengan sadar.
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    Setuju & Masuk Ruang Refleksi
                  </button>
                </form>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setTab("tree")}
                  className="text-left p-5 rounded-2xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 transition group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
                      <GitBranch className="w-5 h-5" />
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        activeStudent.resultCode
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-amber-500/15 text-amber-300"
                      }`}
                    >
                      {activeStudent.resultCode
                        ? `Hasil ${activeStudent.resultCode}`
                        : "Belum Mengisi"}
                    </span>
                  </div>
                  <h3 className="font-bold text-white group-hover:text-sky-300 transition">
                    1. Decision Tree FOMO
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {activeStudent.resultCode
                      ? DECISION_OUTCOMES[activeStudent.resultCode].title
                      : "Jawab 4 pertanyaan berjenjang untuk menimbang doronganmu."}
                  </p>
                </button>

                <button
                  onClick={() => setTab("jurnal")}
                  className="text-left p-5 rounded-2xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 transition group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                      <BookOpen className="w-5 h-5" />
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        activeStudent.journal.saved
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {activeStudent.journal.saved
                        ? activeStudent.journal.sharedWithCounselor
                          ? "Dibagikan ke BK"
                          : "Tersimpan Privat"
                        : "Belum Ditulis"}
                    </span>
                  </div>
                  <h3 className="font-bold text-white group-hover:text-purple-300 transition">
                    2. Jurnal &ldquo;My Life, Their Highlight&rdquo;
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Kelola perbandingan sosial dengan membedakan apa yang tampak di layar dan kenyataan.
                  </p>
                </button>

                <button
                  onClick={() => setTab("chat")}
                  className="text-left p-5 rounded-2xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 transition group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <MessageCircle className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-500/15 text-sky-300">
                      {studentChats.length} Pesan
                    </span>
                  </div>
                  <h3 className="font-bold text-white group-hover:text-emerald-300 transition">
                    3. Live Chat & Konsultasi BK
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Diskusi langsung secara privat dengan Guru BK atau jadwalkan sesi tatap muka.
                  </p>
                </button>
              </div>
            )}

            {/* Latihan Pernapasan / Jeda Singkat */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
                Latihan Regulasi Diri · Muhasabah & Qana&apos;ah
              </span>
              <h3 className="text-2xl font-extrabold text-white">
                Tarik napas dalam... hembuskan perlahan.
              </h3>
              <p className="text-sm text-slate-300 max-w-xl mx-auto">
                &ldquo;Apakah keinginan ini sungguh berangkat dari kebutuhanku, atau hanya karena aku takut tertinggal dari apa yang dilakukan orang lain?&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: DECISION TREE */}
        {tab === "tree" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Decision Tree Interaktif · 4 Pertanyaan Reflektif
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">
                  FOMO atau Emang Aku Mau?
                </h2>
                <p className="text-sm text-slate-400">
                  Ini ruang aman untuk menimbang keputusanmu, bukan untuk menghakimi atau memberi skor.
                </p>
              </div>
              {showTreeForm && (
                <button
                  type="button"
                  onClick={handleFillDemoTree}
                  className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 transition"
                >
                  Isi Jawaban Contoh (Demo)
                </button>
              )}
            </div>

            {!showTreeForm && activeStudent?.resultCode ? (
              /* Tampilan Hasil A / B / C */
              <div className="space-y-6">
                {(() => {
                  const res = DECISION_OUTCOMES[activeStudent.resultCode];
                  const colorStyles =
                    res.code === "A"
                      ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-200"
                      : res.code === "B"
                      ? "bg-amber-950/50 border-amber-500/40 text-amber-200"
                      : "bg-rose-950/50 border-rose-500/40 text-rose-200";
                  return (
                    <div className={`p-6 rounded-2xl border-2 ${colorStyles} space-y-3`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 text-white">
                          {res.badge}
                        </span>
                        <span className="text-xs opacity-80">
                          Situasi: {state.customSituations[activeStudent.situationIdx] || "-"}
                        </span>
                      </div>
                      <h3 className="text-2xl font-extrabold text-white">{res.title}</h3>
                      <p className="text-sm sm:text-base leading-relaxed text-white/90">
                        {res.text}
                      </p>
                    </div>
                  );
                })()}

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-400" />
                    Langkah Kecil yang Bisa Kamu Coba Sekarang:
                  </h4>
                  <ul className="list-disc list-inside text-sm text-slate-300 space-y-1.5">
                    {DECISION_OUTCOMES[activeStudent.resultCode].tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-slate-800 text-xs text-sky-300 italic">
                    {DECISION_OUTCOMES[activeStudent.resultCode].muhasabah}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                  <b>Penegasan Etika BK:</b> Hasil di atas merupakan saran refleksi mandiri berdasarkan alur jawabanmu, <b>bukan diagnosis psikologis</b> dan bukan pelabelan diri.
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setTab("jurnal")}
                    className="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Lanjut Tulis Jurnal Refleksi
                  </button>
                  <button
                    onClick={() => setTab("chat")}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Diskusikan via Live Chat Guru BK
                  </button>
                  <button
                    onClick={() => {
                      setSitIdx(-1);
                      setAnswers([-1, -1, -1, -1]);
                      setShowTreeForm(true);
                    }}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Ulangi dengan Situasi Lain
                  </button>
                </div>
              </div>
            ) : (
              /* Formulir 4 Pertanyaan Decision Tree */
              <div className="space-y-6">
                {/* Pilihan Situasi */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <label className="block text-sm font-bold text-sky-300">
                    Langkah Awal: Pilih situasi media sosial yang sedang kamu hadapi
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {state.customSituations.map((sit, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSitIdx(idx)}
                        className={`text-left p-3.5 rounded-xl border text-sm font-medium transition ${
                          sitIdx === idx
                            ? "bg-sky-600/20 border-sky-500 text-white"
                            : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
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
                      className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
                          Pertanyaan {q.code} (Langkah {qIndex + 1} dari 4)
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Landasan: {q.theoryBasis}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">{q.question}</h3>
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
                                  ? "bg-sky-500/20 border-sky-400 text-white font-semibold"
                                  : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                              }`}
                            >
                              <span>{opt}</span>
                              {selected && (
                                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <p className="text-xs text-slate-400">
                    Tidak ada jawaban benar atau salah. Pilih yang paling jujur menggambarkan dirimu.
                  </p>
                  <button
                    type="button"
                    onClick={handleSubmitTree}
                    className="px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-sky-500/20"
                  >
                    Lihat Hasil Refleksi
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: JURNAL REFLEKSI ("My Life, Their Highlight") */}
        {tab === "jurnal" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-5">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Jurnal Refleksi Perbandingan Sosial (Septianto et al., 2025)
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                My Life, Their Highlight
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Media sosial sering kali hanya memajang panggung terbaik (highlight) hidup orang lain. Mari beri ruang yang adil untuk ceritamu sendiri.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  1. Hal apa yang baru saja kamu lihat atau temui di media sosial?
                </label>
                <textarea
                  rows={3}
                  value={jSeen}
                  onChange={(e) => setJSeen(e.target.value)}
                  placeholder="Contoh: Teman-teman mengunggah keseruan nonton konser atau membeli sepatu yang sedang tren..."
                  className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  2. Apa yang kamu rasakan di dalam hati setelah melihat unggahan itu?
                </label>
                <textarea
                  rows={3}
                  value={jFelt}
                  onChange={(e) => setJFelt(e.target.value)}
                  placeholder="Ceritakan perasaanmu dengan jujur tanpa perlu menyalahkan dirimu sendiri..."
                  className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  3. Bagian apa dari kehidupan mereka yang mungkin TIDAK terlihat di balik unggahan tersebut?
                </label>
                <textarea
                  rows={3}
                  value={jUnseen}
                  onChange={(e) => setJUnseen(e.target.value)}
                  placeholder="Contoh: Usaha keras, tabungan yang terkuras, rasa lelah, atau masalah pribadi yang tidak mereka tampilkan di kamera..."
                  className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Opsi Bagikan ke Guru BK */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={jShare}
                    onChange={(e) => setJShare(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded accent-sky-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-white block">
                      Izinkan Guru BK membaca jurnal ini
                    </span>
                    <span className="text-xs text-slate-400">
                      Jika tidak dicentang, isi jurnal ini 100% berstatus privat untuk dirimu sendiri dan terkunci di Dashboard Guru BK.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleSaveJournal}
                    className="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Jurnal Refleksi
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteJournal}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 font-semibold text-sm border border-slate-700 transition flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus Jurnal
                  </button>
                </div>
                <span className="text-xs text-slate-400">
                  ✓ Draf otomatis tersimpan di peramban perangkat ini
                </span>
              </div>
            </div>

            {/* Peringatan Keadaan Darurat sesuai Tabel 6 Proposal */}
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="text-amber-300 block text-sm">
                  Merasa Tidak Aman atau Butuh Bantuan Segera?
                </strong>
                <p className="leading-relaxed">
                  Sistem tidak membaca isi jurnal secara otomatis untuk mendeteksi krisis. Jika kamu merasa sangat tertekan, tidak aman, atau ingin menyakiti diri sendiri, segera hubungi Guru BK secara langsung atau orang dewasa tepercaya di sekitarmu.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PERMINTAAN KONSULTASI BK */}
        {tab === "konsul" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Layanan Responsif BK · Pintu Masuk Awal Konseling
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">
                  Pengajuan Jadwal Konsultasi Guru BK
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Bawa topik refleksimu agar Guru BK dapat menyiapkan sesi bimbingan yang nyaman dan tepat sasaran.
                </p>
              </div>

              <form onSubmit={handleCreateConsult} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Topik yang Ingin Dibicarakan
                  </label>
                  <select
                    value={cTopic}
                    onChange={(e) => setCTopic(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500"
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
                  <label className="block text-sm font-bold text-white mb-2">
                    Ringkasan Singkat / Harapanmu (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    value={cNote}
                    onChange={(e) => setCNote(e.target.value)}
                    placeholder="Tuliskan sedikit gambaran agar Guru BK memahami konteks ceritamu..."
                    className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={cAgree}
                    onChange={(e) => setCAgree(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded accent-sky-500"
                  />
                  <span className="text-sm text-slate-300">
                    Saya setuju mengirimkan permintaan konsultasi ini kepada Guru BK yang berwenang di sekolah saya.
                  </span>
                </label>

                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition flex items-center gap-2"
                >
                  <CalendarCheck className="w-4 h-4" />
                  Kirim Permintaan Konsultasi
                </button>
              </form>
            </div>

            {/* Riwayat Permintaan Konsultasi Siswa */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-white">
                Status Permintaan Konsultasimu ({studentConsultations.length})
              </h3>
              {studentConsultations.length === 0 ? (
                <p className="text-sm text-slate-400">
                  Belum ada permintaan konsultasi yang dikirim.
                </p>
              ) : (
                <div className="space-y-3">
                  {studentConsultations.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {req.topic}
                          </span>
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              req.status === "Baru"
                                ? "bg-amber-500/20 text-amber-300"
                                : req.status === "Dijadwalkan"
                                ? "bg-sky-500/20 text-sky-300"
                                : "bg-emerald-500/20 text-emerald-300"
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                        {req.note && (
                          <p className="text-xs text-slate-300">
                            Catatanmu: &ldquo;{req.note}&rdquo;
                          </p>
                        )}
                        {req.counselorNote && (
                          <p className="text-xs text-sky-300 bg-sky-950/40 px-3 py-1.5 rounded-lg border border-sky-800/40 mt-2">
                            <b>Tanggapan Guru BK:</b> {req.counselorNote}{" "}
                            {req.scheduledDate ? `(${req.scheduledDate})` : ""}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setTab("chat")}
                        className="shrink-0 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-300 transition flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Buka Chat
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: LIVE CHAT REALTIME DENGAN GURU BK */}
        {tab === "chat" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col h-[560px]">
            {/* Header Chat */}
            <div className="p-4 sm:px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-white text-sm sm:text-base">
                      Ruang Live Chat Konseling BK
                    </h2>
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Online
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Terhubung dengan Guru BK Sekolah · Percakapan bersifat rahasia & tidak menghakimi
                  </p>
                </div>
              </div>
            </div>

            {/* Area Pesan */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-950/50">
              {!activeStudent ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <MessageCircle className="w-10 h-10 text-slate-600" />
                  <h3 className="font-bold text-white">
                    Masuk sebagai Siswa untuk Memulai Live Chat
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md">
                    Agar Guru BK dapat membalas pesanmu dengan tepat, silakan isi nama panggilan dan kode sekolah di tab Beranda terlebih dahulu.
                  </p>
                  <button
                    onClick={() => setTab("beranda")}
                    className="px-4 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs"
                  >
                    Ke Beranda Sekarang
                  </button>
                </div>
              ) : studentChats.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <MessageCircle className="w-10 h-10 text-sky-400/50" />
                  <p className="text-sm font-semibold text-white">
                    Belum ada percakapan dengan Guru BK
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Sapa Guru BK di bawah ini! Kamu bisa bercerita tentang hasil Decision Tree-mu atau perasaan FOMO yang sedang kamu alami.
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
                        <span className="text-[11px] font-bold text-slate-400">
                          {isMe ? `${msg.senderName} (Kamu)` : msg.senderName}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(msg.createdAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div
                        className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          isMe
                            ? "bg-sky-600 text-white rounded-br-none"
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

            {/* Input Pesan */}
            <form
              onSubmit={handleSendChat}
              className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2.5"
            >
              <input
                type="text"
                disabled={!activeStudent}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={
                  activeStudent
                    ? "Tulis pesan reflektif atau pertanyaan untuk Guru BK..."
                    : "Isi identitas di Beranda terlebih dahulu..."
                }
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!activeStudent || !chatInput.trim()}
                className="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold text-sm transition flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Kirim</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 6: VERSI CETAK ALUR (AKSESIBILITAS INTERNET TERBATAS SESUAI PROPOSAL BAB 1.6 & 3.4.4) */}
        {tab === "cetak" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Aksesibilitas & Kesetaraan Akses (UNESCO, 2023)
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">
                  Lembar Alur Cetak Decision Tree & Jurnal Refleksi
                </h2>
                <p className="text-sm text-slate-400">
                  Dapat dicetak atau disimpan sebagai PDF bagi siswa yang memiliki keterbatasan kuota internet.
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition flex items-center gap-2 print:hidden"
              >
                <Printer className="w-4 h-4" />
                Cetak / Simpan PDF Sekarang
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-200">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <h3 className="font-bold text-sky-300 mb-2">
                  A. 4 Pertanyaan Pemandu Decision Tree &ldquo;FOMO atau Emang Aku Mau?&rdquo;
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  {state.customQuestions.map((q) => (
                    <li key={q.id}>
                      <b className="text-white">{q.question}</b>
                      <div className="pl-5 text-xs text-slate-400 mt-0.5">
                        Pilihan: (a) {q.options[0]} · (b) {q.options[1]} · (c) {q.options[2]}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(["A", "B", "C"] as const).map((k) => (
                  <div
                    key={k}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5"
                  >
                    <span className="text-xs font-bold text-sky-400">
                      {DECISION_OUTCOMES[k].badge}
                    </span>
                    <h4 className="font-bold text-white">
                      {DECISION_OUTCOMES[k].title}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {DECISION_OUTCOMES[k].text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="font-bold text-purple-300">
                  B. Panduan Jurnal Refleksi Mandiri &ldquo;My Life, Their Highlight&rdquo;
                </h3>
                <p className="text-xs text-slate-300">
                  1. Apa unggahan media sosial yang baru saja kamu lihat? <br />
                  2. Apa perasaan yang muncul setelah melihatnya? <br />
                  3. Bagian apa dari kehidupan mereka yang tidak tampak di kamera?
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
                <Info className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  Disusun oleh Larasati Adi Ningrum (NPM 2411080031) · BKPI UIN Raden Intan Lampung.
                </span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
