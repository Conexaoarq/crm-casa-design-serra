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

  // Buscar todos os usuários para o broadcast (opcional: filtrar por quem quer receber)
  const allUsers = await prisma.user.findMany({
    select: { email: true }
  });
  const recipientEmails = allUsers.map(u => u.email).filter(Boolean) as string[];

  // Broadcast via Resend
  if (recipientEmails.length > 0) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Casa Design Serra <notificacoes@casadesignserra.com.br>",
          to: recipientEmails,
          reply_to: "aabergamo@gmail.com",
          subject: "🎉 NEGÓCIO FECHADO! O Ecossistema Casa Design Serra Multiplicou!",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #d4af37; border-radius: 12px; background-color: #fff;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #000; font-size: 24px; margin: 0;">NEGÓCIO FECHADO!</h1>
                <p style="color: #d4af37; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Ecossistema Casa Design Serra</p>
              </div>
              <p style="color: #333; line-height: 1.6; font-size: 16px;">Temos o prazer de anunciar que mais um negócio foi concretizado através da nossa plataforma!</p>
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #000;">
                <p style="margin: 5px 0;"><strong>Empresa:</strong> ${fromCompany}</p>
                <p style="margin: 5px 0;"><strong>Cliente:</strong> ${clientName}</p>
                <p style="margin: 5px 0;"><strong>Valor:</strong> ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}</p>
              </div>
              <p style="color: #555; font-style: italic; text-align: center; margin-top: 20px;">"Juntos somos mais fortes. Continue multiplicando!"</p>
            </div>
          `,
        }),
      });
    } catch (e) {
      console.error("Erro no broadcast de e-mail:", e);
    }
  }

  return { success: true, businessId: business.id };
}

// ===========================================
// SERVER ACTION: Atualizar Status de Indicação
// ===========================================
export async function atualizarStatusIndicacao(referralId: string, data: { contactMade?: boolean, budgetGenerated?: boolean, status?: string }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') return { success: false, error: "Apenas administradores podem atualizar o status detalhado" };

  try {
    const updated = await prisma.referral.update({
      where: { id: referralId },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    return { success: true, referral: updated };
  } catch (e) {
    return { success: false, error: "Erro ao atualizar indicação" };
  }
}

// ================================
// SERVER ACTION: Fechar Negócio Direto (da tabela de acompanhamento)
// ================================
export async function fecharNegocioDireto(referralId: string, value: number) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Não autorizado" };

  try {
    // Verificar se já existe um negócio fechado para esta indicação
    const existing = await prisma.closedBusiness.findUnique({
      where: { referralId }
    });
    if (existing) return { success: false, error: "Negócio já foi registrado para esta indicação" };

    // Criar o registro do negócio fechado
    await prisma.closedBusiness.create({
      data: {
        referralId,
        value,
      }
    });

    // Atualizar o status da indicação
    await prisma.referral.update({
      where: { id: referralId },
      data: {
        status: 'CLOSED_WON',
        budgetGenerated: true,
        updatedAt: new Date(),
      }
    });

    // Registrar no log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'CLOSE_DEAL',
        details: JSON.stringify({ referralId, value })
      }
    });

    return { success: true };
  } catch (e) {
    console.error('Erro ao fechar negócio:', e);
    return { success: false, error: "Erro ao registrar o negócio fechado" };
  }
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
  const maisIndicadosRaw = await prisma.referral.groupBy({
    by: ['toUserId'],
    where: { toUserId: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
  });

  const maisIndicados = await Promise.all(maisIndicadosRaw.map(async (item) => {
    const user = await prisma.user.findUnique({ where: { id: item.toUserId! } });
    return {
      nome: user?.companyName || user?.name || 'Membro',
      count: item._count.id
    };
  }));

  // Ranking: Maiores geradores de VALOR (soma de negócios fechados por indicador)
  const allClosedDeals = await prisma.closedBusiness.findMany({
    include: {
      referral: {
        include: { fromUser: true }
      }
    }
  });

  // Agrupar por fromUser e somar valores
  const valorPorIndicador: Record<string, { nome: string; valor: number }> = {};
  for (const deal of allClosedDeals) {
    const userId = deal.referral.fromUserId;
    const nome = deal.referral.fromUser.companyName || deal.referral.fromUser.name || 'Membro';
    if (!valorPorIndicador[userId]) {
      valorPorIndicador[userId] = { nome, valor: 0 };
    }
    valorPorIndicador[userId].valor += deal.value;
  }

  const maioresValores = Object.values(valorPorIndicador)
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);

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
    maisIndicados,
    maioresValores,
    totalNegocios: {
      count: totalNegocios._count.id,
      value: totalNegocios._sum.value || 0,
    },
  };
}
