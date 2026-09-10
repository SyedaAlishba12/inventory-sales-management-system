import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { PaymentSelector } from "@/components/shared/pos/payment-selector";
import { QuantitySelector } from "@/components/shared/pos/quantity-selector";
import { TotalSummary } from "@/components/shared/pos/total-summary";
import { SearchBar } from "@/components/shared/search-bar";

describe("shared business components", () => {
  it("sorts data table rows", async () => {
    const user = userEvent.setup();
    const rows = [
      { id: 1, name: "Zebra" },
      { id: 2, name: "Alpha" },
    ];
    const columns: DataTableColumn<(typeof rows)[number]>[] = [
      { id: "name", header: "Name", accessor: "name", sortable: true },
    ];

    render(<DataTable columns={columns} data={rows} getRowId={(row) => row.id} />);
    await user.click(screen.getByRole("button", { name: /Name/i }));

    const bodyRows = screen.getAllByRole("row").slice(1);
    expect(within(bodyRows[0]).getByRole("cell")).toHaveTextContent("Alpha");
  });

  it("clears a controlled search field", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<SearchBar value="mouse" onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Clear search" }));

    expect(onChange).toHaveBeenCalledWith("");
  });

  it("increments a POS quantity within its stock limit", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<QuantitySelector value={2} max={3} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Increase quantity" }));

    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("selects a payment method", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<PaymentSelector value="cash" onChange={onChange} />);
    await user.click(screen.getByText("Card"));

    expect(onChange).toHaveBeenCalledWith("card");
  });

  it("calculates and displays the POS total", () => {
    render(<TotalSummary subtotal={1000} discount={100} tax={50} />);

    expect(screen.getByText("Total").nextSibling).toHaveTextContent("950");
  });
});
