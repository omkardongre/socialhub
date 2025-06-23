import { render, screen } from "@testing-library/react";
import NotificationBell from "@/components/nav/NotificationBell";
import { User } from "@/types/profile";

jest.mock("next/link", () => ({ __esModule: true, default: (props: any) => <a {...props} /> }));

const authUser: User = { id: "1", userId: "alice", name: "Alice", avatarUrl: "", createdAt: "", updatedAt: "" } as any;

jest.mock("@/context/AuthContext", () => ({ useAuth: () => ({ user: authUser }) }));
let queryState = { data: [], isLoading: false };
jest.mock("@tanstack/react-query", () => ({ useQuery: () => queryState }));

jest.mock("@/lib/axios", () => ({ api: { get: jest.fn() } }));

describe("NotificationBell", () => {
  it("shows badge when unread notifications present", () => {
    queryState = { data: [{ id: "n1", content: "hello", isRead: false }], isLoading: false } as any;
    render(<NotificationBell />);
    expect(screen.getByText("1")).toBeInTheDocument();
  });


});
