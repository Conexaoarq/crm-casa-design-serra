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

  async function enviarConvite(email: string) {
    'use server';
    // Gerar um token único para o link mágico (simulando o NextAuth para agilidade)
    const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    try {
      // Criar o token de verificação no banco para o NextAuth reconhecer
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token: token,
          expires: expires,
        }
      });

      const url = `${process.env.NEXTAUTH_URL}/api/auth/callback/email?callbackUrl=${encodeURIComponent('/')}&token=${token}&email=${encodeURIComponent(email)}`;

      // Enviar via Resend
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: email,
          subject: "Seu Acesso Exclusivo - Casa Design Serra",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #333;">Olá!</h2>
              <p style="color: #555;">A diretoria da Casa Design Serra liberou seu acesso exclusivo à plataforma.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${url}" style="background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">ACESSAR PLATAFORMA</a>
              </div>
              <p style="font-size: 12px; color: #888;">Este link é único e expira em 24 horas.</p>
            </div>
          `,
        }),
      });
      console.log("Convite enviado com sucesso para:", email);
    } catch (e) {
      console.error("Erro ao enviar convite:", e);
    }
  }

  return (
    <div className="container animate-fade-in">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Gestão de Empresas</h1>
            <p style={{ color: 'var(--muted-foreground)' }}>Cadastre as 40 empresas do grupo aqui.</p>
          </div>
          <Link href="/admin" className="btn-outline">← Voltar</Link>
        </div>

        {/* Formulário de Cadastro */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius)', backgroundColor: 'var(--background)', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Cadastrar Novo Membro</h3>
          <form action={addMembro} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--muted-foreground)' }}>E-mail de Acesso</label>
              <input name="email" type="email" required placeholder="exemplo@empresa.com" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--muted-foreground)' }}>Nome da Empresa</label>
              <input name="companyName" type="text" required placeholder="Nome Fantasia" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
            </div>
            <button type="submit" className="btn-primary" style={{ height: '45px' }}>ADICIONAR</button>
          </form>
        </div>

        {/* Lista de Membros */}
        <div className="glass-panel" style={{ borderRadius: 'var(--radius)', backgroundColor: 'var(--background)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem' }}>EMPRESA</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem' }}>E-MAIL</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem' }}>ROLE</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem' }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {membros.map((membro) => (
                <tr key={membro.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{membro.companyName || '---'}</td>
                  <td style={{ padding: '1rem', color: 'var(--muted-foreground)' }}>{membro.email}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', backgroundColor: membro.role === 'ADMIN' ? '#000' : '#eee', color: membro.role === 'ADMIN' ? '#fff' : '#000' }}>
                      {membro.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      {membro.role !== 'ADMIN' && (
                        <form action={async () => { 'use server'; await enviarConvite(membro.email!); }}>
                          <button type="submit" className="btn-outline" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderColor: '#000', color: '#000' }}>
                            ENVIAR ACESSO
                          </button>
                        </form>
                      )}
                      {membro.email !== 'casadesignserra639@gmail.com' && (
                        <form action={async () => { 'use server'; await deleteMembro(membro.id); }}>
                          <button type="submit" style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: '0.4rem' }}>Excluir</button>
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
