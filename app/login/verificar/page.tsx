export default function VerificarPage() {
  return (
    <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      </div>
      <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Verifique seu E-mail!</h2>
      <p style={{ color: 'var(--muted-foreground)', maxWidth: '400px', lineHeight: 1.6 }}>
        Enviamos um <strong>link mágico</strong> para o seu e-mail. 
        Clique no botão dentro do e-mail para acessar a plataforma.
      </p>
      <p style={{ color: 'var(--muted-foreground)', marginTop: '2rem', fontSize: '0.875rem' }}>
        Não recebeu? Verifique a caixa de spam.
      </p>
    </div>
  );
}
