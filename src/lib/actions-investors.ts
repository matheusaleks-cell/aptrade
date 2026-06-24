"use server";

import { prisma } from "./prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// ==================== ADMIN - INVESTOR CRUD ====================

export async function getInvestorsAdmin(
  page: number = 1,
  limit: number = 10,
  search: string = ""
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const skip = (page - 1) * limit;

  const where: any = { role: "INVESTOR" };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { cpfCnpj: { contains: search } },
    ];
  }

  const [investors, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        investments: {
          select: {
            amount: true,
            netReturn: true,
            status: true,
            operationId: true,
          },
        },
        _count: { select: { documents: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const data = investors.map((inv) => {
    const totalInvested = inv.investments.reduce((sum, i) => sum + i.amount, 0);
    const totalReceived = inv.investments.reduce(
      (sum, i) => sum + (i.netReturn ?? 0),
      0
    );
    const projectIds = new Set(inv.investments.map((i) => i.operationId));
    return {
      id: inv.id,
      name: inv.name,
      email: inv.email,
      cpfCnpj: inv.cpfCnpj,
      phone: inv.phone,
      approved: inv.approved,
      createdAt: inv.createdAt,
      totalInvested,
      totalReceived,
      projectsCount: projectIds.size,
      documentsCount: inv._count.documents,
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

export async function getInvestorDetail(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const investor = await prisma.user.findUnique({
    where: { id },
    include: {
      investments: {
        include: {
          operation: {
            include: { project: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      documents: { orderBy: { createdAt: "desc" } },
      kycDocuments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!investor) return { error: "Investidor nao encontrado." };

  const totalInvested = investor.investments.reduce(
    (sum, i) => sum + i.amount,
    0
  );
  const totalReceived = investor.investments.reduce(
    (sum, i) => sum + (i.netReturn ?? 0),
    0
  );
  const activeProjects = new Set(
    investor.investments
      .filter((i) => i.status !== "SETTLED")
      .map((i) => i.operation.projectId)
  ).size;
  const roi =
    totalInvested > 0
      ? parseFloat(((totalReceived / totalInvested) * 100).toFixed(2))
      : 0;

  return {
    success: true,
    data: {
      id: investor.id,
      name: investor.name,
      email: investor.email,
      cpfCnpj: investor.cpfCnpj,
      phone: investor.phone,
      rg: investor.rg,
      address: investor.address,
      profession: investor.profession,
      bankName: investor.bankName,
      bankAgency: investor.bankAgency,
      bankAccount: investor.bankAccount,
      pixKey: investor.pixKey,
      bankReferences: investor.bankReferences,
      commercialRefs: investor.commercialRefs,
      approved: investor.approved,
      suitabilityResult: investor.suitabilityResult,
      suitabilityFilledAt: investor.suitabilityFilledAt,
      isQualifiedInvestor: investor.isQualifiedInvestor,
      createdAt: investor.createdAt,
      investments: investor.investments,
      documents: investor.documents.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        category: d.category,
        size: d.size,
        createdAt: d.createdAt,
      })),
      kycDocuments: investor.kycDocuments,
      stats: {
        totalInvested,
        totalReceived,
        roi,
        activeProjects,
      },
    },
  };
}

export async function createInvestor(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const cpfCnpj = (formData.get("cpfCnpj") as string) || null;
  const phone = (formData.get("phone") as string) || null;

  if (!name || !email || !password) {
    return { error: "Nome, email e senha sao obrigatorios." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const investor = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "INVESTOR",
        cpfCnpj,
        phone,
        rg: (formData.get("rg") as string) || null,
        address: (formData.get("address") as string) || null,
        profession: (formData.get("profession") as string) || null,
        bankName: (formData.get("bankName") as string) || null,
        bankAgency: (formData.get("bankAgency") as string) || null,
        bankAccount: (formData.get("bankAccount") as string) || null,
        pixKey: (formData.get("pixKey") as string) || null,
        approved: formData.get("approved") === "true",
      },
    });

    revalidatePath("/admin/investidores");
    return { success: true, data: { id: investor.id } };
  } catch (e: any) {
    if (e?.code === "P2002") {
      return { error: "Email ou CPF/CNPJ ja cadastrado." };
    }
    return { error: "Erro ao criar investidor." };
  }
}

export async function updateInvestor(
  id: string,
  data: {
    name?: string;
    email?: string;
    cpfCnpj?: string | null;
    phone?: string | null;
    rg?: string | null;
    address?: string | null;
    profession?: string | null;
    bankName?: string | null;
    bankAgency?: string | null;
    bankAccount?: string | null;
    pixKey?: string | null;
    bankReferences?: string | null;
    commercialRefs?: string | null;
    approved?: boolean;
    isQualifiedInvestor?: boolean;
  }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  try {
    await prisma.user.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/investidores");
    revalidatePath(`/admin/investidores/${id}`);
    return { success: true };
  } catch (e: any) {
    if (e?.code === "P2002") {
      return { error: "Email ou CPF/CNPJ ja cadastrado." };
    }
    return { error: "Erro ao atualizar investidor." };
  }
}

export async function deleteInvestor(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const investmentCount = await prisma.investment.count({
    where: { userId: id },
  });

  if (investmentCount > 0) {
    return {
      error: `Nao e possivel excluir. Investidor possui ${investmentCount} investimento(s) vinculado(s).`,
    };
  }

  await prisma.user.delete({ where: { id } });

  revalidatePath("/admin/investidores");
  return { success: true };
}

export async function resetInvestorPassword(
  userId: string,
  newPassword: string
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  if (!newPassword || newPassword.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { success: true };
}

export async function uploadInvestorDocument(data: {
  userId: string;
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
      userId: data.userId,
    },
  });

  revalidatePath(`/admin/investidores/${data.userId}`);
  return { success: true, data: { id: doc.id } };
}

export async function deleteInvestorDocument(documentId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: { userId: true },
  });

  await prisma.document.delete({ where: { id: documentId } });

  if (doc?.userId) {
    revalidatePath(`/admin/investidores/${doc.userId}`);
  }
  revalidatePath("/admin/investidores");
  return { success: true };
}

export async function getDocumentContent(documentId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Nao autorizado." };

  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: { base64Data: true, name: true, type: true },
  });

  if (!doc) return { error: "Documento nao encontrado." };

  return { success: true, data: { base64Data: doc.base64Data, name: doc.name, type: doc.type } };
}
