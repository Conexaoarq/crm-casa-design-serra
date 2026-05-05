'use client';

import Link from "next/link";
import { useState } from "react";
import { criarIndicacao } from "@/lib/actions";

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

export default function NovaIndicacao() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const result = await criarIndicacao(formData);
      
      if (result.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError('Ocorreu um erro ao enviar a indicação. Tente novamente.');
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
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Indicação Enviada!</h2>
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem', textAlign: 'center' }}>
          O seu multiplicador foi notificado e já tem acesso aos dados deste cliente.
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
          Indicar um Multiplicador
        </h1>
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '2.5rem' }}>
          Passe o contato de um cliente ou lead quente para um membro do nosso grupo.
        </p>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius)', color: '#991b1b', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius)', backgroundColor: 'var(--background)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Para quem é a indicação?</label>
              <select name="toCompany" className="input-field" required defaultValue="">
                <option value="" disabled>Selecione a empresa ou membro...</option>
                <option value="todos" style={{ fontWeight: 'bold' }}>➡️ Para Todos (Qualquer empresa pode pegar)</option>
                {COMPANIES.map((company, index) => (
                  <option key={index} value={company}>{company}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Nome do Lead/Cliente</label>
              <input name="clientName" type="text" className="input-field" placeholder="Ex: João da Silva" required />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Telefone (WhatsApp)</label>
              <input name="clientPhone" type="tel" className="input-field" placeholder="(00) 00000-0000" required />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Nome ou Local da Obra (Opcional)</label>
              <input name="projectDetails" type="text" className="input-field" placeholder="Ex: Condomínio Alphaville" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Arquiteto Responsável (Opcional)</label>
              <input name="architectName" type="text" className="input-field" placeholder="Nome do escritório" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Observações</label>
              <textarea name="observations" className="input-field" placeholder="Descreva o que o cliente precisa..." rows={4}></textarea>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={loading}>
                {loading ? 'Processando...' : 'Enviar Indicação'}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
