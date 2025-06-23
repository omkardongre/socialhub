import { render, screen } from "@testing-library/react";
jest.mock("next/navigation", () => ({ redirect: jest.fn() }));
import FeedPage from "@/app/feed/page";

jest.mock("@/components/feed/feed-list", () => ({
  FeedList: () => <div data-testid="feed-list" />,
}));

jest.mock("@/components/feed/new-post-form", () => ({
  NewPostForm: () => <div data-testid="new-post-form" />,
}));

jest.mock("next/headers", () => ({ cookies: jest.fn(() => ({ get: jest.fn() })) }));

// FeedPage is a Server Component; we cannot render it with RTL.
// Only test that the async function executes without throwing (after mocking internal Next.js helpers).

describe("FeedPage (server)", () => {
  it("runs without crashing (SSR async)", async () => {
    await expect(FeedPage()).resolves.toBeDefined();
  });
});
