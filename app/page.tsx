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
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>Carregando seu Dashboard...</div>;
  }

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '5rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
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
          <div style={{ height: '3px', width: '60px', backgroundColor: '#000', margin: '0 auto 2.5rem' }}></div>
        </div>

        {/* Cards de Ação */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
          
          <Link href="/indicacao/nova" style={{ textDecoration: 'none' }}>
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', backgroundColor: '#fff', height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #e5e5e5' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#aaa', textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>01. INDICAR</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#000' }}>Indicar um Multiplicador</h3>
              <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.5, flex: 1 }}>
                Conecte um cliente com alguma empresa do nosso grupo.
              </p>
              <div style={{ marginTop: '1.5rem', fontWeight: 700, fontSize: '0.8rem', color: '#000' }}>AVANÇAR &rarr;</div>
            </div>
          </Link>

          <Link href="/indicacao/pedir" style={{ textDecoration: 'none' }}>
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', backgroundColor: '#fff', height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #e5e5e5' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#aaa', textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>02. PEDIR LEAD</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#000' }}>Quero um Lead Quente!</h3>
              <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.5, flex: 1 }}>
                Está procurando alguém específico? Peça ajuda para o grupo.
              </p>
              <div style={{ marginTop: '1.5rem', fontWeight: 700, fontSize: '0.8rem', color: '#000' }}>AVANÇAR &rarr;</div>
            </div>
          </Link>

        </div>

        {/* ========== BANNER DESTAQUE: Ranking por Valor Gerado ========== */}
        <div style={{ 
          background: '#0a0a0a', 
          borderRadius: '24px', 
          padding: '2.5rem', 
          marginBottom: '2rem',
          color: '#fff',
          border: '1px solid #222',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#fff', borderRadius: '50%' }}></div>
            <h3 style={{ fontWeight: 600, fontSize: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#ccc' }}>Ranking por Valor Gerado</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data?.maioresValores?.length > 0 ? data.maioresValores.map((item: any, i: number) => (
              <div key={i} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '1rem 1.25rem', 
                backgroundColor: i === 0 ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.05)', 
                borderRadius: '12px',
                border: i === 0 ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(255,255,255,0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ 
                    fontWeight: 600, 
                    color: i === 0 ? '#fff' : '#666', 
                    fontSize: '1rem',
                    width: '2rem',
                    textAlign: 'center'
                  }}>{i + 1}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.nome}</span>
                </div>
                <span style={{ 
                  fontWeight: 600, 
                  fontSize: '0.9rem', 
                  color: i === 0 ? '#000' : '#fff',
                  backgroundColor: i === 0 ? '#fff' : '#222',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '4px'
                }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
                </span>
              </div>
            )) : (
              <p style={{ fontSize: '0.85rem', color: '#666', textAlign: 'center', padding: '1.5rem 0' }}>
                Nenhum negócio fechado ainda.
              </p>
            )}
          </div>
        </div>

        {/* ========== 2 Rankings lado a lado ========== */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          
          {/* Ranking: Quem mais indicou */}
          <div className="glass-panel" style={{ padding: '2rem', border: '1px solid #e5e5e5' }}>
            <h3 style={{ fontWeight: 600, fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '6px', height: '6px', backgroundColor: '#000', borderRadius: '50%' }}></div>
              Mais Indicações Enviadas
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data?.maioresIndicadores?.length > 0 ? data.maioresIndicadores.map((item: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: i === 0 ? '#f8f8f8' : 'transparent', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 800, color: i === 0 ? '#000' : '#ccc' }}>{i + 1}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.nome}</span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.count} ind.</span>
                </div>
              )) : <p style={{ fontSize: '0.8rem', color: '#888' }}>Nenhuma indicação ainda.</p>}
            </div>
          </div>

          {/* Ranking: Mais indicados (receberam mais) */}
          <div className="glass-panel" style={{ padding: '2rem', border: '1px solid #e5e5e5' }}>
            <h3 style={{ fontWeight: 600, fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '6px', height: '6px', backgroundColor: '#000', borderRadius: '50%' }}></div>
              Mais Indicações Recebidas
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data?.maisIndicados?.length > 0 ? data.maisIndicados.map((item: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: i === 0 ? '#f8f8f8' : 'transparent', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 800, color: i === 0 ? '#000' : '#ccc' }}>{i + 1}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.nome}</span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.count} rec.</span>
                </div>
              )) : <p style={{ fontSize: '0.8rem', color: '#888' }}>Nenhuma indicação ainda.</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
