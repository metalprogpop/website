import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { LandingPage } from "../pages/LandingPage";
import { EpisodesPage } from "../pages/EpisodesPage";
import { FanCluPage } from "../pages/FanCluPage";

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
          <Route path="/fan-clu" element={<FanCluPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response('<?xml version="1.0"?><rss><channel></channel></rss>'),
  );
});

describe("App routing", () => {
  it("renders landing page at /", () => {
    renderWithProviders("/");
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("renders episodes page at /episodes", () => {
    renderWithProviders("/episodes");
    expect(
      screen.getByRole("heading", { level: 1, name: /todos los episodios/i }),
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
