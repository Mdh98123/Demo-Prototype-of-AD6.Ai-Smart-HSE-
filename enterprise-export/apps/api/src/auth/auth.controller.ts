import { Controller, Post, Body, UseGuards, Get, Request, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RbacGuard } from './guards/rbac.guard';
import { RequirePermissions } from './decorators/require-permissions.decorator';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Check MFA Requirement here before issuing standard JWT
    if (user.mfaEnabled) {
      return { mfaRequired: true, userId: user.id };
    }

    return this.authService.login(user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return req.user;
  }

  // Example of Enterprise RBAC Guard Usage
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions({ action: 'read', resource: 'System' })
  @Get('audit-logs')
  getAuditLogs() {
    return { message: 'Secure Audit Logs Accessed' };
  }
}
