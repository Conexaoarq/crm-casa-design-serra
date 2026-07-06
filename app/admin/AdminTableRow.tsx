'use client';

import { useState } from 'react';
import { atualizarStatusIndicacao, fecharNegocioDireto, editarIndicacaoCompleta, excluirIndicacao } from '@/lib/actions';
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

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja EXCLUIR essa indicação permanentemente?")) {
      setLoading(true);
      await excluirIndicacao(ind.id);
      router.refresh();
      setLoading(false);
    }
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
    <tr style={{ backgroundColor: '#fff', borderBottom: '1px solid var(--border)', transition: 'all 0.2s' }}>
      <td style={{ padding: '1.25rem 1rem', fontSize: '0.85rem' }}>
        {new Date(ind.createdAt).toLocaleDateString('pt-BR')}
      </td>
      <td style={{ padding: '1.25rem 1rem', fontWeight: 600, fontSize: '0.85rem' }}>
        {ind.fromUserName}
      </td>
      <td style={{ padding: '1.25rem 1rem', fontWeight: 600, fontSize: '0.85rem', color: ind.toUserName ? '#111' : '#888' }}>
        {ind.toUserName || 'Grupo Aberto'}
      </td>
      <td style={{ padding: '1.25rem 1rem', fontSize: '0.85rem' }}>
        <div style={{ fontWeight: 600 }}>{ind.clientName}</div>
        <div style={{ fontSize: '0.75rem', color: '#888' }}>{ind.clientPhone || 'Sem tel.'}</div>
      </td>
      <td style={{ padding: '1.25rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Botão CONTATO */}
          <button
            onClick={!ind.contactMade ? handleMarcarContato : undefined}
            disabled={ind.contactMade || loadingContact}
            style={{ 
              padding: '0.4rem 0.8rem', 
              borderRadius: '0px', 
              fontSize: '0.7rem', 
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              backgroundColor: ind.contactMade ? '#fafafa' : '#fff',
              color: ind.contactMade ? '#888' : '#111',
              border: '1px solid var(--border)',
              cursor: ind.contactMade ? 'default' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            {ind.contactMade && <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#111' }}></div>}
            {loadingContact ? '...' : ind.contactMade ? 'Contatado' : 'Contatar'}
          </button>

          {/* Botão FECHADO */}
          <button
            onClick={() => !isClosed && setShowValueInput(!showValueInput)}
            disabled={isClosed}
            style={{ 
              padding: '0.4rem 0.8rem', 
              borderRadius: '0px', 
              fontSize: '0.7rem', 
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              backgroundColor: isClosed ? '#fafafa' : showValueInput ? '#f4f4f5' : '#fff',
              color: isClosed ? '#888' : '#111',
              border: '1px solid var(--border)',
              cursor: isClosed ? 'default' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            {isClosed && <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#111' }}></div>}
            {isClosed ? 'Fechado' : 'Registrar'}
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
                  border: '1px solid var(--border)',
                  borderRadius: '0px',
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
                backgroundColor: '#111',
                color: '#fff',
                border: 'none',
                borderRadius: '0px',
                fontSize: '0.7rem',
                fontWeight: 600,
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
                border: '1px solid var(--border)',
                borderRadius: '0px',
                fontSize: '0.7rem',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        )}
      </td>
      <td style={{ padding: '1.25rem 1rem', fontWeight: 600, fontSize: '0.85rem' }}>
        {ind.closedValue ? 
          <span style={{ color: '#111' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ind.closedValue)}
          </span> : 
          <span style={{ color: '#ccc' }}>-</span>
        }
      </td>
      <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setIsEditing(true)}
              style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#666', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}
            >
              EDITAR
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#666', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}
            >
              EXCLUIR
            </button>
          </div>
        )}

      {isEditing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '3rem', borderRadius: '0px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '2rem', fontWeight: 300, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>Editar Indicação</h3>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '0.5rem' }}>Nome do Cliente</label>
                <input required value={editForm.clientName} onChange={e => setEditForm({...editForm, clientName: e.target.value})} className="input-field" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '0.5rem' }}>Telefone</label>
                <input value={editForm.clientPhone} onChange={e => setEditForm({...editForm, clientPhone: e.target.value})} className="input-field" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '0.5rem' }}>Arquiteto</label>
                <input value={editForm.architectName} onChange={e => setEditForm({...editForm, architectName: e.target.value})} className="input-field" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '0.5rem' }}>Detalhes do Projeto</label>
                <textarea rows={3} value={editForm.projectDetails} onChange={e => setEditForm({...editForm, projectDetails: e.target.value})} className="input-field" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '0.5rem' }}>Status</label>
                <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="input-field">
                  <option value="PENDING">Pendente</option>
                  <option value="CONTACTED">Contatado</option>
                  <option value="QUOTED">Orçado</option>
                  <option value="CLOSED_WON">Fechado / Ganho</option>
                  <option value="CLOSED_LOST">Perdido</option>
                </select>
              </div>
              {editForm.status === 'CLOSED_WON' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '0.5rem' }}>Valor Fechado (R$)</label>
                  <input type="number" step="0.01" value={editForm.closedValue} onChange={e => setEditForm({...editForm, closedValue: e.target.value})} className="input-field" />
                </div>
              )}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1 }}>
                  {loading ? 'Salvando...' : 'SALVAR'}
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="btn-outline" style={{ flex: 1 }}>
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
