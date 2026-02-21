import { useParams } from "@tanstack/react-router";

export function ApplicationDetailPage() {
  const { id } = useParams({ strict: false });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Application {id ?? "—"}
      </h1>
      <p className="text-gray-500 dark:text-gray-400">
        Read-only detail view. Summary / Form / Timeline tabs will go here.
      </p>
    </div>
  );
}
