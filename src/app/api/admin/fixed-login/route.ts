import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { ADMIN_AUTH_STORAGE_KEY } from "@/lib/supabase/admin-session";
import { createServiceRoleClient } from "@/lib/supabase/server-service";

/** Access: **public_secret** — env credentials only; see `@/lib/api-route-access`. */

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

/**
 * Route handlers must attach Supabase auth cookies to the returned `NextResponse`.
 * `cookies().set()` from `createAdminServerClient()` does not reliably merge into `NextResponse.json()`.
 */
function createRouteHandlerAdminClient(
  request: NextRequest,
  jar: Map<string, { value: string; options?: CookieOptions }>
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: ADMIN_AUTH_STORAGE_KEY },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            jar.set(name, { value, options });
          });
        },
      },
    }
  );
}

function jsonWithSessionCookies(
  body: object,
  jar: Map<string, { value: string; options?: CookieOptions }>
) {
  const res = NextResponse.json(body);
  jar.forEach(({ value, options }, name) => {
    res.cookies.set(name, value, options);
  });
  return res;
}

/** Ensures `public.users` has a row with admin role (repair path / users created outside signup trigger). */
async function ensureAdminUserRow(userId: string, email: string): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    const service = createServiceRoleClient();
    const { error } = await service.from("users").upsert(
      {
        id: userId,
        email,
        role: "super_admin",
        status: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    if (error) {
      console.error("[fixed-login] ensureAdminUserRow:", error.message);
    }
  } catch (e) {
    console.error("[fixed-login] ensureAdminUserRow:", e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
    };
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    const adminEmail = process.env.ADMIN_FIXED_EMAIL ?? "";
    const adminPassword = process.env.ADMIN_FIXED_PASSWORD ?? "";

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: "Admin login is not configured" },
        { status: 500 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    if (!safeEqual(email.toLowerCase(), adminEmail.toLowerCase()) || !safeEqual(password, adminPassword)) {
      return NextResponse.json(
        { error: "Invalid login credentials" },
        { status: 401 }
      );
    }

    const jar = new Map<string, { value: string; options?: CookieOptions }>();
    const supabase = createRouteHandlerAdminClient(request, jar);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (error || !data.user) {
      const isInvalidCreds =
        (error?.message || "").toLowerCase().includes("invalid login credentials");
      if (!isInvalidCreds) {
        return NextResponse.json(
          { error: error?.message || "Login failed" },
          { status: 401 }
        );
      }

      const service = createServiceRoleClient();

      const created = await service.auth.admin
        .createUser({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
        })
        .catch((e) => ({ data: { user: null }, error: e as Error }));

      let userId: string | null =
        created && "data" in created && created.data?.user?.id
          ? created.data.user.id
          : null;

      if (!userId) {
        const listed = await service.auth.admin.listUsers({ page: 1, perPage: 200 });
        const existing = (listed.data?.users ?? []).find(
          (u) => (u.email || "").toLowerCase() === adminEmail.toLowerCase()
        );
        if (existing?.id) {
          userId = existing.id;
          await service.auth.admin.updateUserById(userId, {
            password: adminPassword,
            email_confirm: true,
          });
        }
      }

      const retry = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });

      if (retry.error || !retry.data.user) {
        return NextResponse.json(
          { error: retry.error?.message || "Invalid admin credentials" },
          { status: 401 }
        );
      }

      await ensureAdminUserRow(
        retry.data.user.id,
        retry.data.user.email ?? adminEmail
      );
      return jsonWithSessionCookies({ success: true, repaired: true }, jar);
    }

    await ensureAdminUserRow(data.user.id, data.user.email ?? adminEmail);
    return jsonWithSessionCookies({ success: true }, jar);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
