import { render, screen } from "@testing-library/react";
import SignupPage from "@/app/auth/signup/page";

jest.mock("@/components/auth/signup-form", () => ({
  SignupForm: () => <div data-testid="signup-form" />,
}));

describe("SignupPage", () => {
  it("renders signup header and form", () => {
    render(<SignupPage />);
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    expect(screen.getByTestId("signup-form")).toBeInTheDocument();
  });
});
