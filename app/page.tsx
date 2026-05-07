import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Se for admin, redireciona para o painel administrativo por padrão
  if ((session.user as any).role === 'ADMIN') {
    redirect("/admin");
  }

  return (
    <div className="container animate-fade-in">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '3rem',
          padding: '2rem 0'
        }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '1rem' }}>
            Como você vai multiplicar hoje?
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '1.125rem' }}>
            Selecione uma das opções abaixo para movimentar a rede da Casa Design Serra.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1.5rem' 
        }}>
          
          {/* Card: Dar Indicação */}
          <Link href="/indicacao/nova" style={{ textDecoration: 'none' }}>
            <div className="glass-panel" style={{
              padding: '2rem',
              borderRadius: 'var(--radius)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--background)'
            }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--foreground)' }}>Indicar um Multiplicador</h3>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', lineHeight: 1.5, flex: 1 }}>
                Conecte um cliente ou parceiro com alguma empresa do nosso grupo.
              </p>
              <div style={{ marginTop: '1.5rem', fontWeight: 500, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Avançar 
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          </Link>

          {/* Card: Pedir Indicação */}
          <Link href="/indicacao/pedir" style={{ textDecoration: 'none' }}>
            <div className="glass-panel" style={{
              padding: '2rem',
              borderRadius: 'var(--radius)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--background)'
            }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--foreground)' }}>Quero um Lead Quente!</h3>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', lineHeight: 1.5, flex: 1 }}>
                Está procurando alguém específico? Peça ajuda para o grupo.
              </p>
              <div style={{ marginTop: '1.5rem', fontWeight: 500, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Avançar 
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          </Link>

          {/* Card: Registrar Negócio Fechado */}
          <Link href="/negocio-fechado" style={{ textDecoration: 'none', gridColumn: '1 / -1' }}>
            <div className="glass-panel" style={{
              padding: '2rem',
              borderRadius: 'var(--radius)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)'
            }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>Registrar Negócio Fechado</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                  Fechou negócio graças a uma indicação? Registre o valor para as nossas métricas!
                </p>
              </div>
              <div style={{ fontWeight: 500, fontSize: '0.875rem', display: 'flex', alignItems: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          </Link>

        </div>

        {/* --- NOVA SESSÃO: QUEM EU POSSO AJUDAR --- */}
        <div style={{ marginTop: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em' }}>Quem eu posso ajudar!</h2>
            <Link href="/pedidos" style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', fontWeight: 500 }}>
              Veja mais aqui &rarr;
            </Link>
          </div>
          <div className="glass-panel" style={{ borderRadius: 'var(--radius)', backgroundColor: 'var(--background)', overflow: 'hidden' }}>
            {/* Lista mockada de ultimos 5 pedidos */}
            {[
              { id: 1, nome: "Amma design", req: "Preciso de um contato direto na Construtora X." },
              { id: 2, nome: "Duo Mobile", req: "Procuro indicação de arquiteto focado em escritórios." },
              { id: 3, nome: "Nolan Collection", req: "Busco contato com gestores de hotéis na serra." },
              { id: 4, nome: "Triade", req: "Preciso de indicação para pintura epóxi." },
              { id: 5, nome: "AZ", req: "Procuro contato do síndico do Condomínio Y." }
            ].map((item, i) => (
              <div key={item.id} style={{ 
                padding: '1.25rem', 
                borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--secondary)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                  {item.nome.charAt(0)}
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{item.nome}</h4>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>{item.req}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- NOVA SESSÃO: RANKING --- */}
        <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          
          {/* Mais Indicados */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Mais Indicados</h2>
              <Link href="/ranking/indicados" style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem', fontWeight: 500 }}>
                Ver todos
              </Link>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', backgroundColor: 'var(--background)' }}>
              {[
                { pos: 1, nome: "Nolan Collection", pts: 42 },
                { pos: 2, nome: "DCA", pts: 38 },
                { pos: 3, nome: "Triade", pts: 35 },
                { pos: 4, nome: "Amma design", pts: 29 },
                { pos: 5, nome: "Futura Luz", pts: 21 },
              ].map((item) => (
                <div key={item.pos} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: item.pos < 5 ? '1rem' : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 700, color: item.pos === 1 ? '#d4af37' : 'var(--muted-foreground)' }}>{item.pos}º</span>
                    <span style={{ fontWeight: 500 }}>{item.nome}</span>
                  </div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{item.pts} rec.</span>
                </div>
              ))}
            </div>
          </div>

          {/* Maiores Indicadores */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Maiores Indicadores</h2>
              <Link href="/ranking/indicadores" style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem', fontWeight: 500 }}>
                Ver todos
              </Link>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', backgroundColor: 'var(--background)' }}>
              {[
                { pos: 1, nome: "AZ", pts: 55 },
                { pos: 2, nome: "Duo Mobile", pts: 41 },
                { pos: 3, nome: "Gregory Volpato", pts: 33 },
                { pos: 4, nome: "Ecobraum", pts: 30 },
                { pos: 5, nome: "Sole Aquecimento", pts: 25 },
              ].map((item) => (
                <div key={item.pos} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: item.pos < 5 ? '1rem' : 0 }}>
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

        {/* --- NOVA SESSÃO: MINHAS INTERAÇÕES --- */}
        <div style={{ marginTop: '4rem', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '1.5rem' }}>Minhas Interações</h2>
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius)', backgroundColor: 'var(--background)' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
              {/* Linha vertical da timeline */}
              <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', backgroundColor: 'var(--border)' }}></div>
              
              <div style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <div>
                  <p style={{ fontWeight: 500 }}>Você indicou "Nolan Collection"</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Cliente: Arq. João Silva • Há 2 horas</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--secondary)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}></div>
                <div>
                  <p style={{ fontWeight: 500 }}>Você registrou um Negócio Fechado</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Origem: AZ • Ontem</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--secondary)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}></div>
                <div>
                  <p style={{ fontWeight: 500 }}>"DCA" visualizou sua solicitação de Lead</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Pedido: Contato Construtora X • Há 3 dias</p>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
