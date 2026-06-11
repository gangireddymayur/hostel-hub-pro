export type Role = "super" | "admin";

const KEY = "hlms_role";

export function setRole(role: Role) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, role);
}
export function getRole(): Role | null {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem(KEY) as Role | null) ?? null;
}
export function clearRole() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}

const THEME = "hlms_theme";
export function getTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem(THEME) as "light" | "dark") ?? "light";
}
export function setTheme(t: "light" | "dark") {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME, t);
  document.documentElement.classList.toggle("dark", t === "dark");
}
export function initTheme() {
  if (typeof window === "undefined") return;
  document.documentElement.classList.toggle("dark", getTheme() === "dark");
}
