import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  const baseUrl = "https://crm-casa-design-serra-production.up.railway.app";

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=InvalidLink', baseUrl));
  }

  // Achar usuário usando o token diretamente
  const user = await prisma.user.findFirst({
    where: { password: token }
  });

  if (user) {
    // Redirecionar para a página de login com os parâmetros extraídos do banco de dados
    return NextResponse.redirect(new URL(`/login?inviteToken=${token}&email=${encodeURIComponent(user.email!)}`, baseUrl));
  }

  return NextResponse.redirect(new URL('/login?error=ExpiredLink', baseUrl));
}
