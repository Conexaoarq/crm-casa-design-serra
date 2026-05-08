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

  // Criar CSV
  let csv = 'Data,De,Para,Cliente,Status,Valor\n';
  
  referrals.forEach(r => {
    const date = r.createdAt.toLocaleDateString();
    const from = r.fromUser.companyName || r.fromUser.email;
    const to = r.toUser?.companyName || 'Todos';
    const client = r.clientName;
    const status = r.status;
    const value = (r.closedBusiness as any)?.[0]?.value || 0;
    
    csv += `${date},"${from}","${to}","${client}",${status},${value}\n`;
  });

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=relatorio-crm-casa-design.csv'
    }
  });
}
