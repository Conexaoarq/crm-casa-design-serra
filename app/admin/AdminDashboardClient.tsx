'use client';

import { useState } from "react";
import Link from "next/link";
import AdminTableRow from "./AdminTableRow";

const ACTION_LABELS: Record<string, string> = {
  CREATE_REFERRAL: 'Nova Indicação',
  REQUEST_LEAD: 'Pedido de Lead',
  LOGIN: 'Acesso ao Sistema',
  REGISTER_CLOSED_BUSINESS: 'Negócio Fechado',
  CLOSE_DEAL: 'Negócio Fechado',
};

export default function AdminDashboardClient({ data, isAdmin }: { data: any, isAdmin: boolean }) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filteredIndicacoes = data?.indicacoes.filter((ind: any) => {
    if (statusFilter !== "ALL") {
      if (statusFilter === "PENDENTE" && ind.contactMade) return false;
      if (statusFilter === "CONTATADO" && (!ind.contactMade || ind.closedValue)) return false;
      if (statusFilter === "FECHADO" && !ind.closedValue) return false;
    }
    if (search) {
      const s = search.toLowerCase();
      if (!ind.clientName.toLowerCase().includes(s) && !ind.fromUserName.toLowerCase().includes(s) && !(ind.toUserName || '').toLowerCase().includes(s)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ 
          paddingTop: '4rem', 
          paddingBottom: '3rem',
          borderBottom: '1px solid var(--border)',
          marginBottom: '4rem'
        }}>
          <h1 style={{ 
            fontSize: 'clamp(2rem, 4vw, 3.5rem)', 
            fontWeight: 300, 
            letterSpacing: '-0.03em', 
            lineHeight: 1.1,
            color: '#111'
          }}>
            Gestão <strong style={{ fontWeight: 800 }}>Estratégica.</strong>
          </h1>
          <p style={{ marginTop: '1.5rem', color: '#666', fontSize: '1rem', maxWidth: '600px', letterSpacing: '0.02em', lineHeight: 1.6 }}>
            Visão global de negócios, indicações e performance do grupo Casa Design Serra.
          </p>
        </div>

        {/* Banner de visualização para conselheiros */}
        {!isAdmin && (
          <div style={{ 
            padding: '1.5rem 2rem', 
            backgroundColor: '#fff', 
            border: '1px solid var(--border)', 
            marginBottom: '3rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.85rem',
            fontWeight: 500,
            color: '#333',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            <div style={{ width: '6px', height: '6px', backgroundColor: '#888', borderRadius: '50%' }}></div>
            Modo Visualização Conselheiro
          </div>
        )}

        {/* Stats Grid - High End */}
        <div className="editorial-title">Overview</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
          {[
            { label: 'Volume de Negócios', val: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.stats.totalVendas), desc: 'Vendas Totais' },
            { label: 'Total Gerado', val: data.stats.totalIndicacoes, desc: 'Indicações' },
            { label: 'Vagas do Grupo', val: `${data.stats.totalMembros}/50`, desc: 'Membros Ativos' },
            { label: 'Conversões', val: data.stats.qtdVendas, desc: 'Negócios Fechados' },
          ].map((s, i) => (
            <div key={i} className="arch-card" style={{ padding: '2.5rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.5rem' }}>{s.label}</div>
              <div style={{ fontSize: '2rem', fontWeight: 300, color: '#111', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{s.val}</div>
              <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: 500 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Tabela de Indicações */}
        <div className="editorial-title">Fluxo de Negócios</div>
        <div style={{ background: '#fff', border: '1px solid var(--border)', padding: '3rem', marginBottom: '5rem', overflowX: 'auto' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
            <h3 style={{ fontWeight: 300, fontSize: '1.8rem', letterSpacing: '-0.02em' }}>Acompanhamento</h3>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <select 
                className="input-field"
                style={{ width: 'auto', padding: '0.75rem 1rem', minWidth: '150px' }}
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Todos os Status</option>
                <option value="PENDENTE">Pendentes</option>
                <option value="CONTATADO">Contatados</option>
                <option value="FECHADO">Fechados</option>
              </select>
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                className="input-field"
                style={{ width: '250px', padding: '0.75rem 1rem' }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                <th style={{ padding: '1rem 0', fontWeight: 600 }}>Data</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Indicado Por</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Recebeu Ind.</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Cliente</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Valor (R$)</th>
                <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Ações / Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredIndicacoes?.length > 0 ? filteredIndicacoes.map((ind: any) => (
                <AdminTableRow key={ind.id} ind={ind} isAdmin={isAdmin} />
              )) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#888', fontSize: '0.9rem' }}>Nenhum registro encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Rankings */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
          
          {/* Top Indicadores por Quantidade */}
          <div>
            <div className="editorial-title">Liderança em Volume</div>
            <div className="arch-card">
              <h3 style={{ fontWeight: 300, marginBottom: '3rem', fontSize: '1.5rem', letterSpacing: '-0.02em' }}>Ranking de Indicações</h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {data.maisIndicados.length > 0 ? data.maisIndicados.map((item: any) => (
                  <div key={item.pos} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <span style={{ fontWeight: 300, color: '#aaa', fontSize: '1.2rem' }}>{String(item.pos).padStart(2, '0')}</span>
                      <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{item.nome}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#111', fontSize: '0.9rem' }}>{item.pts} pts</span>
                  </div>
                )) : <p style={{ fontSize: '0.85rem', color: '#888' }}>Nenhuma indicação ainda.</p>}
              </div>
            </div>
          </div>

          {/* Top Geradores de Valor */}
          <div>
            <div className="editorial-title">Liderança Financeira</div>
            <div className="arch-card" style={{ background: '#111', color: '#fff', border: 'none' }}>
              <h3 style={{ fontWeight: 300, marginBottom: '3rem', fontSize: '1.5rem', letterSpacing: '-0.02em' }}>Ranking por Valor</h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {data.maioresValores.length > 0 ? data.maioresValores.map((item: any) => (
                  <div key={item.pos} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <span style={{ fontWeight: 300, color: '#666', fontSize: '1.2rem' }}>{String(item.pos).padStart(2, '0')}</span>
                      <span style={{ fontWeight: 400, fontSize: '0.95rem' }}>{item.nome}</span>
                    </div>
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
                    </span>
                  </div>
                )) : <p style={{ fontSize: '0.85rem', color: '#666' }}>Nenhum negócio fechado ainda.</p>}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
