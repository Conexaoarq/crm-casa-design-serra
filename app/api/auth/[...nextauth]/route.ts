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
        host: "localhost", // Placeholder, não será usado
        port: 25,
        auth: { user: "", pass: "" }
      },
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
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
