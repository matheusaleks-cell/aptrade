"use server";

import { prisma } from "./prisma";
import { getSession } from "./auth";
import { hashPassword } from "./auth";
import { revalidatePath } from "next/cache";

// ==================== ADMIN - CRM / LEAD MANAGEMENT ====================

export async function getLeads(
  page: number = 1,
  limit: number = 10,
  search: string = "",
  status: string = "",
  priority: string = ""
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const skip = (page - 1) * limit;

  const where: any = { isArchived: false };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ];
  }
  if (status) {
    where.status = status;
  }
  if (priority) {
    where.priority = priority;
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        logs: { orderBy: { createdAt: "desc" }, take: 5 },
        assignedTo: { select: { name: true, email: true } },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  return {
    success: true,
    data: leads,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createLead(data: {
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  priority?: string;
  value?: number;
  source?: string;
  interests?: string;
  taxId?: string;
  state?: string;
  customerType?: string;
  notes?: string;
  assignedToId?: string;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  if (!data.name) {
    return { error: "Nome e obrigatorio." };
  }

  try {
    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        status: data.status || "NOVO",
        priority: data.priority || "MEDIA",
        value: data.value ?? null,
        source: data.source || null,
        interests: data.interests || null,
        taxId: data.taxId || null,
        state: data.state || null,
        customerType: data.customerType || null,
        notes: data.notes || null,
        assignedToId: data.assignedToId || null,
        logs: {
          create: {
            action: "Lead criado",
            userName: session.name,
          },
        },
      },
    });

    revalidatePath("/admin/crm");
    return { success: true, data: { id: lead.id } };
  } catch (e: any) {
    if (e?.code === "P2002") {
      return { error: "Lead com dados duplicados." };
    }
    return { error: "Erro ao criar lead." };
  }
}

export async function updateLead(
  id: string,
  data: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    status?: string;
    priority?: string;
    value?: number | null;
    source?: string | null;
    interests?: string | null;
    taxId?: string | null;
    state?: string | null;
    customerType?: string | null;
    notes?: string | null;
    assignedToId?: string | null;
  }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  try {
    await prisma.lead.update({
      where: { id },
      data: {
        ...data,
        logs: {
          create: {
            action: "Lead atualizado",
            userName: session.name,
          },
        },
      },
    });

    revalidatePath("/admin/crm");
    return { success: true };
  } catch (e: any) {
    if (e?.code === "P2002") {
      return { error: "Dados duplicados encontrados." };
    }
    return { error: "Erro ao atualizar lead." };
  }
}

export async function deleteLead(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  // Cascade deletes logs due to onDelete: Cascade in schema
  await prisma.lead.delete({ where: { id } });

  revalidatePath("/admin/crm");
  return { success: true };
}

export async function archiveLead(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  await prisma.lead.update({
    where: { id },
    data: {
      isArchived: true,
      logs: {
        create: {
          action: "Lead arquivado",
          userName: session.name,
        },
      },
    },
  });

  revalidatePath("/admin/crm");
  return { success: true };
}

export async function addLeadLog(
  leadId: string,
  action: string,
  userName: string
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  await prisma.leadLog.create({
    data: {
      leadId,
      action,
      userName,
    },
  });

  revalidatePath("/admin/crm");
  return { success: true };
}

export async function convertLeadToInvestor(leadId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) return { error: "Lead nao encontrado." };

  if (!lead.email) {
    return { error: "Lead precisa ter um email para ser convertido em investidor." };
  }

  // Check if email is already in use
  const existingUser = await prisma.user.findUnique({
    where: { email: lead.email },
  });

  if (existingUser) {
    return { error: "Ja existe um usuario com este email." };
  }

  // Generate a temporary password
  const tempPassword = `APTRADE-${Math.random().toString(36).slice(2, 10)}`;
  const hashedPassword = await hashPassword(tempPassword);

  try {
    const user = await prisma.user.create({
      data: {
        name: lead.name,
        email: lead.email,
        password: hashedPassword,
        role: "INVESTOR",
        phone: lead.phone,
        cpfCnpj: lead.taxId,
        approved: false,
      },
    });

    // Update lead status and log conversion
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: "CONVERTIDO",
        logs: {
          create: {
            action: "Convertido para investidor",
            userName: session.name,
          },
        },
      },
    });

    revalidatePath("/admin/crm");
    revalidatePath("/admin/investidores");
    return {
      success: true,
      data: { userId: user.id, tempPassword },
    };
  } catch (e: any) {
    if (e?.code === "P2002") {
      return { error: "Email ou CPF/CNPJ ja esta em uso." };
    }
    return { error: "Erro ao converter lead." };
  }
}

// ==================== ADMIN - CUSTOMER MANAGEMENT ====================

export async function getCustomers(
  page: number = 1,
  limit: number = 10,
  search: string = "",
  type: string = ""
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { cpfCnpj: { contains: search } },
      { fantasyName: { contains: search } },
    ];
  }
  if (type) {
    where.type = type;
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        salesOrders: {
          select: { totalValue: true, status: true },
        },
        _count: { select: { salesOrders: true } },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  const data = customers.map((c) => {
    const totalSpent = c.salesOrders
      .filter((o) => o.status !== "CANCELADO")
      .reduce((sum, o) => sum + o.totalValue, 0);

    return {
      id: c.id,
      type: c.type,
      name: c.name,
      cpfCnpj: c.cpfCnpj,
      email: c.email,
      phone: c.phone,
      state: c.state,
      city: c.city,
      address: c.address,
      cep: c.cep,
      category: c.category,
      source: c.source,
      fantasyName: c.fantasyName,
      stateRegistration: c.stateRegistration,
      responsibleName: c.responsibleName,
      notes: c.notes,
      createdAt: c.createdAt,
      totalSpent,
      ordersCount: c._count.salesOrders,
    };
  });

  return {
    success: true,
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createCustomer(data: {
  type?: string;
  name: string;
  cpfCnpj?: string;
  email?: string;
  phone?: string;
  state?: string;
  city?: string;
  address?: string;
  cep?: string;
  category?: string;
  source?: string;
  notes?: string;
  fantasyName?: string;
  stateRegistration?: string;
  responsibleName?: string;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  if (!data.name) {
    return { error: "Nome e obrigatorio." };
  }

  try {
    const customer = await prisma.customer.create({
      data: {
        type: data.type || "B2B",
        name: data.name,
        cpfCnpj: data.cpfCnpj || null,
        email: data.email || null,
        phone: data.phone || null,
        state: data.state || null,
        city: data.city || null,
        address: data.address || null,
        cep: data.cep || null,
        category: data.category || null,
        source: data.source || null,
        notes: data.notes || null,
        fantasyName: data.fantasyName || null,
        stateRegistration: data.stateRegistration || null,
        responsibleName: data.responsibleName || null,
      },
    });

    revalidatePath("/admin/crm");
    return { success: true, data: { id: customer.id } };
  } catch (e: any) {
    if (e?.code === "P2002") {
      return { error: "CPF/CNPJ ja cadastrado." };
    }
    return { error: "Erro ao criar cliente." };
  }
}

export async function updateCustomer(
  id: string,
  data: {
    type?: string;
    name?: string;
    cpfCnpj?: string | null;
    email?: string | null;
    phone?: string | null;
    state?: string | null;
    city?: string | null;
    address?: string | null;
    cep?: string | null;
    category?: string | null;
    source?: string | null;
    notes?: string | null;
    fantasyName?: string | null;
    stateRegistration?: string | null;
    responsibleName?: string | null;
  }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  try {
    await prisma.customer.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/crm");
    return { success: true };
  } catch (e: any) {
    if (e?.code === "P2002") {
      return { error: "CPF/CNPJ ja cadastrado." };
    }
    return { error: "Erro ao atualizar cliente." };
  }
}

export async function deleteCustomer(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const orderCount = await prisma.salesOrder.count({
    where: { customerId: id },
  });

  if (orderCount > 0) {
    return {
      error: `Nao e possivel excluir. Cliente possui ${orderCount} pedido(s) de venda vinculado(s).`,
    };
  }

  await prisma.customer.delete({ where: { id } });

  revalidatePath("/admin/crm");
  return { success: true };
}
