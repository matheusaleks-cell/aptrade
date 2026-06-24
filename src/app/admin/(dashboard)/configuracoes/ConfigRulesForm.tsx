"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Percent, Shield, CheckCircle } from "lucide-react";
import { updateSystemConfig } from "@/lib/actions";
import { Input } from "@/components/ui/input";

const configRulesSchema = z.object({
  ii: z.number().min(0, "O valor não pode ser negativo"),
  pis: z.number().min(0, "O valor não pode ser negativo"),
  cofins: z.number().min(0, "O valor não pode ser negativo"),
  icms: z.number().min(0, "O valor não pode ser negativo"),
  salesTax: z.number().min(0, "O valor não pode ser negativo"),
  opEx: z.number().min(0, "O valor não pode ser negativo"),
  cvmLimit: z.number().int("O limite deve ser um número inteiro").min(0, "O limite não pode ser negativo"),
});

type ConfigRulesValues = z.infer<typeof configRulesSchema>;

interface ConfigRulesFormProps {
  adminName: string;
  initialConfig: {
    iiRate: number;
    pisRate: number;
    cofinsRate: number;
    icmsRate: number;
    salesTaxRate: number;
    opExRate: number;
    cvmLimit: number;
  };
}

export function ConfigRulesForm({ adminName, initialConfig }: ConfigRulesFormProps) {
  // Estado de carregamento e mensagens
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfigRulesValues>({
    resolver: zodResolver(configRulesSchema),
    defaultValues: {
      ii: initialConfig.iiRate * 100,
      pis: initialConfig.pisRate * 100,
      cofins: initialConfig.cofinsRate * 100,
      icms: initialConfig.icmsRate * 100,
      salesTax: initialConfig.salesTaxRate * 100,
      opEx: initialConfig.opExRate * 100,
      cvmLimit: initialConfig.cvmLimit,
    },
  });

  const onSubmit = async (data: ConfigRulesValues) => {
    setLoading(true);
    setSuccessMsg(false);

    const res = await updateSystemConfig({
      iiRate: data.ii / 100,
      pisRate: data.pis / 100,
      cofinsRate: data.cofins / 100,
      icmsRate: data.icms / 100,
      salesTaxRate: data.salesTax / 100,
      opExRate: data.opEx / 100,
      cvmLimit: data.cvmLimit
    });

    setLoading(false);

    if (res && "error" in res && res.error) {
      alert(`Erro ao salvar configurações: ${res.error}`);
      return;
    }

    setSuccessMsg(true);

    // Limpar mensagem de sucesso após 4 segundos
    setTimeout(() => {
      setSuccessMsg(false);
    }, 4000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {successMsg && (
        <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300">
          <CheckCircle size={16} />
          Configurações e alíquotas salvas com sucesso no sistema!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna 1 & 2: Alíquotas Fiscais */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
              <Percent size={18} className="text-[#DF9A00]" />
              <h3 className="text-sm font-semibold text-gray-800">Alíquotas de Importação Padrão</h3>
            </div>
            
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Defina as alíquotas fiscais globais utilizadas como padrão para o cálculo de nacionalização de produtos em novas captações de funding.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Imposto de Importação (II)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register("ii", { valueAsNumber: true })}
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 font-medium focus:bg-white focus:outline-none focus:border-[#DF9A00] transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span>
                </div>
                {errors.ii && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.ii.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  PIS Aduaneiro
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register("pis", { valueAsNumber: true })}
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 font-medium focus:bg-white focus:outline-none focus:border-[#DF9A00] transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span>
                </div>
                {errors.pis && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.pis.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  COFINS Aduaneiro
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register("cofins", { valueAsNumber: true })}
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 font-medium focus:bg-white focus:outline-none focus:border-[#DF9A00] transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span>
                </div>
                {errors.cofins && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.cofins.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  ICMS de Importação
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register("icms", { valueAsNumber: true })}
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 font-medium focus:bg-white focus:outline-none focus:border-[#DF9A00] transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span>
                </div>
                {errors.icms && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.icms.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Imposto sobre Vendas (Sales Tax)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register("salesTax", { valueAsNumber: true })}
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 font-medium focus:bg-white focus:outline-none focus:border-[#DF9A00] transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span>
                </div>
                {errors.salesTax && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.salesTax.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Taxa Operacional OpEx
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    {...register("opEx", { valueAsNumber: true })}
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 font-medium focus:bg-white focus:outline-none focus:border-[#DF9A00] transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span>
                </div>
                {errors.opEx && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.opEx.message}</p>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Coluna 3: Limites & Auditoria */}
        <div className="space-y-6">
          
          {/* Card Limite Regulatório */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
              <Shield size={18} className="text-[#DF9A00]" />
              <h3 className="text-sm font-semibold text-gray-800">Parâmetros CVM</h3>
            </div>
            
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Defina o limite regulatório padrão anual de aporte de varejo estabelecido pela Instrução CVM 88.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Limite Anual de Varejo (R$)
                </label>
                <Input
                  type="number"
                  {...register("cvmLimit", { valueAsNumber: true })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 font-medium focus:bg-white focus:outline-none focus:border-[#DF9A00] transition-all"
                />
                {errors.cvmLimit && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.cvmLimit.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Resumo da Sessão */}
          <div className="bg-[#FAF5FF] border border-amber-200/50 rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Identidade Administrador</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-gray-600">
                <span>Operador</span>
                <span className="font-semibold text-gray-800">{adminName}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Privilégio</span>
                <span className="font-bold text-[#DF9A00] uppercase tracking-wider text-[9px] bg-amber-500/10 px-2 py-0.5 rounded-full">Super Admin</span>
              </div>
              <div className="flex justify-between items-center text-gray-600 border-t border-gray-100 pt-2.5">
                <span>Versão do App</span>
                <span className="font-mono font-medium text-gray-500">v1.0.0</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Botão de Salvar Global */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3.5 bg-[#DF9A00] hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer text-center"
        >
          {loading ? "Gravando parâmetros..." : "Salvar Configurações Globais"}
        </button>
      </div>

    </form>
  );
}
