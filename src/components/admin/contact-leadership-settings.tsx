"use client";

import * as React from "react";
import Image from "next/image";
import { GripVertical, Loader2, Plus, Trash2, Upload, Users } from "lucide-react";

import type { ContactLeadershipMember } from "@/lib/contact-leadership";
import { MAX_CONTACT_LEADERSHIP_MEMBERS } from "@/lib/contact-leadership";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  leadership: ContactLeadershipMember[];
  onChange: React.Dispatch<React.SetStateAction<ContactLeadershipMember[]>>;
  loading: boolean;
};

function newMember(): ContactLeadershipMember {
  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `m-${Date.now()}`,
    name: "",
    designation: "",
    phone: "",
    email: "",
    photo_url: "",
    sort_order: 0,
  };
}

export function ContactLeadershipSettings({ leadership, onChange, loading }: Props) {
  const [saving, setSaving] = React.useState(false);
  const [uploadingId, setUploadingId] = React.useState<string | null>(null);

  const addRow = () => {
    if (leadership.length >= MAX_CONTACT_LEADERSHIP_MEMBERS) return;
    onChange((prev) => [...prev, newMember()]);
  };

  const removeRow = (id: string) => {
    onChange((prev) => prev.filter((m) => m.id !== id));
  };

  const move = (index: number, dir: -1 | 1) => {
    onChange((prev) => {
      const j = index + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  const patchRow = (id: string, field: keyof ContactLeadershipMember, value: string) => {
    onChange((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const uploadPhoto = async (id: string, file: File | null) => {
    if (!file) return;
    setUploadingId(id);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/contact-leadership/upload", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Upload failed");
        return;
      }
      if (typeof data.url === "string") {
        patchRow(id, "photo_url", data.url);
      }
    } finally {
      setUploadingId(null);
    }
  };

  const saveTeam = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ contact_leadership: leadership }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Failed to save team");
        return;
      }
      alert("Leadership team saved.");
    } finally {
      setSaving(false);
    }
  };

  const cardStyle = { borderColor: "rgba(212, 175, 55, 0.25)", backgroundColor: "white" };

  return (
    <Card className="rounded-xl border shadow-sm" style={cardStyle}>
      <CardHeader>
        <CardTitle className="font-playfair-display flex items-center gap-2" style={{ color: "var(--primary-blue)" }}>
          <Users className="w-5 h-5" style={{ color: "var(--accent-gold)" }} />
          Contact page — leadership carousel
        </CardTitle>
        <p className="font-general text-sm text-gray-600">
          Photos, names, designations, phone, and email shown at the bottom of the public Contact Us page.
          Up to {MAX_CONTACT_LEADERSHIP_MEMBERS} people. Photo uploads go to Supabase storage (bucket{" "}
          <code className="text-xs">contact-leadership</code>).
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-500 font-general">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading…
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {leadership.length === 0 ? (
                <p className="font-general text-sm text-gray-500">No team members yet. Add one to show the carousel.</p>
              ) : null}
              {leadership.map((m, index) => (
                <div
                  key={m.id}
                  className="rounded-xl border p-4 space-y-4"
                  style={{ borderColor: "rgba(0, 51, 102, 0.12)" }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-general text-gray-600">
                      <GripVertical className="w-4 h-4 opacity-50" aria-hidden />
                      <span>Member {index + 1}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="font-general"
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                      >
                        Up
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="font-general"
                        disabled={index >= leadership.length - 1}
                        onClick={() => move(index, 1)}
                      >
                        Down
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="font-general text-red-700 border-red-200 hover:bg-red-50"
                        onClick={() => removeRow(m.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1 inline" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex flex-col items-center gap-2 sm:w-36 shrink-0">
                      <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 bg-gray-50" style={{ borderColor: "var(--accent-gold)" }}>
                        {m.photo_url ? (
                          <Image
                            src={m.photo_url}
                            alt={m.name.trim() ? m.name : "Headshot preview"}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400 font-general text-center px-2">
                            No photo
                          </div>
                        )}
                      </div>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="sr-only"
                          disabled={uploadingId === m.id}
                          onChange={(e) => {
                            const f = e.target.files?.[0] ?? null;
                            e.target.value = "";
                            void uploadPhoto(m.id, f);
                          }}
                        />
                        <span className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-general font-semibold hover:bg-gray-50" style={{ borderColor: "rgba(212, 175, 55, 0.4)" }}>
                          {uploadingId === m.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Upload className="w-3 h-3" />
                          )}
                          Upload
                        </span>
                      </label>
                      <Input
                        className="font-general text-xs h-8"
                        placeholder="Or paste image URL (https)"
                        value={m.photo_url}
                        onChange={(e) => patchRow(m.id, "photo_url", e.target.value)}
                      />
                    </div>

                    <div className="grid flex-1 grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="font-general text-xs">Name *</Label>
                        <Input
                          className="font-general"
                          value={m.name}
                          onChange={(e) => patchRow(m.id, "name", e.target.value)}
                          placeholder="Full name"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="font-general text-xs">Designation / title</Label>
                        <Input
                          className="font-general"
                          value={m.designation}
                          onChange={(e) => patchRow(m.id, "designation", e.target.value)}
                          placeholder="e.g. Managing Director"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="font-general text-xs">Phone</Label>
                        <Input
                          className="font-general"
                          value={m.phone}
                          onChange={(e) => patchRow(m.id, "phone", e.target.value)}
                          placeholder="+91 …"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="font-general text-xs">Email</Label>
                        <Input
                          className="font-general"
                          type="email"
                          value={m.email}
                          onChange={(e) => patchRow(m.id, "email", e.target.value)}
                          placeholder="name@business.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                className="font-general"
                onClick={addRow}
                disabled={leadership.length >= MAX_CONTACT_LEADERSHIP_MEMBERS}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add member
              </Button>
              <Button
                type="button"
                className="rounded-xl font-general"
                style={{ backgroundColor: "var(--primary-blue)" }}
                onClick={saveTeam}
                disabled={saving || leadership.some((m) => !m.name.trim())}
                title={leadership.some((m) => !m.name.trim()) ? "Each saved member needs a name" : undefined}
              >
                {saving ? "Saving…" : "Save leadership team"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
