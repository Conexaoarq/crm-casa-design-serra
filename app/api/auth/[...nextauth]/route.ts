import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    EmailProvider({
      server: {
        host: 'smtp.googlemail.com',
        port: 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url, provider }) {
        const { host } = new URL(url);
        const transport = nodemailer.createTransport(provider.server);
        await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject: `Acesso ao CRM Casa Design Serra`,
          text: `Acesse este link para entrar no CRM: ${url}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
              <h2>Olá!</h2>
              <p>Clique no botão abaixo para entrar no CRM Casa Design Serra:</p>
              <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px;">Entrar no CRM</a>
              <p style="margin-top: 20px; font-size: 12px; color: #666;">Se você não solicitou este link, pode ignorar este e-mail.</p>
            </div>
          `,
        });
      },
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 90 * 24 * 60 * 60, // 90 dias - a pessoa fica logada por 3 meses
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verificar",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;
        (session.user as any).role = (user as any).role;
        (session.user as any).companyName = (user as any).companyName;
      }
      return session;
    },
  },
  debug: true, // Ativa logs detalhados para diagnóstico
});

export { handler as GET, handler as POST };
