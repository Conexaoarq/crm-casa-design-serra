'use client';

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MinhasIndicacoesClient({ recebidas, enviadas }: { recebidas: any[], enviadas: any[] }) {
  const [tab, setTab] = useState<'recebidas' | 'enviadas'>('recebidas');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return { bg: '#fef3c7', color: '#92400e', label: 'Pendente' };
      case 'CONTACTED': return { bg: '#e0e7ff', color: '#3730a3', label: 'Contatado' };
      case 'QUOTED': return { bg: '#dbeafe', color: '#1e40af', label: 'Orçamento' };
      case 'CLOSED_WON': return { bg: '#dcfce7', color: '#166534', label: 'Fechado' };
      case 'CLOSED_LOST': return { bg: '#fee2e2', color: '#991b1b', label: 'Perdido' };
      default: return { bg: '#f3f4f6', color: '#374151', label: status };
    }
  };

  const currentList = tab === 'recebidas' ? recebidas : enviadas;

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '5rem', paddingTop: '3rem' }}>
      <h1 style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)', fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#111', marginBottom: '0.5rem' }}>
        Minhas <strong style={{ fontWeight: 800 }}>Indicações.</strong>
      </h1>
      <p style={{ color: '#666', marginBottom: '3rem', fontSize: '0.9rem' }}>
        Acompanhe os clientes que foram indicados para você e as indicações que você enviou.
      </p>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
        <button 
          onClick={() => setTab('recebidas')}
          style={{ 
            padding: '1rem 2rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: tab === 'recebidas' ? '2px solid #111' : '2px solid transparent',
            color: tab === 'recebidas' ? '#111' : '#888',
            fontWeight: tab === 'recebidas' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Indicações Recebidas ({recebidas.length})
        </button>
        <button 
          onClick={() => setTab('enviadas')}
          style={{ 
            padding: '1rem 2rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: tab === 'enviadas' ? '2px solid #111' : '2px solid transparent',
            color: tab === 'enviadas' ? '#111' : '#888',
            fontWeight: tab === 'enviadas' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Indicações Enviadas ({enviadas.length})
        </button>
      </div>

      {/* LISTA */}
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {currentList.length === 0 ? (
          <div className="arch-card" style={{ textAlign: 'center', padding: '4rem 2rem', color: '#666' }}>
            <p>Você ainda não possui indicações {tab === 'recebidas' ? 'recebidas' : 'enviadas'}.</p>
            {tab === 'enviadas' && (
              <Link href="/indicacao/nova" className="btn-primary" style={{ display: 'inline-block', marginTop: '1.5rem' }}>
                Fazer uma indicação
              </Link>
            )}
          </div>
        ) : (
          currentList.map((item) => (
            <div key={item.id} className="arch-card" style={{ borderLeft: `4px solid ${tab === 'recebidas' ? '#111' : '#888'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
                    {format(new Date(item.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                  </div>
                  
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#111' }}>
                    Cliente: {item.clientName}
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                    {item.clientPhone && (
                      <div><strong>Telefone:</strong> <a href={`https://wa.me/55${item.clientPhone.replace(/\D/g,'')}`} target="_blank" style={{ color: '#111', textDecoration: 'underline' }}>{item.clientPhone}</a></div>
                    )}
                    {item.projectDetails && (
                      <div><strong>Projeto/Obra:</strong> {item.projectDetails}</div>
                    )}
                    {item.architectName && (
                      <div><strong>Arquiteto:</strong> {item.architectName}</div>
                    )}
                    
                    {tab === 'recebidas' ? (
                      <div style={{ marginTop: '0.5rem', color: '#555' }}>
                        <strong>Indicado por:</strong> {item.fromUser?.companyName || item.fromUser?.email || 'Membro do Grupo'}
                      </div>
                    ) : (
                      <div style={{ marginTop: '0.5rem', color: '#555' }}>
                        <strong>Indicado para:</strong> {item.toUser?.companyName || 'Pedido Aberto (Todos)'}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                  <span style={{ 
                    padding: '6px 12px', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    backgroundColor: getStatusColor(item.status).bg,
                    color: getStatusColor(item.status).color
                  }}>
                    {getStatusColor(item.status).label}
                  </span>
                </div>

              </div>

              {item.status === 'PENDING' && tab === 'recebidas' && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: '#666' }}>
                  💡 Entre em contato com o cliente o mais breve possível para não perder o timing!
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
