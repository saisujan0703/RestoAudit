"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Inbox,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatDate, type ComplaintLog, type Feedback } from "@/lib/data";
import { createComplaintLog, fetchComplaintLogs, fetchFeedback, updateComplaintLog } from "@/lib/api";

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

type FeedbackWithDetails = Feedback & {
  userName: string;
  itemName: string;
  branch_id: number;
  complaint: ComplaintLog | undefined;
};

export default function AdminFeedbackPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackWithDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resolutionStatus, setResolutionStatus] = useState<"Open" | "In Progress" | "Resolved">("Open");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [feedbackData, setFeedbackData] = useState<FeedbackWithDetails[]>([]);
  const [activeContextBranchId, setActiveContextBranchId] = useState<number>(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("restroaudit.adminSelectedBranch");
      if (stored) {
        setActiveContextBranchId(Number(stored));
      }
    } catch {}

    let mounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        const [feedbacks, complaintLogs] = await Promise.all([
          fetchFeedback(),
          fetchComplaintLogs(),
        ]);

        const safeFeedbacks = Array.isArray(feedbacks) ? feedbacks : [];
        const safeComplaints = Array.isArray(complaintLogs) ? complaintLogs : [];

        const complaintByFeedbackId = new Map<number, any>();
        for (const c of safeComplaints) {
          const fid = c?.feedback?.feedbackId ?? c?.feedback?.feedback_id ?? c?.feedbackId ?? c?.feedback_id;
          if (typeof fid === "number") complaintByFeedbackId.set(fid, c);
        }

        const normalized: FeedbackWithDetails[] = safeFeedbacks.map((f: any) => {
          const feedbackId = f?.feedbackId ?? f?.feedback_id ?? 0;
          const rating = f?.ratingScore ?? f?.rating_score ?? 0;
          const text = f?.textComments ?? f?.text_comments ?? "";
          const user = f?.user;
          const menuItem = f?.menuItem;
          const complaint = typeof feedbackId === "number" ? complaintByFeedbackId.get(feedbackId) : undefined;

          // keep compatibility with existing UI (Feedback/ComplaintLog types from lib/data)
          return {
            feedback_id: typeof feedbackId === "number" ? feedbackId : 0,
            rating_score: typeof rating === "number" ? rating : 0,
            text_comments: typeof text === "string" ? text : "",
            user_id: user?.userId ?? user?.user_id ?? 0,
            item_id: menuItem?.itemId ?? menuItem?.item_id ?? 0,
            branch_id: f?.branch?.branchId ?? f?.branch?.branch_id ?? f?.branchId ?? f?.branch_id ?? 0,
            userName:
              user && (user.firstName || user.lastName)
                ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                : (user?.email ?? "Unknown"),
            itemName: menuItem?.itemName ?? menuItem?.item_name ?? "Unknown",
            complaint: complaint
              ? ({
                  log_id: complaint?.logId ?? complaint?.log_id,
                  status: complaint?.status,
                  resolution_notes: complaint?.resolutionNotes ?? complaint?.resolution_notes,
                  feedback_id: feedbackId,
                } as any)
              : undefined,
          } as any;
        });

        if (!mounted) return;
        setFeedbackData(normalized);
      } catch (e) {
        console.error("Failed to load feedback/complaints", e);
        if (!mounted) return;
        setFeedbackData([]);
        toast.error("Failed to load feedback from database.", {
          description: "Ensure backend is running on port 8080.",
        });
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter feedback
  const filteredFeedback = feedbackData.filter((f) => {
    if (f.branch_id !== activeContextBranchId) return false;

    const matchesSearch =
      f.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.text_comments.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "open" && f.complaint?.status === "Open") ||
      (statusFilter === "in-progress" && f.complaint?.status === "In Progress") ||
      (statusFilter === "resolved" && f.complaint?.status === "Resolved") ||
      (statusFilter === "no-complaint" && !f.complaint);

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const openModal = (feedback: FeedbackWithDetails) => {
    setSelectedFeedback(feedback);
    setResolutionStatus(feedback.complaint?.status || "Open");
    setResolutionNotes(feedback.complaint?.resolution_notes || "");
    setIsModalOpen(true);
  };

  const handleResolve = async () => {
    if (!selectedFeedback) return;

    try {
      const payload = {
        status: resolutionStatus,
        resolutionNotes,
        feedback: { feedbackId: selectedFeedback.feedback_id },
      };

      if (selectedFeedback.complaint?.log_id) {
        await updateComplaintLog(Number(selectedFeedback.complaint.log_id), payload);
      } else {
        await createComplaintLog(payload);
      }

      setFeedbackData((prev) =>
        prev.map((row) => {
          if (row.feedback_id !== selectedFeedback.feedback_id) return row;
          return {
            ...row,
            complaint: {
              ...(row.complaint || ({} as any)),
              status: resolutionStatus,
              resolution_notes: resolutionNotes,
            } as any,
          };
        })
      );

      toast.success("Complaint saved", {
        description: `Feedback #${selectedFeedback.feedback_id} updated to ${resolutionStatus}`,
      });
      setIsModalOpen(false);
    } catch (e: any) {
      toast.error("Failed to save complaint", {
        description: e?.message || "Backend error",
      });
    }
  };

  const getStatusBadge = (complaint: ComplaintLog | undefined) => {
    if (!complaint) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)]">
          No Complaint
        </span>
      );
    }

    const statusConfig = {
      Open: {
        icon: AlertCircle,
        bg: "bg-[var(--status-bad-bg)]",
        border: "border-[var(--status-bad-border)]",
        text: "text-[var(--status-bad)]",
      },
      "In Progress": {
        icon: Clock,
        bg: "bg-[var(--status-warn-bg)]",
        border: "border-[var(--status-warn-border)]",
        text: "text-[var(--status-warn)]",
      },
      Resolved: {
        icon: CheckCircle,
        bg: "bg-[var(--status-good-bg)]",
        border: "border-[var(--status-good-border)]",
        text: "text-[var(--status-good)]",
      },
    };

    const config = statusConfig[complaint.status];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${config.bg} ${config.border} ${config.text}`}
      >
        <Icon className="h-3 w-3" />
        {complaint.status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-[var(--bg-surface)]" />
        <Skeleton className="h-12 w-full bg-[var(--bg-surface)]" />
        <Skeleton className="h-96 rounded-xl bg-[var(--bg-surface)]" />
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={fadeInUp}>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-1)]">
          Feedback & Complaints
        </h1>
        <p className="text-[var(--text-2)] mt-1">
          Manage customer feedback and resolve complaints
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <Input
            placeholder="Search feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-1)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--accent-orange)]/50 focus:border-[var(--accent-orange)]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-1)]">
            <Filter className="h-4 w-4 mr-2 text-[var(--text-muted)]" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-[var(--bg-surface)] border-[var(--border-subtle)]">
            <SelectItem value="all">All Feedback</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="no-complaint">No Complaint</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Feedback Table */}
      <motion.div variants={fadeInUp}>
        <Card className="bg-[var(--bg-surface)] border-[var(--border-subtle)] overflow-hidden">
          <CardContent className="p-0">
            {filteredFeedback.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-[var(--bg-hover)] p-4 mb-4">
                  <Inbox className="h-8 w-8 text-[var(--text-muted)]" />
                </div>
                <p className="text-[var(--text-1)] font-medium">No feedback found</p>
                <p className="text-sm text-[var(--text-2)]">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-2)]">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-2)]">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-2)]">
                        Menu Item
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-2)]">
                        Rating
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-2)]">
                        Review
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-2)]">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-[var(--text-2)]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFeedback.map((feedback, index) => (
                      <motion.tr
                        key={feedback.feedback_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`
                          border-b border-[var(--border-subtle)] transition-colors hover:bg-zinc-800/50
                          ${feedback.rating_score <= 2 ? "bg-red-500/5" : ""}
                        `}
                      >
                        <td className="px-6 py-4 text-sm text-[var(--text-2)]">
                          {"-"}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-[var(--text-1)]">
                          {feedback.userName}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-1 rounded-md text-xs bg-[var(--bg-hover)] text-[var(--text-2)] border border-[var(--border-subtle)]">
                            {feedback.itemName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < feedback.rating_score
                                    ? "fill-[var(--accent-orange)] text-[var(--accent-orange)]"
                                    : "text-[var(--text-muted)]"
                                }`}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <p className="text-sm text-[var(--text-2)] truncate">
                            {feedback.text_comments}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(feedback.complaint)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openModal(feedback)}
                            className="text-[var(--text-2)] hover:text-[var(--accent-orange)] hover:bg-[var(--orange-dim)]"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Resolution Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-1)] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Feedback Details
            </DialogTitle>
            <DialogDescription className="text-[var(--text-2)]">
              Review and resolve customer feedback
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-6 mt-4">
              {/* Customer Info */}
              <div className="p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[var(--text-2)]">Customer</span>
                  <span className="font-medium text-[var(--text-1)]">
                    {selectedFeedback.userName}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[var(--text-2)]">Menu Item</span>
                  <span className="px-2 py-1 rounded-md text-xs bg-[var(--bg-hover)] text-[var(--text-2)] border border-[var(--border-subtle)]">
                    {selectedFeedback.itemName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-2)]">Rating</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < selectedFeedback.rating_score
                            ? "fill-[var(--accent-orange)] text-[var(--accent-orange)]"
                            : "text-[var(--text-muted)]"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <Label className="text-sm text-[var(--text-2)]">Review</Label>
                <p className="mt-2 p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-1)]">
                  {selectedFeedback.text_comments}
                </p>
              </div>

              {/* Resolution Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-[var(--text-2)]">Status</Label>
                  <Select
                    value={resolutionStatus}
                    onValueChange={(v) =>
                      setResolutionStatus(v as "Open" | "In Progress" | "Resolved")
                    }
                  >
                    <SelectTrigger className="bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-1)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--bg-surface)] border-[var(--border-subtle)]">
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-[var(--text-2)]">
                    Resolution Notes
                  </Label>
                  <Textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Add notes about how this was resolved..."
                    className="bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-1)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--accent-orange)]/50 focus:border-[var(--accent-orange)] min-h-24"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--bg-hover)]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleResolve}
                  className="bg-[var(--accent-orange)] text-white hover:bg-[var(--accent-orange-hover)] active:scale-[0.97]"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
