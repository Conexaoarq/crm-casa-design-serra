import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL!
  console.log("LOG: Iniciando Pool de conexões...");
  
  const pool = new Pool({ 
    connectionString,
    connectionTimeoutMillis: 30000, // Aumentado para 30s
    max: 10,
    idleTimeoutMillis: 30000,
    ssl: {
      rejectUnauthorized: false
    }
  })

  pool.on('connect', () => console.log("LOG: Banco de dados conectado com sucesso!"));
  pool.on('error', (err) => console.error("LOG: Erro crítico no Pool:", err));

  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
