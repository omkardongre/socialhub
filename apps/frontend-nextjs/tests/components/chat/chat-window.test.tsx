import { render, screen } from "@testing-library/react";
import ChatWindow from "@/components/chat/ChatWindow";

describe("ChatWindow", () => {
  const messages = [
    { senderName: "Alice", text: "Hello" },
    { senderName: "Bob", text: "Hi there" },
  ];

  it("renders each message", () => {
    render(<ChatWindow messages={messages} />);
    expect(screen.getByText("Alice:")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Bob:")).toBeInTheDocument();
    expect(screen.getByText("Hi there")).toBeInTheDocument();
  });
});
