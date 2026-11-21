// src/lib/store.ts
// Layanan Data Terpadu (Supabase Cloud + LocalStorage Sinkronisasi Otomatis & Realtime)
// Mematuhi standar: Fail-Fast validation, try-catch dengan error logging informatif, & kode etik privasi BK.

import { supabase, isSupabaseConfigured } from "./supabase";
import {
  DEFAULT_QUESTIONS,
  DEFAULT_SITUATIONS,
  DECISION_OUTCOMES,
  DecisionQuestion,
  evaluateDecisionOutcome,
} from "./bk-data";

export interface SchoolCode {
  id: string;
  code: string;
  schoolName: string;
  note: string;
  isActive: boolean;
  createdAt: string;
}

export interface StaffAccount {
  id: string;
  email: string;
  password?: string; // hanya dipakai pada mode simulasi/lokal
  fullName: string;
  role: "guru_bk" | "admin";
  nip: string;
  schoolName: string;
  isActive: boolean;
}

export interface StudentRecord {
  id: string;
  nickname: string;
  classLevel: "X" | "XI" | "XII";
  schoolCode: string;
  consentAgreed: boolean;
  situationIdx: number;
  answers: number[];
  resultCode: "A" | "B" | "C" | null;
  journal: {
    seen: string;
    felt: string;
    unseen: string;
    sharedWithCounselor: boolean;
    saved: boolean;
    updatedAt?: string;
  };
  createdAt: string;
}

export interface ConsultationRecord {
  id: string;
  studentId: string;
  studentNick: string;
  studentClass: "X" | "XI" | "XII";
  topic: string;
  note: string;
  status: "Baru" | "Dijadwalkan" | "Selesai";
  counselorNote: string;
  scheduledDate?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  studentId: string;
  studentNick: string;
  studentClass: "X" | "XI" | "XII";
  senderRole: "siswa" | "guru_bk" | "system";
  senderName: string;
  message: string;
  createdAt: string;
}

export interface PlatformState {
  schoolCodes: SchoolCode[];
  staffUsers: StaffAccount[];
  students: StudentRecord[];
  consultations: ConsultationRecord[];
  chatMessages: ChatMessage[];
  customSituations: string[];
  customQuestions: DecisionQuestion[];
}

const STORAGE_KEY = "jedadulu_platform_v1";
const ACTIVE_STUDENT_KEY = "jedadulu_active_student_id";
const ACTIVE_STAFF_KEY = "jedadulu_active_staff_session";

const INITIAL_STATE: PlatformState = {
  schoolCodes: [
    {
      id: "sc-1",
      code: "JEDA-01",
      schoolName: "SMA Negeri 1 Contoh",
      note: "Kelas X–XII · Layanan BK Preventif",
      isActive: true,
      createdAt: "2026-11-20T08:00:00.000Z",
    },
    {
      id: "sc-2",
      code: "JEDA-02",
      schoolName: "MA Negeri 1 Bandar Lampung",
      note: "Kelas X–XI · Semester Ganjil",
      isActive: true,
      createdAt: "2026-11-21T08:00:00.000Z",
    },
  ],
  staffUsers: [
    {
      id: "st-1",
      email: "guru@sekolah-contoh.sch.id",
      password: "bk12345",
      fullName: "Bu Dewi, S.Pd., Kons.",
      role: "guru_bk",
      nip: "198804122015032004",
      schoolName: "SMA Negeri 1 Contoh",
      isActive: true,
    },
    {
      id: "st-2",
      email: "admin@sekolah-contoh.sch.id",
      password: "admin12345",
      fullName: "Larasati Adi Ningrum",
      role: "admin",
      nip: "2411080031",
      schoolName: "SMA Negeri 1 Contoh",
      isActive: true,
    },
  ],
  students: [
    {
      id: "stu-d1",
      nickname: "Dinda",
      classLevel: "XI",
      schoolCode: "JEDA-01",
      consentAgreed: true,
      situationIdx: 2,
      answers: [2, 2, 1, 1],
      resultCode: "C",
      journal: {
        seen: "Teman-teman mengunggah foto nonton konser musik di akhir pekan.",
        felt: "Sedih, cemas, dan merasa ketinggalan momen seru bersama mereka.",
        unseen: "Mungkin mereka juga capek antre berjam-jam dan tabungannya habis banyak.",
        sharedWithCounselor: true,
        saved: true,
        updatedAt: "2026-11-21T14:20:00.000Z",
      },
      createdAt: "2026-11-21T14:10:00.000Z",
    },
    {
      id: "stu-d2",
      nickname: "Raka",
      classLevel: "X",
      schoolCode: "JEDA-01",
      consentAgreed: true,
      situationIdx: 1,
      answers: [1, 1, 1, 1],
      resultCode: "B",
      journal: {
        seen: "",
        felt: "",
        unseen: "",
        sharedWithCounselor: false,
        saved: false,
      },
      createdAt: "2026-11-21T15:00:00.000Z",
    },
    {
      id: "stu-d3",
      nickname: "Salsa",
      classLevel: "XI",
      schoolCode: "JEDA-01",
      consentAgreed: true,
      situationIdx: 1,
      answers: [0, 0, 0, 0],
      resultCode: "A",
      journal: {
        seen: "Teman mengunggah sepatu lari baru yang sedang viral di TikTok.",
        felt: "Biasa saja, karena sepatuku sekarang masih nyaman dan bagus.",
        unseen: "Mungkin mereka harus menabung berbulan-bulan untuk membelinya.",
        sharedWithCounselor: true,
        saved: true,
        updatedAt: "2026-11-21T16:05:00.000Z",
      },
      createdAt: "2026-11-21T16:00:00.000Z",
    },
    {
      id: "stu-d4",
      nickname: "Bima",
      classLevel: "XII",
      schoolCode: "JEDA-01",
      consentAgreed: true,
      situationIdx: 3,
      answers: [1, 2, 2, 2],
      resultCode: "C",
      journal: {
        seen: "Story teman-teman yang sedang nongkrong malam minggu.",
        felt: "Takut tidak dianggap bagian dari circle lagi.",
        unseen: "Padahal besok ada ujian dan mereka mungkin belum belajar.",
        sharedWithCounselor: false,
        saved: true,
      },
      createdAt: "2026-11-21T17:10:00.000Z",
    },
    {
      id: "stu-d5",
      nickname: "Nayla",
      classLevel: "X",
      schoolCode: "JEDA-01",
      consentAgreed: true,
      situationIdx: -1,
      answers: [-1, -1, -1, -1],
      resultCode: null,
      journal: {
        seen: "",
        felt: "",
        unseen: "",
        sharedWithCounselor: false,
        saved: false,
      },
      createdAt: "2026-11-21T18:00:00.000Z",
    },
    {
      id: "stu-d6",
      nickname: "Fajar",
      classLevel: "XII",
      schoolCode: "JEDA-01",
      consentAgreed: true,
      situationIdx: 0,
      answers: [0, 0, 0, 0],
      resultCode: "A",
      journal: {
        seen: "",
        felt: "",
        unseen: "",
        sharedWithCounselor: false,
        saved: false,
      },
      createdAt: "2026-11-21T18:30:00.000Z",
    },
    {
      id: "stu-d7",
      nickname: "Putri",
      classLevel: "XI",
      schoolCode: "JEDA-01",
      consentAgreed: true,
      situationIdx: 0,
      answers: [1, 1, 1, 0],
      resultCode: "B",
      journal: {
        seen: "Banyak teman yang ikut tren tantangan video di media sosial.",
        felt: "Pengin ikut supaya ramai, tapi ragu apakah cocok denganku.",
        unseen: "Mungkin tidak semua nyaman tampil di kamera, hanya terlihat senang di layar.",
        sharedWithCounselor: true,
        saved: true,
        updatedAt: "2026-11-21T19:15:00.000Z",
      },
      createdAt: "2026-11-21T19:00:00.000Z",
    },
    {
      id: "stu-d8",
      nickname: "Yoga",
      classLevel: "X",
      schoolCode: "JEDA-01",
      consentAgreed: true,
      situationIdx: 1,
      answers: [1, 0, 1, 1],
      resultCode: "B",
      journal: {
        seen: "",
        felt: "",
        unseen: "",
        sharedWithCounselor: false,
        saved: false,
      },
      createdAt: "2026-11-21T20:00:00.000Z",
    },
  ],
  consultations: [
    {
      id: "req-1",
      studentId: "stu-d1",
      studentNick: "Dinda",
      studentClass: "XI",
      topic: "Merasa tertinggal dari pergaulan teman (FOMO)",
      note: "Bu, aku sering kepikiran dan susah fokus belajar kalau melihat unggahan teman jalan-jalan.",
      status: "Baru",
      counselorNote: "",
      createdAt: "2026-11-21T14:25:00.000Z",
    },
    {
      id: "req-2",
      studentId: "stu-d8",
      studentNick: "Yoga",
      studentClass: "X",
      topic: "Kesulitan mengatur waktu belajar dan uang saku",
      note: "Sering tergoda checkout barang viral sampai uang saku habis sebelum akhir minggu.",
      status: "Dijadwalkan",
      counselorNote: "Sesi tatap muka ruang BK hari Selasa jam istirahat ke-2.",
      scheduledDate: "Selasa, 10:15 WIB",
      createdAt: "2026-11-21T20:10:00.000Z",
    },
  ],
  chatMessages: [
    {
      id: "msg-1",
      studentId: "stu-d1",
      studentNick: "Dinda",
      studentClass: "XI",
      senderRole: "siswa",
      senderName: "Dinda",
      message: "Assalamualaikum Bu Dewi, saya Dinda kelas XI. Tadi saya coba Decision Tree dan dapat Hasil C (Ambil Jeda).",
      createdAt: "2026-11-21T14:26:00.000Z",
    },
    {
      id: "msg-2",
      studentId: "stu-d1",
      studentNick: "Dinda",
      studentClass: "XI",
      senderRole: "guru_bk",
      senderName: "Bu Dewi, S.Pd., Kons.",
      message: "Waalaikumsalam Dinda. Terima kasih sudah berani berefleksi di jedadulu.id ya. Ibu juga sudah baca jurnal yang Dinda bagikan. Apa yang paling membuat Dinda cemas saat melihat story konser teman?",
      createdAt: "2026-11-21T14:28:00.000Z",
    },
    {
      id: "msg-3",
      studentId: "stu-d1",
      studentNick: "Dinda",
      studentClass: "XI",
      senderRole: "siswa",
      senderName: "Dinda",
      message: "Saya takut besok di sekolah tidak nyambung waktu mereka ngobrolin konser itu Bu...",
      createdAt: "2026-11-21T14:30:00.000Z",
    },
    {
      id: "msg-4",
      studentId: "stu-d8",
      studentNick: "Yoga",
      studentClass: "X",
      senderRole: "siswa",
      senderName: "Yoga",
      message: "Selamat siang Bu Dewi, saya Yoga kelas X. Mau tanya jadwal konsultasi saya jadi hari apa ya Bu?",
      createdAt: "2026-11-21T20:12:00.000Z",
    },
    {
      id: "msg-5",
      studentId: "stu-d8",
      studentNick: "Yoga",
      studentClass: "X",
      senderRole: "guru_bk",
      senderName: "Bu Dewi, S.Pd., Kons.",
      message: "Siang Yoga! Sudah Ibu jadwalkan untuk Selasa jam istirahat kedua (10:15) di Ruang BK ya. Kita bahas bareng tips mengatur uang sakunya.",
      createdAt: "2026-11-21T20:15:00.000Z",
    },
  ],
  customSituations: DEFAULT_SITUATIONS,
  customQuestions: DEFAULT_QUESTIONS,
};

export function loadPlatformState(): PlatformState {
  if (typeof window === "undefined") return INITIAL_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STATE));
      return INITIAL_STATE;
    }
    const parsed = JSON.parse(raw) as Partial<PlatformState>;
    return {
      schoolCodes: parsed.schoolCodes || INITIAL_STATE.schoolCodes,
      staffUsers: parsed.staffUsers || INITIAL_STATE.staffUsers,
      students: parsed.students || INITIAL_STATE.students,
      consultations: parsed.consultations || INITIAL_STATE.consultations,
      chatMessages: parsed.chatMessages || INITIAL_STATE.chatMessages,
      customSituations: parsed.customSituations || INITIAL_STATE.customSituations,
      customQuestions: parsed.customQuestions || INITIAL_STATE.customQuestions,
    };
  } catch (error) {
    console.error("[Store] Gagal memuat state lokal:", error);
    return INITIAL_STATE;
  }
}

export function savePlatformState(state: PlatformState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("jedadulu-sync"));
  } catch (error) {
    console.error("[Store] Gagal menyimpan state lokal:", error);
  }
}

export function resetDemoState(): PlatformState {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STATE));
    localStorage.removeItem(ACTIVE_STUDENT_KEY);
    localStorage.removeItem(ACTIVE_STAFF_KEY);
    window.dispatchEvent(new CustomEvent("jedadulu-sync"));
  }
  return INITIAL_STATE;
}

export function getActiveStudentId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_STUDENT_KEY);
}

export function setActiveStudentId(id: string | null): void {
  if (typeof window === "undefined") return;
  if (id) localStorage.setItem(ACTIVE_STUDENT_KEY, id);
  else localStorage.removeItem(ACTIVE_STUDENT_KEY);
}

export function getActiveStaffSession(): StaffAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACTIVE_STAFF_KEY);
    return raw ? (JSON.parse(raw) as StaffAccount) : null;
  } catch {
    return null;
  }
}

export function setActiveStaffSession(staff: StaffAccount | null): void {
  if (typeof window === "undefined") return;
  if (staff) localStorage.setItem(ACTIVE_STAFF_KEY, JSON.stringify(staff));
  else localStorage.removeItem(ACTIVE_STAFF_KEY);
}

// ── OPERASI SUPABASE & SINKRONISASI (DENGAN TRY-CATCH FAIL-FAST) ─────────────

export async function registerOrLoginStudent(
  nickname: string,
  classLevel: "X" | "XI" | "XII",
  schoolCode: string,
  consentAgreed: boolean
): Promise<{ ok: boolean; error?: string; student?: StudentRecord }> {
  // Fail-Fast validation
  const cleanNick = nickname.trim();
  const cleanCode = schoolCode.trim().toUpperCase();
  if (!cleanNick) return { ok: false, error: "Nama panggilan wajib diisi." };
  if (!["X", "XI", "XII"].includes(classLevel)) {
    return { ok: false, error: "Pilih kelas X, XI, atau XII terlebih dahulu." };
  }
  if (!cleanCode) return { ok: false, error: "Kode sekolah wajib diisi." };
  if (!consentAgreed) {
    return { ok: false, error: "Kamu wajib menyetujui ketentuan privasi sebelum memulai." };
  }

  const state = loadPlatformState();
  const validCode = state.schoolCodes.find((c) => c.code === cleanCode && c.isActive);
  if (!validCode) {
    return {
      ok: false,
      error: `Kode sekolah "${cleanCode}" tidak ditemukan atau sudah dinonaktifkan. Hubungi Guru BK (contoh: JEDA-01).`,
    };
  }

  let existing = state.students.find(
    (s) =>
      s.nickname.toLowerCase() === cleanNick.toLowerCase() &&
      s.classLevel === classLevel &&
      s.schoolCode === cleanCode
  );

  if (!existing) {
    existing = {
      id: `stu-${Date.now()}`,
      nickname: cleanNick,
      classLevel,
      schoolCode: cleanCode,
      consentAgreed: true,
      situationIdx: -1,
      answers: [-1, -1, -1, -1],
      resultCode: null,
      journal: {
        seen: "",
        felt: "",
        unseen: "",
        sharedWithCounselor: false,
        saved: false,
      },
      createdAt: new Date().toISOString(),
    };
    state.students.unshift(existing);
    savePlatformState(state);
  }

  // Sinkronisasi ke Supabase jika dikonfigurasi
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("students").insert({
        nickname: cleanNick,
        class_level: classLevel,
        school_code: cleanCode,
        consent_agreed: true,
      });
      if (error) {
        console.warn("[Supabase] Sinkronisasi profil siswa ke cloud:", error.message);
      }
    } catch (err) {
      console.error("[Supabase] Error saat menyimpan profil siswa:", err);
    }
  }

  setActiveStudentId(existing.id);
  return { ok: true, student: existing };
}

export async function submitDecisionTreeResult(
  studentId: string,
  situationIdx: number,
  answers: number[]
): Promise<{ ok: boolean; error?: string; resultCode?: "A" | "B" | "C" }> {
  // Fail-Fast validation
  if (!studentId) return { ok: false, error: "Sesi siswa tidak ditemukan." };
  if (situationIdx < 0) return { ok: false, error: "Pilih situasi yang sedang kamu hadapi." };
  if (!Array.isArray(answers) || answers.length !== 4 || answers.some((a) => a < 0)) {
    return { ok: false, error: "Lengkapi keempat pertanyaan reflektif terlebih dahulu." };
  }

  const resultCode = evaluateDecisionOutcome(answers);
  const state = loadPlatformState();
  const idx = state.students.findIndex((s) => s.id === studentId);
  if (idx === -1) return { ok: false, error: "Data siswa tidak ditemukan." };

  state.students[idx].situationIdx = situationIdx;
  state.students[idx].answers = [...answers];
  state.students[idx].resultCode = resultCode;
  savePlatformState(state);

  if (isSupabaseConfigured && supabase) {
    try {
      const sitLabel = state.customSituations[situationIdx] || "Situasi Media Sosial";
      const { error } = await supabase.from("decision_results").insert({
        student_id: studentId,
        situation_idx: situationIdx,
        situation_label: sitLabel,
        answers,
        result_code: resultCode,
        result_title: DECISION_OUTCOMES[resultCode].title,
      });
      if (error) {
        console.warn("[Supabase] Sinkronisasi hasil decision tree:", error.message);
      }
    } catch (err) {
      console.error("[Supabase] Error saat menyimpan decision tree:", err);
    }
  }

  return { ok: true, resultCode };
}

export async function saveStudentJournal(
  studentId: string,
  seen: string,
  felt: string,
  unseen: string,
  sharedWithCounselor: boolean
): Promise<{ ok: boolean; error?: string }> {
  // Fail-Fast validation
  if (!studentId) return { ok: false, error: "Sesi siswa tidak ditemukan." };
  if (!(seen + felt + unseen).trim()) {
    return { ok: false, error: "Tuliskan minimal satu bagian refleksi sebelum menyimpan." };
  }

  const state = loadPlatformState();
  const idx = state.students.findIndex((s) => s.id === studentId);
  if (idx === -1) return { ok: false, error: "Data siswa tidak ditemukan." };

  state.students[idx].journal = {
    seen: seen.trim(),
    felt: felt.trim(),
    unseen: unseen.trim(),
    sharedWithCounselor,
    saved: true,
    updatedAt: new Date().toISOString(),
  };
  savePlatformState(state);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("journals").insert({
        student_id: studentId,
        prompt_seen: seen.trim(),
        prompt_felt: felt.trim(),
        prompt_unseen: unseen.trim(),
        shared_with_counselor: sharedWithCounselor,
      });
      if (error) {
        console.warn("[Supabase] Sinkronisasi jurnal:", error.message);
      }
    } catch (err) {
      console.error("[Supabase] Error saat menyimpan jurnal:", err);
    }
  }

  return { ok: true };
}

export async function deleteStudentJournal(studentId: string): Promise<{ ok: boolean }> {
  if (!studentId) return { ok: false };
  const state = loadPlatformState();
  const idx = state.students.findIndex((s) => s.id === studentId);
  if (idx !== -1) {
    state.students[idx].journal = {
      seen: "",
      felt: "",
      unseen: "",
      sharedWithCounselor: false,
      saved: false,
    };
    savePlatformState(state);
  }
  return { ok: true };
}

export async function createConsultationRequest(
  studentId: string,
  topic: string,
  note: string,
  consentAgreed: boolean
): Promise<{ ok: boolean; error?: string; request?: ConsultationRecord }> {
  // Fail-Fast validation
  if (!studentId) return { ok: false, error: "Sesi siswa tidak ditemukan." };
  if (!topic.trim()) return { ok: false, error: "Pilih topik yang ingin dibicarakan." };
  if (!consentAgreed) {
    return { ok: false, error: "Centang persetujuan pengiriman permintaan konsultasi." };
  }

  const state = loadPlatformState();
  const student = state.students.find((s) => s.id === studentId);
  if (!student) return { ok: false, error: "Profil siswa tidak ditemukan." };

  const newReq: ConsultationRecord = {
    id: `req-${Date.now()}`,
    studentId: student.id,
    studentNick: student.nickname,
    studentClass: student.classLevel,
    topic,
    note: note.trim(),
    status: "Baru",
    counselorNote: "",
    createdAt: new Date().toISOString(),
  };

  state.consultations.unshift(newReq);
  savePlatformState(state);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("consultations").insert({
        student_id: student.id,
        topic,
        note: note.trim(),
        status: "Baru",
        consent_agreed: true,
      });
      if (error) {
        console.warn("[Supabase] Sinkronisasi permintaan konsultasi:", error.message);
      }
    } catch (err) {
      console.error("[Supabase] Error saat mengirim konsultasi:", err);
    }
  }

  return { ok: true, request: newReq };
}

export async function sendLiveChatMessage(
  studentId: string,
  senderRole: "siswa" | "guru_bk",
  senderName: string,
  message: string
): Promise<{ ok: boolean; error?: string; chat?: ChatMessage }> {
  // Fail-Fast validation
  if (!studentId) return { ok: false, error: "Pilih siswa tujuan chat terlebih dahulu." };
  const cleanMsg = message.trim();
  if (!cleanMsg) return { ok: false, error: "Pesan tidak boleh kosong." };

  const state = loadPlatformState();
  const student = state.students.find((s) => s.id === studentId);
  if (!student) return { ok: false, error: "Data siswa tidak ditemukan." };

  const newChat: ChatMessage = {
    id: `msg-${Date.now()}`,
    studentId: student.id,
    studentNick: student.nickname,
    studentClass: student.classLevel,
    senderRole,
    senderName,
    message: cleanMsg,
    createdAt: new Date().toISOString(),
  };

  state.chatMessages.push(newChat);
  savePlatformState(state);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("chat_messages").insert({
        student_id: student.id,
        sender_role: senderRole,
        sender_name: senderName,
        message: cleanMsg,
      });
      if (error) {
        console.warn("[Supabase] Sinkronisasi live chat:", error.message);
      }
    } catch (err) {
      console.error("[Supabase] Error saat mengirim live chat:", err);
    }
  }

  return { ok: true, chat: newChat };
}

export async function authenticateStaff(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string; staff?: StaffAccount }> {
  // Fail-Fast validation
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { ok: false, error: "Email dan kata sandi wajib diisi." };
  }

  // Jika Supabase Auth aktif, coba login dengan Supabase terlebih dahulu
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (!error && data.user) {
        const state = loadPlatformState();
        const found = state.staffUsers.find((u) => u.email.toLowerCase() === cleanEmail);
        const staffAccount: StaffAccount = found || {
          id: data.user.id,
          email: cleanEmail,
          fullName: cleanEmail.includes("admin") ? "Admin BK" : "Guru BK",
          role: cleanEmail.includes("admin") ? "admin" : "guru_bk",
          nip: "-",
          schoolName: "SMA Negeri 1 Contoh",
          isActive: true,
        };
        setActiveStaffSession(staffAccount);
        return { ok: true, staff: staffAccount };
      }
    } catch (err) {
      console.error("[Supabase] Error saat autentikasi staff:", err);
    }
  }

  // Verifikasi terhadap akun terdaftar (mendukung demo & offline-first)
  const state = loadPlatformState();
  const account = state.staffUsers.find(
    (u) => u.email.toLowerCase() === cleanEmail && u.password === password
  );

  if (!account) {
    return { ok: false, error: "Email atau kata sandi salah. Silakan cek akun contoh." };
  }
  if (!account.isActive) {
    return { ok: false, error: "Akun ini sedang dinonaktifkan oleh Administrator." };
  }

  setActiveStaffSession(account);
  return { ok: true, staff: account };
}
