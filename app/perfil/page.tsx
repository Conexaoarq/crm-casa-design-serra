'use client';

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { mudarSenha } from "@/lib/actions";

export default function Perfil() {
  const { data: session } = useSession();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [mensagem, setMensagem] = useState({ texto: '', erro: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email) return;

    setLoading(true);
    setMensagem({ texto: '', erro: false });

    try {
      const res = await mudarSenha(session.user.email, senhaAtual, novaSenha);
      if (res.sucesso) {
        setMensagem({ texto: 'Senha alterada com sucesso!', erro: false });
        setSenhaAtual('');
        setNovaSenha('');
      } else {
        setMensagem({ texto: res.erro || 'Erro ao alterar senha', erro: true });
      }
    } catch (err) {
      setMensagem({ texto: 'Erro interno', erro: true });
    }
    
    setLoading(false);
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '4rem', paddingTop: '4rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 300, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
        Minha <strong style={{ fontWeight: 800 }}>Conta</strong>
      </h1>
      <p style={{ color: '#666', marginBottom: '3rem' }}>Gerencie seus dados de acesso.</p>

      <div className="arch-card" style={{ maxWidth: '500px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem' }}>Trocar Senha</h3>
        
        {mensagem.texto && (
          <div style={{ 
            padding: '1rem', 
            marginBottom: '1.5rem', 
            borderRadius: '8px', 
            backgroundColor: mensagem.erro ? '#fff1f1' : '#f0fdf4',
            color: mensagem.erro ? '#c00' : '#166534',
            border: `1px solid ${mensagem.erro ? '#ffcccc' : '#bbf7d0'}`
          }}>
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Senha Atual</label>
            <input 
              type="password" 
              required
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', border: '1px solid #e5e5e5', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Nova Senha</label>
            <input 
              type="password" 
              required
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', border: '1px solid #e5e5e5', outline: 'none' }}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem', width: '100%' }}>
            {loading ? 'Salvando...' : 'Salvar Nova Senha'}
          </button>
        </form>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{ 
              background: 'transparent', 
              border: '1px solid #ccc', 
              color: '#333', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '8px', 
              fontWeight: 600, 
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Sair da Conta (Logout)
          </button>
        </div>
      </div>
    </div>
  );
}
