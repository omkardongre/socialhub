import { render, screen, fireEvent } from "@testing-library/react";
import { UserSearchInputForChat } from "@/components/chat/UserSearchInputForChat";
import { User } from "@/types/profile";

// stub next/image
jest.mock("next/image", () => (props: any) => {
  // eslint-disable-next-line jsx-a11y/alt-text
  return <img {...props} />;
});

let searchState: { results: User[]; loading: boolean } = {
  results: [],
  loading: false,
};

jest.mock("@/hooks/useUserSearch", () => ({
  useUserSearch: () => searchState,
}));

afterEach(() => jest.clearAllMocks());

describe("UserSearchInputForChat", () => {
  const userA: User = {
    id: "1",
    userId: "alice",
    name: "Alice",
    avatarUrl: "",
    createdAt: "",
    updatedAt: "",
  } as any;
  const userB: User = {
    id: "2",
    userId: "bob",
    name: "Bob",
    avatarUrl: "",
    createdAt: "",
    updatedAt: "",
  } as any;

  it("shows skeleton on loading", () => {
    searchState = { results: [], loading: true };
    render(<UserSearchInputForChat selected={[]} setSelected={jest.fn()} />);
    expect(document.querySelector('[data-slot="skeleton"]')).toBeTruthy();
  });

  it("renders results and adds badge on click", () => {
    searchState = { results: [userA, userB], loading: false };
    const setSelected = jest.fn();
    render(<UserSearchInputForChat selected={[]} setSelected={setSelected} />);
    fireEvent.click(screen.getByText("Alice"));
    expect(setSelected).toHaveBeenCalledWith([userA]);
  });
});
