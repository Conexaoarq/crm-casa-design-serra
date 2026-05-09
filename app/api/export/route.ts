import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return new NextResponse('Não autorizado', { status: 401 });
  }

  const referrals = await prisma.referral.findMany({
    include: {
      fromUser: true,
      toUser: true,
      closedBusiness: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Criar CSV com BOM para Excel (UTF-8) e separador ponto-e-vírgula
  let csv = '\uFEFF';
  csv += 'Data;De (Indicador);Para (Destino);Cliente;Status;Contato Realizado;Orçamento Gerado;Valor Fechado\n';
  
  referrals.forEach(r => {
    const date = new Date(r.createdAt).toLocaleDateString('pt-BR');
    const from = r.fromUser.companyName || r.fromUser.name || r.fromUser.email;
    const to = r.toUser?.companyName || r.toUser?.name || 'Grupo Aberto';
    const client = r.clientName;
    const status = r.status;
    const contact = (r as any).contactMade ? 'SIM' : 'NÃO';
    const budget = (r as any).budgetGenerated ? 'SIM' : 'NÃO';
    const value = r.closedBusiness?.value || 0;
    
    // Formatar valor para o padrão Excel (ponto para milhar e vírgula para decimal se necessário, mas aqui usaremos string)
    const formattedValue = value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    
    csv += `${date};"${from}";"${to}";"${client}";${status};${contact};${budget};${formattedValue}\n`;
  });

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename=relatorio_negocios_cds.csv'
    }
  });
}
