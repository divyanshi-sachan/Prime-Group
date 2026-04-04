"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { SquareImageCropDialog } from "@/components/ui/square-image-crop-dialog";
import { compressProfileImage, MAX_PROFILE_PHOTOS } from "@/lib/image-compression";
import { useDropzone } from "react-dropzone";
import type { ProfilePhoto } from "./profile-view";
import { Loader2, Star, Trash2, Plus } from "lucide-react";

interface ProfilePhotoManagerProps {
  profileId: string;
  userId: string;
  initialPhotos: ProfilePhoto[];
  onUpdate: (newCount: number) => void;
  /** Use admin API (service role) — required in /admin because storage + RLS expect the member as uploader. */
  useAdminClient?: boolean;
}

type CropSession = {
  objectUrl: string;
  currentFile: File;
  restFiles: File[];
};

function formatErr(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  return "Something went wrong";
}

async function parseJsonError(res: Response): Promise<string> {
  const j = (await res.json().catch(() => ({}))) as { error?: string };
  return j.error ?? `Request failed (${res.status})`;
}

function toJpegBaseName(name: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  return (base || "photo") + ".jpg";
}

export function ProfilePhotoManager({
  profileId,
  userId,
  initialPhotos,
  onUpdate,
  useAdminClient = false,
}: ProfilePhotoManagerProps) {
  const [photos, setPhotos] = useState<ProfilePhoto[]>(initialPhotos);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [cropSession, setCropSession] = useState<CropSession | null>(null);
  const cropSessionRef = useRef<CropSession | null>(null);

  useEffect(() => {
    cropSessionRef.current = cropSession;
  }, [cropSession]);

  const supabase = useAdminClient ? null : createClient();

  const dismissCrop = useCallback(() => {
    setCropSession((s) => {
      if (s?.objectUrl) URL.revokeObjectURL(s.objectUrl);
      return null;
    });
  }, []);

  const setPrimary = async (photoId: string) => {
    setError(null);
    setSaving(true);
    try {
      if (useAdminClient) {
        const res = await fetch(`/api/admin/profiles/${profileId}/photos`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoId, action: "set_primary" }),
        });
        if (!res.ok) throw new Error(await parseJsonError(res));
      } else {
        const { error: e1 } = await supabase!
          .from("profile_photos")
          .update({ is_primary: false })
          .eq("profile_id", profileId);
        if (e1) throw e1;
        const { error: e2 } = await supabase!
          .from("profile_photos")
          .update({ is_primary: true })
          .eq("id", photoId);
        if (e2) throw e2;
      }
      setPhotos((prev) => prev.map((p) => ({ ...p, is_primary: p.id === photoId })));
      onUpdate(photos.length);
    } catch (err) {
      setError(formatErr(err));
    } finally {
      setSaving(false);
    }
  };

  const removePhoto = async (photoId: string) => {
    setError(null);
    setSaving(true);
    try {
      if (useAdminClient) {
        const removed = photos.find((p) => p.id === photoId);
        const res = await fetch(
          `/api/admin/profiles/${profileId}/photos?photoId=${encodeURIComponent(photoId)}`,
          { method: "DELETE", credentials: "include" }
        );
        if (!res.ok) throw new Error(await parseJsonError(res));
        const next = photos.filter((p) => p.id !== photoId);
        if (!next.length) {
          setPhotos([]);
          onUpdate(0);
        } else if (removed?.is_primary) {
          setPhotos(next.map((p, i) => ({ ...p, is_primary: i === 0 })));
          onUpdate(next.length);
        } else {
          setPhotos(next);
          onUpdate(next.length);
        }
      } else {
        const { error: e } = await supabase!.from("profile_photos").delete().eq("id", photoId).eq("user_id", userId);
        if (e) throw e;
        const next = photos.filter((p) => p.id !== photoId);
        if (next.length && !next.some((p) => p.is_primary)) {
          const firstId = next[0]!.id;
          const { error: e2 } = await supabase!.from("profile_photos").update({ is_primary: true }).eq("id", firstId);
          if (e2) throw e2;
          setPhotos(next.map((p) => ({ ...p, is_primary: p.id === firstId })));
        } else {
          setPhotos(next);
        }
        onUpdate(next.length);
      }
    } catch (err) {
      setError(formatErr(err));
    } finally {
      setSaving(false);
    }
  };

  const uploadCompressedFile = useCallback(
    async (compressed: File, orderIndex: number): Promise<ProfilePhoto | null> => {
      if (useAdminClient) {
        const fd = new FormData();
        fd.append("file", compressed, compressed.name || "photo.jpg");
        const res = await fetch(`/api/admin/profiles/${profileId}/photos`, {
          method: "POST",
          credentials: "include",
          body: fd,
        });
        if (!res.ok) throw new Error(await parseJsonError(res));
        const json = (await res.json()) as { photo?: ProfilePhoto };
        return json.photo ?? null;
      }
      const ext = "jpg";
      const path = `${userId}/${profileId}-${Date.now()}-${orderIndex}.${ext}`;
      const bucket = "profile-photos";
      const { error: uploadErr } = await supabase!.storage.from(bucket).upload(path, compressed, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase!.storage.from(bucket).getPublicUrl(path);
      const { data: inserted, error: insertErr } = await supabase!
        .from("profile_photos")
        .insert({
          profile_id: profileId,
          user_id: userId,
          photo_url: urlData.publicUrl,
          display_order: orderIndex,
          is_primary: photos.length === 0,
          status: "pending",
        })
        .select("id, photo_url, thumbnail_url, display_order, is_primary, status")
        .single();
      if (insertErr) throw insertErr;
      return inserted as ProfilePhoto;
    },
    [profileId, userId, supabase, useAdminClient, photos.length]
  );

  const handleCropApplied = useCallback(
    async (blob: Blob) => {
      const snap = cropSessionRef.current;
      if (!snap) return;

      setAdding(true);
      setError(null);
      try {
        const outFile = new File([blob], toJpegBaseName(snap.currentFile.name), { type: "image/jpeg" });
        const { file: compressed } = await compressProfileImage(outFile);

        const orderIndex = photos.length;
        const inserted = await uploadCompressedFile(compressed, orderIndex);
        if (inserted) {
          setPhotos((prev) => [...prev, inserted]);
          onUpdate(orderIndex + 1);
        }

        setCropSession((prev) => {
          if (!prev || prev.objectUrl !== snap.objectUrl) return prev;
          URL.revokeObjectURL(prev.objectUrl);
          if (prev.restFiles.length === 0) return null;
          const next = prev.restFiles[0]!;
          return {
            objectUrl: URL.createObjectURL(next),
            currentFile: next,
            restFiles: prev.restFiles.slice(1),
          };
        });
      } catch (err) {
        setError(formatErr(err));
        dismissCrop();
      } finally {
        setAdding(false);
      }
    },
    [dismissCrop, onUpdate, photos.length, uploadCompressedFile]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0 || photos.length >= MAX_PROFILE_PHOTOS) return;
      const slots = MAX_PROFILE_PHOTOS - photos.length;
      const slice = acceptedFiles.slice(0, slots);
      if (slice.length === 0) return;
      const first = slice[0]!;
      setCropSession({
        objectUrl: URL.createObjectURL(first),
        currentFile: first,
        restFiles: slice.slice(1),
      });
    },
    [photos.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] },
    maxFiles: 5,
    disabled: adding || saving || photos.length >= MAX_PROFILE_PHOTOS || cropSession !== null,
  });

  useEffect(() => {
    return () => {
      const cs = cropSessionRef.current;
      if (cs?.objectUrl) URL.revokeObjectURL(cs.objectUrl);
    };
  }, []);

  return (
    <div className="space-y-6">
      <SquareImageCropDialog
        open={cropSession !== null}
        onOpenChange={(open) => {
          if (!open) dismissCrop();
        }}
        imageSrc={cropSession?.objectUrl ?? null}
        onApply={handleCropApplied}
      />

      <div className="flex justify-between items-center">
        <h3 className="font-playfair-display text-2xl font-bold" style={{ color: "var(--primary-blue)" }}>
          Profile Photos
        </h3>
        <span className="text-sm font-general px-3 py-1 bg-gray-100 rounded-full text-gray-600 font-medium">
          {photos.length} / {MAX_PROFILE_PHOTOS} uploaded
        </span>
      </div>

      <p className="text-sm text-gray-600 font-general -mt-2">
        Each new photo opens a square crop tool so it fits the profile grid cleanly.
      </p>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm border border-red-100">{error}</div>
      )}

      <div className="flex flex-wrap gap-5">
        {photos.map((p) => (
          <div
            key={p.id}
            className="relative rounded-2xl overflow-hidden border bg-gray-50 flex-shrink-0 w-36 h-36 group shadow-sm transition-all hover:shadow-md"
            style={{
              borderColor: p.is_primary ? "var(--accent-gold)" : "rgba(212, 175, 55, 0.15)",
              borderWidth: p.is_primary ? "3px" : "1px",
            }}
          >
            <Image
              src={p.thumbnail_url || p.photo_url}
              alt=""
              fill
              className="object-cover"
              unoptimized
              sizes="144px"
            />
            {p.is_primary && (
              <span className="absolute top-2 left-2 rounded-md bg-[var(--accent-gold)] px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-sm flex items-center gap-1">
                <Star className="h-2.5 w-2.5 fill-current" /> Primary
              </span>
            )}

            <div className="absolute top-2 right-2">
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="h-8 w-8 rounded-full shadow-md opacity-90 hover:opacity-100 transition-opacity"
                disabled={saving || adding}
                onClick={() => removePhoto(p.id)}
                title="Remove photo"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {!p.is_primary && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[calc(100%-16px)]">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="w-full text-[11px] h-8 bg-white/95 hover:bg-white text-[var(--primary-blue)] font-bold shadow-sm transition-all"
                  disabled={saving || adding}
                  onClick={() => setPrimary(p.id)}
                >
                  <Star className="h-3 w-3 mr-1.5 fill-current opacity-70 text-[var(--accent-gold)]" /> Set Primary
                </Button>
              </div>
            )}
          </div>
        ))}

        {photos.length < MAX_PROFILE_PHOTOS && (
          <div
            {...getRootProps()}
            className={`h-36 w-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
              isDragActive
                ? "border-[var(--accent-gold)] bg-[var(--accent-gold)]/10 scale-105"
                : "border-gray-300 hover:border-[var(--primary-blue)] bg-gray-50/50 hover:bg-gray-50"
            }`}
          >
            <input {...getInputProps()} />
            {adding || cropSession !== null ? (
              <Loader2 className="h-7 w-7 animate-spin mb-2" style={{ color: "var(--primary-blue)" }} />
            ) : (
              <Plus className="h-7 w-7 mb-2 text-gray-400 group-hover:text-[var(--primary-blue)] transition-colors" />
            )}
            <span className="text-sm font-general text-center px-3 text-gray-500 font-semibold">
              {cropSession !== null ? "Crop…" : adding ? "Uploading..." : "Add Photo"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
