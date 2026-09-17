'use client';

import { useState } from "react";
import { editMembro, deleteMembro, toggleConselheiro, enviarConvite } from "./actions";

export default function MembroTableRow({ membro }: { membro: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState(membro.email);
  const [companyName, setCompanyName] = useState(membro.companyName || '');

  const handleSave = async () => {
    const res = await editMembro(membro.id, email, companyName);
    if (res?.success) {
      setIsEditing(false);
    } else {
      alert(res?.error || "Erro ao salvar");
    }
  };

  if (isEditing) {
    return (
      <tr style={{ borderBottom: '1px solid var(--border)' }}>
        <td style={{ padding: '1.5rem' }}>
          <input 
            type="text" 
            value={companyName} 
            onChange={e => setCompanyName(e.target.value)}
            className="input-field"
            style={{ padding: '0.4rem', fontSize: '0.9rem', width: '100%' }}
          />
        </td>
        <td style={{ padding: '1.5rem' }}>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            className="input-field"
            style={{ padding: '0.4rem', fontSize: '0.9rem', width: '100%' }}
          />
        </td>
        <td style={{ padding: '1.5rem', textAlign: 'center' }}>
          <span style={{ 
            fontSize: '0.7rem', padding: '4px 8px', borderRadius: '2px', 
            backgroundColor: membro.role === 'ADMIN' ? '#111' : membro.role === 'CONSELHEIRO' ? '#fafafa' : '#fff', 
            border: membro.role === 'ADMIN' ? '1px solid #111' : '1px solid var(--border)',
            color: membro.role === 'ADMIN' ? '#fff' : '#111', fontWeight: 600, letterSpacing: '0.05em'
          }}>
            {membro.role}
          </span>
        </td>
        <td style={{ padding: '1.5rem', textAlign: 'right' }}>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button onClick={handleSave} style={{ 
              backgroundColor: '#111', color: '#fff', border: 'none', cursor: 'pointer', 
              fontSize: '0.7rem', padding: '0.4rem 0.8rem', fontWeight: 600, textTransform: 'uppercase'
            }}>Salvar</button>
            <button onClick={() => setIsEditing(false)} style={{ 
              background: 'none', color: '#888', border: '1px solid var(--border)', cursor: 'pointer', 
              fontSize: '0.7rem', padding: '0.4rem 0.8rem', fontWeight: 600, textTransform: 'uppercase'
            }}>Cancelar</button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      <td style={{ padding: '1.5rem', fontWeight: 600, fontSize: '0.9rem' }}>{membro.companyName || '---'}</td>
      <td style={{ padding: '1.5rem', color: '#666', fontSize: '0.9rem' }}>{membro.email}</td>
      <td style={{ padding: '1.5rem', textAlign: 'center' }}>
        <span style={{ 
          fontSize: '0.7rem', padding: '4px 8px', borderRadius: '2px', 
          backgroundColor: membro.role === 'ADMIN' ? '#111' : membro.role === 'CONSELHEIRO' ? '#fafafa' : '#fff', 
          border: membro.role === 'ADMIN' ? '1px solid #111' : '1px solid var(--border)',
          color: membro.role === 'ADMIN' ? '#fff' : '#111', fontWeight: 600, letterSpacing: '0.05em'
        }}>
          {membro.role}
        </span>
      </td>
      <td style={{ padding: '1.5rem', textAlign: 'right' }}>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          
          {membro.role !== 'ADMIN' && (
            <button onClick={() => toggleConselheiro(membro.id, membro.role)} style={{ 
              fontSize: '0.7rem', padding: '0.4rem 0.8rem', borderRadius: '0px',
              border: '1px solid var(--border)', backgroundColor: membro.role === 'CONSELHEIRO' ? '#f4f4f5' : 'transparent',
              color: membro.role === 'CONSELHEIRO' ? '#111' : '#888', cursor: 'pointer', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
              {membro.role === 'CONSELHEIRO' ? 'Remover Conselheiro' : 'Tornar Conselheiro'}
            </button>
          )}

          {membro.role !== 'ADMIN' && (
            <button onClick={() => enviarConvite(membro.email!)} className="btn-outline" style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem' }}>
              ENVIAR ACESSO
            </button>
          )}

          {membro.role !== 'ADMIN' && (
            <button onClick={() => setIsEditing(true)} style={{ color: '#111', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Editar
            </button>
          )}

          {membro.email !== 'casadesignserra639@gmail.com' && membro.email !== 'aabergamo@gmail.com' && (
            <button onClick={() => deleteMembro(membro.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Excluir
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
