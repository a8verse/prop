import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with proper configuration for Vercel serverless
const prismaClientSingletonFactory = () => {
  return new PrismaClient({
    log: 
      process.env.NODE_ENV === 'development' 
        ? ['error', 'warn'] 
        : ['error'],
    // Optimize for serverless environments
    errorFormat: 'minimal',
  })
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingletonFactory()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Handle connection errors gracefully
prisma.$connect().catch((error) => {
  console.error('Database connection error:', error)
  console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'NOT SET')
  process.exit(1)
})

