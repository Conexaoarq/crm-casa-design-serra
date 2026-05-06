import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    EmailProvider({
      server: {
        host: "smtp.gmail.com",
        port: 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        secure: false,
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url, provider }) {
        console.log("Iniciando envio de e-mail para:", identifier);
        const { host } = new URL(url);
        const transport = require("nodemailer").createTransport(provider.server);
        try {
          const result = await transport.sendMail({
            to: identifier,
            from: provider.from,
            subject: `Entrar em ${host}`,
            text: `Acesse este link para entrar: ${url}`,
            html: `<p>Clique no link para entrar: <a href="${url}">${url}</a></p>`,
          });
          console.log("E-mail enviado com sucesso!", result.messageId);
        } catch (error) {
          console.error("ERRO NO ENVIO DE E-MAIL:", error);
          throw new Error("SEND_VERIFICATION_EMAIL_ERROR");
        }
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
});

export { handler as GET, handler as POST };
