import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { getUnreadNotificationCount } from "@/lib/actions";

export const metadata: Metadata = {
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Aptrade Funding",
  },
  icons: {
    apple: "/icon-192x192.png",
  },
};

export default async function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "INVESTOR") redirect("/login");

  const unreadCount = await getUnreadNotificationCount();

  return (
    <div className="relative flex flex-col md:flex-row min-h-screen bg-[#03050a] theme-investor-dark dark p-3 md:p-4 gap-0 md:gap-6 overflow-hidden pb-20 md:pb-0">
      {/* Luzes Radiais Difusas de Fundo (Glows Fintech) */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#F5C400]/[0.04] blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] rounded-full bg-[#10B981]/[0.03] blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[30%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/[0.02] blur-[120px] pointer-events-none z-0" />

      {/* Sidebar Flutuante */}
      <Sidebar 
        role="INVESTOR" 
        userName={session.name} 
        email={session.email} 
        approved={session.approved} 
      />

      {/* Área Principal de Conteúdo */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <Header userName={session.name} role="INVESTOR" unreadNotifications={typeof unreadCount === "number" ? unreadCount : 0} />
        <main className="flex-1 overflow-y-auto no-scrollbar pt-6 pb-4">
          {children}
        </main>
      </div>

      {/* Navegação Inferior Mobile */}
      <BottomNav />
    </div>
  );
}
