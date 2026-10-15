import { describe, expect, it } from "vitest";
import {
  buildImport,
  parseDateCell,
  parseFlag,
  parsePlan,
  parsePlatform,
  parseStatus,
} from "./sheet-rules.js";

const header = [
  ["", "SALUDADOS", "chequear"],
  [
    "Email",
    "Nombre",
    "Apellido",
    "Estado",
    "Fecha de subscripción",
    "Fecha cancelacion",
    "Plan",
    "Plataforma",
    "Contactadx",
    "Contestó",
    "En HoF?",
    "Fan Spotlight",
    "Fan name",
  ],
];

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

describe("parsePlan", () => {
  it("uses ARS for MercadoPago and USD for Patreon", () => {
    expect(parsePlan("mpp1000", "mercadopago")).toEqual({
      amount: "1000.00",
      currency: "ARS",
    });
    expect(parsePlan("mpp5", "patreon")).toEqual({
      amount: "5.00",
      currency: "USD",
    });
  });

  it("reads comma decimals and explicit currencies", () => {
    expect(parsePlan("mpp4,5 euros", "patreon")).toEqual({
      amount: "4.50",
      currency: "EUR",
    });
    expect(parsePlan("mpp100MX", "patreon")).toEqual({
      amount: "100.00",
      currency: "MXN",
    });
    expect(parsePlan("mpp 5,5", "patreon")).toEqual({
      amount: "5.50",
      currency: "USD",
    });
  });

  it("treats a dot before three digits as a thousands separator", () => {
    expect(parsePlan("mpp1.000", "mercadopago")).toEqual({
      amount: "1000.00",
      currency: "ARS",
    });
    expect(parsePlan("mpp15.000", "mercadopago")).toEqual({
      amount: "15000.00",
      currency: "ARS",
    });
  });

  it("returns nulls for an empty plan", () => {
    expect(parsePlan(null, "mercadopago")).toEqual({
      amount: null,
      currency: null,
    });
  });
});

describe("parsePlatform", () => {
  it("maps known platforms and ignores the rest", () => {
    expect(parsePlatform("MercadoPago")).toBe("mercadopago");
    expect(parsePlatform("Patreon")).toBe("patreon");
    expect(parsePlatform(null)).toBeNull();
  });
});

describe("parseStatus", () => {
  it("maps the known values", () => {
    expect(parseStatus("activa")).toEqual({ status: "active", note: null });
    expect(parseStatus("re-activa")).toEqual({ status: "active", note: null });
    expect(parseStatus("reactivada")).toEqual({ status: "active", note: null });
    expect(parseStatus("cancelada ")).toEqual({
      status: "cancelled",
      note: null,
    });
    expect(parseStatus("pausada")).toEqual({ status: "paused", note: null });
  });

  it("keeps free text about a cancellation as a note", () => {
    expect(parseStatus("la cancelé el 25/11 por pedido de él")).toEqual({
      status: "cancelled",
      note: "la cancelé el 25/11 por pedido de él",
    });
  });

  it("rejects unknown or empty values", () => {
    expect(parseStatus("quién sabe")).toBeNull();
    expect(parseStatus(null)).toBeNull();
  });
});

describe("parseDateCell", () => {
  it("keeps real dates and turns text into a note", () => {
    expect(parseDateCell(day("2024-03-01"))).toEqual({
      date: "2024-03-01",
      note: null,
    });
    expect(parseDateCell("upgrade 17/07")).toEqual({
      date: null,
      note: "upgrade 17/07",
    });
    expect(parseDateCell(null)).toEqual({ date: null, note: null });
  });
});

describe("parseFlag", () => {
  it("treats x as yes without a note and keeps other text", () => {
    expect(parseFlag("x", "Contestó")).toEqual({ flag: true, note: null });
    expect(parseFlag("X", "Contestó")).toEqual({ flag: true, note: null });
    expect(parseFlag("PAGA DOS SUSC", "Contestó")).toEqual({
      flag: true,
      note: "Contestó: PAGA DOS SUSC",
    });
    expect(parseFlag(null, "Contestó")).toEqual({ flag: false, note: null });
  });
});

describe("buildImport", () => {
  it("merges repeated emails into one subscriber with history", () => {
    const result = buildImport([
      ...header,
      [
        " Ana@Example.com ",
        "Ana",
        "Pérez",
        "cancelada",
        day("2022-01-10"),
        "upgrade 13/02/23",
        "mpp500",
        "MercadoPago",
        "x",
        null,
        "x",
        null,
        "Ana Prog",
      ],
      [
        "ana@example.com",
        null,
        null,
        "activa",
        day("2023-02-13"),
        null,
        "mpp1000",
        "MercadoPago",
        null,
        "x",
        null,
        "x",
        null,
      ],
      [],
    ]);

    expect(result.warnings).toEqual([]);
    expect(result.subscribers).toHaveLength(1);
    const ana = result.subscribers.at(0);
    expect(ana).toMatchObject({
      email: "ana@example.com",
      firstName: "Ana",
      lastName: "Pérez",
      fanName: "Ana Prog",
      fanSpotlight: true,
      contacted: true,
      replied: true,
    });
    expect(ana?.subscriptions).toEqual([
      {
        platform: "mercadopago",
        amount: "500.00",
        currency: "ARS",
        status: "cancelled",
        startedOn: "2022-01-10",
        endedOn: null,
        planOriginal: "mpp500",
        notes: "upgrade 13/02/23",
      },
      {
        platform: "mercadopago",
        amount: "1000.00",
        currency: "ARS",
        status: "active",
        startedOn: "2023-02-13",
        endedOn: null,
        planOriginal: "mpp1000",
        notes: null,
      },
    ]);
  });

  it("skips rows without a valid email or with an unknown status", () => {
    const result = buildImport([
      ...header,
      [null, "Sin", "Mail", "activa"],
      ["b@example.com", "B", null, "???"],
      ["not-an-email", "C", null, "activa"],
    ]);
    expect(result.subscribers).toEqual([]);
    expect(result.warnings).toEqual([
      "Fila 3: sin email, no se importa.",
      "Fila 4 (b@example.com): estado desconocido, no se importa.",
      "Fila 5 (not-an-email): email inválido, no se importa.",
    ]);
  });
});
