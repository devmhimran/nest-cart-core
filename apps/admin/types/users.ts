import { UserRole } from '@/lib/enums';

export interface UsersType {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
}

export interface CreateUserType {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
