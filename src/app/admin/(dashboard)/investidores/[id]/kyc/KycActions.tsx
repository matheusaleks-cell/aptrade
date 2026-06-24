"use client";

import { useState } from "react";
import { approveKyc, rejectKyc } from "@/lib/actions";
import { useRouter } from "next/navigation";

export function KycActions({ documentId }: { documentId: string }) {
  const [showReject, setShowReject] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleApprove() {
    setLoading(true);
    await approveKyc(documentId);
    router.refresh();
  }

  async function handleReject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("documentId", documentId);
    await rejectKyc(formData);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          Aprovar
        </button>
        <button
          onClick={() => setShowReject(!showReject)}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          Rejeitar
        </button>
      </div>

      {showReject && (
        <form onSubmit={handleReject} className="flex gap-2">
          <input
            name="reviewNote"
            required
            placeholder="Motivo da rejeição..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            Confirmar
          </button>
        </form>
      )}
    </div>
  );
}
