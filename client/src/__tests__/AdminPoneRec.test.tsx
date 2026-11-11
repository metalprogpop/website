import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  adminPoneRecUpdateSchema,
  type AdminPoneRec,
  type AdminPoneRecUpdate,
} from "shared";
import { toast } from "sonner";
import { AdminPage } from "../pages/AdminPage";

const API_URL = "http://localhost:3001";

const json = (body: unknown, status = 200) =>
  Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );

const option = (id: number) => ({
  id,
  path: `/api/v1/admin/pone-rec/thumbnails/${String(id)}`,
});

const rec = (program: number, extra: Partial<AdminPoneRec> = {}) => ({
  program,
  mainTopic: `Tema del ${String(program)}`,
  publishedAt: "2026-08-29T22:26:31.000Z",
  durationSeconds: 1260,
  tags: ["Viajes"],
  thumbnails: [option(program * 10)],
  thumbnailId: program * 10,
  ...extra,
});

// 98 is new: still on the default image, with two candidates.
const episodes = () => [
  rec(98, {
    mainTopic: "Cómo nos llevamos con la sangre",
    tags: ["Sangre", "Accidentes"],
    thumbnails: [option(1), option(2)],
    thumbnailId: null,
  }),
  rec(97, { mainTopic: "Los peores olores de nuestras vidas" }),
];

type Patch = { program: number; body: AdminPoneRecUpdate };

const mockApi = ({ failPatch = false } = {}) => {
  const state = episodes();
  const patches: Patch[] = [];
  vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
    const url = input instanceof Request ? input.url : String(input);
    if (url.endsWith("/api/v1/auth/me")) {
      return json({
        id: 1,
        email: "staff@example.com",
        role: "staff",
        fanClubAccess: true,
      });
    }
    const patch = /\/api\/v1\/admin\/pone-rec\/(\d+)$/.exec(url);
    if (patch && init?.method === "PATCH") {
      if (failPatch) {
        return json({ error: "No se pudo guardar" }, 500);
      }
      const program = Number(patch[1]);
      const body = adminPoneRecUpdateSchema.parse(
        JSON.parse(typeof init.body === "string" ? init.body : "{}"),
      );
      patches.push({ program, body });
      const index = state.findIndex((e) => e.program === program);
      state[index] = { ...state[index], ...body };
      return json(state[index]);
    }
    if (url.endsWith("/api/v1/admin/pone-rec")) {
      return json({
        episodes: state,
        tags: ["Accidentes", "Sangre", "Viajes"],
      });
    }
    return json({ error: "Not found" }, 404);
  });
  return patches;
};

function renderAdmin(path = "/admin?seccion=pone-rec") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <AdminPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const openEditor = async (name: RegExp) => {
  const user = userEvent.setup();
  await user.click(await screen.findByRole("button", { name }));
  return { user, sheet: await screen.findByRole("dialog") };
};

beforeEach(() => {
  vi.stubEnv("VITE_API_URL", API_URL);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("Admin · Poné Rec", () => {
  it("has its own tab, listing every episode as members see it", async () => {
    mockApi();
    renderAdmin();

    expect(
      await screen.findByRole("heading", { level: 1, name: "Poné Rec™" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Poné Rec™" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      await screen.findByText("Cómo nos llevamos con la sangre"),
    ).toBeInTheDocument();
    // Nothing waits for approval: an episode without an image is just
    // flagged as using the default one.
    expect(
      screen.getByText("Portada default · 2 para elegir"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/aprobar|publicar/i)).not.toBeInTheDocument();
  });

  it("saves the main topic when the field loses focus", async () => {
    const patches = mockApi();
    renderAdmin();
    const { user, sheet } = await openEditor(/programa 97/i);

    const field = within(sheet).getByRole("textbox", {
      name: "Tema principal",
    });
    await user.clear(field);
    await user.type(field, "  Olores que no olvidamos  ");
    await user.tab();

    await waitFor(() => {
      expect(patches).toEqual([
        { program: 97, body: { mainTopic: "Olores que no olvidamos" } },
      ]);
    });
  });

  it("puts the saved topic back on Escape and never saves an empty one", async () => {
    const patches = mockApi();
    renderAdmin();
    const { user, sheet } = await openEditor(/programa 97/i);
    const field = within(sheet).getByRole("textbox", {
      name: "Tema principal",
    });

    await user.type(field, " (borrador)");
    await user.keyboard("{Escape}");
    expect(field).toHaveValue("Los peores olores de nuestras vidas");
    // That Escape only undid the edit; the panel is still open.
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.clear(field);
    await user.tab();
    expect(field).toHaveValue("Los peores olores de nuestras vidas");
    expect(patches).toEqual([]);

    // With nothing pending, Escape closes the panel and goes back to the card.
    await user.click(field);
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /programa 97/i })).toHaveFocus();
  });

  it("adds and removes tags", async () => {
    const patches = mockApi();
    renderAdmin();
    const { user, sheet } = await openEditor(/programa 98/i);

    await user.type(
      within(sheet).getByRole("combobox", { name: "Agregar etiqueta" }),
      "Halloween{Enter}",
    );
    await user.click(
      await within(sheet).findByRole("button", { name: "Sacar Accidentes" }),
    );

    await waitFor(() => {
      expect(patches.map((p) => p.body)).toEqual([
        { tags: ["Sangre", "Accidentes", "Halloween"] },
        { tags: ["Sangre", "Halloween"] },
      ]);
    });
  });

  it("keeps every change when tags are edited in quick succession", async () => {
    const patches = mockApi();
    renderAdmin();
    const { user, sheet } = await openEditor(/programa 98/i);

    await user.type(
      within(sheet).getByRole("combobox", { name: "Agregar etiqueta" }),
      "Uno{Enter}Dos{Enter}",
    );

    await waitFor(() => {
      expect(patches.at(-1)?.body).toEqual({
        tags: ["Sangre", "Accidentes", "Uno", "Dos"],
      });
    });
  });

  it("picks one of the images, or goes back to the default", async () => {
    const patches = mockApi();
    renderAdmin();
    const { user, sheet } = await openEditor(/programa 98/i);

    await user.click(within(sheet).getByRole("button", { name: "Opción 2" }));
    expect(
      await within(sheet).findByRole("button", {
        name: "Opción 2",
        pressed: true,
      }),
    ).toBeInTheDocument();
    await user.click(
      within(sheet).getByRole("button", { name: "Portada default" }),
    );

    await waitFor(() => {
      expect(patches.map((p) => p.body)).toEqual([
        { thumbnailId: 2 },
        { thumbnailId: null },
      ]);
    });
  });

  it("rolls back and says so when a save fails", async () => {
    const error = vi.spyOn(toast, "error");
    mockApi({ failPatch: true });
    renderAdmin();
    const { user, sheet } = await openEditor(/programa 98/i);

    await user.click(within(sheet).getByRole("button", { name: "Opción 1" }));

    await waitFor(() => {
      expect(
        within(sheet).getByRole("button", {
          name: "Portada default",
          pressed: true,
        }),
      ).toBeInTheDocument();
    });
    expect(error).toHaveBeenCalledWith("No se pudo guardar");
  });

  it("keeps Suscriptores as the default tab", async () => {
    mockApi();
    renderAdmin("/admin");
    expect(
      await screen.findByRole("heading", { level: 1, name: "Suscriptores" }),
    ).toBeInTheDocument();
  });
});
