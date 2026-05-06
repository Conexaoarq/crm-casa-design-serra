import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL!
  console.log("Tentando conectar ao banco de dados...");
  
  const pool = new Pool({ 
    connectionString,
    connectionTimeoutMillis: 5000, // 5 segundos de timeout
  })

  pool.on('error', (err) => {
    console.error('ERRO INESPERADO NO BANCO DE DADOS:', err);
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
