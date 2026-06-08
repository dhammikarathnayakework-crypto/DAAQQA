/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ApplicantInfo {
  fullName: string;                // සම්පූර්ණ නම
  nic: string;                     // ජාතික හැඳුනුම්පත් අංකය
  address: string;                 // ස්ථිර ලිපිනය
  phone: string;                   // දුරකථන අංකය
}

export interface RelativeInfo {
  name: string;                    // නම
  relationship: string;            // ඥාතිත්වය
  nic: string;                     // ජාතික හැඳුනුම්පත් අංකය
  address: string;                 // ලිපිනය
  phone: string;                   // දුරකථන අංකය
  workAddress: string;             // සේවා ස්ථානයේ ලිපිනය
}

export interface GuarantorInfo {
  name: string;                    // නම
  address: string;                 // ලිපිනය
  nic: string;                     // ජාතික හැඳුනුම්පත් අංකය
  phone: string;                   // දුරකථන අංකය
  isAgreed: boolean;               // ප්‍රකාශයට එකඟතාවය (i.e. signed agreement checkbox)
}

export interface LoanDetailsType {
  requestedAmount: number;         // අපේක්ෂිත ණය මුදල
  purpose: string;                 // ණය ලබාගැනීමේ අරමුණ
}

export interface OfficeUseInfo {
  applicationNumber: string;       // ණය අයදුම්පත් අංකය
  approvedAmount: number;          // අනුමත ණය මුදල
  interestRate: number;            // පොලී අනුපාතිකය (e.g., 25)
  installmentsCount: number;       // වාරික ගණන
  monthlyInstallment: number;      // මාසික වාරිකය
  specialNotes: string;            // විශේෂ සටහන්
  loanDate: string;                // ණය ලබාදුන් දිනය (YYYY-MM-DD or standard ISO)
  disbursedByOfficerId?: string;   // මුදල් නිකුත් කළ නිලධාරියා
}

export interface PaymentCollection {
  id: string;                      // Collection ID
  amount: number;                  // එකතුකළ මුදල
  date: string;                    // එකතුකළ දිනය
  monthOfCollection: string;       // එකතු කිරීම් මාසය (Month of Collection, e.g. "June 2026")
  receiptNumber: string;           // රිසිට්පත් අංකය
  notes: string;                   // වෙනත් සටහන්
  officerId?: string;              // එකතු කළ ක්ෂේත්‍ර නිලධාරියාගේ ID එක
  locationGeo?: { latitude: number, longitude: number }; // GPS Location point
}

export interface OfficerRepTransfer {
  id: string;
  date: string;
  amount: number;
  fromOfficerId: string;
  toOfficerId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  notes?: string;
  verifiedAt?: string;
}

export interface Loan {
  id: string;                      // Internal ID
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'OVERDUE';
  applicant: ApplicantInfo;
  relative: RelativeInfo;
  loanDetails: LoanDetailsType;
  guarantor1: GuarantorInfo;
  guarantor2: GuarantorInfo;
  officeUse: OfficeUseInfo;
  collections: PaymentCollection[];
  createdAt: string;
}

export interface OfficerExpense {
  id: string;
  date: string;
  description: string;             // විස්තරය
  amount: number;                  // මුදල
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'; // අනුමැතිය ලැබුණිද යන්න/තත්ත්වය
  approvedBy?: string;             // අනුමත කල පුද්ගලයා / සාක්ෂිකරු
  verifiedAt?: string;             // සත්‍යාපිත දිනය
  securityHash?: string;           // සංකේතාත්මක ආරක්ෂක කේතය (SHA-256 Mock)
  referenceToken?: string;         // සත්‍යාපන ටෝකනය
}

export interface OfficerAllowance {
  id: string;
  date: string;
  amount: number;                  // දීමනාව
  type?: 'FLOAT' | 'BATTA' | 'OTHER'; // FLOAT: ආරම්භක අත්මුදල්, BATTA: දෛනික දීමනා, OTHER: වෙනත්
  notes?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  repStatus?: 'PENDING_APPROVAL' | 'ACCEPTED' | 'SHORTAGE'; // Rep's physical verification status
  shortageAmount?: number;         // හිඟ මුදල (Shortage reported by rep)
  repRemarks?: string;             // Rep's notes if there's a shortage
  verifiedAt?: string;
  securityHash?: string;
  referenceToken?: string;
}

export interface OfficerRemittance {
  id: string;
  date: string;
  amount: number;                  // භාරදුන් මුදල (Actual cash handed over)
  expectedAmount?: number;         // සැබවින්ම දිය යුතු මුදල (Expected Cash)
  shortageAmount?: number;         // හිඟ මුදල (Shortage)
  notes?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'; // ගණකාධිකාරීවරයාගේ අනුමැතිය
  approvedBy?: string;
  verifiedAt?: string;
  securityHash?: string;
  referenceToken?: string;
}

export interface FieldOfficer {
  id: string;
  name: string;                    // නම
  nic: string;                     // හැඳුනුම්පත් අංකය
  phone: string;                   // දුරකථන අංකය
  address: string;                 // ලිපිනය
  employeeId?: string;             // සේවක අංකය (Employee/Staff ID)
  email?: string;                  // විද්‍යුත් තැපෑල
  pin?: string;                    // ආරක්ෂිත පින් අංකය (Security PIN)
  vehicleNumber?: string;          // වාහන අංකය (Vehicle Number)
  joinedDate?: string;             // සේවයට බැඳුණු දිනය (Joined Date)
  targetCollection?: number;       // මාසික එකතු කිරීමේ ඉලක්කය (Target Collection)
  status?: 'ACTIVE' | 'INACTIVE';  // ක්‍රියාකාරී තත්ත්වය (Active/Inactive)
  expenses: OfficerExpense[];
  allowances: OfficerAllowance[];
  remittances: OfficerRemittance[];
  repTransfers?: OfficerRepTransfer[];
  createdAt: string;
}

export interface InvestorTransaction {
  id: string;
  date: string;
  type: 'INVESTMENT' | 'WITHDRAWAL' | 'INTEREST_PAYOUT'; // ආයෝජනය / ආපසු ගැනීම / පොලී ගෙවීම්
  amount: number;
  notes?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'; // අනුමැතිය ලැබුණිද යන්න/තත්ත්වය
  approvedBy?: string;             // අනුමත කල පුද්ගලයා / සාක්ෂිකරු
  verifiedAt?: string;             // සත්‍යාපිත දිනය
  securityHash?: string;           // සංකේතාත්මක ආරක්ෂක කේතය
  referenceToken?: string;         // සත්‍යාපන ටෝකනය
}

export interface Investor {
  id: string;
  name: string;                    // නම
  nic: string;                     // හැඳුනුම්පත් අංකය
  phone: string;                   // දුරකථන අංකය
  address: string;                 // ලිපිනය
  email?: string;                  // විද්‍යුත් තැපෑල (Email)
  bankName?: string;               // බැංකුවේ නම (Bank Name)
  bankBranch?: string;             // බැංකු ශාඛාව (Bank Branch)
  bankAccountNumber?: string;      // බැංකු ගිණුම් අංකය (Bank Account No)
  nomineeName?: string;            // නම් කළ තැනැත්තාගේ නම (Nominee Name)
  nomineeRelationship?: string;    // නම් කළ තැනැත්තා සතු ඥාතිත්වය (Nominee Relationship)
  nomineeNic?: string;             // නම් කළ තැනැත්තාගේ හැඳුනුම්පත් අංකය (Nominee NIC)
  nomineePhone?: string;           // නම් කළ තැනැත්තාගේ දුරකථන අංකය (Nominee Phone)
  agreementDate?: string;          // ගිවිසුම්ගත වූ දිනය (Agreement Date)
  expectedPayoutRate?: number;     // පොරොන්දු වූ ලාභ/පොලී අනුපාතය (Expected Interest/Payout Rate %)
  transactions: InvestorTransaction[];
  createdAt: string;
}

export interface SystemStats {
  totalLoans: number;
  totalApprovedValue: number;
  totalPaid: number;
  totalInterest: number;
  totalToPay: number;
  outstandingBalance: number;
}
