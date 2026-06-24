"use server";

import { prisma } from "./prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";

// ==================== ADMIN - IMPORT LOT MANAGEMENT ====================

const STATUS_ORDER = [
  "PEDIDO_FEITO",
  "TRANSITO",
  "NACIONALIZANDO",
  "DISPONIVEL",
  "LIQUIDADO",
] as const;

function getProgressPercentage(status: string): number {
  const index = STATUS_ORDER.indexOf(status as (typeof STATUS_ORDER)[number]);
  if (index < 0) return 0;
  return Math.round(((index + 1) / STATUS_ORDER.length) * 100);
}

export async function getImportLots() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const lots = await prisma.importLot.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      supplier: { select: { id: true, name: true, country: true } },
      operation: {
        select: { id: true, operationCode: true, project: { select: { name: true } } },
      },
      _count: { select: { documents: true } },
    },
  });

  return {
    success: true,
    data: lots.map((lot) => ({
      id: lot.id,
      batchCode: lot.batchCode,
      operationId: lot.operationId,
      operationCode: lot.operation.operationCode,
      projectName: lot.operation.project.name,
      supplierId: lot.supplierId,
      supplier: lot.supplier,
      countryOrigin: lot.countryOrigin,
      purchaseDate: lot.purchaseDate,
      expectedShipmentDate: lot.expectedShipmentDate,
      expectedArrivalDate: lot.expectedArrivalDate,
      currency: lot.currency,
      exchangeRate: lot.exchangeRate,
      fobValue: lot.fobValue,
      freight: lot.freight,
      insurance: lot.insurance,
      customsTaxes: lot.customsTaxes,
      customsFees: lot.customsFees,
      totalCostNationalized: lot.totalCostNationalized,
      quantityItems: lot.quantityItems,
      status: lot.status,
      expectedMarginPct: lot.expectedMarginPct,
      realizedMarginPct: lot.realizedMarginPct,
      notes: lot.notes,
      createdAt: lot.createdAt,
      documentCount: lot._count.documents,
      progress: getProgressPercentage(lot.status),
    })),
  };
}

export async function createImportLot(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const operationId = formData.get("operationId") as string;
  if (!operationId) {
    return { error: "Operacao e obrigatoria." };
  }

  const year = new Date().getFullYear();
  const random4 = Math.floor(1000 + Math.random() * 9000).toString();
  const batchCode = `LOT-${year}-${random4}`;

  const fobValue = parseFloat(formData.get("fobValue") as string) || 0;
  const freight = parseFloat(formData.get("freight") as string) || 0;
  const insurance = parseFloat(formData.get("insurance") as string) || 0;
  const exchangeRate = parseFloat(formData.get("exchangeRate") as string) || 5.0;
  const quantityItems = parseInt(formData.get("quantityItems") as string) || 0;

  // Calculate basic taxes for reference
  const valorAduaneiro = (fobValue + freight + insurance) * exchangeRate;
  const customsTaxes = valorAduaneiro * 0.18; // II default rate
  const customsFees = valorAduaneiro * (0.021 + 0.0965); // PIS + COFINS
  const totalCostNationalized =
    (valorAduaneiro + customsTaxes + customsFees + 154.23) / 0.82; // ICMS gross-up

  const purchaseDateStr = formData.get("purchaseDate") as string;
  const expectedShipmentStr = formData.get("expectedShipmentDate") as string;
  const expectedArrivalStr = formData.get("expectedArrivalDate") as string;

  try {
    const lot = await prisma.importLot.create({
      data: {
        batchCode,
        operationId,
        supplierId: (formData.get("supplierId") as string) || null,
        countryOrigin: (formData.get("countryOrigin") as string) || null,
        purchaseDate: purchaseDateStr ? new Date(purchaseDateStr) : null,
        expectedShipmentDate: expectedShipmentStr
          ? new Date(expectedShipmentStr)
          : null,
        expectedArrivalDate: expectedArrivalStr
          ? new Date(expectedArrivalStr)
          : null,
        currency: (formData.get("currency") as string) || "USD",
        exchangeRate,
        fobValue,
        freight,
        insurance,
        customsTaxes,
        customsFees,
        totalCostNationalized,
        quantityItems,
        status: "PEDIDO_FEITO",
        expectedMarginPct: formData.get("expectedMarginPct")
          ? parseFloat(formData.get("expectedMarginPct") as string)
          : null,
        notes: (formData.get("notes") as string) || null,
      },
    });

    revalidatePath("/admin/lotes");
    return { success: true, data: { id: lot.id, batchCode } };
  } catch (e: any) {
    if (e?.code === "P2002") {
      return { error: "Codigo de lote duplicado. Tente novamente." };
    }
    return { error: "Erro ao criar lote de importacao." };
  }
}

export async function updateLotStatus(id: string, newStatus: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const lot = await prisma.importLot.findUnique({
    where: { id },
    select: { status: true },
  });

  if (!lot) return { error: "Lote nao encontrado." };

  const currentIndex = STATUS_ORDER.indexOf(
    lot.status as (typeof STATUS_ORDER)[number]
  );
  const newIndex = STATUS_ORDER.indexOf(
    newStatus as (typeof STATUS_ORDER)[number]
  );

  if (newIndex < 0) {
    return { error: "Status invalido." };
  }

  if (newIndex !== currentIndex + 1) {
    return {
      error: `Transicao invalida de ${lot.status} para ${newStatus}. O proximo status valido e ${STATUS_ORDER[currentIndex + 1] ?? "nenhum"}.`,
    };
  }

  await prisma.importLot.update({
    where: { id },
    data: { status: newStatus },
  });

  revalidatePath("/admin/lotes");
  return { success: true };
}

export async function deleteImportLot(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const docCount = await prisma.document.count({
    where: { lotId: id },
  });

  if (docCount > 0) {
    return {
      error: `Nao e possivel excluir. Lote possui ${docCount} documento(s) vinculado(s).`,
    };
  }

  await prisma.importLot.delete({ where: { id } });

  revalidatePath("/admin/lotes");
  return { success: true };
}

export async function addLotDocument(data: {
  lotId: string;
  name: string;
  type: string;
  category: string;
  size: string;
  base64Data: string;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const doc = await prisma.document.create({
    data: {
      name: data.name,
      type: data.type,
      category: data.category,
      size: data.size,
      base64Data: data.base64Data,
      lotId: data.lotId,
    },
  });

  revalidatePath("/admin/lotes");
  return { success: true, data: { id: doc.id } };
}

export async function deleteLotDocument(documentId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  await prisma.document.delete({ where: { id: documentId } });

  revalidatePath("/admin/lotes");
  return { success: true };
}
