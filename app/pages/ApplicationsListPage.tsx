import { Link } from "@tanstack/react-router";

export function ApplicationsListPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Applications
      </h1>
      <p className="text-gray-500 dark:text-gray-400">
        No applications yet.{" "}
        <Link to="/apply" className="text-blue-600 hover:underline dark:text-blue-400">
          Start a new application
        </Link>
        .
      </p>
    </div>
  );
}
