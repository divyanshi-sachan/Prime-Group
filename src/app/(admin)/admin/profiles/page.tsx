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
import {
  Users,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  Loader2,
  UserPlus,
  LayoutList,
  LayoutGrid,
  MapPin,
} from "lucide-react";
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

const VIEW_MODE_KEY = "adminProfilesViewMode";

function profileEmail(p: ProfileRow): string {
  if (!p.users) return "";
  return Array.isArray(p.users) ? (p.users[0]?.email ?? "") : (p.users as { email: string }).email;
}

function ProfileStatusSelect({
  profile,
  statusUpdatingId,
  onChange,
  className = "",
}: {
  profile: ProfileRow;
  statusUpdatingId: string | null;
  onChange: (profileId: string, status: string) => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <select
        value={profile.profile_status}
        disabled={statusUpdatingId === profile.id}
        onChange={(e) => {
          const next = e.target.value;
          if (next && next !== profile.profile_status) onChange(profile.id, next);
        }}
        className="h-10 w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-general text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/30 disabled:opacity-60"
        aria-label={`Status for ${profile.full_name}`}
      >
        <option value="pending">Pending</option>
        <option value="active">Active (accepted)</option>
        <option value="rejected">Rejected</option>
        <option value="suspended">Suspended</option>
      </select>
      {statusUpdatingId === profile.id ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gray-400" aria-hidden />
      ) : null}
    </div>
  );
}

function ProfileActionButtons({
  profile,
  deletingId,
  onOpen,
  onDelete,
  layout,
}: {
  profile: ProfileRow;
  deletingId: string | null;
  onOpen: () => void;
  onDelete: () => void;
  layout: "list" | "cards";
}) {
  const isDeleting = deletingId === profile.id;
  const wrapClass =
    layout === "cards"
      ? "flex flex-col sm:flex-row gap-2 w-full"
      : "flex flex-wrap items-center justify-end gap-2";

  return (
    <div className={wrapClass} role="group" aria-label={`Actions for ${profile.full_name}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 min-h-10 px-4 font-general font-semibold rounded-lg border-2 shadow-sm shrink-0"
        style={{
          borderColor: "var(--primary-blue)",
          color: "var(--primary-blue)",
          backgroundColor: "white",
        }}
        onClick={onOpen}
      >
        <Eye className="w-4 h-4 shrink-0" aria-hidden />
        Open profile
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 min-h-10 px-4 font-general font-semibold rounded-lg border-2 border-red-200 text-red-700 bg-white shadow-sm hover:bg-red-50 hover:text-red-800 hover:border-red-300 shrink-0"
        onClick={onDelete}
        disabled={isDeleting}
        aria-busy={isDeleting}
      >
        {isDeleting ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden />
        ) : (
          <Trash2 className="w-4 h-4 shrink-0" aria-hidden />
        )}
        Delete
      </Button>
    </div>
  );
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
  const [viewMode, setViewMode] = useState<"list" | "cards">("cards");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(VIEW_MODE_KEY);
      if (stored === "cards" || stored === "list") setViewMode(stored);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_MODE_KEY, viewMode);
    } catch {
      /* ignore */
    }
  }, [viewMode]);

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
    const email = profileEmail(p);
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
            Switch between list and cards. Open a profile to view and edit all fields.
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
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2 flex-1">
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
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-general h-10"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div
              className="inline-flex rounded-xl border p-1 bg-gray-50/80 shrink-0"
              style={{ borderColor: "rgba(212, 175, 55, 0.35)" }}
              role="group"
              aria-label="Profile layout"
            >
              <Button
                type="button"
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className={`gap-2 rounded-lg font-general ${viewMode === "list" ? "text-white shadow-sm" : "text-gray-600"}`}
                style={viewMode === "list" ? { backgroundColor: "var(--primary-blue)" } : undefined}
                onClick={() => setViewMode("list")}
                aria-pressed={viewMode === "list"}
              >
                <LayoutList className="w-4 h-4" aria-hidden />
                List
              </Button>
              <Button
                type="button"
                variant={viewMode === "cards" ? "default" : "ghost"}
                size="sm"
                className={`gap-2 rounded-lg font-general ${viewMode === "cards" ? "text-white shadow-sm" : "text-gray-600"}`}
                style={viewMode === "cards" ? { backgroundColor: "var(--primary-blue)" } : undefined}
                onClick={() => setViewMode("cards")}
                aria-pressed={viewMode === "cards"}
              >
                <LayoutGrid className="w-4 h-4" aria-hidden />
                Cards
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-lg border" style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
              <Spinner size="md" label="Loading profiles…" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-general rounded-lg border" style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
              No profiles found.
            </div>
          ) : viewMode === "list" ? (
            <div className="rounded-lg border overflow-x-auto" style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-general min-w-[160px]">Name</TableHead>
                    <TableHead className="font-general min-w-[200px]">Status</TableHead>
                    <TableHead className="font-general min-w-[220px]">Contact</TableHead>
                    <TableHead className="font-general min-w-[280px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id} className="font-general align-top">
                      <TableCell className="font-semibold py-4" style={{ color: "var(--primary-blue)" }}>
                        <button
                          type="button"
                          className="text-left hover:underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/30 rounded"
                          onClick={() => setViewingProfileId(p.id)}
                        >
                          {p.full_name}
                        </button>
                      </TableCell>
                      <TableCell className="min-w-[200px] py-4">
                        <ProfileStatusSelect
                          profile={p}
                          statusUpdatingId={statusUpdatingId}
                          onChange={(id, s) => void updateStatus(id, s)}
                          className="max-w-[240px]"
                        />
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-1.5 text-sm text-gray-700">
                          {profileEmail(p) ? (
                            <span className="break-all font-medium">{profileEmail(p)}</span>
                          ) : (
                            <span className="text-gray-400 italic text-sm">No email</span>
                          )}
                          {p.contact_number ? (
                            <span className="text-gray-600">{p.contact_number}</span>
                          ) : (
                            <span className="text-gray-400 italic text-sm">No phone</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <ProfileActionButtons
                          profile={p}
                          deletingId={deletingId}
                          layout="list"
                          onOpen={() => setViewingProfileId(p.id)}
                          onDelete={() => void deleteProfile(p.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border bg-white p-5 shadow-sm flex flex-col gap-4 transition-shadow hover:shadow-md"
                  style={{ borderColor: "rgba(212, 175, 55, 0.35)" }}
                >
                  <div className="space-y-1">
                    <h3 className="font-playfair-display text-lg font-bold leading-tight" style={{ color: "var(--primary-blue)" }}>
                      <button
                        type="button"
                        className="text-left hover:underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/30 rounded"
                        onClick={() => setViewingProfileId(p.id)}
                      >
                        {p.full_name}
                      </button>
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs font-general text-gray-500">
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 capitalize">{p.gender || "—"}</span>
                      {p.city ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5">
                          <MapPin className="w-3 h-3 shrink-0" aria-hidden />
                          {p.city}
                        </span>
                      ) : null}
                      {typeof p.profile_completion_pct === "number" ? (
                        <span className="rounded-full bg-amber-50 text-amber-900 px-2.5 py-0.5 border border-amber-100">
                          {p.profile_completion_pct}% complete
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-general mb-2">Status</p>
                    <ProfileStatusSelect
                      profile={p}
                      statusUpdatingId={statusUpdatingId}
                      onChange={(id, s) => void updateStatus(id, s)}
                    />
                  </div>

                  <div className="rounded-xl bg-slate-50/80 border border-slate-100 px-3 py-3 space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-general">Contact</p>
                    {profileEmail(p) ? (
                      <p className="text-sm font-medium text-gray-800 break-all">{profileEmail(p)}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No email</p>
                    )}
                    {p.contact_number ? (
                      <p className="text-sm text-gray-700">{p.contact_number}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No phone</p>
                    )}
                  </div>

                  <ProfileActionButtons
                    profile={p}
                    deletingId={deletingId}
                    layout="cards"
                    onOpen={() => setViewingProfileId(p.id)}
                    onDelete={() => void deleteProfile(p.id)}
                  />
                </div>
              ))}
            </div>
          )}
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
