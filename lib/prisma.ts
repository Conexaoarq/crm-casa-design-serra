import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL!
  console.log("Conectando ao banco com SSL...");
  
  const pool = new Pool({ 
    connectionString,
    connectionTimeoutMillis: 10000,
    ssl: {
      rejectUnauthorized: false // Necessário para a maioria dos bancos em nuvem como Railway
    }
  })

  pool.on('error', (err) => {
    console.error('ERRO NO BANCO:', err);
  });

  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
