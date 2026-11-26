import { appConfig } from './app-config';

interface ApplicationConfig {
  baseURL: string;
  roles: readonly string[];
  tags: readonly string[];
}

export const applications = {
  saucedemo: {
    baseURL: appConfig.sauceBaseURL,
    roles: [
      'standard_user',
      'locked_out_user',
      'problem_user',
      'performance_glitch_user',
    ],
    tags: ['@saucedemo'],
  },
  todomvc: {
    baseURL: appConfig.todoMVCBaseURL,
    roles: ['anonymous'],
    tags: ['@todomvc'],
  },
  restfulbooker: {
    baseURL: appConfig.bookerBaseURL,
    roles: ['admin'],
    tags: ['@restfulbooker'],
  },
} satisfies Record<string, ApplicationConfig>;

export type ApplicationName = keyof typeof applications;
