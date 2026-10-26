import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "../components/ScrollToTop";
import { Header } from "../components/landing/Header";

function renderAt(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route
          path="/"
          element={<section id="listen">Dónde escuchar</section>}
        />
        <Route path="/about" element={<p>Nosotros</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Escuchar in the header", () => {
  it("goes to the home's listening section from another page", async () => {
    const user = userEvent.setup();
    const scrolled: Element[] = [];
    Element.prototype.scrollIntoView = function (this: Element) {
      scrolled.push(this);
    };
    window.scrollTo = vi.fn();

    renderAt("/about");
    await user.click(screen.getByRole("link", { name: "Escuchar" }));

    expect(await screen.findByText("Dónde escuchar")).toBeInTheDocument();
    expect(scrolled.map((el) => el.id)).toEqual(["listen"]);

    // Clicking it again after scrolling away lands there again.
    await user.click(screen.getByRole("link", { name: "Escuchar" }));
    expect(scrolled.map((el) => el.id)).toEqual(["listen", "listen"]);
  });
});
