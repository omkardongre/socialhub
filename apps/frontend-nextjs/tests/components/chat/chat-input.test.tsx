import { render, screen, fireEvent } from "@testing-library/react";
import ChatInput from "@/components/chat/ChatInput";
import { Socket } from "socket.io-client";

// ---- mocks ----
// Stub next/image to render simple img
jest.mock("next/image", () => (props: any) => {
  // eslint-disable-next-line jsx-a11y/alt-text
  return <img {...props} />;
});

// Mock toast to avoid side-effects
jest.mock("sonner", () => ({ toast: { error: jest.fn() } }));

// Spy on sendMessage function
const sendMessageMock = jest.fn();
jest.mock("@/lib/chatSocket", () => ({
  sendMessage: (...args: any[]) => sendMessageMock(...args),
}));

// Mock axios api calls used for upload to resolve immediately
jest.mock("@/lib/axios", () => ({
  api: {
    post: jest.fn().mockResolvedValue({
      data: { data: { uploadUrl: "http://upload", fileUrl: "http://file" } },
    }),
    put: jest.fn().mockResolvedValue({}),
  },
}));

function renderInput(opts?: { connected?: boolean }) {
  const socket = {
    connected: opts?.connected ?? true,
  } as unknown as Socket;
  return render(<ChatInput roomId="room1" socket={socket} />);
}

afterEach(() => {
  jest.clearAllMocks();
});

describe("ChatInput", () => {
  it("renders input and send disabled initially", () => {
    renderInput();
    const sendBtn = screen.getByRole("button", { name: /send/i });
    expect(sendBtn).toBeDisabled();
  });

  it("enables send and calls sendMessage on click", () => {
    renderInput();
    const input = screen.getByPlaceholderText(/type a message/i);
    fireEvent.change(input, { target: { value: "Hello" } });
    const sendBtn = screen.getByRole("button", { name: /send/i });
    expect(sendBtn).toBeEnabled();
    fireEvent.click(sendBtn);
    expect(sendMessageMock).toHaveBeenCalledWith(
      expect.any(Object),
      "room1",
      "Hello",
      undefined
    );
  });

  it("does not send when socket disconnected", () => {
    renderInput({ connected: false });
    const input = screen.getByPlaceholderText(/type a message/i);
    fireEvent.change(input, { target: { value: "Hi" } });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));
    expect(sendMessageMock).not.toHaveBeenCalled();
  });
});
