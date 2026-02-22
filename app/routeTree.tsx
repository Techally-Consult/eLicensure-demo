import {
  createRoute,
  createRootRoute,
  Outlet,
} from "@tanstack/react-router";
import { RootLayout } from "./layouts/RootLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { ApplicationsListPage } from "./pages/ApplicationsListPage";
import { ApplicationDetailPage } from "./pages/ApplicationDetailPage";
import { ApplicationWizardPage } from "./pages/ApplicationWizardPage";
import { LoginPage } from "./pages/LoginPage";
import { InspectionListPage } from "./pages/InspectionListPage";
import { InspectionDetailPage } from "./pages/InspectionDetailPage";
import { TeamLeaderPage } from "./pages/TeamLeaderPage";
import { UsersPage } from "./pages/UsersPage";

const rootRoute = createRootRoute({
  component: RootLayout,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "login",
  component: LoginPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

const applicationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "applications",
  component: () => <Outlet />,
});

const applicationsIndexRoute = createRoute({
  getParentRoute: () => applicationsRoute,
  path: "/",
  component: ApplicationsListPage,
});

const applicationDetailRoute = createRoute({
  getParentRoute: () => applicationsRoute,
  path: "$id",
  component: ApplicationDetailPage,
});

const applyLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "apply",
  component: () => <Outlet />,
});

const applyIndexRoute = createRoute({
  getParentRoute: () => applyLayoutRoute,
  path: "/",
  component: ApplicationWizardPage,
});

const applyIdRoute = createRoute({
  getParentRoute: () => applyLayoutRoute,
  path: "$id",
  component: ApplicationWizardPage,
});

const applyLayoutWithChildren = applyLayoutRoute.addChildren([
  applyIndexRoute,
  applyIdRoute,
]);

const applicationsRouteWithChildren = applicationsRoute.addChildren([
  applicationsIndexRoute,
  applicationDetailRoute,
]);

const inspectionLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "inspection",
  component: () => <Outlet />,
});

const inspectionIndexRoute = createRoute({
  getParentRoute: () => inspectionLayoutRoute,
  path: "/",
  component: InspectionListPage,
});

const inspectionIdRoute = createRoute({
  getParentRoute: () => inspectionLayoutRoute,
  path: "$id",
  component: InspectionDetailPage,
});

const inspectionLayoutWithChildren = inspectionLayoutRoute.addChildren([
  inspectionIndexRoute,
  inspectionIdRoute,
]);

const teamLeaderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "team-leader",
  component: TeamLeaderPage,
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "users",
  component: UsersPage,
});

export const routeTree = rootRoute.addChildren([
  loginRoute,
  indexRoute,
  applicationsRouteWithChildren,
  applyLayoutWithChildren,
  inspectionLayoutWithChildren,
  teamLeaderRoute,
  usersRoute,
]);
