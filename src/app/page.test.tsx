import { render, screen } from "@testing-library/react";
import Home from "./page";

test("Home page renders the marketing hero heading", () => {
  render(<Home />);
  expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
});

test("Home page renders school login link", () => {
  render(<Home />);
  const links = screen.getAllByRole("link", { name: /school login/i });
  expect(links.length).toBeGreaterThan(0);
});
