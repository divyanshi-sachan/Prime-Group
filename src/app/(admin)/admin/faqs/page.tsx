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
import { HelpCircle, Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface FaqRow {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

async function parseError(res: Response): Promise<string> {
  const j = (await res.json().catch(() => ({}))) as { error?: string };
  return j.error ?? `Request failed (${res.status})`;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-playfair-display" style={{ color: "var(--primary-blue)" }}>
            FAQs
          </h1>
          <p className="text-sm text-gray-600 mt-1">Manage frequently asked questions shown on the site.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void fetchFaqs()} disabled={loading} style={{ borderColor: "var(--accent-gold)" }}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={openCreate} style={{ backgroundColor: "var(--primary-blue)" }}>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <HelpCircle className="w-5 h-5" />
            All FAQs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Spinner size="md" label="Loading FAQs…" />
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No FAQs yet.</p>
              <Button className="mt-4" onClick={openCreate} style={{ backgroundColor: "var(--primary-blue)" }}>
                Add first FAQ
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Order</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead className="w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faqs.map((faq, idx) => (
                  <TableRow key={faq.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => void moveOrder(faq.id, "up")}
                          disabled={idx === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => void moveOrder(faq.id, "down")}
                          disabled={idx === faqs.length - 1}
                        >
                          ↓
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium max-w-xl truncate">{faq.question}</div>
                      <div className="text-xs text-gray-500 max-w-xl truncate">{faq.answer}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(faq)} title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => void handleDelete(faq.id)} title="Delete" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
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
                className="mt-2"
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
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleSave()}
              disabled={saving || !question.trim() || !answer.trim()}
              loading={saving}
              style={{ backgroundColor: "var(--primary-blue)" }}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
