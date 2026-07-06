'use client';

import { useState } from 'react';
import { atualizarStatusIndicacao, fecharNegocioDireto, editarIndicacaoCompleta } from '@/lib/actions';
import { useRouter } from 'next/navigation';

interface IndicacaoRow {
  id: string;
  createdAt: string;
  fromUserName: string;
  toUserName: string | null;
  clientName: string;
  clientPhone: string | null;
  projectDetails: string;
  architectName: string;
  contactMade: boolean;
  budgetGenerated: boolean;
  status: string;
  closedValue: number | null;
}

export default function AdminTableRow({ ind, isAdmin }: { ind: IndicacaoRow, isAdmin?: boolean }) {
  const router = useRouter();
  const [showValueInput, setShowValueInput] = useState(false);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingContact, setLoadingContact] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    clientName: ind.clientName || '',
    clientPhone: ind.clientPhone || '',
    projectDetails: ind.projectDetails || '',
    architectName: ind.architectName || '',
    status: ind.status || 'PENDING',
    closedValue: ind.closedValue || '',
  });

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await editarIndicacaoCompleta(ind.id, {
      ...editForm,
      closedValue: editForm.closedValue ? parseFloat(editForm.closedValue as string) : null
    });
    setIsEditing(false);
    router.refresh();
    setLoading(false);
  };

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
        {isAdmin && (
          <button
            onClick={() => setIsEditing(true)}
            style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#92400e', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'underline', marginRight: '0.5rem', padding: 0 }}
          >
            EDITAR
          </button>
        )}
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

      {isEditing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Editar Indicação</h3>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Nome do Cliente</label>
                <input required value={editForm.clientName} onChange={e => setEditForm({...editForm, clientName: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Telefone do Cliente</label>
                <input value={editForm.clientPhone} onChange={e => setEditForm({...editForm, clientPhone: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Arquiteto</label>
                <input value={editForm.architectName} onChange={e => setEditForm({...editForm, architectName: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Detalhes do Projeto</label>
                <textarea rows={3} value={editForm.projectDetails} onChange={e => setEditForm({...editForm, projectDetails: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Status</label>
                <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}>
                  <option value="PENDING">Pendente</option>
                  <option value="CONTACTED">Contatado</option>
                  <option value="QUOTED">Orçado</option>
                  <option value="CLOSED_WON">Fechado / Ganho</option>
                  <option value="CLOSED_LOST">Perdido</option>
                </select>
              </div>
              {editForm.status === 'CLOSED_WON' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Valor Fechado (R$)</label>
                  <input type="number" step="0.01" value={editForm.closedValue} onChange={e => setEditForm({...editForm, closedValue: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
              )}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Salvando...' : 'SALVAR'}
                </button>
                <button type="button" onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#f5f5f5', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </td>
    </tr>
  );
}
