import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // O Admin não usa a interface de usuário, vai direto para a Gestão
  if ((session.user as any).role === 'ADMIN') {
    redirect("/admin");
  }

  // Ranking: Mais indicados
  const maisIndicadosRaw = await prisma.referral.groupBy({
    by: ['toUserId'],
    where: { toUserId: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
  });

  const maisIndicados = await Promise.all(maisIndicadosRaw.map(async (item, i) => {
    const user = await prisma.user.findUnique({ where: { id: item.toUserId! } });
    return {
      pos: i + 1,
      nome: user?.companyName || user?.name || 'Membro',
      pts: item._count.id
    };
  }));

  // Ranking: Maiores indicadores
  const maioresIndicadoresRaw = await prisma.referral.groupBy({
    by: ['fromUserId'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
  });

  const maioresIndicadores = await Promise.all(maioresIndicadoresRaw.map(async (item, i) => {
    const user = await prisma.user.findUnique({ where: { id: item.fromUserId } });
    return {
      pos: i + 1,
      nome: user?.companyName || user?.name || 'Membro',
      pts: item._count.id
    };
  }));

  // Buscar interações reais do usuário
  const interacoes = await prisma.auditLog.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const ACTION_LABELS: any = {
    CREATE_REFERRAL: 'Você enviou uma indicação',
    LOGIN: 'Você acessou o sistema',
    REGISTER_CLOSED_BUSINESS: 'Você registrou um negócio fechado',
  };
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleActionClick = (action: string) => {
    setActiveAction(action);
    setFeedback(null);
  };

  const handleCloseAction = () => {
    setActiveAction(null);
    setFeedback(null);
  };

  const handleSuccess = (msg: string) => {
    setFeedback({ type: 'success', msg });
    setTimeout(() => {
      handleCloseAction();
    }, 2000);
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '5rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Feedback Toast */}
        {feedback && (
          <div style={{ 
            position: 'fixed', 
            top: '20px', 
            right: '20px', 
            backgroundColor: feedback.type === 'success' ? '#000' : '#c00', 
            color: '#fff', 
            padding: '1rem 2rem', 
            borderRadius: '12px', 
            boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
            zIndex: 1000,
            animation: 'slide-in-right 0.3s ease-out'
          }}>
            {feedback.msg}
          </div>
        )}

        <div style={{ 
          textAlign: 'center', 
          marginBottom: '3rem',
          paddingTop: '2rem'
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 800, 
            letterSpacing: '-0.05em', 
            marginBottom: '1rem',
            lineHeight: 1.1
          }}>
            Como você vai <br />
            <span style={{ color: '#000' }}>multiplicar hoje?</span>
          </h1>
              <div style={{ marginTop: '1.5rem', fontWeight: 500, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Avançar &rarr;
              </div>
            </div>
          </Link>

          {/* Card: Pedir Indicação */}
          <Link href="/indicacao/pedir" style={{ textDecoration: 'none' }}>
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius)', backgroundColor: 'var(--background)', height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--foreground)' }}>Quero um Lead Quente!</h3>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', lineHeight: 1.5, flex: 1 }}>
                Está procurando alguém específico? Peça ajuda para o grupo.
              </p>
              <div style={{ marginTop: '1.5rem', fontWeight: 500, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Avançar &rarr;
              </div>
            </div>
          </Link>

          {/* Card: Registrar Negócio Fechado */}
          <Link href="/negocio-fechado" style={{ textDecoration: 'none', gridColumn: '1 / -1' }}>
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius)', backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>Registrar Negócio Fechado</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                  Fechou negócio graças a uma indicação? Registre o valor para as nossas métricas!
                </p>
              </div>
              <div style={{ fontWeight: 500, fontSize: '0.875rem', display: 'flex', alignItems: 'center' }}>
                &rarr;
              </div>
            </div>
          </Link>
        </div>

        {/* RANKINGS */}
        <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>🏆 Mais Indicados</h2>
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
              {maisIndicados.length === 0 ? <p style={{ fontSize: '0.8rem', color: '#999' }}>Ainda sem registros.</p> : maisIndicados.map((item) => (
                <div key={item.pos} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 700, color: item.pos === 1 ? '#d4af37' : 'var(--muted-foreground)' }}>{item.pos}º</span>
                    <span style={{ fontWeight: 500 }}>{item.nome}</span>
                  </div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{item.pts} rec.</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>🚀 Maiores Indicadores</h2>
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
              {maioresIndicadores.length === 0 ? <p style={{ fontSize: '0.8rem', color: '#999' }}>Ainda sem registros.</p> : maioresIndicadores.map((item) => (
                <div key={item.pos} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 700, color: item.pos === 1 ? '#d4af37' : 'var(--muted-foreground)' }}>{item.pos}º</span>
                    <span style={{ fontWeight: 500 }}>{item.nome}</span>
                  </div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{item.pts} envios</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* INTERAÇÕES */}
        <div style={{ marginTop: '4rem', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Minhas Interações</h2>
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius)', backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', backgroundColor: 'var(--border)' }}></div>
              
              {interacoes.length === 0 ? <p style={{ fontSize: '0.9rem', color: '#999', paddingLeft: '30px' }}>Você ainda não realizou interações.</p> : interacoes.map((log) => (
                <div key={log.id} style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  <div>
                    <p style={{ fontWeight: 500 }}>{ACTION_LABELS[log.action] || log.action}</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{log.createdAt.toLocaleDateString('pt-BR')} • {log.details || ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
