import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(private prisma: PrismaService) {}

  async findAll(roleId?: string) {
    return this.prisma.usuario.findMany({
      where: roleId ? { roleId } : {},
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        roleId: true,
        role: {
          select: { nome: true }
        },
        criadoEm: true,
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async create(data: { nome: string; email: string; cpf: string; senha?: string; roleId: string }) {
    const password = data.senha || 'Senha123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        cpf: data.cpf,
        senhaHash: hashedPassword,
        roleId: data.roleId,
      },
      select: { 
        id: true, 
        nome: true, 
        email: true, 
        roleId: true,
        role: { select: { nome: true } }
      },
    });
  }

  async remove(id: string) {
    return this.prisma.usuario.delete({ where: { id } });
  }
}
