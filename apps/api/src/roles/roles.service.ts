import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: { nome: 'asc' },
    });
  }

  async findAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: { categoria: 'asc' },
    });
  }

  async create(data: { nome: string; descricao?: string; permissionIds: string[] }) {
    const { permissionIds, ...roleData } = data;
    
    return this.prisma.role.create({
      data: {
        ...roleData,
        permissions: {
          create: permissionIds.map(id => ({
            permissionId: id
          }))
        }
      },
      include: {
        permissions: true
      }
    });
  }

  async update(id: string, data: { nome?: string; descricao?: string; permissionIds?: string[] }) {
    const { permissionIds, ...roleData } = data;

    // Se houver novas permissões, remove as antigas e adiciona as novas (simples)
    if (permissionIds) {
      await this.prisma.rolePermission.deleteMany({
        where: { roleId: id }
      });
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        ...roleData,
        ...(permissionIds && {
          permissions: {
            create: permissionIds.map(pid => ({
              permissionId: pid
            }))
          }
        })
      },
      include: {
        permissions: true
      }
    });
  }

  async remove(id: string) {
    // Não permitir deletar perfis que tenham usuários (segurança)
    const usersCount = await this.prisma.usuario.count({
      where: { roleId: id }
    });

    if (usersCount > 0) {
      throw new Error('Não é possível remover um perfil que possui usuários vinculados.');
    }

    return this.prisma.role.delete({ where: { id } });
  }
}
