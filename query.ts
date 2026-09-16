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
  const alexandres = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: 'alexandre', mode: 'insensitive' } },
        { companyName: { contains: 'alexandre', mode: 'insensitive' } }
      ]
    }
  });

  console.log("ALEXANDRES ENCONTRADOS:");
  console.log(alexandres);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
