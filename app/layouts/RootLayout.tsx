import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "~/contexts/AuthContext";
import { AppLayout } from "~/layouts/AppLayout";

/** Renders login page for /login; otherwise requires auth and renders AppLayout. */
export function RootLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === "/login";

  useEffect(() => {
    if (!user && !isLogin) navigate({ to: "/login" });
  }, [user, isLogin, navigate]);

  if (!user && !isLogin) {
    return null;
  }

  if (isLogin) {
    return <Outlet />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
