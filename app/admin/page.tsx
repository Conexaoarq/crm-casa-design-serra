import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';

async function getAdminData() {
  try {
    // Total de negócios fechados
    const totalNegocios = await prisma.closedBusiness.aggregate({
      _sum: { value: true },
      _count: { id: true },
    });

    // Total de indicações
    const totalIndicacoes = await prisma.referral.count();

    // Total de membros
    const totalMembros = await prisma.user.count();

    // Ranking: Mais indicados (empresas que mais receberam indicações)
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

    // Últimas Interações (Logs)
    const ultimosLogs = await prisma.auditLog.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      stats: {
        totalVendas: totalNegocios._sum.value || 0,
        qtdVendas: totalNegocios._count.id,
        totalIndicacoes,
        totalMembros
      },
      maisIndicados,
      ultimosLogs
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
    <div className="container animate-fade-in">
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.025em' }}>Painel Administrativo</h1>
            <p style={{ color: 'var(--muted-foreground)' }}>Métricas e controle da Casa Design Serra</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/" className="btn-outline" style={{ 
              textDecoration: 'none', 
              padding: '0.5rem 1rem', 
              border: '1px solid #ccc', 
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              Visão do Usuário
            </Link>
            
            <a href="/api/export" download className="btn-primary" style={{ 
              textDecoration: 'none', 
              padding: '0.5rem 1rem', 
              backgroundColor: '#333', 
              color: '#fff', 
              borderRadius: '6px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              fontWeight: 'bold',
              fontSize: '0.875rem'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar
            </a>

            <Link href="/admin/membros" className="btn-primary" style={{ 
              textDecoration: 'none', 
              padding: '0.5rem 1rem',
              backgroundColor: '#000',
              color: '#fff',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              👥 GESTÃO
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Vendas Totais</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.stats.totalVendas)}
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Indicações</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{data.stats.totalIndicacoes}</div>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Empresas</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{data.stats.totalMembros} / 40</div>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Negócios</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{data.stats.qtdVendas}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          {/* Ranking */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>🏆 Ranking de Indicações (Recebidas)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.maisIndicados.map((item) => (
                <div key={item.pos} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: item.pos === 1 ? '#f8f8f8' : 'transparent', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 800, color: item.pos === 1 ? '#000' : '#ccc', width: '20px' }}>{item.pos}</span>
                    <span style={{ fontWeight: 600 }}>{item.nome}</span>
                  </div>
                  <span style={{ fontWeight: 700 }}>{item.pts}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Logs */}
          <div className="glass-panel" style={{ padding: '0' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontWeight: 700 }}>🕒 Atividade Recente</h3>
            </div>
            {data.ultimosLogs.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Nenhuma atividade registrada.</div>
            ) : (
              data.ultimosLogs.map((log, i) => (
                <div key={log.id} style={{
                  padding: '1rem 1.25rem',
                  borderBottom: i < data.ultimosLogs.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.875rem' }}>{ACTION_LABELS[log.action] || log.action}</span>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>— {log.user.companyName || log.user.name || 'Membro'}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>
                    {new Date(log.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
