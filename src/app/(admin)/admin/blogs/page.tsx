"use client";

import { useEffect, useState } from "react";
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
import { FileText, Plus, Pencil, Eye, RefreshCw } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { createAdminBrowserClient } from "@/lib/supabase/client-admin";
import type { BlogPost } from "@/lib/blogs";

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

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-playfair-display" style={{ color: "var(--primary-blue)" }}>
            Blogs
          </h1>
          <p className="text-sm text-gray-600 mt-1">Create and manage blog posts. Publish to show on the site.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBlogs}
            disabled={loading}
            style={{ borderColor: "var(--accent-gold)" }}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/admin/blogs/new">
            <Button size="sm" style={{ backgroundColor: "var(--primary-blue)" }}>
              <Plus className="w-4 h-4 mr-2" />
              New post
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5" />
            All posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Spinner size="md" label="Loading posts…" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No blog posts yet.</p>
              <Link href="/admin/blogs/new">
                <Button className="mt-4" style={{ backgroundColor: "var(--primary-blue)" }}>
                  Create your first post
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogs.map((blog) => (
                  <TableRow key={blog.id}>
                    <TableCell>
                      <div className="font-medium max-w-[240px] truncate">{blog.title}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[240px]">{blog.slug}</div>
                    </TableCell>
                    <TableCell>{blog.category}</TableCell>
                    <TableCell>
                      {blog.published_at ? (
                        <Badge className="bg-green-100 text-green-800">Published</Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{formatDate(blog.updated_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/blogs/${blog.id}/edit`}>
                          <Button variant="ghost" size="sm" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        {blog.published_at && (
                          <a href={`/blog/${blog.slug}`} target="_blank" rel="noopener noreferrer" title="View">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
