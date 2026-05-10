export const isTestUsersEnabled = (): boolean =>
  import.meta.env.VITE_TEST_USERS_ENABLED === "true";

export const isDevShowMagicLink = (): boolean =>
  import.meta.env.VITE_DEV_SHOW_MAGIC_LINK === "true";

export const TEST_USER_EMAIL = "test@example.com";
