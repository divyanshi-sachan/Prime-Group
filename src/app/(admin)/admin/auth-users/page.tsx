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

interface AuthUserRow {
  id: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  is_anonymous: boolean;
}

export default function AdminAuthUsersPage() {
  const [users, setUsers] = useState<AuthUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
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

  const cardStyle = { borderColor: "rgba(212, 175, 55, 0.25)", backgroundColor: "white" };

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
        <CardHeader>
          <CardTitle className="font-playfair-display" style={{ color: "var(--primary-blue)" }}>
            Supabase Auth · Page {page}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border overflow-x-auto" style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-general min-w-[200px]">Email</TableHead>
                  <TableHead className="font-general">Phone</TableHead>
                  <TableHead className="font-general">Email verified</TableHead>
                  <TableHead className="font-general">Created</TableHead>
                  <TableHead className="font-general">Last sign-in</TableHead>
                  <TableHead className="font-general w-[100px]">User ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Spinner size="md" label="Loading auth users…" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500 font-general">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id} className="font-general">
                      <TableCell className="font-medium" style={{ color: "var(--primary-blue)" }}>
                        {u.email ?? "—"}
                        {u.is_anonymous && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            anonymous
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">{u.phone ?? "—"}</TableCell>
                      <TableCell>
                        {u.email_confirmed_at ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 whitespace-nowrap">{formatDate(u.created_at)}</TableCell>
                      <TableCell className="text-sm text-gray-600 whitespace-nowrap">{formatDate(u.last_sign_in_at)}</TableCell>
                      <TableCell className="text-xs text-gray-500 font-mono max-w-[120px] truncate" title={u.id}>
                        {u.id.slice(0, 8)}…
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
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
                className="font-general"
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
                className="font-general"
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
