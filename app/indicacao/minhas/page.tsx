import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import MinhasIndicacoesClient from "./MinhasIndicacoesClient";

export default async function MinhasIndicacoesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      referralsReceived: {
        include: { fromUser: true },
        orderBy: { createdAt: 'desc' }
      },
      referralsGiven: {
        include: { toUser: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <MinhasIndicacoesClient 
      recebidas={user.referralsReceived as any} 
      enviadas={user.referralsGiven as any} 
    />
  );
}
