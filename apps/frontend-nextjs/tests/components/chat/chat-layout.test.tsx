import { render } from "@testing-library/react";
import ChatLayout from "@/components/chat/ChatLayout";

describe("ChatLayout", () => {
  it("renders sidebar and chatWindow children", () => {
    const { container } = render(
      <ChatLayout sidebar={<div data-testid="sidebar" />} chatWindow={<div data-testid="chat" />} />
    );
    expect(container.querySelector('[data-testid="sidebar"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="chat"]')).toBeInTheDocument();
  });
});
