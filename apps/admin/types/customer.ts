import { UserRole } from '@/lib/enums';

export interface CustomersType {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Extract<UserRole, UserRole.CUSTOMER>;
  isActive: boolean;
  banned: boolean;
  emailVerified: boolean;
  createdAt: Date;
}
