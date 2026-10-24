import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

export interface RequiredPermission {
  action: string;
  resource: string;
}

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<RequiredPermission[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No specific permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Populated by JwtAuthGuard

    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }

    // Fetch user with fresh permissions from DB
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      include: {
        role: {
          include: { permissions: true }
        }
      }
    });

    if (!dbUser || !dbUser.isActive) {
      throw new ForbiddenException('User is inactive or does not exist');
    }

    const hasPermission = requiredPermissions.every(required => 
      dbUser.role.permissions.some(
        p => p.action === required.action && p.resource === required.resource
      )
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions to perform this action');
    }

    return true;
  }
}
