import { render, screen } from "@testing-library/react";
import ExplorePage from "@/app/explore/page";

jest.mock("@/components/discovery/UserSearchInputForDiscovery", () => ({
  UserSearchInputForDiscovery: () => <div data-testid="user-search" />,
}));

describe("ExplorePage", () => {
  it("renders header and user search", () => {
    render(<ExplorePage />);
    expect(screen.getByText(/discover people/i)).toBeInTheDocument();
    expect(screen.getByTestId("user-search")).toBeInTheDocument();
  });
});
