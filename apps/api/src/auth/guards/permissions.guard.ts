import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.id) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Buscar permissões do usuário no banco de dados (para ser dinâmico em tempo real)
    const userWithPermissions = await this.prisma.usuario.findUnique({
      where: { id: user.id },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!userWithPermissions || !userWithPermissions.role) {
      throw new ForbiddenException('Usuário sem perfil atribuído');
    }

    // Admins have total access
    if (userWithPermissions.role.nome === 'Administrador') {
      return true;
    }

    const userPermissions = userWithPermissions.role.permissions.map(
      (rp) => rp.permission.slug,
    );

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Você não tem permissão para realizar esta ação');
    }

    return true;
  }
}
