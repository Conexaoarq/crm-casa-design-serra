'use client';

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await signIn('credentials', { 
      email, 
      password, 
      redirect: false,
    });
    
    if (result?.error) {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.');
      setLoading(false);
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'radial-gradient(circle at top right, #fdfdfd, #f5f5f5)',
      padding: '20px',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ maxWidth: '450px', width: '100%' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ 
            fontWeight: 800, 
            fontSize: '2.25rem', 
            letterSpacing: '-0.05em', 
            color: '#000',
            textTransform: 'uppercase'
          }}>
            CASA DESIGN <span style={{ fontWeight: 300, color: '#666' }}>SERRA</span>
          </div>
          <div style={{ 
            height: '2px', 
            width: '40px', 
            backgroundColor: '#000', 
            margin: '1rem auto' 
          }}></div>
          <p style={{ color: '#888', fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.05em' }}>
            SISTEMA DE GESTÃO EXCLUSIVO
          </p>
        </div>

        <div style={{ 
          backgroundColor: '#ffffff', 
          padding: '3rem', 
          borderRadius: '24px', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)',
          border: '1px solid #f0f0f0'
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>
            Acesso ao Sistema
          </h1>
          <p style={{ color: '#aaa', fontSize: '0.875rem', marginBottom: '2.5rem', textAlign: 'center' }}>
            Digite seu e-mail e senha para acessar a plataforma.
          </p>

          {error && (
            <div style={{ padding: '0.75rem', backgroundColor: '#fff1f1', color: '#c00', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid #ffcccc' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#000', marginBottom: '0.5rem', textTransform: 'uppercase' }}>E-mail de Acesso</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@casadesign.com"
                style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  border: '1px solid #e5e5e5', 
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#000', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Senha</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  border: '1px solid #e5e5e5', 
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button type="submit" style={{ 
              width: '100%', 
              padding: '1.125rem', 
              borderRadius: '12px',
              backgroundColor: '#000',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              marginTop: '1rem',
              transition: 'opacity 0.2s'
            }} disabled={loading}>
              {loading ? 'AUTENTICANDO...' : 'ACESSAR PLATAFORMA'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <p style={{ color: '#bbb', fontSize: '0.75rem', letterSpacing: '0.025em' }}>
            CASA DESIGN SERRA • CRM EXCLUSIVO • 2024
          </p>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
