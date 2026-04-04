import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPublishedBlogBySlug } from "@/lib/blogs";
import { BlogPostSkeleton } from "@/components/loading/route-content-skeletons";

const PRIMARY_BLUE = "var(--primary-blue)";
const GOLD = "var(--accent-gold)";
const PARCHMENT = "#F4EBDC";

const parchmentStyle = {
  backgroundColor: PARCHMENT,
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E\")",
} as const;

async function BlogPostBody({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedBlogBySlug(slug);
  if (!post) notFound();

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-IN", { dateStyle: "long" })
    : null;

  return (
    <>
      <header className="mb-10">
        <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: GOLD }}>
          {post.category}
        </span>
        <h1
          className="font-playfair-display text-3xl sm:text-4xl md:text-5xl font-bold mt-2 leading-tight"
          style={{ color: PRIMARY_BLUE }}
        >
          {post.title}
        </h1>
        <div className="mt-4 flex items-center gap-3 text-sm text-gray-600">
          {post.author_name && <span>{post.author_name}</span>}
          {publishedDate && (
            <>
              {post.author_name && <span>·</span>}
              <time dateTime={post.published_at!}>{publishedDate}</time>
            </>
          )}
        </div>
      </header>
      {post.cover_image_url && (
        <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-10">
          <Image
            src={post.cover_image_url}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
            priority
          />
        </div>
      )}
      {post.excerpt && (
        <p className="text-lg text-gray-600 leading-relaxed mb-8 font-general">{post.excerpt}</p>
      )}
      <div
        className="blog-content font-general text-gray-700 leading-relaxed [&_h2]:font-playfair-display [&_h2]:text-2xl [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:font-bold [&_h2]:text-[var(--primary-blue)] [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--accent-gold)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_img]:rounded-lg [&_img]:my-4 [&_a]:underline [&_a]:text-[var(--primary-blue)]"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </>
  );
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <div className="min-h-screen" style={parchmentStyle}>
      <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-[100px] pb-20">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium mb-8 opacity-80 hover:opacity-100"
          style={{ color: PRIMARY_BLUE }}
        >
          ← Back to Journal
        </Link>
        <Suspense fallback={<BlogPostSkeleton />}>
          <BlogPostBody params={params} />
        </Suspense>
      </article>
    </div>
  );
}
