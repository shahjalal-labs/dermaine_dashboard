"use client";

import { useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Calendar,
  MessageSquare,
  RefreshCw,
  Bell,
} from "lucide-react";
import { useGetAllPaymentsQuery, useGetAllConsultationsQuery } from "@/redux/api/paymentApi";
import { useGetAllSupportMessagesQuery } from "@/redux/api/adminApi";

type NotificationType = "payment" | "consultation" | "support";

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  rawDate: number;
  isRead: boolean;
}

const getIcon = (type: NotificationType) => {
  switch (type) {
    case "payment":
      return <CreditCard className="w-5 h-5 text-emerald-600" />;
    case "consultation":
      return <Calendar className="w-5 h-5 text-blue-600" />;
    case "support":
    default:
      return <MessageSquare className="w-5 h-5 text-purple-600" />;
  }
};

const getIconBg = (type: NotificationType) => {
  switch (type) {
    case "payment":
      return "bg-emerald-50";
    case "consultation":
      return "bg-blue-50";
    case "support":
    default:
      return "bg-purple-50";
  }
};

const formatTimeAgo = (dateStr?: string | number) => {
  if (!dateStr) return "Recently";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return String(dateStr);

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return "Just now";
};

export default function Notification() {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Fetch live feeds from backend
  const { data: paymentsData, isLoading: paymentsLoading, refetch: refetchPayments } = useGetAllPaymentsQuery({
    page: 1,
    limit: 10,
  });

  const { data: consultationsData, isLoading: consultsLoading, refetch: refetchConsults } = useGetAllConsultationsQuery(undefined);

  const { data: supportData, isLoading: supportLoading, refetch: refetchSupport } = useGetAllSupportMessagesQuery(undefined);

  const isInitialLoading = paymentsLoading && consultsLoading && supportLoading;

  // Aggregate real notifications from backend events
  const notifications: NotificationItem[] = useMemo(() => {
    const list: NotificationItem[] = [];

    // 1. Live Payments
    const rawPayments: any[] =
      paymentsData?.data?.payments ||
      paymentsData?.result?.payments ||
      paymentsData?.data?.items ||
      paymentsData?.result?.items ||
      (Array.isArray(paymentsData?.data) ? paymentsData.data : []);

    rawPayments.forEach((p: any) => {
      const ts = p.createdAt ? new Date(p.createdAt).getTime() : Date.now();
      list.push({
        id: `pay-${p.id}`,
        type: "payment",
        title: "Payment Received",
        description: `Received payment of ${p.amount || `$${p.rawAmount || 0} CAD`} from ${p.userName || "Customer"} for ${p.planName || "Consultation"}.`,
        time: formatTimeAgo(p.createdAt),
        rawDate: ts,
        isRead: readIds.has(`pay-${p.id}`),
      });
    });

    // 2. Live Consultations
    const rawConsultations: any[] =
      consultationsData?.data?.consultations ||
      consultationsData?.result?.consultations ||
      (Array.isArray(consultationsData?.data) ? consultationsData.data : []);

    rawConsultations.forEach((c: any) => {
      const user = c.user || {};
      const ts = c.createdAt ? new Date(c.createdAt).getTime() : Date.now();
      list.push({
        id: `consult-${c.id}`,
        type: "consultation",
        title: "Consultation Appointment",
        description: `${c.name || user.fullName || "User"} scheduled a consultation on ${c.date || "scheduled date"} at ${c.time || "scheduled time"} (${c.status || "Pending"}).`,
        time: formatTimeAgo(c.createdAt),
        rawDate: ts,
        isRead: readIds.has(`consult-${c.id}`),
      });
    });

    // 3. Live Support Messages
    const rawSupport: any[] =
      supportData?.data ||
      supportData?.result ||
      supportData?.supports ||
      (Array.isArray(supportData?.items) ? supportData.items : []);

    if (Array.isArray(rawSupport)) {
      rawSupport.forEach((s: any) => {
        const ts = s.createdAt ? new Date(s.createdAt).getTime() : Date.now();
        list.push({
          id: `support-${s.id}`,
          type: "support",
          title: "New Support Ticket",
          description: `${s.name || "User"} sent: "${(s.message || "").slice(0, 100)}${s.message?.length > 100 ? "..." : ""}"`,
          time: formatTimeAgo(s.createdAt),
          rawDate: ts,
          isRead: readIds.has(`support-${s.id}`),
        });
      });
    }

    // Sort descending by event date
    return list.sort((a, b) => b.rawDate - a.rawDate);
  }, [paymentsData, consultationsData, supportData, readIds]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    const all = new Set(notifications.map((n) => n.id));
    setReadIds(all);
  };

  const markAsRead = (id: string) => {
    setReadIds((prev) => new Set(prev).add(id));
  };

  const handleRefresh = () => {
    refetchPayments();
    refetchConsults();
    refetchSupport();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#ececf2] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-[#ececf2] gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-title flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-primary text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time feed of live payments, consultation bookings, and support inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-[#ececf2] rounded-xl hover:bg-[#f8fafd] transition-colors"
            title="Refresh feed"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Refresh</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 text-primary hover:text-primary/80 font-semibold text-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="divide-y divide-[#ececf2]">
        {isInitialLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 md:p-6 flex gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-[#ececf2]" />
              <div className="flex-1 space-y-2">
                <div className="w-40 h-4 rounded bg-[#ececf2]" />
                <div className="w-3/4 h-3 rounded bg-[#ececf2]" />
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#f8fafd] border border-[#ececf2] flex items-center justify-center mx-auto text-muted-foreground">
              <Bell className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium">No activity notifications yet.</p>
            <p className="text-xs">Live events from payments, bookings, and support will appear here.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={`p-4 md:p-6 transition-colors cursor-pointer hover:bg-[#fbfbfd] flex gap-4 ${
                !notification.isRead ? "bg-[#f4fcf6]" : ""
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconBg(
                    notification.type,
                  )}`}
                >
                  {getIcon(notification.type)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4 mb-1">
                  <h3
                    className={`text-sm font-semibold truncate ${
                      !notification.isRead ? "text-title" : "text-[#5b616e]"
                    }`}
                  >
                    {notification.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5" />
                    {notification.time}
                  </div>
                </div>
                <p
                  className={`text-xs md:text-sm leading-relaxed mt-1 ${
                    !notification.isRead ? "text-[#3f4554]" : "text-[#8f97a8]"
                  }`}
                >
                  {notification.description}
                </p>
              </div>

              {/* Unread indicator dot */}
              {!notification.isRead && (
                <div className="flex-shrink-0 flex items-center justify-center w-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
