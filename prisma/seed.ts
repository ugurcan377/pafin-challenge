import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const userData: Prisma.UserCreateInput[] = [
  {
    name: 'Yamashita Ayaka',
    email: 'ayamashita@jfa.jp',
    password: 'nadeshiko1',
  },
  {
    name: 'Shimizu Risa',
    email: 'rshimizu@jfa.jp',
    password: 'nadeshiko2',
  },
  {
    name: 'Minami Moeka',
    email: 'mminami@jfa.jp',
    password: 'nadeshiko3',
  }
]

async function main() {
  console.log(`Start seeding ...`)
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    })
    console.log(`Created user with id: ${user.id}`)
  }
  console.log(`Seeding finished.`)
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
