"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KeyRound, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useAdminViewMode } from "@/hooks/use-admin-view-mode";
import { AdminViewModeToggle } from "@/components/admin/admin-view-mode-toggle";
import type { AdminAuthUserListRow } from "@/lib/admin/auth-user-display-fields";

type AuthUserRow = AdminAuthUserListRow;
type AuthUsersSegment = "all" | "no_profile";

const VIEW_KEY = "adminAuthUsersViewMode";

export default function AdminAuthUsersPage() {
  const [segment, setSegment] = useState<AuthUsersSegment>("all");
  const [users, setUsers] = useState<AuthUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [viewMode, setViewMode] = useAdminViewMode(VIEW_KEY, "cards");
  const perPage = 50;

  const fetchUsers = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const path =
        segment === "no_profile"
          ? `/api/admin/auth-users/no-profile?page=${p}&perPage=${perPage}`
          : `/api/admin/auth-users?page=${p}&perPage=${perPage}`;
      const res = await fetch(path, {
        credentials: "include",
      });
      const json = (await res.json()) as {
        users?: AuthUserRow[];
        hasMore?: boolean;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error || `Failed to load (${res.status})`);
      }
      setUsers(json.users ?? []);
      setHasMore(!!json.hasMore);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [perPage, segment]);

  useEffect(() => {
    void fetchUsers(page);
  }, [page, fetchUsers]);

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

  const cardStyle = { borderColor: "rgba(212, 175, 55, 0.25)", backgroundColor: "white" };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <h1 className="text-2xl font-playfair-display font-bold flex items-center gap-2" style={{ color: "var(--primary-blue)" }}>
            <KeyRound className="w-7 h-7 shrink-0" style={{ color: "var(--accent-gold)" }} />
            Auth users
          </h1>
          <p className="font-general text-sm text-gray-600 max-w-3xl">
            Browse everyone in Auth, or members who have <span className="font-medium">no active profile</span>{" "}
            in the database (no <span className="font-medium">profiles</span> row with{" "}
            <span className="font-medium">deleted_at</span> null). Anyone with a live profile—including
            pending or active—is excluded. Use <span className="font-medium">All accounts</span> for name and phone
            from Auth; the no-profile list shows email and activity from the member table only (lighter load).
          </p>
          <div
            className="inline-flex flex-wrap rounded-xl border p-1 bg-white shadow-sm"
            style={{ borderColor: "rgba(212, 175, 55, 0.45)" }}
            role="tablist"
            aria-label="Which accounts to show"
          >
            <Button
              type="button"
              variant={segment === "all" ? "default" : "ghost"}
              size="sm"
              className={`rounded-lg font-general px-4 ${segment === "all" ? "text-white shadow-sm" : "text-gray-700"}`}
              style={segment === "all" ? { backgroundColor: "var(--primary-blue)" } : undefined}
              onClick={() => {
                setSegment("all");
                setPage(1);
              }}
              aria-pressed={segment === "all"}
            >
              All accounts
            </Button>
            <Button
              type="button"
              variant={segment === "no_profile" ? "default" : "ghost"}
              size="sm"
              className={`rounded-lg font-general px-4 ${segment === "no_profile" ? "text-white shadow-sm" : "text-gray-700"}`}
              style={segment === "no_profile" ? { backgroundColor: "var(--primary-blue)" } : undefined}
              onClick={() => {
                setSegment("no_profile");
                setPage(1);
              }}
              aria-pressed={segment === "no_profile"}
            >
              No active profile
            </Button>
          </div>
        </div>
        <Button
          variant="outline"
          className="gap-2 rounded-xl font-general shrink-0 self-start"
          style={{ borderColor: "var(--accent-gold)" }}
          onClick={() => void fetchUsers(page)}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 font-general">
          {error}
        </div>
      )}

      <Card className="rounded-xl border shadow-sm" style={cardStyle}>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
          <CardTitle className="font-playfair-display" style={{ color: "var(--primary-blue)" }}>
            {segment === "no_profile" ? "Signed up, no active profile" : "Supabase Auth"} · Page {page}
          </CardTitle>
          {!loading && users.length > 0 ? <AdminViewModeToggle value={viewMode} onChange={setViewMode} /> : null}
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 rounded-lg border" style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
              <Spinner
                size="md"
                label={segment === "no_profile" ? "Loading users without a profile…" : "Loading auth users…"}
              />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500 font-general rounded-lg border" style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
              {segment === "no_profile"
                ? "Every member account has at least one active profile row. There is no one in this list right now."
                : "No users found."}
            </div>
          ) : viewMode === "list" ? (
            <div className="rounded-lg border overflow-x-auto" style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-general min-w-[200px]">Email</TableHead>
                    <TableHead className="font-general min-w-[140px]">Name</TableHead>
                    <TableHead className="font-general min-w-[120px]">Phone</TableHead>
                    <TableHead className="font-general">Email verified</TableHead>
                    <TableHead className="font-general">Created</TableHead>
                    <TableHead className="font-general">Last sign-in</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} className="font-general align-top">
                      <TableCell className="py-4 font-medium" style={{ color: "var(--primary-blue)" }}>
                        {u.email ?? "—"}
                        {u.is_anonymous && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            anonymous
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-700">{u.full_name ?? "—"}</TableCell>
                      <TableCell className="py-4 text-sm text-gray-700">{u.phone ?? "—"}</TableCell>
                      <TableCell className="py-4">
                        {u.email_confirmed_at ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(u.created_at)}</TableCell>
                      <TableCell className="py-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(u.last_sign_in_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="rounded-2xl border bg-white p-5 shadow-sm flex flex-col gap-3"
                  style={{ borderColor: "rgba(212, 175, 55, 0.35)" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-general">Email</p>
                      <p className="font-semibold break-all" style={{ color: "var(--primary-blue)" }}>
                        {u.email ?? "—"}
                      </p>
                      {u.is_anonymous ? (
                        <Badge variant="outline" className="mt-1 text-xs">
                          anonymous
                        </Badge>
                      ) : null}
                    </div>
                    {u.email_confirmed_at ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200 shrink-0">Verified</Badge>
                    ) : (
                      <Badge variant="secondary" className="shrink-0">
                        Unverified
                      </Badge>
                    )}
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 space-y-2 text-sm font-general">
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="font-medium text-gray-800">{u.full_name ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium text-gray-800">{u.phone ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="text-gray-700">{formatDate(u.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last sign-in</p>
                      <p className="text-gray-700">{formatDate(u.last_sign_in_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <p className="text-sm text-gray-500 font-general">
              Showing {users.length} user{users.length === 1 ? "" : "s"} on this page
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="font-general rounded-lg"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || !hasMore}
                onClick={() => setPage((p) => p + 1)}
                className="font-general rounded-lg"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
