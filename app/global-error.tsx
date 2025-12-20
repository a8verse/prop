"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black p-4">
          <div className="max-w-md w-full bg-black/70 backdrop-blur-md rounded-lg shadow-xl border border-white/20 p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-white/60 mb-6">
              {error.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={reset}
              className="px-6 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary-light transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

