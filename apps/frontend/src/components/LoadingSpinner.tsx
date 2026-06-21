export function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-light-gray">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-lavender border-t-deep-purple"
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}
