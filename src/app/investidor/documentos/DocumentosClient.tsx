"use client";

import { useState } from "react";
import { uploadMyKycDocument, uploadMyDocument, deleteMyDocument, getMyDocumentContent } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Upload, FileText, Trash2, Download, ShieldCheck, ShieldAlert, Clock, CheckCircle2 } from "lucide-react";

interface KycDoc {
  id: string;
  docType: string;
  status: string;
  reviewNote: string | null;
  createdAt: Date | string;
}

interface GeneralDoc {
  id: string;
  name: string;
  type: string;
  category: string;
  size: string | null;
  createdAt: Date | string;
}

interface DocumentosClientProps {
  kycDocs: KycDoc[];
  generalDocs: GeneralDoc[];
}

const kycTypes = [
  { value: "CPF", label: "CPF" },
  { value: "RG", label: "RG" },
  { value: "CNH", label: "CNH" },
  { value: "COMPROVANTE_RESIDENCIA", label: "Comprovante de Residência" },
  { value: "SELFIE", label: "Selfie com Documento" },
];

export function DocumentosClient({ kycDocs, generalDocs }: DocumentosClientProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [selectedKycType, setSelectedKycType] = useState(kycTypes[0].value);
  const [generalCategory, setGeneralCategory] = useState("Contrato");

  const handleKycUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Arquivo excede 10 MB."); return; }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const res = await uploadMyKycDocument({
        docType: selectedKycType,
        base64Data: base64,
        fileName: file.name,
      });
      if (res && "error" in res && res.error) toast.error(res.error);
      else { toast.success("Documento KYC enviado para análise!"); router.refresh(); }
      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleGeneralUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Arquivo excede 10 MB."); return; }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const type = file.type.startsWith("image/") ? "IMAGE" : "PDF";
      const size = `${(file.size / 1024).toFixed(1)} KB`;
      const res = await uploadMyDocument({ name: file.name, type, category: generalCategory, size, base64Data: base64 });
      if (res && "error" in res && res.error) toast.error(res.error);
      else { toast.success("Documento enviado!"); router.refresh(); }
      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDelete = async (id: string) => {
    const res = await deleteMyDocument(id);
    if (res && "error" in res && res.error) toast.error(res.error);
    else { toast.success("Documento removido."); router.refresh(); }
  };

  const handleDownload = async (id: string) => {
    const res = await getMyDocumentContent(id);
    if (!res || "error" in res || !res.data) { toast.error("Erro ao baixar."); return; }
    const link = document.createElement("a");
    link.href = res.data.base64Data;
    link.download = res.data.name || "documento";
    link.click();
  };

  const getStatusBadge = (status: string) => {
    if (status === "APPROVED") return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
        <ShieldCheck size={10} /> Aprovado
      </span>
    );
    if (status === "REJECTED") return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
        <ShieldAlert size={10} /> Rejeitado
      </span>
    );
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
        <Clock size={10} /> Em Análise
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Documentos KYC */}
      <div className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-6 shadow-2xl animate-fade-in-up">
        <div className="flex items-center gap-2 mb-5 border-b border-white/5 pb-3">
          <ShieldCheck size={16} className="text-[#F5C400]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Documentos KYC (Verificação CVM)</h2>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Envie seus documentos de identificação para verificação regulatória. Após aprovação, você estará habilitado para realizar aportes.
        </p>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <select
            value={selectedKycType}
            onChange={(e) => setSelectedKycType(e.target.value)}
            className="px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#F5C400]/50"
          >
            {kycTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <label className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F5C400] to-[#DF9A00] text-black rounded-xl text-xs font-bold hover:brightness-110 transition-all cursor-pointer active:scale-95">
            <Upload size={14} />
            {uploading ? "Enviando..." : "Enviar Documento"}
            <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={handleKycUpload} disabled={uploading} />
          </label>
        </div>

        {kycDocs.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">Nenhum documento KYC enviado.</p>
        ) : (
          <div className="space-y-2">
            {kycDocs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-white/[0.015] border border-white/[0.04] rounded-xl hover:border-white/[0.08] transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={16} className="text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white">{kycTypes.find(t => t.value === doc.docType)?.label || doc.docType}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Enviado em {new Date(doc.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(doc.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documentos Gerais */}
      <div className="bg-white dark:glass-card-fintech rounded-[28px] border border-gray-200 dark:border-white/[0.03] p-6 shadow-2xl animate-fade-in-up delay-100">
        <div className="flex items-center gap-2 mb-5 border-b border-white/5 pb-3">
          <FileText size={16} className="text-[#F5C400]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Meus Documentos</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <select
            value={generalCategory}
            onChange={(e) => setGeneralCategory(e.target.value)}
            className="px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#F5C400]/50"
          >
            {["Contrato", "Comprovante", "Informe IRPF", "Outro"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <label className="flex items-center gap-2 px-4 py-2 bg-[#0C1322] hover:bg-white/5 border border-white/10 hover:border-white/20 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95">
            <Upload size={14} />
            {uploading ? "Enviando..." : "Upload"}
            <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={handleGeneralUpload} disabled={uploading} />
          </label>
        </div>

        {generalDocs.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">Nenhum documento enviado.</p>
        ) : (
          <div className="space-y-2">
            {generalDocs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-white/[0.015] border border-white/[0.04] rounded-xl hover:border-white/[0.08] transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={16} className="text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{doc.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {doc.category} · {doc.size || "—"} · {new Date(doc.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleDownload(doc.id)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors" title="Baixar">
                    <Download size={14} className="text-slate-400" />
                  </button>
                  <button onClick={() => handleDelete(doc.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors" title="Excluir">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
