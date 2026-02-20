import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NewAlumnusClient } from "./NewAlumnusClient";

// Mock child components
vi.mock("./ManualAlumnusForm", () => ({
  ManualAlumnusForm: () => <div data-testid="manual-form">Manual Form</div>,
}));

vi.mock("./CsvAlumnusUpload", () => ({
  CsvAlumnusUpload: () => <div data-testid="csv-upload">CSV Upload</div>,
}));

const mockSchools = [
  { id: "school-1", name: "School One", location: "City One" },
];

describe("NewAlumnusClient", () => {
  it("renders manual form by default", () => {
    render(
      <NewAlumnusClient schools={mockSchools} defaultSchoolId="school-1" />,
    );

    expect(screen.queryByLabelText(/Target School/i)).not.toBeInTheDocument();
    expect(screen.getByTestId("manual-form")).toBeInTheDocument();
  });

  it("switches between manual and bulk tabs", () => {
    render(
      <NewAlumnusClient schools={mockSchools} defaultSchoolId="school-1" />,
    );

    const bulkTab = screen.getByText(/Bulk CSV Upload/i);
    fireEvent.click(bulkTab);

    expect(screen.getByTestId("csv-upload")).toBeInTheDocument();

    const manualTab = screen.getByText(/Manual Entry/i);
    fireEvent.click(manualTab);

    expect(screen.getByTestId("manual-form")).toBeInTheDocument();
  });
});
