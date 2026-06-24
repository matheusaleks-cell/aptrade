"use client";

import { useState } from "react";
import { signContract, getContractDocument } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Upload, FileText, CheckCircle2, X, Download, Clock } from "lucide-react";

interface ContractSignProps {
  investmentId: string;
  investorName: string;
  alreadySigned: boolean;
  signedAt: string | null;
  contractDocumentId: string | null;
}

export function ContractSign({ investmentId, investorName, alreadySigned, signedAt, contractDocumentId }: ContractSignProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);

  const handleDownloadContract = async () => {
    if (!contractDocumentId) return;
    setDownloading(true);
    const res = await getContractDocument(contractDocumentId);
    setDownloading(false);
    if (!res || "error" in res || !res.data) { toast.error("Erro ao baixar contrato."); return; }
    const link = document.createElement("a");
    link.href = res.data.base64Data;
    link.download = res.data.name || "contrato.pdf";
    link.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Arquivo excede 10 MB."); return; }

    const reader = new FileReader();
    reader.onload = () => {
      setBase64(reader.result as string);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSign = async () => {
    if (!base64 || !accepted) return;
    setUploading(true);
    const res = await signContract(investmentId, base64);
    setUploading(false);
    if (res && "error" in res && res.error) { toast.error(res.error); return; }
    toast.success("Contrato assinado com sucesso!");
    setShowModal(false);
    router.refresh();
  };

  if (alreadySigned) {
    return (
      <div className="flex items-center gap-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-emerald-400">Contrato Assinado</p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Assinado em {signedAt ? new Date(signedAt).toLocaleDateString("pt-BR") : "—"}
          </p>
        </div>
      </div>
    );
  }

  if (!contractDocumentId) {
    return (
      <div className="flex items-center gap-2 p-2 bg-white/[0.02] border border-white/[0.04] rounded-xl">
        <Clock size={12} className="text-slate-500 shrink-0" />
        <p className="text-[10px] text-slate-500 font-medium">Aguardando contrato</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleDownloadContract}
          disabled={downloading}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-95"
          title="Baixar contrato"
        >
          <Download size={12} /> {downloading ? "..." : "Baixar"}
        </button>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#F5C400]/10 hover:bg-[#F5C400] hover:text-black border border-[#F5C400]/20 hover:border-[#F5C400] text-[#F5C400] font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-95"
        >
          <FileText size={12} /> Assinar
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 bg-[#0a0f1d] border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#F5C400] via-amber-500 to-[#DF9A00]" />

            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Assinar Contrato</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl mb-4">
              <p className="text-xs text-blue-400 leading-relaxed">
                <strong>1.</strong> Baixe o contrato usando o botão abaixo. <strong>2.</strong> Assine o documento. <strong>3.</strong> Faça upload do contrato assinado.
              </p>
              <button
                onClick={handleDownloadContract}
                disabled={downloading}
                className="mt-2 flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 font-bold text-xs rounded-lg transition-all cursor-pointer"
              >
                <Download size={12} /> {downloading ? "Baixando..." : "Baixar Contrato Original"}
              </button>
            </div>

            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/10 hover:border-[#F5C400]/30 rounded-2xl cursor-pointer transition-colors bg-white/[0.01]">
                <Upload size={24} className="text-slate-400 mb-2" />
                {fileName ? (
                  <span className="text-xs font-bold text-[#F5C400]">{fileName}</span>
                ) : (
                  <span className="text-xs text-slate-400">Clique para enviar o contrato assinado</span>
                )}
                <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} />
              </label>

              <label className="flex items-start gap-3 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 rounded-md border border-white/15 bg-black/30 flex items-center justify-center shrink-0 mt-0.5 peer-checked:bg-[#F5C400]/20 peer-checked:border-[#F5C400]/40 transition-all">
                  {accepted && <CheckCircle2 size={13} className="text-[#F5C400]" />}
                </div>
                <span className="text-xs text-slate-400 leading-relaxed">
                  Confirmo que li, concordo com os termos do contrato de mútuo comercial e declaro que o documento enviado é uma cópia fiel do contrato assinado.
                </span>
              </label>

              <button
                onClick={handleSign}
                disabled={uploading || !base64 || !accepted}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#F5C400] to-[#DF9A00] text-black font-bold text-sm rounded-xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <CheckCircle2 size={16} />
                {uploading ? "Enviando..." : "Confirmar Assinatura"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
