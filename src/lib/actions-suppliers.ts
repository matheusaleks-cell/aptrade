"use server";

import { prisma } from "./prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";

// ==================== ADMIN - SUPPLIER CRUD ====================

export async function getSuppliers() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const suppliers = await prisma.supplier.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { importLots: true } },
    },
  });

  return {
    success: true,
    data: suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      country: s.country,
      contactName: s.contactName,
      contactEmail: s.contactEmail,
      contactPhone: s.contactPhone,
      bankDetails: s.bankDetails,
      rating: s.rating,
      notes: s.notes,
      createdAt: s.createdAt,
      importLotCount: s._count.importLots,
    })),
  };
}

export async function createSupplier(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const name = formData.get("name") as string;
  const country = formData.get("country") as string;

  if (!name || !country) {
    return { error: "Nome e pais sao obrigatorios." };
  }

  try {
    const supplier = await prisma.supplier.create({
      data: {
        name,
        country,
        contactName: (formData.get("contactName") as string) || null,
        contactEmail: (formData.get("contactEmail") as string) || null,
        contactPhone: (formData.get("contactPhone") as string) || null,
        bankDetails: (formData.get("bankDetails") as string) || null,
        rating: parseInt(formData.get("rating") as string) || 5,
        notes: (formData.get("notes") as string) || null,
      },
    });

    revalidatePath("/admin/fornecedores");
    return { success: true, data: { id: supplier.id } };
  } catch (e: any) {
    if (e?.code === "P2002") {
      return { error: "Fornecedor ja cadastrado com esses dados." };
    }
    return { error: "Erro ao criar fornecedor." };
  }
}

export async function updateSupplier(
  id: string,
  data: {
    name?: string;
    country?: string;
    contactName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    bankDetails?: string | null;
    rating?: number;
    notes?: string | null;
  }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  try {
    await prisma.supplier.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/fornecedores");
    return { success: true };
  } catch (e: any) {
    if (e?.code === "P2002") {
      return { error: "Dados duplicados encontrados." };
    }
    return { error: "Erro ao atualizar fornecedor." };
  }
}

export async function deleteSupplier(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const lotCount = await prisma.importLot.count({
    where: { supplierId: id },
  });

  if (lotCount > 0) {
    return {
      error: `Nao e possivel excluir. Fornecedor possui ${lotCount} lote(s) vinculado(s).`,
    };
  }

  await prisma.supplier.delete({ where: { id } });

  revalidatePath("/admin/fornecedores");
  return { success: true };
}
