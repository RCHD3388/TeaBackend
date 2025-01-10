import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: string[]) => {
  if (roles.length === 0) {
    return SetMetadata(ROLES_KEY, null); 
  }
  return SetMetadata(ROLES_KEY, roles); 
};
