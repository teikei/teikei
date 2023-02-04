import { render, screen } from "@testing-library/react";
import ExternalLink from "./ExternalLink";
import { expect } from "vitest";

describe("ExternalLink", () => {
  const testUrl = "http://example.com";

  it("shows a link with the url as link text", () => {
    render(<ExternalLink url={testUrl} />);

    expect(screen.getByText(testUrl)).toBeVisible();
    expect(screen.getByText(testUrl)).toHaveAttribute("href", testUrl);
  });

  it("opens in a new window", () => {
    render(<ExternalLink url={testUrl} />);

    expect(screen.getByText(testUrl)).toHaveAttribute("target", "_blank");
    expect(screen.getByText(testUrl)).toHaveAttribute(
      "rel",
      "noopener noreferrer"
    );
  });
});
