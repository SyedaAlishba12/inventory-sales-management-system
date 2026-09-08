import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { LandingPage } from "@/components/landing/landing-page";
import { LandingNavbar } from "@/components/landing/navbar";

describe("public landing page", () => {
  it("renders every required landing section", () => {
    const { container } = render(<LandingPage />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Run inventory and sales with clarity");
    expect(container.querySelector("#home")).toBeInTheDocument();
    expect(container.querySelector("#features")).toBeInTheDocument();
    expect(container.querySelector("#benefits")).toBeInTheDocument();
    expect(container.querySelector("#how-it-works")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("links account actions to the authentication routes", () => {
    render(<LandingPage />);

    const loginLinks = screen.getAllByRole("link", { name: /log in|sign in/i });
    const signupLinks = screen.getAllByRole("link", { name: /start free|start managing free|create your account|create account/i });

    loginLinks.forEach((link) => expect(link).toHaveAttribute("href", "/login"));
    signupLinks.forEach((link) => expect(link).toHaveAttribute("href", "/signup"));
  });

  it("opens and closes the mobile navigation", async () => {
    const user = userEvent.setup();
    render(<LandingNavbar />);

    await user.click(screen.getByRole("button", { name: "Open navigation menu" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("link", { name: "Features" })).toBeInTheDocument();

    await user.click(within(dialog).getByRole("link", { name: "Features" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("provides a keyboard skip link", () => {
    render(<LandingPage />);
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main-content");
  });
});
