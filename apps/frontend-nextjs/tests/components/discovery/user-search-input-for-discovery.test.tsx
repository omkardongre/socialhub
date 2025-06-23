import { render, screen, fireEvent } from "@testing-library/react";
import { UserSearchInputForDiscovery } from "@/components/discovery/UserSearchInputForDiscovery";
import { User } from "@/types/profile";

jest.mock("next/image", () => (props: any) => <img {...props} />);
jest.mock("next/link", () => ({
  __esModule: true,
  default: (props: any) => <a {...props} />,
}));

let state: { results: User[]; loading: boolean } = {
  results: [],
  loading: false,
};

jest.mock("@/hooks/useUserSearch", () => ({
  useUserSearch: () => state,
}));

afterEach(() => jest.clearAllMocks());

describe("UserSearchInputForDiscovery", () => {
  const user: User = {
    id: "1",
    userId: "john",
    name: "John",
    avatarUrl: "",
    createdAt: "",
    updatedAt: "",
  } as any;

  it("shows skeleton while loading", () => {
    state = { results: [], loading: true };
    render(<UserSearchInputForDiscovery />);
    expect(document.querySelector('[data-slot="skeleton"]')).toBeTruthy();
  });

  it("lists link to user profile", () => {
    state = { results: [user], loading: false };
    render(<UserSearchInputForDiscovery />);
    const link = screen.getByText("John").closest("a");
    expect(link).toHaveAttribute("href", "/profile/john");
  });
});
