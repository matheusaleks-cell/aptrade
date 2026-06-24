"use client";

import { useState } from "react";
import { Upload, FileText, Trash2, Download, Eye } from "lucide-react";
import { toast } from "sonner";

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  category: string;
  size?: string | null;
  createdAt: Date | string;
}

interface DocumentUploadProps {
  documents: DocumentItem[];
  onUpload: (data: { name: string; type: string; category: string; size: string; base64Data: string }) => Promise<{ error?: string }>;
  onDelete: (id: string) => Promise<{ error?: string }>;
  onDownload?: (id: string) => Promise<{ base64Data?: string; name?: string; error?: string }>;
  categories?: string[];
}

export function DocumentUpload({
  documents,
  onUpload,
  onDelete,
  onDownload,
  categories = ["Legal", "Fiscal", "Importação", "Conformidade"],
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState(categories[0]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo excede 10 MB.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const type = file.type.startsWith("image/") ? "IMAGE" : "PDF";
      const size = `${(file.size / 1024).toFixed(1)} KB`;
      const res = await onUpload({ name: file.name, type, category, size, base64Data: base64 });
      if (res?.error) toast.error(res.error);
      else toast.success("Documento enviado com sucesso!");
      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleDelete(id: string) {
    const res = await onDelete(id);
    if (res?.error) toast.error(res.error);
    else toast.success("Documento removido.");
  }

  async function handleDownload(id: string) {
    if (!onDownload) return;
    const res = await onDownload(id);
    if (res?.error || !res?.base64Data) { toast.error("Erro ao baixar."); return; }
    const link = document.createElement("a");
    link.href = res.base64Data;
    link.download = res.name || "documento";
    link.click();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors cursor-pointer">
          <Upload size={14} />
          {uploading ? "Enviando..." : "Upload"}
          <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} disabled={uploading} />
        </label>
      </div>

      {documents.length === 0 ? (
        <p className="text-sm text-gray-400 py-4">Nenhum documento anexado.</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={16} className="text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{doc.name}</p>
                  <p className="text-xs text-gray-400">{doc.category} &middot; {doc.size || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {onDownload && (
                  <button onClick={() => handleDownload(doc.id)} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors" title="Baixar">
                    <Download size={14} className="text-gray-500" />
                  </button>
                )}
                <button onClick={() => handleDelete(doc.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
