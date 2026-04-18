import type { User } from "@supabase/supabase-js";

/** Row shape returned to the admin Auth users UI. */
export type AdminAuthUserListRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  is_anonymous: boolean;
};

export function displayPhoneFromAuthUser(u: Pick<User, "phone" | "user_metadata">): string | null {
  const authPhone = u.phone?.trim();
  if (authPhone) return authPhone;
  const meta = u.user_metadata as Record<string, unknown> | undefined;
  const fromMeta = meta?.phone;
  if (typeof fromMeta === "string" && fromMeta.trim()) return fromMeta.trim();
  return null;
}

export function displayFullNameFromAuthUser(u: Pick<User, "user_metadata">): string | null {
  const meta = u.user_metadata as Record<string, unknown> | undefined;
  const n = meta?.full_name;
  if (typeof n === "string" && n.trim()) return n.trim();
  return null;
}

export function adminAuthUserRowFromUser(u: User): AdminAuthUserListRow {
  return {
    id: u.id,
    email: u.email ?? null,
    full_name: displayFullNameFromAuthUser(u),
    phone: displayPhoneFromAuthUser(u),
    created_at: u.created_at,
    email_confirmed_at: u.email_confirmed_at ?? null,
    last_sign_in_at: u.last_sign_in_at ?? null,
    is_anonymous: u.is_anonymous ?? false,
  };
}
