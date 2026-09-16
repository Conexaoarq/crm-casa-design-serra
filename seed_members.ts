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

const members = [
  { email: 'alexandrebiasibetti271@gmail.com', companyName: 'Valen Esquadrias' },
  { email: 'comercial1@felesa.com.br', companyName: 'Felesa' },
  { email: 'contato.stuffadesign@gmail.com', companyName: 'Stuffadesign' },
  { email: 'cristianobuffon@gmail.com', companyName: 'DCA' },
  { email: 'diego@duomobile.com.br', companyName: 'Duomobile' },
  { email: 'diretoria@monitorabento.com.br', companyName: 'Monitorabento' },
  { email: 'engenharia@triadeincorporadora.com', companyName: 'Triade Incorporadora' },
  { email: 'fabiomg0111@gmail.com', companyName: 'DCA' },
  { email: 'financeiro@ombradecor.com.br', companyName: 'Ombradecor' },
  { email: 'financeiro@triadeincorporadora.com', companyName: 'Triade Incorporadora' },
  { email: 'hpoolpiscinas@gmail.com', companyName: 'Hpool' },
  { email: 'juliano.bettim@gmail.com', companyName: 'Jornal Serra Design' },
  { email: 'linara@farraposconstrucao.com.br', companyName: 'Farrapos' },
  { email: 'luanagois523@gmail.com', companyName: 'DCA' },
  { email: 'marcellgbraun@gmail.com', companyName: 'Eco Braun' },
  { email: 'matiasjardinagempaisagismo@gmail.com', companyName: 'Matias Jardinagem' },
  { email: 'moderna.adm@gmail.com', companyName: 'Moderna' },
  { email: 'nolanhomebg@gmail.com', companyName: 'Nolan' },
  { email: 'primelcristiano@gmail.com', companyName: 'Primel' },
  { email: 'renan@futuraluz.com.br', companyName: 'Futuraluz' },
  { email: 'silviaperusso@gmail.com', companyName: 'Jornal serra Design' }
];

async function main() {
  console.log('Iniciando importação de membros...');
  
  for (const member of members) {
    try {
      // Upsert: atualiza se existir, cria se não existir
      await prisma.user.upsert({
        where: { email: member.email.trim() },
        update: {
          companyName: member.companyName.trim()
        },
        create: {
          email: member.email.trim(),
          companyName: member.companyName.trim(),
          password: 'AGUARDANDO_ACESSO', // Senha provisória. O admin vai sobrescrever ao clicar "Enviar Acesso".
          role: 'MEMBER'
        }
      });
      console.log(`✅ Sucesso: ${member.email}`);
    } catch (e) {
      console.error(`❌ Erro ao adicionar ${member.email}:`, e);
    }
  }
  
  console.log('Importação concluída com sucesso!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
