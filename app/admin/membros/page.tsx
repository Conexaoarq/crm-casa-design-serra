import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";

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

  async function deleteMembro(id: string) {
    'use server';
    try {
      await prisma.user.delete({ where: { id } });
      revalidatePath('/admin/membros');
    } catch (e) {
      console.error("Erro ao deletar membro:", e);
    }
  }

  async function toggleConselheiro(id: string, currentRole: string) {
    'use server';
    try {
      const newRole = currentRole === 'CONSELHEIRO' ? 'MEMBER' : 'CONSELHEIRO';
      await prisma.user.update({
        where: { id },
        data: { role: newRole },
      });
      revalidatePath('/admin/membros');
    } catch (e) {
      console.error("Erro ao alterar papel:", e);
    }
  }

  async function enviarConvite(email: string) {
    'use server';
    // Gerar uma senha aleatória simples de 6 caracteres
    const senhaGerada = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      // Guardar a senha no banco de dados
      await prisma.user.update({
        where: { email },
        data: { password: senhaGerada } 
      });

      const baseUrl = "https://crm-casa-design-serra-production.up.railway.app";
      const loginUrl = `${baseUrl}/login`;

      // Enviar via Resend
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Casa Design Serra <notificacoes@casadesignserra.com.br>",
          to: email,
          reply_to: "aabergamo@gmail.com",
          subject: "Seu Acesso Exclusivo - Casa Design Serra",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #333; text-align: center;">Bem-vindo à Casa Design Serra!</h2>
              <p style="color: #555; line-height: 1.6;">Você foi adicionado à nossa plataforma exclusiva de gestão e negócios.</p>
              
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>Seus dados de acesso:</strong></p>
                <p style="margin: 0 0 5px 0;">E-mail: <strong>${email}</strong></p>
                <p style="margin: 0;">Senha provisória: <strong style="font-size: 18px; color: #000; letter-spacing: 2px;">${senhaGerada}</strong></p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" style="background-color: #111; color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 2px; font-weight: bold; display: inline-block;">ACESSAR PLATAFORMA</a>
              </div>
            </div>
          `,
        }),
      });
      console.log("Convite enviado via rota de bypass para:", email);
    } catch (e) {
      console.error("Erro ao enviar convite:", e);
    }
  }

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
                <tr key={membro.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1.5rem', fontWeight: 600, fontSize: '0.9rem' }}>{membro.companyName || '---'}</td>
                  <td style={{ padding: '1.5rem', color: '#666', fontSize: '0.9rem' }}>{membro.email}</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>
                      <span style={{ 
                      fontSize: '0.7rem', 
                      padding: '4px 8px', 
                      borderRadius: '2px', 
                      backgroundColor: membro.role === 'ADMIN' ? '#111' : membro.role === 'CONSELHEIRO' ? '#fafafa' : '#fff', 
                      border: membro.role === 'ADMIN' ? '1px solid #111' : '1px solid var(--border)',
                      color: membro.role === 'ADMIN' ? '#fff' : '#111',
                      fontWeight: 600,
                      letterSpacing: '0.05em'
                    }}>
                      {membro.role}
                    </span>
                  </td>
                  <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {/* Botão CONSELHEIRO - toggle on/off */}
                      {membro.role !== 'ADMIN' && (
                        <form action={async () => { 'use server'; await toggleConselheiro(membro.id, membro.role); }}>
                          <button type="submit" style={{ 
                            fontSize: '0.7rem', 
                            padding: '0.4rem 0.8rem', 
                            borderRadius: '0px',
                            border: '1px solid var(--border)',
                            backgroundColor: membro.role === 'CONSELHEIRO' ? '#f4f4f5' : 'transparent',
                            color: membro.role === 'CONSELHEIRO' ? '#111' : '#888',
                            cursor: 'pointer',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            {membro.role === 'CONSELHEIRO' ? 'Remover Conselheiro' : 'Tornar Conselheiro'}
                          </button>
                        </form>
                      )}

                      {/* Botão ENVIAR ACESSO */}
                      {membro.role !== 'ADMIN' && (
                        <form action={async () => { 'use server'; await enviarConvite(membro.email!); }}>
                          <button type="submit" className="btn-outline" style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem' }}>
                            ENVIAR ACESSO
                          </button>
                        </form>
                      )}

                      {/* Botão EXCLUIR */}
                      {membro.email !== 'casadesignserra639@gmail.com' && membro.email !== 'aabergamo@gmail.com' && (
                        <form action={async () => { 'use server'; await deleteMembro(membro.id); }}>
                          <button type="submit" style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Excluir</button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
