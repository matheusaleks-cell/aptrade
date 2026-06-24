"use client";

import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck, TrendingUp, Ship, Coins, Info } from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date | string;
}

interface NotificacoesClientProps {
  notifications: NotificationItem[];
}

const typeIcons: Record<string, typeof Bell> = {
  INFO: Info,
  CAPTACAO: Coins,
  LOGISTICA: Ship,
  PAGAMENTO: TrendingUp,
};

const typeColors: Record<string, string> = {
  INFO: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  CAPTACAO: "text-[#F5C400] bg-[#F5C400]/10 border-[#F5C400]/20",
  LOGISTICA: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  PAGAMENTO: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

export function NotificacoesClient({ notifications }: NotificacoesClientProps) {
  const router = useRouter();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    router.refresh();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    toast.success("Todas as notificações foram marcadas como lidas.");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex justify-end animate-fade-in-up">
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#F5C400] bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-[#F5C400]/20 px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-95"
          >
            <CheckCheck size={14} /> Marcar todas como lidas ({unreadCount})
          </button>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-12 text-center shadow-2xl animate-fade-in-up">
          <Bell size={28} className="mx-auto text-slate-500 mb-4" />
          <p className="text-gray-500 dark:text-slate-400 font-medium">Nenhuma notificação.</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
            Você será notificado sobre captações, logística e pagamentos.
          </p>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in-up delay-100">
          {notifications.map((notif) => {
            const IconComponent = typeIcons[notif.type] || Bell;
            const colorClass = typeColors[notif.type] || typeColors.INFO;

            return (
              <div
                key={notif.id}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                  notif.read
                    ? "bg-white/[0.01] dark:bg-white/[0.01] border-gray-100 dark:border-white/[0.03]"
                    : "bg-white/[0.03] dark:bg-white/[0.03] border-gray-200 dark:border-white/[0.06] shadow-lg"
                }`}
              >
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${colorClass}`}>
                  <IconComponent size={16} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`text-sm font-bold ${notif.read ? "text-slate-400" : "text-white"}`}>
                        {notif.title}
                      </p>
                      <p className={`text-xs mt-1 leading-relaxed ${notif.read ? "text-slate-500" : "text-slate-300"}`}>
                        {notif.message}
                      </p>
                    </div>
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className="p-1.5 hover:bg-white/5 rounded-lg transition-colors shrink-0"
                        title="Marcar como lida"
                      >
                        <Check size={14} className="text-slate-400" />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 font-medium">
                    {new Date(notif.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-[#F5C400] shrink-0 mt-2 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
