import { render, screen, fireEvent } from "@testing-library/react";
import { NotificationsList } from "@/components/notifications/notifications-list";
import { Notification } from "@/types/notification";

jest.mock("@/components/ui/card", () => ({
  Card: ({ children, ...p }: any) => <div {...p}>{children}</div>,
}));

// mock react-query hooks
let queryState: { data: Notification[] | undefined; isLoading: boolean } = {
  data: [],
  isLoading: false,
};
const mutateMock = jest.fn();

jest.mock("@tanstack/react-query", () => ({
  useQuery: () => queryState,
  useMutation: () => ({ mutate: mutateMock }),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

jest.mock("@/lib/axios", () => ({ api: { get: jest.fn(), put: jest.fn() } }));

describe("NotificationsList", () => {
  const notif: Notification = {
    id: "n1",
    content: "New message",
    createdAt: "2023-01-01T00:00:00Z",
    isRead: false,
    type: "msg",
    entityType: "chat",
    entityId: "c1",
  } as any;

  it("shows skeleton when loading", () => {
    queryState = { data: [], isLoading: true };
    render(<NotificationsList />);
    expect(document.querySelector('[data-slot="skeleton"]')).toBeTruthy();
  });

  it("renders notifications and marks as read", () => {
    queryState = { data: [notif], isLoading: false };
    render(<NotificationsList />);
    expect(screen.getByText("New message")).toBeInTheDocument();
    fireEvent.click(screen.getByText(/mark as read/i));
    expect(mutateMock).toHaveBeenCalledWith("n1");
  });
});
