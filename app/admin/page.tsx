import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import Link from "next/link";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = 'force-dynamic';

async function getAdminData() {
  try {
    const totalNegocios = await prisma.closedBusiness.aggregate({
      _sum: { value: true },
      _count: { id: true },
    });

    const totalIndicacoes = await prisma.referral.count();
    const totalMembros = await prisma.user.count();

    // Ranking: Mais indicados (receberam mais indicações)
    const maisIndicadosRaw = await prisma.referral.groupBy({
      by: ['toUserId'],
      where: { toUserId: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const maisIndicados = await Promise.all(maisIndicadosRaw.map(async (item, i) => {
      const user = await prisma.user.findUnique({ where: { id: item.toUserId! } });
      return { pos: i + 1, nome: user?.companyName || user?.name || 'Membro', pts: item._count.id };
    }));

    // Ranking: Maiores geradores de VALOR
    const allClosedDeals = await prisma.closedBusiness.findMany({
      include: {
        referral: {
          include: { fromUser: true }
        }
      }
    });

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
      .slice(0, 10)
      .map((item, i) => ({ pos: i + 1, ...item }));

    const indicacoesCompletas = await prisma.referral.findMany({
      include: {
        fromUser: true,
        toUser: true,
        closedBusiness: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const ultimosLogs = await prisma.auditLog.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });

    return {
      stats: {
        totalVendas: totalNegocios._sum.value || 0,
        qtdVendas: totalNegocios._count.id,
        totalIndicacoes,
        totalMembros
      },
      maisIndicados,
      maioresValores,
      ultimosLogs,
      indicacoes: indicacoesCompletas.map(ind => ({
        id: ind.id,
        createdAt: ind.createdAt.toISOString(),
        fromUserName: ind.fromUser.companyName || ind.fromUser.name || 'Membro',
        toUserName: ind.toUser?.companyName || ind.toUser?.name || null,
        clientName: ind.clientName,
        clientPhone: ind.clientPhone,
        projectDetails: ind.projectDetails || '',
        architectName: ind.architectName || '',
        contactMade: ind.contactMade,
        budgetGenerated: ind.budgetGenerated,
        status: ind.status,
        closedValue: ind.closedBusiness?.value || null,
      }))
    };
  } catch (e) {
    console.error("Erro ao buscar dados admin:", e);
    return null;
  }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!session || (userRole !== 'ADMIN' && userRole !== 'CONSELHEIRO')) {
    redirect("/login");
  }

  const isAdmin = userRole === 'ADMIN';
  const data = await getAdminData();
  if (!data) return <div>Erro ao carregar dados do painel.</div>;

  return <AdminDashboardClient data={data} isAdmin={isAdmin} />;
}
