import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  url: "https://crm-casa-design-serra-production.up.railway.app",
  providers: [
    EmailProvider({
      server: {
        host: "localhost",
        port: 25,
        auth: { user: "", pass: "" }
      },
      from: "Casa Design Serra <notificacoes@casadesignserra.com.br>",
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
    CredentialsProvider({
      name: "Senha Admin",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
        inviteToken: { label: "Token", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        
        // 1. Caso seja Login por Link de Convite (Auto-login)
        if (credentials.inviteToken) {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });
          
          if (user && user.password === credentials.inviteToken) {
            // O token não é limpo aqui. Assim o membro pode usar o link do e-mail como um "superlink" permanente.
            // Se o admin reenviar o acesso, um novo token será gerado, invalidando o antigo.
            return user;
          }
        }

        // 2. Caso seja Login de Administrador com Senha
        const admins = ['casadesignserra639@gmail.com', 'aabergamo@gmail.com'];
        const masterPass = "casa639"; // Sua senha de construção

        if (admins.includes(credentials.email) && credentials.password === masterPass) {
          const user = await prisma.user.upsert({
            where: { email: credentials.email },
            update: { role: 'ADMIN' },
            create: { email: credentials.email, role: 'ADMIN' },
          });
          return user;
        }
        
        return null;
      }
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    async signIn({ user }: { user: any }) {
      const admins = ['casadesignserra639@gmail.com', 'aabergamo@gmail.com'];
      
      // 1. Se for Admin, permite sempre
      if (admins.includes(user.email)) {
        try {
          await prisma.user.update({
            where: { email: user.email },
            data: { role: 'ADMIN' },
          });
        } catch (e) {
          // Se não existir, o adapter criará ou trataremos na próxima tentativa
        }
        return true;
      }

      // 2. Para usuários comuns, verificamos se o Admin já os cadastrou
      const userExists = await prisma.user.findUnique({
        where: { email: user.email }
      });

      if (!userExists) {
        console.log("ACESSO NEGADO: E-mail não cadastrado pelo Admin:", user.email);
        return false; // Bloqueia o envio do link mágico e o login
      }

      return true;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role || 'MEMBER';
        
        // Garante que os administradores mestre sempre tenham a role ADMIN no token
        const admins = ['casadesignserra639@gmail.com', 'aabergamo@gmail.com'];
        if (admins.includes(user.email)) {
          token.role = 'ADMIN';
        }
      }
      
      // Atualizar role do banco a cada refresh para refletir mudanças de CONSELHEIRO em tempo real
      if (token.email) {
        try {
          const admins = ['casadesignserra639@gmail.com', 'aabergamo@gmail.com'];
          if (!admins.includes(token.email)) {
            const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
            if (dbUser) {
              token.role = dbUser.role;
            }
          }
        } catch (e) {
          // Silently fail - keep existing token role
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
