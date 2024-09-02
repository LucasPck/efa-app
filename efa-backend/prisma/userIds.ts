import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
async function main() {
  const users = await prisma.user.findMany()
  for (const user of users ) {
    console.log(`${user.email};${user.nametag}#${user.id.slice(-5)}`)
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