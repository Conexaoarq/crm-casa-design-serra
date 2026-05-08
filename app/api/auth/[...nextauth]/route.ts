import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    EmailProvider({
      server: {
        host: "localhost",
        port: 25,
        auth: { user: "", pass: "" }
      },
      from: "onboarding@resend.dev",
      async sendVerificationRequest({ identifier, url, provider }) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: provider.from,
            to: identifier,
            subject: "Acesso ao CRM Casa Design Serra",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                <h2 style="color: #333;">Olá!</h2>
                <p style="color: #555;">Clique no botão abaixo para entrar com segurança no seu CRM:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${url}" style="background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">ENTRAR NO CRM</a>
                </div>
                <p style="font-size: 12px; color: #888;">Se você não solicitou este acesso, pode ignorar este e-mail com segurança.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #aaa; text-align: center;">Casa Design Serra © 2024</p>
              </div>
            `,
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          console.error("ERRO NO RESEND:", error);
          throw new Error("Erro ao enviar e-mail via Resend");
        }
        console.log("E-mail enviado com sucesso via Resend API!");
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    async signIn({ user }: { user: any }) {
      const adminEmail = 'casadesignserra639@gmail.com';
      if (user.email === adminEmail) {
        try {
          await prisma.user.update({
            where: { email: user.email },
            data: { role: 'ADMIN' },
          });
          console.log("LOG: Usuário promovido a ADMIN:", user.email);
        } catch (e) {
          console.log("LOG: Aguardando criação do usuário para promover a ADMIN.");
        }
      }
      return true;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'MEMBER';
        
        // Garante que o administrador mestre sempre tenha a role ADMIN no token
        if (user.email === 'casadesignserra639@gmail.com') {
          token.role = 'ADMIN';
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verificar",
  },
  debug: false,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
