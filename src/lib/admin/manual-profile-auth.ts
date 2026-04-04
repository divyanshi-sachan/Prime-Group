import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSiteUrl } from "@/lib/site";

export type EnsureManualProfileAuthResult =
  | {
      ok: true;
      userId: string;
      createdAuthUser: boolean;
      attachedToExistingAccount: boolean;
      /** After this call: new accounts are unconfirmed until they use the email link. */
      emailConfirmed: boolean;
    }
  | { ok: false; status: number; error: string };

/**
 * Ensures an Auth user + public.users row exists for manual offline intake.
 * New users are created with email unconfirmed so signup verification email can be sent.
 */
export async function ensureAuthUserForManualProfile(
  service: SupabaseClient,
  email: string,
  initialPassword: string
): Promise<EnsureManualProfileAuthResult> {
  const { data: existingUser, error: userLookupError } = await service
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (userLookupError) {
    return { ok: false, status: 500, error: userLookupError.message };
  }

  let userId: string;
  let createdAuthUser = false;
  let attachedToExistingAccount = false;
  let emailConfirmed = false;

  if (existingUser?.id) {
    userId = existingUser.id;
    attachedToExistingAccount = true;

    const { data: existingProfile, error: profLookupError } = await service
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (profLookupError) {
      return { ok: false, status: 500, error: profLookupError.message };
    }

    if (existingProfile?.id) {
      return {
        ok: false,
        status: 409,
        error:
          "This email already has a profile. Use a different email or edit the existing profile.",
      };
    }

    const { error: updatePwdErr } = await service.auth.admin.updateUserById(userId, {
      password: initialPassword,
      email_confirm: true,
    });

    if (updatePwdErr) {
      return {
        ok: false,
        status: 400,
        error: updatePwdErr.message ?? "Could not set password on existing account",
      };
    }

    emailConfirmed = true;
  } else {
    const { data: created, error: createError } = await service.auth.admin.createUser({
      email,
      password: initialPassword,
      email_confirm: false,
      user_metadata: {
        source: "admin_manual_profile",
      },
    });

    if (createError || !created.user?.id) {
      const msg = createError?.message ?? "Could not create account";
      if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("registered")) {
        return {
          ok: false,
          status: 409,
          error:
            "This email is already registered. If there is no profile yet, try again in a moment or contact support.",
        };
      }
      return { ok: false, status: 400, error: msg };
    }

    userId = created.user.id;
    createdAuthUser = true;
    emailConfirmed = false;
  }

  return {
    ok: true,
    userId,
    createdAuthUser,
    attachedToExistingAccount,
    emailConfirmed,
  };
}

/**
 * Triggers Supabase-hosted email: signup confirmation for unconfirmed users, or magic link for confirmed accounts.
 */
export async function sendManualProfileAccountEmail(
  emailNorm: string,
  ctx: { emailConfirmed: boolean }
): Promise<{ sent: boolean; warning?: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return { sent: false, warning: "Supabase URL or anon key is not configured." };
  }

  const emailRedirectTo = `${getSiteUrl()}/auth/callback?next=/hi`;
  const supabase = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (!ctx.emailConfirmed) {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: emailNorm,
      options: { emailRedirectTo },
    });
    if (error) {
      return { sent: false, warning: error.message };
    }
    return { sent: true };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: emailNorm,
    options: { emailRedirectTo, shouldCreateUser: false },
  });
  if (error) {
    return { sent: false, warning: error.message };
  }
  return { sent: true };
}
