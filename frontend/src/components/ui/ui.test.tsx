import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { Toggle } from "@/components/ui/toggle";

describe("shared UI components", () => {
  it("handles button actions and uses a safe default type", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={onClick}>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });

    expect(button).toHaveAttribute("type", "button");
    await user.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("supports uncontrolled toggle state", async () => {
    const onPressedChange = vi.fn();
    const user = userEvent.setup();

    render(<Toggle onPressedChange={onPressedChange}>Track stock</Toggle>);
    const toggle = screen.getByRole("button", { name: "Track stock" });

    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it("moves to the requested pagination page", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();

    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("renders an accessible modal", () => {
    render(
      <Modal
        open
        onOpenChange={() => undefined}
        title="Create product"
        description="Add a product to inventory."
      >
        Product form
      </Modal>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Create product" })).toBeInTheDocument();
    expect(screen.getByText("Add a product to inventory.")).toBeInTheDocument();
  });
});
