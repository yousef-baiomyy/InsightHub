import type { Branch, Role } from "@/types";

export interface AppUser {
  username: string;
  role: Role;
  displayName: string;
  /** null => manager (all branches). Otherwise scoped to a single branch. */
  branch: Branch | null;
}

/**
 * Predefined credentials (no database — client-side only).
 * NOTE: this is NOT real security. Anyone with the bundle can read these.
 * For production, move auth to a backend / provider. Documented in README.
 */
interface Credential extends AppUser {
  password: string;
}

const CREDENTIALS: Credential[] = [
  { username: "manager", password: "Manager@123", role: "manager", displayName: "Executive Manager", branch: null },
  { username: "cairo", password: "Cairo@123", role: "cairo", displayName: "Cairo Branch Manager", branch: "Cairo" },
  { username: "alex", password: "Alex@123", role: "alex", displayName: "Alexandria Branch Manager", branch: "Alexandria" },
  { username: "mansoura", password: "Mansoura@123", role: "mansoura", displayName: "Mansoura Branch Manager", branch: "Mansoura" },
];

export function authenticate(username: string, password: string): AppUser | null {
  const u = CREDENTIALS.find(
    (c) => c.username.toLowerCase() === username.trim().toLowerCase() && c.password === password,
  );
  if (!u) return null;
  // Strip the password before returning to the app layer.
  const { password: _pw, ...safe } = u;
  return safe;
}

export function isManager(user: AppUser | null): boolean {
  return user?.role === "manager";
}

/** Pages only the manager may open. Branch managers are redirected away. */
export const MANAGER_ONLY_PATHS = ["/comparison"];

export function canAccessPath(user: AppUser | null, path: string): boolean {
  if (!user) return false;
  if (isManager(user)) return true;
  return !MANAGER_ONLY_PATHS.some((p) => path.startsWith(p));
}
