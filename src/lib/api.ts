import { clearSession, getSession, setSession, type ApiRole, type Session } from "@/lib/role";

const DEFAULT_BASE_URL = "/api";

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? DEFAULT_BASE_URL;

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
  auth?: boolean;
};

type ApiErrorBody = { message?: string; error?: string };

export type LoginPayload = {
  type: ApiRole;
  identifier: string;
  password: string;
  hostelId?: string;
};

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  profile: Session["profile"];
};

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

async function rawRequest(path: string, options: RequestOptions = {}): Promise<Response> {
  const session = getSession();
  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (options.auth !== false && session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }
  if (options.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const body: BodyInit | undefined =
    options.body && !isFormData && typeof options.body === "object" && !(options.body instanceof Blob)
      ? JSON.stringify(options.body)
      : ((options.body ?? undefined) as BodyInit | undefined);

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body,
  });
}

async function request<T>(path: string, options: RequestOptions = {}, retry = true): Promise<T> {
  const response = await rawRequest(path, options);
  if (response.status === 401 && retry && options.auth !== false) {
    const session = getSession();
    if (session?.refreshToken && (await refreshAccessToken(session.refreshToken))) {
      return request<T>(path, options, false);
    }
  }
  return handleResponse<T>(response);
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = (await response.clone().json()) as ApiErrorBody;
      message = body.message ?? body.error ?? message;
    } catch {
      const text = await response.text();
      if (text) message = text;
    }
    throw new Error(message);
  }
  return parseJson<T>(response);
}

async function refreshAccessToken(refreshToken: string): Promise<boolean> {
  try {
    const response = await rawRequest("/auth/refresh", {
      method: "POST",
      auth: false,
      body: { refreshToken },
    });
    if (!response.ok) return false;
    const data = (await response.json()) as { accessToken: string };
    const current = getSession();
    if (current) {
      setSession({
        ...current,
        accessToken: data.accessToken,
      });
    }
    return true;
  } catch {
    clearSession();
    return false;
  }
}

export function getStoredSession() {
  return getSession();
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const data = await request<LoginResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: payload,
  });
  setSession(data);
  return data;
}

export async function logout() {
  const session = getSession();
  if (session?.refreshToken) {
    try {
      await rawRequest("/auth/logout", {
        method: "POST",
        auth: false,
        body: { refreshToken: session.refreshToken },
      });
    } catch {
      // Best effort.
    }
  }
  clearSession();
}

export async function changePassword(payload: { currentPassword: string; newPassword: string }) {
  return request<{ message: string }>("/auth/change-password", {
    method: "POST",
    body: payload,
  });
}

export async function getSuperHostels() {
  return request<{ data: Array<Record<string, unknown> & { id: string; hostel_name: string; email: string; status: string; created_at: string; parent_hostel_id?: string | null; _count?: { students: number; parents: number; staff: number; leaveRequests: number } }> }>("/super-admin/hostels");
}

export async function createHostel(payload: { hostel_name: string; email?: string; password?: string }) {
  return request<{
    data: {
      hostel: { id: string; hostel_name: string; email: string; status: string; created_at: string };
      admin: { id: string; role: string; hostelId: string | null; email: string | null };
      credentials: { hostel_email: string; password: string };
    };
  }>("/super-admin/hostels", {
    method: "POST",
    body: payload,
  });
}

export async function updateHostel(hostelId: string, payload: { hostel_name?: string; email?: string; password?: string }) {
  return request<{ data: unknown }>(`/super-admin/hostels/${hostelId}`, {
    method: "PATCH",
    body: payload,
  });
}

export async function deleteHostel(hostelId: string) {
  return request<{ message: string }>(`/super-admin/hostels/${hostelId}`, {
    method: "DELETE",
  });
}

export async function setHostelStatus(hostelId: string, status: "ACTIVE" | "DISABLED") {
  return request<{ data: unknown }>(`/super-admin/hostels/${hostelId}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export async function getSuperAnalytics() {
  return request<{
    data: {
      hostels: number;
      students: number;
      leaveRequests: number;
      monthlyGrowth: Array<{ month: string; hostels: number; students: number }>;
      weeklyLeaves: Array<{ day: string; requests: number; approved: number }>;
    };
  }>("/super-admin/analytics");
}

export async function getSuperAuditLogs() {
  return request<{ data: Array<Record<string, unknown>> }>("/super-admin/audit-logs");
}

export async function getHostelDashboard() {
  return request<{ data: { students: number; parents: number; staff: number; pendingLeaves: number; approvedLeaves: number } }>("/hostel-admin/dashboard");
}

export async function getHostelStudents() {
  return request<{ data: Array<Record<string, unknown> & { id: string; student_id: string; name: string; room_number: string; mobile: string; parent_mobile: string; profile_photo: string | null; status: string; created_at: string; student_year?: string | null }> }>("/hostel-admin/students");
}

export async function createStudent(payload: { student_id: string; name: string; room_number: string; mobile: string; parent_mobile: string; password?: string; parent_password?: string; hostel_id?: string; student_year?: string | null }) {
  return request<{ data: unknown }>("/hostel-admin/students", {
    method: "POST",
    body: payload,
  });
}

export async function updateStudent(
  studentId: string,
  payload: {
    student_id?: string;
    name?: string;
    room_number?: string;
    mobile?: string;
    parent_mobile?: string;
    password?: string;
    parent_password?: string;
    status?: string;
    hostel_id?: string;
    student_year?: string | null;
  }
) {
  return request<{ data: unknown }>(`/hostel-admin/students/${studentId}`, {
    method: "PATCH",
    body: payload,
  });
}

export async function deleteStudent(studentId: string) {
  return request<{ message: string }>(`/hostel-admin/students/${studentId}`, {
    method: "DELETE",
  });
}

export async function importStudents(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return request<{ data: { imported: number } }>("/hostel-admin/students/import", {
    method: "POST",
    body: formData,
  });
}

export async function uploadStudentPhoto(studentId: string, file: File) {
  const formData = new FormData();
  formData.append("photo", file);
  return request<{ data: unknown }>(`/hostel-admin/students/${studentId}/photo`, {
    method: "POST",
    body: formData,
  });
}

export async function uploadParentPhoto(studentId: string, file: File) {
  const formData = new FormData();
  formData.append("photo", file);
  return request<{ data: unknown }>(`/hostel-admin/students/${studentId}/parent-photo`, {
    method: "POST",
    body: formData,
  });
}

export async function getHostelStaff() {
  return request<{ data: Array<Record<string, unknown> & { id: string; role: string; name: string; email: string; created_at: string; profile_photo?: string | null }> }>("/hostel-admin/staff");
}

export async function uploadStaffPhoto(id: string, file: File) {
  const formData = new FormData();
  formData.append("photo", file);
  return request<{ data: unknown }>(`/hostel-admin/staff/${id}/photo`, {
    method: "POST",
    body: formData,
  });
}

export async function createStaff(payload: { role: "HOSTEL_ADMIN" | "SECURITY_GUARD" | "HOSTEL_STAFF"; name: string; email: string; password?: string; hostel_id?: string }) {
  return request<{ data: unknown }>("/hostel-admin/staff", {
    method: "POST",
    body: payload,
  });
}

export async function updateStaff(id: string, payload: { role?: "HOSTEL_ADMIN" | "SECURITY_GUARD" | "HOSTEL_STAFF"; name?: string; email?: string; password?: string; hostel_id?: string }) {
  return request<{ data: unknown }>(`/hostel-admin/staff/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export async function deleteStaff(id: string) {
  return request<{ message: string }>(`/hostel-admin/staff/${id}`, {
    method: "DELETE",
  });
}

export async function getLeaveRequests() {
  return request<{
    data: Array<
      Record<string, unknown> & {
        id: string;
        reason: string;
        from_date: string;
        to_date: string;
        out_time: string;
        return_time: string;
        parent_status: string;
        hostel_status: string;
        final_status: string;
        created_at: string;
        student_lat?: number | null;
        student_lng?: number | null;
        student: {
          id: string;
          student_id: string;
          name: string;
          room_number: string;
          mobile: string;
          parent_mobile: string;
          status: string;
          hostel_name?: string;
        };
        gatePass?: {
          id: string;
          status: string;
          out_time_actual: string | null;
          in_time_actual: string | null;
          out_guard_lat?: number | null;
          out_guard_lng?: number | null;
          in_guard_lat?: number | null;
          in_guard_lng?: number | null;
        } | null;
      }
    >;
  }>("/hostel-admin/leave-requests");
}

export async function reviewLeaveRequest(leaveRequestId: string, payload: { status: "APPROVED" | "REJECTED"; note?: string }) {
  return request<{ data: unknown }>(`/hostel-admin/leave-requests/${leaveRequestId}/review`, {
    method: "PATCH",
    body: payload,
  });
}

export async function bulkReviewLeaveRequests(payload: { ids: string[]; status: "APPROVED" | "REJECTED" }) {
  return request<{ message: string }>("/hostel-admin/leave-requests/bulk-review", {
    method: "POST",
    body: payload,
  });
}

export async function getHostels() {
  return request<{ data: Array<{ id: string; hostel_name: string }> }>("/hostels");
}

export async function getHostelReports() {
  return request<{ data: { totalRequests: number; approved: number; rejected: number; returned: number; pending: number; gatePasses: number } }>("/hostel-admin/reports");
}
