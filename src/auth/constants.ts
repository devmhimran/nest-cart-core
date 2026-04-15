export const jwtConstants = {
  accessSecret: process.env.JWT_ACCESS_SECRET || 'default-secret-key',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-key',
};
