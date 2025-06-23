import { render, screen } from "@testing-library/react";
import { PostCard } from "@/components/feed/post-card";
import { Post } from "@/types/post";

jest.mock("next/image", () => (props: any) => <img {...props} />);

const basePost: Post = {
  id: "1",
  content: "Test content",
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z",
  user: { id: "u1", name: "Alice", avatarUrl: "", userId: "alice", createdAt: "", updatedAt: "" },
  mediaUrl: "http://image.com/img.png",
};

describe("PostCard", () => {
  it("renders user name and content", () => {
    render(<PostCard post={basePost} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders media image if present", () => {
    render(<PostCard post={basePost} />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });
});
