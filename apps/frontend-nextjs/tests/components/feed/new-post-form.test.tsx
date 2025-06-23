import { render, screen, fireEvent } from "@testing-library/react";
import { NewPostForm } from "@/components/feed/new-post-form";

jest.mock("next/image", () => (props: any) => <img {...props} />);
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const postMock = jest.fn();
const invalidateMock = jest.fn();

jest.mock("@/lib/axios", () => ({
  api: {
    post: jest.fn().mockResolvedValue({ data: { data: { url: "media-url" } } }),
    put: jest.fn().mockResolvedValue({}),
  },
}));
jest.mock("@tanstack/react-query", () => ({
  useMutation: () => ({ mutate: postMock, isPending: false }),
  useQueryClient: () => ({ invalidateQueries: invalidateMock }),
}));

describe("NewPostForm", () => {
  it("renders textarea and post button", () => {
    render(<NewPostForm />);
    expect(screen.getByPlaceholderText(/what's on your mind/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /post/i })).toBeInTheDocument();
  });

  it("calls mutate on post button click", () => {
    render(<NewPostForm />);
    const textarea = screen.getByPlaceholderText(/what's on your mind/i);
    fireEvent.change(textarea, { target: { value: "Hello" } });
    const btn = screen.getByRole("button", { name: /post/i });
    fireEvent.click(btn);
    expect(postMock).toHaveBeenCalled();
  });
});
