import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: { email: string; name: string; password: string }) {
    const client: any = this.prisma;
    return client.client['user'].create({ data });
  }

  async findByEmail(email: string) {
    const client: any = this.prisma;
    return client.client['user'].findUnique({ where: { email } });
  }

  async findById(id: string) {
    const client: any = this.prisma;
    return client.client['user'].findUnique({ where: { id } });
  }
}
