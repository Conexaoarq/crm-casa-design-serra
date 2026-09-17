'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function editMembro(id: string, newEmail: string, newCompanyName: string) {
  try {
    await prisma.user.update({
      where: { id },
      data: {
        email: newEmail,
        companyName: newCompanyName,
      }
    });
    revalidatePath('/admin/membros');
    return { success: true };
  } catch (e) {
    console.error("Erro ao editar membro:", e);
    return { success: false, error: "Não foi possível editar o membro. O e-mail pode já estar em uso." };
  }
}

export async function deleteMembro(id: string) {
  try {
    await prisma.auditLog.deleteMany({ where: { userId: id } });
    await prisma.referral.updateMany({ where: { toUserId: id }, data: { toUserId: null } });

    const sentReferrals = await prisma.referral.findMany({ where: { fromUserId: id }, select: { id: true } });
    const sentIds = sentReferrals.map((r: any) => r.id);
    if (sentIds.length > 0) {
      await prisma.closedBusiness.deleteMany({ where: { referralId: { in: sentIds } } });
      await prisma.referral.deleteMany({ where: { fromUserId: id } });
    }

    await prisma.user.delete({ where: { id } });
    revalidatePath('/admin/membros');
  } catch (e) {
    console.error("Erro ao deletar membro:", e);
  }
}

export async function toggleConselheiro(id: string, currentRole: string) {
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

export async function enviarConvite(email: string) {
  const senhaGerada = Math.random().toString(36).substring(2, 8).toUpperCase();

  try {
    await prisma.user.update({
      where: { email },
      data: { password: senhaGerada } 
    });

    const baseUrl = "https://crm-casa-design-serra-production.up.railway.app";
    const loginUrl = `${baseUrl}/login`;

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
  } catch (e) {
    console.error("Erro ao enviar convite:", e);
  }
}
