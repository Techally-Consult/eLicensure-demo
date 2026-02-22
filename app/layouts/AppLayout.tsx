import { Outlet } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useAuth } from "~/contexts/AuthContext";
import { NotificationsDropdown } from "~/components/NotificationsDropdown";
import type { UserRole } from "~/types/auth";

type AppLayoutProps = { children?: React.ReactNode };

const navLinkClass =
  "rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800";
const navLinkActiveClass = "bg-gray-200 font-medium dark:bg-gray-800";

function canSeeApplicationsNew(role: UserRole): boolean {
  return role === "Applicant" || role === "Admin";
}

function canSeeInspection(role: UserRole): boolean {
  return role === "Team Leader" || role === "Inspector" || role === "Admin";
}

function canSeeUsers(role: UserRole): boolean {
  return role === "Admin";
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const role = user?.role ?? "Applicant";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-900 dark:text-white">
            eLicensure
          </span>
          <div className="flex items-center gap-3">
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              Demo
            </span>
            {user && (
              <>
                <NotificationsDropdown userId={user.id} />
                <span className="text-sm text-muted-foreground">
                  {user.name} ({user.role})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    window.location.href = "/login";
                  }}
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Log out
                </button>
              </>
            )}
            <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="w-56 border-r border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <nav className="flex flex-col gap-1">
            <Link
              to="/"
              className={navLinkClass}
              activeProps={{ className: navLinkActiveClass }}
            >
              Dashboard
            </Link>
            <span className="mt-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Applications
            </span>
            <Link
              to="/applications"
              className={navLinkClass}
              activeProps={{ className: navLinkActiveClass }}
            >
              List
            </Link>
            {canSeeApplicationsNew(role) && (
              <>
                <Link
                  to="/apply"
                  className={navLinkClass}
                  activeProps={{ className: navLinkActiveClass }}
                >
                  New
                </Link>
                <Link
                  to="/apply"
                  search={{ type: "renewal" }}
                  className={navLinkClass}
                  activeProps={{ className: navLinkActiveClass }}
                >
                  Renewal
                </Link>
                <Link
                  to="/apply"
                  search={{ type: "variation" }}
                  className={navLinkClass}
                  activeProps={{ className: navLinkActiveClass }}
                >
                  Variation
                </Link>
                <Link
                  to="/apply"
                  search={{ type: "additional" }}
                  className={navLinkClass}
                  activeProps={{ className: navLinkActiveClass }}
                >
                  Additional service
                </Link>
              </>
            )}
            {canSeeInspection(role) && (
              <>
                <span className="mt-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Inspection
                </span>
                {role === "Team Leader" ? (
                  <Link
                    to="/team-leader"
                    className={navLinkClass}
                    activeProps={{ className: navLinkActiveClass }}
                  >
                    Inspection
                  </Link>
                ) : (
                  <Link
                    to="/inspection"
                    className={navLinkClass}
                    activeProps={{ className: navLinkActiveClass }}
                  >
                    Inspection
                  </Link>
                )}
              </>
            )}
            {canSeeUsers(role) && (
              <>
                <span className="mt-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  User Management
                </span>
                <Link
                  to="/users"
                  className={navLinkClass}
                  activeProps={{ className: navLinkActiveClass }}
                >
                  Users
                </Link>
              </>
            )}
          </nav>
        </aside>
        <main className="flex-1 p-6">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
