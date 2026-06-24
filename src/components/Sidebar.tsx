"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  LogOut,
  Settings,
  Users,
  FolderOpen,
  Ship,
  ShieldCheck,
  ChevronDown,
  DollarSign,
  Calculator,
  FileBarChart,
  ShoppingCart,
  UserPlus,
  Truck,
  Globe,
  Bell,
  Banknote,
  Wallet,
} from "lucide-react";

const investorLinks = [
  { href: "/investidor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/investidor/oportunidades", label: "Oportunidades", icon: Globe },
  { href: "/investidor/portfolio", label: "Portfólio", icon: Briefcase },
  { href: "/investidor/extrato", label: "Extrato", icon: FileText },
  { href: "/investidor/saques", label: "Saques", icon: DollarSign },
  { href: "/investidor/documentos", label: "Documentos", icon: ShieldCheck },
  { href: "/investidor/simulador", label: "Simulador", icon: Calculator },
  { href: "/investidor/notificacoes", label: "Notificações", icon: Bell },
  { href: "/investidor/perfil", label: "Perfil", icon: User },
];

interface SubMenu {
  label: string;
  icon: typeof LayoutDashboard;
  children: { href: string; label: string }[];
}

const adminLinks: (
  | { href: string; label: string; icon: typeof LayoutDashboard }
  | SubMenu
)[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projetos", label: "Projetos", icon: FolderOpen },
  { href: "/admin/operacoes", label: "Operações", icon: Ship },
  { href: "/admin/investidores", label: "Investidores", icon: Users },
  { href: "/admin/aportes", label: "Aportes", icon: Wallet },
  { href: "/admin/saques", label: "Saques", icon: Banknote },
  { href: "/admin/vendas", label: "Vendas", icon: ShoppingCart },
  {
    label: "CRM",
    icon: UserPlus,
    children: [
      { href: "/admin/crm/funil", label: "Funil de Leads" },
      { href: "/admin/crm/clientes", label: "Clientes" },
    ],
  },
  {
    label: "Importação",
    icon: Truck,
    children: [
      { href: "/admin/importacao/lotes", label: "Lotes" },
      { href: "/admin/fornecedores", label: "Fornecedores" },
    ],
  },
  { href: "/admin/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/admin/simulador", label: "Simulador", icon: Calculator },
  { href: "/admin/relatorios", label: "Relatórios", icon: FileBarChart },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

interface SidebarProps {
  role: "INVESTOR" | "ADMIN";
  userName?: string;
  email?: string;
  approved?: boolean;
}

export function Sidebar({ role, userName, email, approved }: SidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());

  const links = role === "ADMIN" ? adminLinks : investorLinks;

  function toggleMenu(label: string) {
    setOpenMenus((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function isSubmenu(item: (typeof adminLinks)[number]): item is SubMenu {
    return "children" in item;
  }

  return (
    <aside className={`hidden md:flex w-64 text-white h-[calc(100vh-2rem)] rounded-[28px] border border-white/[0.04] shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex-col sticky top-4 shrink-0 transition-all duration-300 ${
      role === "ADMIN" ? "bg-[#0b0e17]" : "bg-[#080B15]/75 backdrop-blur-2xl"
    }`}>
      <div className="p-6 border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Aptrade" className="h-8 w-auto object-contain" />
          <div className="border-l border-white/10 pl-2.5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              {role === "ADMIN" ? "Administrador" : "Funding Hub"}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto no-scrollbar">
        {links.map((item, i) => {
          if (isSubmenu(item)) {
            const Icon = item.icon;
            const isOpen = openMenus.has(item.label);
            const isChildActive = item.children.some((c) => pathname.startsWith(c.href));
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`flex items-center justify-between w-full py-2.5 rounded-xl text-sm transition-all group border-l-2 pl-3.5 pr-3.5 ${
                    isChildActive
                      ? "bg-[#F5C400]/8 text-white border-[#F5C400] font-bold"
                      : "text-slate-300 hover:bg-white/[0.025] hover:text-white border-transparent"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={16} className={isChildActive ? "text-white" : "text-slate-400 group-hover:text-white"} />
                    <span className="tracking-wide">{item.label}</span>
                  </span>
                  <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="ml-6 mt-0.5 space-y-0.5">
                    {item.children.map((child) => {
                      const active = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block py-2 px-3 rounded-lg text-xs transition-all ${
                            active
                              ? "bg-white/[0.06] text-white font-semibold"
                              : "text-slate-300 hover:text-white hover:bg-white/[0.02]"
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 py-2.5 rounded-xl text-sm transition-all duration-300 group ${
                active
                  ? "bg-[#F5C400]/8 text-white border-l-2 border-[#F5C400] pl-3.5 pr-3.5 font-bold shadow-[0_4px_20px_-3px_rgba(245,196,0,0.06)]"
                  : "text-slate-300 hover:bg-white/[0.025] hover:text-white border-l-2 border-transparent pl-3.5 pr-3.5"
              }`}
            >
              <Icon size={16} className={active ? "text-white" : "text-slate-400 group-hover:text-white"} />
              <span className="tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/[0.04] space-y-3">
        {role === "INVESTOR" && userName && (
          <div className="p-3.5 bg-gradient-to-b from-white/[0.015] to-[#0c1022]/30 border border-white/[0.04] rounded-2xl flex items-center gap-3 transition-all duration-300 hover:bg-white/[0.03]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F5C400] to-[#DF9A00] flex items-center justify-center text-black text-xs font-black shadow-[0_0_10px_rgba(245,196,0,0.2)] border border-black/10 shrink-0">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-slate-200 truncate">{userName}</span>
              <div className="flex items-center gap-1 mt-1">
                {approved ? (
                  <span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-400">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                    Verificado CVM
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[9px] font-semibold text-amber-400">
                    <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse shrink-0" />
                    Em análise CVM
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <form action="/api/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-slate-300 hover:bg-red-500/10 hover:text-red-400 w-full transition-all duration-300 cursor-pointer border border-transparent font-medium group"
          >
            <LogOut size={16} className="text-slate-400 group-hover:text-red-400" />
            <span className="tracking-wider">Sair da Sessão</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
