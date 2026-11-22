import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

const BUCKET_NAME = "jedadulu_db";
const STATE_FILE = "platform_state_v1.json";

function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET() {
  try {
    const sb = getAdminClient();
    if (!sb) {
      return NextResponse.json(
        { ok: false, error: "Supabase belum dikonfigurasi." },
        { status: 200 }
      );
    }

    const { data, error } = await sb.storage
      .from(BUCKET_NAME)
      .download(STATE_FILE);

    if (error || !data) {
      return NextResponse.json({ ok: true, state: null }, { status: 200 });
    }

    const text = await data.text();
    const parsed = JSON.parse(text);
    return NextResponse.json({ ok: true, state: parsed }, { status: 200 });
  } catch (err) {
    console.error("[API Cloud Sync GET] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Gagal mengambil state dari Supabase Cloud." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const sb = getAdminClient();
    if (!sb) {
      return NextResponse.json(
        { ok: false, error: "Supabase belum dikonfigurasi." },
        { status: 200 }
      );
    }

    const body = await req.json();
    if (!body || !body.state) {
      return NextResponse.json(
        { ok: false, error: "Payload state tidak valid." },
        { status: 400 }
      );
    }

    const jsonString = JSON.stringify(body.state);
    const { error } = await sb.storage
      .from(BUCKET_NAME)
      .upload(STATE_FILE, jsonString, {
        contentType: "application/json",
        upsert: true,
      });

    if (error) {
      console.error("[API Cloud Sync POST] Upload error:", error.message);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[API Cloud Sync POST] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Gagal menyimpan state ke Supabase Cloud." },
      { status: 500 }
    );
  }
}
