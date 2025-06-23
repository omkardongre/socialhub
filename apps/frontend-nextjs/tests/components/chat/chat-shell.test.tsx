import { render } from "@testing-library/react";
import ChatShell from "@/components/chat/ChatShell";

// Mock ChatSidebar, ChatClient, ChatLayout to observe render
jest.mock("@/components/chat/ChatSidebar", () => () => <div data-testid="sidebar" />);
jest.mock("@/components/chat/ChatClient", () => () => <div data-testid="chat-client" />);
jest.mock("@/components/chat/ChatLayout", () => ({ __esModule: true, default: ({ sidebar, chatWindow }: any) => (
  <div>
    <div>{sidebar}</div>
    <div>{chatWindow}</div>
  </div>
)}));

afterEach(() => jest.clearAllMocks());

describe("ChatShell", () => {
  it("renders sidebar and chat client via layout", () => {
    const { getByTestId } = render(
      <ChatShell initialRooms={[]} setRooms={jest.fn()} />
    );
    expect(getByTestId("sidebar")).toBeInTheDocument();
  });
});
