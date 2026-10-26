import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { LandingPage } from "../pages/LandingPage";
import { EpisodesPage } from "../pages/EpisodesPage";
import { FanCluPage } from "../pages/FanCluPage";
import { AboutPage } from "../pages/AboutPage";

function renderWithProviders(initialRoute: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/episodes" element={<EpisodesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/fan-clu" element={<FanCluPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ items: [] })),
  );
});

describe("App routing", () => {
  it("renders landing page at /", () => {
    renderWithProviders("/");
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("leads to the Fan Clú from the header and from its section on the home", () => {
    // Earlier renders stay mounted in this file, so look only at this one.
    const page = within(renderWithProviders("/").container);
    expect(
      within(page.getByRole("banner")).getByRole("link", { name: "Sumate" }),
    ).toHaveAttribute("href", "/fan-clu");
    expect(
      page.getByRole("heading", { level: 2, name: /bancá el programa/i }),
    ).toBeInTheDocument();
    expect(
      page.getByRole("link", { name: /sumate al fan clú/i }),
    ).toHaveAttribute("href", "/fan-clu");
  });

  it("renders episodes page at /episodes", () => {
    renderWithProviders("/episodes");
    expect(
      screen.getByRole("heading", { level: 1, name: /todos los episodios/i }),
    ).toBeInTheDocument();
  });

  it("renders about page at /about", () => {
    renderWithProviders("/about");
    expect(
      screen.getByRole("heading", { level: 2, name: /quiénes somos/i }),
    ).toBeInTheDocument();
  });

  it("renders fan clú page at /fan-clu", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    );

    renderWithProviders("/fan-clu");
    expect(
      await screen.findByRole("heading", { level: 1, name: /fan clú/i }),
    ).toBeInTheDocument();
  });
});
