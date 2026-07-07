export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p className="text-lg text-center">
        <a href="/login" className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          Go to Login
        </a>
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Please log in to access the admin panel
      </p>
    </div>
  );
}
