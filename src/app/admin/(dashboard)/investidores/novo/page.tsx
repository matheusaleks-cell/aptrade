"use client";

import { useState } from "react";
import { createInvestor } from "@/lib/actions-investors";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, CheckCircle, AlertCircle } from "lucide-react";

export default function NovoInvestidorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await createInvestor(formData);

    if (result?.error) {
      setMessage({ type: "error", text: result.error });
      setLoading(false);
    } else {
      setMessage({ type: "success", text: "Investidor criado com sucesso!" });
      setLoading(false);
      setTimeout(() => {
        router.push("/admin/investidores");
      }, 1500);
    }
  }

  const inputClass =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent";
  const labelClass = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/investidores"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Investidor</h1>
          <p className="text-sm text-gray-500 mt-1">
            Cadastre um novo investidor na plataforma
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Dados Obrigatorios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="name" className={labelClass}>
                Nome *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className={inputClass}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={inputClass}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <label htmlFor="password" className={labelClass}>
                Senha *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className={inputClass}
                placeholder="Minimo 6 caracteres"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Dados Pessoais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="phone" className={labelClass}>
                Telefone
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                className={inputClass}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label htmlFor="cpfCnpj" className={labelClass}>
                CPF/CNPJ
              </label>
              <input
                id="cpfCnpj"
                name="cpfCnpj"
                type="text"
                className={inputClass}
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label htmlFor="rg" className={labelClass}>
                RG
              </label>
              <input
                id="rg"
                name="rg"
                type="text"
                className={inputClass}
                placeholder="RG"
              />
            </div>
            <div>
              <label htmlFor="profession" className={labelClass}>
                Profissao
              </label>
              <input
                id="profession"
                name="profession"
                type="text"
                className={inputClass}
                placeholder="Profissao"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="address" className={labelClass}>
                Endereco
              </label>
              <input
                id="address"
                name="address"
                type="text"
                className={inputClass}
                placeholder="Endereco completo"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Dados Bancarios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="bankName" className={labelClass}>
                Banco
              </label>
              <input
                id="bankName"
                name="bankName"
                type="text"
                className={inputClass}
                placeholder="Nome do banco"
              />
            </div>
            <div>
              <label htmlFor="bankAgency" className={labelClass}>
                Agencia
              </label>
              <input
                id="bankAgency"
                name="bankAgency"
                type="text"
                className={inputClass}
                placeholder="Agencia"
              />
            </div>
            <div>
              <label htmlFor="bankAccount" className={labelClass}>
                Conta
              </label>
              <input
                id="bankAccount"
                name="bankAccount"
                type="text"
                className={inputClass}
                placeholder="Conta corrente"
              />
            </div>
            <div>
              <label htmlFor="pixKey" className={labelClass}>
                Chave PIX
              </label>
              <input
                id="pixKey"
                name="pixKey"
                type="text"
                className={inputClass}
                placeholder="Chave PIX"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Referencias
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bankReferences" className={labelClass}>
                Referencias Bancarias
              </label>
              <textarea
                id="bankReferences"
                name="bankReferences"
                rows={3}
                className={inputClass}
                placeholder="Referencias bancarias"
              />
            </div>
            <div>
              <label htmlFor="commercialRefs" className={labelClass}>
                Referencias Comerciais
              </label>
              <textarea
                id="commercialRefs"
                name="commercialRefs"
                rows={3}
                className={inputClass}
                placeholder="Referencias comerciais"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/investidores"
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <UserPlus size={14} />
            {loading ? "Criando..." : "Criar Investidor"}
          </button>
        </div>
      </form>
    </div>
  );
}
