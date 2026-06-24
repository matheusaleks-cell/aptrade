import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "yellow" | "emerald" | "blue" | "purple";
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  variant = "yellow"
}: StatCardProps) {
  
  // Cores adaptativas para tema claro (admin) e tema escuro (investidor)
  const variantStyles = {
    yellow: {
      borderHover: "group-hover:border-[#F5C400]/30",
      glowColor: "dark:group-hover:bg-[#F5C400]/5",
      textGradient: "dark:text-gradient-gold"
    },
    emerald: {
      borderHover: "group-hover:border-emerald-500/30",
      glowColor: "dark:group-hover:bg-emerald-500/5",
      textGradient: "dark:text-gradient-emerald"
    },
    blue: {
      borderHover: "group-hover:border-blue-500/30",
      glowColor: "dark:group-hover:bg-blue-500/5",
      textGradient: "dark:text-gradient-blue"
    },
    purple: {
      borderHover: "group-hover:border-purple-500/30",
      glowColor: "dark:group-hover:bg-purple-500/5",
      textGradient: "dark:text-gradient-purple"
    }
  };

  const styles = variantStyles[variant];

  // Lógica para formatar tipografia de valores financeiros de luxo
  const renderValue = () => {
    if (value.startsWith("R$")) {
      const cleanValue = value.replace("R$", "").replace(/\u00a0/g, " ").trim();
      const parts = cleanValue.split(",");
      const parteInteira = parts[0];
      const parteDecimal = parts[1] ? `,${parts[1]}` : "";

      return (
        <span className={`flex items-baseline mt-2 font-extrabold tracking-tight text-gray-900 dark:text-white transition-all duration-300 ${styles.textGradient}`}>
          <span className="text-sm sm:text-base font-semibold text-gray-450 dark:text-slate-500 mr-1 self-center">
            R$
          </span>
          <span className="text-2xl sm:text-3xl font-black">
            {parteInteira}
          </span>
          {parteDecimal && (
            <span className="text-base sm:text-lg font-semibold text-gray-400 dark:text-slate-400 ml-0.5">
              {parteDecimal}
            </span>
          )}
        </span>
      );
    }

    return (
      <p className={`text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-2 tracking-tight transition-all duration-350 ${styles.textGradient}`}>
        {value}
      </p>
    );
  };

  return (
    <div className={`bg-white dark:glass-card-fintech rounded-3xl border border-gray-200 dark:border-white/[0.03] p-6 hover-lift-premium shadow-[0_8px_30px_rgba(15,23,42,0.02)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.25)] transition-all duration-300 relative overflow-hidden group ${styles.borderHover}`}>
      {/* Glow de fundo no Hover (Tema Escuro) */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${styles.glowColor}`} />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
          {renderValue()}
          
          {subtitle && <p className="text-xs text-gray-400 dark:text-slate-450 mt-1.5">{subtitle}</p>}
          
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2.5">
              <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${
                trend === "up" 
                  ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" 
                  : trend === "down" 
                  ? "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400" 
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400"
              }`}>
                {trend === "up" ? "↑ " : trend === "down" ? "↓ " : ""}
                {trendValue}
              </span>
            </div>
          )}
        </div>
        
        <div className="p-2 rounded-lg border border-gray-150 dark:border-white/[0.04] bg-gray-50/50 dark:bg-white/[0.02] text-gray-400 dark:text-slate-400 shrink-0 flex items-center justify-center">
          <Icon size={16} />
        </div>
      </div>
    </div>
  );
}

