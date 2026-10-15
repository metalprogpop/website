import { z } from "zod";

// Pure rules that turn the legacy subscriber spreadsheet into subscriber and
// subscription rows. No I/O here so the rules can be unit-tested.
//
// Sheet columns (header on row 2): Email, Nombre, Apellido, Estado,
// Fecha de subscripción, Fecha cancelacion, Plan, Plataforma, Contactadx,
// Contestó, En HoF?, Fan Spotlight, Fan name, and an untitled notes column.

export type Platform = "mercadopago" | "patreon";
export type Status = "active" | "paused" | "cancelled";

export type ImportedSubscription = {
  platform: Platform | null;
  amount: string | null;
  currency: string | null;
  status: Status;
  startedOn: string | null;
  endedOn: string | null;
  planOriginal: string | null;
  notes: string | null;
};

export type ImportedSubscriber = {
  email: string;
  firstName: string | null;
  lastName: string | null;
  fanName: string | null;
  fanSpotlight: boolean;
  contacted: boolean;
  replied: boolean;
  notes: string | null;
  subscriptions: ImportedSubscription[];
};

export type ImportResult = {
  subscribers: ImportedSubscriber[];
  warnings: string[];
};

const COLUMN = {
  email: 0,
  firstName: 1,
  lastName: 2,
  status: 3,
  startedOn: 4,
  endedOn: 5,
  plan: 6,
  platform: 7,
  contacted: 8,
  replied: 9,
  // Column 10 ("En HoF") was an opt-in list. The Hall of Fans now shows
  // every subscriber unless staff hide them, so it is not imported.
  fanSpotlight: 11,
  fanName: 12,
  extraNotes: 13,
} as const;

const HEADER_ROWS = 2;

const emailFormat = z.string().email();

const text = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
};

const joinNotes = (...parts: (string | null)[]): string | null => {
  const present = parts.filter((p): p is string => p !== null);
  return present.length > 0 ? present.join(" · ") : null;
};

export const normalizeEmail = (value: unknown): string | null =>
  text(value)?.toLowerCase() ?? null;

export const parsePlatform = (value: unknown): Platform | null => {
  const raw = text(value)?.toLowerCase();
  if (!raw) {
    return null;
  }
  if (raw.includes("mercado")) {
    return "mercadopago";
  }
  if (raw.includes("patreon")) {
    return "patreon";
  }
  return null;
};

// "mpp1000" (MercadoPago) → 1000 ARS, "mpp5" (Patreon) → 5 USD,
// "mpp4,5 euros" → 4.50 EUR, "mpp100MX" → 100 MXN. Comma is the decimal mark.
export const parsePlan = (
  value: unknown,
  platform: Platform | null,
): { amount: string | null; currency: string | null } => {
  const raw = text(value)?.toLowerCase();
  if (!raw) {
    return { amount: null, currency: null };
  }
  // Dots followed by exactly three digits are thousands separators
  // ("mpp1.000"); a comma is the decimal mark ("mpp4,5").
  const normalized = raw.replace(/\.(?=\d{3}(?!\d))/g, "").replace(",", ".");
  const match = /(\d+(?:\.\d+)?)/.exec(normalized);
  const amount = match?.[1] ? Number(match[1]).toFixed(2) : null;

  let currency: string | null = null;
  if (raw.includes("euro")) {
    currency = "EUR";
  } else if (raw.includes("mx")) {
    currency = "MXN";
  } else if (platform === "mercadopago") {
    currency = "ARS";
  } else if (platform === "patreon") {
    currency = "USD";
  }
  return { amount, currency };
};

// Known values map directly; any other text that mentions a cancellation is
// kept as a note on a cancelled subscription.
export const parseStatus = (
  value: unknown,
): { status: Status; note: string | null } | null => {
  const raw = text(value);
  if (!raw) {
    return null;
  }
  const normalized = raw.toLowerCase();
  if (["activa", "re-activa", "reactivada"].includes(normalized)) {
    return { status: "active", note: null };
  }
  if (normalized === "cancelada") {
    return { status: "cancelled", note: null };
  }
  if (normalized === "pausada") {
    return { status: "paused", note: null };
  }
  if (normalized.includes("cancel")) {
    return { status: "cancelled", note: raw };
  }
  return null;
};

// Dates come as Date cells; free text in a date column becomes a note.
export const parseDateCell = (
  value: unknown,
): { date: string | null; note: string | null } => {
  if (value instanceof Date) {
    return { date: value.toISOString().slice(0, 10), note: null };
  }
  return { date: null, note: text(value) };
};

// Checkbox-like columns hold "x"; any other text also means "yes" and is kept
// as a note so nothing is lost.
export const parseFlag = (
  value: unknown,
  label: string,
): { flag: boolean; note: string | null } => {
  const raw = text(value);
  if (!raw) {
    return { flag: false, note: null };
  }
  return {
    flag: true,
    note: raw.toLowerCase() === "x" ? null : `${label}: ${raw}`,
  };
};

const mergeText = (current: string | null, next: string | null) =>
  current ?? next;

export const buildImport = (rows: readonly (readonly unknown[])[]) => {
  const byEmail = new Map<string, ImportedSubscriber>();
  const warnings: string[] = [];

  rows.slice(HEADER_ROWS).forEach((row, index) => {
    const rowNumber = index + HEADER_ROWS + 1;
    const cell = (column: number): unknown => row[column];

    if (row.every((value) => text(value) === null)) {
      return;
    }

    const email = normalizeEmail(cell(COLUMN.email));
    if (!email) {
      warnings.push(`Fila ${rowNumber}: sin email, no se importa.`);
      return;
    }
    if (!emailFormat.safeParse(email).success) {
      warnings.push(
        `Fila ${rowNumber} (${email}): email inválido, no se importa.`,
      );
      return;
    }

    const status = parseStatus(cell(COLUMN.status));
    if (!status) {
      warnings.push(
        `Fila ${rowNumber} (${email}): estado desconocido, no se importa.`,
      );
      return;
    }

    const platform = parsePlatform(cell(COLUMN.platform));
    const plan = parsePlan(cell(COLUMN.plan), platform);
    const started = parseDateCell(cell(COLUMN.startedOn));
    const ended = parseDateCell(cell(COLUMN.endedOn));
    const contacted = parseFlag(cell(COLUMN.contacted), "Contactadx");
    const replied = parseFlag(cell(COLUMN.replied), "Contestó");
    const spotlight = parseFlag(cell(COLUMN.fanSpotlight), "Fan Spotlight");

    const subscription: ImportedSubscription = {
      platform,
      amount: plan.amount,
      currency: plan.currency,
      status: status.status,
      startedOn: started.date,
      endedOn: ended.date,
      planOriginal: text(cell(COLUMN.plan)),
      notes: joinNotes(
        status.note,
        started.note,
        ended.note,
        text(cell(COLUMN.extraNotes)),
      ),
    };

    const personNotes = joinNotes(
      contacted.note,
      replied.note,
      spotlight.note,
    );

    const existing = byEmail.get(email);
    if (existing) {
      existing.firstName = mergeText(
        existing.firstName,
        text(cell(COLUMN.firstName)),
      );
      existing.lastName = mergeText(
        existing.lastName,
        text(cell(COLUMN.lastName)),
      );
      existing.fanName = mergeText(
        existing.fanName,
        text(cell(COLUMN.fanName)),
      );
      existing.fanSpotlight ||= spotlight.flag;
      existing.contacted ||= contacted.flag;
      existing.replied ||= replied.flag;
      existing.notes = joinNotes(existing.notes, personNotes);
      existing.subscriptions.push(subscription);
      return;
    }

    byEmail.set(email, {
      email,
      firstName: text(cell(COLUMN.firstName)),
      lastName: text(cell(COLUMN.lastName)),
      fanName: text(cell(COLUMN.fanName)),
      fanSpotlight: spotlight.flag,
      contacted: contacted.flag,
      replied: replied.flag,
      notes: personNotes,
      subscriptions: [subscription],
    });
  });

  return {
    subscribers: [...byEmail.values()],
    warnings,
  } satisfies ImportResult;
};
