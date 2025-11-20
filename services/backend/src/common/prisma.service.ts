import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { prisma } from './prisma.client';
import type { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  /**
   * Expose the shared Prisma client for direct use by services/controllers when needed.
   * This returns the generated `PrismaClient` instance from `prisma.client.ts`.
   */
  // Use `any` here to avoid intermittent TS server resolution issues with generated Prisma client types
  // The runtime still uses the correct generated client instance.
  get client(): any {
    return prisma;
  }

  async onModuleInit() {
    try {
      // Ensure a connection is established early
      await this.client.$connect();
      this.logger.log('Connected to database (shared prisma client)');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.client.$disconnect();
      this.logger.log('Disconnected from database (shared prisma client)');
    } catch (error) {
      this.logger.error('Error disconnecting prisma client', error);
    }
  }
}
