import { createBrowserClient } from "@supabase/ssr";

/**
 * Membuat Supabase client untuk digunakan di **Client Component** (browser).
 *
 * Fungsi ini membaca environment variable yang di-prefix `NEXT_PUBLIC_`
 * sehingga aman diekspos ke browser. Jika variabel tidak tersedia,
 * akan melempar error lebih awal agar mudah di-debug.
 *
 * @example
 * ```ts
 * "use client";
 * import { createClient } from "@/lib/supabase/client";
 *
 * const supabase = createClient();
 * const { data } = await supabase.from("trips").select("*");
 * ```
 */
export function createClient() {
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

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
