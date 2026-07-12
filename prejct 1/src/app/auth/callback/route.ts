import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Route handler untuk OAuth callback.
 * Setelah user berhasil login via OAuth (Google, GitHub, dll),
 * Supabase akan redirect ke URL ini dengan parameter `code`.
 * Kita tukar `code` tersebut menjadi session aktif, lalu redirect ke dashboard.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch {
      // Jika Supabase belum dikonfigurasi, arahkan ke auth page
      return NextResponse.redirect(`${origin}/auth?error=callback_failed`);
    }
  }

  // Jika tidak ada code atau terjadi error, redirect ke auth page
  return NextResponse.redirect(`${origin}/auth?error=no_code`);
}
