import { requiredEnv } from '../utils/environment';
import users from './users.json';

export type SauceUserRole =
  | 'standard_user'
  | 'locked_out_user'
  | 'problem_user'
  | 'performance_glitch_user';

export interface Credentials {
  username: string;
  password: string;
}

const usernameVariable: Record<SauceUserRole, string> = {
  standard_user: 'SAUCE_STANDARD_USER',
  locked_out_user: 'SAUCE_LOCKED_OUT_USER',
  problem_user: 'SAUCE_PROBLEM_USER',
  performance_glitch_user: 'SAUCE_PERFORMANCE_USER',
};

export function credentialsFor(role: SauceUserRole): Credentials {
  return {
    username: process.env[usernameVariable[role]]?.trim() || users[role].username,
    password: requiredEnv('SAUCE_PASSWORD'),
  };
}
