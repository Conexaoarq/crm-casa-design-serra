'use client';

import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { getDashboardData } from "@/lib/actions";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
    
    async function loadData() {
      const res = await getDashboardData();
      setData(res);
      setLoading(false);
    }
    
    if (session) {
      loadData();
    }
  }, [session, status]);

  if (status === "loading" || loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.8rem' }}>Carregando Painel...</div>;
  }

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '6rem' }}>
      
      {/* Hero Header */}
      <div style={{ 
        paddingTop: '4rem', 
        paddingBottom: '4rem',
        borderBottom: '1px solid var(--border)',
        marginBottom: '4rem',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '100%', opacity: 0.02, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle at 100% 0%, #000 0%, transparent 50%)' }}></div>
        <h1 style={{ 
          fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', 
          fontWeight: 300, 
          letterSpacing: '-0.03em', 
          lineHeight: 1.1,
          color: '#111'
        }}>
          Multiplique <br />
          <strong style={{ fontWeight: 800 }}>Resultados.</strong>
        </h1>
        <p style={{ marginTop: '1.5rem', color: '#666', fontSize: '1rem', maxWidth: '500px', letterSpacing: '0.02em', lineHeight: 1.6 }}>
          Conecte clientes às melhores empresas do grupo. Uma rede de arquitetura, decoração e negócios.
        </p>
      </div>

      {/* Action Cards (Prancha Style) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
        
        <Link href="/indicacao/nova" style={{ textDecoration: 'none' }}>
          <div className="arch-card glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '10px', fontSize: '8rem', fontWeight: 900, color: '#f0f0f0', zIndex: 0, lineHeight: 1 }}>01</div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#111', textTransform: 'uppercase', marginBottom: '2rem', letterSpacing: '0.2em' }}>Ação Estratégica</div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 300, marginBottom: '1rem', color: '#000', letterSpacing: '-0.02em' }}>
                Enviar <strong style={{ fontWeight: 700 }}>Indicação</strong>
              </h3>
              <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '3rem' }}>
                Conecte um cliente com alguma empresa do grupo e gere novos negócios.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid #111', paddingBottom: '0.25rem' }}>
                Avançar <span style={{ fontSize: '1.2rem' }}>&rarr;</span>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/indicacao/pedir" style={{ textDecoration: 'none' }}>
          <div className="arch-card glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '10px', fontSize: '8rem', fontWeight: 900, color: '#f0f0f0', zIndex: 0, lineHeight: 1 }}>02</div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#111', textTransform: 'uppercase', marginBottom: '2rem', letterSpacing: '0.2em' }}>Expansão de Rede</div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 300, marginBottom: '1rem', color: '#000', letterSpacing: '-0.02em' }}>
                Pedir <strong style={{ fontWeight: 700 }}>Lead Quente</strong>
              </h3>
              <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '3rem' }}>
                Busca um contato específico? Acione o grupo para encontrar a conexão exata.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid #111', paddingBottom: '0.25rem' }}>
                Avançar <span style={{ fontSize: '1.2rem' }}>&rarr;</span>
              </div>
            </div>
          </div>
        </Link>

      </div>

      <div className="editorial-title">Performance Global</div>

      {/* ========== BANNER DESTAQUE: Ranking por Valor Gerado ========== */}
      <div style={{ 
        background: '#111', 
        padding: '4rem', 
        marginBottom: '3rem',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Geometric Background Detail */}
        <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '600px', height: '600px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '50%', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', top: '-30%', right: '5%', width: '400px', height: '400px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '50%', pointerEvents: 'none' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          
          <div>
            <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>Impacto de Mercado</div>
            <h3 style={{ fontWeight: 300, fontSize: '2rem', letterSpacing: '-0.02em' }}>Ranking por <strong style={{ fontWeight: 700 }}>Valor Gerado</strong></h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {data?.maioresValores?.length > 0 ? data.maioresValores.map((item: any, i: number) => (
              <div key={i} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '1.5rem 0', 
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <span style={{ 
                    fontWeight: 300, 
                    color: i === 0 ? '#fff' : '#666', 
                    fontSize: '1.5rem',
                    width: '2rem',
                  }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ fontWeight: i === 0 ? 600 : 400, fontSize: '1.1rem', letterSpacing: '0.02em' }}>{item.nome}</span>
                </div>
                <span style={{ 
                  fontWeight: 600, 
                  fontSize: '1.1rem', 
                  color: i === 0 ? '#fff' : '#aaa',
                  letterSpacing: '0.05em'
                }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
                </span>
              </div>
            )) : (
              <p style={{ fontSize: '0.9rem', color: '#666', padding: '1.5rem 0' }}>
                Nenhum negócio fechado ainda.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ========== 2 Rankings lado a lado ========== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
        
        {/* Ranking: Quem mais indicou */}
        <div>
          <div className="editorial-title">Mais Ativos</div>
          <div className="arch-card">
            <h3 style={{ fontWeight: 300, fontSize: '1.5rem', marginBottom: '2rem', letterSpacing: '-0.02em' }}>
              Maiores <strong style={{ fontWeight: 700 }}>Indicadores</strong>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {data?.maioresIndicadores?.length > 0 ? data.maioresIndicadores.map((item: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 300, color: '#aaa', fontSize: '0.9rem' }}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{item.nome}</span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>{item.count}</span>
                </div>
              )) : <p style={{ fontSize: '0.85rem', color: '#888' }}>Nenhuma indicação ainda.</p>}
            </div>
          </div>
        </div>

        {/* Ranking: Mais indicados (receberam mais) */}
        <div>
          <div className="editorial-title">Mais Demandados</div>
          <div className="arch-card">
            <h3 style={{ fontWeight: 300, fontSize: '1.5rem', marginBottom: '2rem', letterSpacing: '-0.02em' }}>
              Mais <strong style={{ fontWeight: 700 }}>Indicados</strong>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {data?.maisIndicados?.length > 0 ? data.maisIndicados.map((item: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 300, color: '#aaa', fontSize: '0.9rem' }}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{item.nome}</span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>{item.count}</span>
                </div>
              )) : <p style={{ fontSize: '0.85rem', color: '#888' }}>Nenhuma indicação ainda.</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
