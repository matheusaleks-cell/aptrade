const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  COMPLETED: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  PAUSED: "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-slate-400",
  CANCELLED: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  OPEN: "bg-emerald-50 text-emerald-600",
  DRAFT: "bg-gray-100 text-gray-500",
  FUNDING: "bg-purple-50 text-purple-600",
  IN_PROGRESS: "bg-amber-50 text-amber-600",
  SOLD: "bg-cyan-50 text-cyan-600",
  SETTLED: "bg-blue-50 text-blue-600",
  PENDING: "bg-amber-50 text-amber-600",
  APPROVED: "bg-emerald-50 text-emerald-600",
  REJECTED: "bg-red-50 text-red-600",
  CONFIRMED: "bg-emerald-50 text-emerald-600",
  PEDIDO_FEITO: "bg-gray-100 text-gray-600",
  TRANSITO: "bg-amber-50 text-amber-600",
  NACIONALIZANDO: "bg-purple-50 text-purple-600",
  DISPONIVEL: "bg-emerald-50 text-emerald-600",
  LIQUIDADO: "bg-blue-50 text-blue-600",
  NOVO: "bg-blue-50 text-blue-600",
  CONTATO: "bg-cyan-50 text-cyan-600",
  QUALIFICADO: "bg-amber-50 text-amber-600",
  PROPOSTA: "bg-purple-50 text-purple-600",
  NEGOCIACAO: "bg-orange-50 text-orange-600",
  FECHADO: "bg-emerald-50 text-emerald-600",
  PERDIDO: "bg-red-50 text-red-600",
  RASCUNHO: "bg-gray-100 text-gray-500",
  PAID: "bg-emerald-50 text-emerald-600",
  PAGO: "bg-emerald-50 text-emerald-600",
  PENDENTE: "bg-amber-50 text-amber-600",
  CANCELADO: "bg-red-50 text-red-600",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  COMPLETED: "Concluído",
  PAUSED: "Pausado",
  CANCELLED: "Cancelado",
  OPEN: "Aberta",
  DRAFT: "Rascunho",
  FUNDING: "Financiando",
  IN_PROGRESS: "Em andamento",
  SOLD: "Vendido",
  SETTLED: "Liquidada",
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  CONFIRMED: "Confirmado",
  PEDIDO_FEITO: "Pedido Feito",
  TRANSITO: "Em Trânsito",
  NACIONALIZANDO: "Nacionalizando",
  DISPONIVEL: "Disponível",
  LIQUIDADO: "Liquidado",
  NOVO: "Novo",
  CONTATO: "Contato",
  QUALIFICADO: "Qualificado",
  PROPOSTA: "Proposta",
  NEGOCIACAO: "Negociação",
  FECHADO: "Fechado",
  PERDIDO: "Perdido",
  RASCUNHO: "Rascunho",
  PAID: "Pago",
  PAGO: "Pago",
  PENDENTE: "Pendente",
  CANCELADO: "Cancelado",
};

export function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status] || "bg-gray-100 text-gray-500";
  const label = statusLabels[status] || status;

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${color}`}>
      {label}
    </span>
  );
}
