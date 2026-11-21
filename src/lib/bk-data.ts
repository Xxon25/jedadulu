// src/lib/bk-data.ts
// Konten Decision Tree, Jurnal, Topik Konsultasi, & Landasan Teori BK sesuai Proposal Larasati Adi Ningrum (2411080031)

export interface DecisionQuestion {
  id: number;
  code: string;
  question: string;
  theoryBasis: string;
  options: string[];
}

export interface DecisionOutcome {
  code: "A" | "B" | "C";
  title: string;
  badge: string;
  text: string;
  tips: string[];
  muhasabah: string;
  colorClass: string;
}

export const DEFAULT_SITUATIONS: string[] = [
  "Tren yang sedang ramai di media sosial",
  "Barang atau produk yang sedang viral",
  "Acara atau kegiatan nongkrong bersama teman",
  "Terus-menerus mengecek unggahan (scrolling)",
];

export const DEFAULT_QUESTIONS: DecisionQuestion[] = [
  {
    id: 1,
    code: "P1",
    question: "Apa yang paling mendorongmu mengikuti tren atau keinginan ini?",
    theoryBasis: "Teori Determinasi Diri — Otonomi vs Keterhubungan (Ajra et al., 2025)",
    options: [
      "Memang kuinginkan sejak awal (sebelum lihat unggahan orang)",
      "Mulai ingin setelah melihat unggahan teman atau influencer",
      "Takut dianggap ketinggalan atau kurang gaul di kelompok",
    ],
  },
  {
    id: 2,
    code: "P2",
    question: "Bagaimana perasaanmu jika tidak mengikutinya sekarang?",
    theoryBasis: "Identifikasi Kecemasan Sosial & FoMO (Wahyuningtyas et al., 2024)",
    options: [
      "Biasa saja, tidak merasa kehilangan apa-apa",
      "Agak kepikiran, tapi masih bisa kuterima dengan tenang",
      "Cemas, gelisah, dan tidak nyaman karena merasa tertinggal",
    ],
  },
  {
    id: 3,
    code: "P3",
    question: "Apakah kamu sudah mempertimbangkan waktu, biaya, dan prioritasmu?",
    theoryBasis: "Pengambilan Keputusan di Bawah Tekanan Sosial (Latif & Aras, 2026)",
    options: [
      "Sudah kuhitung, dan masih sesuai dengan waktu serta uangku",
      "Baru kupikirkan sebagian, belum terlalu yakin",
      "Belum sama sekali, aku baru terpikir untuk langsung ikut",
    ],
  },
  {
    id: 4,
    code: "P4",
    question: "Apakah keputusan ini sudah kamu pikirkan matang dan tidak berdampak negatif bagi dirimu?",
    theoryBasis: "Restrukturisasi Kognitif & Regulasi Diri (Taufiqurrohman & Muwakhidah, 2025; Armilyana et al., 2025)",
    options: [
      "Ya, aku yakin keputusan ini baik dan tidak merugikanku",
      "Aku masih ragu dengan dampaknya nanti",
      "Mungkin akan berdampak negatif (menguras tabungan/waktu belajar)",
    ],
  },
];

export const DECISION_OUTCOMES: Record<"A" | "B" | "C", DecisionOutcome> = {
  A: {
    code: "A",
    title: "Lanjutkan Keputusan secara Sadar",
    badge: "Hasil A · Keputusan Terencana",
    text: "Kamu sudah memahami kebutuhanmu dan mempertimbangkan konsekuensinya. Keputusan ini sejalan dengan tujuan, prioritas, dan nilai pribadimu.",
    tips: [
      "Tetapkan batas waktu atau anggaran biaya sebelum melanjutkan agar tetap terkendali.",
      "Setelah itu, nikmati pilihanmu tanpa perlu membandingkan diri dengan unggahan orang lain.",
    ],
    muhasabah:
      "Muhasabah singkat: Apakah pilihan ini membuatku lebih bersyukur dan merasa cukup (qana’ah)?",
    colorClass: "emerald",
  },
  B: {
    code: "B",
    title: "Tunda atau Sesuaikan Keputusan",
    badge: "Hasil B · Perlu Penyesuaian",
    text: "Kamu sudah punya tujuan atau ketertarikan, tetapi masih perlu mempertimbangkan waktu, biaya, atau cara yang lebih sesuai. Tidak apa-apa menunggu sebentar atau menyesuaikan rencana agar lebih matang.",
    tips: [
      "Terapkan aturan tunda 24 jam, lalu tanyakan lagi pada dirimu besok apakah masih sepenting hari ini.",
      "Cek kembali kondisi tabungan, uang saku, dan jadwal kegiatan utamamu.",
    ],
    muhasabah:
      "Muhasabah singkat: Apa prioritas utama yang perlu kurapikan dulu sebelum mengambil keputusan ini?",
    colorClass: "amber",
  },
  C: {
    code: "C",
    title: "Ambil Jeda untuk Refleksi",
    badge: "Hasil C · Jeda Reflektif",
    text: "Keinginanmu saat ini tampaknya lebih didorong oleh rasa takut tertinggal (FOMO) atau khawatir dinilai orang lain. Coba berhenti sejenak, tarik napas, dan tanyakan pada dirimu: “Apa yang sebenarnya aku inginkan?”",
    tips: [
      "Tutup aplikasi media sosial selama 10–15 menit dan alihkan perhatian ke aktivitas nyata di sekitarmu.",
      "Tuangkan apa yang kamu lihat dan rasakan di fitur Jurnal “My Life, Their Highlight”.",
    ],
    muhasabah:
      "Muhasabah singkat: Apakah aku sedang mengejar kebutuhanku sendiri, atau sekadar mengejar pengakuan di mata orang lain?",
    colorClass: "rose",
  },
};

export const CONSULTATION_TOPICS: string[] = [
  "Dorongan ikut tren atau membeli barang viral",
  "Merasa tertinggal dari pergaulan teman (FOMO)",
  "Membandingkan diri dengan unggahan orang lain",
  "Kesulitan mengatur waktu belajar dan uang saku",
  "Hal lain yang ingin kuceritakan dengan Guru BK",
];

// Logika percabangan terbuka sesuai prototipe agar mudah ditelaah Guru BK
export function evaluateDecisionOutcome(answers: number[]): "A" | "B" | "C" {
  if (!Array.isArray(answers) || answers.length < 4) {
    throw new Error("Jawaban Decision Tree harus terdiri atas 4 pertanyaan.");
  }
  if (answers[0] === 2 || answers[1] === 2) return "C";
  if (answers[0] === 0 && answers[1] === 0 && answers[2] === 0 && answers[3] === 0) return "A";
  return "B";
}
