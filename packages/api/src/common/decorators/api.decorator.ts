import { applyDecorators } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';

export const ApiAuth = () => {
  return applyDecorators(
    ApiSecurity('PRIVATE-TOKEN'),
  );
}; 