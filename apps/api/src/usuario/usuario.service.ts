import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PerfilUsuario } from '@prisma/client';

@Injectable()
export class UsuarioService {
  constructor(private prisma: PrismaService) {}

  async findAll(perfil?: PerfilUsuario) {
    return this.prisma.usuario.findMany({
      where: perfil ? { perfil } : {},
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        perfil: true,
        criadoEm: true,
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async create(data: { nome: string; email: string; cpf: string; senha?: string; perfil: PerfilUsuario }) {
    const password = data.senha || 'Senha123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        cpf: data.cpf,
        senhaHash: hashedPassword,
        perfil: data.perfil,
      },
      select: { id: true, nome: true, email: true, perfil: true },
    });
  }

  async remove(id: string) {
    return this.prisma.usuario.delete({ where: { id } });
  }
}
