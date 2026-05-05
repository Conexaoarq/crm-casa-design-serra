'use client';

import Link from "next/link";
import { useState } from "react";
import { registrarNegocioFechado } from "@/lib/actions";

const COMPANIES = [
  "Amma design", "AZ", "Betonart", "Cammino Pedras", "DCA", "Duo Mobile", 
  "Ecobraum", "Farrapos Premium", "Felesa Churrasqueiras", "Futura Luz", 
  "Gregory Volpato", "HPOOL", "Jornal Serra Design", "Linda Flores", 
  "Moderna Automação", "Nolan Collection", "Ombra", "Prima Cor", 
  "Sole Aquecimento", "Triade", "Valen Esquadrias", "Willam Camargo Fotografia",
  // Espaços reservados para completar 40
  "Membro 23", "Membro 24", "Membro 25", "Membro 26", "Membro 27", 
  "Membro 28", "Membro 29", "Membro 30", "Membro 31", "Membro 32", 
  "Membro 33", "Membro 34", "Membro 35", "Membro 36", "Membro 37", 
  "Membro 38", "Membro 39", "Membro 40"
];

export default function NegocioFechado() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      const result = await registrarNegocioFechado(formData);
      if (result.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError('Ocorreu um erro ao registrar o negócio. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Negócio Registrado!</h2>
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem', textAlign: 'center' }}>
          Parabéns! O valor foi adicionado às métricas da Casa Design Serra. O grupo será notificado dessa vitória (sem revelar valores)!
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
          Registrar Negócio Fechado
        </h1>
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '2.5rem' }}>
          Fechou uma venda graças a uma conexão do grupo? Registre o valor aqui para somarmos aos resultados da Casa Design.
        </p>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius)', color: '#991b1b', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius)', backgroundColor: 'var(--background)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Quem te deu essa indicação?</label>
              <select name="fromCompany" className="input-field" required defaultValue="">
                <option value="" disabled>Selecione a empresa ou membro...</option>
                {COMPANIES.map((company, index) => (
                  <option key={index} value={company}>{company}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Nome do Cliente Final</label>
              <input name="clientName" type="text" className="input-field" placeholder="Ex: João da Silva / Condomínio X" required />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Valor Fechado (R$)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', fontWeight: 500 }}>R$</span>
                <input name="value" type="number" step="0.01" min="0" className="input-field" style={{ paddingLeft: '2.5rem' }} placeholder="0,00" required />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>* Este valor é sigiloso. Ninguém do grupo verá, ele apenas entra na soma total do coworking.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Mensagem de Agradecimento (Opcional)</label>
              <textarea name="message" className="input-field" placeholder="Deixe um recado rápido para a pessoa que te indicou..." rows={3}></textarea>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', backgroundColor: '#000000' }} disabled={loading}>
                {loading ? 'Processando...' : 'Salvar Negócio e Agradecer'}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
