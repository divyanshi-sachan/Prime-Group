"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LogOut } from "lucide-react";

interface VisibilityState {
  is_visible: boolean;
  show_education: boolean;
  show_occupation: boolean;
  show_family: boolean;
  show_location: boolean;
}

interface SettingsClientProps {
  profileId: string | undefined;
  userId: string;
  initialVisibility: VisibilityState;
}

const cardStyle = {
  boxShadow: "0 10px 30px rgba(25, 80, 150, 0.08)",
  border: "1px solid rgba(212, 175, 55, 0.15)",
};

export function SettingsClient({
  profileId,
  userId,
  initialVisibility,
}: SettingsClientProps) {
  const router = useRouter();
  const [visibility, setVisibility] = useState<VisibilityState>(initialVisibility);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const supabase = createClient();

  const savePrivacy = async () => {
    if (!profileId) return;
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_visible: visibility.is_visible,
          show_education: visibility.show_education,
          show_occupation: visibility.show_occupation,
          show_family: visibility.show_family,
          show_location: visibility.show_location,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profileId)
        .eq("user_id", userId);
      if (error) throw error;
      setMessage({ type: "success", text: "Privacy settings saved." });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Failed to save. Try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="space-y-8">
      {profileId && (
        <div className="rounded-2xl p-6 space-y-6" style={cardStyle}>
          <h2 className="font-playfair-display text-lg font-bold" style={{ color: "var(--primary-blue)" }}>
            Privacy controls
          </h2>
          <p className="font-general text-sm opacity-80" style={{ color: "var(--primary-blue)" }}>
            Choose what information is visible on your public profile.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="is_visible" className="font-general cursor-pointer">
                Profile visible in discover
              </Label>
              <Switch
                id="is_visible"
                checked={visibility.is_visible}
                onCheckedChange={(v) => setVisibility((prev) => ({ ...prev, is_visible: v }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show_location" className="font-general cursor-pointer">
                Show location (city, state, country)
              </Label>
              <Switch
                id="show_location"
                checked={visibility.show_location}
                onCheckedChange={(v) => setVisibility((prev) => ({ ...prev, show_location: v }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show_education" className="font-general cursor-pointer">
                Show education
              </Label>
              <Switch
                id="show_education"
                checked={visibility.show_education}
                onCheckedChange={(v) => setVisibility((prev) => ({ ...prev, show_education: v }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show_occupation" className="font-general cursor-pointer">
                Show occupation
              </Label>
              <Switch
                id="show_occupation"
                checked={visibility.show_occupation}
                onCheckedChange={(v) => setVisibility((prev) => ({ ...prev, show_occupation: v }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show_family" className="font-general cursor-pointer">
                Show family details
              </Label>
              <Switch
                id="show_family"
                checked={visibility.show_family}
                onCheckedChange={(v) => setVisibility((prev) => ({ ...prev, show_family: v }))}
              />
            </div>
          </div>
          {message && (
            <p className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-600"}`}>
              {message.text}
            </p>
          )}
          <Button onClick={savePrivacy} loading={saving} style={{ backgroundColor: "var(--primary-blue)" }}>
            {saving ? "Saving…" : "Save privacy settings"}
          </Button>
        </div>
      )}

      <div className="rounded-2xl p-6" style={cardStyle}>
        <h2 className="font-playfair-display text-lg font-bold mb-2" style={{ color: "var(--primary-blue)" }}>
          Sign out
        </h2>
        <p className="font-general text-sm opacity-80 mb-4" style={{ color: "var(--primary-blue)" }}>
          Securely sign out of your account on this device.
        </p>
        <Button
          variant="outline"
          onClick={handleSignOut}
          loading={signingOut}
          className="gap-2 border-red-200 text-red-700 hover:bg-red-50"
        >
          {signingOut ? "Signing out…" : (
            <>
              <LogOut className="h-4 w-4" aria-hidden /> Sign out
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
