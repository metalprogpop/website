import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AboutPage } from "../pages/AboutPage";

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/about"]}>
      <AboutPage />
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
});

describe("AboutPage", () => {
  it("tells the story of the podcast", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { level: 1, name: /un micrófono/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /cómo empezó/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /por qué lo hacemos/i }),
    ).toBeInTheDocument();
  });

  it("introduces the four of us with links to our Instagram profiles", () => {
    renderPage();

    const team = screen.getByRole("region", { name: /quiénes somos/i });
    const profiles = [
      ["Guido Vilariño", "https://www.instagram.com/gvilarino/"],
      ["Angel Appiani", "https://www.instagram.com/drangelus/"],
      ["Gonzalo Ares", "https://www.instagram.com/gonzalo.julian.ares/"],
      ["Santiago Grillo", "https://www.instagram.com/san_grillo/"],
    ];
    for (const [name, url] of profiles) {
      const card = within(team).getByRole("article", { name });
      expect(within(card).getByRole("img", { name })).toBeInTheDocument();
      expect(
        within(card).getByRole("link", { name: /instagram/i }),
      ).toHaveAttribute("href", url);
    }
  });

  it("plays a Lecheenpolvo video in place when its thumbnail is clicked", async () => {
    const user = userEvent.setup();
    renderPage();

    const videos = screen.getByRole("region", { name: /lecheenpolvo/i });
    expect(
      within(videos).queryByTitle(/highway star/i),
    ).not.toBeInTheDocument();

    await user.click(
      within(videos).getByRole("button", { name: /reproducir highway star/i }),
    );

    const player = within(videos).getByTitle(/highway star/i);
    expect(player).toHaveFocus();
    expect(player).toHaveAttribute(
      "src",
      expect.stringContaining("youtube-nocookie.com/embed/mirBuhq2iU4"),
    );
  });

  it("hides the appearances section while there are none", () => {
    renderPage();

    expect(
      screen.queryByRole("region", { name: /nos invitaron/i }),
    ).not.toBeInTheDocument();
  });

  it("links to the about page from the header", () => {
    renderPage();

    expect(
      within(screen.getByRole("banner")).getByRole("link", {
        name: "Nosotros",
      }),
    ).toHaveAttribute("href", "/about");
  });
});
