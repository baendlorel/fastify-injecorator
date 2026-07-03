import { createCustomDecorator } from '../../../packages/core/decorators/custom.js';

// Custom decorator for role-based access control
export const Roles = createCustomDecorator<string[]>('roles');
