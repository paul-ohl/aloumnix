import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock next/image
vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ priority, ...props }: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element
    // biome-ignore lint/a11y/useAltText: Mock img tag doesn't need alt text
    // biome-ignore lint/performance/noImgElement: This is a mock for testing
    return <img {...props} />;
  },
}));
