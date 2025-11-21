import { PrismaClient } from '@prisma/client';

// Export a shared singleton Prisma client for the whole app to use.
export const prisma = new PrismaClient();
