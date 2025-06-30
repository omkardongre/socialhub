export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 dark:border-gray-600 border-t-primary dark:border-t-primary-500" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
