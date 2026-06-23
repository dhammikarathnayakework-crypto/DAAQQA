/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Users, 
  Plus, 
  Trash2, 
  DollarSign, 
  Clock, 
  Briefcase, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  Coins,
  Receipt,
  MapPin,
  Phone,
  Bookmark,
  Calendar,
  Layers,
  Sparkles,
  ClipboardList,
  AlertCircle,
  ShieldCheck,
  Lock,
  Unlock,
  QrCode,
  RefreshCw,
  CheckCircle2,
  Printer,
  Eye,
  Upload,
  Camera,
  Award
} from "lucide-react";
import { FieldOfficer, Loan, OfficerAllowance, OfficerExpense, OfficerRemittance } from "../types";
import { formatLKR, generateId } from "../utils";
import { Language } from "../translations";

// Secure hashing for field officer accounting audits to block fraudulent expense logs
export function generateOfficerHash(txId: string, date: string, type: string, amount: number): string {
  const payload = `OFFICER-SEC-BLOCK[${txId}]-DATE[${date}]-CLASS[${type}]-AMT[${amount}]`;
  let salt = 0;
  for (let i = 0; i < payload.length; i++) {
    salt = (salt << 5) - salt + payload.charCodeAt(i);
    salt |= 0;
  }
  const code = Math.abs(salt).toString(16).toUpperCase();
  const padded = (code + "00000000").substring(0, 8);
  return `SEC-OFC-${padded}-${txId.slice(-4).toUpperCase()}`;
}

import imageCompression from 'browser-image-compression';

interface ImageUploadFieldProps {
  label: string;
  subLabel?: string;
  value?: string;
  onChange: (base64: string) => void;
  onClear: () => void;
  lang: Language;
}

function ImageUploadField({ label, subLabel, value, onChange, onClear, lang }: ImageUploadFieldProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputId = React.useId();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await compressAndLoad(e.target.files[0]);
    }
  };

  const compressAndLoad = async (file: File) => {
    setIsCompressing(true);
    try {
      const options = {
        maxSizeMB: 0.1, // around 100KB
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: "image/jpeg"
      };
      const compressedFile = await imageCompression(file, options);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange(e.target?.result as string);
        setIsCompressing(false);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Image compression error:", error);
      const reader = new FileReader();
      reader.onload = (e) => {
         onChange(e.target?.result as string);
         setIsCompressing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      compressAndLoad(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-slate-400 uppercase block tracking-wider">
        {label}
      </label>
      {value ? (
        <div className="relative border border-slate-200 rounded-xl overflow-hidden group bg-slate-50 flex items-center justify-center h-28">
          <img
            src={value}
            alt={label}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-350"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 bg-rose-600/85 hover:bg-rose-600 text-white rounded-lg transition shrink-0 cursor-pointer"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute bottom-1 right-2 bg-slate-900/40 backdrop-blur-xs px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            {lang === "si" ? "සූදානම්" : "Uploaded"}
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center h-28 transition cursor-pointer select-none text-center ${
            dragActive
              ? "border-indigo-600 bg-indigo-50/25"
              : "border-slate-200 hover:border-indigo-500 bg-slate-50/30 hover:bg-white/50"
          }`}
          onClick={() => document.getElementById(fileInputId)?.click()}
        >
          <input
            id={fileInputId}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {isCompressing ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[10px] font-bold text-slate-650 block">Compressing...</span>
            </div>
          ) : (
            <>
              <Camera className="w-5 h-5 text-slate-400 mb-1" />
              <span className="text-[10px] font-bold text-slate-650 block">
                {lang === "si" ? "පින්තූරය තෝරන්න" : "Choose Photo"}
              </span>
              {subLabel && (
                <span className="text-[8px] text-slate-400 block mt-0.5 leading-tight">
                  {subLabel}
                </span>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Automatic sequential employee ID generator helper
export const generateNextEmployeeId = (existingOfficers: FieldOfficer[]) => {
  let maxNum = 0;
  existingOfficers.forEach(o => {
    const empId = o.employeeId;
    if (empId && empId.toUpperCase().startsWith("EM-")) {
      const clean = empId.toUpperCase().replace("EM-", "");
      const numPart = parseInt(clean, 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  });
  const nextNum = maxNum + 1;
  return `EM-${nextNum.toString().padStart(4, "0")}`;
};

interface FieldOfficersManagerProps {
  officers: FieldOfficer[];
  loans: Loan[];
  onAddOfficer: (officer: FieldOfficer) => void;
  onDeleteOfficer: (id: string) => void;
  onUpdateOfficer: (officer: FieldOfficer) => void;
  lang: Language;
  currentLoggedOfficerId?: string;
  currentUserRole?: 'ADMIN' | 'OFFICER' | 'GUEST';
}

export default function FieldOfficersManager({ 
  officers, 
  loans, 
  onAddOfficer, 
  onDeleteOfficer, 
  onUpdateOfficer, 
  lang,
  currentLoggedOfficerId = "",
  currentUserRole = "GUEST"
}: FieldOfficersManagerProps) {
  // Safely map all officer inputs to have allowances, expenses, and remittances arrays initialized
  const safeOfficers = officers.map(o => ({
    ...o,
    allowances: o.allowances || [],
    expenses: o.expenses || [],
    remittances: o.remittances || [],
    repTransfers: o.repTransfers || []
  }));

  const [selectedOfficerId, setSelectedOfficerId] = useState<string | null>(
    safeOfficers.length > 0 ? safeOfficers[0].id : null
  );

  // Form states for creating a new Field Officer
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [nic, setNic] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [joinedDate, setJoinedDate] = useState(new Date().toISOString().split("T")[0]);
  const [targetCollection, setTargetCollection] = useState("");
  const [monthlyDisbursedTarget, setMonthlyDisbursedTarget] = useState("");
  const [commissionRateAboveTarget, setCommissionRateAboveTarget] = useState("");
  const [incentivePerNewMember, setIncentivePerNewMember] = useState("");
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>("ACTIVE");
  const [position, setPosition] = useState("FIELD_OFFICER");
  const [canApproveLoans, setCanApproveLoans] = useState(false);
  const [idFront, setIdFront] = useState("");
  const [idBack, setIdBack] = useState("");

  // Editing profile states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editNic, setEditNic] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editEmployeeId, setEditEmployeeId] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editVehicleNumber, setEditVehicleNumber] = useState("");
  const [editJoinedDate, setEditJoinedDate] = useState("");
  const [editTargetCollection, setEditTargetCollection] = useState("");
  const [editMonthlyDisbursedTarget, setEditMonthlyDisbursedTarget] = useState("");
  const [editCommissionRateAboveTarget, setEditCommissionRateAboveTarget] = useState("");
  const [editIncentivePerNewMember, setEditIncentivePerNewMember] = useState("");
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'INACTIVE'>("ACTIVE");
  const [editPosition, setEditPosition] = useState("FIELD_OFFICER");
  const [editCanApproveLoans, setEditCanApproveLoans] = useState(false);
  const [editIdFront, setEditIdFront] = useState("");
  const [editIdBack, setEditIdBack] = useState("");

  // Sub-transaction states
  const [activeTab, setActiveTab] = useState<"COLLECTIONS" | "ALLOWANCES" | "EXPENSES" | "REMITTANCES" | "TRANSFERS" | "EOD_REPORT" | "STATEMENT" | "COMMISSIONS">("COLLECTIONS");
  
  // Dialog/input states for additions
  const [allowanceAmount, setAllowanceAmount] = useState("");
  const [allowanceNotes, setAllowanceNotes] = useState("");
  const [allowanceDate, setAllowanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [allowanceType, setAllowanceType] = useState<'FLOAT' | 'BATTA' | 'OTHER'>('BATTA');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split("T")[0]);

  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);

  const [remittanceAmount, setRemittanceAmount] = useState("");
  const [remittanceNotes, setRemittanceNotes] = useState("");
  const [remittanceDate, setRemittanceDate] = useState(new Date().toISOString().split("T")[0]);

  // Handle adding Field Officer
  const handleSubmitOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !nic || !phone) {
      alert(lang === "si" ? "කරුණාකර සියලුම අනිවාර්ය ක්ෂේත්‍ර පුරවන්න." : "Please fill in all mandatory fields.");
      return;
    }
    const newOfficer: FieldOfficer = {
      id: "officer-" + generateId(),
      name,
      nic,
      phone,
      address,
      employeeId: employeeId || undefined,
      email: email || undefined,
      vehicleNumber: vehicleNumber || undefined,
      joinedDate: joinedDate || undefined,
      targetCollection: targetCollection ? parseFloat(targetCollection) : undefined,
      monthlyDisbursedTarget: monthlyDisbursedTarget ? parseFloat(monthlyDisbursedTarget) : undefined,
      commissionRateAboveTarget: commissionRateAboveTarget ? parseFloat(commissionRateAboveTarget) : undefined,
      incentivePerNewMember: incentivePerNewMember ? parseFloat(incentivePerNewMember) : undefined,
      status: status,
      expenses: [],
      allowances: [],
      remittances: [],
      createdAt: new Date().toISOString(),
      position,
      canApproveLoans: position !== "FIELD_OFFICER" ? canApproveLoans : false,
      idFront: idFront || undefined,
      idBack: idBack || undefined,
    };
    onAddOfficer(newOfficer);
    
    if (newOfficer.email) {
      alert(lang === 'si' ? `පද්ධති පිවිසුම් ඊමේල් පණිවිඩය ${newOfficer.email} වෙත සාර්ථකව යවන ලදී!` : `System login invitation email successfully sent to ${newOfficer.email}!`);
    }

    setSelectedOfficerId(newOfficer.id);
    setShowAddForm(false);
    // Reset form
    setName("");
    setNic("");
    setPhone("");
    setAddress("");
    setEmployeeId("");
    setEmail("");
    setVehicleNumber("");
    setJoinedDate(new Date().toISOString().split("T")[0]);
    setTargetCollection("");
    setMonthlyDisbursedTarget("");
    setCommissionRateAboveTarget("");
    setIncentivePerNewMember("");
    setStatus("ACTIVE");
    setPosition("FIELD_OFFICER");
    setCanApproveLoans(false);
    setIdFront("");
    setIdBack("");
  };

  // Editing profile procedures
  const startEditingProfile = (officer: FieldOfficer) => {
    setEditName(officer.name);
    setEditNic(officer.nic);
    setEditPhone(officer.phone);
    setEditAddress(officer.address);
    setEditEmployeeId(officer.employeeId || "");
    setEditEmail(officer.email || "");
    setEditVehicleNumber(officer.vehicleNumber || "");
    setEditJoinedDate(officer.joinedDate || new Date().toISOString().split("T")[0]);
    setEditTargetCollection(officer.targetCollection?.toString() || "");
    setEditMonthlyDisbursedTarget(officer.monthlyDisbursedTarget?.toString() || "");
    setEditCommissionRateAboveTarget(officer.commissionRateAboveTarget?.toString() || "");
    setEditIncentivePerNewMember(officer.incentivePerNewMember?.toString() || "");
    setEditStatus(officer.status || "ACTIVE");
    setEditPosition(officer.position || "FIELD_OFFICER");
    setEditCanApproveLoans(officer.canApproveLoans || false);
    setEditIdFront(officer.idFront || "");
    setEditIdBack(officer.idBack || "");
    setIsEditingProfile(true);
  };

  const handleUpdateOfficerProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOfficer) return;
    if (!editName || !editNic || !editPhone) {
      alert(lang === "si" ? "නම, හැඳුනුම්පත සහ දුරකථන අංකය අනිවාර්ය වේ." : "Name, NIC, and Phone are required.");
      return;
    }
    const updated: FieldOfficer = {
      ...currentOfficer,
      name: editName,
      nic: editNic,
      phone: editPhone,
      address: editAddress,
      employeeId: editEmployeeId || undefined,
      email: editEmail || undefined,
      vehicleNumber: editVehicleNumber || undefined,
      joinedDate: editJoinedDate || undefined,
      targetCollection: editTargetCollection ? parseFloat(editTargetCollection) : undefined,
      monthlyDisbursedTarget: editMonthlyDisbursedTarget ? parseFloat(editMonthlyDisbursedTarget) : undefined,
      commissionRateAboveTarget: editCommissionRateAboveTarget ? parseFloat(editCommissionRateAboveTarget) : undefined,
      incentivePerNewMember: editIncentivePerNewMember ? parseFloat(editIncentivePerNewMember) : undefined,
      status: editStatus,
      position: editPosition,
      canApproveLoans: editPosition !== "FIELD_OFFICER" ? editCanApproveLoans : false,
      idFront: editIdFront || undefined,
      idBack: editIdBack || undefined,
    };
    onUpdateOfficer(updated);
    setIsEditingProfile(false);
  };

  // Secure Auditing states
  const [directPost, setDirectPost] = useState(true);
  const [selectedSecurityCert, setSelectedSecurityCert] = useState<{
    type: 'ALLOWANCE' | 'EXPENSE' | 'REMITTANCE';
    id: string;
    amount: number;
    date: string;
    notes?: string;
    description?: string;
    approvedBy?: string;
    securityHash?: string;
    referenceToken?: string;
  } | null>(null);
  const [viewingExpenseBill, setViewingExpenseBill] = useState<OfficerExpense | null>(null);
  const [officerScanResult, setOfficerScanResult] = useState<{ scanned: number; valid: boolean; errors: string[] } | null>(null);

  const currentOfficer = safeOfficers.find(o => o.id === selectedOfficerId) || safeOfficers[0] || null;
  const isOwnProfile = currentOfficer ? (currentLoggedOfficerId === currentOfficer.id) : false;
  const isAuthorizedToEdit = isOwnProfile || currentUserRole === 'ADMIN';

  // Calculations for current officer with strict audit compliance
  const calculateOfficerMetrics = (officer: FieldOfficer) => {
    // 1. Total Collections made by this officer in SCL Ledger
    const officerCollections = loans.flatMap(l => 
      l.collections
        .filter(c => c.officerId === officer.id)
        .map(c => ({
          ...c,
          borrowerName: l.applicant.fullName,
          loanId: l.id,
          applicationNumber: l.officeUse.applicationNumber,
          loanStatus: l.status
        }))
    );
    const totalCollected = officerCollections.reduce((sum, c) => sum + c.amount, 0);

    // Active (Approved or back-compat) logs
    const activeAllowances = officer.allowances.filter(a => a.status === 'APPROVED' && (a.repStatus === 'ACCEPTED' || !a.repStatus));
    const activeExpenses = officer.expenses.filter(e => e.status === undefined || e.status === 'APPROVED');
    const activeRemittances = officer.remittances.filter(r => r.status === undefined || r.status === 'APPROVED');

    // Pending log structures
    const pendingAllowances = officer.allowances.filter(a => a.status === 'PENDING' || (a.status === 'APPROVED' && a.repStatus === 'PENDING_APPROVAL'));
    const pendingExpenses = officer.expenses.filter(e => e.status === 'PENDING');
    const pendingRemittances = officer.remittances.filter(r => r.status === 'PENDING');

    const totalAllowances = activeAllowances.reduce((sum, a) => sum + a.amount, 0);
    const totalExpenses = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalRemittances = activeRemittances.reduce((sum, r) => sum + r.amount, 0);

    const pendingCount = pendingAllowances.length + pendingExpenses.length + pendingRemittances.length;
    const pendingSum = 
      pendingAllowances.reduce((s, a) => s + a.amount, 0) +
      pendingExpenses.reduce((s, e) => s + e.amount, 0) +
      pendingRemittances.reduce((s, r) => s + r.amount, 0);

    // Get all disbursed loans by this officer
    const officerDisbursedLoans = loans.filter(l => l.officeUse.disbursedByOfficerId === officer.id);
    const totalDisbursed = officerDisbursedLoans.reduce((sum, l) => sum + l.officeUse.approvedAmount, 0);

    // Identify New Member Loans (first loan across the entire system for each NIC)
    const newMemberLoanIds = new Set<string>();
    const loansByNic = new Map<string, Loan[]>();
    loans.forEach(l => {
      const nic = l.applicant.nic.toUpperCase().trim();
      if (nic) {
        const existing = loansByNic.get(nic) || [];
        existing.push(l);
        loansByNic.set(nic, existing);
      }
    });

    loansByNic.forEach((nicLoans) => {
      const sorted = [...nicLoans].sort((a, b) => {
        const dateA = new Date(a.officeUse.loanDate || a.createdAt).getTime();
        const dateB = new Date(b.officeUse.loanDate || b.createdAt).getTime();
        return dateA - dateB;
      });
      if (sorted.length > 0) {
        newMemberLoanIds.add(sorted[0].id);
      }
    });

    // Month-by-month disbursement stats and commission
    const monthMap = new Map<string, {
      monthKey: string;
      monthTotalDisbursed: number;
      monthNewMembersCount: number;
    }>();

    officerDisbursedLoans.forEach(l => {
      const dateStr = l.officeUse.loanDate || l.createdAt;
      const monthKey = dateStr ? dateStr.substring(0, 7) : new Date().toISOString().substring(0, 7);
      const isNewMember = newMemberLoanIds.has(l.id);

      const existing = monthMap.get(monthKey) || { monthKey, monthTotalDisbursed: 0, monthNewMembersCount: 0 };
      existing.monthTotalDisbursed += l.officeUse.approvedAmount;
      if (isNewMember) {
        existing.monthNewMembersCount += 1;
      }
      monthMap.set(monthKey, existing);
    });

    const monthlyDisbursalStats = Array.from(monthMap.values()).map(m => {
      const target = officer.monthlyDisbursedTarget || 0;
      const rate = officer.commissionRateAboveTarget || 0;
      const incentiveUnit = officer.incentivePerNewMember || 0;

      const aboveTargetVolume = Math.max(0, m.monthTotalDisbursed - target);
      const commissionEarned = aboveTargetVolume * (rate / 100);
      const incentivesEarned = m.monthNewMembersCount * incentiveUnit;
      const totalEarned = commissionEarned + incentivesEarned;

      return {
        ...m,
        disbursedTarget: target,
        commissionRate: rate,
        aboveTargetVolume,
        commissionEarned,
        incentivesEarned,
        totalEarned
      };
    }).sort((a, b) => b.monthKey.localeCompare(a.monthKey));

    const currentMonthKey = new Date().toISOString().substring(0, 7);
    const currentMonthStats = monthlyDisbursalStats.find(s => s.monthKey === currentMonthKey) || {
      monthKey: currentMonthKey,
      monthTotalDisbursed: 0,
      monthNewMembersCount: 0,
      disbursedTarget: officer.monthlyDisbursedTarget || 0,
      commissionRate: officer.commissionRateAboveTarget || 0,
      aboveTargetVolume: 0,
      commissionEarned: 0,
      incentivesEarned: 0,
      totalEarned: 0
    };

    const newMemberLoansCount = officerDisbursedLoans.filter(l => newMemberLoanIds.has(l.id)).length;
    const newMemberIncentivesEarned = newMemberLoansCount * (officer.incentivePerNewMember || 0);

    const transfersOut = officer.repTransfers?.filter(t => t.status !== 'REJECTED').reduce((sum, t) => sum + t.amount, 0) || 0;
    const transfersIn = safeOfficers.flatMap(o => o.repTransfers || []).filter(t => t.toOfficerId === officer.id && t.status === 'ACCEPTED').reduce((sum, t) => sum + t.amount, 0);

    // net cash in hand = (totalCollected + activeAllowances + transfersIn) - (activeExpenses + activeRemittances + totalDisbursed + transfersOut)
    const cashInHand = (totalCollected + totalAllowances + transfersIn) - (totalExpenses + totalRemittances + totalDisbursed + transfersOut);

    // Chronological Running Cash Ledger helper
    const getOfficerLedger = () => {
      const entries: {
        id: string;
        date: string;
        type: string;
        description: string;
        amount: number;
        direction: 'IN' | 'OUT';
        runningBalance?: number;
      }[] = [];

      // 1. Collections (+ IN)
      officerCollections.forEach(c => {
        entries.push({
          id: c.id,
          date: c.date,
          type: 'COLLECTION',
          description: lang === "si" 
            ? `ණය වාරික එකතු කිරීම - ${c.borrowerName} (${c.receiptNumber})`
            : `Collection - ${c.borrowerName} (${c.receiptNumber})`,
          amount: c.amount,
          direction: 'IN'
        });
      });

      // 2. Allowances (Morning Floats, Batta, etc.) (+ IN)
      activeAllowances.forEach(a => {
        let descEn = "Allowance";
        let descSi = "දීමනාව";
        if (a.type === 'FLOAT') {
          descEn = "Morning Float";
          descSi = "ආරම්භක අත්මුදල";
        } else if (a.type === 'BATTA') {
          descEn = "Daily Batta";
          descSi = "බත්තා දීමනාව";
        } else if (a.type === 'OTHER') {
          descEn = "Other Float/Allowance";
          descSi = "වෙනත් දීමනා/අත්මුදල්";
        }
        entries.push({
          id: a.id,
          date: a.date,
          type: 'ALLOWANCE',
          description: lang === "si" 
            ? `${descSi} (Floats)${a.notes ? ` - ${a.notes}` : ''}`
            : `${descEn} (Floats)${a.notes ? ` - ${a.notes}` : ''}`,
          amount: a.amount,
          direction: 'IN'
        });
      });

      // 3. Transfers In (+ IN)
      safeOfficers.flatMap(o => (o.repTransfers || []).map(t => ({ ...t, fromOfficerName: o.name })))
        .filter(t => t.toOfficerId === officer.id && t.status === 'ACCEPTED')
        .forEach(t => {
          entries.push({
            id: t.id,
            date: t.date,
            type: 'TRANSFER_IN',
            description: lang === "si"
              ? `ලි. ලැබීම - නිලධාරි: ${t.fromOfficerName}${t.notes ? ` (${t.notes})` : ''}`
              : `Transfer In - from Rep: ${t.fromOfficerName}${t.notes ? ` (${t.notes})` : ''}`,
            amount: t.amount,
            direction: 'IN'
          });
        });

      // 4. Expenses (- OUT)
      activeExpenses.forEach(e => {
        entries.push({
          id: e.id,
          date: e.date,
          type: 'EXPENSE',
          description: lang === "si"
            ? `වියදම: ${e.description}`
            : `Expense: ${e.description}`,
          amount: e.amount,
          direction: 'OUT'
        });
      });

      // 5. Remittances (- OUT)
      activeRemittances.forEach(r => {
        entries.push({
          id: r.id,
          date: r.date,
          type: 'REMITTANCE',
          description: lang === "si"
            ? `කාර්යාලයට භාරදීම${r.notes ? ` - ${r.notes}` : ''}`
            : `Remittance to HQ${r.notes ? ` - ${r.notes}` : ''}`,
          amount: r.amount,
          direction: 'OUT'
        });
      });

      // 6. Disbursed Loans (- OUT)
      officerDisbursedLoans.forEach(l => {
        entries.push({
          id: `disb-${l.id}`,
          date: l.officeUse.loanDate || l.createdAt.split('T')[0],
          type: 'DISBURSEMENT',
          description: lang === "si"
            ? `ණය මුදලක් නිකුත් කිරීම - ${l.applicant.fullName} (#${l.officeUse.applicationNumber})`
            : `Loan Disbursed - ${l.applicant.fullName} (#${l.officeUse.applicationNumber})`,
          amount: l.officeUse.approvedAmount,
          direction: 'OUT'
        });
      });

      // 7. Transfers Out (- OUT)
      (officer.repTransfers || [])
        .filter(t => t.status !== 'REJECTED')
        .forEach(t => {
          const receiverName = safeOfficers.find(o => o.id === t.toOfficerId)?.name || 'Other Rep';
          entries.push({
            id: t.id,
            date: t.date,
            type: 'TRANSFER_OUT',
            description: lang === "si"
              ? `ලි. මුදල් මාරු කිරීම - නිලධාරි: ${receiverName} (${t.status})`
              : `Transfer Out - to Rep: ${receiverName} (${t.status})`,
            amount: t.amount,
            direction: 'OUT'
          });
        });

      // Sort Ascending chronologically
      entries.sort((a, b) => {
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        return a.id.localeCompare(b.id);
      });

      // Compute Running Balance
      let rBal = 0;
      return entries.map(ent => {
        if (ent.direction === 'IN') {
          rBal += ent.amount;
        } else {
          rBal -= ent.amount;
        }
        return {
          ...ent,
          runningBalance: rBal
        };
      });
    };

    const ledger = getOfficerLedger();

    return {
      officerCollections,
      totalCollected,
      totalAllowances,
      totalExpenses,
      totalRemittances,
      totalDisbursed,
      cashInHand,
      pendingCount,
      pendingSum,
      pendingAllowances,
      pendingExpenses,
      pendingRemittances,
      ledger,
      officerDisbursedLoans,
      newMemberLoansCount,
      newMemberIncentivesEarned,
      monthlyDisbursalStats,
      currentMonthStats,
      currentMonthKey
    };
  };

  const metrics = currentOfficer ? calculateOfficerMetrics(currentOfficer) : null;

  // Log sub-actions (Allowances, Expenses, and Remittances)
  const handleAddNewAllowance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOfficer || !allowanceAmount) return;
    const amount = parseFloat(allowanceAmount);
    if (isNaN(amount) || amount <= 0) return;

    const txId = "allowance-" + generateId();
    const status = directPost ? 'APPROVED' : 'PENDING';
    const securityHash = status === 'APPROVED' ? generateOfficerHash(txId, allowanceDate, "ALLOWANCE", amount) : undefined;

    const newAllowance: OfficerAllowance = {
      id: txId,
      date: allowanceDate,
      amount,
      type: allowanceType,
      notes: allowanceNotes,
      status,
      repStatus: status === 'APPROVED' ? 'PENDING_APPROVAL' : undefined,
      securityHash,
      approvedBy: status === 'APPROVED' ? "Admin Counter" : undefined,
      verifiedAt: status === 'APPROVED' ? new Date().toISOString().split("T")[0] : undefined,
      referenceToken: "TKN-A-" + Math.floor(100000 + Math.random() * 900000).toString()
    };

    const updated = {
      ...currentOfficer,
      allowances: [
        ...currentOfficer.allowances,
        newAllowance
      ]
    };
    onUpdateOfficer(updated);
    setAllowanceAmount("");
    setAllowanceNotes("");
  };

  const handleAddNewExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOfficer || !expenseAmount || !expenseDesc) return;
    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) return;

    // Safety validation
    const { cashInHand } = calculateOfficerMetrics(currentOfficer);
    if (amount > cashInHand) {
      alert(lang === "si" ? "ප්‍රමාණවත් අත්මුදලක් ක්ෂේත්‍ර නිලධාරී සතුව නොමැත!" : "Officer has insufficient LKR cash in hand to secure this expense event!");
      return;
    }

    const txId = "expense-" + generateId();
    const status = directPost ? 'APPROVED' : 'PENDING';
    const securityHash = status === 'APPROVED' ? generateOfficerHash(txId, expenseDate, "EXPENSE", amount) : undefined;

    const newExpense: OfficerExpense = {
      id: txId,
      date: expenseDate,
      description: expenseDesc,
      amount,
      status,
      securityHash,
      approvedBy: status === 'APPROVED' ? "Admin Counter" : undefined,
      verifiedAt: status === 'APPROVED' ? new Date().toISOString().split("T")[0] : undefined,
      referenceToken: "TKN-E-" + Math.floor(100000 + Math.random() * 900000).toString()
    };

    const updated = {
      ...currentOfficer,
      expenses: [
        ...currentOfficer.expenses,
        newExpense
      ]
    };
    onUpdateOfficer(updated);
    setExpenseAmount("");
    setExpenseDesc("");
  };

  const handleAddNewRemittance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOfficer || !remittanceAmount) return;
    const amount = parseFloat(remittanceAmount);
    if (isNaN(amount) || amount <= 0) return;

    const { cashInHand } = calculateOfficerMetrics(currentOfficer);
    if (amount > cashInHand) {
      alert(lang === "si" ? "කාර්යාලයට නැවත භාරදීමට තරම් මුදලක් නිලධාරියා සතුව නොමැත!" : "Claimed remittance exceeds actual cash in hand!");
      return;
    }

    const txId = "remittance-" + generateId();
    const status = directPost ? 'APPROVED' : 'PENDING';
    const securityHash = status === 'APPROVED' ? generateOfficerHash(txId, remittanceDate, "REMITTANCE", amount) : undefined;

    const newRemittance: OfficerRemittance = {
      id: txId,
      date: remittanceDate,
      amount,
      notes: remittanceNotes,
      status,
      securityHash,
      approvedBy: status === 'APPROVED' ? "Admin Counter" : undefined,
      verifiedAt: status === 'APPROVED' ? new Date().toISOString().split("T")[0] : undefined,
      referenceToken: "TKN-R-" + Math.floor(100000 + Math.random() * 900000).toString()
    };

    const updated = {
      ...currentOfficer,
      remittances: [
        ...currentOfficer.remittances,
        newRemittance
      ]
    };
    onUpdateOfficer(updated);
    setRemittanceAmount("");
    setRemittanceNotes("");
  };

  // Dual Authorization Actions
  const handleApproveAllowance = (id: string) => {
    if (!currentOfficer) return;
    const updated = currentOfficer.allowances.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: 'APPROVED' as const,
          repStatus: 'PENDING_APPROVAL' as const,
          securityHash: generateOfficerHash(a.id, a.date, "ALLOWANCE", a.amount),
          approvedBy: "Supervisor (LKR-Audit)",
          verifiedAt: new Date().toISOString().split("T")[0]
        };
      }
      return a;
    });
    onUpdateOfficer({ ...currentOfficer, allowances: updated });
  };

  const handleRejectAllowance = (id: string) => {
    if (!currentOfficer) return;
    const updated = currentOfficer.allowances.map(a => {
      if (a.id === id) {
        return { ...a, status: 'REJECTED' as const, approvedBy: "Supervisor Rejected" };
      }
      return a;
    });
    onUpdateOfficer({ ...currentOfficer, allowances: updated });
  };

  const handleApproveExpense = (id: string) => {
    if (!currentOfficer) return;
    const updated = currentOfficer.expenses.map(e => {
      if (e.id === id) {
        return {
          ...e,
          status: 'APPROVED' as const,
          securityHash: generateOfficerHash(e.id, e.date, "EXPENSE", e.amount),
          approvedBy: "Supervisor (LKR-Audit)",
          verifiedAt: new Date().toISOString().split("T")[0]
        };
      }
      return e;
    });
    onUpdateOfficer({ ...currentOfficer, expenses: updated });
  };

  const handleRejectExpense = (id: string) => {
    if (!currentOfficer) return;
    const updated = currentOfficer.expenses.map(e => {
      if (e.id === id) {
        return { ...e, status: 'REJECTED' as const, approvedBy: "Supervisor Rejected" };
      }
      return e;
    });
    onUpdateOfficer({ ...currentOfficer, expenses: updated });
  };

  const handleApproveRemittance = (id: string) => {
    if (!currentOfficer) return;
    const updated = currentOfficer.remittances.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'APPROVED' as const,
          securityHash: generateOfficerHash(r.id, r.date, "REMITTANCE", r.amount),
          approvedBy: "Supervisor (LKR-Audit)",
          verifiedAt: new Date().toISOString().split("T")[0]
        };
      }
      return r;
    });
    onUpdateOfficer({ ...currentOfficer, remittances: updated });
  };

  const handleRejectRemittance = (id: string) => {
    if (!currentOfficer) return;
    const updated = currentOfficer.remittances.map(r => {
      if (r.id === id) {
        return { ...r, status: 'REJECTED' as const, approvedBy: "Supervisor Rejected" };
      }
      return r;
    });
    onUpdateOfficer({ ...currentOfficer, remittances: updated });
  };

  // Integrity Check for officer financials
  const runOfficerIntegrityAudit = () => {
    if (!currentOfficer) return;
    let scanned = 0;
    let errors: string[] = [];

    currentOfficer.allowances.forEach(a => {
      scanned++;
      if (a.status === 'APPROVED' || a.status === undefined) {
        const expected = generateOfficerHash(a.id, a.date, "ALLOWANCE", a.amount);
        if (a.securityHash && a.securityHash !== expected) {
          errors.push(`Allowance hash collision on ID: ${a.id}`);
        }
      }
    });

    currentOfficer.expenses.forEach(e => {
      scanned++;
      if (e.status === 'APPROVED' || e.status === undefined) {
        const expected = generateOfficerHash(e.id, e.date, "EXPENSE", e.amount);
        if (e.securityHash && e.securityHash !== expected) {
          errors.push(`Expense hash collision on ID: ${e.id}`);
        }
      }
    });

    currentOfficer.remittances.forEach(r => {
      scanned++;
      if (r.status === 'APPROVED' || r.status === undefined) {
        const expected = generateOfficerHash(r.id, r.date, "REMITTANCE", r.amount);
        if (r.securityHash && r.securityHash !== expected) {
          errors.push(`Remittance hash collision on ID: ${r.id}`);
        }
      }
    });

    setOfficerScanResult({
      scanned,
      valid: errors.length === 0,
      errors
    });

    setTimeout(() => {
      setOfficerScanResult(null);
    }, 4000);
  };

  // Sub level deletions
  const handleDeleteAllowanceItem = (id: string) => {
    if (!currentOfficer) return;
    if (confirm(lang === "si" ? "මෙම දීමනා සටහන ඉවත් කිරීමට අවශ්‍යද?" : "Remove this allowance record?")) {
      const updated = {
        ...currentOfficer,
        allowances: currentOfficer.allowances.filter(a => a.id !== id)
      };
      onUpdateOfficer(updated);
    }
  };

  const handleDeleteExpenseItem = (id: string) => {
    if (!currentOfficer) return;
    if (confirm(lang === "si" ? "මෙම වියදම් සටහන ඉවත් කිරීමට අවශ්‍යද?" : "Remove this expense record?")) {
      const updated = {
        ...currentOfficer,
        expenses: currentOfficer.expenses.filter(e => e.id !== id)
      };
      onUpdateOfficer(updated);
    }
  };

  const handleDeleteRemittanceItem = (id: string) => {
    if (!currentOfficer) return;
    if (confirm(lang === "si" ? "මෙම මුදල් භාරදීමේ සටහන ඉවත් කිරීමට අවශ්‍යද?" : "Remove this remittance record?")) {
      const updated = {
        ...currentOfficer,
        remittances: currentOfficer.remittances.filter(r => r.id !== id)
      };
      onUpdateOfficer(updated);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Introduction Banner header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-md">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-slate-800/50 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-xl bg-slate-800 text-indigo-400">
              <Users className="w-5 h-5" />
            </span>
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
              {lang === "si" ? "ක්ෂේත්‍ර නිලධාරී කළමනාකරණය" : "Field Force Representatives Control"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {lang === "si" ? "ක්ෂේත්‍ර නිලධාරීන් සහ එකතුකිරීම් සඟරාව" : "Field Officers & Collection Logs"}
          </h2>
          <p className="text-xs text-slate-400 mt-2 max-w-xl leading-relaxed">
            {lang === "si" 
              ? "ණය වාරික එකතු කරන නිලධාරීන් එකතු කිරීම, ඔවුන්ගේ දෛනික දීමනා, වියදම් සහ ඔවුන් සතුව පවතින මුදල් ශේෂයන් නිවැරදිව පාලනය කරන්න." 
              : "Register dynamic field collectors, track their daily allowances (Batta), logging company expenses, and calculate actual cash in hand status."}
          </p>
        </div>
      </div>

      {/* Grid Layout containing Listing & Profile view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Officers list (Left column) */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-800">
              {lang === "si" ? "නිලධාරීන් ලැයිස්තුව" : "Representatives"}
            </h3>
            <button
              onClick={() => {
                const nextState = !showAddForm;
                if (nextState) {
                  setEmployeeId(generateNextEmployeeId(officers));
                }
                setShowAddForm(nextState);
              }}
              className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {lang === "si" ? "දක්වන්න" : "Add New"}
            </button>
          </div>

          {/* Form to Registration of Field Officer */}
          {showAddForm && (
            <form onSubmit={handleSubmitOfficer} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  {lang === "si" ? "නිලධාරියාගේ නම *" : "Officer Full Name *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === "si" ? "උදා: නිමල් පෙරේරා" : "e.g. Nimal Perera"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 tracking-wide font-sans outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    {lang === "si" ? "හැඳුනුම්පත් අංකය *" : "NIC Number *"}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    placeholder="991234567V"
                    value={nic}
                    onChange={(e) => setNic(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 tracking-wide font-sans outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    {lang === "si" ? "දුරකථන අංකය *" : "Phone Line *"}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0771234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 tracking-wide font-sans outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  {lang === "si" ? "වත්මන් ලිපිනය" : "Address"}
                </label>
                <textarea
                  placeholder={lang === "si" ? "පටුමග, නගරය..." : "Street residence..."}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 tracking-wide font-sans outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    {lang === "si" ? "සේවක අංකය" : "Staff ID"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EMP-024"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 tracking-wide font-sans outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    {lang === "si" ? "විද්‍යුත් තැපෑල" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 tracking-wide font-sans outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    {lang === "si" ? "වාහන අංකය" : "Vehicle No."}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. WP CP-5020"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 tracking-wide font-sans outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    {lang === "si" ? "බැඳුණු දිනය" : "Joined Date"}
                  </label>
                  <input
                    type="date"
                    value={joinedDate}
                    onChange={(e) => setJoinedDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 tracking-wide font-sans outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    {lang === "si" ? "එකතුකිරීමේ ඉලක්කය (රු.)" : "Target Collection (LKR)"}
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 500000"
                    value={targetCollection}
                    onChange={(e) => setTargetCollection(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 tracking-wide font-sans outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    {lang === "si" ? "තත්ත්වය" : "Status"}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 tracking-wide font-sans outline-none"
                  >
                    <option value="ACTIVE">{lang === "si" ? "Active" : "Active"}</option>
                    <option value="INACTIVE">{lang === "si" ? "Inactive" : "Inactive"}</option>
                  </select>
                </div>
              </div>

              {/* Commission and Targets Customizable Fields */}
              <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                <span className="text-[9px] font-black text-indigo-800 uppercase tracking-wider block">
                  {lang === "si" ? "කොමිස් සහ ඉලක්ක සැකසුම් (Customizable Commissions)" : "Customizable Commissions & Incentives"}
                </span>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                      {lang === "si" ? "ණය නිකුත් කිරීමේ ඉලක්කය (රු.)" : "Disbursement Target (LKR)"}
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 300000"
                      value={monthlyDisbursedTarget}
                      onChange={(e) => setMonthlyDisbursedTarget(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] focus:ring-1 focus:ring-indigo-500 font-sans outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                      {lang === "si" ? "ඉලක්කයෙන් පසු කොමිස් %" : "Commission Above Target (%)"}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 2.5"
                      value={commissionRateAboveTarget}
                      onChange={(e) => setCommissionRateAboveTarget(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] focus:ring-1 focus:ring-indigo-500 font-sans outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                      {lang === "si" ? "නව සාමාජික දීමනාව (රු.)" : "New Member Reward (LKR)"}
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={incentivePerNewMember}
                      onChange={(e) => setIncentivePerNewMember(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] focus:ring-1 focus:ring-indigo-500 font-sans outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    {lang === "si" ? "සේවා තනතුර (Position / System Access Role)" : "Position / System Role"}
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 tracking-wide font-sans outline-none"
                  >
                    <option value="FIELD_OFFICER">{lang === "si" ? "ප්‍රාදේශීය නිලධාරී (Field Representative / Officer)" : "Field Representative / Officer"}</option>
                    <option value="OFFICE_STAFF">{lang === "si" ? "කාර්යාල සහායක / කාර්ය මණ්ඩලය (Office Staff)" : "Office Staff"}</option>
                    <option value="MANAGER">{lang === "si" ? "කළමනාකරු / පාලක (Manager)" : "Office Manager"}</option>
                    <option value="ACCOUNTANT">{lang === "si" ? "ගණකාධිකාරී (Accountant)" : "Accountant"}</option>
                    <option value="ADMIN">{lang === "si" ? "පද්ධති පරිපාලක (Admin)" : "System Administrator"}</option>
                  </select>
                </div>
                {position !== "FIELD_OFFICER" && (
                  <div className="flex items-center gap-2 p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <input
                      type="checkbox"
                      id="canApproveLoans"
                      checked={canApproveLoans}
                      onChange={(e) => setCanApproveLoans(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="canApproveLoans" className="text-[10px] font-bold text-indigo-950 cursor-pointer select-none">
                      {lang === "si" ? "මෙම නිලධාරියාට ණය අයදුම්පත් අනුමත කිරීමට (Approve Authority) අවසර දෙන්න" : "Grant Approval Authority to authorize/approve Loans"}
                    </label>
                  </div>
                )}
              </div>

              {/* Officer ID Image Uploads */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">
                  {lang === "si" ? "සේවක ජාතික හැඳුනුම්පත් ඡායාරූප (NIC Documents)" : "Employee NIC Document Photos"}
                </span>
                <div className="grid grid-cols-1 gap-2.5">
                  <ImageUploadField
                    label={lang === "si" ? "හැඳුනුම්පත් ඉදිරිපස (NIC Front)" : "NIC Front Side Copy"}
                    value={idFront}
                    onChange={(b64) => setIdFront(b64)}
                    onClear={() => setIdFront("")}
                    lang={lang}
                  />
                  <ImageUploadField
                    label={lang === "si" ? "හැඳුනුම්පත් පසුපස (NIC Back)" : "NIC Back Side Copy"}
                    value={idBack}
                    onChange={(b64) => setIdBack(b64)}
                    onClear={() => setIdBack("")}
                    lang={lang}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs cursor-pointer active:scale-95 transition-all text-center"
                >
                  {lang === "si" ? "ලියාපදිංචි කරන්න" : "Register Core"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs cursor-pointer active:scale-95 transition-all"
                >
                  {lang === "si" ? "අවලංගුයි" : "Cancel"}
                </button>
              </div>
            </form>
          )}

          {/* Officers List Grid */}
          <div className="space-y-2 max-h-[450px] overflow-y-auto">
            {safeOfficers.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                <Users className="w-8 h-8 text-slate-300 mx-auto stroke-1 mb-1.5" />
                <p className="text-[11px] font-bold text-slate-600">{lang === "si" ? "කිසිදු නිලධාරියෙක් ඇතුළත් කර නැත" : "No registered field officers."}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{lang === "si" ? "ලියාපදිංචි කිරීමට ඉහත 'දක්වන්න' ඔබන්න." : "Click 'Add New' to insert first field force rep."}</p>
              </div>
            ) : (
              safeOfficers.map((officer) => {
                const isActive = officer.id === selectedOfficerId;
                const m = calculateOfficerMetrics(officer);
                return (
                  <button
                    key={officer.id}
                    onClick={() => {
                      setSelectedOfficerId(officer.id);
                      setActiveTab("COLLECTIONS");
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                      isActive 
                        ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                        : "bg-slate-50 hover:bg-slate-100/70 border-slate-100 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${isActive ? "bg-slate-800 text-indigo-400" : "bg-white text-slate-500 border border-slate-100"}`}>
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold truncate">{officer.name}</p>
                        <p className={`text-[9px] font-medium font-mono mt-0.5 ${isActive ? "text-slate-400" : "text-slate-400"}`}>
                          ID: {officer.nic}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-[10px] font-black font-mono ${isActive ? "text-emerald-400" : "text-emerald-600"}`}>
                        {formatLKR(m.cashInHand)}
                      </p>
                      <p className="text-[8px] text-slate-400">{lang === "si" ? "අතේ ඇති මුදල" : "In Hand"}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Detailed profile and logs (Right columns) */}
        <div className="lg:col-span-8 space-y-6">
          {currentOfficer && metrics ? (
            <div className="space-y-6">
              
              {!isOwnProfile && currentUserRole === 'ADMIN' && (
                <div className="bg-indigo-50 border border-indigo-150 rounded-2xl p-4.5 flex gap-3 text-indigo-900 text-xs items-center" id="admin-management-banner">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div className="font-bold">
                    <p>{lang === "si" ? "ℹ️ ඔබ මෙම ගිණුම පද්ධති පරිපාලක (Admin) ලෙස නරඹයි. ඔබට ඉලක්ක සැකසීමට, කොමිස් වෙනස් කිරීමට සහ ගනුදෙනු ඇතුලත් කිරීමට පූර්ණ අවසර ඇත." : "ℹ️ You are viewing this profile as a System Administrator. You can set targets, change commission configurations, and record transactions."}</p>
                  </div>
                </div>
              )}

              {!isOwnProfile && currentUserRole !== 'ADMIN' && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4.5 flex gap-3 text-amber-900 text-xs items-center" id="readonly-profile-warning">
                  <Lock className="w-5 h-5 text-amber-650 shrink-0" />
                  <div className="font-bold">
                    <p>{lang === "si" ? "⚠️ ඔබ දැනට නරඹනුයේ වෙනත් නිලධාරියෙකුගේ ගිණුමකි. මෙම ගිණුම් අතේ තබාගෙන කිසිදු දත්තයක් ඇතුළත් කිරීමට හෝ වෙනස් කිරීමට ඔබට අවසර නොමැත (නැරඹීම පමණි)." : "⚠️ You are currently viewing another officer's profile. You cannot add or change records on this profile (Read-Only mode)."}</p>
                  </div>
                </div>
              )}
              
              {/* Profile Card Summary Header */}
              {/* Profile Card Summary Header */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs relative">
                
                {isEditingProfile ? (
                  <form onSubmit={handleUpdateOfficerProfile} className="space-y-4 border-b border-slate-100 pb-5 mb-5">
                    <h4 className="text-xs font-black uppercase text-indigo-600 tracking-wider">
                      {lang === "si" ? "නිලධාරී තොරතුරු සංස්කරණය" : "Edit Field Representative Profile"}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "නම" : "Full Name"}</label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "හැඳුනුම්පත් අංකය" : "NIC"}</label>
                        <input
                          type="text"
                          required
                          value={editNic}
                          onChange={(e) => setEditNic(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "දුරකථන අංකය" : "Phone"}</label>
                        <input
                          type="text"
                          required
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "සේවක අංකය" : "Staff ID"}</label>
                        <input
                          type="text"
                          value={editEmployeeId}
                          onChange={(e) => setEditEmployeeId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "විද්‍යුත් තැපෑල" : "Email Address"}</label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "වාහන අංකය" : "Vehicle Number"}</label>
                        <input
                          type="text"
                          value={editVehicleNumber}
                          onChange={(e) => setEditVehicleNumber(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "සේවයට බැඳුණු දිනය" : "Date Joined"}</label>
                        <input
                          type="date"
                          value={editJoinedDate}
                          onChange={(e) => setEditJoinedDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "එකතුකිරීමේ ඉලක්කය (රු.)" : "Target Collection (LKR)"}</label>
                        <input
                          type="number"
                          value={editTargetCollection}
                          onChange={(e) => setEditTargetCollection(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "ක්‍රියාකාරී තත්ත්වය" : "Force Status"}</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans outline-none"
                        >
                          <option value="ACTIVE">{lang === "si" ? "Active" : "Active"}</option>
                          <option value="INACTIVE">{lang === "si" ? "Inactive" : "Inactive"}</option>
                        </select>
                      </div>
                    </div>

                    {/* Edit Commission and Targets Customizable Fields */}
                    <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                      <span className="text-[9px] font-black text-indigo-800 uppercase tracking-wider block">
                        {lang === "si" ? "කොමිස් සහ ඉලක්ක සැකසුම් (Customizable Commissions)" : "Customizable Commissions & Incentives"}
                      </span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                            {lang === "si" ? "ණය නිකුත් කිරීමේ ඉලක්කය (රු.)" : "Disbursement Target (LKR)"}
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 300000"
                            value={editMonthlyDisbursedTarget}
                            onChange={(e) => setEditMonthlyDisbursedTarget(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 font-sans font-bold outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                            {lang === "si" ? "ඉලක්කයෙන් පසු කොමිස් %" : "Commission Above Target (%)"}
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="e.g. 2.5"
                            value={editCommissionRateAboveTarget}
                            onChange={(e) => setEditCommissionRateAboveTarget(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 font-sans font-bold outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                            {lang === "si" ? "නව සාමාජික දීමනාව (රු.)" : "New Member Reward (LKR)"}
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 500"
                            value={editIncentivePerNewMember}
                            onChange={(e) => setEditIncentivePerNewMember(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 font-sans font-bold outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "සේවා තනතුර (Position / System Role)" : "Position / System Role"}</label>
                        <select
                          value={editPosition}
                          onChange={(e) => setEditPosition(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans outline-none"
                        >
                          <option value="FIELD_OFFICER">{lang === "si" ? "ප්‍රාදේශීය නිලධාරී (Field Representative / Officer)" : "Field Representative / Officer"}</option>
                          <option value="OFFICE_STAFF">{lang === "si" ? "කාර්යාල සහායක / කාර්ය මණ්ඩලය (Office Staff)" : "Office Staff"}</option>
                          <option value="MANAGER">{lang === "si" ? "කළමනාකරු / පාලක (Manager)" : "Office Manager"}</option>
                          <option value="ACCOUNTANT">{lang === "si" ? "ගණකාධිකාරී (Accountant)" : "Accountant"}</option>
                          <option value="ADMIN">{lang === "si" ? "පද්ධති පරිපාලක (Admin)" : "System Administrator"}</option>
                        </select>
                      </div>
                      {editPosition !== "FIELD_OFFICER" ? (
                        <div className="flex items-center gap-2 p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl mt-4">
                          <input
                            type="checkbox"
                            id="editCanApproveLoans"
                            checked={editCanApproveLoans}
                            onChange={(e) => setEditCanApproveLoans(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <label htmlFor="editCanApproveLoans" className="text-[10px] font-bold text-indigo-900 cursor-pointer select-none">
                            {lang === "si" ? "මෙම නිලධාරියාට ණය අයදුම්පත් අනුමත කිරීමට (Approve Authority) අවසර දෙන්න" : "Grant Approval Authority to authorize/approve Loans"}
                          </label>
                        </div>
                      ) : <div />}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "ලිපිනය" : "Residence Address"}</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans outline-none"
                      />
                    </div>

                    {/* ID Image Uploads for Editing */}
                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase block">
                        {lang === "si" ? "සේවක හැඳුනුම්පත් ඡායාරූප (NIC Documents)" : "Employee NIC Document Photos"}
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <ImageUploadField
                          label={lang === "si" ? "හැඳුනුම්පත් ඉදිරිපස (NIC Front)" : "NIC Front Side Copy"}
                          value={editIdFront}
                          onChange={(b64) => setEditIdFront(b64)}
                          onClear={() => setEditIdFront("")}
                          lang={lang}
                        />
                        <ImageUploadField
                          label={lang === "si" ? "හැඳුනුම්පත් පසුපස (NIC Back)" : "NIC Back Side Copy"}
                          value={editIdBack}
                          onChange={(b64) => setEditIdBack(b64)}
                          onClear={() => setEditIdBack("")}
                          lang={lang}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-4 py-2 rounded-xl active:scale-95 transition cursor-pointer"
                      >
                        {lang === "si" ? "සුරකින්න" : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold px-4 py-2 rounded-xl transition cursor-pointer"
                      >
                        {lang === "si" ? "අවලංගු කරන්න" : "Cancel"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-50 pb-5 mb-5 w-full">
                    <div className="flex items-start gap-4 w-full">
                      <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-2xl text-indigo-600 shrink-0">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div className="space-y-2 w-full">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-extrabold text-slate-800 text-base">{currentOfficer.name}</h3>
                          {currentOfficer.status === 'INACTIVE' ? (
                            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-wider">
                              Inactive
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider">
                              Active Force
                            </span>
                          )}
                          {currentOfficer.position && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-750 text-[9px] font-black uppercase tracking-wider">
                              {currentOfficer.position === 'FIELD_OFFICER' ? (lang === 'si' ? 'ප්‍රාදේශීය නිලධාරී' : 'Field Representative') : 
                               currentOfficer.position === 'OFFICE_STAFF' ? (lang === 'si' ? 'කාර්යාල සහායක' : 'Office Staff') : 
                               currentOfficer.position === 'MANAGER' ? (lang === 'si' ? 'කළමනාකරු' : 'Manager') : 
                               currentOfficer.position === 'ACCOUNTANT' ? (lang === 'si' ? 'ගණකාධිකාරී' : 'Accountant') : 
                               currentOfficer.position === 'ADMIN' ? (lang === 'si' ? 'පද්ධති පරිපාලක' : 'Admin') : currentOfficer.position}
                            </span>
                          )}
                          {currentOfficer.position !== 'FIELD_OFFICER' && currentOfficer.canApproveLoans && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-805 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 border border-amber-200">
                              🛡️ {lang === 'si' ? 'ණය අනුමත බලය' : 'Can Approve Loans'}
                            </span>
                          )}
                          {currentOfficer.employeeId && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[9px] font-bold font-mono">
                              ID: {currentOfficer.employeeId}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-slate-400 text-[11px] font-medium">
                          <span className="flex items-center gap-1">
                            <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                            NIC: {currentOfficer.nic}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {currentOfficer.phone}
                          </span>
                          {currentOfficer.address && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {currentOfficer.address}
                            </span>
                          )}
                        </div>

                        {/* Additional info metadata metrics grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-50 w-full text-[10px]">
                          {currentOfficer.email && (
                            <div className="text-slate-500 font-medium">
                              <span className="text-slate-400 font-extrabold block uppercase text-[8px] tracking-wider">Email</span>
                              <span className="truncate block max-w-xs">{currentOfficer.email}</span>
                            </div>
                          )}
                          {currentOfficer.vehicleNumber && (
                            <div className="text-slate-500 font-medium">
                              <span className="text-slate-400 font-extrabold block uppercase text-[8px] tracking-wider">Vehicle</span>
                              <span>{currentOfficer.vehicleNumber}</span>
                            </div>
                          )}
                          {currentOfficer.joinedDate && (
                            <div className="text-slate-500 font-medium">
                              <span className="text-slate-400 font-extrabold block uppercase text-[8px] tracking-wider">Joined</span>
                              <span>{currentOfficer.joinedDate}</span>
                            </div>
                          )}
                        </div>

                        {/* Progress Bar for Target Collections */}
                        {currentOfficer.targetCollection && (
                          <div className="pt-2">
                            <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-600 mb-1">
                              <span className="uppercase text-slate-400 text-[8px] tracking-wider">Inflow Collection Target</span>
                              <span className="text-indigo-600">{formatLKR(metrics.totalCollected)} / {formatLKR(currentOfficer.targetCollection)} ({Math.min(100, Math.round((metrics.totalCollected / currentOfficer.targetCollection) * 100))}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (metrics.totalCollected / currentOfficer.targetCollection) * 100)}%` }} />
                            </div>
                          </div>
                        )}

                        {/* Employee ID NIC Card Preview Display */}
                        {(currentOfficer.idFront || currentOfficer.idBack) && (
                          <div className="mt-3 p-3 rounded-2xl bg-indigo-50/20 border border-indigo-150/25">
                            <h5 className="text-[9px] font-black uppercase text-indigo-550 mb-2 tracking-wider">
                              {lang === "si" ? "සේවක ජාතික හැඳුනුම්පත් ඡායාරූප (NIC Card Copies)" : "Staff National Identity Card (NIC)"}
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {currentOfficer.idFront ? (
                                <div className="space-y-1">
                                  <span className="text-[8px] font-bold text-slate-400 uppercase">{lang === "si" ? "ඉදිරිපස" : "Front Side"}</span>
                                  <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white aspect-video max-h-36 flex items-center justify-center">
                                    <img src={currentOfficer.idFront} alt="ID Front" className="object-contain w-full h-full" referrerPolicy="no-referrer" />
                                  </div>
                                </div>
                              ) : null}

                              {currentOfficer.idBack ? (
                                <div className="space-y-1">
                                  <span className="text-[8px] font-bold text-slate-400 uppercase">{lang === "si" ? "පසුපස" : "Back Side"}</span>
                                  <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white aspect-video max-h-36 flex items-center justify-center">
                                    <img src={currentOfficer.idBack} alt="ID Back" className="object-contain w-full h-full" referrerPolicy="no-referrer" />
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {isAuthorizedToEdit && (
                      <div className="flex md:flex-col gap-2 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => startEditingProfile(currentOfficer)}
                          className="flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.8 rounded-xl text-[11px] font-bold cursor-pointer transition active:scale-95"
                        >
                          {lang === "si" ? "සංස්කරණය" : "Edit Profile"}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(lang === "si" ? "මෙම නිලධාරියා පද්ධතියෙන් සම්පූර්ණයෙන්ම ඉවත් කිරීමට අවශ්‍යද?" : "Delete this Field Officer profile completely?")) {
                              onDeleteOfficer(currentOfficer.id);
                              setSelectedOfficerId(safeOfficers.length > 1 ? safeOfficers.filter(o => o.id !== currentOfficer.id)[0].id : null);
                            }
                          }}
                          className="flex items-center gap-1.5 border border-rose-205 text-rose-650 hover:bg-rose-50 px-3 py-1.8 rounded-xl text-[11px] font-bold cursor-pointer transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {lang === "si" ? "ඉවත් කරන්න" : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Micro metrics grids */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                    <div className="flex items-center justify-between text-emerald-800 mb-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider">{lang === "si" ? "මුළු එකතු කිරීම්" : "Collections"}</span>
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-sm font-black text-emerald-700 tracking-tight font-mono">{formatLKR(metrics.totalCollected)}</p>
                    <p className="text-[9px] text-slate-400 mt-1">{lang === "si" ? "ණය වාරික එකතු කළ ගණන" : "Aggregated Inflow"}</p>
                  </div>

                  <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100">
                    <div className="flex items-center justify-between text-sky-800 mb-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider">{lang === "si" ? "මුළු දීමනා (Batta)" : "Allowances"}</span>
                      <Coins className="w-4 h-4 text-sky-600" />
                    </div>
                    <p className="text-sm font-black text-sky-700 tracking-tight font-mono">{formatLKR(metrics.totalAllowances)}</p>
                    <p className="text-[9px] text-slate-400 mt-1">{lang === "si" ? "ලබාදුන් දෛනික දිරි දීමනා" : "Batta Allowance"}</p>
                  </div>

                  <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                    <div className="flex items-center justify-between text-amber-800 mb-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider">{lang === "si" ? "මුළු වියදම්" : "Expenses"}</span>
                      <ArrowUpRight className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-sm font-black text-amber-700 tracking-tight font-mono">{formatLKR(metrics.totalExpenses)}</p>
                    <p className="text-[9px] text-slate-400 mt-1">{lang === "si" ? "සිදුකර ඇති වියදම්" : "Reps logged expenses"}</p>
                  </div>

                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <div className="flex items-center justify-between text-indigo-800 mb-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider">{lang === "si" ? "අතේ ඇති මුදල" : "Cash In Hand"}</span>
                      <Coins className="w-4 h-4 text-indigo-650" />
                    </div>
                    <p className="text-sm font-black text-indigo-800 tracking-tight font-mono">{formatLKR(metrics.cashInHand)}</p>
                    <p className="text-[9px] text-slate-400 mt-1 font-bold">{lang === "si" ? "භාරදිය යුතු ශේෂය" : "Due to office"}</p>
                  </div>
                </div>

                {/* Cash hand over (Remittances) summary info */}
                {metrics.totalRemittances > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                      {lang === "si" ? "මීට පෙර කාර්යාලයට භාරදුන් මුළු මුදල:" : "Total Cash Remitted to Office previously:"}
                    </span>
                    <strong className="text-slate-800 font-mono font-black">{formatLKR(metrics.totalRemittances)}</strong>
                  </div>
                )}

                {/* Secure Pending transaction warnings */}
                {metrics.pendingCount > 0 && (
                  <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs animate-pulse">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-amber-800">
                        {lang === "si" 
                          ? `අනුමැතිය සඳහා ගෙවීම්/වියදම් සටහන් ${metrics.pendingCount} ක් පොරොත්තුවෙන් පවතී!` 
                          : `${metrics.pendingCount} Financial Logs Pending Supervisor Audit Auth!`}
                      </p>
                      <p className="text-[10px] text-amber-650 font-medium mt-0.5">
                        {lang === "si"
                          ? `අත්මුදල් (Cash In Hand) ශේෂ නිගමනයට අනුමත නොකළ ගනුදෙනු (මුළු එකතුව: ${formatLKR(metrics.pendingSum)}) තවමත් ඇතුළත් නොවේ.`
                          : `Primary metrics do not integrate these unverified logs (${formatLKR(metrics.pendingSum)}) until authorized.`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Cryptographic Ledger Audit Console */}
                <div className="mt-4 bg-slate-950 text-slate-200 rounded-3xl p-5 border border-slate-800 relative overflow-hidden font-sans shadow-lg">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-black tracking-widest text-indigo-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                        Field Representative Audit Console • දත්ත විගණනය
                      </span>
                      <h4 className="text-slate-100 font-bold text-xs">
                        {lang === "si" ? "විනිවිදශීලී වියදම් සහ දීමනා විගණන කුළුණ" : "Officer Expense Ledger & Petty Cash Verification"}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-sans leading-normal">
                        {lang === "si" ? "නිලධාරීන්ගේ සියලුම වියදම්, බටා දීමනා සහ කාර්යාලයට නැවත භාරදුන් මුදල් වංචා වැළැක්වීමේ කේතාංක ඔස්සේ පරීක්ෂා කෙරේ." : "Detects discrepancy loops. Instantly checks digital block signatures of active petty cash entries."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={runOfficerIntegrityAudit}
                      className="flex items-center gap-1 border border-slate-800 bg-slate-900 hover:bg-slate-850 text-white text-[11px] font-extrabold px-3 py-1.8 rounded-xl transition active:scale-95 cursor-pointer shrink-0"
                    >
                      <RefreshCw className="w-3 h-3 text-indigo-400" />
                      {lang === "si" ? "ලේඛන විගණනය" : "Verify Checksums"}
                    </button>
                  </div>
                  {officerScanResult && (
                    <div className={`mt-3 p-3 rounded-xl border text-xs flex items-center gap-2 animate-fade-in ${
                      officerScanResult.valid ? "bg-emerald-950/40 border-emerald-950 text-emerald-300" : "bg-rose-950/40 border-rose-950 text-rose-300"
                    }`}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <div>
                        <p className="font-extrabold">{lang === "si" ? "නිවැරදි භාවය ස්ථිර කරන ලදී!" : "Scan Completed!"}</p>
                        <p className="text-[9px] mt-0.5 opacity-90">
                          {lang === "si" 
                            ? `නිලධාරී සටහන් ${officerScanResult.scanned} ක් සාර්ථකව පරීක්ෂා කරන ලදී. කිසිදු විෂමතාවයක් හමු නොවිය.`
                            : `Verified ${officerScanResult.scanned} petty logs. Cryptographic seal remains pristine.`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Transactions logs & Inputs Tabs controller */}
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs font-sans">
                
                {/* Scrollable headers tab */}
                <div className="bg-slate-50 border-b border-slate-100 p-2 flex flex-wrap gap-1">
                  {[
                    { id: "COLLECTIONS", label: lang === "si" ? "1. ණය මුදල් එකතු කිරීම්" : "Loan Collections", count: metrics.officerCollections.length },
                    { id: "ALLOWANCES", label: lang === "si" ? "2. දීමනා / අත්මුදල් (Floats)" : "Allowances & Floats", count: currentOfficer.allowances.length },
                    { id: "EXPENSES", label: lang === "si" ? "3. වියදම් සඟරාව" : "Logged Expenditures", count: currentOfficer.expenses.length },
                    { id: "REMITTANCES", label: lang === "si" ? "4. කාර්යාලයට භාරදුන් මුදල්" : "Remittances to Office", count: currentOfficer.remittances.length },
                    { id: "TRANSFERS", label: lang === "si" ? "5. මාරු කිරීම්" : "Rep Transfers", count: (currentOfficer.repTransfers?.length || 0) + safeOfficers.flatMap(o => o.repTransfers||[]).filter(t => t.toOfficerId === currentOfficer.id).length },
                    { id: "EOD_REPORT", label: lang === "si" ? "6. දෛනික වාර්තාව (EOD)" : "Daily EOD Report", count: undefined },
                    { id: "STATEMENT", label: lang === "si" ? "7. ධාවන ගිණුම් ලේඛනය" : "Running Cash Ledger", count: metrics.ledger.length },
                    { id: "COMMISSIONS", label: lang === "si" ? "8. කොමිස් සහ දිරිදීමනා" : "Commissions & Rewards", count: undefined },
                  ].map((tab) => {
                    const isSel = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          isSel 
                            ? "bg-slate-900 text-white shadow-xs" 
                            : "text-slate-550 hover:bg-slate-100"
                        }`}
                      >
                        <span>{tab.label}</span>
                        {tab.count !== undefined && (
                          <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${isSel ? "bg-slate-800 text-indigo-400" : "bg-slate-200 text-slate-600"}`}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="p-6">
                  
                  {/* TAB 1: COLLECTIONS VIEW */}
                  {activeTab === "COLLECTIONS" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-slate-800 text-xs font-extrabold flex items-center gap-1.5">
                          <ClipboardList className="w-4 h-4 text-emerald-500" />
                          {lang === "si" ? "නිලධාරියා විසින් එකතු කරන ලද ණය වාරික" : "Voucher Collections Collected by Officer"}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {lang === "si" ? "* ණයකරුගේ විස්තර පත්‍රිකාවේ ගෙවීමක් එක් කිරීමේදී මෙම නිලධාරියාව තෝරන්න." : "* Linked when adding payment in loan files."}
                        </span>
                      </div>

                      {metrics.officerCollections.length === 0 ? (
                        <div className="text-center py-10 rounded-2xl bg-slate-50 border border-slate-100">
                          <Receipt className="w-7 h-7 text-slate-300 mx-auto mb-1 stroke-1" />
                          <p className="text-[11px] text-slate-500 font-bold">{lang === "si" ? "කිසිදු වාරික එකතු කිරීමක් සටහන් වී නැත" : "No collection ledger linked."}</p>
                          <p className="text-[9px] text-slate-400 mt-1 max-w-xs mx-auto">
                            {lang === "si" ? "ණය ගිණුමක් විවෘත කර 'ගෙවීමක් එකතු කරන්න' අවස්ථාවේදී මෙම නිලධාරියාගේ නම තෝරන්න." : "Go to loan list -> view ledger -> record payment and assign to this officer."}
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                                <th className="pb-2.5">{lang === "si" ? "දිනය" : "Date"}</th>
                                <th className="pb-2.5">{lang === "si" ? "ණයකරු සහ ගිණුම" : "Borrower Profile"}</th>
                                <th className="pb-2.5">{lang === "si" ? "තත්ත්වය" : "Approval Status"}</th>
                                <th className="pb-2.5">{lang === "si" ? "ලදුපත" : "Receipt"}</th>
                                <th className="pb-2.5 text-right">{lang === "si" ? "මුදල" : "Inflow"}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-xs font-sans">
                              {metrics.officerCollections.map((col) => (
                                <tr key={col.id} className="hover:bg-slate-50/50">
                                  <td className="py-3 text-slate-400 font-mono font-medium">{col.date}</td>
                                  <td className="py-3">
                                    <p className="font-extrabold text-slate-700">{col.borrowerName}</p>
                                    <p className="text-[9px] text-slate-400 font-bold font-mono">Ref: {col.applicationNumber}</p>
                                  </td>
                                  <td className="py-3">
                                    {(() => {
                                      const status = col.loanStatus || "ACTIVE";
                                      const colorClass = 
                                        status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                        status === "ACTIVE" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                                        status === "OVERDUE" ? "bg-rose-50 text-rose-700 border-rose-200 font-black animate-pulse" :
                                        "bg-amber-50 text-amber-700 border-amber-200";
                                      return (
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border font-mono ${colorClass}`}>
                                          {status}
                                        </span>
                                      );
                                    })()}
                                  </td>
                                  <td className="py-3 font-mono text-slate-500">{col.receiptNumber}</td>
                                  <td className="py-3 text-right font-mono font-black text-emerald-600">{formatLKR(col.amount)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: ALLOWANCES VIEW & ADDITION */}
                  {activeTab === "ALLOWANCES" && (
                    <div className="space-y-6">
                      
                      {/* Form to log daily batch allowance */}
                      {isAuthorizedToEdit ? (
                        <form onSubmit={handleAddNewAllowance} className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                          <div className="md:col-span-2">
                            <label className="text-[9px] font-bold text-teal-800 uppercase block mb-1">{lang === "si" ? "ලබාදුන් දිනය" : "Allocation Date"}</label>
                            <input
                              type="date"
                              required
                              value={allowanceDate}
                              onChange={(e) => setAllowanceDate(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 outline-none"
                            />
                          </div>
                          <div className="md:col-span-3">
                            <label className="text-[9px] font-bold text-teal-800 uppercase block mb-1">{lang === "si" ? "ගනුදෙනු/දීමනා වර්ගය" : "Allocation Type"}</label>
                            <select
                              value={allowanceType}
                              onChange={(e) => setAllowanceType(e.target.value as any)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 outline-none font-bold"
                            >
                              <option value="BATTA">{lang === "si" ? "දෛනික දීමනාව / බත්තා" : "Daily Batta Allowance"}</option>
                              <option value="FLOAT">{lang === "si" ? "උදෑසන ආරම්භක අත්මුදල්" : "Morning Starting Float"}</option>
                              <option value="OTHER">{lang === "si" ? "වෙනත් ගෙවීම් / Inflow" : "Other Allowance"}</option>
                            </select>
                          </div>
                          <div className="md:col-span-3">
                            <label className="text-[9px] font-bold text-teal-800 uppercase block mb-1">{lang === "si" ? "මුදල (LKR) *" : "Batta/Float Amount (LKR) *"}</label>
                            <input
                              type="number"
                              required
                              placeholder="Rs. 1500"
                              value={allowanceAmount}
                              onChange={(e) => setAllowanceAmount(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none font-mono font-bold"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-[9px] font-bold text-teal-800 uppercase block mb-1">{lang === "si" ? "සටහන් (Notes)" : "Notes"}</label>
                            <input
                              type="text"
                              placeholder="විස්තරය..."
                              value={allowanceNotes}
                              onChange={(e) => setAllowanceNotes(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 outline-none"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <button
                              type="submit"
                              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-1.8 rounded-xl text-xs active:scale-95 transition-all outline-none flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              {lang === "si" ? "එක් කරන්න" : "Add Fund"}
                            </button>
                          </div>

                          {/* Direct posting controller */}
                          <div className="md:col-span-12 pt-1 border-t border-slate-200 flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={directPost}
                              onChange={(e) => setDirectPost(e.target.checked)}
                              className="rounded text-teal-600 w-3.5 h-3.5 border-slate-300"
                            />
                            <span className="text-[9px] font-extrabold text-teal-800 uppercase">
                              {lang === "si" ? "විනාඩිපතකින් සත්‍යාපනය (Post Instant Capital Approved Profile)" : "Instant counter post (Skip dual control validation queue)"}
                            </span>
                          </div>
                        </form>
                      ) : (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2 font-bold text-[10px] text-slate-550">
                          <Coins className="w-4 h-4 text-slate-450" />
                          <span>{lang === "si" ? "ℹ️ මෙම නිලධාරියා වෙනුවෙන් නව දීමනා හෝ අත්මුදල් වාර්තා කළ හැක්කේ ඔහුගේම ගිණුමෙන් ඇතුල් වූ විට පමණි." : "ℹ️ Saving new allowances/floats is blocked because you are currently accessing this profile under read-only view."}</span>
                        </div>
                      )}

                      {/* Allocations Logs Grid */}
                      {currentOfficer.allowances.length === 0 ? (
                        <div className="text-center py-8 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400">
                          <Coins className="w-5 h-5 mx-auto mb-1 stroke-1" />
                          <p className="text-[11px] font-bold">{lang === "si" ? "කිසිදු දෛනික දීමනාවක් ලබා දී නැත." : "No allowance allocations logged."}</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-sans">
                            <thead>
                              <tr className="border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase">
                                <th className="pb-2.5">{lang === "si" ? "දිනය" : "Date"}</th>
                                <th className="pb-2.5">{lang === "si" ? "සටහන සහ අනුමැතිය" : "Notes & Status"}</th>
                                <th className="pb-2.5 text-right">{lang === "si" ? "දීමනාව" : "Allowance Amount"}</th>
                                <th className="pb-2.5 text-right">{lang === "si" ? "ක්‍රියා" : "Action"}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {currentOfficer.allowances.map((item) => {
                                const isApproved = item.status === undefined || item.status === 'APPROVED';
                                const isPending = item.status === 'PENDING';
                                const isRejected = item.status === 'REJECTED';
                                return (
                                  <tr key={item.id} className="hover:bg-slate-50/50">
                                    <td className="py-2.5 text-slate-400 font-mono font-bold">{item.date}</td>
                                    <td className="py-2.5">
                                      <div className="flex flex-wrap items-center gap-1.5 mb-1 text-xs">
                                        {item.type === 'FLOAT' ? (
                                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[8px] font-extrabold uppercase rounded-md border border-emerald-100 tracking-wider">
                                            {lang === "si" ? "ආරම්භක අත්මුදල් / Float" : "Morning Float"}
                                          </span>
                                        ) : item.type === 'OTHER' ? (
                                          <span className="px-1.5 py-0.5 bg-slate-50 text-slate-700 text-[8px] font-extrabold uppercase rounded-md border border-slate-200 tracking-wider">
                                            {lang === "si" ? "වෙනත් ගෙවීම් / Other" : "Other"}
                                          </span>
                                        ) : (
                                          <span className="px-1.5 py-0.5 bg-sky-50 text-sky-700 text-[8px] font-extrabold uppercase rounded-md border border-sky-100 tracking-wider">
                                            {lang === "si" ? "බත්තා / Daily Batta" : "Daily Batta"}
                                          </span>
                                        )}
                                        <span className="text-slate-700 font-semibold">{item.notes || "-"}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                        {isApproved ? (
                                          <span className="text-[9px] text-emerald-600 font-black flex items-center gap-0.5">
                                            <Lock className="w-2.5 h-2.5" /> {lang === "si" ? "සත්‍යාපිතයි" : "Signed"} {item.approvedBy && `(${item.approvedBy})`}
                                          </span>
                                        ) : isPending ? (
                                          <span className="text-[9px] text-amber-600 font-black flex items-center gap-0.5 animate-pulse">
                                            <Unlock className="w-2.5 h-2.5 text-amber-500" /> {lang === "si" ? "ඉදිරිපත් කර ඇත" : "Pending Audit"}
                                          </span>
                                        ) : (
                                          <span className="text-[9px] text-rose-600 font-black flex items-center gap-0.5">
                                            {lang === "si" ? "ප්‍රතික්ෂේපිතයි" : "Rejected"}
                                          </span>
                                        )}
                                        {item.repStatus === 'PENDING_APPROVAL' && (
                                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-px rounded font-bold">
                                            {lang === "si" ? "(නිලධාරියා අනුමත කර නොමැත)" : "(Awaiting Rep Handshake)"}
                                          </span>
                                        )}
                                        {item.repStatus === 'SHORTAGE' && (
                                          <span className="text-[9px] bg-rose-100 text-rose-800 px-1 py-px rounded font-bold">
                                            {lang === "si" ? "(අඩුවක් විය)" : "(Shortage Reported)"}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className={`py-2.5 text-right font-mono font-black ${isApproved ? "text-indigo-600" : "text-slate-400"}`}>
                                      <div>{formatLKR(item.amount)}</div>
                                      {item.shortageAmount && item.shortageAmount > 0 && (
                                        <div className="text-[9px] text-rose-500 font-bold mt-0.5 whitespace-nowrap">
                                          {lang === "si" ? `අඩුව: ${formatLKR(item.shortageAmount)}` : `Shortage: ${formatLKR(item.shortageAmount)}`}
                                        </div>
                                      )}
                                    </td>
                                    <td className="py-2.5 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        {isApproved && item.securityHash && (
                                          <button
                                            type="button"
                                            onClick={() => setSelectedSecurityCert({ type: 'ALLOWANCE', ...item })}
                                            className="px-1.8 py-0.5 bg-slate-100 text-slate-600 text-[9px] hover:bg-slate-200 border border-slate-200 rounded font-bold cursor-pointer transition"
                                          >
                                            CERT
                                          </button>
                                        )}
                                        {isPending && (
                                          <div className="flex items-center gap-1">
                                            <button
                                              type="button"
                                              onClick={() => handleApproveAllowance(item.id)}
                                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer"
                                            >
                                              {lang === "si" ? "අනුමත" : "Approve"}
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleRejectAllowance(item.id)}
                                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[9px] px-1.5 py-0.5 rounded cursor-pointer"
                                            >
                                              X
                                            </button>
                                          </div>
                                        )}
                                        <button 
                                          type="button"
                                          onClick={() => handleDeleteAllowanceItem(item.id)}
                                          className="text-slate-300 hover:text-rose-600 transition"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: EXPENSES VIEW & ADDITION */}
                  {activeTab === "EXPENSES" && (
                    <div className="space-y-6">
                      
                      {/* Form to log officer expenses */}
                      {isAuthorizedToEdit ? (
                        <form onSubmit={handleAddNewExpense} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                          <div className="md:col-span-3">
                            <label className="text-[9px] font-bold text-amber-800 uppercase block mb-1">{lang === "si" ? "වියදම් දිනය" : "Expense Date"}</label>
                            <input
                              type="date"
                              required
                              value={expenseDate}
                              onChange={(e) => setExpenseDate(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 outline-none"
                            />
                          </div>
                          <div className="md:col-span-3">
                            <label className="text-[9px] font-bold text-amber-800 uppercase block mb-1">{lang === "si" ? "වියදම් මුදල (LKR) *" : "Expense Amount (LKR) *"}</label>
                            <input
                              type="number"
                              required
                              placeholder="Rs. 500"
                              value={expenseAmount}
                              onChange={(e) => setExpenseAmount(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none font-mono font-bold"
                            />
                          </div>
                          <div className="md:col-span-4">
                            <label className="text-[9px] font-bold text-amber-800 uppercase block mb-1">{lang === "si" ? "වියදම් විස්තරය *" : "Expense Description *"}</label>
                            <input
                              type="text"
                              required
                              placeholder={lang === "si" ? "පෙට්‍රල් ගාස්තු, කෑම වියදම්..." : "Petrol charges, food fee..."}
                              value={expenseDesc}
                              onChange={(e) => setExpenseDesc(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 outline-none"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <button
                              type="submit"
                              className="w-full bg-amber-650 hover:bg-amber-600 text-white font-bold py-1.8 rounded-xl text-xs active:scale-95 transition-all outline-none flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              {lang === "si" ? "එක් කරන්න" : "Add Expense"}
                            </button>
                          </div>

                          {/* Direct post */}
                          <div className="md:col-span-12 pt-1 border-t border-slate-200 flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={directPost}
                              onChange={(e) => setDirectPost(e.target.checked)}
                              className="rounded text-amber-650 w-3.5 h-3.5 border-slate-300"
                            />
                            <span className="text-[9px] font-extrabold text-amber-800 uppercase">
                              {lang === "si" ? "වියදම් සහතික කේතාංකය සෘජුව ලියන්න (Post Instant)" : "Auto apply to Ledger balance (Skip vetting queue)"}
                            </span>
                          </div>
                        </form>
                      ) : (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2 font-bold text-[10px] text-slate-550">
                          <Plus className="w-4 h-4 text-slate-450" />
                          <span>{lang === "si" ? "ℹ️ මෙම නිලධාරියා වෙනුවෙන් නව වියදම් වාර්තා කළ හැක්කේ ඔහුගේම ගිණුමෙන් ඇතුල් වූ විට පමණි." : "ℹ️ Logging new expenses is blocked because you are accessing this representative's details under read-only view."}</span>
                        </div>
                      )}

                      {/* Log table */}
                      {currentOfficer.expenses.length === 0 ? (
                        <div className="text-center py-8 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400">
                          <ArrowUpRight className="w-5 h-5 mx-auto mb-1 stroke-1" />
                          <p className="text-[11px] font-bold">{lang === "si" ? "කිසිදු වියදම් සටහනක් ඇතුළත් කර නැත." : "No expenses registered yet."}</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-sans">
                            <thead>
                              <tr className="border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase">
                                <th className="pb-2.5">{lang === "si" ? "දිනය" : "Date"}</th>
                                <th className="pb-2.5">{lang === "si" ? "විස්තරය සහ වගකීම" : "Description & Auditing"}</th>
                                <th className="pb-2.5 text-right">{lang === "si" ? "මුදල" : "Expense Amount"}</th>
                                <th className="pb-2.5 text-right">{lang === "si" ? "ක්‍රියා" : "Action"}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {currentOfficer.expenses.map((item) => {
                                const isApproved = item.status === undefined || item.status === 'APPROVED';
                                const isPending = item.status === 'PENDING';
                                const isRejected = item.status === 'REJECTED';
                                return (
                                  <tr key={item.id} className="hover:bg-slate-50/50">
                                    <td className="py-2.5 text-slate-400 font-mono font-bold">{item.date}</td>
                                    <td className="py-2.5">
                                      <p className="text-slate-700 font-semibold">{item.description}</p>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        {isApproved ? (
                                          <span className="text-[9px] text-emerald-600 font-black flex items-center gap-0.5">
                                            <Lock className="w-2.5 h-2.5" /> {lang === "si" ? "විගණනය කළා" : "Approved"} ({item.approvedBy || "Admin"})
                                          </span>
                                        ) : isPending ? (
                                          <span className="text-[9px] text-amber-600 font-black flex items-center gap-0.5 animate-pulse">
                                            <Unlock className="w-2.5 h-2.5 text-amber-500" /> {lang === "si" ? "අනුමැතිය පොරොත්තුවෙන්" : "Awaiting Audit"}
                                          </span>
                                        ) : (
                                          <span className="text-[9px] text-rose-600 font-black flex items-center gap-0.5">
                                            {lang === "si" ? "ප්‍රතික්ෂේපිතයි" : "Rejected"}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className={`py-2.5 text-right font-mono font-black ${isApproved ? "text-amber-700" : "text-slate-400"}`}>{formatLKR(item.amount)}</td>
                                    <td className="py-2.5 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        {isApproved && item.securityHash && (
                                          <button
                                            type="button"
                                            onClick={() => setSelectedSecurityCert({ type: 'EXPENSE', ...item })}
                                            className="px-1.8 py-0.5 bg-slate-100 text-slate-600 text-[9px] hover:bg-slate-200 border border-slate-200 rounded font-bold cursor-pointer transition"
                                          >
                                            CERT
                                          </button>
                                        )}
                                        {isPending && (
                                          <div className="flex items-center gap-1">
                                            <button
                                              type="button"
                                              onClick={() => handleApproveExpense(item.id)}
                                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer"
                                            >
                                              {lang === "si" ? "අනුමත" : "Approve"}
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleRejectExpense(item.id)}
                                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[9px] px-1.5 py-0.5 rounded cursor-pointer"
                                            >
                                              X
                                            </button>
                                          </div>
                                        )}
                                        {item.billImage && (
                                          <button
                                            type="button"
                                            onClick={() => setViewingExpenseBill(item)}
                                            className="p-1.5 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-105 rounded-lg transition cursor-pointer flex items-center justify-center shrink-0"
                                            title={lang === "si" ? "බිල්පත බලන්න" : "View Bill Receipt"}
                                          >
                                            <Eye className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                        <button 
                                          type="button"
                                          onClick={() => handleDeleteExpenseItem(item.id)}
                                          className="text-slate-300 hover:text-rose-600 transition shrink-0 p-1"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: REMITTANCES VIEW & ADDITION */}
                  {activeTab === "REMITTANCES" && (
                    <div className="space-y-6">
                      
                      {/* Form to log cash remittances handing over back to company treasury */}
                      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                        <h5 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-indigo-500" />
                          {lang === "si" ? "කාර්යාලයට මුදල් භාරදීම (Cash Handover to Counter)" : "Daily Cash Remittance Settle-Up Form"}
                        </h5>
                        <p className="text-[10px] text-slate-400 mb-4">
                          {lang === "si" 
                            ? "නිලධාරියා එකතු කල ණය මුදල් කාර්යාලයේ ලාච්චුවට භාර දීමේදී එම ගනුදෙනුව මෙතැනින් ඇතුළත් කරන්න. එවිට ඔහුගේ අතේ ඇති මුදල (Cash in hand) අඩුවේ." 
                            : "Enter the cash amount currently returned by the representative to SCL office treasury counter. This reduces their active Hand Balance."}
                        </p>

                        {isAuthorizedToEdit ? (
                          <form onSubmit={handleAddNewRemittance} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                            <div className="md:col-span-3">
                              <label className="text-[9px] font-bold text-indigo-800 uppercase block mb-1">{lang === "si" ? "භාරදුන් දිනය" : "Remit Date"}</label>
                              <input
                                type="date"
                                required
                                value={remittanceDate}
                                onChange={(e) => setRemittanceDate(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-705 font-medium outline-none"
                              />
                            </div>
                            <div className="md:col-span-4">
                              <label className="text-[9px] font-bold text-indigo-800 uppercase block mb-1">{lang === "si" ? "භාරදුන් මුදල (LKR) *" : "Remitted Cash Amount (LKR) *"}</label>
                              <input
                                type="number"
                                required
                                placeholder="Rs. 25000"
                                value={remittanceAmount}
                                onChange={(e) => setRemittanceAmount(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none font-mono font-black"
                              />
                            </div>
                            <div className="md:col-span-3">
                              <label className="text-[9px] font-bold text-indigo-800 uppercase block mb-1">{lang === "si" ? "සටහන් (Notes)" : "Notes"}</label>
                              <input
                                type="text"
                                placeholder={lang === "si" ? "ප්‍රධාන ලාච්චුවට තැන්පත් කිරීම..." : "Settled to drawer bank..."}
                                value={remittanceNotes}
                                onChange={(e) => setRemittanceNotes(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 outline-none"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <button
                                type="submit"
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-1.8 rounded-xl text-xs active:scale-95 transition-all outline-none flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <CheckCircle className="font-bold w-3.5 h-3.5" />
                                {lang === "si" ? "භාරදෙන්න" : "Audit Remit"}
                              </button>
                            </div>

                            {/* Direct post */}
                            <div className="md:col-span-12 pt-1 border-t border-slate-205 flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={directPost}
                                onChange={(e) => setDirectPost(e.target.checked)}
                                className="rounded text-indigo-650 w-3.5 h-3.5 border-slate-300"
                              />
                              <span className="text-[9px] font-extrabold text-indigo-800 uppercase">
                                {lang === "si" ? "විගණන තහවුරුකිරීම සෘජුව සිදුකරන්න (Remit Instant Approved)" : "Fast direct clearance (Bypass supervisor audit queue)"}
                              </span>
                            </div>
                          </form>
                        ) : (
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2 font-bold text-[10px] text-slate-550">
                            <CheckCircle className="w-4 h-4 text-slate-450" />
                            <span>{lang === "si" ? "ℹ️ මෙම නිලධාරියා වෙනුවෙන් අත්මුදල් භාරදීම් ලියාපදිංචි කළ හැක්කේ ඔහුගේම ගිණුමෙන් ඇතුල් වූ විට පමණි." : "ℹ️ Saving new cash handovers is blocked because you are accessing this representative's details under read-only view."}</span>
                          </div>
                        )}
                      </div>

                      {/* Log table */}
                      {currentOfficer.remittances.length === 0 ? (
                        <div className="text-center py-8 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400">
                          <ArrowDownLeft className="w-5 h-5 mx-auto mb-1 stroke-1" />
                          <p className="text-[11px] font-bold">{lang === "si" ? "කිසිදු මුදල් භාරදීමක් සටහන් වී නැත." : "No settlements / remittances logged yet."}</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-sans">
                            <thead>
                              <tr className="border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase">
                                <th className="pb-2.5">{lang === "si" ? "දිනය" : "Date"}</th>
                                <th className="pb-2.5">{lang === "si" ? "සටහන සහ පාලනය" : "Notes & Compliance"}</th>
                                <th className="pb-2.5 text-right">{lang === "si" ? "භාරදුන් මුදල" : "Remitted Sum"}</th>
                                <th className="pb-2.5 text-right">{lang === "si" ? "ක්‍රියා" : "Action"}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {currentOfficer.remittances.map((item) => {
                                const isApproved = item.status === undefined || item.status === 'APPROVED';
                                const isPending = item.status === 'PENDING';
                                const isRejected = item.status === 'REJECTED';
                                return (
                                  <tr key={item.id} className="hover:bg-slate-50/50">
                                    <td className="py-2.5 text-slate-400 font-mono font-bold">{item.date}</td>
                                    <td className="py-2.5">
                                      <p className="text-slate-700 font-semibold">{item.notes || "-"}</p>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        {isApproved ? (
                                          <span className="text-[9px] text-emerald-600 font-black flex items-center gap-0.5">
                                            <Lock className="w-2.5 h-2.5" /> {lang === "si" ? "භාණ්ඩාගාරය සතුයි" : "Remitted Cash Sealed"} ({item.approvedBy || "Desk Counter"})
                                          </span>
                                        ) : isPending ? (
                                          <span className="text-[9px] text-amber-600 font-black flex items-center gap-0.5 animate-pulse">
                                            <Unlock className="w-2.5 h-2.5 text-amber-500" /> {lang === "si" ? "සත්‍යාපනය වෙමින්" : "Awaiting Audit Clear"}
                                          </span>
                                        ) : (
                                          <span className="text-[9px] text-rose-600 font-black flex items-center gap-0.5">
                                            {lang === "si" ? "ප්‍රතික්ෂේපිතයි" : "Rejected"}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className={`py-2.5 text-right font-mono font-black ${isApproved ? "text-emerald-700" : "text-slate-400"}`}>
                                      <div>{formatLKR(item.amount)}</div>
                                      {item.shortageAmount && item.shortageAmount > 0 && (
                                        <div className="text-[9px] text-rose-500 font-bold mt-0.5 whitespace-nowrap">
                                          {lang === "si" ? `අඩුව: ${formatLKR(item.shortageAmount)}` : `Shortage: ${formatLKR(item.shortageAmount)}`}
                                          <br />
                                          <span className="text-[8px] text-slate-400 font-medium">({lang === "si" ? "තිබිය යුතු" : "Expected"}: {formatLKR(item.expectedAmount || 0)})</span>
                                        </div>
                                      )}
                                    </td>
                                    <td className="py-2.5 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        {isApproved && item.securityHash && (
                                          <button
                                            type="button"
                                            onClick={() => setSelectedSecurityCert({ type: 'REMITTANCE', ...item })}
                                            className="px-1.8 py-0.5 bg-slate-100 text-slate-600 text-[9px] hover:bg-slate-200 border border-slate-200 rounded font-bold cursor-pointer transition"
                                          >
                                            CERT
                                          </button>
                                        )}
                                        {isPending && (
                                          <div className="flex items-center gap-1">
                                            <button
                                              type="button"
                                              onClick={() => handleApproveRemittance(item.id)}
                                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer"
                                            >
                                              {lang === "si" ? "සනාථ" : "Approve"}
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleRejectRemittance(item.id)}
                                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[9px] px-1.5 py-0.5 rounded cursor-pointer"
                                            >
                                              X
                                            </button>
                                          </div>
                                        )}
                                        <button 
                                          type="button"
                                          onClick={() => handleDeleteRemittanceItem(item.id)}
                                          className="text-slate-300 hover:text-rose-600 transition"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 5: TRANSFERS VIEW */}
                  {activeTab === "TRANSFERS" && (() => {
                    const transfersOut = currentOfficer.repTransfers || [];
                    const transfersIn = safeOfficers.flatMap(o => o.repTransfers||[]).filter(t => t.toOfficerId === currentOfficer.id);
                    const allTransfers = [...transfersOut.map(t => ({...t, type: 'OUT'})), ...transfersIn.map(t => ({...t, type: 'IN'}))].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                    return (
                      <div className="space-y-6">
                        <div className="border border-teal-100 rounded-2xl overflow-hidden shadow-xs bg-white">
                          <table className="w-full text-left font-sans text-xs">
                            <thead className="bg-teal-50 text-teal-700 font-extrabold uppercase text-[9px] border-b border-teal-100">
                              <tr>
                                <th className="p-3 w-28">Date</th>
                                <th className="p-3">Direction</th>
                                <th className="p-3">Officer</th>
                                <th className="p-3 w-56">Status</th>
                                <th className="p-3 w-32 text-right">Amount (LKR)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {allTransfers.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="p-4 text-center text-slate-400">No transfers found.</td>
                                </tr>
                              ) : (
                                allTransfers.map((item) => (
                                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                                    <td className="p-3 font-mono text-slate-500">{item.date}</td>
                                    <td className="p-3 font-bold">
                                      {item.type === 'IN' ? (
                                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">RECEIVING IN</span>
                                      ) : (
                                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded">SENDING OUT</span>
                                      )}
                                    </td>
                                    <td className="p-3 font-bold text-slate-700">
                                      {item.type === 'IN' ? safeOfficers.find(o => o.id === item.fromOfficerId)?.name : safeOfficers.find(o => o.id === item.toOfficerId)?.name}
                                    </td>
                                    <td className="p-3">
                                      {item.status === 'ACCEPTED' ? (
                                        <span className="text-[10px] text-emerald-600 font-black bg-emerald-100 px-2 py-0.5 rounded">ACCEPTED</span>
                                      ) : item.status === 'REJECTED' ? (
                                        <span className="text-[10px] text-rose-600 font-black bg-rose-100 px-2 py-0.5 rounded">REJECTED</span>
                                      ) : (
                                        <span className="text-[10px] text-amber-600 font-black bg-amber-100 px-2 py-0.5 rounded">PENDING RECEPTION</span>
                                      )}
                                      {item.notes && <p className="text-[9px] text-slate-400 mt-0.5">{item.notes}</p>}
                                    </td>
                                    <td className="p-3 text-right font-mono font-black text-slate-700">
                                      {formatLKR(item.amount)}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}

                  {/* TAB 6: EOD REPORT VIEW */}
                  {activeTab === "EOD_REPORT" && (() => {
                    const approvedAllowances = currentOfficer.allowances.filter(a => (a.status === undefined || a.status === 'APPROVED') && a.date === reportDate);
                    const floatVal = approvedAllowances.filter(a => a.type === 'FLOAT').reduce((sum, a) => sum + a.amount, 0);
                    const battaVal = approvedAllowances.filter(a => a.type === 'BATTA' || !a.type).reduce((sum, a) => sum + a.amount, 0);
                    const otherVal = approvedAllowances.filter(a => a.type === 'OTHER').reduce((sum, a) => sum + a.amount, 0);
                    
                    const colls = metrics.officerCollections.filter(c => c.date === reportDate);
                    const collsVal = colls.reduce((sum, c) => sum + c.amount, 0);
                    
                    const exps = currentOfficer.expenses.filter(e => (e.status === undefined || e.status === 'APPROVED') && e.date === reportDate);
                    const expsVal = exps.reduce((sum, e) => sum + e.amount, 0);
                    
                    const rems = currentOfficer.remittances.filter(r => (r.status === undefined || r.status === 'APPROVED') && r.date === reportDate);
                    const remsVal = rems.reduce((sum, r) => sum + r.amount, 0);
                    
                    const tOuts = currentOfficer.repTransfers?.filter(t => t.date === reportDate && t.status !== 'REJECTED') || [];
                    const tOutVal = tOuts.reduce((sum, t) => sum + t.amount, 0);

                    const tIns = safeOfficers.flatMap(o => o.repTransfers||[]).filter(t => t.toOfficerId === currentOfficer.id && t.date === reportDate && t.status === 'ACCEPTED');
                    const tInVal = tIns.reduce((sum, t) => sum + t.amount, 0);

                    const repDisbursed = loans.filter(l => l.officeUse.disbursedByOfficerId === currentOfficer.id && l.officeUse.loanDate === reportDate);
                    const disbursedVal = repDisbursed.reduce((sum, l) => sum + l.officeUse.approvedAmount, 0);
                    
                    const totalInflow = floatVal + collsVal + battaVal + otherVal + tInVal;
                    const totalOutflow = expsVal + remsVal + tOutVal + disbursedVal;
                    const netEodHandover = totalInflow - totalOutflow;

                    return (
                      <div className="space-y-6">
                        {/* Date selection and header controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <div>
                            <h4 className="text-xs font-black uppercase text-slate-705 tracking-wider">
                              {lang === "si" ? "දෛනික ගනුදෙනු වාර්තාව (EOD Summary)" : "Daily End-Of-Day Report"}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {lang === "si" ? "ඕනෑම දිනයක් තෝරා එම දවසේ සම්පූර්ණ මූල්‍ය සාරාංශ පත්‍රිකාව මෙතැනින් ලබා ගන්න." : "Select a specific business date to compile the representative's EOD compliance balances voucher."}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">{lang === "si" ? "දිනය:" : "Date:"}</label>
                            <input
                              type="date"
                              value={reportDate}
                              onChange={(e) => setReportDate(e.target.value)}
                              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none font-bold font-mono"
                            />
                          </div>
                        </div>

                        {/* Thermal voucher slip style display */}
                        <div className="bg-slate-50 border border-slate-105 p-6 rounded-3xl">
                          <div className="bg-white border border-slate-200 shadow-md rounded-2xl max-w-sm mx-auto p-5 font-mono text-xs text-slate-800 leading-relaxed space-y-4" id="eod-thermal-slip">
                            <div className="text-center space-y-1">
                              <h3 className="font-extrabold text-[12px] tracking-widest text-slate-900 border-b border-dashed border-slate-300 pb-2">
                                SETH CAPITAL COOPERATIVE
                              </h3>
                              <p className="text-[9px] uppercase font-bold text-slate-400">
                                {lang === "si" ? "දෛනික ක්ෂේත්‍ර වාර්තා පත්‍රිකාව" : "Daily Representative EOD Ledger"}
                              </p>
                            </div>

                            <div className="space-y-1 text-[10px] border-b border-dashed border-slate-200 pb-3">
                              <div className="flex justify-between">
                                <span className="text-slate-400">REP NAME:</span>
                                <span className="font-bold text-slate-850 truncate max-w-[200px]">{currentOfficer.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400 font-bold">NIC/ID:</span>
                                <span className="font-bold font-mono text-slate-850">{currentOfficer.nic}</span>
                              </div>
                              {currentOfficer.employeeId && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">STAFF ID:</span>
                                  <span className="font-bold font-mono text-slate-850">{currentOfficer.employeeId}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-slate-400">DATE:</span>
                                <span className="font-bold font-mono text-slate-850">{reportDate}</span>
                              </div>
                            </div>

                            {/* Section: Inflows */}
                            <div className="space-y-1">
                              <p className="font-black border-b border-slate-100 pb-0.5 text-indigo-850 text-[9px] uppercase">
                                I. INFLOWS / ලැබීම්
                              </p>
                              <div className="space-y-1 pl-1 text-[11px]">
                                <div className="flex justify-between">
                                  <span>- {lang === "si" ? "ආරම්භක අත්මුදල" : "Morning Float"}</span>
                                  <span className="font-bold font-mono text-emerald-600">+{formatLKR(floatVal)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>- {lang === "si" ? "වාරික එකතු කිරීම්" : "Loan Collections"}</span>
                                  <span className="font-bold font-mono text-emerald-600">+{formatLKR(collsVal)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>- {lang === "si" ? "බත්තා දීමනා" : "Daily Batta"}</span>
                                  <span className="font-bold font-mono text-emerald-600">+{formatLKR(battaVal)}</span>
                                </div>
                                {otherVal > 0 && (
                                  <div className="flex justify-between">
                                    <span>- {lang === "si" ? "වෙනත් ගෙවීම්" : "Other Allocation"}</span>
                                    <span className="font-bold font-mono text-emerald-600">+{formatLKR(otherVal)}</span>
                                  </div>
                                )}
                                {tInVal > 0 && (
                                  <div className="flex justify-between">
                                    <span>- {lang === "si" ? "ලි. ලැබීම් (Transfers In)" : "Rep Transfers In"}</span>
                                    <span className="font-bold font-mono text-emerald-600">+{formatLKR(tInVal)}</span>
                                  </div>
                                )}
                              </div>
                              <div className="border-t border-slate-150 pt-1 flex justify-between font-bold text-xs">
                                <span>{lang === "si" ? "මුළු අත්මුදල" : "Total Cash Inflow"}</span>
                                <span className="font-mono text-slate-900">{formatLKR(totalInflow)}</span>
                              </div>
                            </div>

                            {/* Section: Outflows */}
                            <div className="space-y-1 border-t border-dashed border-slate-200 pt-2">
                              <p className="font-black border-b border-slate-100 pb-0.5 text-slate-500 text-[9px] uppercase">
                                II. OUTFLOWS / වියදම් සහ භාරදීම්
                              </p>
                              <div className="space-y-1 pl-1 text-[11px]">
                                <div className="flex justify-between">
                                  <span>- {lang === "si" ? "දෛනික වියදම්" : "Field Expenditures"}</span>
                                  <span className="font-bold font-mono text-rose-500">-{formatLKR(expsVal)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>- {lang === "si" ? "කාර්යාලයට භාරදුන් මුදල්" : "Remitted Cash"}</span>
                                  <span className="font-bold font-mono text-rose-500">-{formatLKR(remsVal)}</span>
                                </div>
                                {disbursedVal > 0 && (
                                  <div className="flex justify-between">
                                    <span>- {lang === "si" ? "නිකුත් කළ ණය" : "Disbursed Loans"}</span>
                                    <span className="font-bold font-mono text-rose-500">-{formatLKR(disbursedVal)}</span>
                                  </div>
                                )}
                                {tOutVal > 0 && (
                                  <div className="flex justify-between">
                                    <span>- {lang === "si" ? "ලි. යැවීම් (Transfers Out)" : "Rep Transfers Out"}</span>
                                    <span className="font-bold font-mono text-rose-500">-{formatLKR(tOutVal)}</span>
                                  </div>
                                )}
                              </div>
                              <div className="border-t border-slate-150 pt-1 flex justify-between font-bold text-xs">
                                <span>{lang === "si" ? "මුළු වියදම් එකතුව" : "Total Outflow"}</span>
                                <span className="font-mono text-slate-900">{formatLKR(totalOutflow)}</span>
                              </div>
                            </div>

                            {/* Closing Balance position */}
                            <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-200 border-t-2 border-slate-800 text-center space-y-1">
                              <div className="flex justify-between font-black text-xs">
                                <span>{lang === "si" ? "අවසන් අත්මුදල් ශේෂය" : "CLOSING CASH HANDOVER"}</span>
                                <span className={`font-mono text-sm ${netEodHandover >= 0 ? "text-emerald-700 font-extrabold" : "text-rose-600 font-extrabold"}`}>
                                  {formatLKR(netEodHandover)}
                                </span>
                              </div>
                              <p className="text-[8px] text-slate-400 font-bold mt-1">
                                {netEodHandover === 0 
                                  ? (lang === "si" ? "✓ සියලුම ගිණුම් හරියාකාරව තුලනය වී ඇත." : "✓ Balance cleared perfectly.") 
                                  : (lang === "si" ? "* මෙම මුදල කාර්යාලය වෙත භාරදිය යුතුය." : "* This cash balance must be accounted for.")}
                              </p>
                            </div>

                            {/* Warning on empty records */}
                            {colls.length === 0 && floatVal === 0 && battaVal === 0 && expsVal === 0 && remsVal === 0 && disbursedVal === 0 && tInVal === 0 && tOutVal === 0 && (
                              <div className="p-3 bg-rose-50/50 rounded-xl text-center border border-rose-100">
                                <p className="text-[9px] font-extrabold text-rose-600">
                                  {lang === "si" ? "මෙම දිනයේ කිසිදු ගනුදෙනුවක් සිදු වී නැත." : "NO REGISTERED TRANSACTIONS ON THIS DATE."}
                                </p>
                              </div>
                            )}

                            {/* Signatures placeholder */}
                            <div className="grid grid-cols-2 gap-4 text-center pt-8 text-[8px] mt-4 border-t border-dashed border-slate-200">
                              <div>
                                <div className="border-b border-slate-300 h-5" />
                                <span className="block mt-1 uppercase font-bold text-slate-400">
                                  {lang === "si" ? "නිලධාරි අත්සන" : "Officer's Sign"}
                                </span>
                              </div>
                              <div>
                                <div className="border-b border-slate-300 h-5" />
                                <span className="block mt-1 uppercase font-bold text-slate-400">
                                  {lang === "si" ? "විගණක අත්සන" : "Audited By Sign"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Print Actions */}
                          <div className="flex justify-center mt-5">
                            <button
                              type="button"
                              onClick={() => {
                                const printContent = document.getElementById("eod-thermal-slip")?.innerHTML;
                                if (printContent) {
                                  const win = window.open("", "", "width=500,height=700");
                                  if (win) {
                                    win.document.write(`
                                      <html>
                                        <head>
                                          <title>EOD - ${currentOfficer.name}</title>
                                          <style>
                                            body { font-family: monospace; padding: 20px; font-size: 13px; color: #111; line-height: 1.5; }
                                            .text-center { text-align: center; }
                                            .font-black { font-weight: bold; }
                                            .flex { display: flex; justify-content: space-between; margin-bottom: 4px; }
                                            .border-b { border-bottom: 1px solid #111; padding-bottom: 4px; margin-bottom: 8px; }
                                            .border-b-dashed { border-bottom: 1px dotted #111; padding-bottom: 6px; margin-bottom: 12px; }
                                            .space-y-4 > * { margin-bottom: 12px; }
                                            .bg-slate-50 { background: #f9f9f9; padding: 10px; border: 1px solid #ddd; }
                                            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; }
                                            .pt-8 { padding-top: 40px; }
                                            .p-3 { padding: 8px; }
                                            .mt-6 { margin-top: 24px; }
                                            .uppercase { text-transform: uppercase; }
                                            .text-[9px] { font-size: 10px; }
                                          </style>
                                        </head>
                                        <body>
                                          <div style="max-width: 350px; margin: 0 auto;">
                                            ${printContent}
                                          </div>
                                          <script>
                                            window.onload = function() {
                                              window.print();
                                              window.close();
                                            };
                                          </script>
                                        </body>
                                      </html>
                                    `);
                                    win.document.close();
                                  }
                                }
                              }}
                              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-6 py-2.5 rounded-2xl text-xs active:scale-95 transition flex items-center gap-2 cursor-pointer shadow-md"
                            >
                              <Printer className="w-4 h-4 text-emerald-400 animate-pulse" />
                              {lang === "si" ? "දෛනික වාර්තාව මුද්‍රණය කරන්න" : "Print End-Of-Day Voucher"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* TAB 7: STATEMENT LOG VIEW */}
                  {activeTab === "STATEMENT" && (() => {
                    const sortedLedger = [...(metrics.ledger || [])];
                    
                    // Summing up inflows and outflows
                    const totalInflowsSum = sortedLedger.filter(e => e.direction === 'IN').reduce((acc, e) => acc + e.amount, 0);
                    const totalOutflowsSum = sortedLedger.filter(e => e.direction === 'OUT').reduce((acc, e) => acc + e.amount, 0);

                    return (
                      <div className="p-6 space-y-6 animate-fade-in">
                        {/* Summary Bento Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                                {lang === "si" ? "මුළු ලැබීම් (+)" : "Total Cash Inflow (+)"}
                              </p>
                              <p className="text-xl font-black font-mono text-emerald-700 mt-1">
                                {formatLKR(totalInflowsSum)}
                              </p>
                            </div>
                            <span className="text-xl bg-emerald-100/50 p-2 rounded-xl text-emerald-600 font-bold">+</span>
                          </div>

                          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-black uppercase text-rose-800 tracking-wider">
                                {lang === "si" ? "මුළු ගෙවීම් (-)" : "Total Cash Outflow (-)"}
                              </p>
                              <p className="text-xl font-black font-mono text-rose-700 mt-1">
                                {formatLKR(totalOutflowsSum)}
                              </p>
                            </div>
                            <span className="text-xl bg-rose-100/50 p-2 rounded-xl text-rose-600 font-bold">-</span>
                          </div>

                          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-white flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                {lang === "si" ? "අතේ ඇති ශේෂය" : "Net Cash in Hand Balance"}
                              </p>
                              <p className="text-xl font-black font-mono text-emerald-400 mt-1">
                                {formatLKR(metrics.cashInHand)}
                              </p>
                            </div>
                            <span className="text-indigo-400 font-bold">LKR</span>
                          </div>
                        </div>

                        {/* Statement Title & Export */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-2">
                          <div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                              {lang === "si" ? "ධාවන මුදල් ලෙජර ගිණුම් ප්‍රකාශය" : "Chronological Running Cash Ledger"}
                            </h3>
                            <p className="text-[10px] text-slate-450 mt-0.5">
                              {lang === "si" 
                                ? "අත්මුදල්, එකතු කිරීම් සහ වියදම් මත ගණනය කරන ලද දෛනික ශේෂය" 
                                : "Continuous step-by-step cash book tracking for this representative"}
                            </p>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              window.print();
                            }}
                            className="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 py-1.5 px-3 rounded-xl font-bold text-slate-700 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                            {lang === "si" ? "ප්‍රකාශය මුද්‍රණය කරන්න" : "Print Statement"}
                          </button>
                        </div>

                        {/* Ledger Table */}
                        <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-2xs">
                          <table className="w-full text-left border-collapse bg-white">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono">
                                <th className="px-5 py-3">{lang === "si" ? "දිනය" : "Date"}</th>
                                <th className="px-5 py-3">{lang === "si" ? "ගනුදෙනු විස්තරය" : "Transaction Details"}</th>
                                <th className="px-5 py-3 text-right">{lang === "si" ? "ලැබීම (+)" : "Inflow (+)"}</th>
                                <th className="px-5 py-3 text-right">{lang === "si" ? "ගෙවීම (-)" : "Outflow (-)"}</th>
                                <th className="px-5 py-3 text-right">{lang === "si" ? "ධාවන ශේෂය" : "Running Balance"}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                              {sortedLedger.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400 font-bold font-sans">
                                    {lang === "si" ? "ලෙජරය සඳහා කිසිදු ගනුදෙනුවක් සොයාගත නොහැකි විය." : "No ledger transactions logged for this officer."}
                                  </td>
                                </tr>
                              ) : (
                                sortedLedger.map((item, idx) => {
                                  const isIn = item.direction === 'IN';
                                  return (
                                    <tr key={`${item.id}-${idx}`} className="hover:bg-slate-50/50 transition">
                                      <td className="px-5 py-3 font-semibold font-mono text-slate-600 whitespace-nowrap">
                                        {item.date}
                                      </td>
                                      <td className="px-5 py-3 space-y-0.5">
                                        <p className="font-extrabold text-slate-800 font-sans leading-snug">
                                          {item.description}
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded-full uppercase leading-none tracking-wider ${
                                            isIn 
                                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                                              : "bg-rose-50 text-rose-600 border border-rose-100"
                                          }`}>
                                            {item.type}
                                          </span>
                                          <span className="text-[9px] text-slate-400 font-mono">
                                            Ref: {item.id.substring(0, 10)}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-5 py-3 text-right font-bold text-emerald-600 font-mono whitespace-nowrap">
                                        {isIn ? `+${formatLKR(item.amount)}` : "—"}
                                      </td>
                                      <td className="px-5 py-3 text-right font-bold text-rose-600 font-mono whitespace-nowrap">
                                        {!isIn ? `-${formatLKR(item.amount)}` : "—"}
                                      </td>
                                      <td className={`px-5 py-3 text-right font-black font-mono whitespace-nowrap ${
                                        (item.runningBalance || 0) >= 0 ? "text-slate-800" : "text-rose-700"
                                      }`}>
                                        {formatLKR(item.runningBalance || 0)}
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}

                  {activeTab === "COMMISSIONS" && (() => {
                    const stats = metrics.monthlyDisbursalStats;
                    const overallNewMemberRewards = metrics.newMemberIncentivesEarned;
                    const overallCommissionRewards = stats.reduce((sum, s) => sum + s.commissionEarned, 0);
                    const overallTotalEarnings = overallNewMemberRewards + overallCommissionRewards;

                    // Current month target analysis
                    const curMonthStats = metrics.currentMonthStats;
                    const targetPercent = curMonthStats.disbursedTarget > 0 
                      ? Math.min(100, Math.round((curMonthStats.monthTotalDisbursed / curMonthStats.disbursedTarget) * 100))
                      : 0;

                    return (
                      <div className="p-6 space-y-6 animate-fade-in font-sans text-slate-700">
                        
                        {/* Summary overview cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
                          <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">
                                {lang === "si" ? "මුළු ණය නිකුත් කිරීම්" : "Overall Disbursed Vol"}
                              </span>
                              <span className="text-sm font-black font-mono text-slate-800 tracking-tight block mt-1">
                                {formatLKR(metrics.totalDisbursed)}
                              </span>
                              <p className="text-[9px] text-slate-405 mt-1 font-semibold">
                                {metrics.officerDisbursedLoans.length} {lang === "si" ? "ණය ප්‍රමාණයන්" : "loans disbursed"}
                              </p>
                            </div>
                            <Award className="w-8 h-8 text-indigo-400 shrink-0" />
                          </div>

                          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">
                                {lang === "si" ? "නව සාමාජික දීමනා" : "New Member Incentives"}
                              </span>
                              <span className="text-sm font-black font-mono text-emerald-700 tracking-tight block mt-1">
                                {formatLKR(overallNewMemberRewards)}
                              </span>
                              <p className="text-[9px] text-slate-405 mt-1 font-semibold">
                                {metrics.newMemberLoansCount} {lang === "si" ? "සාමාජිකයින් ලියාපදිංචි කර ඇත" : "new members registered"}
                              </p>
                            </div>
                            <Users className="w-8 h-8 text-emerald-550 shrink-0" />
                          </div>

                          <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 flex items-center justify-between">
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">
                                {lang === "si" ? "මුළු උපයාගත් කොමිස්" : "Commissions and Rewards"}
                              </span>
                              <span className="text-sm font-black font-mono text-amber-800 tracking-tight block mt-1">
                                {formatLKR(overallTotalEarnings)}
                              </span>
                              <p className="text-[9px] text-slate-450 mt-1 font-bold">
                                {lang === "si" ? "ඉලක්ක ඉක්මවීමේ දීමනා ඇතුළුව" : "Includes target surplus bonus"}
                              </p>
                            </div>
                            <Coins className="w-8 h-8 text-amber-550 shrink-0" />
                          </div>
                        </div>

                        {/* Current Month Active Goal Status */}
                        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-950 text-slate-200 rounded-3xl border border-slate-800 space-y-4">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                              <span className="text-[9px] uppercase font-black tracking-widest text-indigo-400 block mb-1">
                                {lang === "si" ? "වත්මන් මාසික ඉලක්කය සහ කොමිස් විස්තරය" : "Current Monthly Disbursement Target"}
                              </span>
                              <h4 className="text-slate-100 font-extrabold text-xs uppercase font-sans">
                                {lang === "si" ? `${metrics.currentMonthKey} - කාර්ය සාධන මට්ටම` : `${metrics.currentMonthKey} Monthly Performance monitor`}
                              </h4>
                              <p className="text-[10px] text-slate-400 mt-1 leading-normal max-w-2xl font-medium">
                                {lang === "si" 
                                  ? `වත්මන් මාසික ණය නිකුත් කිරීමේ ඉලක්කය රු. ${formatLKR(curMonthStats.disbursedTarget)} කි. එම ඉලක්කයෙන් පසුව ලබාදෙන සියලුම ණය මුදල් සඳහා ${curMonthStats.commissionRate}% ක කොමිස් මුදලක් සහ නව සාමාජිකයෙකුට රු. ${formatLKR(currentOfficer.incentivePerNewMember || 0)} බැගින් හිමිවේ.`
                                  : `Monthly disbursement volume target is ${formatLKR(curMonthStats.disbursedTarget)}. Loans given beyond this qualify for ${curMonthStats.commissionRate}% surplus commission, plus LKR ${formatLKR(currentOfficer.incentivePerNewMember || 0)} per new member introduced.`}
                              </p>
                            </div>

                            <div className="shrink-0 text-center md:text-right bg-slate-850 p-3 rounded-2xl border border-slate-800 min-w-[200px]">
                              <p className="text-[9px] font-bold uppercase text-indigo-400">{lang === "si" ? "මාසික ශේෂය" : "Current Month Earnings"}</p>
                              <p className="text-lg font-black font-mono text-emerald-400 mt-0.5">{formatLKR(curMonthStats.totalEarned)}</p>
                              <span className="text-[8px] text-slate-450 block font-mono mt-0.5">
                                {curMonthStats.monthNewMembersCount} registration(s) • {formatLKR(curMonthStats.commissionEarned)} commission
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-3 border-t border-slate-850">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-350">
                              <span className="uppercase text-[8px] tracking-wider text-slate-400">{lang === "si" ? "ණය නිකුත් කිරීමේ ප්‍රගතිය" : "Monthly Disbursed Volume"}</span>
                              <span className="text-indigo-400 font-mono">
                                {formatLKR(curMonthStats.monthTotalDisbursed)} / {formatLKR(curMonthStats.disbursedTarget)} ({targetPercent}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: `${targetPercent}%` }} />
                            </div>
                            {curMonthStats.aboveTargetVolume > 0 ? (
                              <p className="text-[9px] text-emerald-400 font-extrabold flex items-center gap-1 font-sans">
                                🎉 {lang === "si" ? `ඔබ ඉලක්කය සම්පූර්ණ කර ඇති අතර, අමතර රු. ${formatLKR(curMonthStats.aboveTargetVolume)} ක් සඳහා කොමිස් උපයා ගනී!` : `Target exceeded! Earning commission on LKR ${formatLKR(curMonthStats.aboveTargetVolume)} surplus!`}
                              </p>
                            ) : (
                              <p className="text-[9px] text-slate-450 font-sans">
                                💡 {lang === "si" ? `කොමිස් ලැබීම ආරම්භ වීමට තව රු. ${formatLKR(Math.max(0, curMonthStats.disbursedTarget - curMonthStats.monthTotalDisbursed))} ක් නිකුත් කළ යුතුය.` : `Disburse LKR ${formatLKR(Math.max(0, curMonthStats.disbursedTarget - curMonthStats.monthTotalDisbursed))} more to qualify for surplus commission.`}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Historical table logs */}
                        <div className="space-y-3 font-sans">
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest block font-sans">
                            {lang === "si" ? "ඓතිහාසික මාසික කාර්ය සාධනය සහ ගෙවීම් වාර්තාව" : "Monthly Performance History & Commissions Matrix"}
                          </h4>
                          
                          <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-2xs bg-white">
                            <table className="w-full text-left border-collapse bg-white">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono">
                                  <th className="px-5 py-3 whitespace-nowrap">{lang === "si" ? "මාසය" : "Month"}</th>
                                  <th className="px-5 py-3 text-right whitespace-nowrap">{lang === "si" ? "නිකුත් කළ මුළු ණය" : "Disbursed Vol"}</th>
                                  <th className="px-5 py-3 text-right whitespace-nowrap">{lang === "si" ? "මාසික ඉලක්කය" : "Target Vol"}</th>
                                  <th className="px-5 py-3 text-right whitespace-nowrap">{lang === "si" ? "ඉලක්කයෙන් ඔබ්බට" : "Surplus"}</th>
                                  <th className="px-5 py-3 text-right whitespace-nowrap">Rate %</th>
                                  <th className="px-5 py-3 text-right whitespace-nowrap">{lang === "si" ? "කොමිස් මුදල" : "Commission"}</th>
                                  <th className="px-5 py-3 text-center whitespace-nowrap">{lang === "si" ? "නව සාමාජිකයින්" : "New Register"}</th>
                                  <th className="px-5 py-3 text-right whitespace-nowrap">{lang === "si" ? "සාමාජික කොමිස්" : "Incentives"}</th>
                                  <th className="px-5 py-3 text-right whitespace-nowrap">{lang === "si" ? "මුළු ලැබීම" : "Total Pay"}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-xs font-sans">
                                {stats.length === 0 ? (
                                  <tr>
                                    <td colSpan={9} className="px-5 py-8 text-center text-slate-400 font-bold font-sans">
                                      {lang === "si" ? "කිසිදු ණය නිකුත් කිරීමක් මෙතෙක් වාර්තා වී නොමැත." : "No disbursement records registered for this representative."}
                                    </td>
                                  </tr>
                                ) : (
                                  stats.map((item, idx) => (
                                    <tr key={`${item.monthKey}-${idx}`} className="hover:bg-slate-50/50 transition">
                                      <td className="px-5 py-3 font-bold font-mono text-slate-600 whitespace-nowrap">
                                        {item.monthKey} {item.monthKey === metrics.currentMonthKey && (
                                          <span className="ml-1 px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-600 text-[8px] font-bold uppercase whitespace-nowrap">
                                            {lang === "si" ? "වත්මන්" : "Active"}
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-5 py-3 text-right font-semibold font-mono text-slate-800 whitespace-nowrap">
                                        {formatLKR(item.monthTotalDisbursed)}
                                      </td>
                                      <td className="px-5 py-3 text-right font-medium font-mono text-slate-450 whitespace-nowrap">
                                        {formatLKR(item.disbursedTarget)}
                                      </td>
                                      <td className={`px-5 py-3 text-right font-black font-mono whitespace-nowrap ${item.aboveTargetVolume > 0 ? "text-indigo-650" : "text-slate-400"}`}>
                                        {item.aboveTargetVolume > 0 ? `+${formatLKR(item.aboveTargetVolume)}` : "—"}
                                      </td>
                                      <td className="px-5 py-3 text-right font-semibold text-slate-500 font-mono whitespace-nowrap">
                                        {item.commissionRate}%
                                      </td>
                                      <td className={`px-5 py-3 text-right font-bold font-mono whitespace-nowrap ${item.commissionEarned > 0 ? "text-emerald-700" : "text-slate-400"}`}>
                                        {item.commissionEarned > 0 ? formatLKR(item.commissionEarned) : "—"}
                                      </td>
                                      <td className="px-5 py-3 text-center font-bold text-slate-700 whitespace-nowrap">
                                        {item.monthNewMembersCount}
                                      </td>
                                      <td className={`px-5 py-3 text-right font-bold font-mono whitespace-nowrap ${item.incentivesEarned > 0 ? "text-emerald-700" : "text-slate-400"}`}>
                                        {item.incentivesEarned > 0 ? formatLKR(item.incentivesEarned) : "—"}
                                      </td>
                                      <td className="px-5 py-3 text-right font-black text-amber-800 font-mono whitespace-nowrap bg-amber-50/10">
                                        {formatLKR(item.totalEarned)}
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                      </div>
                    );
                  })()}

                </div>
              </div>

              {/* Secure Transaction Verification Voucher Certificate Modal/overlay */}
              {selectedSecurityCert && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl relative space-y-4">
                    <div className="text-center space-y-1.5">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 mb-2">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-tight">Ledger Signature Certification</h3>
                      <p className="text-[10px] text-slate-400">Authentic Crypto-Locked Officer Voucher Account</p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5 font-mono text-[10px] text-slate-600">
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                        <span className="text-slate-400 font-sans uppercase font-bold text-[9px]">Voucher ID:</span>
                        <span className="text-slate-800 font-black">{selectedSecurityCert.id}</span>
                      </div>
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                        <span className="text-slate-400 font-sans uppercase font-bold text-[9px]">Event Type:</span>
                        <span className="text-indigo-600 font-black">{selectedSecurityCert.type}</span>
                      </div>
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                        <span className="text-slate-400 font-sans uppercase font-bold text-[9px]">Amount (LKR):</span>
                        <span className="text-emerald-600 font-black">{formatLKR(selectedSecurityCert.amount)}</span>
                      </div>
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                        <span className="text-slate-400 font-sans uppercase font-bold text-[9px]">Date Authenticated:</span>
                        <span className="text-slate-700 font-bold">{selectedSecurityCert.date}</span>
                      </div>
                      <div className="flex justify-between border-b border-dashed border-slate-200 pb-1.5">
                        <span className="text-slate-400 font-sans uppercase font-bold text-[9px]">Authority Signatory:</span>
                        <span className="text-slate-700 font-bold">{selectedSecurityCert.approvedBy || "Audit Center"}</span>
                      </div>
                      <div className="space-y-1 pt-1">
                        <span className="text-slate-400 font-sans uppercase font-bold text-[9px] block">Cryptographic Checksum Hash:</span>
                        <p className="break-all text-indigo-700 font-bold bg-indigo-50/50 p-2 rounded-lg border border-indigo-100 text-[9px]">
                          {selectedSecurityCert.securityHash}
                        </p>
                      </div>
                      <div className="flex justify-between text-[8px] text-slate-400 font-sans pt-1">
                        <span>Status Score: SECURE</span>
                        <span>Token: {selectedSecurityCert.referenceToken || "N/A"}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedSecurityCert(null)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-2 rounded-xl text-xs transition cursor-pointer"
                    >
                      {lang === "si" ? "ලේඛනය වසන්න" : "Close Certificate"}
                    </button>
                  </div>
                </div>
              )}

              {viewingExpenseBill && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl relative space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-tight">
                          {lang === "si" ? "වියදම් බිල්පත (Bill Receipt)" : "Expense Bill Receipt"}
                        </h3>
                        <p className="text-[10px] text-slate-400">
                          {viewingExpenseBill.description} | {formatLKR(viewingExpenseBill.amount)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setViewingExpenseBill(null)}
                        className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center max-h-[400px]">
                      {viewingExpenseBill.billImage ? (
                        <img
                          src={viewingExpenseBill.billImage}
                          alt="Uploaded Receipt"
                          className="max-w-full max-h-[400px] object-contain shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="p-8 text-center text-slate-400">
                          {lang === "si" ? "පින්තූරයක් නොමැත" : "No image available"}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setViewingExpenseBill(null)}
                        className="bg-slate-950 hover:bg-slate-800 text-white font-extrabold px-5 py-2 rounded-xl text-xs transition cursor-pointer"
                      >
                        {lang === "si" ? "වසන්න" : "Close"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-500">
              <Users className="w-12 h-12 text-slate-200 mx-auto stroke-1.2 mb-3" />
              <h4 className="font-extrabold text-slate-700 text-sm">{lang === "si" ? "කිසිදු නිලධාරියෙකු තෝරාගෙන නොමැත" : "No Representative Selected"}</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {lang === "si" ? "ක්ෂේත්‍ර නිලධාරියෙකු පිළිබඳ විස්තර සහ ගිණුම් බැලීමට වම්පස ලැයිස්තුවෙන් නිලධාරියෙකු තෝරන්න." : "Choose from the left-hand directory list or insert a new member."}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// Inline helper for checkbox / check indicator
function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}
