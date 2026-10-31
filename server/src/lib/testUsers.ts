// Dev-only test users log in without a magic link. Two switches must both
// be on, and the server must run in development: a production server never
// honours them, even if the flags leak into its environment.

export const isFlagEnabled = (val: string | undefined): boolean =>
  val === "true" || val === "1";

const getTestUserEmails = (): readonly string[] => {
  const raw = process.env.TEST_USER_EMAILS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);
};

export const isTestUser = (email: string): boolean =>
  process.env.NODE_ENV === "development" &&
  isFlagEnabled(process.env.TEST_USERS_ENABLED) &&
  getTestUserEmails().includes(email.toLowerCase());
