import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    where: { role: 'MEMBER' },
    select: { email: true, password: true, companyName: true }
  });

  const pending = users.filter(u => u.password === 'AGUARDANDO_ACESSO');
  const sent = users.filter(u => u.password !== 'AGUARDANDO_ACESSO' && u.password && u.password.length === 6);

  console.log(`\n=== RELATÓRIO DE E-MAILS ===`);
  console.log(`Total de membros: ${users.length}`);
  console.log(`E-mails enviados (senha gerada): ${sent.length}`);
  console.log(`E-mails pendentes: ${pending.length}`);
  
  if (pending.length > 0) {
    console.log(`\nMembros que ainda não receberam e-mail:`);
    pending.forEach(p => console.log(`- ${p.email} (${p.companyName})`));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
