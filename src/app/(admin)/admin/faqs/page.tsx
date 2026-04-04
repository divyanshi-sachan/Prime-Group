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
import { createAdminBrowserClient } from "@/lib/supabase/client-admin";

interface FaqRow {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FaqRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchFaqs = async () => {
    const supabase = createAdminBrowserClient();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("faqs")
        .select("id, question, answer, sort_order")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      setFaqs((data as FaqRow[]) ?? []);
    } catch {
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setQuestion("");
    setAnswer("");
    setOpen(true);
  };

  const openEdit = (row: FaqRow) => {
    setEditingId(row.id);
    setQuestion(row.question);
    setAnswer(row.answer);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) return;
    setSaving(true);
    const supabase = createAdminBrowserClient();
    try {
      if (editingId) {
        const { error } = await supabase
          .from("faqs")
          .update({ question: question.trim(), answer: answer.trim(), updated_at: new Date().toISOString() })
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const maxOrder = faqs.length ? Math.max(...faqs.map((f) => f.sort_order), 0) : 0;
        const { error } = await supabase
          .from("faqs")
          .insert({ question: question.trim(), answer: answer.trim(), sort_order: maxOrder + 1 });
        if (error) throw error;
      }
      setOpen(false);
      fetchFaqs();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    const supabase = createAdminBrowserClient();
    try {
      const { error } = await supabase.from("faqs").delete().eq("id", id);
      if (error) throw error;
      fetchFaqs();
    } catch (e) {
      console.error(e);
    }
  };

  const moveOrder = async (id: string, direction: "up" | "down") => {
    const idx = faqs.findIndex((f) => f.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= faqs.length) return;
    const a = faqs[idx];
    const b = faqs[swapIdx];
    const supabase = createAdminBrowserClient();
    try {
      await supabase.from("faqs").update({ sort_order: b.sort_order }).eq("id", a.id);
      await supabase.from("faqs").update({ sort_order: a.sort_order }).eq("id", b.id);
      fetchFaqs();
    } catch (e) {
      console.error(e);
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
          <Button variant="outline" size="sm" onClick={fetchFaqs} disabled={loading} style={{ borderColor: "var(--accent-gold)" }}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={openCreate} style={{ backgroundColor: "var(--primary-blue)" }}>
            <Plus className="w-4 h-4 mr-2" />
            Add FAQ
          </Button>
        </div>
      </div>

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
                          onClick={() => moveOrder(faq.id, "up")}
                          disabled={idx === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => moveOrder(faq.id, "down")}
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
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(faq.id)} title="Delete" className="text-red-600">
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          </DialogHeader>
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
            <Button onClick={handleSave} disabled={saving || !question.trim() || !answer.trim()} style={{ backgroundColor: "var(--primary-blue)" }}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
