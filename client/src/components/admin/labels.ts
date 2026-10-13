import type { Platform, SubscriptionStatus } from "shared";

export const statusLabels: Record<SubscriptionStatus, string> = {
  active: "Activa",
  paused: "Pausada",
  cancelled: "Cancelada",
};

export const statusBadgeVariant: Record<
  SubscriptionStatus,
  "success" | "outline" | "danger"
> = {
  active: "success",
  paused: "outline",
  cancelled: "danger",
};

export const platformLabels: Record<Platform, string> = {
  mercadopago: "MercadoPago",
  patreon: "Patreon",
};

export const statusOptions = Object.entries(statusLabels).map(
  ([value, label]) => ({ value, label }),
);

export const platformOptions = Object.entries(platformLabels).map(
  ([value, label]) => ({ value, label }),
);

const statuses: readonly string[] = Object.keys(statusLabels);
const platforms: readonly string[] = Object.keys(platformLabels);

export const isStatus = (value: string): value is SubscriptionStatus =>
  statuses.includes(value);

export const isPlatform = (value: string): value is Platform =>
  platforms.includes(value);
