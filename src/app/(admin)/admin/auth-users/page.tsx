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
import { KeyRound, RefreshCw, ChevronLeft, ChevronRight, Copy, Check } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useAdminViewMode } from "@/hooks/use-admin-view-mode";
import { AdminViewModeToggle } from "@/components/admin/admin-view-mode-toggle";

interface AuthUserRow {
  id: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  is_anonymous: boolean;
}

const VIEW_KEY = "adminAuthUsersViewMode";

export default function AdminAuthUsersPage() {
  const [users, setUsers] = useState<AuthUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useAdminViewMode(VIEW_KEY, "cards");
  const perPage = 50;

  const fetchUsers = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/auth-users?page=${p}&perPage=${perPage}`, {
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
  }, [perPage]);

  useEffect(() => {
    void fetchUsers(page);
  }, [page, fetchUsers]);

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 2000);
    } catch {
      /* ignore */
    }
  };

  const cardStyle = { borderColor: "rgba(212, 175, 55, 0.25)", backgroundColor: "white" };

  const CopyIdButton = ({ userId, layout }: { userId: string; layout: "list" | "cards" }) => {
    const done = copiedId === userId;
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={`gap-2 min-h-10 px-4 font-general font-semibold rounded-lg border-2 shadow-sm ${layout === "cards" ? "w-full sm:w-auto" : ""}`}
        style={{
          borderColor: done ? "rgb(22 163 74)" : "rgba(212, 175, 55, 0.45)",
          color: done ? "rgb(21 128 61)" : "var(--primary-blue)",
          backgroundColor: "white",
        }}
        onClick={() => void copyId(userId)}
      >
        {done ? <Check className="w-4 h-4 shrink-0" aria-hidden /> : <Copy className="w-4 h-4 shrink-0" aria-hidden />}
        {done ? "Copied" : "Copy user ID"}
      </Button>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-playfair-display font-bold flex items-center gap-2" style={{ color: "var(--primary-blue)" }}>
            <KeyRound className="w-7 h-7" style={{ color: "var(--accent-gold)" }} />
            Auth users
          </h1>
          <p className="font-general text-sm mt-1 text-gray-600">
            All accounts in Supabase Auth (email, verification, last sign-in). Paginated.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 rounded-xl font-general"
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
            Supabase Auth · Page {page}
          </CardTitle>
          {!loading && users.length > 0 ? <AdminViewModeToggle value={viewMode} onChange={setViewMode} /> : null}
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 rounded-lg border" style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
              <Spinner size="md" label="Loading auth users…" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500 font-general rounded-lg border" style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
              No users found.
            </div>
          ) : viewMode === "list" ? (
            <div className="rounded-lg border overflow-x-auto" style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-general min-w-[200px]">Email</TableHead>
                    <TableHead className="font-general">Phone</TableHead>
                    <TableHead className="font-general">Email verified</TableHead>
                    <TableHead className="font-general">Created</TableHead>
                    <TableHead className="font-general">Last sign-in</TableHead>
                    <TableHead className="font-general min-w-[200px] text-right">Actions</TableHead>
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
                      <TableCell className="py-4 text-right">
                        <CopyIdButton userId={u.id} layout="list" />
                      </TableCell>
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
                    <div>
                      <p className="text-xs text-gray-500">User ID</p>
                      <p className="font-mono text-xs break-all text-gray-600">{u.id}</p>
                    </div>
                  </div>
                  <CopyIdButton userId={u.id} layout="cards" />
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
