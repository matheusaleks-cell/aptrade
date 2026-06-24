"use client";

import { useState } from "react";
import {
  updateInvestor,
  resetInvestorPassword,
  uploadInvestorDocument,
  deleteInvestorDocument,
  getDocumentContent,
} from "@/lib/actions-investors";
import { formatBRL } from "@/lib/calculations";
import { StatusBadge } from "@/components/StatusBadge";
import { DocumentUpload } from "@/components/DocumentUpload";
import {
  User,
  Building2,
  FolderOpen,
  FileText,
  KeyRound,
  Save,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface InvestorData {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string | null;
  phone: string | null;
  rg: string | null;
  address: string | null;
  profession: string | null;
  bankName: string | null;
  bankAgency: string | null;
  bankAccount: string | null;
  pixKey: string | null;
  bankReferences: string | null;
  commercialRefs: string | null;
  approved: boolean;
  investments: any[];
  documents: any[];
  stats: {
    totalInvested: number;
    totalReceived: number;
    roi: number;
    activeProjects: number;
  };
}

export function InvestorDetailClient({ investor }: { investor: InvestorData }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"personal" | "bank" | "projects" | "documents">("personal");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const [personalData, setPersonalData] = useState({
    name: investor.name || "",
    email: investor.email || "",
    phone: investor.phone || "",
    cpfCnpj: investor.cpfCnpj || "",
    rg: investor.rg || "",
    profession: investor.profession || "",
    address: investor.address || "",
  });

  const [bankData, setBankData] = useState({
    bankName: investor.bankName || "",
    bankAgency: investor.bankAgency || "",
    bankAccount: investor.bankAccount || "",
    pixKey: investor.pixKey || "",
  });

  async function handleSavePersonal() {
    setSaving(true);
    setMessage(null);
    const result = await updateInvestor(investor.id, {
      name: personalData.name || undefined,
      email: personalData.email || undefined,
      phone: personalData.phone || null,
      cpfCnpj: personalData.cpfCnpj || null,
      rg: personalData.rg || null,
      profession: personalData.profession || null,
      address: personalData.address || null,
    });
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Dados pessoais atualizados." });
      router.refresh();
    }
    setSaving(false);
  }

  async function handleSaveBank() {
    setSaving(true);
    setMessage(null);
    const result = await updateInvestor(investor.id, {
      bankName: bankData.bankName || null,
      bankAgency: bankData.bankAgency || null,
      bankAccount: bankData.bankAccount || null,
      pixKey: bankData.pixKey || null,
    });
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Dados bancarios atualizados." });
      router.refresh();
    }
    setSaving(false);
  }

  async function handleResetPassword() {
    if (!newPassword) return;
    setResetLoading(true);
    setMessage(null);
    const result = await resetInvestorPassword(investor.id, newPassword);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Senha redefinida com sucesso." });
      setNewPassword("");
    }
    setResetLoading(false);
  }

  async function handleUploadDocument(data: {
    name: string;
    type: string;
    category: string;
    size: string;
    base64Data: string;
  }) {
    return uploadInvestorDocument({ userId: investor.id, ...data });
  }

  async function handleDeleteDocument(id: string) {
    return deleteInvestorDocument(id);
  }

  async function handleDownloadDocument(id: string) {
    const res = await getDocumentContent(id);
    if (res?.error) return { error: res.error };
    return { base64Data: res?.data?.base64Data, name: res?.data?.name };
  }

  const inputClass =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent";
  const labelClass = "block text-xs font-medium text-gray-500 mb-1";

  const tabs = [
    { key: "personal" as const, label: "Dados Pessoais", icon: User },
    { key: "bank" as const, label: "Dados Bancarios", icon: Building2 },
    { key: "projects" as const, label: "Projetos", icon: FolderOpen },
    { key: "documents" as const, label: "Documentos", icon: FileText },
  ];

  return (
    <div className="space-y-6">
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

      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "personal" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Nome</label>
              <input
                type="text"
                value={personalData.name}
                onChange={(e) => setPersonalData({ ...personalData, name: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={personalData.email}
                onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Telefone</label>
              <input
                type="text"
                value={personalData.phone}
                onChange={(e) => setPersonalData({ ...personalData, phone: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>CPF/CNPJ</label>
              <input
                type="text"
                value={personalData.cpfCnpj}
                onChange={(e) => setPersonalData({ ...personalData, cpfCnpj: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>RG</label>
              <input
                type="text"
                value={personalData.rg}
                onChange={(e) => setPersonalData({ ...personalData, rg: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Profissao</label>
              <input
                type="text"
                value={personalData.profession}
                onChange={(e) => setPersonalData({ ...personalData, profession: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-3">
              <label className={labelClass}>Endereco</label>
              <input
                type="text"
                value={personalData.address}
                onChange={(e) => setPersonalData({ ...personalData, address: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSavePersonal}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? "Salvando..." : "Salvar Dados Pessoais"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "bank" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Banco</label>
              <input
                type="text"
                value={bankData.bankName}
                onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Agencia</label>
              <input
                type="text"
                value={bankData.bankAgency}
                onChange={(e) => setBankData({ ...bankData, bankAgency: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Conta</label>
              <input
                type="text"
                value={bankData.bankAccount}
                onChange={(e) => setBankData({ ...bankData, bankAccount: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Chave PIX</label>
              <input
                type="text"
                value={bankData.pixKey}
                onChange={(e) => setBankData({ ...bankData, pixKey: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSaveBank}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? "Salvando..." : "Salvar Dados Bancarios"}
            </button>
          </div>

          <div className="border-t border-gray-100 pt-4 mt-4">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
              <KeyRound size={14} />
              Redefinir Senha
            </h4>
            <div className="flex items-end gap-3">
              <div className="flex-1 max-w-xs">
                <label className={labelClass}>Nova Senha</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Minimo 6 caracteres"
                  minLength={6}
                />
              </div>
              <button
                onClick={handleResetPassword}
                disabled={resetLoading || newPassword.length < 6}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {resetLoading ? "Redefinindo..." : "Redefinir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "projects" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {investor.investments.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              Nenhum investimento encontrado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Projeto</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Operacao</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-500">Status</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">Aporte</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">Retorno Liq.</th>
                  </tr>
                </thead>
                <tbody>
                  {investor.investments.map((inv: any) => (
                    <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium text-gray-700">
                        {inv.operation?.project?.name || "-"}
                      </td>
                      <td className="py-2 px-3 text-gray-600">
                        {inv.operation?.operationCode || "-"}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="py-2 px-3 text-right font-medium">
                        {formatBRL(inv.amount)}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-emerald-600">
                        {inv.netReturn != null ? formatBRL(inv.netReturn) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "documents" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <DocumentUpload
            documents={investor.documents}
            onUpload={handleUploadDocument}
            onDelete={handleDeleteDocument}
            onDownload={handleDownloadDocument}
            categories={["Contrato", "Comprovante", "Legal", "Fiscal", "Outros"]}
          />
        </div>
      )}
    </div>
  );
}
