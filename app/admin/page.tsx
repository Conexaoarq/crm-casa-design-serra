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

    const maisIndicadosUsers = await Promise.all(
      maisIndicadosRaw.map(async (item) => {
        const user = await prisma.user.findUnique({ where: { id: item.toUserId! } });
        return {
          nome: user?.companyName || user?.name || 'Membro',
          count: item._count.id,
        };
      })
    );

    // Ranking: Maiores indicadores (quem mais indicou)
    const maioresIndicadoresRaw = await prisma.referral.groupBy({
      by: ['fromUserId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const maioresIndicadoresUsers = await Promise.all(
      maioresIndicadoresRaw.map(async (item) => {
        const user = await prisma.user.findUnique({ where: { id: item.fromUserId } });
        return {
          nome: user?.companyName || user?.name || 'Membro',
          count: item._count.id,
        };
      })
    );

    // Últimos negócios fechados (com valor)
    const ultimosNegocios = await prisma.closedBusiness.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        referral: {
          include: { fromUser: true }
        }
      }
    });

    // Últimos logs de auditoria
    const ultimosLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
      include: { user: true }
    });

    return {
      totalNegocios: {
        count: totalNegocios._count.id,
        value: totalNegocios._sum.value || 0,
      },
      totalIndicacoes,
      totalMembros,
      maisIndicados: maisIndicadosUsers,
      maioresIndicadores: maioresIndicadoresUsers,
      ultimosNegocios: ultimosNegocios.map(n => ({
        id: n.id,
        value: n.value,
        clientName: n.referral.clientName,
        fromUser: n.referral.fromUser.companyName || n.referral.fromUser.name || 'Membro',
        closedAt: n.closedAt.toLocaleDateString('pt-BR'),
      })),
      ultimosLogs: ultimosLogs.map(l => ({
        id: l.id,
        action: l.action,
        userName: l.user.companyName || l.user.name || 'Membro',
        details: l.details,
        createdAt: l.createdAt.toLocaleString('pt-BR'),
      })),
    };
  } catch (error) {
    console.error("Erro ao carregar dados do admin:", error);
    return {
      totalNegocios: { count: 0, value: 0 },
      totalIndicacoes: 0,
      totalMembros: 0,
      maisIndicados: [],
      maioresIndicadores: [],
      ultimosNegocios: [],
      ultimosLogs: [],
    };
  }
}

const ACTION_LABELS: Record<string, string> = {
  CREATE_REFERRAL: '📤 Nova Indicação',
  REQUEST_LEAD: '🔍 Pedido de Lead',
  REGISTER_CLOSED_BUSINESS: '💰 Negócio Fechado',
  VIEW_REPORTS: '📊 Visualizou Relatórios',
  LOGIN: '🔐 Login',
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect("/login");
  }

  const data = await getAdminData();

  return (
    <div className="container animate-fade-in">
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.025em' }}>Painel Administrativo</h1>
            <p style={{ color: 'var(--muted-foreground)' }}>Métricas e controle da Casa Design Serra</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="/api/export" download className="btn-primary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', backgroundColor: '#333', color: '#fff', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar
            </a>
            <Link href="/admin/membros" className="btn-primary" style={{ 
              textDecoration: 'none', 
              padding: '0.5rem 1.5rem',
              backgroundColor: '#000',
              color: '#fff',
              borderRadius: '6px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center'
            }}>
              👥 GESTÃO DE EMPRESAS
            </Link>
            <Link href="/" className="btn-outline" style={{ textDecoration: 'none', padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '6px' }}>
              ← Ir para Site (Usuários)
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius)', backgroundColor: 'var(--background)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>Total em Negócios</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em' }}>
              R$ {data.totalNegocios.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius)', backgroundColor: 'var(--background)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>Negócios Fechados</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 700 }}>{data.totalNegocios.count}</p>
          </div>
          
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius)', backgroundColor: 'var(--background)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>Indicações Registradas</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 700 }}>{data.totalIndicacoes}</p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius)', backgroundColor: 'var(--background)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>Membros Cadastrados</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 700 }}>{data.totalMembros}</p>
          </div>

        </div>

        {/* Rankings lado a lado */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          
          {/* Mais Indicados */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>🏆 Mais Indicados (Top 10)</h2>
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', backgroundColor: 'var(--background)' }}>
              {data.maisIndicados.length === 0 ? (
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>Nenhuma indicação registrada ainda.</p>
              ) : (
                data.maisIndicados.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: i < data.maisIndicados.length - 1 ? '0.75rem' : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 700, color: i === 0 ? '#d4af37' : 'var(--muted-foreground)', minWidth: '28px' }}>{i + 1}º</span>
                      <span style={{ fontWeight: 500 }}>{item.nome}</span>
                    </div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{item.count} rec.</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Maiores Indicadores */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>🚀 Maiores Indicadores (Top 10)</h2>
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', backgroundColor: 'var(--background)' }}>
              {data.maioresIndicadores.length === 0 ? (
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>Nenhuma indicação registrada ainda.</p>
              ) : (
                data.maioresIndicadores.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: i < data.maioresIndicadores.length - 1 ? '0.75rem' : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 700, color: i === 0 ? '#d4af37' : 'var(--muted-foreground)', minWidth: '28px' }}>{i + 1}º</span>
                      <span style={{ fontWeight: 500 }}>{item.nome}</span>
                    </div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{item.count} envios</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Últimos Negócios Fechados (com valor) */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>💰 Últimos Negócios Fechados</h2>
          <div className="glass-panel" style={{ borderRadius: 'var(--radius)', backgroundColor: 'var(--background)', overflow: 'hidden' }}>
            {data.ultimosNegocios.length === 0 ? (
              <p style={{ padding: '1.5rem', color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>Nenhum negócio fechado registrado ainda.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '1rem 1.25rem', textAlign: 'left' }}>Cliente</th>
                    <th style={{ padding: '1rem 1.25rem', textAlign: 'left' }}>Registrado por</th>
                    <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Valor</th>
                    <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {data.ultimosNegocios.map((n, i) => (
                    <tr key={n.id} style={{ borderBottom: i < data.ultimosNegocios.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 500 }}>{n.clientName}</td>
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--muted-foreground)' }}>{n.fromUser}</td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 600 }}>
                        R$ {n.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>{n.closedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Log de Auditoria (LGPD) */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>🔒 Log de Auditoria (LGPD)</h2>
          <div className="glass-panel" style={{ borderRadius: 'var(--radius)', backgroundColor: 'var(--background)', overflow: 'hidden' }}>
            {data.ultimosLogs.length === 0 ? (
              <p style={{ padding: '1.5rem', color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>Nenhum registro de auditoria ainda.</p>
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
                    <span style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>— {log.userName}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>{log.createdAt}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
