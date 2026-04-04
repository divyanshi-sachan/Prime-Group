import { Suspense } from "react";
import { BlogHeroSection } from "@/components/blog/blog-hero-section";
import { TrustProofSection } from "@/components/blog/trust-proof-section";
import { ContentTypeTabs } from "@/components/blog/content-type-tabs";
import { SuccessStoryCard } from "@/components/blog/success-story-card";
import { BlogArticleCard } from "@/components/blog/blog-article-card";
import { StoryFilterChips } from "@/components/blog/story-filter-chips";
import { SoftCTASection } from "@/components/blog/soft-cta-section";
import { StoryCarousel } from "@/components/blog/story-carousel";
import { BlogNewsletterForm } from "@/components/blog/blog-newsletter-form";
import { getPublishedBlogs } from "@/lib/blogs";
import { BlogPageSkeleton } from "@/components/loading/route-content-skeletons";

export const metadata = {
  title: "The Prime Journal | Success Stories & Relationship Guidance",
  description:
    "Discover real success stories of couples who found love on Prime Group, along with expert relationship advice and wedding guidance.",
};

function enrichSuccessStory(post: { slug: string; title: string; category?: string | null }) {
  const mockData: Record<string, { names: string; city: string; type: string }> = {
    "aarav-meera": { names: "Aarav & Meera", city: "Delhi", type: "Arranged Match" },
    "rohit-sneha": { names: "Rohit & Sneha", city: "Mumbai", type: "Long Distance" },
    "arjun-priya": { names: "Arjun & Priya", city: "Bangalore", type: "Inter-caste" },
  };
  return (
    mockData[post.slug] || {
      names: post.title.split("&").length > 1 ? post.title : "A Prime Couple",
      city: "Verified Match",
      type: "Success Story",
    }
  );
}

async function BlogPageContent({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; type?: string }>;
}) {
  const { category } = await searchParams;

  const allPosts = await getPublishedBlogs({
    category: category && category !== "All" ? category : undefined,
    limit: 50,
  });

  if (allPosts.length === 0) {
    return (
      <main className="min-h-screen bg-white pt-32 pb-20 px-4 text-center">
        <h1 className="font-playfair-display text-4xl font-bold text-[#003366] mb-8">The Prime Journal</h1>
        <Suspense fallback={null}>
          <ContentTypeTabs />
        </Suspense>
        <p className="text-gray-500 italic mt-20">Our storytellers are busy at work. Check back soon for new stories.</p>
        <SoftCTASection />
      </main>
    );
  }

  const featuredPost = allPosts[0];
  const remainingPosts = allPosts.slice(1);

  return (
    <main className="min-h-screen bg-white">
      <BlogHeroSection featuredPost={featuredPost} />

      <TrustProofSection />

      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-playfair-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#003366] px-2">
            {category && category !== "All" ? category : "The Prime Journal"}
          </h2>
          <div className="w-24 h-1.5 bg-[#E2C285] mx-auto mt-6 rounded-full" />
        </div>

        <Suspense fallback={null}>
          <ContentTypeTabs />
        </Suspense>

        {category === "Success Stories" && (
          <Suspense fallback={null}>
            <StoryFilterChips />
          </Suspense>
        )}

        <div className="space-y-32 mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {remainingPosts.map((post) => {
              const isSuccess = post.category?.toLowerCase().includes("success");
              if (isSuccess) {
                const enrichment = enrichSuccessStory(post);
                return (
                  <SuccessStoryCard
                    key={post.id}
                    post={post}
                    couple_names={enrichment.names}
                    city={enrichment.city}
                    journey_type={enrichment.type}
                  />
                );
              }
              return <BlogArticleCard key={post.id} post={post} />;
            })}
          </div>
        </div>
      </section>

      <StoryCarousel />

      <SoftCTASection />

      <section className="max-w-7xl mx-auto px-4 py-24 border-t border-gray-100">
        <BlogNewsletterForm />
      </section>
    </main>
  );
}

export default function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; type?: string }>;
}) {
  return (
    <Suspense fallback={<BlogPageSkeleton />}>
      <BlogPageContent searchParams={searchParams} />
    </Suspense>
  );
}
