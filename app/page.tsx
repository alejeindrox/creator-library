import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-md rounded-lg bg-white p-8 text-center shadow-xl">
        <h1 className="mb-4 text-4xl font-bold">Welcome to Creator Library!</h1>
        <p className="mb-8 text-lg">Your personal hub for managing digital assets.</p>
        <nav className="flex flex-col space-y-4">
          <Link
            href="/login"
            className="transform rounded-lg bg-cyan-600 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:scale-105 hover:bg-cyan-700"
          >
            Login
          </Link>
          <Link
            href="/library"
            className="transform rounded-lg bg-amber-600 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:scale-105 hover:bg-amber-700"
          >
            Go to Library
          </Link>
          <Link
            href="/upgrade"
            className="transform rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:scale-105 hover:bg-emerald-700"
          >
            Upgrade Plan
          </Link>
        </nav>
      </div>
    </div>
  );
}
