import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        matricula: true,
        roleId: true,
        role: {
          select: {
            nome: true,
            permissions: {
              select: {
                permission: {
                  select: { slug: true },
                },
              },
            },
          },
        },
        criadoEm: true,
      },
    });
  }

  async findAll(roleId?: string, roleName?: string) {
    const where: any = {};
    if (roleId) where.roleId = roleId;
    if (roleName)
      where.role = { nome: { equals: roleName, mode: 'insensitive' } };

    return this.prisma.usuario.findMany({
      where,
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        matricula: true,
        roleId: true,
        role: {
          select: { nome: true },
        },
        criadoEm: true,
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async create(data: {
    nome: string;
    email: string;
    cpf: string;
    matricula?: string;
    senha?: string;
    roleId: string;
  }) {
    const password = data.senha || 'Senha123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        cpf: data.cpf,
        matricula: data.matricula,
        senhaHash: hashedPassword,
        roleId: data.roleId,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        matricula: true,
        roleId: true,
        role: { select: { nome: true } },
      },
    });
  }

  async update(
    id: string,
    data: {
      nome?: string;
      email?: string;
      cpf?: string;
      matricula?: string;
      senha?: string;
      roleId?: string;
    },
  ) {
    const { senha, ...rest } = data;
    const updateData: any = { ...rest };

    // Remover campos que venham como undefined ou null para não sobrescrever o banco
    Object.keys(updateData).forEach(
      (key) =>
        (updateData[key] === undefined || updateData[key] === null) &&
        delete updateData[key],
    );

    if (senha) {
      updateData.senhaHash = await bcrypt.hash(senha, 10);
    }

    return this.prisma.usuario.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        matricula: true,
        roleId: true,
        role: { select: { nome: true } },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.usuario.delete({ where: { id } });
  }
}
