import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminPage } from "../pages/AdminPage";

const API_URL = "http://localhost:3001";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const timestamps = {
  createdAt: "2026-10-12T00:00:00.000Z",
  updatedAt: "2026-10-12T00:00:00.000Z",
  deletedAt: null,
};

const subscriber = {
  id: 7,
  email: "ana@example.com",
  firstName: "Ana",
  lastName: "Pérez",
  fanName: "Ana Prog",
  hiddenFromHallOfFans: false,
  fanSpotlight: false,
  contacted: true,
  replied: false,
  notes: null,
  ...timestamps,
  subscriptionCount: 1,
  latestSubscription: {
    id: 70,
    subscriberId: 7,
    platform: "mercadopago",
    amount: "1000.00",
    currency: "ARS",
    status: "active",
    startedOn: "2024-03-01",
    endedOn: null,
    planOriginal: "mpp1000",
    notes: null,
    ...timestamps,
  },
};

const list = {
  items: [subscriber],
  total: 1,
  page: 1,
  pageSize: 50,
  counts: { active: 1, paused: 0, cancelled: 0 },
};

const mockApi = (role: "fan" | "staff") => {
  const fetchMock = vi
    .spyOn(globalThis, "fetch")
    .mockImplementation((input, init) => {
      const url = input instanceof Request ? input.url : String(input);
      if (url.endsWith("/api/v1/auth/me")) {
        return Promise.resolve(
          jsonResponse({
            id: 1,
            email: "staff@example.com",
            role,
            fanClubAccess: role === "staff",
          }),
        );
      }
      if (
        url.endsWith("/api/v1/admin/subscribers/7") &&
        init?.method === "PATCH"
      ) {
        return Promise.resolve(
          jsonResponse({ ...subscriber, firstName: "Anita" }),
        );
      }
      if (url.includes("/api/v1/admin/subscribers?")) {
        return Promise.resolve(jsonResponse(list));
      }
      if (url.includes("/api/v1/admin/subscribers/7/subscriptions")) {
        return Promise.resolve(jsonResponse([subscriber.latestSubscription]));
      }
      return Promise.resolve(jsonResponse({ error: "Not found" }, 404));
    });
  return fetchMock;
};

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/admin"]}>
        <AdminPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  vi.stubEnv("VITE_API_URL", API_URL);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("AdminPage", () => {
  it("shows not found to non-staff users", async () => {
    mockApi("fan");
    renderPage();
    expect(
      await screen.findByRole("heading", { name: /página no encontrada/i }),
    ).toBeInTheDocument();
  });

  it("lists subscribers in an editable grid for staff", async () => {
    mockApi("staff");
    renderPage();
    const firstName = await screen.findByRole("textbox", {
      name: "Nombre de ana@example.com",
    });
    expect(firstName).toHaveValue("Ana");
    expect(screen.getByText("1 activas")).toBeInTheDocument();
    // Only names are editable; the rest of the row is read-only text.
    expect(
      screen.queryByRole("textbox", { name: /email de ana@example.com/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(screen.getByText("Activa")).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: "Baja" }),
    ).not.toBeInTheDocument();
  });

  it("saves an edited cell with a PATCH of that field only", async () => {
    const fetchMock = mockApi("staff");
    renderPage();
    const firstName = await screen.findByRole("textbox", {
      name: "Nombre de ana@example.com",
    });
    await userEvent.clear(firstName);
    await userEvent.type(firstName, "Anita{Enter}");

    await waitFor(() => {
      const patch = fetchMock.mock.calls.find(
        ([, init]) => init?.method === "PATCH",
      );
      expect(patch?.[1]?.body).toBe(JSON.stringify({ firstName: "Anita" }));
    });
  });

  it("hides a subscriber from the Hall of Fans from the expanded row", async () => {
    const fetchMock = mockApi("staff");
    renderPage();
    await userEvent.click(
      await screen.findByRole("button", { name: "Detalle de ana@example.com" }),
    );
    const shown = await screen.findByRole("checkbox", {
      name: /mostrar en el hall of fans/i,
    });
    expect(shown).toBeChecked();

    await userEvent.click(shown);

    await waitFor(() => {
      const patch = fetchMock.mock.calls.find(
        ([, init]) => init?.method === "PATCH",
      );
      expect(patch?.[1]?.body).toBe(
        JSON.stringify({ hiddenFromHallOfFans: true }),
      );
    });
  });
});
