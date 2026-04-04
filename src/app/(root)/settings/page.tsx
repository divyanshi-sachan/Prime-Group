import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SettingsClient } from "@/components/profile/settings-client";
import { ArrowLeft } from "lucide-react";
import { SettingsPageSkeleton } from "@/components/loading/route-content-skeletons";

async function SettingsContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/settings");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_visible, show_education, show_occupation, show_family, show_location")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: "var(--pure-white)" }}>
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link href="/profile">
              <ArrowLeft className="h-4 w-4" />
              Back to profile
            </Link>
          </Button>
        </div>
        <h1 className="font-playfair-display text-3xl font-bold mb-2" style={{ color: "var(--primary-blue)" }}>
          Settings
        </h1>
        <p className="font-general text-sm mb-8" style={{ color: "var(--primary-blue)" }}>
          Privacy and account settings.
        </p>
        <SettingsClient
          profileId={profile?.id}
          userId={user.id}
          initialVisibility={{
            is_visible: profile?.is_visible ?? true,
            show_education: profile?.show_education ?? true,
            show_occupation: profile?.show_occupation ?? true,
            show_family: profile?.show_family ?? true,
            show_location: profile?.show_location ?? true,
          }}
        />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <SettingsContent />
    </Suspense>
  );
}
