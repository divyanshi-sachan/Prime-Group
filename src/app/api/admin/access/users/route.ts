import { NextResponse } from "next/server";
import { requireAdminService } from "@/lib/admin/require-admin-service";

const LIMIT = 50;

type UserRow = {
  id: string;
  email: string;
  created_at?: string;
  profiles: { full_name?: string | null; city?: string | null } | { full_name?: string | null; city?: string | null }[] | null;
};

function normalizeUser(row: unknown): UserRow | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  if (typeof r.id !== "string" || typeof r.email !== "string") return null;
  const profiles = r.profiles;
  return {
    id: r.id as string,
    email: r.email as string,
    created_at: typeof r.created_at === "string" ? r.created_at : undefined,
    profiles:
      profiles === null || Array.isArray(profiles) || (typeof profiles === "object" && profiles !== null)
        ? (profiles as UserRow["profiles"])
        : null,
  };
}

/** Search users with role=user by email (primary) or profile full_name. Only admins can call. */
export async function GET(request: Request) {
  try {
    const gate = await requireAdminService();
    if (!gate.ok) return gate.response;
    const { service } = gate;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() ?? "";

    if (!search) {
      const { data: rows, error } = await service
        .from("users")
        .select("id, email, created_at, profiles!profiles_user_id_fkey(full_name, city)")
        .eq("role", "user")
        .order("created_at", { ascending: false })
        .limit(LIMIT);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      const users = (rows ?? []).map(normalizeUser).filter((u): u is UserRow => u !== null);
      return NextResponse.json({ users });
    }

    const pattern = `%${search}%`;
    const { data: byEmail, error: e1 } = await service
      .from("users")
      .select("id, email, created_at, profiles!profiles_user_id_fkey(full_name, city)")
      .eq("role", "user")
      .ilike("email", pattern)
      .limit(LIMIT);
    if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
    const emailUsers = (byEmail ?? []).map(normalizeUser).filter((u): u is UserRow => u !== null);

    const { data: byProfile } = await service
      .from("profiles")
      .select("user_id, full_name, city")
      .ilike("full_name", pattern)
      .limit(LIMIT);
    if (!byProfile?.length) {
      return NextResponse.json({ users: emailUsers });
    }
    const userIds = [...new Set((byProfile as { user_id: string }[]).map((p) => p.user_id))];
    const { data: usersByName, error: e2 } = await service
      .from("users")
      .select("id, email, created_at, profiles!profiles_user_id_fkey(full_name, city)")
      .eq("role", "user")
      .in("id", userIds);
    if (e2) return NextResponse.json({ users: emailUsers });

    const byEmailIds = new Set(emailUsers.map((u) => u.id));
    const combined = [...emailUsers];
    for (const row of usersByName ?? []) {
      const u = normalizeUser(row);
      if (u && !byEmailIds.has(u.id)) {
        combined.push(u);
        if (combined.length >= LIMIT) break;
      }
    }
    return NextResponse.json({ users: combined });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
