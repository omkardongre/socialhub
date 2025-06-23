import { render, screen } from "@testing-library/react";
import Navbar from "@/components/nav/Navbar";
import { User } from "@/types/profile";

jest.mock("next/image", () => (props: any) => <img {...props} />);
jest.mock("next/link", () => ({ __esModule: true, default: (props: any) => <a {...props} /> }));

const user: User = { id: "1", userId: "alice", name: "Alice", avatarUrl: "", createdAt: "", updatedAt: "" } as any;

jest.mock("@/context/AuthContext", () => ({ useAuth: () => ({ user }) }));

jest.mock("@/components/nav/DarkModeToggle", () => ({ DarkModeToggle: () => <button>dark</button> }));
jest.mock("@/components/nav/ProfileDropdown", () => () => <div>profile</div>);

jest.mock("next/dynamic", () => () => () => <div>bell</div>);

jest.mock("next/navigation", () => ({ usePathname: () => "/feed" }));

describe("Navbar", () => {
  it("renders logo and links", () => {
    render(<Navbar />);
    expect(screen.getByText("SocialHub")).toBeInTheDocument();
    expect(screen.getByText("Feed")).toBeInTheDocument();
    expect(screen.getByText("Chat")).toBeInTheDocument();
  });
});
