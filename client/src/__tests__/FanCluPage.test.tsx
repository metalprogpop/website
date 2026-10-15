import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FanCluPage } from "../pages/FanCluPage";

const API_URL = "http://localhost:3001";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const anonymous = () => json({ error: "Unauthorized" }, 401);

const signedIn = (fanClubAccess: boolean, role = "fan") =>
  json({ id: 1, email: "fan@example.com", role, fanClubAccess });

const hallOfFans = () => json({ names: ["Vitooor", "Ana Pérez"] });

type Routes = Record<string, () => Response>;

// Answers each request by the first route whose path is in its URL, so the
// page's parallel requests can arrive in any order.
function mockApi(routes: Routes) {
  const all: Routes = { "/fan-clu/hall-of-fans": hallOfFans, ...routes };
  return vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    const route = Object.entries(all).find(([path]) => url.includes(path));
    if (!route) {
      return Promise.reject(new Error(`Unmocked request: ${url}`));
    }
    return Promise.resolve(route[1]());
  });
}

function renderPage(route = "/fan-clu") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <FanCluPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.stubEnv("VITE_API_URL", API_URL);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("FanCluPage", () => {
  it("shows anonymous visitors how to join, the login form and the Hall of Fans", async () => {
    mockApi({ "/auth/me": anonymous });

    renderPage();

    expect(
      await screen.findByRole("heading", { level: 1, name: /fan clú/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ars 5000/i })).toHaveAttribute(
      "href",
      "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=2c93808472826fcd017290ddf1e50f05",
    );
    expect(screen.getByRole("link", { name: /otro monto/i })).toHaveAttribute(
      "href",
      "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=2c938084865eb593018660df0bc501e1",
    );
    expect(screen.getByRole("link", { name: /patreon/i })).toHaveAttribute(
      "href",
      "https://www.patreon.com/metalprogpop",
    );
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();

    const hall = screen.getByRole("region", { name: /hall of fans/i });
    expect(await within(hall).findByText("Vitooor")).toBeInTheDocument();
    expect(within(hall).getByText("Ana Pérez")).toBeInTheDocument();
  });

  it("tells signed-in fans without an active subscription how to join", async () => {
    const user = userEvent.setup();
    mockApi({
      "/auth/me": () => signedIn(false),
      "/auth/logout": () => json({ ok: true }),
    });

    renderPage();

    expect(await screen.findByText("fan@example.com")).toBeInTheDocument();
    expect(
      screen.getByText(/no tiene una suscripción activa/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ars 5000/i })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/email/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /cerrar sesión/i }));
    expect(await screen.findByPlaceholderText(/email/i)).toBeInTheDocument();
  });

  it.each([
    ["active subscribers", "fan"],
    ["staff", "staff"],
  ])("welcomes %s and shows the Hall of Fans", async (_who, role) => {
    mockApi({ "/auth/me": () => signedIn(true, role) });

    renderPage();

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /gracias por el aguante/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/videos/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /cerrar sesión/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /ars 5000/i }),
    ).not.toBeInTheDocument();

    const hall = screen.getByRole("region", { name: /hall of fans/i });
    expect(await within(hall).findByText("Vitooor")).toBeInTheDocument();
  });

  it("shows confirmation message after submitting email", async () => {
    const user = userEvent.setup();
    mockApi({
      "/auth/me": anonymous,
      "/magic-link": () =>
        json({
          message:
            "Si tu email está registrado, te enviamos un link de acceso.",
        }),
    });

    renderPage();

    const emailInput = await screen.findByPlaceholderText(/email/i);
    await user.type(emailInput, "fan@example.com");
    await user.click(screen.getByRole("button", { name: /enviar/i }));

    expect(await screen.findByText(/te enviamos/i)).toBeInTheDocument();
  });

  it("shows error message when error query param is present", async () => {
    mockApi({ "/auth/me": anonymous });

    renderPage("/fan-clu?error=invalid");

    expect(
      await screen.findByText(/link.*inválido|expirado/i),
    ).toBeInTheDocument();
  });

  it("hides dev branches when flags are off", async () => {
    vi.stubEnv("VITE_TEST_USERS_ENABLED", "false");
    vi.stubEnv("VITE_DEV_SHOW_MAGIC_LINK", "false");
    mockApi({ "/auth/me": anonymous });

    renderPage();

    await screen.findByPlaceholderText(/email/i);
    expect(screen.queryByTestId("dev-test-login")).not.toBeInTheDocument();
  });

  it("renders test-user button and submits TEST_USER_EMAIL when flag is on", async () => {
    vi.stubEnv("VITE_TEST_USERS_ENABLED", "true");
    const user = userEvent.setup();
    let loggedIn = false;
    const fetchSpy = mockApi({
      "/auth/me": () => (loggedIn ? signedIn(false) : anonymous()),
      "/magic-link": () => {
        loggedIn = true;
        return json({ authenticated: true, message: "ok" });
      },
    });

    renderPage();

    const button = await screen.findByTestId("dev-test-login");
    await user.click(button);

    const magicLinkCall = fetchSpy.mock.calls.find(
      ([url]) => typeof url === "string" && url.includes("/magic-link"),
    );
    expect(magicLinkCall).toBeDefined();
    const body = JSON.parse(
      (magicLinkCall?.[1]?.body as string | undefined) ?? "{}",
    ) as { email?: string };
    expect(body.email).toBe("test@example.com");
  });

  it("renders magic link in success state when DEV_SHOW_MAGIC_LINK on", async () => {
    vi.stubEnv("VITE_DEV_SHOW_MAGIC_LINK", "true");
    const user = userEvent.setup();
    const link = "http://localhost:13001/api/v1/auth/verify?token=abc123";
    mockApi({
      "/auth/me": anonymous,
      "/magic-link": () => json({ message: "ok", magicLink: link }),
    });

    renderPage();

    const emailInput = await screen.findByPlaceholderText(/email/i);
    await user.type(emailInput, "fan@example.com");
    await user.click(screen.getByRole("button", { name: /enviar/i }));

    const anchor = await screen.findByTestId("dev-magic-link");
    expect(anchor).toHaveAttribute("href", link);
  });
});
