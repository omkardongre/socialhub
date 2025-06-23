import { render, screen } from "@testing-library/react";
import ChatClient from "@/components/chat/ChatClient";

// ----- mocks -----
// Stub out heavy child components so we only test ChatClient logic
jest.mock("@/components/chat/ChatInput", () => () => (
  <div data-testid="chat-input">ChatInput</div>
));
jest.mock("@/components/chat/MessageList", () => () => (
  <div data-testid="message-list">MessageList</div>
));

// Mock custom hooks that ChatClient relies on
type SearchParamsMap = Record<string, string | null>;

// Dynamically controllable mock for useSearchParams
let mockParams: SearchParamsMap = {};
jest.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => mockParams[key] ?? null,
  }),
}));

function setSearchParams(p: SearchParamsMap) {
  mockParams = p;
}

jest.mock("@/hooks/useChatSocket", () => ({
  useChatSocket: () => ({}), // return dummy socket
}));

afterEach(() => {
  jest.clearAllMocks();
});

// useRoomPresence and useReceiveMessage have side-effects but no return value
jest.mock("@/hooks/useRoomPresence", () => ({
  useRoomPresence: () => undefined,
}));

jest.mock("@/hooks/useReceiveMessage", () => ({
  useReceiveMessage: () => undefined,
}));

// Single mock with mutable state for useAuth
let authState = { user: null as any, loading: false };

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => authState,
}));

function setAuth(state: { user: any; loading: boolean }) {
  authState = state;
}

// ----- tests -----

describe("ChatClient", () => {
  it("renders select prompt when no roomId", () => {
    setSearchParams({});
    setAuth({ user: { userId: "1" }, loading: false });
    const { getByText } = render(<ChatClient />);
    expect(getByText(/select a chat/i)).toBeInTheDocument();
  });

  it("shows skeleton while user is loading", () => {
    setSearchParams({ roomId: "abc" });
    setAuth({ user: null, loading: true });
    render(<ChatClient />);
    const skeletonEl = document.querySelector('[data-slot="skeleton"]');
    expect(skeletonEl).toBeTruthy();
  });

  it("prompts login when user is absent", () => {
    setSearchParams({ roomId: "abc" });
    setAuth({ user: null, loading: false });
    render(<ChatClient />);
    expect(screen.getByText(/please login/i)).toBeInTheDocument();
  });

  it("renders message list and input when room and user present", () => {
    setSearchParams({ roomId: "abc" });
    setAuth({ user: { userId: "1" }, loading: false });
    render(<ChatClient />);
    expect(screen.getByTestId("message-list")).toBeInTheDocument();
    expect(screen.getByTestId("chat-input")).toBeInTheDocument();
  });
});
