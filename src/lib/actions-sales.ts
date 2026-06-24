"use server";

import { prisma } from "./prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";

// ==================== ADMIN - SALES ORDER MANAGEMENT ====================

export async function getSalesOrders(
  page: number = 1,
  limit: number = 10,
  search: string = "",
  status: string = ""
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { customer: { name: { contains: search } } },
      { customer: { cpfCnpj: { contains: search } } },
    ];
  }
  if (status) {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.salesOrder.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            cpfCnpj: true,
            email: true,
            phone: true,
            type: true,
          },
        },
        seller: { select: { id: true, name: true } },
      },
    }),
    prisma.salesOrder.count({ where }),
  ]);

  return {
    success: true,
    data: orders,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createSalesOrder(data: {
  customerId: string;
  products: string;
  totalValue: number;
  paymentMethod?: string;
  notes?: string;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  if (!data.customerId || !data.products || !data.totalValue) {
    return { error: "Cliente, produtos e valor total sao obrigatorios." };
  }

  const orderNumber = `ORD-${Date.now()}`;

  try {
    const order = await prisma.salesOrder.create({
      data: {
        orderNumber,
        customerId: data.customerId,
        products: data.products,
        totalValue: data.totalValue,
        paymentMethod: data.paymentMethod || null,
        notes: data.notes || null,
        sellerId: session.id,
        status: "RASCUNHO",
      },
    });

    revalidatePath("/admin/vendas");
    return { success: true, data: { id: order.id, orderNumber } };
  } catch (e: any) {
    if (e?.code === "P2002") {
      return { error: "Numero de pedido duplicado. Tente novamente." };
    }
    return { error: "Erro ao criar pedido de venda." };
  }
}

export async function updateSalesOrder(
  id: string,
  data: {
    status?: string;
    notes?: string;
    paymentMethod?: string;
    products?: string;
    totalValue?: number;
  }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  try {
    await prisma.salesOrder.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/vendas");
    return { success: true };
  } catch (e: any) {
    if (e?.code === "P2002") {
      return { error: "Dados duplicados encontrados." };
    }
    return { error: "Erro ao atualizar pedido." };
  }
}

export async function deleteSalesOrder(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const order = await prisma.salesOrder.findUnique({
    where: { id },
    select: { status: true },
  });

  if (!order) return { error: "Pedido nao encontrado." };

  if (order.status !== "RASCUNHO" && order.status !== "CANCELADO") {
    return {
      error: "Somente pedidos com status RASCUNHO ou CANCELADO podem ser excluidos.",
    };
  }

  await prisma.salesOrder.delete({ where: { id } });

  revalidatePath("/admin/vendas");
  return { success: true };
}

export async function cancelSalesOrder(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const order = await prisma.salesOrder.findUnique({
    where: { id },
    select: { status: true },
  });

  if (!order) return { error: "Pedido nao encontrado." };

  if (order.status === "CANCELADO") {
    return { error: "Pedido ja esta cancelado." };
  }

  await prisma.salesOrder.update({
    where: { id },
    data: { status: "CANCELADO" },
  });

  revalidatePath("/admin/vendas");
  return { success: true };
}
