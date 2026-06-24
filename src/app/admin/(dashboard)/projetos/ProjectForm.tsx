"use client";

import { useState } from "react";
import { createProject } from "@/lib/actions";
import { Plus } from "lucide-react";

export function ProjectForm() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await createProject(formData);

    if (result && "error" in result) {
      setMessage({ type: "error", text: result.error ?? "Erro desconhecido" });
    } else {
      setMessage({ type: "success", text: "Projeto criado com sucesso!" });
      (e.target as HTMLFormElement).reset();
      setTimeout(() => window.location.reload(), 1000);
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
      >
        <Plus size={16} />
        Novo Projeto
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Novo Projeto</h3>

      {message && (
        <div
          className={`px-4 py-3 rounded-lg text-sm mb-4 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
          <input
            name="name"
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Ex: Importação Vezir VR12"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria do Produto (NCM)
          </label>
          <input
            name="productCategory"
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Ex: 8413.70.10"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea
            name="description"
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Descrição do projeto de investimento"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Ciclos</label>
          <input
            name="maxCycles"
            type="number"
            min={1}
            defaultValue={1}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Split do Investidor (%)
          </label>
          <input
            name="profitSplitPct"
            type="number"
            step="0.01"
            min={0}
            max={1}
            defaultValue={0.5}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Regra de Payout
          </label>
          <select
            name="payoutRule"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="AT_SETTLEMENT">Liquidar no Encerramento</option>
            <option value="REINVEST">Reinvestir Automaticamente</option>
          </select>
        </div>

        <div className="md:col-span-2 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar Projeto"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
