/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from "@supabase/supabase-js";
import { Loan, FieldOfficer, Investor } from "../types";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const STORAGE_KEY = "seth-capital-supabase-credentials";

// Load configuration with precedence: LocalStorage (flexible UI test) -> Env Variables
export function getSupabaseConfig(): SupabaseConfig | null {
  // 1. Check LocalStorage configuration first (allows quick browser-level input)
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.url && parsed.anonKey) {
        // Simple sanitisation
        const sanitizedUrl = parsed.url.trim();
        const sanitizedKey = parsed.anonKey.trim();
        if (sanitizedUrl && sanitizedKey) {
          return { url: sanitizedUrl, anonKey: sanitizedKey };
        }
      }
    }
  } catch (e) {
    console.error("Failed to read Supabase local config", e);
  }

  // 2. Fallback to Vite environment variables OR direct copy-paste configuration
  // --- DIRECT CONFIGURATION (ලයිව් සර්වර් එකට සම්බන්ධ කිරීමට ඔබගේ Supabase දත්ත පහත ඇතුලත් කරන්න) ---
  const DIRECT_SUPABASE_URL = "https://uondpyfsixaczqbhhzak.supabase.co"; // Example: "https://your-project.supabase.co"
  const DIRECT_SUPABASE_ANON_KEY = "sb_publishable_JG74NyH1UJ4g6uGKqz0tGQ_mdn7tWi2"; // Example: "eyJhbGciOi..."
  
  const envUrl = DIRECT_SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL || "";
  const envKey = DIRECT_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

  if (envUrl.trim() && envKey.trim()) {
    return {
      url: envUrl.trim(),
      anonKey: envKey.trim(),
    };
  }

  return null;
}

// Save config to local storage
export function saveSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
}

// Remove config from local storage
export function clearSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Generate the Supabase Client
export function getClient() {
  const config = getSupabaseConfig();
  if (!config) return null;
  return createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false,
    },
  });
}

// Test connection credentials
export async function testSupabaseConnection(url: string, anonKey: string): Promise<boolean> {
  try {
    const client = createClient(url.trim(), anonKey.trim(), {
      auth: { persistSession: false },
    });
    // Attempt a lightweight select on 'loans' table or user check
    const { error } = await client.from("loans").select("id").limit(1);
    
    // If table doesn't exist, it still connected successfully (connected to DB API but table is missing)
    if (error && error.code === "PGRST116") {
      // This is okay: connected but table missing
      return true;
    }
    if (error && error.message.includes("relation \"loans\" does not exist")) {
      return true; // Connection OK, table needs to be created
    }
    if (error) {
      console.warn("Connection test returned database error:", error);
      // If unauthorized API keys
      if ((error as any).status === 401 || (error as any).status === 403) {
        return false;
      }
    }
    return true; 
  } catch (e) {
    console.error("Supabase connection exception", e);
    return false;
  }
}

// SQL Script generator to copy/paste into Supabase SQL Editor
export const SUPABASE_SETUP_SQL = `-- -------------------------------------------------------------
-- SETH CAPITAL LOANS & PORTFOLIO MANAGEMENT DATABASE SCHEMA
-- Execute this SQL code block inside your Supabase SQL Editor
-- -------------------------------------------------------------

-- 1. LOANS TABLE
create table if not exists public.loans (
    id text primary key,
    status text not null,
    applicant jsonb not null,
    relative jsonb default '{}'::jsonb,
    loan_details jsonb default '{}'::jsonb,
    guarantor1 jsonb default '{}'::jsonb,
    guarantor2 jsonb default '{}'::jsonb,
    office_use jsonb not null,
    collections jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    synced_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) on loans
alter table public.loans enable row level security;
create policy "Enable all access for anon users" on public.loans
    for all using (true) with check (true);

-- 2. FIELD OFFICERS (REPRESENTATIVES) TABLE
create table if not exists public.field_officers (
    id text primary key,
    name text not null,
    nic text not null,
    phone text not null,
    address text not null,
    employee_id text,
    email text,
    vehicle_number text,
    joined_date text,
    target_collection numeric,
    status text default 'ACTIVE',
    expenses jsonb default '[]'::jsonb,
    allowances jsonb default '[]'::jsonb,
    remittances jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    synced_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) on field_officers
alter table public.field_officers enable row level security;
create policy "Enable all access for anon users" on public.field_officers
    for all using (true) with check (true);

-- 3. INVESTORS (EXTERNAL CAPITAL SEED) TABLE
create table if not exists public.investors (
    id text primary key,
    name text not null,
    nic text not null,
    phone text not null,
    address text not null,
    email text,
    bank_name text,
    bank_branch text,
    bank_account_number text,
    nominee_name text,
    nominee_relationship text,
    nominee_nic text,
    nominee_phone text,
    agreement_date text,
    expected_payout_rate numeric,
    transactions jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    synced_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) on investors
alter table public.investors enable row level security;
create policy "Enable all access for anon users" on public.investors
    for all using (true) with check (true);

-- Enable Realtime for all three tables
alter publication supabase_realtime add table public.loans;
alter publication supabase_realtime add table public.field_officers;
alter publication supabase_realtime add table public.investors;

comment on table public.loans is 'Seth Capital Loan Ledger and Collections Records';
comment on table public.field_officers is 'Seth Capital field representatives, employee target, expenses, allowances and cash remittances logs';
comment on table public.investors is 'Seth Capital microfinance external seed funding partners, nomimees and capital transactions sheets';
`;

// Conversion helpers for Loans
function toDbModel(loan: Loan) {
  return {
    id: loan.id,
    status: loan.status,
    applicant: loan.applicant,
    relative: loan.relative,
    loan_details: loan.loanDetails,
    guarantor1: loan.guarantor1,
    guarantor2: loan.guarantor2,
    office_use: loan.officeUse,
    collections: loan.collections,
    created_at: loan.createdAt,
  };
}

function toAppModel(row: any): Loan {
  return {
    id: row.id,
    status: row.status as Loan["status"],
    applicant: typeof row.applicant === 'string' ? JSON.parse(row.applicant) : row.applicant,
    relative: typeof row.relative === 'string' ? JSON.parse(row.relative) : row.relative,
    loanDetails: typeof row.loan_details === 'string' ? JSON.parse(row.loan_details) : row.loan_details,
    guarantor1: typeof row.guarantor1 === 'string' ? JSON.parse(row.guarantor1) : row.guarantor1,
    guarantor2: typeof row.guarantor2 === 'string' ? JSON.parse(row.guarantor2) : row.guarantor2,
    officeUse: typeof row.office_use === 'string' ? JSON.parse(row.office_use) : row.office_use,
    collections: typeof row.collections === 'string' ? JSON.parse(row.collections) : row.collections,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

// Conversion helpers for Field Officers
function toDbFieldOfficer(officer: FieldOfficer) {
  return {
    id: officer.id,
    name: officer.name,
    nic: officer.nic,
    phone: officer.phone,
    address: officer.address,
    employee_id: officer.employeeId || null,
    email: officer.email || null,
    vehicle_number: officer.vehicleNumber || null,
    joined_date: officer.joinedDate || null,
    target_collection: officer.targetCollection || null,
    status: officer.status || 'ACTIVE',
    expenses: officer.expenses || [],
    allowances: officer.allowances || [],
    remittances: officer.remittances || [],
    created_at: officer.createdAt,
  };
}

function toAppFieldOfficer(row: any): FieldOfficer {
  return {
    id: row.id,
    name: row.name,
    nic: row.nic,
    phone: row.phone,
    address: row.address,
    employeeId: row.employee_id || undefined,
    email: row.email || undefined,
    vehicleNumber: row.vehicle_number || undefined,
    joinedDate: row.joined_date || undefined,
    targetCollection: row.target_collection ? parseFloat(row.target_collection) : undefined,
    status: (row.status || 'ACTIVE') as FieldOfficer["status"],
    expenses: typeof row.expenses === 'string' ? JSON.parse(row.expenses) : (row.expenses || []),
    allowances: typeof row.allowances === 'string' ? JSON.parse(row.allowances) : (row.allowances || []),
    remittances: typeof row.remittances === 'string' ? JSON.parse(row.remittances) : (row.remittances || []),
    createdAt: row.created_at || new Date().toISOString(),
  };
}

// Conversion helpers for Investors
function toDbInvestor(investor: Investor) {
  return {
    id: investor.id,
    name: investor.name,
    nic: investor.nic,
    phone: investor.phone,
    address: investor.address,
    email: investor.email || null,
    bank_name: investor.bankName || null,
    bank_branch: investor.bankBranch || null,
    bank_account_number: investor.bankAccountNumber || null,
    nominee_name: investor.nomineeName || null,
    nominee_relationship: investor.nomineeRelationship || null,
    nominee_nic: investor.nomineeNic || null,
    nominee_phone: investor.nomineePhone || null,
    agreement_date: investor.agreementDate || null,
    expected_payout_rate: investor.expectedPayoutRate || null,
    transactions: investor.transactions || [],
    created_at: investor.createdAt,
  };
}

function toAppInvestor(row: any): Investor {
  return {
    id: row.id,
    name: row.name,
    nic: row.nic,
    phone: row.phone,
    address: row.address,
    email: row.email || undefined,
    bankName: row.bank_name || undefined,
    bankBranch: row.bank_branch || undefined,
    bankAccountNumber: row.bank_account_number || undefined,
    nomineeName: row.nominee_name || undefined,
    nomineeRelationship: row.nominee_relationship || undefined,
    nomineeNic: row.nominee_nic || undefined,
    nomineePhone: row.nominee_phone || undefined,
    agreementDate: row.agreement_date || undefined,
    expectedPayoutRate: row.expected_payout_rate ? parseFloat(row.expected_payout_rate) : undefined,
    transactions: typeof row.transactions === 'string' ? JSON.parse(row.transactions) : (row.transactions || []),
    createdAt: row.created_at || new Date().toISOString(),
  };
}

// --- Dynamic CRUD API methods for LOANS ---

export async function getLoansFromSupabase(): Promise<Loan[]> {
  const client = getClient();
  if (!client) throw new Error("Supabase client is not configured");

  const { data, error } = await client
    .from("loans")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(toAppModel);
}

export async function sendLoanToSupabase(loan: Loan): Promise<void> {
  const client = getClient();
  if (!client) throw new Error("Supabase client is not configured");

  const dModel = toDbModel(loan);
  const { error } = await client
    .from("loans")
    .upsert(dModel, { onConflict: "id" });

  if (error) throw error;
}

export async function deleteLoanFromSupabase(loanId: string): Promise<void> {
  const client = getClient();
  if (!client) throw new Error("Supabase client is not configured");

  const { error } = await client
    .from("loans")
    .delete()
    .eq("id", loanId);

  if (error) throw error;
}

export async function syncBulkToSupabase(loans: Loan[]): Promise<void> {
  const client = getClient();
  if (!client) throw new Error("Supabase client is not configured");

  if (loans.length === 0) return;

  const dbRows = loans.map(toDbModel);
  const { error } = await client
    .from("loans")
    .upsert(dbRows, { onConflict: "id" });

  if (error) throw error;
}

// --- Dynamic CRUD API methods for FIELD OFFICERS ---

export async function getFieldOfficersFromSupabase(): Promise<FieldOfficer[]> {
  const client = getClient();
  if (!client) throw new Error("Supabase client is not configured");

  const { data, error } = await client
    .from("field_officers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(toAppFieldOfficer);
}

export async function sendFieldOfficerToSupabase(officer: FieldOfficer): Promise<void> {
  const client = getClient();
  if (!client) throw new Error("Supabase client is not configured");

  const dModel = toDbFieldOfficer(officer);
  const { error } = await client
    .from("field_officers")
    .upsert(dModel, { onConflict: "id" });

  if (error) throw error;
}

export async function deleteFieldOfficerFromSupabase(officerId: string): Promise<void> {
  const client = getClient();
  if (!client) throw new Error("Supabase client is not configured");

  const { error } = await client
    .from("field_officers")
    .delete()
    .eq("id", officerId);

  if (error) throw error;
}

export async function syncBulkFieldOfficersToSupabase(officers: FieldOfficer[]): Promise<void> {
  const client = getClient();
  if (!client) throw new Error("Supabase client is not configured");

  if (officers.length === 0) return;

  const dbRows = officers.map(toDbFieldOfficer);
  const { error } = await client
    .from("field_officers")
    .upsert(dbRows, { onConflict: "id" });

  if (error) throw error;
}

// --- Dynamic CRUD API methods for INVESTORS ---

export async function getInvestorsFromSupabase(): Promise<Investor[]> {
  const client = getClient();
  if (!client) throw new Error("Supabase client is not configured");

  const { data, error } = await client
    .from("investors")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(toAppInvestor);
}

export async function sendInvestorToSupabase(investor: Investor): Promise<void> {
  const client = getClient();
  if (!client) throw new Error("Supabase client is not configured");

  const dModel = toDbInvestor(investor);
  const { error } = await client
    .from("investors")
    .upsert(dModel, { onConflict: "id" });

  if (error) throw error;
}

export async function deleteInvestorFromSupabase(investorId: string): Promise<void> {
  const client = getClient();
  if (!client) throw new Error("Supabase client is not configured");

  const { error } = await client
    .from("investors")
    .delete()
    .eq("id", investorId);

  if (error) throw error;
}

export async function syncBulkInvestorsToSupabase(investors: Investor[]): Promise<void> {
  const client = getClient();
  if (!client) throw new Error("Supabase client is not configured");

  if (investors.length === 0) return;

  const dbRows = investors.map(toDbInvestor);
  const { error } = await client
    .from("investors")
    .upsert(dbRows, { onConflict: "id" });

  if (error) throw error;
}

