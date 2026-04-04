/** Fallbacks for Suspense while async server components stream data. */

function PulseRow({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-lg bg-[#003366]/10 motion-reduce:animate-none animate-pulse ${className}`}
      aria-hidden
    />
  );
}

export function DiscoverGridSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
      aria-busy="true"
      aria-label="Loading profiles"
    >
      {Array.from({ length: cards }, (_, i) => (
        <div
          key={i}
          className="rounded-3xl overflow-hidden border border-[rgba(217,170,72,0.2)] bg-white shadow-sm"
        >
          <PulseRow className="h-80 w-full rounded-none" />
          <div className="p-7 space-y-4">
            <PulseRow className="h-8 w-2/3" />
            <PulseRow className="h-1 w-10" />
            <PulseRow className="h-4 w-full" />
            <PulseRow className="h-4 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FeaturedProfilesSkeleton() {
  return (
    <section className="py-16 px-4" aria-busy="true" aria-label="Loading featured profiles">
      <div className="container mx-auto max-w-7xl">
        <PulseRow className="h-10 w-64 mx-auto mb-12" />
        <DiscoverGridSkeleton cards={4} />
      </div>
    </section>
  );
}

export function FavoritesPageSkeleton() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--pure-white)" }} aria-busy="true" aria-label="Loading favorites">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16 space-y-4">
          <PulseRow className="h-12 w-48 mx-auto rounded-full" />
          <PulseRow className="h-10 w-3/4 max-w-md mx-auto" />
          <PulseRow className="h-6 w-full max-w-xl mx-auto" />
        </div>
        <DiscoverGridSkeleton cards={4} />
      </div>
    </div>
  );
}

export function BlogPageSkeleton() {
  return (
    <div className="min-h-screen bg-white pt-28 pb-20 px-4" aria-busy="true" aria-label="Loading journal">
      <PulseRow className="h-[280px] w-full max-w-5xl mx-auto rounded-2xl mb-16" />
      <div className="max-w-7xl mx-auto space-y-8">
        <PulseRow className="h-12 w-64 mx-auto" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
          <PulseRow className="h-72 rounded-xl" />
          <PulseRow className="h-72 rounded-xl" />
          <PulseRow className="h-72 rounded-xl" />
          <PulseRow className="h-72 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function BlogPostSkeleton() {
  return (
    <div className="space-y-6 mt-6" aria-busy="true" aria-label="Loading article">
      <PulseRow className="h-4 w-24" />
      <PulseRow className="h-10 w-full max-w-2xl" />
      <PulseRow className="h-4 w-48" />
      <PulseRow className="aspect-[16/10] w-full rounded-xl" />
      <PulseRow className="h-24 w-full" />
      <PulseRow className="h-40 w-full" />
    </div>
  );
}

export function FaqsSkeleton() {
  return (
    <div className="min-h-screen py-24 px-4" aria-busy="true" aria-label="Loading FAQs">
      <div className="container mx-auto max-w-3xl space-y-4">
        <PulseRow className="h-10 w-48 mx-auto mb-12" />
        {Array.from({ length: 6 }, (_, i) => (
          <PulseRow key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function ProfileDetailSkeleton() {
  return (
    <div className="space-y-8 mt-4" aria-busy="true" aria-label="Loading profile">
      <PulseRow className="h-10 w-full max-w-md" />
      <div className="grid gap-6 md:grid-cols-2">
        <PulseRow className="aspect-[4/5] rounded-2xl" />
        <div className="space-y-4">
          <PulseRow className="h-8 w-3/4" />
          <PulseRow className="h-4 w-full" />
          <PulseRow className="h-4 w-full" />
          <PulseRow className="h-32 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SettingsPageSkeleton() {
  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: "var(--pure-white)" }} aria-busy="true" aria-label="Loading settings">
      <div className="container mx-auto max-w-2xl space-y-6">
        <PulseRow className="h-8 w-40" />
        <PulseRow className="h-4 w-full max-w-sm" />
        <PulseRow className="h-12 w-full rounded-lg" />
        <PulseRow className="h-12 w-full rounded-lg" />
        <PulseRow className="h-32 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function ProfileEditSkeleton() {
  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: "var(--pure-white)" }} aria-busy="true" aria-label="Loading editor">
      <div className="container mx-auto max-w-3xl space-y-6">
        <PulseRow className="h-8 w-48" />
        <PulseRow className="h-64 w-full rounded-xl" />
        <PulseRow className="h-12 w-full rounded-lg" />
        <PulseRow className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}
