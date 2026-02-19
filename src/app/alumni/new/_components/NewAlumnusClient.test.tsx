import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NewAlumnusClient } from "./NewAlumnusClient";

// Mock child components
vi.mock("./ManualAlumnusForm", () => ({
  ManualAlumnusForm: ({ schoolId }: { schoolId: string }) => (
    <div data-testid="manual-form">Manual Form for {schoolId}</div>
  ),
}));

vi.mock("./CsvAlumnusUpload", () => ({
  CsvAlumnusUpload: ({ schoolId }: { schoolId: string }) => (
    <div data-testid="csv-upload">CSV Upload for {schoolId}</div>
  ),
}));

describe("NewAlumnusClient", () => {
  const mockSchools = [
    { id: "1", name: "School A" },
    { id: "2", name: "School B" },
  ];

  it("renders school selection and manual form by default", () => {
    render(<NewAlumnusClient schools={mockSchools} />);

    expect(screen.getByLabelText(/Target School/i)).toBeInTheDocument();
    expect(screen.getByText("School A")).toBeInTheDocument();
    expect(screen.getByTestId("manual-form")).toHaveTextContent(
      "Manual Form for 1",
    );
  });

  it("switches between manual and bulk tabs", () => {
    render(<NewAlumnusClient schools={mockSchools} />);

    const bulkTab = screen.getByText(/Bulk CSV Upload/i);
    fireEvent.click(bulkTab);

    expect(screen.getByTestId("csv-upload")).toHaveTextContent(
      "CSV Upload for 1",
    );

    const manualTab = screen.getByText(/Manual Entry/i);
    fireEvent.click(manualTab);

    expect(screen.getByTestId("manual-form")).toHaveTextContent(
      "Manual Form for 1",
    );
  });

  it("updates schoolId for both forms when school is changed", () => {
    render(<NewAlumnusClient schools={mockSchools} />);

    const select = screen.getByLabelText(/Target School/i);
    fireEvent.change(select, { target: { value: "2" } });

    expect(screen.getByTestId("manual-form")).toHaveTextContent(
      "Manual Form for 2",
    );

    const bulkTab = screen.getByText(/Bulk CSV Upload/i);
    fireEvent.click(bulkTab);
    expect(screen.getByTestId("csv-upload")).toHaveTextContent(
      "CSV Upload for 2",
    );
  });

  it("shows empty state when no schools are provided", () => {
    render(<NewAlumnusClient schools={[]} />);

    expect(screen.getByText(/No Schools Found/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Target School/i)).not.toBeInTheDocument();
  });
});
