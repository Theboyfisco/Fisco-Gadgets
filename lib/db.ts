import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  const enableQueryLogging = process.env.PRISMA_QUERY_LOGS === '1'
  return new PrismaClient({
    log: enableQueryLogging ? ['query', 'error', 'warn'] : ['error', 'warn'],
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
