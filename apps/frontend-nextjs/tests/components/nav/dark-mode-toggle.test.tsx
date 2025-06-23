import { render, fireEvent } from "@testing-library/react";
import { DarkModeToggle } from "@/components/nav/DarkModeToggle";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe("DarkModeToggle", () => {
  it("toggles dark mode class", () => {
    const { getByLabelText } = render(<DarkModeToggle />);
    const btn = getByLabelText("Toggle dark mode");
    fireEvent.click(btn);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    fireEvent.click(btn);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
