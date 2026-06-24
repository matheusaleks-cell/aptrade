"use client";

import { useState } from "react";
import {
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/lib/actions-suppliers";
import { useRouter } from "next/navigation";
import {
  Truck,
  Plus,
  ChevronDown,
  ChevronUp,
  Star,
  Pencil,
  Trash2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  country: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  bankDetails: string | null;
  rating: number | null;
  notes: string | null;
  importLotCount: number;
}

export function SuppliersClient({
  initialSuppliers,
}: {
  initialSuppliers: Supplier[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Supplier>>({});

  const inputClass =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent";
  const labelClass = "block text-xs font-medium text-gray-500 mb-1";

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    const result = await createSupplier(formData);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Fornecedor criado com sucesso!" });
      setShowForm(false);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir fornecedor "${name}"?`)) return;
    const result = await deleteSupplier(id);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Fornecedor removido." });
      router.refresh();
    }
  }

  function startEdit(supplier: Supplier) {
    setEditingId(supplier.id);
    setEditData({
      name: supplier.name,
      country: supplier.country,
      contactName: supplier.contactName,
      contactEmail: supplier.contactEmail,
      contactPhone: supplier.contactPhone,
      bankDetails: supplier.bankDetails,
      rating: supplier.rating,
      notes: supplier.notes,
    });
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    setLoading(true);
    setMessage(null);
    const result = await updateSupplier(editingId, {
      name: editData.name || undefined,
      country: editData.country || undefined,
      contactName: editData.contactName || null,
      contactEmail: editData.contactEmail || null,
      contactPhone: editData.contactPhone || null,
      bankDetails: editData.bankDetails || null,
      rating: editData.rating ?? undefined,
      notes: editData.notes || null,
    });
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Fornecedor atualizado." });
      setEditingId(null);
      router.refresh();
    }
    setLoading(false);
  }

  function renderStars(rating: number | null) {
    const r = rating ?? 0;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={14}
            className={i <= r ? "text-amber-400 fill-amber-400" : "text-gray-200"}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fornecedores</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerenciamento de fornecedores internacionais
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          {showForm ? <ChevronUp size={14} /> : <Plus size={14} />}
          {showForm ? "Fechar" : "Novo Fornecedor"}
        </button>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold text-gray-700">
            Cadastrar Fornecedor
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Nome *</label>
              <input name="name" required className={inputClass} placeholder="Nome do fornecedor" />
            </div>
            <div>
              <label className={labelClass}>Pais *</label>
              <input name="country" required className={inputClass} placeholder="Pais de origem" />
            </div>
            <div>
              <label className={labelClass}>Nome do Contato</label>
              <input name="contactName" className={inputClass} placeholder="Responsavel" />
            </div>
            <div>
              <label className={labelClass}>Email do Contato</label>
              <input name="contactEmail" type="email" className={inputClass} placeholder="email@fornecedor.com" />
            </div>
            <div>
              <label className={labelClass}>Telefone do Contato</label>
              <input name="contactPhone" className={inputClass} placeholder="+00 000 000 0000" />
            </div>
            <div>
              <label className={labelClass}>Rating (1-5)</label>
              <input name="rating" type="number" min={1} max={5} defaultValue={5} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Dados Bancarios</label>
              <input name="bankDetails" className={inputClass} placeholder="Banco, SWIFT, IBAN..." />
            </div>
            <div>
              <label className={labelClass}>Notas</label>
              <input name="notes" className={inputClass} placeholder="Observacoes" />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Plus size={14} />
              {loading ? "Criando..." : "Criar Fornecedor"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Truck size={18} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">
            {initialSuppliers.length} fornecedor(es)
          </h3>
        </div>

        {initialSuppliers.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            Nenhum fornecedor cadastrado.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Nome</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Pais</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Contato</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Email</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-500">Rating</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-500">Lotes</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-500">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {initialSuppliers.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                    {editingId === s.id ? (
                      <>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={editData.name || ""}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={editData.country || ""}
                            onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={editData.contactName || ""}
                            onChange={(e) => setEditData({ ...editData, contactName: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="email"
                            value={editData.contactEmail || ""}
                            onChange={(e) => setEditData({ ...editData, contactEmail: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            min={1}
                            max={5}
                            value={editData.rating ?? 5}
                            onChange={(e) => setEditData({ ...editData, rating: parseInt(e.target.value) })}
                            className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-center"
                          />
                        </td>
                        <td className="py-2 px-3 text-center text-gray-600">
                          {s.importLotCount}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={handleSaveEdit}
                              disabled={loading}
                              className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Salvar"
                            >
                              <Save size={14} className="text-emerald-600" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Cancelar"
                            >
                              <X size={14} className="text-gray-500" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-3 font-medium text-gray-700">{s.name}</td>
                        <td className="py-2 px-3 text-gray-600">{s.country}</td>
                        <td className="py-2 px-3 text-gray-600">{s.contactName || "-"}</td>
                        <td className="py-2 px-3 text-gray-600">{s.contactEmail || "-"}</td>
                        <td className="py-2 px-3 text-center">{renderStars(s.rating)}</td>
                        <td className="py-2 px-3 text-center text-gray-600">{s.importLotCount}</td>
                        <td className="py-2 px-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => startEdit(s)}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Pencil size={14} className="text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleDelete(s.id, s.name)}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={14} className="text-red-400" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
