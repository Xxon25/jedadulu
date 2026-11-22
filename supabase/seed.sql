-- supabase/seed.sql
-- Data awal (seed) untuk jedadulu.id sesuai proposal dan prototipe

INSERT INTO public.school_codes (code, school_name, note, is_active)
VALUES
  ('JEDA-01', 'SMA Negeri 1 Contoh', 'Kelas X–XII, Semester Ganjil 2026', TRUE),
  ('JEDA-02', 'MA Negeri 1 Bandar Lampung', 'Kelas X–XI Program Layanan Preventif BK', TRUE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.staff_users (email, full_name, role, nip, school_name, is_active)
VALUES
  ('guru@sekolah-contoh.sch.id', 'Contoh BK', 'guru_bk', '198804122015032004', 'SMA Negeri 1 Contoh', TRUE),
  ('admin@sekolah-contoh.sch.id', 'Larasati Adi Ningrum (Admin BK)', 'admin', '2411080031', 'SMA Negeri 1 Contoh', TRUE)
ON CONFLICT (email) DO NOTHING;
