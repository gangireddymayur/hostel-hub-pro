import { jsx } from "react/jsx-runtime";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { s as setSession, g as getSession, c as clearSession } from "./router-CU2D4_Sy.mjs";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
const DEFAULT_BASE_URL = "/api";
const API_BASE_URL = DEFAULT_BASE_URL;
async function parseJson(response) {
  const text = await response.text();
  if (!text) return void 0;
  return JSON.parse(text);
}
async function rawRequest(path, options = {}) {
  const session = getSession();
  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (options.auth !== false && session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }
  if (options.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const body = options.body && !isFormData && typeof options.body === "object" && !(options.body instanceof Blob) ? JSON.stringify(options.body) : options.body ?? void 0;
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body
  });
}
async function request(path, options = {}, retry = true) {
  const response = await rawRequest(path, options);
  if (response.status === 401 && retry && options.auth !== false) {
    const session = getSession();
    if (session?.refreshToken && await refreshAccessToken(session.refreshToken)) {
      return request(path, options, false);
    }
  }
  return handleResponse(response);
}
async function handleResponse(response) {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.clone().json();
      message = body.message ?? body.error ?? message;
    } catch {
      const text = await response.text();
      if (text) message = text;
    }
    throw new Error(message);
  }
  return parseJson(response);
}
async function refreshAccessToken(refreshToken) {
  try {
    const response = await rawRequest("/auth/refresh", {
      method: "POST",
      auth: false,
      body: { refreshToken }
    });
    if (!response.ok) return false;
    const data = await response.json();
    const current = getSession();
    if (current) {
      setSession({
        ...current,
        accessToken: data.accessToken
      });
    }
    return true;
  } catch {
    clearSession();
    return false;
  }
}
async function login(payload) {
  const data = await request("/auth/login", {
    method: "POST",
    auth: false,
    body: payload
  });
  setSession(data);
  return data;
}
async function logout() {
  const session = getSession();
  if (session?.refreshToken) {
    try {
      await rawRequest("/auth/logout", {
        method: "POST",
        auth: false,
        body: { refreshToken: session.refreshToken }
      });
    } catch {
    }
  }
  clearSession();
}
async function changePassword(payload) {
  return request("/auth/change-password", {
    method: "POST",
    body: payload
  });
}
async function getSuperHostels() {
  return request("/super-admin/hostels");
}
async function createHostel(payload) {
  return request("/super-admin/hostels", {
    method: "POST",
    body: payload
  });
}
async function updateHostel(hostelId, payload) {
  return request(`/super-admin/hostels/${hostelId}`, {
    method: "PATCH",
    body: payload
  });
}
async function setHostelStatus(hostelId, status) {
  return request(`/super-admin/hostels/${hostelId}/status`, {
    method: "PATCH",
    body: { status }
  });
}
async function getSuperAnalytics() {
  return request("/super-admin/analytics");
}
async function getHostelDashboard() {
  return request("/hostel-admin/dashboard");
}
async function getHostelStudents() {
  return request("/hostel-admin/students");
}
async function createStudent(payload) {
  return request("/hostel-admin/students", {
    method: "POST",
    body: payload
  });
}
async function importStudents(file) {
  const formData = new FormData();
  formData.append("file", file);
  return request("/hostel-admin/students/import", {
    method: "POST",
    body: formData
  });
}
async function uploadStudentPhoto(studentId, file) {
  const formData = new FormData();
  formData.append("photo", file);
  return request(`/hostel-admin/students/${studentId}/photo`, {
    method: "POST",
    body: formData
  });
}
async function getHostelStaff() {
  return request("/hostel-admin/staff");
}
async function createStaff(payload) {
  return request("/hostel-admin/staff", {
    method: "POST",
    body: payload
  });
}
async function updateStaff(id, payload) {
  return request(`/hostel-admin/staff/${id}`, {
    method: "PATCH",
    body: payload
  });
}
async function getLeaveRequests() {
  return request("/hostel-admin/leave-requests");
}
async function reviewLeaveRequest(leaveRequestId, payload) {
  return request(`/hostel-admin/leave-requests/${leaveRequestId}/review`, {
    method: "PATCH",
    body: payload
  });
}
async function bulkReviewLeaveRequests(payload) {
  return request("/hostel-admin/leave-requests/bulk-review", {
    method: "POST",
    body: payload
  });
}
async function getHostels() {
  return request("/hostels");
}
async function getHostelReports() {
  return request("/hostel-admin/reports");
}
export {
  Button as B,
  Input as I,
  createHostel as a,
  getSuperAnalytics as b,
  changePassword as c,
  getHostelStaff as d,
  getHostels as e,
  createStaff as f,
  getSuperHostels as g,
  updateStaff as h,
  cn as i,
  getHostelReports as j,
  getLeaveRequests as k,
  login as l,
  bulkReviewLeaveRequests as m,
  getHostelDashboard as n,
  getHostelStudents as o,
  createStudent as p,
  uploadStudentPhoto as q,
  reviewLeaveRequest as r,
  setHostelStatus as s,
  importStudents as t,
  updateHostel as u,
  logout as v
};
