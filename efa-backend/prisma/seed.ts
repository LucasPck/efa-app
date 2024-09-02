import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker/locale/fr';
import { hash } from 'bcrypt';

function user (index: number) {
  return {email: `user.${index}@user.com`, nametag: faker.internet.userName(), password: "password"}
}

const prisma = new PrismaClient()
async function main() {
  for (let i = 0 ; i < 80 ; i++) {
    const u = user(i)
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        nametag: u.nametag,
        password: await hash(u.password, 10)
      },
    })
  }
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })