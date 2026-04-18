import { NextResponse } from "next/server";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { manualProfileInitSchema } from "@/lib/admin/manual-profile-schema";
import {
  ensureAuthUserForManualProfile,
  sendManualProfileAccountEmail,
} from "@/lib/admin/manual-profile-auth";

export async function POST(request: Request) {
  try {
    const gate = await requireAdminService();
    if (!gate.ok) return gate.response;
    const { service } = gate;

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
