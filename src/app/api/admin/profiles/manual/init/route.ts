import { NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/supabase/server-admin";
import { createServiceRoleClient } from "@/lib/supabase/server-service";
import { manualProfileInitSchema } from "@/lib/admin/manual-profile-schema";
import {
  ensureAuthUserForManualProfile,
  sendManualProfileAccountEmail,
} from "@/lib/admin/manual-profile-auth";

const ADMIN_ROLES = ["admin", "super_admin"];

export async function POST(request: Request) {
  try {
    const supabase = await createAdminServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = createServiceRoleClient();

    const { data: caller, error: callerError } = await service
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (callerError) {
      return NextResponse.json({ error: callerError.message }, { status: 500 });
    }

    if (!caller || !ADMIN_ROLES.includes(caller.role)) {
      return NextResponse.json({ error: "Forbidden: not an admin" }, { status: 403 });
    }

    const json = await request.json().catch(() => null);
    const parsed = manualProfileInitSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const ensured = await ensureAuthUserForManualProfile(service, email, password);
    if (!ensured.ok) {
      return NextResponse.json({ error: ensured.error }, { status: ensured.status });
    }

    const emailResult = await sendManualProfileAccountEmail(email, {
      emailConfirmed: ensured.emailConfirmed,
    });

    const message = ensured.attachedToExistingAccount
      ? "Account updated. We emailed them a sign-in link (or share the temporary password you set)."
      : "Account created. We sent a verification link to their email — they should confirm before signing in. Share the temporary password securely.";

    return NextResponse.json({
      ok: true,
      userId: ensured.userId,
      accountEmail: email,
      attachedToExistingAccount: ensured.attachedToExistingAccount,
      createdAuthUser: ensured.createdAuthUser,
      emailSent: emailResult.sent,
      emailWarning: emailResult.warning,
      message,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
