"use client";

import { useState, useEffect } from "react";
import { Settings, RefreshCw, Bell, DollarSign } from "lucide-react";

interface InvestmentSettingsProps {
  operationId: string;
}

export function InvestmentSettings({ operationId }: InvestmentSettingsProps) {
  // Estados dos toggles
  const [reinvest, setReinvest] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoWithdraw, setAutoWithdraw] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Carregar do localStorage ao montar
  useEffect(() => {
    setMounted(true);
    const savedReinvest = localStorage.getItem(`op_${operationId}_reinvest`);
    const savedNotifications = localStorage.getItem(`op_${operationId}_notifications`);
    const savedAutoWithdraw = localStorage.getItem(`op_${operationId}_autowithdraw`);

    if (savedReinvest !== null) setReinvest(savedReinvest === "true");
    if (savedNotifications !== null) setNotifications(savedNotifications === "true");
    if (savedAutoWithdraw !== null) setAutoWithdraw(savedAutoWithdraw === "true");
  }, [operationId]);

  // Atualizar localStorage quando mudar
  const handleToggle = (key: string, value: boolean, setter: (val: boolean) => void) => {
    setter(value);
    localStorage.setItem(`op_${operationId}_${key}`, String(value));
  };

  // Se não estiver montado no cliente, renderiza o esqueleto ou estado inicial para evitar hidratação inconsistente
  if (!mounted) {
    return (
      <div className="block md:hidden bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-6 shadow-2xl animate-pulse">
        <div className="h-5 bg-white/10 rounded w-1/2 mb-6" />
        <div className="space-y-4">
          <div className="h-10 bg-white/5 rounded" />
          <div className="h-10 bg-white/5 rounded" />
          <div className="h-10 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="block md:hidden bg-[#0b0e17] dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-6 shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-2 mb-5 border-b border-white/5 pb-3">
        <Settings size={16} className="text-slate-400" />
        <h2 className="text-sm font-semibold text-white">Configurações de Investimento</h2>
      </div>

      <div className="space-y-4">
        {/* Toggle 1: Reaplicação Automática */}
        <div className="flex items-center justify-between p-3.5 bg-white/[0.015] border border-white/[0.02] hover:border-white/[0.05] rounded-2xl transition-all duration-200">
          <div className="flex items-start gap-3 min-w-0 pr-4">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 shrink-0 mt-0.5">
              <RefreshCw size={15} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Reaplicação Automática de Lucros</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                Reinveste automaticamente os rendimentos deste ciclo na mesma operação.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleToggle("reinvest", !reinvest, setReinvest)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              reinvest ? "bg-[#F5C400]" : "bg-white/10"
            }`}
            aria-label="Toggle Reaplicação Automática de Lucros"
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-900 shadow ring-0 transition duration-200 ease-in-out ${
                reinvest ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Toggle 2: Notificações */}
        <div className="flex items-center justify-between p-3.5 bg-white/[0.015] border border-white/[0.02] hover:border-white/[0.05] rounded-2xl transition-all duration-200">
          <div className="flex items-start gap-3 min-w-0 pr-4">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 shrink-0 mt-0.5">
              <Bell size={15} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Notificações de Trânsito</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                Receba alertas quando houver movimentação alfandegária ou desembaraço.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleToggle("notifications", !notifications, setNotifications)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              notifications ? "bg-[#F5C400]" : "bg-white/10"
            }`}
            aria-label="Toggle Notificações de Trânsito"
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-900 shadow ring-0 transition duration-200 ease-in-out ${
                notifications ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Toggle 3: Resgates Automáticos */}
        <div className="flex items-center justify-between p-3.5 bg-white/[0.015] border border-white/[0.02] hover:border-white/[0.05] rounded-2xl transition-all duration-200">
          <div className="flex items-start gap-3 min-w-0 pr-4">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 shrink-0 mt-0.5">
              <DollarSign size={15} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Resgates Automáticos</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                Saca os lucros diretamente para sua conta bancária pré-cadastrada no fim do ciclo.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleToggle("autowithdraw", !autoWithdraw, setAutoWithdraw)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              autoWithdraw ? "bg-[#F5C400]" : "bg-white/10"
            }`}
            aria-label="Toggle Resgates Automáticos"
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-900 shadow ring-0 transition duration-200 ease-in-out ${
                autoWithdraw ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
