import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
jest.mock("next/image", () => (props: any) => <img {...props} />);

jest.mock("@/lib/axios", () => ({ api: { put: jest.fn() } }));

const onUpdated = jest.fn();

describe("ProfileEditForm", () => {
  it("allows editing name and bio", async () => {
    render(
      <ProfileEditForm
        open
        onOpenChange={() => {}}
        initialName="Old"
        initialBio="Bio"
        initialAvatarUrl=""
        onProfileUpdated={onUpdated}
      />
    );
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "New" } });
    fireEvent.change(screen.getByLabelText(/bio/i), { target: { value: "New bio" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => {
      expect(onUpdated).toHaveBeenCalledWith("New", "New bio", "");
    });
  });
});
