import HomePage from "@/app/page";

describe("HomePage", () => {
  it.skip("cannot test SSR redirect outside Next.js runtime (see Next.js cookies API limitation)", () => {
    // The HomePage function uses Next.js cookies API which throws outside real request context.
    // See: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context
  });
});
