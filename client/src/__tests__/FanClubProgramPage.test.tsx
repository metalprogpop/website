import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FanClubProgramPage } from "../pages/FanClubProgramPage";
import { PlayerProvider } from "../player/PlayerProvider";
import { json, mockApi, videoProgram } from "./videoFixtures";

const API_URL = "http://localhost:3001";

const member = () =>
  json({ id: 1, email: "fan@example.com", role: "fan", fanClubAccess: true });

const catalog = () =>
  json({ programs: [videoProgram(4), videoProgram(3, [3]), videoProgram(2)] });

const urls = (name: string) => () =>
  json({
    url: `https://media.example.com/${name}.mp4?sig=1`,
    downloadUrl: `https://media.example.com/${name}.mp4?sig=1&download=1`,
    expiresAt: "2026-01-02T00:00:00.000Z",
  });

function renderPage(route: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <PlayerProvider>
          <Routes>
            <Route path="/fan-clu" element={<p>Inicio del Fan Clú</p>} />
            <Route
              path="/fan-clu/programa/:programNumber"
              element={<FanClubProgramPage />}
            />
          </Routes>
        </PlayerProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const video = () => screen.getByLabelText(/^video: programa/i);

beforeEach(() => {
  vi.stubEnv("VITE_API_URL", API_URL);
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("FanClubProgramPage", () => {
  it("sends visitors without access to the Fan Clú's home", async () => {
    mockApi({
      "/auth/me": () =>
        json({
          id: 1,
          email: "fan@example.com",
          role: "fan",
          fanClubAccess: false,
        }),
    });

    renderPage("/fan-clu/programa/4");

    expect(await screen.findByText("Inicio del Fan Clú")).toBeInTheDocument();
  });

  it("plays the requested part from its presigned URL and offers the download", async () => {
    mockApi({
      "/auth/me": member,
      "/fan-clu/videos/3/2/urls": urls("p3-2"),
      "/fan-clu/videos": catalog,
    });

    renderPage("/fan-clu/programa/3?parte=2");

    expect(
      await screen.findByRole("heading", { level: 1, name: "Disco 8" }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(video().getAttribute("src")).toBe(
        "https://media.example.com/p3-2.mp4?sig=1",
      );
    });
    expect(screen.getByRole("link", { name: /descargar/i })).toHaveAttribute(
      "href",
      "https://media.example.com/p3-2.mp4?sig=1&download=1",
    );
    expect(
      screen.getByRole("link", { name: /escuchar el episodio/i }),
    ).toHaveAttribute("href", "/episodes/8-disco-8");
  });

  it("explains a lost part instead of playing it", async () => {
    const fetchSpy = mockApi({
      "/auth/me": member,
      "/fan-clu/videos": catalog,
    });

    renderPage("/fan-clu/programa/3?parte=3");

    expect(await screen.findByText("Este video no existe")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /descargar/i }),
    ).not.toBeInTheDocument();
    expect(
      fetchSpy.mock.calls.some(([input]) =>
        (input instanceof Request ? input.url : input.toString()).includes(
          "/urls",
        ),
      ),
    ).toBe(false);
  });

  it("switches parts from the playlist", async () => {
    const user = userEvent.setup();
    mockApi({
      "/auth/me": member,
      "/fan-clu/videos/4/1/urls": urls("p4-1"),
      "/fan-clu/videos/4/3/urls": urls("p4-3"),
      "/fan-clu/videos": catalog,
    });

    renderPage("/fan-clu/programa/4");
    await user.click(await screen.findByRole("button", { name: /disco 12/i }));

    expect(
      await screen.findByRole("heading", { level: 1, name: "Disco 12" }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(video().getAttribute("src")).toContain("p4-3");
    });
  });

  it("asks for a new URL when the current one stops working", async () => {
    let signed = 0;
    mockApi({
      "/auth/me": member,
      "/fan-clu/videos/4/1/urls": () => {
        signed += 1;
        return urls(`p4-1-v${String(signed)}`)();
      },
      "/fan-clu/videos": catalog,
    });

    renderPage("/fan-clu/programa/4");
    await waitFor(() => {
      expect(video().getAttribute("src")).toContain("p4-1-v1");
    });

    fireEvent.error(video());

    await waitFor(() => {
      expect(video().getAttribute("src")).toContain("p4-1-v2");
    });
  });

  it("resumes at the same second after renewing, and gives up after a second failure", async () => {
    let signed = 0;
    mockApi({
      "/auth/me": member,
      "/fan-clu/videos/4/1/urls": () => {
        signed += 1;
        return urls(`p4-1-v${String(signed)}`)();
      },
      "/fan-clu/videos": catalog,
    });

    renderPage("/fan-clu/programa/4");
    await waitFor(() => {
      expect(video().getAttribute("src")).toContain("p4-1-v1");
    });
    (video() as HTMLVideoElement).currentTime = 754;
    fireEvent.error(video());
    await waitFor(() => {
      expect(video().getAttribute("src")).toContain("p4-1-v2");
    });
    (video() as HTMLVideoElement).currentTime = 0;
    fireEvent.loadedMetadata(video());
    expect((video() as HTMLVideoElement).currentTime).toBe(754);

    fireEvent.error(video());
    expect(
      await screen.findByText("No pudimos cargar el video."),
    ).toBeInTheDocument();
    expect(signed).toBe(2);
  });

  it("moves on to the next part when one ends", async () => {
    mockApi({
      "/auth/me": member,
      "/fan-clu/videos/4/1/urls": urls("p4-1"),
      "/fan-clu/videos/4/2/urls": urls("p4-2"),
      "/fan-clu/videos/3/2/urls": urls("p3-2"),
      "/fan-clu/videos": catalog,
    });

    renderPage("/fan-clu/programa/4");
    await waitFor(() => {
      expect(video().getAttribute("src")).toContain("p4-1");
    });
    fireEvent.ended(video());
    expect(
      await screen.findByRole("heading", { level: 1, name: "Disco 11" }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(video().getAttribute("src")).toContain("p4-2");
    });
  });
});
