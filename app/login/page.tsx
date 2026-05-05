'use client';

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn('email', { email, callbackUrl: '/' });
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Verifique seu E-mail!</h2>
        <p style={{ color: 'var(--muted-foreground)', maxWidth: '400px', lineHeight: 1.6 }}>
          Enviamos um <strong>link mágico</strong> para <strong>{email}</strong>. 
          Clique no botão dentro do e-mail para acessar a plataforma. Você ficará logado por 3 meses!
        </p>
        <p style={{ color: 'var(--muted-foreground)', marginTop: '2rem', fontSize: '0.875rem' }}>
          Não recebeu? Verifique sua pasta de spam ou tente novamente.
        </p>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <div style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}>

        <div style={{ marginBottom: '3rem' }}>
          <div style={{ fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
            CASA DESIGN <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>SERRA</span>
          </div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '1rem' }}>
            Acesse a plataforma de multiplicação de negócios.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius)', backgroundColor: 'var(--background)' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Entrar</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Digite seu e-mail corporativo para receber o link de acesso.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <input 
              type="email" 
              className="input-field" 
              placeholder="seu@email.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ textAlign: 'center', padding: '1rem' }}
            />
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Link Mágico'}
            </button>
          </form>
        </div>

        <p style={{ marginTop: '2rem', color: 'var(--muted-foreground)', fontSize: '0.75rem' }}>
          Ao acessar, você concorda com as políticas de privacidade da Casa Design Serra (LGPD).
        </p>
      </div>
    </div>
  );
}
