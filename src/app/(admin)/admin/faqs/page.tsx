"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HelpCircle, Plus, Pencil, Trash2, RefreshCw, ChevronUp, ChevronDown } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useAdminViewMode } from "@/hooks/use-admin-view-mode";
import { AdminViewModeToggle } from "@/components/admin/admin-view-mode-toggle";

interface FaqRow {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

const VIEW_KEY = "adminFaqsViewMode";

async function parseError(res: Response): Promise<string> {
  const j = (await res.json().catch(() => ({}))) as { error?: string };
  return j.error ?? `Request failed (${res.status})`;
}

function FaqActions({
  onEdit,
  onDelete,
  layout,
}: {
  onEdit: () => void;
  onDelete: () => void;
  layout: "list" | "cards";
}) {
  const wrap = layout === "cards" ? "flex flex-col sm:flex-row gap-2 w-full" : "flex flex-wrap items-center justify-end gap-2";
  return (
    <div className={wrap} role="group" aria-label="FAQ actions">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 min-h-10 px-4 font-general font-semibold rounded-lg border-2 shadow-sm"
        style={{ borderColor: "var(--primary-blue)", color: "var(--primary-blue)", backgroundColor: "white" }}
        onClick={onEdit}
      >
        <Pencil className="w-4 h-4 shrink-0" aria-hidden />
        Edit
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 min-h-10 px-4 font-general font-semibold rounded-lg border-2 border-red-200 text-red-700 bg-white shadow-sm hover:bg-red-50"
        onClick={onDelete}
      >
        <Trash2 className="w-4 h-4 shrink-0" aria-hidden />
        Delete
      </Button>
    </div>
  );
}

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FaqRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useAdminViewMode(VIEW_KEY, "cards");

  const fetchFaqs = async () => {
    setLoading(true);
    setPageError(null);
    try {
      const res = await fetch("/api/admin/faqs", { credentials: "include" });
      const data = (await res.json().catch(() => ({}))) as { faqs?: FaqRow[]; error?: string };
      if (!res.ok) {
        setPageError(data.error ?? (await parseError(res)));
        setFaqs([]);
        return;
      }
      setFaqs(data.faqs ?? []);
    } catch {
      setFaqs([]);
      setPageError("Could not load FAQs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchFaqs();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setQuestion("");
    setAnswer("");
    setDialogError(null);
    setOpen(true);
  };

  const openEdit = (row: FaqRow) => {
    setEditingId(row.id);
    setQuestion(row.question);
    setAnswer(row.answer);
    setDialogError(null);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) return;
    setSaving(true);
    setDialogError(null);
    try {
      if (editingId) {
        const res = await fetch(`/api/admin/faqs/${editingId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: question.trim(), answer: answer.trim() }),
        });
        if (!res.ok) {
          setDialogError(await parseError(res));
          return;
        }
      } else {
        const res = await fetch("/api/admin/faqs", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: question.trim(), answer: answer.trim() }),
        });
        if (!res.ok) {
          setDialogError(await parseError(res));
          return;
        }
      }
      setOpen(false);
      await fetchFaqs();
    } catch {
      setDialogError("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    setPageError(null);
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        setPageError(await parseError(res));
        return;
      }
      await fetchFaqs();
    } catch {
      setPageError("Could not delete FAQ.");
    }
  };

  const moveOrder = async (id: string, direction: "up" | "down") => {
    const idx = faqs.findIndex((f) => f.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= faqs.length) return;
    const a = faqs[idx]!;
    const b = faqs[swapIdx]!;
    setPageError(null);
    try {
      const [r1, r2] = await Promise.all([
        fetch(`/api/admin/faqs/${a.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: b.sort_order }),
        }),
        fetch(`/api/admin/faqs/${b.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: a.sort_order }),
        }),
      ]);
      if (!r1.ok || !r2.ok) {
        setPageError(await parseError(!r1.ok ? r1 : r2));
        return;
      }
      await fetchFaqs();
    } catch {
      setPageError("Could not reorder FAQs.");
    }
  };

  const cardShell = { borderColor: "rgba(212, 175, 55, 0.25)", backgroundColor: "white" } as const;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-playfair-display" style={{ color: "var(--primary-blue)" }}>
            FAQs
          </h1>
          <p className="text-sm text-gray-600 mt-1 font-general">Manage frequently asked questions shown on the site.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void fetchFaqs()} disabled={loading} style={{ borderColor: "var(--accent-gold)" }} className="font-general rounded-xl">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={openCreate} style={{ backgroundColor: "var(--primary-blue)" }} className="font-general rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Add FAQ
          </Button>
        </div>
      </div>

      {pageError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 font-general" role="alert">
          {pageError}
        </div>
      ) : null}

      <Card className="rounded-xl border shadow-sm" style={cardShell}>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-lg font-playfair-display" style={{ color: "var(--primary-blue)" }}>
            <HelpCircle className="w-5 h-5" style={{ color: "var(--accent-gold)" }} />
            All FAQs
          </CardTitle>
          {!loading && faqs.length > 0 ? <AdminViewModeToggle value={viewMode} onChange={setViewMode} /> : null}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Spinner size="md" label="Loading FAQs…" />
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-general">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No FAQs yet.</p>
              <Button className="mt-4 rounded-xl font-general" onClick={openCreate} style={{ backgroundColor: "var(--primary-blue)" }}>
                Add first FAQ
              </Button>
            </div>
          ) : viewMode === "list" ? (
            <div className="rounded-lg border overflow-x-auto" style={{ borderColor: "rgba(212, 175, 55, 0.2)" }}>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-general w-28">Order</TableHead>
                    <TableHead className="font-general">Question</TableHead>
                    <TableHead className="font-general min-w-[220px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faqs.map((faq, idx) => (
                    <TableRow key={faq.id} className="font-general align-top">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 border-gray-200"
                            onClick={() => void moveOrder(faq.id, "up")}
                            disabled={idx === 0}
                            aria-label="Move up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 border-gray-200"
                            onClick={() => void moveOrder(faq.id, "down")}
                            disabled={idx === faqs.length - 1}
                            aria-label="Move down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 max-w-xl">
                        <div className="font-semibold text-[var(--primary-blue)] line-clamp-2">{faq.question}</div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">{faq.answer}</div>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <FaqActions layout="list" onEdit={() => openEdit(faq)} onDelete={() => void handleDelete(faq.id)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {faqs.map((faq, idx) => (
                <div
                  key={faq.id}
                  className="rounded-2xl border bg-white p-5 shadow-sm flex flex-col gap-4"
                  style={{ borderColor: "rgba(212, 175, 55, 0.35)" }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-general">Order</span>
                    <div className="flex gap-1">
                      <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => void moveOrder(faq.id, "up")} disabled={idx === 0} aria-label="Move up">
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => void moveOrder(faq.id, "down")} disabled={idx === faqs.length - 1} aria-label="Move down">
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-playfair-display font-bold text-lg leading-snug" style={{ color: "var(--primary-blue)" }}>
                      {faq.question}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-4 font-general">{faq.answer}</p>
                  </div>
                  <FaqActions layout="cards" onEdit={() => openEdit(faq)} onDelete={() => void handleDelete(faq.id)} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setDialogError(null);
        }}
      >
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-playfair-display">{editingId ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          </DialogHeader>
          {dialogError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {dialogError}
            </div>
          ) : null}
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="faq-question">Question</Label>
              <Input
                id="faq-question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. How do I create a profile?"
                className="mt-2 rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="faq-answer">Answer</Label>
              <textarea
                id="faq-answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Full answer..."
                rows={4}
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl font-general">
              Cancel
            </Button>
            <Button
              onClick={() => void handleSave()}
              disabled={saving || !question.trim() || !answer.trim()}
              loading={saving}
              style={{ backgroundColor: "var(--primary-blue)" }}
              className="rounded-xl font-general"
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
