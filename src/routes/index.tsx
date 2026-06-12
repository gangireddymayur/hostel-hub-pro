import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/role";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const session = getSession();
    throw redirect({
      to: session?.profile.role === "SUPER_ADMIN" ? "/super/dashboard" : session?.profile.role === "HOSTEL_ADMIN" ? "/admin/dashboard" : "/login",
    });
  },
});
