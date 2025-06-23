jest.mock("next/headers", () => ({ cookies: jest.fn(() => ({ get: jest.fn() })) }));
jest.mock("next/navigation", () => ({ redirect: () => { throw new Error("NEXT_REDIRECT"); } }));
import ProfilePage from "@/app/profile/[id]/page";

describe("ProfilePage (server)", () => {
  it("runs without crashing (SSR async)", async () => {
    // Provide a dummy params promise as required by the page
    const params = Promise.resolve({ id: "1" });
    await expect(ProfilePage({ params })).rejects.toThrow("NEXT_REDIRECT");
  });
});
