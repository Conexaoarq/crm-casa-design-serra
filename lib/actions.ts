'use server';

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ================================
// SERVER ACTION: Criar Indicação
// ================================
export async function criarIndicacao(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: "Não autorizado" };

  const toCompany = formData.get('toCompany') as string;
  const clientName = formData.get('clientName') as string;
  const clientPhone = formData.get('clientPhone') as string;
  const projectDetails = formData.get('projectDetails') as string;
  const architectName = formData.get('architectName') as string;
  const observations = formData.get('observations') as string;

  // Buscar o usuário de destino pelo nome da empresa (se não for "todos")
  let toUserId: string | null = null;
  if (toCompany && toCompany !== 'todos') {
    const toUser = await prisma.user.findFirst({
      where: { companyName: toCompany }
    });
    if (toUser) toUserId = toUser.id;
  }

  const referral = await prisma.referral.create({
    data: {
      fromUserId: (session.user as any).id,
      toUserId: toUserId,
      clientName: clientName,
      clientPhone: clientPhone || null,
      projectDetails: [projectDetails, observations].filter(Boolean).join('\n---\n') || null,
      architectName: architectName || null,
      status: "PENDING",
    }
  });

  // Registrar no log de auditoria (LGPD)
  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "CREATE_REFERRAL",
      details: JSON.stringify({
        referralId: referral.id,
        toCompany: toCompany,
        clientName: clientName,
      })
    }
  });

  return { success: true, referralId: referral.id };
}

// ================================
// SERVER ACTION: Pedir Lead Quente
// ================================
export async function pedirLead(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: "Não autorizado" };

  const whatLookingFor = formData.get('whatLookingFor') as string;
  const howCanHelp = formData.get('howCanHelp') as string;

  const referral = await prisma.referral.create({
    data: {
      fromUserId: (session.user as any).id,
      toUserId: null, // Aberto para todos
      clientName: "Pedido de Lead",
      projectDetails: `O QUE PROCURO:\n${whatLookingFor}\n\nCOMO PODE AJUDAR:\n${howCanHelp}`,
      status: "PENDING",
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "REQUEST_LEAD",
      details: JSON.stringify({
        referralId: referral.id,
        description: whatLookingFor,
      })
    }
  });

  return { success: true, referralId: referral.id };
}

// ================================
// SERVER ACTION: Registrar Negócio Fechado
// ================================
export async function registrarNegocioFechado(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return { success: false, error: "Não autorizado" };

  const fromCompany = formData.get('fromCompany') as string;
  const clientName = formData.get('clientName') as string;
  const value = parseFloat(formData.get('value') as string);
  const message = formData.get('message') as string;

  // Criar a indicação (referral) associada ao negócio
  const referral = await prisma.referral.create({
    data: {
      fromUserId: (session.user as any).id,
      clientName: clientName,
      projectDetails: message || null,
      status: "CLOSED_WON",
    }
  });

  // Criar o registro do negócio fechado com o valor
  const business = await prisma.closedBusiness.create({
    data: {
      referralId: referral.id,
      value: value,
    }
  });

  // Log de auditoria
  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "REGISTER_CLOSED_BUSINESS",
      details: JSON.stringify({
        businessId: business.id,
        fromCompany: fromCompany,
        clientName: clientName,
        value: value,
      })
    }
  });

  return { success: true, businessId: business.id };
}

// ================================
// SERVER ACTION: Buscar dados para o Dashboard
// ================================
export async function getDashboardData() {
  // Últimos 5 pedidos de lead (indicações abertas - sem destinatário)
  const pedidos = await prisma.referral.findMany({
    where: { toUserId: null },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { fromUser: true }
  });

  // Ranking: Mais indicados (receberam mais indicações)
  const maisIndicados = await prisma.referral.groupBy({
    by: ['toUserId'],
    where: { toUserId: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
  });

  // Ranking: Maiores indicadores (enviaram mais indicações)
  const maioresIndicadores = await prisma.referral.groupBy({
    by: ['fromUserId'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
  });

  // Total de negócios fechados
  const totalNegocios = await prisma.closedBusiness.aggregate({
    _sum: { value: true },
    _count: { id: true },
  });

  return {
    pedidos: pedidos.map(p => ({
      id: p.id,
      nome: p.fromUser.companyName || p.fromUser.name || 'Membro',
      req: p.projectDetails || p.clientName,
      createdAt: p.createdAt.toISOString(),
    })),
    totalNegocios: {
      count: totalNegocios._count.id,
      value: totalNegocios._sum.value || 0,
    },
  };
}
