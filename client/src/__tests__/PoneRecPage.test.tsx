import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PoneRec } from "shared";
import { PoneRecPage } from "../pages/PoneRecPage";
import { MiniPlayer } from "../player/MiniPlayer";
import { PlayerProvider } from "../player/PlayerProvider";
import { json, mockApi } from "./videoFixtures";

const API_URL = "http://localhost:3001";

const rec = (program: number, overrides: Partial<PoneRec> = {}): PoneRec => ({
  program,
  mainTopic: `Tema del ${String(program)}`,
  publishedAt: new Date(
    Date.UTC(program > 90 ? 2026 : 2025, 2, 1),
  ).toISOString(),
  durationSeconds: 1260,
  thumbnailPath: `/api/v1/fan-clu/pone-rec/${String(program)}/thumbnail`,
  tags: [],
  ...overrides,
});

const catalog = () =>
  json({
    episodes: [
      rec(97, {
        mainTopic: "Los peores olores de nuestras vidas",
        tags: ["Malos olores"],
      }),
      rec(91, { tags: ["Viajes en micro"] }),
      rec(80),
    ],
  });

const member = () =>
  json({ id: 1, email: "fan@example.com", role: "fan", fanClubAccess: true });

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/fan-clu/pone-rec"]}>
        <PlayerProvider>
          <Routes>
            <Route path="/fan-clu" element={<p>Inicio del Fan Clú</p>} />
            <Route path="/fan-clu/pone-rec" element={<PoneRecPage />} />
          </Routes>
          <MiniPlayer />
        </PlayerProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const audio = () => document.querySelector("audio")!;

beforeEach(() => {
  vi.stubEnv("VITE_API_URL", API_URL);
  localStorage.clear();
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(
    () => undefined,
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("PoneRecPage", () => {
  it("sends visitors without access to the Fan Clú's home", async () => {
    mockApi({
      "/auth/me": () =>
        json({
          id: 1,
          email: "x@example.com",
          role: "fan",
          fanClubAccess: false,
        }),
    });
    renderPage();
    expect(await screen.findByText("Inicio del Fan Clú")).toBeInTheDocument();
  });

  it("lists episodes by year with only their main topic", async () => {
    mockApi({ "/auth/me": member, "/fan-clu/pone-rec": catalog });
    renderPage();

    expect(
      await screen.findByRole("heading", {
        name: "Los peores olores de nuestras vidas",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "2026" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "2025" })).toBeInTheDocument();
    // Tags are for search, never shown.
    expect(screen.queryByText("Malos olores")).not.toBeInTheDocument();
    expect(screen.queryByText(/viajes en micro/i)).not.toBeInTheDocument();
  });

  it("finds episodes by main topic or tag, ignoring accents", async () => {
    const user = userEvent.setup();
    mockApi({ "/auth/me": member, "/fan-clu/pone-rec": catalog });
    renderPage();
    const search = await screen.findByRole("searchbox", { name: /buscar/i });

    await user.type(search, "malos olores");
    expect(screen.getAllByRole("article")).toHaveLength(1);

    await user.clear(search);
    await user.type(search, "micró");
    expect(
      screen.getByRole("heading", { name: "Tema del 91" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(1);
  });

  it("plays in the mini-player from a signed URL, and re-signs it when it fails", async () => {
    const user = userEvent.setup();
    let signed = 0;
    mockApi({
      "/auth/me": member,
      "/fan-clu/pone-rec/97/url": () => {
        signed += 1;
        return json({
          url: `https://media.example.com/pr97.mp3?v=${String(signed)}`,
          expiresAt: "2026-01-02T00:00:00.000Z",
        });
      },
      "/fan-clu/pone-rec": catalog,
    });
    renderPage();

    await user.click(
      await screen.findByRole("button", {
        name: "Escuchar: Los peores olores de nuestras vidas",
      }),
    );
    await waitFor(() => {
      expect(audio().getAttribute("src")).toContain("pr97.mp3?v=1");
    });
    const bar = screen.getByRole("region", { name: "Reproductor" });
    expect(
      within(bar).getByRole("link", { name: /los peores olores/i }),
    ).toHaveAttribute("href", "/fan-clu/pone-rec");

    fireEvent.error(audio());
    await waitFor(() => {
      expect(audio().getAttribute("src")).toContain("pr97.mp3?v=2");
    });
    expect(signed).toBe(2);
  });
});
