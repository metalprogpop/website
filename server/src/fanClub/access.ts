import type { SubscriptionStatus, UserRole } from "shared";

type AccessInput = {
  role: UserRole;
  // Status of the latest live subscription for the user's email, if any.
  latestStatus: SubscriptionStatus | null;
};

// Who sees the Fan Club content instead of its public home: staff, and fans
// whose latest subscription is active.
export const hasFanClubAccess = ({ role, latestStatus }: AccessInput) =>
  role === "staff" || latestStatus === "active";
