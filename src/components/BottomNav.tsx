"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, FileText, User } from "lucide-react";

const navItems = [
  { href: "/investidor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/investidor/portfolio", label: "Portfólio", icon: Briefcase },
  { href: "/investidor/extrato", label: "Extrato", icon: FileText },
  { href: "/investidor/perfil", label: "Perfil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#060813]/95 backdrop-blur-lg border-t border-white/[0.05] z-50 flex md:hidden items-center justify-around px-4 shadow-[0_-8px_30px_rgba(0,0,0,0.4)] rounded-t-[20px]">
      {navItems.map((item) => {
        const Icon = item.icon;
        // Para o Dashboard, correspondência exata para evitar ativar em subrotas.
        // Para os demais, verifica se o pathname inicia com a rota correspondente.
        const isActive =
          item.href === "/investidor"
            ? pathname === "/investidor"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all duration-300 gap-1 ${
              isActive
                ? "text-[#F5C400] font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Icon size={20} className={isActive ? "scale-105" : ""} />
            <span className="text-[10px] tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
