"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Search, RefreshCw, Eye, Trash2, Loader2, UserPlus } from "lucide-react";
import { AdminManualProfileDialog } from "@/components/admin/admin-manual-profile-dialog";
import { Spinner } from "@/components/ui/spinner";
import { AdminProfileModal } from "@/components/admin/admin-profile-modal";

interface ProfileRow {
  id: string;
  user_id: string;
  full_name: string;
  gender: string;
  city: string | null;
  profile_status: string;
  profile_completion_pct: number | null;
  created_at: string;
  contact_number?: string | null;
  users?: { email: string } | { email: string }[];
}

export default function AdminProfilesPage() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [manualProfileOpen, setManualProfileOpen] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/profiles");
      if (!res.ok) {
        let details = "";
        try {
          const json = (await res.json()) as { error?: string };
          if (json?.error) details = json.error;
        } catch {
          try {
            details = await res.text();
          } catch {
            details = "";
          }
        }
        throw new Error(
          details ? `Failed to load profiles: ${details}` : `Failed to load profiles: ${res.status}`
        );
      }
      const json = (await res.json()) as { profiles?: ProfileRow[] };
      setProfiles(json.profiles ?? []);
    } catch (e) {
      console.error(e);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    const email =
      p.users && !Array.isArray(p.users)
        ? (p.users as { email: string }).email
        : p.users && Array.isArray(p.users)
          ? p.users[0]?.email
          : "";
    const matchSearch =
      !search ||
      p.full_name?.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q) ||
      (p.contact_number ?? "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || p.profile_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (profileId: string, newStatus: string) => {
    setStatusUpdatingId(profileId);
    try {
      const res = await fetch("/api/admin/profiles/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ profileId, profile_status: newStatus }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }
      setProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, profile_status: newStatus } : p))
      );
    } catch (e) {
      console.error(e);
      window.alert(
        e instanceof Error && e.message
          ? `Could not update status: ${e.message}`
          : "Could not update status. Check admin permissions and try again."
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const deleteProfile = async (profileId: string) => {
    if (!confirm("Are you sure you want to delete this profile? This will hide it from the site.")) return;
    setDeletingId(profileId);
    try {
      const res = await fetch(`/api/admin/profiles/${profileId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        window.alert(data.error ?? `Could not delete profile (${res.status})`);
        return;
      }
      setProfiles((prev) => prev.filter((p) => p.id !== profileId));
    } catch (e) {
      console.error(e);
      window.alert(
        e instanceof Error && e.message
          ? `Could not delete profile: ${e.message}`
          : "Could not delete profile. Try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const cardStyle = { borderColor: "rgba(212, 175, 55, 0.25)", backgroundColor: "white" };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-playfair-display font-bold flex items-center gap-2" style={{ color: "var(--primary-blue)" }}>
            <Users className="w-7 h-7" style={{ color: "var(--accent-gold)" }} />
            Profiles
          </h1>
          <p className="font-general text-sm mt-1 text-gray-600">
            Open a profile to view everything or edit all fields. Use the table for a quick overview only.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="gap-2 rounded-xl font-general text-white"
            style={{ backgroundColor: "var(--primary-blue)" }}
            onClick={() => setManualProfileOpen(true)}
          >
            <UserPlus className="w-4 h-4" />
            Add offline profile
          </Button>
          <Button
            variant="outline"
            className="gap-2 rounded-xl font-general"
            style={{ borderColor: "var(--accent-gold)" }}
            onClick={() => fetchProfiles()}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="rounded-xl border shadow-sm" style={cardStyle}>
        <CardHeader>
          <CardTitle className="font-playfair-display" style={{ color: "var(--primary-blue)" }}>
            All profiles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search name, email, phone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-lg border-gray-200"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-general"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="rounded-lg border overflow-x-auto" style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-general min-w-[140px]">Name</TableHead>
                  <TableHead className="font-general min-w-[100px]">Status</TableHead>
                  <TableHead className="font-general min-w-[200px]">Contact</TableHead>
                  <TableHead className="font-general w-[140px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Spinner size="md" label="Loading profiles…" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500 font-general">
                      No profiles found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((p) => (
                    <TableRow key={p.id} className="font-general">
                      <TableCell className="font-medium" style={{ color: "var(--primary-blue)" }}>
                        {p.full_name}
                      </TableCell>
                      <TableCell className="min-w-[160px]">
                        <div className="flex items-center gap-2">
                          <select
                            value={p.profile_status}
                            disabled={statusUpdatingId === p.id}
                            onChange={(e) => {
                              const next = e.target.value;
                              if (next && next !== p.profile_status) void updateStatus(p.id, next);
                            }}
                            className="h-9 w-full max-w-[200px] rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm font-general text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/30 disabled:opacity-60"
                            aria-label={`Status for ${p.full_name}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="active">Active (accepted)</option>
                            <option value="rejected">Rejected</option>
                            <option value="suspended">Suspended</option>
                          </select>
                          {statusUpdatingId === p.id ? (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gray-400" aria-hidden />
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs text-gray-600">
                          {p.users ? (
                            <span className="break-all">
                              {Array.isArray(p.users) ? p.users[0]?.email : (p.users as { email: string }).email}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">No email</span>
                          )}
                          {p.contact_number ? (
                            <span>{p.contact_number}</span>
                          ) : (
                            <span className="text-gray-400 italic">No phone</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            onClick={() => setViewingProfileId(p.id)}
                            title="View & edit"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => deleteProfile(p.id)}
                            disabled={deletingId === p.id}
                            title="Delete profile"
                            aria-busy={deletingId === p.id}
                          >
                            {deletingId === p.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                            ) : (
                              <Trash2 className="w-4 h-4" aria-hidden />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AdminProfileModal
        profileId={viewingProfileId}
        open={viewingProfileId !== null}
        onOpenChange={(open) => {
          if (!open) setViewingProfileId(null);
        }}
        onStatusUpdate={updateStatus}
      />

      <AdminManualProfileDialog
        open={manualProfileOpen}
        onOpenChange={setManualProfileOpen}
        onCreated={() => fetchProfiles()}
      />
    </div>
  );
}
