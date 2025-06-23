import { render, screen } from "@testing-library/react";
import { UserProfile } from "@/components/profile/user-profile";
import { User } from "@/types/user";

jest.mock("next/image", () => (props: any) => <img {...props} />);

jest.mock("@/components/profile/profile-edit-form", () => ({
  ProfileEditForm: () => <div data-testid="edit-form" />,
}));

jest.mock("@/components/profile/follow-button", () => ({
  FollowButton: () => <button>follow</button>,
}));

jest.mock("@/lib/axios", () => ({
  api: { get: jest.fn().mockResolvedValue({ data: { data: { userId: "me" } } }) },
}));

const baseUser: User = {
  id: "1",
  userId: "john",
  name: "John",
  bio: "Hello",
  avatarUrl: "",
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-02T00:00:00Z",
  isFollowing: false,
} as any;

describe("UserProfile", () => {
  it("renders user details", () => {
    render(<UserProfile user={baseUser} />);
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
