import 'dotenv/config';

export const appConfig = {
  sauceBaseURL: process.env.SAUCE_BASE_URL ?? 'https://www.saucedemo.com',
  todoMVCBaseURL: process.env.TODOMVC_BASE_URL ?? 'https://demo.playwright.dev/todomvc',
  bookerBaseURL:
    process.env.RESTFUL_BOOKER_BASE_URL ?? 'https://restful-booker.herokuapp.com',
};
