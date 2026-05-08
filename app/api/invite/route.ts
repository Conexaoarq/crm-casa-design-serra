import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!token || !email) {
    return NextResponse.redirect(new URL('/login?error=InvalidLink', request.url));
  }

  // Verificar se o token bate com o que guardamos no usuário
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (user && user.password === token) {
    // Redirecionar para a página de login com os parâmetros para auto-login
    // Vamos usar um parâmetro especial que a página de login vai identificar
    return NextResponse.redirect(new URL(`/login?inviteToken=${token}&email=${encodeURIComponent(email)}`, request.url));
  }

  return NextResponse.redirect(new URL('/login?error=ExpiredLink', request.url));
}
