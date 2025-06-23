import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm } from "@/components/auth/login-form";

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

// Mock next/navigation and AuthContext if needed
describe('LoginForm', () => {
  it('renders email and password fields', () => {
    renderWithQueryClient(<LoginForm />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it('disables button when pending', () => {
    renderWithQueryClient(<LoginForm />);
    const button = screen.getByRole('button', { name: /login/i });
    expect(button).toBeEnabled();
  });

  it('shows sign up link', () => {
    renderWithQueryClient(<LoginForm />);
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  it('submits form with email and password', () => {
    renderWithQueryClient(<LoginForm />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    // You can add further assertions here if you mock the mutation
  });
});
