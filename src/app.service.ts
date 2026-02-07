import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async checkDatabaseHealth(): Promise<{
    status: 'healthy' | 'unhealthy';
    database: string;
    message: string;
    timestamp: string;
  }> {
    try {
      // Try to execute a simple query
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'healthy',
        database: 'postgres',
        message: 'Database connection is working',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        database: 'postgres',
        message: error instanceof Error ? error.message : 'Database connection failed',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
