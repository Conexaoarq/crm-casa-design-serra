'use client';

import { useState } from 'react';
import { atualizarStatusIndicacao, fecharNegocioDireto } from '@/lib/actions';
import { useRouter } from 'next/navigation';

interface IndicacaoRow {
  id: string;
  createdAt: string;
  fromUserName: string;
  toUserName: string | null;
  clientName: string;
  clientPhone: string | null;
  contactMade: boolean;
  budgetGenerated: boolean;
  status: string;
  closedValue: number | null;
}

export default function AdminTableRow({ ind }: { ind: IndicacaoRow }) {
  const router = useRouter();
  const [showValueInput, setShowValueInput] = useState(false);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingContact, setLoadingContact] = useState(false);

  const handleMarcarContato = async () => {
    setLoadingContact(true);
    await atualizarStatusIndicacao(ind.id, { contactMade: true });
    router.refresh();
    setLoadingContact(false);
  };

  const handleFecharNegocio = async () => {
    if (!value || parseFloat(value) <= 0) return;
    setLoading(true);
    const result = await fecharNegocioDireto(ind.id, parseFloat(value));
    if (result.success) {
      setShowValueInput(false);
      router.refresh();
    }
    setLoading(false);
  };

  const isClosed = ind.status === 'CLOSED_WON' || ind.closedValue !== null;

  return (
    <tr style={{ backgroundColor: '#fcfcfc', transition: 'all 0.2s' }}>
      <td style={{ padding: '1.25rem 1rem', borderRadius: '12px 0 0 12px', fontSize: '0.875rem' }}>
        {new Date(ind.createdAt).toLocaleDateString('pt-BR')}
      </td>
      <td style={{ padding: '1.25rem 1rem', fontWeight: 600, fontSize: '0.875rem' }}>
        {ind.fromUserName}
      </td>
      <td style={{ padding: '1.25rem 1rem', fontWeight: 600, fontSize: '0.875rem', color: ind.toUserName ? '#000' : '#888' }}>
        {ind.toUserName || 'Grupo Aberto'}
      </td>
      <td style={{ padding: '1.25rem 1rem', fontSize: '0.875rem' }}>
        <div style={{ fontWeight: 700 }}>{ind.clientName}</div>
        <div style={{ fontSize: '0.75rem', color: '#888' }}>{ind.clientPhone || 'Sem tel.'}</div>
      </td>
      <td style={{ padding: '1.25rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Botão CONTATO - clicável para marcar */}
          <button
            onClick={!ind.contactMade ? handleMarcarContato : undefined}
            disabled={ind.contactMade || loadingContact}
            style={{ 
              padding: '0.3rem 0.75rem', 
              borderRadius: '100px', 
              fontSize: '0.7rem', 
              fontWeight: 800,
              backgroundColor: ind.contactMade ? '#e6fffa' : '#f5f5f5',
              color: ind.contactMade ? '#0694a2' : '#aaa',
              border: ind.contactMade ? '1px solid #b2f5ea' : '1px solid #e0e0e0',
              cursor: ind.contactMade ? 'default' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loadingContact ? '...' : ind.contactMade ? '✓ CONTATO' : 'CONTATO'}
          </button>

          {/* Botão FECHADO - clicável para abrir campo de valor */}
          <button
            onClick={() => !isClosed && setShowValueInput(!showValueInput)}
            disabled={isClosed}
            style={{ 
              padding: '0.3rem 0.75rem', 
              borderRadius: '100px', 
              fontSize: '0.7rem', 
              fontWeight: 800,
              backgroundColor: isClosed ? '#f0fdf4' : showValueInput ? '#fffbeb' : '#f5f5f5',
              color: isClosed ? '#15803d' : showValueInput ? '#92400e' : '#aaa',
              border: isClosed ? '1px solid #bbf7d0' : showValueInput ? '1px solid #fde68a' : '1px solid #e0e0e0',
              cursor: isClosed ? 'default' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {isClosed ? '✓ FECHADO' : 'FECHADO'}
          </button>
        </div>

        {/* Campo inline para informar valor */}
        {showValueInput && !isClosed && (
          <div style={{ 
            marginTop: '0.75rem', 
            display: 'flex', 
            gap: '0.5rem', 
            alignItems: 'center',
            animation: 'fadeIn 0.2s ease-in'
          }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ 
                position: 'absolute', 
                left: '0.5rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#888', 
                fontSize: '0.75rem',
                fontWeight: 600 
              }}>R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.4rem 0.5rem 0.4rem 2rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>
            <button
              onClick={handleFecharNegocio}
              disabled={loading || !value}
              style={{
                padding: '0.4rem 0.75rem',
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.7rem',
                fontWeight: 800,
                cursor: loading || !value ? 'not-allowed' : 'pointer',
                opacity: loading || !value ? 0.5 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {loading ? '...' : 'SALVAR'}
            </button>
            <button
              onClick={() => { setShowValueInput(false); setValue(''); }}
              style={{
                padding: '0.4rem 0.5rem',
                backgroundColor: 'transparent',
                color: '#888',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '0.7rem',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        )}
      </td>
      <td style={{ padding: '1.25rem 1rem', fontWeight: 800, fontSize: '0.875rem' }}>
        {ind.closedValue ? 
          <span style={{ color: '#15803d' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ind.closedValue)}
          </span> : 
          '-'
        }
      </td>
      <td style={{ padding: '1.25rem 1rem', borderRadius: '0 12px 12px 0' }}>
        {!ind.contactMade && (
          <button 
            onClick={handleMarcarContato} 
            disabled={loadingContact}
            style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#000', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'underline' }}
          >
            {loadingContact ? 'Salvando...' : 'MARCAR CONTATO'}
          </button>
        )}
        {ind.contactMade && !isClosed && (
          <button
            onClick={() => setShowValueInput(true)}
            style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#15803d', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'underline' }}
          >
            REGISTRAR VALOR
          </button>
        )}
        {isClosed && (
          <span style={{ color: '#15803d', fontSize: '0.75rem', fontWeight: 700 }}>✓ Concluído</span>
        )}
      </td>
    </tr>
  );
}
