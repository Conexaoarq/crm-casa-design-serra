import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
  const email = "aabergamo@gmail.com"
  
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    })
    console.log(`SUCESSO: O usuário ${email} agora é um ADMINISTRADOR!`)
  } catch (error) {
    console.error(`ERRO: Não foi possível encontrar o usuário ${email}.`)
  } finally {
    await prisma.$disconnect()
  }
}

main()
