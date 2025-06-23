import { render, screen } from "@testing-library/react";
import MessageList from "@/components/chat/MessageList";

// Mock next/image
jest.mock("next/image", () => (props: any) => {
  // eslint-disable-next-line jsx-a11y/alt-text
  return <img {...props} />;
});

// Helper to set mock implementation of useMessages per test
let messagesMock: any = { data: [], isLoading: false, error: null };
jest.mock("@/hooks/useMessages", () => ({
  useMessages: () => messagesMock,
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe("MessageList", () => {
  const baseProps = { roomId: "room1", userId: "user1" };

  it("shows skeleton while loading", () => {
    messagesMock = { data: [], isLoading: true, error: null };
    render(<MessageList {...baseProps} />);
    expect(document.querySelector('[data-slot="skeleton"]')).toBeTruthy();
  });

  it("shows error alert", () => {
    messagesMock = { data: [], isLoading: false, error: new Error("fail") };
    render(<MessageList {...baseProps} />);
    expect(screen.getByText(/error loading messages/i)).toBeInTheDocument();
  });

  it("renders list of messages", () => {
    messagesMock = {
      data: [
        { id: "1", senderId: "user1", createdAt: Date.now(), content: "Hi" },
        { id: "2", senderId: "user2", createdAt: Date.now(), content: "Hello" },
      ],
      isLoading: false,
      error: null,
    };
    render(<MessageList {...baseProps} />);
    expect(screen.getByText("Hi")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
