import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Papa from "papaparse";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as actions from "@/app/actions/alumni";
import { CsvAlumnusUpload } from "./CsvAlumnusUpload";

vi.mock("@/app/actions/alumni", () => ({
  bulkCreateAlumniAction: vi.fn(),
}));

// Mock PapaParse
vi.mock("papaparse", () => ({
  default: {
    parse: vi.fn((_file, config) => {
      config.complete({
        data: [
          {
            fullName: "John Doe",
            mail: "john@example.com",
            graduationYear: "2023",
            schoolSector: "CS",
          },
        ],
        meta: {
          fields: ["fullName", "mail", "graduationYear", "schoolSector"],
        },
      });
    }),
  },
}));

describe("CsvAlumnusUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const getFileInput = () => {
    const input = screen
      .getByLabelText(/Click to upload CSV/i)
      .closest("div")
      ?.querySelector("input");
    if (!input) throw new Error("File input not found");
    return input;
  };

  it("renders upload area and template download button", () => {
    render(<CsvAlumnusUpload />);

    expect(screen.getByText(/Bulk CSV Upload/i)).toBeInTheDocument();
    expect(screen.getByText(/Download Template/i)).toBeInTheDocument();
    expect(screen.getByText(/Click to upload CSV/i)).toBeInTheDocument();
  });

  it("handles file upload and shows ready state", async () => {
    render(<CsvAlumnusUpload />);

    const file = new File(["dummy content"], "test.csv", { type: "text/csv" });
    const input = getFileInput();

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText(/1 students ready to import/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Start Import/i }),
    ).toBeInTheDocument();
  });

  it("calls bulkCreateAlumniAction when Start Import is clicked", async () => {
    const mockAction = vi
      .mocked(actions.bulkCreateAlumniAction)
      .mockResolvedValue({ success: true, count: 1 });

    render(<CsvAlumnusUpload />);

    const file = new File(["dummy content"], "test.csv", { type: "text/csv" });
    const input = getFileInput();
    fireEvent.change(input, { target: { files: [file] } });

    const startBtn = screen.getByRole("button", { name: /Start Import/i });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(mockAction).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            fullName: "John Doe",
            graduationYear: 2023,
          }),
        ]),
      );
    });

    expect(
      screen.getByText(/Success! 1 students imported successfully/i),
    ).toBeInTheDocument();
  });

  it("shows error for missing headers", async () => {
    // Mock PapaParse to return missing headers
    // biome-ignore lint/suspicious/noExplicitAny: Mocking Papa.parse overloads is complex
    (Papa.parse as any).mockImplementationOnce((_file: any, config: any) => {
      config.complete({
        data: [],
        errors: [],
        meta: {
          fields: ["fullName", "mail"],
          delimiter: ",",
          linebreak: "\n",
          aborted: false,
          truncated: false,
          cursor: 0,
        },
      });
    });

    render(<CsvAlumnusUpload />);

    const file = new File(["dummy content"], "test.csv", { type: "text/csv" });
    const input = getFileInput();
    fireEvent.change(input, { target: { files: [file] } });

    expect(
      screen.getByText(
        /Missing required columns: graduationYear, schoolSector/i,
      ),
    ).toBeInTheDocument();
  });

  it("handles NaN in graduationYear by converting it to 0", async () => {
    const mockAction = vi
      .mocked(actions.bulkCreateAlumniAction)
      .mockResolvedValue({ success: true, count: 1 });

    // Mock PapaParse to return invalid graduationYear
    // biome-ignore lint/suspicious/noExplicitAny: Mocking Papa.parse overloads is complex
    (Papa.parse as any).mockImplementationOnce((_file: any, config: any) => {
      config.complete({
        data: [
          {
            fullName: "John Doe",
            mail: "john@example.com",
            graduationYear: "not-a-number",
            schoolSector: "CS",
          },
        ],
        errors: [],
        meta: {
          fields: ["fullName", "mail", "graduationYear", "schoolSector"],
          delimiter: ",",
          linebreak: "\n",
          aborted: false,
          truncated: false,
          cursor: 0,
        },
      });
    });

    render(<CsvAlumnusUpload />);

    const file = new File(["dummy content"], "test.csv", { type: "text/csv" });
    const input = getFileInput();
    fireEvent.change(input, { target: { files: [file] } });

    const startBtn = screen.getByRole("button", { name: /Start Import/i });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(mockAction).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            graduationYear: 0,
          }),
        ]),
      );
    });
  });
});
