import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

// Handle connection errors gracefully
prisma.$connect().catch((error) => {
  console.error('Database connection error:', error)
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

