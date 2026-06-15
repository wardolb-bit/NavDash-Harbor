import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export type Permission = "dashboard" | "admin" | "voyages" | "checklists" | "issues" | "pms" | "maintenance";

export type RbacUser = {
  id: string;
  role?: UserRole | null;
};

const rolePermissions: Record<UserRole, Permission[]> = {
  admin: ["dashboard", "admin", "voyages", "checklists", "issues", "pms", "maintenance"],
  deck: ["dashboard", "voyages", "checklists", "issues"],
  engine: ["dashboard", "pms", "maintenance"],
};

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const supabase = await createClient();
  const result = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  const data = result.data as { role: UserRole } | null;

  if (result.error || !data) {
    return null;
  }

  return data.role;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<UserRole> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = await getUserRole(user.id);

  if (!role || !allowedRoles.includes(role)) {
    redirect("/dashboard?error=unauthorized");
  }

  return role;
}

export function canAccess(user: RbacUser | null, permission: Permission): boolean {
  if (!user?.role) {
    return false;
  }

  return rolePermissions[user.role].includes(permission);
}
