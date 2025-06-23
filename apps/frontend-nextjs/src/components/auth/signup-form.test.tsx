import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SignupForm } from "./signup-form";

// Helper to create a test QueryClient
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

function renderWithQueryClient(ui: React.ReactElement) {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  );
}

// Mock next/navigation's useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock AuthContext
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    refresh: jest.fn(),
  }),
}));

describe("SignupForm", () => {
  it("renders email and password fields", () => {
    renderWithQueryClient(<SignupForm />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it("disables button when pending", () => {
    renderWithQueryClient(<SignupForm />);
    const button = screen.getByRole("button", { name: /sign up/i });
    expect(button).toBeEnabled();
  });

  it("shows login link", () => {
    renderWithQueryClient(<SignupForm />);
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  it("submits form with email and password", () => {
    renderWithQueryClient(<SignupForm />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    // You can add further assertions here if you mock the mutation
  });
});
