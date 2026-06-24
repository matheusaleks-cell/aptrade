"use client";

import { useState } from "react";
import { useForm, Controller, UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { saveImportCosts } from "@/lib/actions";
import { formatBRL } from "@/lib/calculations";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface ImportCostFormProps {
  operationId: string;
  systemConfig?: {
    iiRate: number;
    pisRate: number;
    cofinsRate: number;
    icmsRate: number;
    salesTaxRate: number;
    opExRate: number;
  };
}

const importCostSchema = z.object({
  fobValue: z.number().min(0, "O valor deve ser maior ou igual a zero"),
  freight: z.number().min(0, "O valor deve ser maior ou igual a zero"),
  insurance: z.number().min(0, "O valor deve ser maior ou igual a zero"),
  quantity: z.number().int("A quantidade deve ser um número inteiro").min(1, "A quantidade deve ser pelo menos 1"),
  exchangeRate: z.number().min(0.01, "O câmbio deve ser maior que zero"),
  iiRate: z.number().min(0, "O imposto não pode ser negativo"),
  pisRate: z.number().min(0, "O imposto não pode ser negativo"),
  cofinsRate: z.number().min(0, "O imposto não pode ser negativo"),
  icmsRate: z.number().min(0, "O imposto não pode ser negativo"),
  icmsFactor: z.number().gt(0, "O fator deve ser maior que zero"),
  salesTaxRate: z.number().min(0, "O imposto não pode ser negativo"),
  opExRate: z.number().min(0, "O imposto não pode ser negativo"),
  siscomexFixed: z.number().min(0, "O valor deve ser maior ou igual a zero"),
  customsOpCost: z.number().min(0, "O valor deve ser maior ou igual a zero"),
  sellingPrice: z.any().optional(),
  isActual: z.boolean(),
});

type ImportCostValues = z.infer<typeof importCostSchema>;

export function ImportCostForm({ operationId, systemConfig }: ImportCostFormProps) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<{
    custoTotal: number;
    custoUnitario: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ImportCostValues>({
    resolver: zodResolver(importCostSchema),
    defaultValues: {
      fobValue: 0,
      freight: 0,
      insurance: 0,
      quantity: 1,
      exchangeRate: 5.50,
      iiRate: systemConfig?.iiRate !== undefined ? systemConfig.iiRate : 0.18,
      pisRate: systemConfig?.pisRate !== undefined ? systemConfig.pisRate : 0.021,
      cofinsRate: systemConfig?.cofinsRate !== undefined ? systemConfig.cofinsRate : 0.0965,
      icmsRate: systemConfig?.icmsRate !== undefined ? systemConfig.icmsRate : 0.18,
      icmsFactor: 0.82,
      salesTaxRate: systemConfig?.salesTaxRate !== undefined ? systemConfig.salesTaxRate : 0.08,
      opExRate: systemConfig?.opExRate !== undefined ? systemConfig.opExRate : 0.15,
      siscomexFixed: 154.23,
      customsOpCost: 0,
      sellingPrice: undefined,
      isActual: false,
    },
  });

  async function onSubmit(data: ImportCostValues) {
    setLoading(true);

    const formData = new FormData();
    formData.set("operationId", operationId);
    formData.set("fobValue", String(data.fobValue));
    formData.set("freight", String(data.freight));
    formData.set("insurance", String(data.insurance));
    formData.set("quantity", String(data.quantity));
    formData.set("exchangeRate", String(data.exchangeRate));
    formData.set("iiRate", String(data.iiRate));
    formData.set("pisRate", String(data.pisRate));
    formData.set("cofinsRate", String(data.cofinsRate));
    formData.set("icmsRate", String(data.icmsRate));
    formData.set("icmsFactor", String(data.icmsFactor));
    formData.set("salesTaxRate", String(data.salesTaxRate));
    formData.set("opExRate", String(data.opExRate));
    formData.set("siscomexFixed", String(data.siscomexFixed));
    formData.set("customsOpCost", String(data.customsOpCost));
    if (data.sellingPrice !== undefined && data.sellingPrice !== null && data.sellingPrice !== "") {
      const price = typeof data.sellingPrice === "string" ? parseFloat(data.sellingPrice) : Number(data.sellingPrice);
      if (!isNaN(price) && price >= 0) {
        formData.set("sellingPrice", String(price));
      }
    }
    formData.set("isActual", data.isActual ? "true" : "false");

    const res = await saveImportCosts(formData);
    if (res && "calculation" in res && res.calculation) {
      setResult({
        custoTotal: res.calculation.custoTotal,
        custoUnitario: res.calculation.custoUnitario,
      });
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
      >
        <Plus size={14} />
        Registrar Custos
      </button>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">
        Registrar Custos de Importação
      </h4>

      {result && (
        <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg text-sm mb-3">
          Custo Total: {formatBRL(result.custoTotal)} | Unitário:{" "}
          {formatBRL(result.custoUnitario)}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <InputField label="FOB (USD/un)" step="0.01" registration={register("fobValue", { valueAsNumber: true })} error={errors.fobValue?.message?.toString()} />
        <InputField label="Frete (USD/un)" step="0.01" registration={register("freight", { valueAsNumber: true })} error={errors.freight?.message?.toString()} />
        <InputField label="Seguro (USD/un)" step="0.01" registration={register("insurance", { valueAsNumber: true })} error={errors.insurance?.message?.toString()} />
        <InputField label="Quantidade" type="number" registration={register("quantity", { valueAsNumber: true })} error={errors.quantity?.message?.toString()} />
        <InputField label="Câmbio (BRL)" step="0.01" registration={register("exchangeRate", { valueAsNumber: true })} error={errors.exchangeRate?.message?.toString()} />
        <InputField label="II (%)" step="0.001" registration={register("iiRate", { valueAsNumber: true })} error={errors.iiRate?.message?.toString()} />
        <InputField label="PIS (%)" step="0.001" registration={register("pisRate", { valueAsNumber: true })} error={errors.pisRate?.message?.toString()} />
        <InputField label="COFINS (%)" step="0.001" registration={register("cofinsRate", { valueAsNumber: true })} error={errors.cofinsRate?.message?.toString()} />
        <InputField label="ICMS (%)" step="0.001" registration={register("icmsRate", { valueAsNumber: true })} error={errors.icmsRate?.message?.toString()} />
        <InputField label="Fator ICMS" step="0.001" registration={register("icmsFactor", { valueAsNumber: true })} error={errors.icmsFactor?.message?.toString()} />
        <InputField label="Simples (%)" step="0.001" registration={register("salesTaxRate", { valueAsNumber: true })} error={errors.salesTaxRate?.message?.toString()} />
        <InputField label="OpEx (%)" step="0.001" registration={register("opExRate", { valueAsNumber: true })} error={errors.opExRate?.message?.toString()} />
        <InputField label="Siscomex (BRL)" step="0.01" registration={register("siscomexFixed", { valueAsNumber: true })} error={errors.siscomexFixed?.message?.toString()} />
        <InputField label="Desp. Alfandeg. (BRL)" step="0.01" registration={register("customsOpCost", { valueAsNumber: true })} error={errors.customsOpCost?.message?.toString()} />
        <InputField label="Preço Venda (BRL)" step="0.01" registration={register("sellingPrice")} error={errors.sellingPrice?.message?.toString()} />

        <div className="flex items-end gap-2 py-2">
          <label htmlFor="isActual" className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <Controller
              name="isActual"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="isActual"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(!!checked)}
                />
              )}
            />
            Realizado
          </label>
        </div>

        <div className="col-span-full flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Salvando..." : "Salvar Custos"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

function InputField({
  label,
  type = "number",
  step,
  registration,
  error,
}: {
  label: string;
  type?: string;
  step?: string;
  registration: UseFormRegisterReturn;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <Input
        type={type}
        step={step}
        {...registration}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      {error && (
        <p className="mt-1 text-xs text-red-500 font-semibold">{error}</p>
      )}
    </div>
  );
}
