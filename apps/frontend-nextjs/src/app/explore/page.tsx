import { UserSearchInputForDiscovery } from "@/components/discovery/UserSearchInputForDiscovery";

export default function ExplorePage() {
  return (
    <div className="max-w-lg mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-4">Discover People</h1>
      <UserSearchInputForDiscovery />
      {/* Optionally, add trending users or suggestions below */}
    </div>
  );
}
