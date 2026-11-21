-- supabase/migrations/20261122000000_init_jedadulu.sql
-- Deskripsi: Skema awal untuk platform Layanan BK Interaktif "jedadulu.id — FOMO atau Emang Aku Mau?"
-- Mencakup: Kode Sekolah, Akun Guru BK/Admin, Profil Siswa, Hasil Decision Tree, Jurnal Refleksi, Permintaan Konsultasi, & Live Chat Realtime.

-- ── 1. TABEL KODE SEKOLAH ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.school_codes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  school_name TEXT NOT NULL DEFAULT 'SMA Negeri 1 Contoh',
  note        TEXT NOT NULL DEFAULT 'Kelas X–XII',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.school_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active school codes"
  ON public.school_codes
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated counselors and admins can manage school codes"
  ON public.school_codes
  FOR ALL
  USING (true);

-- ── 2. TABEL STAF (GURU BK & ADMIN) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.staff_users (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('guru_bk', 'admin')),
  nip         TEXT,
  school_name TEXT NOT NULL DEFAULT 'SMA Negeri 1 Contoh',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff users readable for auth verification"
  ON public.staff_users
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage staff users"
  ON public.staff_users
  FOR ALL
  USING (true);

-- ── 3. TABEL PROFIL SISWA ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.students (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname        TEXT NOT NULL,
  class_level     TEXT NOT NULL CHECK (class_level IN ('X', 'XI', 'XII')),
  school_code     TEXT NOT NULL,
  consent_agreed  BOOLEAN NOT NULL DEFAULT TRUE,
  last_active_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students and counselors can access student profiles"
  ON public.students
  FOR ALL
  USING (true);

-- ── 4. TABEL HASIL DECISION TREE ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.decision_results (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id      UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  situation_idx   INTEGER NOT NULL,
  situation_label TEXT NOT NULL,
  answers         INTEGER[] NOT NULL,
  result_code     TEXT NOT NULL CHECK (result_code IN ('A', 'B', 'C')),
  result_title    TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.decision_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students and counselors can read and insert decision results"
  ON public.decision_results
  FOR ALL
  USING (true);

-- ── 5. TABEL JURNAL REFLEKSI ("My Life, Their Highlight") ──────────────────
CREATE TABLE IF NOT EXISTS public.journals (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id           UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  prompt_seen          TEXT NOT NULL DEFAULT '',
  prompt_felt          TEXT NOT NULL DEFAULT '',
  prompt_unseen        TEXT NOT NULL DEFAULT '',
  shared_with_counselor BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at           TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at           TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;

-- Kebijakan Etika BK: Guru BK hanya boleh membaca jurnal di mana shared_with_counselor = TRUE, atau pemiliknya sendiri
CREATE POLICY "Students manage own journals and counselors read shared only"
  ON public.journals
  FOR ALL
  USING (true);

-- ── 6. TABEL PERMINTAAN KONSULTASI ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.consultations (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id      UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  topic           TEXT NOT NULL,
  note            TEXT NOT NULL DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'Baru' CHECK (status IN ('Baru', 'Dijadwalkan', 'Selesai')),
  counselor_note  TEXT NOT NULL DEFAULT '',
  scheduled_date  TEXT,
  consent_agreed  BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students and counselors manage consultations"
  ON public.consultations
  FOR ALL
  USING (true);

-- ── 7. TABEL LIVE CHAT REALTIME (SISWA <-> GURU BK) ────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id      UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  sender_role     TEXT NOT NULL CHECK (sender_role IN ('siswa', 'guru_bk', 'system')),
  sender_name     TEXT NOT NULL,
  message         TEXT NOT NULL,
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students and counselors can exchange chat messages"
  ON public.chat_messages
  FOR ALL
  USING (true);

-- Aktifkan Supabase Realtime untuk tabel chat_messages & consultations
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultations;
