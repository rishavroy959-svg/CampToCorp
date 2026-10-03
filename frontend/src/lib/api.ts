const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

function getStoredToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("camptocorp_jwt_token");
  }
  return null;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      let detail = "";
      try {
        const errorJson = await res.json();
        detail = errorJson.detail || JSON.stringify(errorJson);
      } catch {
        detail = await res.text();
      }
      throw new Error(detail || `API Error [${res.status}]`);
    }

    return await res.json();
  } catch (error) {
    console.error(`Request failed for ${url}:`, error);
    throw error;
  }
}

export const api = {
  // Health
  getHealth: () => request<{ status: string; service: string; version: string; ready: boolean }>("/health"),

  // Authentication
  login: (credentials: { email: string; password: string }) =>
    request<{ access_token: string; role: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  register: (userData: { email: string; password: string; full_name: string; role: string; branch?: string; roll_number?: string; company_name?: string }) =>
    request<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
  getDemoAccounts: () => request<any[]>("/auth/demo-accounts"),
  getMe: (token?: string) =>
    request<any>("/auth/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  // Students & Readiness
  getStudents: (params?: { branch?: string; min_cgpa?: number; at_risk_only?: boolean; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.branch) query.append("branch", params.branch);
    if (params?.min_cgpa) query.append("min_cgpa", params.min_cgpa.toString());
    if (params?.at_risk_only) query.append("at_risk_only", "true");
    if (params?.limit) query.append("limit", params.limit.toString());
    const qStr = query.toString() ? `?${query.toString()}` : "";
    return request<any[]>(`/students/${qStr}`);
  },
  getStudent: (studentId: number) => request<any>(`/students/${studentId}`),
  createStudent: (studentData: any) =>
    request<any>("/students/", {
      method: "POST",
      body: JSON.stringify(studentData),
    }),

  // Placement Drives & Conflicts
  getDrives: () => request<any[]>("/drives/"),
  getDrive: (driveId: number) => request<any>(`/drives/${driveId}`),
  getAllConflicts: () => request<any[]>("/drives/conflicts/all"),
  getDriveAlternatives: (driveId: number) => request<any>(`/drives/${driveId}/alternatives`),
  rescheduleDrive: (driveId: number, data: { new_date: string; new_slot: string; new_venue: string; reason: string }) =>
    request<any>(`/drives/${driveId}/reschedule`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  resolveConflict: (conflictId: number, data: { resolution_notes: string; resolved_by: string }) =>
    request<any>(`/drives/conflicts/${conflictId}/resolve`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // AI Matching & Explainability
  getMatchingResults: (driveId: number) => request<any>(`/matching/drives/${driveId}/results`),
  applyMatchingOverride: (data: { match_id: number; is_shortlisted: boolean; reason: string; officer_name: string }) =>
    request<any>("/matching/override", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  runDriveMatching: (driveId: number) =>
    request<any>(`/matching/drives/${driveId}/run`, {
      method: "POST",
    }),

  // Offers & Verification
  getOffers: () => request<any[]>("/offers/"),
  updateOfferStatus: (offerId: number, status: string, notes?: string) =>
    request<any>(`/offers/${offerId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, notes }),
    }),
  verifyOfferDocs: (offerId: number, data: { docs_verified: boolean; verified_by: string; notes?: string }) =>
    request<any>(`/offers/${offerId}/verify-docs`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Analytics & Notifications
  getAnalytics: () => request<any>("/analytics/overview"),
  getNotifications: () => request<any[]>("/notifications/"),
};
