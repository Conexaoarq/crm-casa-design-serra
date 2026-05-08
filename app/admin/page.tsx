import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { atualizarStatusIndicacao } from "@/lib/actions";

export const dynamic = 'force-dynamic';

async function getAdminData() {
  try {
    const totalNegocios = await prisma.closedBusiness.aggregate({
      _sum: { value: true },
      _count: { id: true },
    });

    const totalIndicacoes = await prisma.referral.count();
    const totalMembros = await prisma.user.count();

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
      ultimosLogs,
      indicacoes: indicacoesCompletas
    };
  } catch (e) {
    console.error("Erro ao buscar dados admin:", e);
    return null;
  }
}

const ACTION_LABELS: Record<string, string> = {
  CREATE_REFERRAL: 'Nova Indicação',
  REQUEST_LEAD: 'Pedido de Lead',
  LOGIN: 'Acesso ao Sistema',
  REGISTER_CLOSED_BUSINESS: 'Negócio Fechado',
};

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect("/login");
  }

  const data = await getAdminData();
  if (!data) return <div>Erro ao carregar dados do painel.</div>;

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header Profissional */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.05em', color: '#000' }}>PAINEL DE GESTÃO</h1>
            <p style={{ color: '#888', fontSize: '1rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Monitoramento de Performance CDS</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none', padding: '0.75rem 1.5rem', border: '1px solid #000', borderRadius: '100px', fontSize: '0.875rem', fontWeight: 600, color: '#000', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              Visão do Usuário
            </Link>
            
            <a href="/api/export" download style={{ textDecoration: 'none', padding: '0.75rem 1.5rem', backgroundColor: '#333', color: '#fff', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar CSV
            </a>

            <Link href="/admin/membros" style={{ textDecoration: 'none', padding: '0.75rem 2rem', backgroundColor: '#000', color: '#fff', borderRadius: '100px', fontWeight: 700, fontSize: '0.875rem' }}>
              GESTÃO DE MEMBROS
            </Link>
          </div>
        </div>

        {/* Stats Grid - Premium Glassmorphism */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          {[
            { label: 'Vendas Totais', val: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.stats.totalVendas), desc: 'Volume de negócios' },
            { label: 'Indicações', val: data.stats.totalIndicacoes, desc: 'Total gerado' },
            { label: 'Membros Ativos', val: `${data.stats.totalMembros}/50`, desc: 'Vagas do grupo' },
            { label: 'Negócios Fechados', val: data.stats.qtdVendas, desc: 'Conversões reais' },
          ].map((s, i) => (
            <div key={i} style={{ 
              background: 'linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)', 
              padding: '2rem', 
              borderRadius: '24px', 
              border: '1px solid #f0f0f0',
              boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>{s.label}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#000', marginBottom: '0.25rem' }}>{s.val}</div>
              <div style={{ fontSize: '0.875rem', color: '#888' }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Relatório Detalhado de Indicações */}
        <div style={{ background: '#fff', borderRadius: '32px', border: '1px solid #f0f0f0', padding: '2.5rem', marginBottom: '4rem', boxShadow: '0 20px 50px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Acompanhamento de Indicações</h2>
            <span style={{ fontSize: '0.875rem', color: '#888', fontWeight: 500 }}>Total: {data.indicacoes.length} registros</span>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#aaa', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <th style={{ padding: '0 1rem' }}>Data</th>
                  <th style={{ padding: '0 1rem' }}>De (Indicador)</th>
                  <th style={{ padding: '0 1rem' }}>Para (Destino)</th>
                  <th style={{ padding: '0 1rem' }}>Cliente</th>
                  <th style={{ padding: '0 1rem' }}>Status</th>
                  <th style={{ padding: '0 1rem' }}>Valor</th>
                  <th style={{ padding: '0 1rem' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.indicacoes.map((ind) => (
                  <tr key={ind.id} style={{ backgroundColor: '#fcfcfc', transition: 'all 0.2s' }}>
                    <td style={{ padding: '1.25rem 1rem', borderRadius: '12px 0 0 12px', fontSize: '0.875rem' }}>
                      {new Date(ind.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '1.25rem 1rem', fontWeight: 600, fontSize: '0.875rem' }}>
                      {ind.fromUser.companyName || ind.fromUser.name}
                    </td>
                    <td style={{ padding: '1.25rem 1rem', fontWeight: 600, fontSize: '0.875rem', color: ind.toUser ? '#000' : '#888' }}>
                      {ind.toUser?.companyName || ind.toUser?.name || 'Grupo Aberto'}
                    </td>
                    <td style={{ padding: '1.25rem 1rem', fontSize: '0.875rem' }}>
                      <div style={{ fontWeight: 700 }}>{ind.clientName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>{ind.clientPhone || 'Sem tel.'}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '100px', 
                          fontSize: '0.7rem', 
                          fontWeight: 800,
                          backgroundColor: ind.contactMade ? '#e6fffa' : '#f5f5f5',
                          color: ind.contactMade ? '#0694a2' : '#aaa'
                        }}>CONTATO</span>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '100px', 
                          fontSize: '0.7rem', 
                          fontWeight: 800,
                          backgroundColor: ind.budgetGenerated ? '#ebf8ff' : '#f5f5f5',
                          color: ind.budgetGenerated ? '#3182ce' : '#aaa'
                        }}>ORÇAMENTO</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem', fontWeight: 800, fontSize: '0.875rem' }}>
                      {ind.closedBusiness ? 
                        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ind.closedBusiness.value) : 
                        '-'
                      }
                    </td>
                    <td style={{ padding: '1.25rem 1rem', borderRadius: '0 12px 12px 0' }}>
                      <form action={async () => {
                        'use server';
                        await atualizarStatusIndicacao(ind.id, { contactMade: true });
                        redirect('/admin');
                      }}>
                        <button type="submit" style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#000', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'underline' }}>
                          MARCAR CONTATO
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          {/* Top Indicadores */}
          <div style={{ background: '#fff', borderRadius: '24px', padding: '2rem', border: '1px solid #f0f0f0' }}>
            <h3 style={{ fontWeight: 800, marginBottom: '2rem', fontSize: '1.25rem' }}>Ranking de Indicações</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.maisIndicados.map((item) => (
                <div key={item.pos} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #f9f9f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <span style={{ fontWeight: 900, color: item.pos === 1 ? '#000' : '#ddd', fontSize: '1.25rem' }}>{item.pos}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.nome}</span>
                  </div>
                  <span style={{ fontWeight: 900, backgroundColor: '#000', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem' }}>{item.pts}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Atividade Recente */}
          <div style={{ background: '#fff', borderRadius: '24px', padding: '0', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
            <div style={{ padding: '2rem', borderBottom: '1px solid #f0f0f0' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.25rem' }}>Atividade Recente</h3>
            </div>
            {data.ultimosLogs.map((log, i) => (
              <div key={log.id} style={{
                padding: '1.25rem 2rem',
                borderBottom: i < data.ultimosLogs.length - 1 ? '1px solid #f9f9f9' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#000' }}></div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{ACTION_LABELS[log.action] || log.action}</div>
                    <div style={{ color: '#aaa', fontSize: '0.75rem', fontWeight: 500 }}>{log.user.companyName || log.user.name}</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#ccc', fontWeight: 600 }}>
                  {new Date(log.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
