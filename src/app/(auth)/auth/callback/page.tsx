import { Suspense } from "react";
import { AuthCallbackClient } from "./auth-callback-client";
import { Spinner } from "@/components/ui/spinner";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4">
          <Spinner label="Loading…" />
        </div>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}
