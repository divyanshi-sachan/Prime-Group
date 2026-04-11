import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server-service";
import { parseContactLeadershipJson } from "@/lib/contact-leadership";

export const dynamic = "force-dynamic";

/** Public: leadership team for Contact Us carousel (no auth). */
export async function GET() {
  try {
    const service = createServiceRoleClient();
    const { data, error } = await service
      .from("app_settings")
      .select("value")
      .eq("key", "contact_leadership")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const members = parseContactLeadershipJson((data as { value?: string } | null)?.value);
    return NextResponse.json({ members });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
