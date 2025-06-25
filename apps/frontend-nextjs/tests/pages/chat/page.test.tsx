import { render, screen, waitFor } from "@testing-library/react";
const mockGet = jest.fn();
jest.mock("@/lib/axios", () => ({ api: { get: mockGet } }));
jest.mock("@/components/chat/ChatShell", () => () => (
  <div data-testid="chat-shell" />
));

describe("ChatPage", () => {
  let ChatPage: any;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockGet.mockReset();
    ChatPage = require("@/app/chat/page").default;
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it("shows loading then renders ChatShell with rooms", async () => {
    mockGet.mockResolvedValueOnce({
      data: { data: [{ id: "1", name: "room" }] },
    });
    render(<ChatPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("chat-shell")).toBeInTheDocument();
    });
  });

  it("handles fetch error gracefully", async () => {
    mockGet.mockRejectedValueOnce(new Error("fail"));
    render(<ChatPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("chat-shell")).toBeInTheDocument();
    });
  });
});
