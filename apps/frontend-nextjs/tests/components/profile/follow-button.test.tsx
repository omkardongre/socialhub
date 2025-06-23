import { render, screen, fireEvent } from "@testing-library/react";
import { FollowButton } from "@/components/profile/follow-button";

const mutateMock = jest.fn();

jest.mock("@tanstack/react-query", () => ({
  useMutation: () => ({ mutate: mutateMock, isPending: false }),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

jest.mock("@/lib/axios", () => ({ api: { post: jest.fn(), delete: jest.fn() } }));

describe("FollowButton", () => {
  it("shows Follow and triggers mutate", () => {
    render(<FollowButton userId="u2" isFollowing={false} />);
    const btn = screen.getByRole("button", { name: /follow/i });
    fireEvent.click(btn);
    expect(mutateMock).toHaveBeenCalled();
  });

  it("shows Unfollow when following", () => {
    render(<FollowButton userId="u2" isFollowing />);
    expect(screen.getByRole("button", { name: /unfollow/i })).toBeInTheDocument();
  });
});
