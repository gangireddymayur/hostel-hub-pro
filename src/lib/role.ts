export type Role = "super" | "admin";
export type ApiRole = "SUPER_ADMIN" | "HOSTEL_ADMIN";

export type Session = {
  accessToken: string;
  refreshToken: string;
  profile: {
    id: string;
    role: ApiRole;
    hostelId: string | null;
    email: string | null;
  };
};

const KEY = "hlms_session";

export function setSession(session: Session) {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(session));
  }
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    localStorage.removeItem(KEY);
    return null;
  }
}

export function clearSession() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}

export function setRole(role: Role) {
  if (typeof window !== "undefined") {
    setSession({
      accessToken: "",
      refreshToken: "",
      profile: {
        id: role,
        role: role === "super" ? "SUPER_ADMIN" : "HOSTEL_ADMIN",
        hostelId: null,
        email: null,
      },
    });
  }
}

export function getRole(): Role | null {
  const session = getSession();
  if (!session) return null;
  return session.profile.role === "SUPER_ADMIN" ? "super" : "admin";
}

export function clearRole() {
  clearSession();
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
