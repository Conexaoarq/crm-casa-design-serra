'use client';

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(true); // Começa no modo admin por padrão agora

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await signIn('credentials', { 
      email, 
      password, 
      redirect: true, 
      callbackUrl: '/admin' 
    });
    
    setLoading(false);
  };

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <div style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}>

        <div style={{ marginBottom: '3rem' }}>
          <div style={{ fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
            CASA DESIGN <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>SERRA</span>
          </div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '1rem' }}>
            Plataforma Exclusiva de Multiplicação.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius)', backgroundColor: 'var(--background)' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Acesso Restrito
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Entre com suas credenciais de administrador.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <input 
              type="email" 
              className="input-field" 
              placeholder="E-mail do Gestor" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ textAlign: 'center', padding: '1rem' }}
            />
            
            <input 
              type="password" 
              className="input-field" 
              placeholder="Sua senha" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ textAlign: 'center', padding: '1rem' }}
            />

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={loading}>
              {loading ? 'Validando...' : 'ACESSAR PAINEL'}
            </button>
          </form>
        </div>

        <p style={{ marginTop: '2rem', color: 'var(--muted-foreground)', fontSize: '0.8rem' }}>
          O acesso para membros é enviado exclusivamente pela diretoria.
        </p>
      </div>
    </div>
  );
}
