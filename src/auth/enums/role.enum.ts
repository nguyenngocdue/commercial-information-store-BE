export enum UserRole {
  CUSTOMER = 'customer',
  STAFF = 'staff',
  TECHNICIAN = 'technician',
  MANAGER = 'manager',
  ADMIN = 'admin',
}

export const ROLE_HIERARCHY = {
  [UserRole.CUSTOMER]: 1,
  [UserRole.STAFF]: 2,
  [UserRole.TECHNICIAN]: 3,
  [UserRole.MANAGER]: 4,
  [UserRole.ADMIN]: 5,
};
