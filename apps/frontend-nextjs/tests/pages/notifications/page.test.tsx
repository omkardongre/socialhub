jest.mock("next/headers", () => ({ cookies: jest.fn(() => ({ get: jest.fn() })) }));
jest.mock("next/navigation", () => ({ redirect: () => { throw new Error("NEXT_REDIRECT"); } }));
import NotificationsPage from "@/app/notifications/page";

describe("NotificationsPage (server)", () => {
  it("runs without crashing (SSR async)", async () => {
    await expect(NotificationsPage()).rejects.toThrow("NEXT_REDIRECT");
  });
});
