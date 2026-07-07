import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const baseUrl = "https://crm-casa-design-serra-production.up.railway.app";

  if (!token || !email) {
    return NextResponse.redirect(new URL('/login?error=InvalidLink', baseUrl));
  }

  // Verificar se o token bate com o que guardamos no usuário
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (user && user.password === token) {
    // Redirecionar para a página de login com os parâmetros para auto-login
    return NextResponse.redirect(new URL(`/login?inviteToken=${token}&email=${encodeURIComponent(email)}`, baseUrl));
  }

  return NextResponse.redirect(new URL('/login?error=ExpiredLink', baseUrl));
}
