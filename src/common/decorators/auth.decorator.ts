import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/auth.guard';
import { UserGuard } from '../guards/user.guard';

export function Auth() {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    UseGuards(UserGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}