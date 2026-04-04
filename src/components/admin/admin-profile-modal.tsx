"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileView, type ProfileRecord, type ProfilePhoto, type PartnerPreferences } from "@/components/profile/profile-view";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface AdminProfileModalProps {
  profileId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: (profileId: string, newStatus: string) => Promise<void>;
}

export function AdminProfileModal({ profileId, open, onOpenChange, onStatusUpdate }: AdminProfileModalProps) {
  const [tab, setTab] = useState<"view" | "edit">("view");
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [preferences, setPreferences] = useState<PartnerPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/admin/profiles/${profileId}`, { credentials: "include" });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        profile?: ProfileRecord & { email?: string | null };
        photos?: ProfilePhoto[];
        preferences?: PartnerPreferences | null;
      };

      if (!res.ok) {
        setProfile(null);
        setPhotos([]);
        setPreferences(null);
        setLoadError(json.error ?? `Could not load profile (${res.status})`);
        return;
      }

      if (!json.profile) {
        setProfile(null);
        setPhotos([]);
        setPreferences(null);
        setLoadError("Profile data missing from response.");
        return;
      }

      setProfile(json.profile as ProfileRecord);
      setPhotos(json.photos ?? []);
      setPreferences((json.preferences as PartnerPreferences | null) ?? null);
    } catch {
      setProfile(null);
      setPhotos([]);
      setPreferences(null);
      setLoadError("Network error while loading profile.");
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    if (!open || !profileId) {
      setProfile(null);
      setPhotos([]);
      setPreferences(null);
      setLoadError(null);
      setTab("view");
      return;
    }
    void loadProfile();
  }, [open, profileId, reloadKey, loadProfile]);

  const handleApprove = async () => {
    if (!profileId) return;
    setUpdating(true);
    try {
      await onStatusUpdate(profileId, "active");
      setReloadKey((k) => k + 1);
    } catch (err) {
      console.error("[admin-profile-modal-approve]", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!profileId) return;
    setUpdating(true);
    try {
      await onStatusUpdate(profileId, "rejected");
      setReloadKey((k) => k + 1);
    } catch (err) {
      console.error("[admin-profile-modal-reject]", err);
    } finally {
      setUpdating(false);
    }
  };

  const userId = profile?.user_id as string | undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0 rounded-xl" style={{ backgroundColor: "var(--pure-white)" }}>
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogDescription className="sr-only">
            View and edit this member profile, photos, and partner preferences.
          </DialogDescription>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <DialogTitle className="font-playfair-display text-2xl font-bold" style={{ color: "var(--primary-blue)" }}>
              {profile ? profile.full_name : loadError ? "Profile" : "Loading…"}
            </DialogTitle>
            {profile && (
              <Badge
                variant="outline"
                className={
                  profile.profile_status === "active"
                    ? "border-green-300 text-green-700 bg-green-50"
                    : profile.profile_status === "pending"
                      ? "border-amber-300 text-amber-700 bg-amber-50"
                      : "border-gray-300 text-gray-600"
                }
              >
                {profile.profile_status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="px-6 pb-4">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "view" | "edit")} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
              <TabsTrigger value="view" className="font-general">
                View details
              </TabsTrigger>
              <TabsTrigger value="edit" className="font-general" disabled={!profile || !userId}>
                Edit all fields
              </TabsTrigger>
            </TabsList>

            <TabsContent value="view" className="mt-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--accent-gold)" }} />
                </div>
              ) : loadError ? (
                <div className="text-center py-12 px-4 font-general text-red-700 bg-red-50 rounded-lg border border-red-100">
                  {loadError}
                </div>
              ) : profile ? (
                <ProfileView
                  profile={profile}
                  photos={photos}
                  preferences={preferences}
                  isOwnProfile={false}
                  forceShowContact
                />
              ) : (
                <div className="text-center py-12 font-general" style={{ color: "var(--primary-blue)" }}>
                  Profile not found
                </div>
              )}
            </TabsContent>

            <TabsContent value="edit" className="mt-0 -mx-2 sm:-mx-4">
              {profile && userId ? (
                <EditProfileForm
                  key={`${profile.id}-${reloadKey}`}
                  profile={profile}
                  photos={photos}
                  preferences={preferences}
                  userId={userId}
                  variant="admin"
                  onClose={() => {
                    setTab("view");
                    setReloadKey((k) => k + 1);
                  }}
                  onSaved={() => setReloadKey((k) => k + 1)}
                />
              ) : null}
            </TabsContent>
          </Tabs>
        </div>

        {profile && tab === "view" && (
          <DialogFooter className="px-6 pb-6 flex-row gap-2 sm:justify-end border-t pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={updating} className="font-general">
              Close
            </Button>
            {profile.profile_status !== "rejected" && (
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={updating || profile.profile_status === "rejected"}
                className="font-general border-red-300 text-red-700 hover:bg-red-50"
              >
                {updating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Reject
              </Button>
            )}
            {profile.profile_status !== "active" && (
              <Button
                onClick={handleApprove}
                disabled={updating || profile.profile_status === "active"}
                className="font-general bg-green-600 hover:bg-green-700 text-white"
              >
                {updating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Approve
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
