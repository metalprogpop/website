// Dev-only login helpers. Vite's dev server sets DEV; a production build
// never shows the test login, whatever the flags say.
export const isTestUsersEnabled = (): boolean =>
  import.meta.env.DEV && import.meta.env.VITE_TEST_USERS_ENABLED === "true";

export const isDevShowMagicLink = (): boolean =>
  import.meta.env.VITE_DEV_SHOW_MAGIC_LINK === "true";

// The dev login button's email; it must be in the server's TEST_USER_EMAILS.
export const testUserEmail = (): string => {
  const email: unknown = import.meta.env.VITE_TEST_USER_EMAIL;
  return typeof email === "string" && email !== "" ? email : "test@example.com";
};
