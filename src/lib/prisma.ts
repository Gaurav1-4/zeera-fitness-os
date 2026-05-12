import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV === 'production') {
  console.warn('DATABASE_URL is missing in production environment!');
}

const pool = new Pool({ 
  connectionString: connectionString || 'postgresql://dummy:dummy@localhost:5432/dummy',
  max: 10,
  idleTimeoutMillis: 30000,
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
