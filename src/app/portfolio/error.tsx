"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto py-12 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Failed to load portfolio
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error.message || "Unable to load portfolio items"}
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
