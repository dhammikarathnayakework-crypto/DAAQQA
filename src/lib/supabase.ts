/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from "@supabase/supabase-js";
import { Loan, FieldOfficer, Investor, OfficeExpenseItem } from "../types";

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
  const DIRECT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvbmRweWZzaXhhY3pxYmhoemFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2OTAwODEsImV4cCI6MjA5NjI2NjA4MX0.FJdPX9pJEtf0AYlSnHQ5HnQUrSOcWKakRxbzJVKzsSs"; // Example: "eyJhbGciOi..."
  
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
drop policy if exists "Enable all access for anon users" on public.loans;
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
    monthly_disbursed_target numeric,
    commission_rate_above_target numeric,
    incentive_per_new_member numeric,
    status text default 'ACTIVE',
    position text default 'FIELD_OFFICER',
    can_approve_loans boolean default false,
    expenses jsonb default '[]'::jsonb,
    allowances jsonb default '[]'::jsonb,
    remittances jsonb default '[]'::jsonb,
    rep_transfers jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    synced_at timestamp with time zone default timezone('utc'::text, now())
);

-- Backward compatibility columns (CRITICAL: If you created tables earlier, run these lines!)
alter table public.field_officers add column if not exists position text default 'FIELD_OFFICER';
alter table public.field_officers add column if not exists can_approve_loans boolean default false;
alter table public.field_officers add column if not exists monthly_disbursed_target numeric;
alter table public.field_officers add column if not exists commission_rate_above_target numeric;
alter table public.field_officers add column if not exists incentive_per_new_member numeric;
alter table public.field_officers add column if not exists rep_transfers jsonb default '[]'::jsonb;
alter table public.field_officers add column if not exists id_front text;
alter table public.field_officers add column if not exists id_back text;

-- Reload the schema cache so PostgREST immediately recognizes new columns
notify pgrst, 'reload schema';

-- Enable Row Level Security (RLS) on field_officers
alter table public.field_officers enable row level security;
drop policy if exists "Enable all access for anon users" on public.field_officers;
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
drop policy if exists "Enable all access for anon users" on public.investors;
create policy "Enable all access for anon users" on public.investors
    for all using (true) with check (true);

-- 4. OFFICE EXPENSES TABLE
create table if not exists public.office_expenses (
    id text primary key,
    date text not null,
    category text not null,
    description text not null,
    amount numeric not null,
    notes text,
    status text not null,
    logged_by_officer_id text,
    logged_by_officer_name text,
    approved_by text,
    verified_at text,
    bill_image text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    synced_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) on office_expenses
alter table public.office_expenses enable row level security;
drop policy if exists "Enable all access for anon users" on public.office_expenses;
create policy "Enable all access for anon users" on public.office_expenses
    for all using (true) with check (true);

-- Enable Realtime for all tables safely
DO $$
BEGIN
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'loans') then
        alter publication supabase_realtime add table public.loans;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'field_officers') then
        alter publication supabase_realtime add table public.field_officers;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'investors') then
        alter publication supabase_realtime add table public.investors;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'office_expenses') then
        alter publication supabase_realtime add table public.office_expenses;
    end if;
END
$$;

comment on table public.loans is 'Seth Capital Loan Ledger and Collections Records';
comment on table public.field_officers is 'Seth Capital field representatives, employee target, expenses, allowances and cash remittances logs';
comment on table public.investors is 'Seth Capital microfinance external seed funding partners, nomimees and capital transactions sheets';
comment on table public.office_expenses is 'Seth Capital office and general expenses records';

-- 5. BUCKET SETUP FOR ATTACHMENTS & PHOTOS (loan-documents)
-- Create bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('loan-documents', 'loan-documents', true)
on conflict (id) do nothing;

-- Storage policies to allow public (anyone) to upload, read, update and delete (upsert) documents
drop policy if exists "Allow public uploads for loan documents" on storage.objects;
create policy "Allow public uploads for loan documents" on storage.objects
    for insert to public with check (bucket_id = 'loan-documents');

drop policy if exists "Allow public reads for loan documents" on storage.objects;
create policy "Allow public reads for loan documents" on storage.objects
    for select to public using (bucket_id = 'loan-documents');

drop policy if exists "Allow public updates for loan documents" on storage.objects;
create policy "Allow public updates for loan documents" on storage.objects
    for update to public using (bucket_id = 'loan-documents');

drop policy if exists "Allow public deletes for loan documents" on storage.objects;
create policy "Allow public deletes for loan documents" on storage.objects
    for delete to public using (bucket_id = 'loan-documents');
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

export function toAppModel(row: any): Loan {
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
    position: officer.position || 'FIELD_OFFICER',
    can_approve_loans: officer.canApproveLoans || false,
    monthly_disbursed_target: officer.monthlyDisbursedTarget || null,
    commission_rate_above_target: officer.commissionRateAboveTarget || null,
    incentive_per_new_member: officer.incentivePerNewMember || null,
    rep_transfers: officer.repTransfers || [],
    id_front: officer.idFront || null,
    id_back: officer.idBack || null,
  };
}

export function toAppFieldOfficer(row: any): FieldOfficer {
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
    repTransfers: typeof row.rep_transfers === 'string' ? JSON.parse(row.rep_transfers) : (row.rep_transfers || []),
    createdAt: row.created_at || new Date().toISOString(),
    position: row.position || 'FIELD_OFFICER',
    canApproveLoans: row.can_approve_loans !== undefined ? !!row.can_approve_loans : false,
    monthlyDisbursedTarget: row.monthly_disbursed_target ? parseFloat(row.monthly_disbursed_target) : undefined,
    commissionRateAboveTarget: row.commission_rate_above_target ? parseFloat(row.commission_rate_above_target) : undefined,
    incentivePerNewMember: row.incentive_per_new_member ? parseFloat(row.incentive_per_new_member) : undefined,
    idFront: row.id_front || undefined,
    idBack: row.id_back || undefined,
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

export function toAppInvestor(row: any): Investor {
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

// Helper to convert base64 image data URL to a binary Blob
function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Helper to upload base64 images to Supabase Storage bucket
export async function uploadBase64Image(client: any, base64: string, path: string): Promise<string> {
  if (!base64 || typeof base64 !== "string") return "";
  if (base64.startsWith("http://") || base64.startsWith("https://")) {
    return base64; // already uploaded, return as-is
  }

  try {
    if (!base64.includes(",")) return base64;
    
    const blob = dataURLtoBlob(base64);
    
    // Auto-create bucket if it doesn't exist (fails silently if already exists or unauthorized)
    try {
      await client.storage.createBucket("loan-documents", { public: true });
    } catch (e) {
      // Ignored
    }

    const { errorUpload } = await client.storage
      .from("loan-documents")
      .upload(path, blob, {
        contentType: blob.type,
        upsert: true
      });

    if (errorUpload) {
      console.error(`Supabase storage upload error for path: ${path}`, errorUpload);
      return base64; // fallback
    }

    const { data: publicUrlData } = client.storage
      .from("loan-documents")
      .getPublicUrl(path);

    return publicUrlData?.publicUrl || base64;
  } catch (e) {
    console.error(`Exception during storage upload for ${path}`, e);
    return base64;
  }
}

export async function sendLoanToSupabase(loan: Loan): Promise<Loan> {
  const client = getClient();
  if (!client) {
    return loan; // no client, fallback to original offline-state saving
  }

  // Clone to avoid side effects
  const updatedLoan = JSON.parse(JSON.stringify(loan)) as Loan;

  try {
    // 1. Upload Applicant Photos
    if (updatedLoan.applicant.idFront) {
      updatedLoan.applicant.idFront = await uploadBase64Image(
        client,
        updatedLoan.applicant.idFront,
        `loans/${loan.id}/applicant_idFront.jpg`
      );
    }
    if (updatedLoan.applicant.idBack) {
      updatedLoan.applicant.idBack = await uploadBase64Image(
        client,
        updatedLoan.applicant.idBack,
        `loans/${loan.id}/applicant_idBack.jpg`
      );
    }
    if (updatedLoan.applicant.signedDoc) {
      updatedLoan.applicant.signedDoc = await uploadBase64Image(
        client,
        updatedLoan.applicant.signedDoc,
        `loans/${loan.id}/applicant_signedDoc.jpg`
      );
    }

    // 2. Upload Relative Photos
    if (updatedLoan.relative?.idFront) {
      updatedLoan.relative.idFront = await uploadBase64Image(
        client,
        updatedLoan.relative.idFront,
        `loans/${loan.id}/relative_idFront.jpg`
      );
    }
    if (updatedLoan.relative?.idBack) {
      updatedLoan.relative.idBack = await uploadBase64Image(
        client,
        updatedLoan.relative.idBack,
        `loans/${loan.id}/relative_idBack.jpg`
      );
    }

    // 3. Upload Guarantor 1 Photos
    if (updatedLoan.guarantor1?.idFront) {
      updatedLoan.guarantor1.idFront = await uploadBase64Image(
        client,
        updatedLoan.guarantor1.idFront,
        `loans/${loan.id}/guarantor1_idFront.jpg`
      );
    }
    if (updatedLoan.guarantor1?.idBack) {
      updatedLoan.guarantor1.idBack = await uploadBase64Image(
        client,
        updatedLoan.guarantor1.idBack,
        `loans/${loan.id}/guarantor1_idBack.jpg`
      );
    }

    // 4. Upload Guarantor 2 Photos
    if (updatedLoan.guarantor2?.idFront) {
      updatedLoan.guarantor2.idFront = await uploadBase64Image(
        client,
        updatedLoan.guarantor2.idFront,
        `loans/${loan.id}/guarantor2_idFront.jpg`
      );
    }
    if (updatedLoan.guarantor2?.idBack) {
      updatedLoan.guarantor2.idBack = await uploadBase64Image(
        client,
        updatedLoan.guarantor2.idBack,
        `loans/${loan.id}/guarantor2_idBack.jpg`
      );
    }
  } catch (err) {
    console.error("Storage upload pipe failed, falls back to direct saving", err);
  }

  const dModel = toDbModel(updatedLoan);
  const { error } = await client
    .from("loans")
    .upsert(dModel, { onConflict: "id" });

  if (error) throw error;
  
  return updatedLoan;
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

  // Clone to avoid side effects
  const updatedOfficer = JSON.parse(JSON.stringify(officer)) as FieldOfficer;

  // 1. Upload Field Officer Identity Photos
  if (updatedOfficer.idFront) {
    updatedOfficer.idFront = await uploadBase64Image(
      client,
      updatedOfficer.idFront,
      `officers/${officer.id}/idFront.jpg`
    );
  }
  if (updatedOfficer.idBack) {
    updatedOfficer.idBack = await uploadBase64Image(
      client,
      updatedOfficer.idBack,
      `officers/${officer.id}/idBack.jpg`
    );
  }

  // 2. Upload Expense Bill Images
  if (updatedOfficer.expenses && updatedOfficer.expenses.length > 0) {
    updatedOfficer.expenses = await Promise.all(
      updatedOfficer.expenses.map(async (exp) => {
        if (exp.billImage) {
          exp.billImage = await uploadBase64Image(
            client,
            exp.billImage,
            `officers/${officer.id}/expenses/${exp.id}.jpg`
          );
        }
        return exp;
      })
    );
  }

  const dModel = toDbFieldOfficer(updatedOfficer);
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

// Conversion helpers for Office Expenses
function toDbOfficeExpense(expense: OfficeExpenseItem) {
  return {
    id: expense.id,
    date: expense.date,
    category: expense.category,
    description: expense.description,
    amount: expense.amount,
    notes: expense.notes || null,
    status: expense.status,
    logged_by_officer_id: expense.loggedByOfficerId || null,
    logged_by_officer_name: expense.loggedByOfficerName || null,
    approved_by: expense.approvedBy || null,
    verified_at: expense.verifiedAt || null,
    bill_image: expense.billImage || null,
    created_at: new Date().toISOString()
  };
}

export function toAppOfficeExpense(row: any): OfficeExpenseItem {
  return {
    id: row.id,
    date: row.date,
    category: row.category,
    description: row.description,
    amount: row.amount,
    notes: row.notes || undefined,
    status: row.status,
    loggedByOfficerId: row.logged_by_officer_id || undefined,
    loggedByOfficerName: row.logged_by_officer_name || undefined,
    approvedBy: row.approved_by || undefined,
    verifiedAt: row.verified_at || undefined,
    billImage: row.bill_image || undefined
  };
}

// --- Dynamic CRUD API methods for OFFICE EXPENSES ---

export async function getOfficeExpensesFromSupabase(): Promise<OfficeExpenseItem[]> {
  const client = getClient();
  if (!client) throw new Error("Supabase client is not configured");

  const { data, error } = await client
    .from("office_expenses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(toAppOfficeExpense);
}

export async function sendOfficeExpenseToSupabase(expense: OfficeExpenseItem): Promise<void> {
  const client = getClient();
  if (!client) throw new Error("Supabase client is not configured");

  const dModel = toDbOfficeExpense(expense);
  const { error } = await client
    .from("office_expenses")
    .upsert(dModel, { onConflict: "id" });

  if (error) throw error;
}

export async function deleteOfficeExpenseFromSupabase(expenseId: string): Promise<void> {
  const client = getClient();
  if (!client) throw new Error("Supabase client is not configured");

  const { error } = await client
    .from("office_expenses")
    .delete()
    .eq("id", expenseId);

  if (error) throw error;
}

export async function syncBulkOfficeExpensesToSupabase(expenses: OfficeExpenseItem[]): Promise<void> {
  const client = getClient();
  if (!client) throw new Error("Supabase client is not configured");

  if (expenses.length === 0) return;

  const dbRows = expenses.map(toDbOfficeExpense);
  const { error } = await client
    .from("office_expenses")
    .upsert(dbRows, { onConflict: "id" });

  if (error) throw error;
}

