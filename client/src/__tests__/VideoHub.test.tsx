import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { VideoHub } from "../components/fanClub/videos/VideoHub";
import { Toaster } from "../components/ui/sonner";
import { json, mockApi, videoProgram } from "./videoFixtures";

const API_URL = "http://localhost:3001";

// Newest first: program 4 is the newest; program 3 lost its third part.
const catalog = () =>
  json({
    programs: [videoProgram(4), videoProgram(3, [3]), videoProgram(2)],
  });

function renderHub(route = "/fan-clu") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <VideoHub />
        <Toaster />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const featured = () =>
  screen
    .getByRole("link", { name: /^mirar/i })
    .closest<HTMLElement>("div.rounded-3xl")!;

beforeEach(() => {
  vi.stubEnv("VITE_API_URL", API_URL);
  localStorage.clear();
  // jsdom lacks it; the toast calls it when pressed.
  Element.prototype.setPointerCapture = () => undefined;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("VideoHub", () => {
  it("features the newest program and lists the rest by year", async () => {
    mockApi({ "/fan-clu/videos": catalog });

    renderHub();

    expect(
      await screen.findByRole("heading", { name: "Programa 4" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Mirar el programa 4" }),
    ).toHaveAttribute("href", "/fan-clu/programa/4");
    expect(screen.getByRole("heading", { name: "2025" })).toBeInTheDocument();
    const older = screen.getAllByRole("link", { name: /^programa \d/i });
    expect(older.map((link) => link.getAttribute("href"))).toEqual([
      "/fan-clu/programa/3",
      "/fan-clu/programa/2",
    ]);
  });

  it("turns tiles into the chosen genre's parts, each opening its part", async () => {
    const user = userEvent.setup();
    mockApi({ "/fan-clu/videos": catalog });

    renderHub();
    await user.click(await screen.findByRole("button", { name: "Prog" }));

    // Program 4's prog part is episode 11.
    expect(
      screen.getByRole("link", { name: "Mirar Disco 11" }),
    ).toHaveAttribute("href", "/fan-clu/programa/4?parte=2");
    expect(within(featured()).getByText("Último de prog")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /disco 8 - banda 8/i }),
    ).toHaveAttribute("href", "/fan-clu/programa/3?parte=2");
  });

  it("marks a lost part in the filtered list", async () => {
    mockApi({ "/fan-clu/videos": catalog });

    renderHub("/fan-clu?genero=pop");

    const lost = await screen.findByRole("link", {
      name: /disco 9 - banda 9/i,
    });
    expect(within(lost).getByText("Sin video")).toBeInTheDocument();
  });

  it("searches by program number, album or band, ignoring accents", async () => {
    const user = userEvent.setup();
    mockApi({ "/fan-clu/videos": catalog });

    renderHub();
    const search = await screen.findByRole("searchbox", { name: /buscar/i });
    await user.type(search, "3");
    expect(
      screen
        .getAllByRole("link", { name: /^programa \d/i })
        .map((l) => l.getAttribute("href")),
    ).toEqual(["/fan-clu/programa/3"]);

    // A number doesn't match inside a longer one ("12").
    await user.clear(search);
    await user.type(search, "2");
    expect(
      screen
        .getAllByRole("link", { name: /^programa \d/i })
        .map((l) => l.getAttribute("href")),
    ).toEqual(["/fan-clu/programa/2"]);

    await user.clear(search);
    await user.type(search, "BÁNDA 5");
    expect(
      screen
        .getAllByRole("link", { name: /^programa \d/i })
        .map((l) => l.getAttribute("href")),
    ).toEqual(["/fan-clu/programa/2"]);

    await user.clear(search);
    await user.type(search, "nada que ver");
    expect(
      screen.getByText("No hay videos que coincidan."),
    ).toBeInTheDocument();
  });

  it("keeps what you were watching under any filter, and lets you remove it with undo", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      "fan-club-video-progress:2-2",
      JSON.stringify({ t: 120, d: 3600, at: 1 }),
    );
    mockApi({ "/fan-clu/videos": catalog });

    renderHub("/fan-clu?genero=metal");

    const row = (await screen.findByRole("heading", { name: "Seguí mirando" }))
      .parentElement!;
    expect(
      within(row).getByRole("link", { name: /disco 5 - banda 5/i }),
    ).toHaveAttribute("href", "/fan-clu/programa/2?parte=2");

    await user.click(
      within(row).getByRole("button", { name: /sacar de “seguí mirando”/i }),
    );
    expect(
      screen.queryByRole("heading", { name: "Seguí mirando" }),
    ).not.toBeInTheDocument();

    await user.click(await screen.findByRole("button", { name: "Deshacer" }));
    expect(
      await screen.findByRole("heading", { name: "Seguí mirando" }),
    ).toBeInTheDocument();

    // Nor does a search that matches nothing hide it.
    await user.type(
      screen.getByRole("searchbox", { name: /buscar/i }),
      "nada que ver",
    );
    expect(
      screen.getByText("No hay videos que coincidan."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Seguí mirando" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Seguí mirando" }),
    ).toBeInTheDocument();
  });

  it("says so when the videos can't be loaded", async () => {
    mockApi({ "/fan-clu/videos": () => json({ error: "x" }, 500) });

    renderHub();

    expect(
      await screen.findByText(/no pudimos cargar los videos/i),
    ).toBeInTheDocument();
  });
});
