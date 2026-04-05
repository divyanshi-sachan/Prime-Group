import { NextResponse } from "next/server";
import { requireUserWithBasicProfile, type SupabaseServerClient } from "@/lib/api-require-basic-profile";
import { createServiceRoleClient } from "@/lib/supabase/server-service";

export const dynamic = "force-dynamic";

const UNLOCK_COST = 1; // credits per profile unlock

export async function POST(req: Request) {
  try {
    const gate = await requireUserWithBasicProfile();
    if (!gate.ok) return gate.response;
    const { user, supabase } = gate;

    const body = await req.json();
    const profileId = body?.profile_id as string | undefined;
    if (!profileId) {
      return NextResponse.json({ error: "profile_id required" }, { status: 400 });
    }

    // Prevent unlocking own profile
    const { data: ownProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (ownProfile?.id === profileId) {
      return NextResponse.json({ error: "Cannot unlock own profile" }, { status: 400 });
    }

    // Check if already unlocked
    const { data: existing } = await supabase
      .from("contact_unlocks")
      .select("id")
      .eq("user_id", user.id)
      .eq("profile_id", profileId)
      .maybeSingle();

    if (existing) {
      // Already unlocked — return contact info
      const contact = await getContactInfo(supabase, profileId);
      return NextResponse.json({ success: true, already_unlocked: true, ...contact });
    }

    // Check credits
    const { data: userRow } = await supabase
      .from("users")
      .select("credits")
      .eq("id", user.id)
      .single();

    const currentCredits = Number((userRow as { credits?: number } | null)?.credits) || 0;
    if (currentCredits < UNLOCK_COST) {
      return NextResponse.json(
        { error: "Insufficient credits", credits: currentCredits },
        { status: 402 }
      );
    }

    // Deduct credits and insert unlock (use service role for atomic update)
    const serviceSupabase = createServiceRoleClient();

    const { error: updateError } = await serviceSupabase
      .from("users")
      .update({
        credits: currentCredits - UNLOCK_COST,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Credit deduction error:", updateError);
      return NextResponse.json({ error: "Failed to deduct credits" }, { status: 500 });
    }

    const { error: insertError } = await supabase
      .from("contact_unlocks")
      .insert({
        user_id: user.id,
        profile_id: profileId,
        credits_spent: UNLOCK_COST,
      });

    if (insertError) {
      // Rollback credit deduction
      await serviceSupabase
        .from("users")
        .update({
          credits: currentCredits,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      console.error("Unlock insert error:", insertError);
      return NextResponse.json({ error: "Failed to record unlock" }, { status: 500 });
    }

    const contact = await getContactInfo(supabase, profileId);
    return NextResponse.json({
      success: true,
      credits_remaining: currentCredits - UNLOCK_COST,
      ...contact,
    });
  } catch (e) {
    console.error("credits/unlock error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

async function getContactInfo(supabase: SupabaseServerClient, profileId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, contact_number, permanent_address, current_address")
    .eq("id", profileId)
    .single();

  const row = profile as {
    user_id?: string;
    contact_number?: string | null;
    permanent_address?: string | null;
    current_address?: string | null;
  } | null;

  let email: string | null = null;
  if (row?.user_id) {
    const serviceSupabase = createServiceRoleClient();
    const { data: userRow } = await serviceSupabase
      .from("users")
      .select("email")
      .eq("id", row.user_id)
      .single();
    email = (userRow as { email?: string } | null)?.email ?? null;
  }

  return {
    contact_number: row?.contact_number ?? null,
    permanent_address: row?.permanent_address ?? null,
    current_address: row?.current_address ?? null,
    email,
  };
}
