"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Minus,
  ImagePlus,
  Link as LinkIcon,
  Undo,
  Redo,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BLOG_CATEGORIES = [
  "Success Story",
  "Wedding Advice",
  "Relationship Guidance",
  "Family Values",
  "Stories",
] as const;

export interface BlogFormData {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  author_name: string;
  publish: boolean;
}

interface BlogEditorProps {
  initialContent?: string;
  initialData?: Partial<BlogFormData>;
  onSave: (data: BlogFormData) => Promise<void>;
  saving?: boolean;
  previousPosts?: { id: string; title: string; slug: string }[];
}

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function BlogEditor({
  initialContent = "",
  initialData,
  onSave,
  saving = false,
  previousPosts = [],
}: BlogEditorProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "Stories");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.cover_image_url ?? "");
  const [authorName, setAuthorName] = useState(initialData?.author_name ?? "");
  const [publish, setPublish] = useState(initialData?.publish ?? false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({ placeholder: "Write your post content here… Use headings, lists, and add images." }),
      Image.configure({ allowBase64: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: "_blank", rel: "noopener" } }),
    ],
    content: initialContent || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[320px] px-4 py-3 focus:outline-none rounded-b-lg border border-t-0 border-input bg-background text-gray-900 [&_h1]:text-2xl [&_h2]:text-xl [&_ul]:list-disc [&_ol]:list-decimal [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_pre]:bg-muted [&_pre]:p-3 [&_img]:max-w-full [&_img]:rounded",
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl || "https://");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor || !imageUrlInput.trim()) return;
    editor.chain().focus().setImage({ src: imageUrlInput.trim() }).run();
    setImageUrlInput("");
    setShowImageModal(false);
  }, [editor, imageUrlInput]);

  const updateSlugFromTitle = useCallback(() => {
    if (!slug || slug === initialData?.slug) setSlug(slugify(title));
  }, [title, slug, initialData?.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = editor?.getHTML() ?? "";
    await onSave({
      title,
      slug: slug || slugify(title),
      category,
      excerpt,
      content,
      cover_image_url: coverImageUrl,
      author_name: authorName,
      publish,
    });
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--primary-blue)" }} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--primary-blue)" }}>
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={updateSlugFromTitle}
            placeholder="Post title"
            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-[var(--primary-blue)]/30 focus:border-[var(--primary-blue)]"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--primary-blue)" }}>
              Slug (URL)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="url-slug"
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-[var(--primary-blue)]/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--primary-blue)" }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-[var(--primary-blue)]/30"
            >
              {BLOG_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--primary-blue)" }}>
            Excerpt (short summary)
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief summary for cards and SEO"
            rows={2}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-[var(--primary-blue)]/30 resize-none"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--primary-blue)" }}>
              Cover image URL
            </label>
            <input
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-[var(--primary-blue)]/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--primary-blue)" }}>
              Author name
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Prime Group"
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-[var(--primary-blue)]/30"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--primary-blue)" }}>
          Content
        </label>
        <div className="rounded-t-lg border border-input bg-muted/30 px-2 py-1 flex flex-wrap gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(editor.isActive("bold") && "bg-muted")}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(editor.isActive("italic") && "bg-muted")}
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={cn(editor.isActive("heading", { level: 1 }) && "bg-muted")}
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn(editor.isActive("heading", { level: 2 }) && "bg-muted")}
          >
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(editor.isActive("bulletList") && "bg-muted")}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(editor.isActive("orderedList") && "bg-muted")}
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(editor.isActive("blockquote") && "bg-muted")}
          >
            <Quote className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={cn(editor.isActive("code") && "bg-muted")}
          >
            <Code className="w-4 h-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <Minus className="w-4 h-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={setLink} className={cn(editor.isActive("link") && "bg-muted")}>
            <LinkIcon className="w-4 h-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowImageModal(true)}>
            <ImagePlus className="w-4 h-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
            <Undo className="w-4 h-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
            <Redo className="w-4 h-4" />
          </Button>
        </div>
        <EditorContent editor={editor} />

        {showImageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="font-semibold mb-2" style={{ color: "var(--primary-blue)" }}>Insert image</h3>
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Image URL"
                className="w-full px-4 py-2 rounded-lg border border-input mb-4"
              />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => { setShowImageModal(false); setImageUrlInput(""); }}>
                  Cancel
                </Button>
                <Button type="button" onClick={addImage} style={{ backgroundColor: "var(--primary-blue)" }}>
                  Insert
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={publish}
            onChange={(e) => setPublish(e.target.checked)}
            className="rounded border-input"
          />
          <span className="text-sm font-medium">Publish immediately</span>
        </label>
        <Button type="submit" loading={saving} style={{ backgroundColor: "var(--primary-blue)" }}>
          {saving ? "Saving…" : "Save post"}
        </Button>
      </div>

      {previousPosts.length > 0 && (
        <div className="border rounded-lg p-4 bg-muted/30">
          <h4 className="text-sm font-semibold mb-2" style={{ color: "var(--primary-blue)" }}>Previous posts</h4>
          <ul className="text-sm space-y-1">
            {previousPosts.slice(0, 10).map((p) => (
              <li key={p.id}>
                <a href={`/admin/blogs/${p.id}/edit`} className="underline hover:opacity-80" style={{ color: "var(--primary-blue)" }}>
                  {p.title}
                </a>
                <span className="text-gray-500 ml-2">/blog/{p.slug}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
