'use client';

import Link from "next/link";
import { useState } from "react";
import { pedirLead } from "@/lib/actions";

export default function PedirIndicacao() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      const result = await pedirLead(formData);
      if (result.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError('Ocorreu um erro ao enviar o pedido. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Pedido Lançado!</h2>
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem', textAlign: 'center' }}>
          A sua necessidade de conexão foi registrada. O grupo será notificado!
        </p>
        <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>
          Voltar para o Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)', textDecoration: 'none', marginBottom: '2rem', fontWeight: 500 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Voltar
        </Link>

        <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
          Quero um Lead Quente!
        </h1>
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '2.5rem' }}>
          Explique para o grupo exatamente o perfil ou a pessoa específica que você está buscando para o seu negócio.
        </p>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius)', color: '#991b1b', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius)', backgroundColor: 'var(--background)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>O que você está procurando?</label>
              <textarea name="whatLookingFor" className="input-field" placeholder="Ex: Procuro contato com gerentes de construtoras, ou procuro o dono da loja X..." rows={3} required></textarea>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Como essa pessoa pode te ajudar?</label>
              <textarea name="howCanHelp" className="input-field" placeholder="Para oferecer meus serviços de automação, propor uma parceria, etc..." rows={3} required></textarea>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={loading}>
                {loading ? 'Processando...' : 'Lançar Pedido para o Grupo'}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
