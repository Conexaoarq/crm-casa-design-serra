import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import MembroTableRow from "./MembroTableRow";

export default async function MembrosPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect("/login");
  }

  const membros = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  async function addMembro(formData: FormData) {
    'use server';
    const email = formData.get('email') as string;
    const companyName = formData.get('companyName') as string;
    const role = formData.get('role') as string || 'MEMBER';

    if (!email) return;

    try {
      await prisma.user.upsert({
        where: { email },
        update: { companyName, role },
        create: { email, companyName, role },
      });
      revalidatePath('/admin/membros');
    } catch (e) {
      console.error("Erro ao cadastrar membro:", e);
    }
  }

  // Server actions foram movidos para actions.ts

  const conselheiros = membros.filter(m => m.role === 'CONSELHEIRO');

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '5rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ 
          paddingTop: '3rem', 
          paddingBottom: '2rem',
          borderBottom: '1px solid var(--border)',
          marginBottom: '4rem',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)', fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#111' }}>
              Gestão de <strong style={{ fontWeight: 800 }}>Membros.</strong>
            </h1>
            <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem', letterSpacing: '0.02em' }}>
              Controle de participantes e disparos de convites exclusivos.
            </p>
          </div>
          <Link href="/admin" className="btn-outline">← VOLTAR</Link>
        </div>

        {/* Resumo do Grupo */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
          <div className="arch-card" style={{ padding: '2rem', borderLeft: '4px solid #111' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.1em' }}>Membros Cadastrados</div>
            <div style={{ fontSize: '2rem', fontWeight: 300 }}>{membros.length} <span style={{ fontSize: '1rem', color: '#ccc', fontWeight: 400 }}>/ 50</span></div>
          </div>
          <div className="arch-card" style={{ padding: '2rem', borderLeft: '4px solid #555' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.1em' }}>Convites Enviados</div>
            <div style={{ fontSize: '2rem', fontWeight: 300 }}>{membros.filter(m => m.role !== 'ADMIN').length}</div>
          </div>
          <div className="arch-card" style={{ padding: '2rem', borderLeft: '4px solid #888' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.1em' }}>Conselheiros</div>
            <div style={{ fontSize: '2rem', fontWeight: 300 }}>{conselheiros.length}</div>
          </div>
        </div>

        {/* Formulário de Cadastro */}
        <div className="editorial-title">Integração</div>
        <div className="arch-card" style={{ marginBottom: '5rem' }}>
          <h3 style={{ marginBottom: '2rem', fontWeight: 300, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>Cadastrar Novo Membro</h3>
          <form action={addMembro} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1.5rem', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', color: '#888' }}>E-mail de Acesso</label>
              <input name="email" type="email" required placeholder="exemplo@empresa.com" className="input-field" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', color: '#888' }}>Nome da Empresa</label>
              <input name="companyName" type="text" required placeholder="Nome Fantasia" className="input-field" />
            </div>
            <button type="submit" className="btn-primary" style={{ height: '47px' }}>ADICIONAR</button>
          </form>
        </div>

        {/* Lista de Membros */}
        <div className="editorial-title">Diretório</div>
        <div className="arch-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#fafafa', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', letterSpacing: '0.1em' }}>EMPRESA</th>
                <th style={{ padding: '1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', letterSpacing: '0.1em' }}>E-MAIL</th>
                <th style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#888', letterSpacing: '0.1em' }}>FUNÇÃO</th>
                <th style={{ padding: '1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#888', letterSpacing: '0.1em' }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {membros.map((membro) => (
                <MembroTableRow key={membro.id} membro={membro} />
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
