export type UserRole = "PLACEMENT_OFFICER" | "STUDENT" | "RECRUITER" | "MENTOR";

export type ReadinessLevel = "NOT_READY" | "DEVELOPING" | "READY" | "HIGHLY_EMPLOYABLE";

export interface Student {
  id: string;
  name: string;
  email: string;
  branch: string;
  cgpa: number;
  backlogs: number;
  readinessScore: number;
  readinessLevel: ReadinessLevel;
  skills: string[];
  certifications: string[];
  mockScore: number;
  atRisk: boolean;
  status: "UNPLACED" | "PLACED" | "OFFER_EXTENDED";
}

export interface Drive {
  id: string;
  companyName: string;
  role: string;
  ctc: number;
  minCgpa: number;
  allowedBranches: string[];
  requiredSkills: string[];
  date: string;
  slot: "MORNING" | "AFTERNOON" | "FULL_DAY";
  venue: string;
  status: "UPCOMING" | "ACTIVE" | "COMPLETED";
  conflictDetected: boolean;
  conflictDetails?: string;
}

export interface Offer {
  id: string;
  studentId: string;
  studentName: string;
  companyName: string;
  role: string;
  ctc: number;
  date: string;
  status: "PENDING" | "ACCEPTED" | "DEFERRED" | "WITHDRAWN";
  docsVerified: boolean;
}

export interface MatchingResult {
  studentId: string;
  studentName: string;
  cgpa: number;
  fitScore: number;
  readinessLevel: ReadinessLevel;
  matchedSkills: string[];
  partialSkills: string[];
  missingSkills: string[];
  explanation: string;
  isEligible: boolean;
  overrideApplied?: boolean;
}
