"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteInvestor } from "@/lib/actions-investors";
import { useRouter } from "next/navigation";

export function InvestorListActions({
  investorId,
  investorName,
}: {
  investorId: string;
  investorName: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Tem certeza que deseja excluir o investidor "${investorName}"?`)) {
      return;
    }

    setLoading(true);
    const result = await deleteInvestor(investorId);
    if (result?.error) {
      alert(result.error);
      setLoading(false);
    } else {
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title="Excluir"
    >
      <Trash2 size={14} className="text-red-400" />
    </button>
  );
}
