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
    
    if (session?.user && (session.user as any).role === 'ADMIN') {
      redirect("/admin");
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

  const interactionsMap: Record<string, string> = {
    CREATE_REFERRAL: 'Você enviou uma nova indicação',
    REQUEST_LEAD: 'Você solicitou um lead quente',
    LOGIN: 'Você acessou o sistema',
    REGISTER_CLOSED_BUSINESS: 'Você registrou um negócio fechado',
  };

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
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', backgroundColor: '#fff', height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #eee' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>🤝</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#000' }}>Indicar um Multiplicador</h3>
              <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.5, flex: 1 }}>
                Conecte um cliente com alguma empresa do nosso grupo.
              </p>
              <div style={{ marginTop: '1.5rem', fontWeight: 700, fontSize: '0.8rem', color: '#000' }}>AVANÇAR &rarr;</div>
            </div>
          </Link>

          <Link href="/indicacao/pedir" style={{ textDecoration: 'none' }}>
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', backgroundColor: '#fff', height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #eee' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>🔍</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#000' }}>Quero um Lead Quente!</h3>
              <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.5, flex: 1 }}>
                Está procurando alguém específico? Peça ajuda para o grupo.
              </p>
              <div style={{ marginTop: '1.5rem', fontWeight: 700, fontSize: '0.8rem', color: '#000' }}>AVANÇAR &rarr;</div>
            </div>
          </Link>

          <Link href="/negocio-fechado" style={{ textDecoration: 'none', gridColumn: '1 / -1' }}>
            <div className="glass-panel" style={{ padding: '1.5rem 2rem', borderRadius: '16px', backgroundColor: '#000', color: '#fff', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ fontSize: '2rem' }}>💰</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Registrar Negócio Fechado</h3>
                <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Comemore um sucesso com o grupo e gere pontos no ranking.</p>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>REGISTRAR &rarr;</div>
            </div>
          </Link>

        </div>

        {/* Seção de Rankings */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🏆 Mais Indicados
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data?.maisIndicados?.length > 0 ? data.maisIndicados.map((item: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: i === 0 ? '#f8f8f8' : 'transparent', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 800, color: i === 0 ? '#000' : '#ccc' }}>{i + 1}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.nome}</span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.pts} pts</span>
                </div>
              )) : <p style={{ fontSize: '0.8rem', color: '#888' }}>Nenhuma indicação ainda.</p>}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🚀 Maiores Indicadores
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data?.maioresIndicadores?.length > 0 ? data.maioresIndicadores.map((item: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: i === 0 ? '#f8f8f8' : 'transparent', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 800, color: i === 0 ? '#000' : '#ccc' }}>{i + 1}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.nome}</span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.pts} pts</span>
                </div>
              )) : <p style={{ fontSize: '0.8rem', color: '#888' }}>Nenhuma indicação ainda.</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
