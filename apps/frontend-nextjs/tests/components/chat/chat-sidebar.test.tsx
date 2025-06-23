import { render, screen, fireEvent } from "@testing-library/react";
import ChatSidebar from "@/components/chat/ChatSidebar";

// ---- router/searchParams mocks ----
let currentRoomId: string | null = null;
const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({ get: () => currentRoomId }),
}));

// mock next/dynamic to just return component
jest.mock("next/dynamic", () => () => (importFunc: any, _opts?: any) => {
  const Comp = () => null;
  return Comp;
});

// mock NewChatModal (path alias using jest automatic) – fallback if loaded
jest.mock("@/components/chat/NewChatModal", () => () => <div data-testid="new-chat-modal" />);

const rooms = [
  { id: "1", name: "Room One" },
  { id: "2", name: "Room Two" },
];

afterEach(() => {
  pushMock.mockClear();
});

describe("ChatSidebar", () => {
  it("renders room names", () => {
    render(<ChatSidebar initialRooms={rooms} />);
    expect(screen.getByText("Room One")).toBeInTheDocument();
    expect(screen.getByText("Room Two")).toBeInTheDocument();
  });



  it("navigates on room click", () => {
    render(<ChatSidebar initialRooms={rooms} />);
    fireEvent.click(screen.getByText("Room Two"));
    expect(pushMock).toHaveBeenCalledWith("/chat?roomId=2", { scroll: false });
  });
});
