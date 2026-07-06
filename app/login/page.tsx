'use client';

import { useState, useEffect, Suspense, useRef } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const loginAttempted = useRef(false);

  // Efeito para auto-login se vier com inviteToken
  useEffect(() => {
    const inviteToken = searchParams.get('inviteToken');
    const inviteEmail = searchParams.get('email');

    if (inviteToken && inviteEmail && !loginAttempted.current) {
      loginAttempted.current = true;
      setLoading(true);
      signIn('credentials', { 
        email: inviteEmail, 
        inviteToken: inviteToken, 
        redirect: true, 
        callbackUrl: '/' 
      });
    }
    
    // Tratamento de erros vindo da rota de invite
    const urlError = searchParams.get('error');
    if (urlError === 'ExpiredLink') setError('Este link de convite já expirou.');
    if (urlError === 'InvalidLink') setError('Link de convite inválido.');
  }, [searchParams]);

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
      window.location.href = '/admin';
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
            {searchParams.get('inviteToken') ? 'Validando Acesso...' : 'Acesso do Administrador'}
          </h1>
          <p style={{ color: '#aaa', fontSize: '0.875rem', marginBottom: '2.5rem', textAlign: 'center' }}>
            {searchParams.get('inviteToken') ? 'Por favor, aguarde um instante.' : 'Digite suas credenciais para gerenciar a plataforma.'}
          </p>

          {error && (
            <div style={{ padding: '0.75rem', backgroundColor: '#fff1f1', color: '#c00', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid #ffcccc' }}>
              {error}
            </div>
          )}

          {!searchParams.get('inviteToken') && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#000', marginBottom: '0.5rem', textTransform: 'uppercase' }}>E-mail Administrativo</label>
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
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#000', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Senha de Segurança</label>
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
                {loading ? 'AUTENTICANDO...' : 'ACESSAR DASHBOARD'}
              </button>
            </form>
          )}

          {searchParams.get('inviteToken') && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #000', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
              <p style={{ fontWeight: 600 }}>Entrando no sistema...</p>
            </div>
          )}
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
