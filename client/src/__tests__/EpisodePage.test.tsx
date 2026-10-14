import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { EpisodeDetail, EpisodeSummary } from "shared";
import { AppRoutes } from "../App";
import { PlayerProvider } from "../player/PlayerProvider";

const summary = (
  number: number,
  title: string,
  overrides: Partial<EpisodeSummary> = {},
): EpisodeSummary => {
  const [album = title, band = null] = title.split(" - ");
  return {
    number,
    slug: title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-"),
    title,
    album,
    band,
    genre: "prog",
    excerpt: `Reseña de ${album}.`,
    artworkUrl: `https://audioboom.com/i/${String(number)}.png`,
    audioUrl: `https://audioboom.com/posts/${String(number)}.mp3`,
    durationSeconds: 5400,
    publishedAt: "2026-08-01T22:00:00.000Z",
    ...overrides,
  };
};

const gentleGiant = summary(287, "The Power and the Glory - Gentle Giant");

const detail: EpisodeDetail = {
  ...gentleGiant,
  descriptionHtml:
    "<p><strong>The Power and the Glory</strong> es el sexto álbum de Gentle Giant.</p>",
  previous: {
    number: 286,
    slug: "core-stone-temple-pilots",
    title: "Core - Stone Temple Pilots",
  },
  next: {
    number: 288,
    slug: "shes-so-unusual-cyndi-lauper",
    title: "She's So Unusual - Cyndi Lauper",
  },
  related: [
    summary(161, "Octopus - Gentle Giant"),
    summary(29, "Free Hand - Gentle Giant"),
    summary(200, "Ra - Utopia"),
    summary(152, "Lateralus - TOOL"),
  ],
};

const json = (body: unknown, status = 200) =>
  Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );

// Answers the episode API like the server does.
const mockApi = () =>
  vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    const url = input instanceof Request ? input.url : String(input);
    if (url.endsWith("/api/v1/episodes")) {
      return json({ items: [gentleGiant, ...detail.related] });
    }
    if (url.endsWith("/api/v1/episodes/287")) {
      return json(detail);
    }
    return json({ error: "Not found" }, 404);
  });

function CurrentPath() {
  const location = useLocation();
  return <output aria-label="current path">{location.pathname}</output>;
}

function renderAt(route: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <PlayerProvider>
          <AppRoutes />
          <CurrentPath />
        </PlayerProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const currentPath = () => screen.getByLabelText("current path").textContent;

beforeEach(() => {
  mockApi();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Episode page", () => {
  it("shows the episode with its player, description and related episodes", async () => {
    renderAt("/episodes/287-the-power-and-the-glory-gentle-giant");

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "The Power and the Glory",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Gentle Giant", { selector: "p" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reproducir/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/es el sexto álbum de Gentle Giant/),
    ).toBeInTheDocument();

    const related = screen.getByRole("region", {
      name: /si te gustó este episodio, seguí por acá/i,
    });
    expect(
      within(related).getByRole("link", { name: /octopus/i }),
    ).toHaveAttribute("href", "/episodes/161-octopus-gentle-giant");
    expect(
      within(related).getByRole("link", { name: /ver todos/i }),
    ).toHaveAttribute("href", "/episodes");

    expect(
      screen.getByRole("link", { name: /anterior.*core/i }),
    ).toHaveAttribute("href", "/episodes/286-core-stone-temple-pilots");
    expect(
      screen.getByRole("link", { name: /siguiente.*she's so unusual/i }),
    ).toHaveAttribute("href", "/episodes/288-shes-so-unusual-cyndi-lauper");
  });

  it("redirects an outdated or missing slug to the current one", async () => {
    renderAt("/episodes/287-old-title");

    await screen.findByRole("heading", {
      level: 1,
      name: "The Power and the Glory",
    });
    expect(currentPath()).toBe(
      "/episodes/287-the-power-and-the-glory-gentle-giant",
    );
  });

  it("says so when the episode does not exist", async () => {
    renderAt("/episodes/9999-nada");

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /no encontramos este episodio/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /ver todos los episodios/i }),
    ).toHaveAttribute("href", "/episodes");
  });

  it("opens from its card in the episode list", async () => {
    const user = userEvent.setup();
    renderAt("/episodes");

    await user.click(
      await screen.findByRole("link", { name: /the power and the glory/i }),
    );

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "The Power and the Glory",
      }),
    ).toBeInTheDocument();
    expect(currentPath()).toBe(
      "/episodes/287-the-power-and-the-glory-gentle-giant",
    );
  });
});
