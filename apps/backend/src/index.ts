// Backend root index - specific exports to avoid conflicts
export * from './config';
export * from './middleware';
export * from './routes';
export {
  register as authRegister,
  login as authLogin,
  logout as authLogout,
  refreshToken,
} from './controllers/authController';
export {
  createTicket,
  listTickets,
  getTicket,
  updateTicket,
  deleteTicket,
} from './controllers/queueController';
export {
  getDashboard,
  getMetrics,
  createUser,
  listUsers,
  updateUser,
  deleteUser,
} from './controllers/adminController';
export * from './types';
export { logger, logger as Logger } from './utils/logger';
export * from './utils/errors';
export * from './utils/validators';
export * from './websocket';
export { supabase, userQueries, ticketQueries, attendanceQueries } from './db';
