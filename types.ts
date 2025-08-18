
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  FIELD_OFFICER = 'FIELD_OFFICER',
}

export interface User {
  id: string;
  name: string;
  email: string; // Made required again for email-based login
  phoneNumber: string;
  password: string;
  address: string;
  customerNumber: string;
  role: UserRole;
  connectionStatus: 'active' | 'inactive';
  avatarUrl: string;
}

export interface Bill {
  id: string;
  userId: string;
  period: string; // e.g., "Juli 2024"
  lastReading: number; // m3
  currentReading: number; // m3
  usage: number; // m3
  ratePerM3: number;
  adminFee: number;
  totalAmount: number;
  status: 'paid' | 'unpaid';
  dueDate: string; // ISO date string
  paidDate?: string; // ISO date string
}

export enum ReportStatus {
    BARU = 'BARU',
    DIPROSES = 'DIPROSES',
    SELESAI = 'SELESAI'
}

export interface ProblemReport {
  id: string;
  userId: string;
  title: string;
  description: string;
  location: string;
  photoUrl?: string;
  status: ReportStatus;
  reportedAt: string; // ISO date string
  assigneeId?: string; // Field officer ID
}

export interface Tariff {
    id: string;
    name: string;
    ratePerM3: number;
    adminFee: number;
    description: string;
}
