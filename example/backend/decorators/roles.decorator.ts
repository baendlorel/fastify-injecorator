import { createCustomDecorator } from '../../../src/decorators/custom.js';

// Custom decorator for role-based access control
export const Roles = createCustomDecorator<string[]>('roles');
