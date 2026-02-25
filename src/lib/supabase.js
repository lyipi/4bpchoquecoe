import { supabase } from './customSupabaseClient';

export { supabase };

// User roles constant
export const ROLES = {
  TRAINEE: 'Estagiários',
  OPERATIONAL: 'Operacionais',
  ADMINISTRATIVE: 'Administrativos',
  SUPER_ADMIN: 'Super Administrativo'
};

// Mock Users removed - using real DB
export const mockUsers = [];