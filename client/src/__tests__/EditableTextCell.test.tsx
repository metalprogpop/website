import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditableTextCell } from "../components/admin/EditableTextCell";

afterEach(() => {
  cleanup();
});

const renderCell = (value: string | null = "Ana") => {
  const onCommit = vi.fn();
  render(<EditableTextCell label="Nombre" value={value} onCommit={onCommit} />);
  return { onCommit, input: screen.getByRole("textbox", { name: "Nombre" }) };
};

describe("EditableTextCell", () => {
  it("saves on Enter", async () => {
    const { onCommit, input } = renderCell();
    await userEvent.clear(input);
    await userEvent.type(input, "Beatriz{Enter}");
    expect(onCommit).toHaveBeenCalledExactlyOnceWith("Beatriz");
  });

  it("saves when the cell loses focus", async () => {
    const { onCommit, input } = renderCell(null);
    await userEvent.type(input, "Carla");
    await userEvent.tab();
    expect(onCommit).toHaveBeenCalledExactlyOnceWith("Carla");
  });

  it("discards the change on Escape", async () => {
    const { onCommit, input } = renderCell();
    await userEvent.type(input, "zzz{Escape}");
    expect(onCommit).not.toHaveBeenCalled();
    expect(input).toHaveValue("Ana");
  });

  it("does not save when nothing changed", async () => {
    const { onCommit, input } = renderCell();
    await userEvent.click(input);
    await userEvent.tab();
    expect(onCommit).not.toHaveBeenCalled();
  });
});
