import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FanCluPage } from "../pages/FanCluPage";

const API_URL = "http://localhost:3001";

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
  it("renders teaser and login form when unauthenticated", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    );

    renderPage();

    expect(
      await screen.findByRole("heading", { name: /fan clú/i }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enviar/i })).toBeInTheDocument();
  });

  it("renders welcome message when authenticated", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 1, email: "fan@example.com" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    renderPage();

    expect(await screen.findByText(/bienvenid/i)).toBeInTheDocument();
  });

  it("shows confirmation message after submitting email", async () => {
    const user = userEvent.setup();

    // First call: /me returns 401
    // Second call: /magic-link returns 200
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            message:
              "Si tu email está registrado, te enviamos un link de acceso.",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      );

    renderPage();

    const emailInput = await screen.findByPlaceholderText(/email/i);
    await user.type(emailInput, "fan@example.com");
    await user.click(screen.getByRole("button", { name: /enviar/i }));

    expect(await screen.findByText(/te enviamos/i)).toBeInTheDocument();
  });

  it("shows error message when error query param is present", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    );

    renderPage("/fan-clu?error=invalid");

    expect(
      await screen.findByText(/link.*inválido|expirado/i),
    ).toBeInTheDocument();
  });

  it("hides dev branches when flags are off", async () => {
    vi.stubEnv("VITE_TEST_USERS_ENABLED", "false");
    vi.stubEnv("VITE_DEV_SHOW_MAGIC_LINK", "false");
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    );

    renderPage();

    await screen.findByPlaceholderText(/email/i);
    expect(screen.queryByTestId("dev-test-login")).not.toBeInTheDocument();
  });

  it("renders test-user button and submits TEST_USER_EMAIL when flag is on", async () => {
    vi.stubEnv("VITE_TEST_USERS_ENABLED", "true");
    const user = userEvent.setup();

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ authenticated: true, message: "ok" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 1, email: "test@example.com" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

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
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "ok", magicLink: link }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    renderPage();

    const emailInput = await screen.findByPlaceholderText(/email/i);
    await user.type(emailInput, "fan@example.com");
    await user.click(screen.getByRole("button", { name: /enviar/i }));

    const anchor = await screen.findByTestId("dev-magic-link");
    expect(anchor).toHaveAttribute("href", link);
  });
});
