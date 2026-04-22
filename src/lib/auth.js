import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Returns { user, profile } or redirects to /login.
 * Call this at the top of any protected Server Component.
 */
export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  return { user, profile };
}

/**
 * Returns { user, profile } or null. Does not redirect.
 * Use in layouts that need to check auth without hard-redirecting.
 */
export async function getAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return { user, profile };
}
