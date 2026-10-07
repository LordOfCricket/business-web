import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Button } from "./Button";

afterEach(cleanup);

describe("Button", () => {
  it("is disabled and marked busy while loading", () => {
    render(<Button loading>Book now</Button>);
    const button = screen.getByRole("button", { name: "Book now" });
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");
  });

  it("defaults to type=button so it never submits forms accidentally", () => {
    render(<Button>Cancel</Button>);
    expect(screen.getByRole("button", { name: "Cancel" }).getAttribute("type")).toBe("button");
  });
});
