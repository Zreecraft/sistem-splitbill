import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Membuat Supabase client untuk digunakan di **Server Component**,
 * **Route Handler**, atau **Server Action**.
 *
 * Client ini mengelola cookie secara otomatis agar sesi autentikasi
 * tetap sinkron antara server dan browser.
 *
 * ⚠️  Fungsi ini bersifat `async` karena `cookies()` di Next.js 15+
 *     mengembalikan Promise.
 *
 * @example
 * ```ts
 * // Dalam Server Component
 * import { createClient } from "@/lib/supabase/server";
 *
 * export default async function Page() {
 *   const supabase = await createClient();
 *   const { data } = await supabase.from("trips").select("*");
 *   // ...
 * }
 * ```
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL tidak ditemukan. " +
        "Pastikan variabel sudah diset di file .env.local"
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY tidak ditemukan. " +
        "Pastikan variabel sudah diset di file .env.local"
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // `setAll` dipanggil dari Server Component yang bersifat read-only.
          // Ini bisa diabaikan jika middleware sudah meng-handle refresh session.
        }
      },
    },
  });
}
