import { Outlet } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-900 dark:text-white">
            eLicensure
          </span>
          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
            Demo
          </span>
          <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="w-56 border-r border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <nav className="flex flex-col gap-1">
            <Link
              to="/"
              className="rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
              activeProps={{ className: "bg-gray-200 font-medium dark:bg-gray-800" }}
            >
              Dashboard
            </Link>
            <Link
              to="/applications"
              className="rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
              activeProps={{ className: "bg-gray-200 font-medium dark:bg-gray-800" }}
            >
              Applications
            </Link>
            <Link
              to="/apply"
              className="rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
              activeProps={{ className: "bg-gray-200 font-medium dark:bg-gray-800" }}
            >
              New Application
            </Link>
          </nav>
        </aside>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
