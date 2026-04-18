import { NextResponse } from "next/server";
import { requireAdminService } from "@/lib/admin/require-admin-service";
import { manualProfileFinalizeSchema } from "@/lib/admin/manual-profile-schema";

function estimateCompletionPct(row: Record<string, unknown>): number {
  const keys = [
    "full_name",
    "gender",
    "date_of_birth",
    "city",
    "country",
    "contact_number",
    "religion",
    "highest_education",
    "occupation",
    "marital_status",
    "height_cm",
    "about_me",
    "college_university",
    "gotra",
    "father_name",
    "mother_name",
  ];
  let filled = 0;
  for (const k of keys) {
    const v = row[k];
    if (v !== null && v !== undefined && v !== "") filled++;
  }
  return Math.min(95, Math.max(25, Math.round((filled / keys.length) * 100)));
}

/**
 * Creates profile + partner preferences for a member whose account was provisioned via
 * POST /api/admin/profiles/manual/init.
 */
export async function POST(request: Request) {
  try {
    const gate = await requireAdminService();
    if (!gate.ok) return gate.response;
    const { service } = gate;

    const json = await request.json().catch(() => null);
    const parsed = manualProfileFinalizeSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const body = parsed.data;
    const email = body.email;

    const { data: existingUser, error: userLookupError } = await service
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (userLookupError) {
      return NextResponse.json({ error: userLookupError.message }, { status: 500 });
    }

    if (!existingUser?.id) {
      return NextResponse.json(
        {
          error:
            "No account found for this email. Go back to step 1 and complete Member email & password first.",
        },
        { status: 400 }
      );
    }

    const userId = existingUser.id;

    const { data: existingProfile, error: profLookupError } = await service
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (profLookupError) {
      return NextResponse.json({ error: profLookupError.message }, { status: 500 });
    }

    if (existingProfile?.id) {
      return NextResponse.json(
        {
          error:
            "This email already has a profile. Use a different email or edit the existing profile.",
        },
        { status: 409 }
      );
    }

    const approvedAt = body.profile_status === "active" ? new Date().toISOString() : null;

    const profileRow: Record<string, unknown> = {
      user_id: userId,
      full_name: body.full_name.trim(),
      gender: body.gender,
      date_of_birth: body.date_of_birth,
      marital_status: body.marital_status ?? null,
      height_cm: body.height_cm ?? null,
      religion: body.religion ?? null,
      mother_tongue: body.mother_tongue ?? null,
      profile_for: body.profile_for ?? null,
      country: body.country ?? null,
      state: body.state ?? null,
      city: body.city ?? null,
      citizenship: body.citizenship ?? null,
      residing_in: body.residing_in ?? null,
      willing_to_relocate: body.willing_to_relocate ?? null,
      highest_education: body.highest_education ?? null,
      college_university: body.college_university ?? null,
      field_of_study: body.field_of_study ?? null,
      employed_in: body.employed_in ?? null,
      occupation: body.occupation ?? null,
      organization: body.organization ?? null,
      annual_income: body.annual_income ?? null,
      father_name: body.father_name ?? null,
      father_occupation: body.father_occupation ?? null,
      mother_name: body.mother_name ?? null,
      mother_occupation: body.mother_occupation ?? null,
      siblings_count: body.siblings_count ?? null,
      profile_status: body.profile_status,
      is_visible: body.is_visible,
      profile_completion_pct: 0,
      admin_notes: body.admin_notes ?? null,
      rejection_reason: body.rejection_reason ?? null,
      approved_at: approvedAt,
      updated_at: new Date().toISOString(),
      about_me: body.about_me ?? null,
      show_education: body.show_education,
      show_occupation: body.show_occupation,
      show_family: body.show_family,
      show_location: body.show_location,
      birth_time: body.birth_time ?? null,
      birthplace: body.birthplace ?? null,
      complexion: body.complexion ?? null,
      school: body.school ?? null,
      gotra: body.gotra ?? null,
      has_siblings: body.has_siblings,
      siblings_brothers: body.siblings_brothers ?? null,
      siblings_sisters: body.siblings_sisters ?? null,
      siblings_notes: body.siblings_notes ?? null,
      permanent_address: body.permanent_address ?? null,
      current_address: body.current_address ?? null,
      contact_number: body.contact_number ?? null,
      verification_status: body.verification_status ?? "unverified",
    };

    profileRow.profile_completion_pct = estimateCompletionPct(profileRow);

    const { data: inserted, error: insertError } = await service
      .from("profiles")
      .insert(profileRow)
      .select("id")
      .single();

    if (insertError || !inserted?.id) {
      return NextResponse.json(
        { error: insertError?.message ?? "Failed to create profile" },
        { status: 500 }
      );
    }

    const { error: prefErr } = await service.from("partner_preferences").insert({
      profile_id: inserted.id,
      user_id: userId,
      age_min: body.age_min ?? null,
      age_max: body.age_max ?? null,
      additional_notes: body.additional_notes ?? null,
      updated_at: new Date().toISOString(),
    });

    if (prefErr) {
      await service.from("profiles").delete().eq("id", inserted.id);
      return NextResponse.json(
        { error: prefErr.message ?? "Failed to create partner preferences" },
        { status: 500 }
      );
    }

    const { data: authUserData } = await service.auth.admin.getUserById(userId);
    const isFreshManualSignup =
      authUserData?.user?.user_metadata &&
      typeof authUserData.user.user_metadata === "object" &&
      (authUserData.user.user_metadata as Record<string, unknown>).source === "admin_manual_profile";
    const attachedToExistingAccount = !isFreshManualSignup;

    const message = attachedToExistingAccount
      ? "Profile linked to their existing account. They should have received a sign-in link in step 1; share the temporary password if they prefer password login."
      : "Profile saved. They should confirm their email from the message we sent in step 1, then sign in with this address and the temporary password you set.";

    return NextResponse.json({
      ok: true,
      profileId: inserted.id,
      userId,
      accountEmail: email,
      attachedToExistingAccount,
      message,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
