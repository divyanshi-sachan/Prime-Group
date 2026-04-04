"use client";

import { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, RefreshCw, Eye, Check } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { createAdminBrowserClient } from "@/lib/supabase/client-admin";

interface ContactRow {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
  read_at: string | null;
}

export default function AdminContactPage() {
  const [submissions, setSubmissions] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<ContactRow | null>(null);
  const [markingRead, setMarkingRead] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    const supabase = createAdminBrowserClient();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("id, name, email, subject, message, created_at, read_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setSubmissions((data as ContactRow[]) ?? []);
    } catch {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const markAsRead = async (id: string) => {
    setMarkingRead(id);
    const supabase = createAdminBrowserClient();
    try {
      await supabase.from("contact_submissions").update({ read_at: new Date().toISOString() }).eq("id", id);
      setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, read_at: new Date().toISOString() } : s)));
      if (viewing?.id === id) setViewing((v) => (v ? { ...v, read_at: new Date().toISOString() } : null));
    } finally {
      setMarkingRead(null);
    }
  };

  const formatDate = (s: string) => new Date(s).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  const unreadCount = submissions.filter((s) => !s.read_at).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-playfair-display" style={{ color: "var(--primary-blue)" }}>
            Contact form submissions
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            View and manage contact form submissions. Tagged as form — you get notified when someone fills the form.
          </p>
          {unreadCount > 0 && (
            <Badge className="mt-2 bg-amber-100 text-amber-800">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={fetchSubmissions} disabled={loading} style={{ borderColor: "var(--accent-gold)" }}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="w-5 h-5" />
            Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Spinner size="md" label="Loading submissions…" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No contact form submissions yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((row) => (
                  <TableRow key={row.id} className={!row.read_at ? "bg-amber-50/50" : ""}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-sm">{row.email}</TableCell>
                    <TableCell className="max-w-[160px] truncate">{row.subject || "—"}</TableCell>
                    <TableCell className="text-sm text-gray-600">{formatDate(row.created_at)}</TableCell>
                    <TableCell>
                      {row.read_at ? (
                        <Badge variant="secondary">Read</Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800">New</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setViewing(row)} title="View">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!row.read_at && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(row.id)}
                            disabled={markingRead === row.id}
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
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

      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Contact form submission</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Name</p>
                <p className="font-medium">{viewing.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
                <a href={`mailto:${viewing.email}`} className="text-[var(--primary-blue)] underline">
                  {viewing.email}
                </a>
              </div>
              {viewing.subject && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Subject</p>
                  <p>{viewing.subject}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Message</p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{viewing.message}</p>
              </div>
              <p className="text-xs text-gray-500">{formatDate(viewing.created_at)}</p>
              {!viewing.read_at && (
                <Button size="sm" onClick={() => markAsRead(viewing.id)} disabled={markingRead === viewing.id} style={{ backgroundColor: "var(--primary-blue)" }}>
                  Mark as read
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
