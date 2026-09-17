import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          referralsGiven: true,
          referralsReceived: true,
          auditLogs: true
        }
      }
    }
  });

  for (const u of users) {
    if (u._count.referralsGiven > 0 || u._count.referralsReceived > 0 || u._count.auditLogs > 0) {
      console.log(`User: ${u.companyName || u.name || u.email} - Given: ${u._count.referralsGiven}, Received: ${u._count.referralsReceived}, AuditLogs: ${u._count.auditLogs}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
