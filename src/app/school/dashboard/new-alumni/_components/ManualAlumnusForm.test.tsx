import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as actions from "@/app/actions/alumni";
import { ManualAlumnusForm } from "./ManualAlumnusForm";

vi.mock("@/app/actions/alumni", () => ({
  createAlumnusAction: vi.fn(),
}));

describe("ManualAlumnusForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form fields", () => {
    render(<ManualAlumnusForm />);

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Graduation Year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Major \/ Sector/i)).toBeInTheDocument();
  });

  it("submits form with correct data", async () => {
    const mockAction = vi
      .mocked(actions.createAlumnusAction)
      .mockResolvedValue({ success: true });

    render(<ManualAlumnusForm />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Graduation Year/i), {
      target: { value: "2023" },
    });
    fireEvent.change(screen.getByLabelText(/Major \/ Sector/i), {
      target: { value: "CS" },
    });

    fireEvent.submit(screen.getByTestId("manual-form-element"));

    await waitFor(() => {
      expect(mockAction).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: "John Doe",
          mail: "john@example.com",
          graduationYear: 2023,
          schoolSector: "CS",
        }),
      );
    });

    expect(screen.getByText(/Student added successfully/i)).toBeInTheDocument();
  });

  it("displays field errors from server action and persists data", async () => {
    vi.mocked(actions.createAlumnusAction).mockResolvedValue({
      error: "Validation failed",
      fieldErrors: { mail: ["Invalid email"] },
    });

    render(<ManualAlumnusForm />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.submit(screen.getByTestId("manual-form-element"));

    await waitFor(() => {
      expect(screen.getByText("Invalid email")).toBeInTheDocument();
    });

    // Form should NOT be reset on error
    expect(screen.getByLabelText(/Full Name/i)).toHaveValue("John Doe");
  });
});
