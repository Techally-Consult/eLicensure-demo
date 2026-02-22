import {
  createRoute,
  createRootRoute,
  Outlet,
} from "@tanstack/react-router";
import { AppLayout } from "./layouts/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { ApplicationsListPage } from "./pages/ApplicationsListPage";
import { ApplicationDetailPage } from "./pages/ApplicationDetailPage";
import { ApplicationWizardPage } from "./pages/ApplicationWizardPage";

const rootRoute = createRootRoute({
  component: AppLayout,
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

export const routeTree = rootRoute.addChildren([
  indexRoute,
  applicationsRouteWithChildren,
  applyLayoutWithChildren,
]);
