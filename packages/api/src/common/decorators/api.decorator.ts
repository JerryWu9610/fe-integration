import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

export const ApiAuth = () => {
  return applyDecorators(
    ApiBearerAuth('access-token'),
  );
}; 