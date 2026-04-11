"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Plus, Pencil, Eye, RefreshCw, ExternalLink } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { createAdminBrowserClient } from "@/lib/supabase/client-admin";
import { useAdminViewMode } from "@/hooks/use-admin-view-mode";
import { AdminViewModeToggle } from "@/components/admin/admin-view-mode-toggle";

interface BlogRow {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const VIEW_KEY = "adminBlogsViewMode";

function BlogActions({ blog, layout }: { blog: BlogRow; layout: "list" | "cards" }) {
  const wrap = layout === "cards" ? "flex flex-col sm:flex-row gap-2 w-full" : "flex flex-wrap items-center gap-2 justify-end";
  return (
    <div className={wrap} role="group" aria-label={`Actions for ${blog.title}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        asChild
        className="gap-2 min-h-10 px-4 font-general font-semibold rounded-lg border-2 shadow-sm"
        style={{ borderColor: "var(--primary-blue)", color: "var(--primary-blue)", backgroundColor: "white" }}
      >
        <Link href={`/admin/blogs/${blog.id}/edit`}>
          <Pencil className="w-4 h-4 shrink-0" aria-hidden />
          Edit post
        </Link>
      </Button>
      {blog.published_at ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          asChild
          className="gap-2 min-h-10 px-4 font-general font-semibold rounded-lg border-2 border-emerald-200 text-emerald-800 bg-white shadow-sm hover:bg-emerald-50"
        >
          <a href={`/blog/${blog.slug}`} target="_blank" rel="noopener noreferrer">
            <Eye className="w-4 h-4 shrink-0" aria-hidden />
            View live
            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" aria-hidden />
          </a>
        </Button>
      ) : null}
    </div>
  );
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useAdminViewMode(VIEW_KEY, "cards");

  const fetchBlogs = async () => {
    const supabase = createAdminBrowserClient();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("id, title, slug, category, excerpt, cover_image_url, published_at, created_at, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      setBlogs((data as BlogRow[]) ?? []);
    } catch {
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const formatDate = (s: string | null) =>
    s ? new Date(s).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—";

  const cardShell = { borderColor: "rgba(212, 175, 55, 0.25)", backgroundColor: "white" } as const;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-playfair-display" style={{ color: "var(--primary-blue)" }}>
            Blogs
          </h1>
          <p className="text-sm text-gray-600 mt-1 font-general">Create and manage blog posts. Publish to show on the site.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBlogs}
            disabled={loading}
            style={{ borderColor: "var(--accent-gold)" }}
            className="font-general rounded-xl"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/admin/blogs/new">
            <Button size="sm" style={{ backgroundColor: "var(--primary-blue)" }} className="font-general rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              New post
            </Button>
          </Link>
        </div>
      </div>

      <Card className="rounded-xl border shadow-sm" style={cardShell}>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-lg font-playfair-display" style={{ color: "var(--primary-blue)" }}>
            <FileText className="w-5 h-5" style={{ color: "var(--accent-gold)" }} />
            All posts
          </CardTitle>
          {!loading && blogs.length > 0 ? <AdminViewModeToggle value={viewMode} onChange={setViewMode} /> : null}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Spinner size="md" label="Loading posts…" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-general">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No blog posts yet.</p>
              <Link href="/admin/blogs/new">
                <Button className="mt-4 rounded-xl font-general" style={{ backgroundColor: "var(--primary-blue)" }}>
                  Create your first post
                </Button>
              </Link>
            </div>
          ) : viewMode === "list" ? (
            <div className="rounded-lg border overflow-x-auto" style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-general">Title</TableHead>
                    <TableHead className="font-general">Category</TableHead>
                    <TableHead className="font-general">Status</TableHead>
                    <TableHead className="font-general">Updated</TableHead>
                    <TableHead className="font-general min-w-[240px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogs.map((blog) => (
                    <TableRow key={blog.id} className="font-general align-top">
                      <TableCell className="py-4 max-w-[280px]">
                        <div className="font-semibold" style={{ color: "var(--primary-blue)" }}>
                          {blog.title}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{blog.slug}</div>
                      </TableCell>
                      <TableCell className="py-4">{blog.category}</TableCell>
                      <TableCell className="py-4">
                        {blog.published_at ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">Published</Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(blog.updated_at)}</TableCell>
                      <TableCell className="py-4 text-right">
                        <BlogActions blog={blog} layout="list" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="rounded-2xl border bg-white overflow-hidden shadow-sm flex flex-col"
                  style={{ borderColor: "rgba(212, 175, 55, 0.35)" }}
                >
                  <div className="relative aspect-[16/9] bg-slate-100">
                    {blog.cover_image_url ? (
                      <Image src={blog.cover_image_url} alt="" fill className="object-cover" unoptimized sizes="(max-width:768px) 100vw, 33vw" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <FileText className="w-12 h-12 opacity-40" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {blog.published_at ? (
                        <Badge className="bg-green-600/90 text-white border-0">Published</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-white/90">
                          Draft
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent-gold)] font-general">{blog.category}</p>
                      <h3 className="font-playfair-display font-bold text-lg mt-1 leading-snug" style={{ color: "var(--primary-blue)" }}>
                        {blog.title}
                      </h3>
                      {blog.excerpt ? <p className="text-sm text-gray-600 mt-2 line-clamp-2 font-general">{blog.excerpt}</p> : null}
                      <p className="text-xs text-gray-500 mt-2 font-general">Updated {formatDate(blog.updated_at)}</p>
                    </div>
                    <div className="mt-auto pt-2">
                      <BlogActions blog={blog} layout="cards" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
