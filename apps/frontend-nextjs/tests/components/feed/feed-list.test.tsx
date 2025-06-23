import { render, screen } from "@testing-library/react";
import { FeedList } from "@/components/feed/feed-list";
import { Post } from "@/types/post";

jest.mock("@/components/feed/post-card", () => ({
  PostCard: ({ post }: { post: Post }) => <div data-testid="post-card">{post.content}</div>,
}));

jest.mock("@/lib/axios", () => ({ api: { get: jest.fn() } }));

let queryState = { data: { data: [] }, isLoading: false };
jest.mock("@tanstack/react-query", () => ({
  useQuery: () => queryState,
}));

describe("FeedList", () => {
  it("shows skeleton while loading", () => {
    queryState = { data: { data: [] }, isLoading: true };
    render(<FeedList />);
    expect(document.querySelector('[data-slot="skeleton"]')).toBeTruthy();
  });

  it("renders posts when loaded", () => {
    queryState = { data: { data: [{ id: "1", content: "hello" }] }, isLoading: false };
    render(<FeedList />);
    expect(screen.getByTestId("post-card")).toHaveTextContent("hello");
  });
});
