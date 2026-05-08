'use client';

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Autenticação por credenciais (E-mail e Senha)
    const result = await signIn('credentials', { 
      email, 
      password, 
      redirect: false,
    });
    
    if (result?.error) {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.');
      setLoading(false);
    } else {
      // Redirecionamento forçado para a área de gestão
      window.location.href = '/admin';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f8f9fa',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '400px', 
        width: '100%', 
        padding: '40px', 
        backgroundColor: '#fff', 
        borderRadius: '20px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '10px', color: '#000' }}>CASA DESIGN SERRA - GESTÃO</h2>
        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '30px' }}>Acesso Exclusivo à Dashboard</p>

        {error && (
          <div style={{ padding: '10px', backgroundColor: '#fff0f0', color: '#d00', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '20px', border: '1px solid #ffd0d0' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#555' }}>E-mail</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#555' }}>Senha</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit" style={{ 
            width: '100%', 
            padding: '14px', 
            borderRadius: '8px', 
            backgroundColor: '#000', 
            color: '#fff', 
            fontWeight: 700, 
            border: 'none', 
            marginTop: '10px',
            cursor: 'pointer'
          }} disabled={loading}>
            {loading ? 'AUTENTICANDO...' : 'ENTRAR NO PAINEL'}
          </button>
        </form>
      </div>
    </div>
  );
}
