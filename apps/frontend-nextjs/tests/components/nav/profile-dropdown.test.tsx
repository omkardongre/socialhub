import { render, screen } from "@testing-library/react";
import ProfileDropdown from "@/components/nav/ProfileDropdown";
import { User } from "@/types/profile";

jest.mock("next/link", () => ({
  __esModule: true,
  default: (props: any) => <a {...props} />,
}));
jest.mock("next/image", () => (props: any) => {
  const { unoptimized, ...rest } = props;
  // eslint-disable-next-line jsx-a11y/alt-text
  return <img {...rest} />;
});

// Mock Radix DropdownMenu components to just render children
jest.mock("@/components/ui/dropdown-menu", () => ({
  __esModule: true,
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, ...rest }: any) => (
    <div {...rest}>{children}</div>
  ),
  DropdownMenuSeparator: () => <hr />,
}));

const postMock = jest.fn();
jest.mock("@/lib/axios", () => ({
  api: { post: (...args: unknown[]) => postMock(...args) },
}));

const refreshMock = jest.fn();

const user: User = {
  id: "1",
  userId: "u1",
  name: "Test User",
  avatarUrl: "",
  createdAt: "",
  updatedAt: "",
} as any;
jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user, refresh: refreshMock }),
}));

describe("ProfileDropdown", () => {
  it("renders user name", () => {
    render(<ProfileDropdown />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });
});
