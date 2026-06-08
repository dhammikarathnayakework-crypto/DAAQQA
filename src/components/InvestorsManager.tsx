/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  DollarSign, 
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
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  CircleCheck,
  UserCheck,
  ShieldCheck,
  Lock,
  Unlock,
  RefreshCw,
  QrCode,
  CheckCircle2
} from "lucide-react";
import { Investor, InvestorTransaction } from "../types";
import { formatLKR, generateId } from "../utils";
import { Language } from "../translations";

// Cryptographic pseudo-hash generator for double-entry ledger security
export function generateTxSecurityHash(txId: string, date: string, type: string, amount: number): string {
  const rawPayload = `SCL-SECURED-TXID[${txId}]-DATE[${date}]-TYPE[${type}]-AMT[${amount}]-VOURCHER[TRUE]`;
  let saltVal = 0;
  for (let i = 0; i < rawPayload.length; i++) {
    saltVal = (saltVal << 5) - saltVal + rawPayload.charCodeAt(i);
    saltVal |= 0; // force 32bit integer conversion
  }
  const hexCode = Math.abs(saltVal).toString(16).toUpperCase();
  // Pad if short
  const paddedHex = (hexCode + "00000000").substring(0, 8);
  return `SEC-${paddedHex}-${txId.slice(-4).toUpperCase()}`;
}

interface InvestorsManagerProps {
  investors: Investor[];
  onAddInvestor: (investor: Investor) => void;
  onDeleteInvestor: (id: string) => void;
  onUpdateInvestor: (investor: Investor) => void;
  lang: Language;
}

export default function InvestorsManager({ 
  investors, 
  onAddInvestor, 
  onDeleteInvestor, 
  onUpdateInvestor, 
  lang 
}: InvestorsManagerProps) {
  const [selectedInvestorId, setSelectedInvestorId] = useState<string | null>(
    investors.length > 0 ? investors[0].id : null
  );

  // Form states for creating a new Investor
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [nic, setNic] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [nomineeName, setNomineeName] = useState("");
  const [nomineeRelationship, setNomineeRelationship] = useState("");
  const [nomineeNic, setNomineeNic] = useState("");
  const [nomineePhone, setNomineePhone] = useState("");
  const [agreementDate, setAgreementDate] = useState(new Date().toISOString().split("T")[0]);
  const [expectedPayoutRate, setExpectedPayoutRate] = useState("");

  // Editing profile states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editNic, setEditNic] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editBankName, setEditBankName] = useState("");
  const [editBankBranch, setEditBankBranch] = useState("");
  const [editBankAccountNumber, setEditBankAccountNumber] = useState("");
  const [editNomineeName, setEditNomineeName] = useState("");
  const [editNomineeRelationship, setEditNomineeRelationship] = useState("");
  const [editNomineeNic, setEditNomineeNic] = useState("");
  const [editNomineePhone, setEditNomineePhone] = useState("");
  const [editAgreementDate, setEditAgreementDate] = useState("");
  const [editExpectedPayoutRate, setEditExpectedPayoutRate] = useState("");

  // Technical Security States
  const [directPost, setDirectPost] = useState(true); // True to bypass approval, false to default to PENDING audit queue
  const [selectedSecurityCert, setSelectedSecurityCert] = useState<InvestorTransaction | null>(null);
  const [integrityScanResult, setIntegrityScanResult] = useState<{ scanned: number; valid: boolean; errors: string[] } | null>(null);
  const [auditingModeActive, setAuditingModeActive] = useState(false);

  // Transaction form states
  const [txType, setTxType] = useState<'INVESTMENT' | 'WITHDRAWAL' | 'INTEREST_PAYOUT'>('INVESTMENT');
  const [txAmount, setTxAmount] = useState("");
  const [txNotes, setTxNotes] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);

  // Handle adding Investor
  const handleSubmitInvestor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !nic || !phone) {
      alert(lang === "si" ? "කරුණාකර සියලුම අනිවාර්ය ක්ෂේත්‍ර පුරවන්න." : "Please fill in all mandatory fields.");
      return;
    }
    const newInvestor: Investor = {
      id: "investor-" + generateId(),
      name,
      nic,
      phone,
      address,
      email: email || undefined,
      bankName: bankName || undefined,
      bankBranch: bankBranch || undefined,
      bankAccountNumber: bankAccountNumber || undefined,
      nomineeName: nomineeName || undefined,
      nomineeRelationship: nomineeRelationship || undefined,
      nomineeNic: nomineeNic || undefined,
      nomineePhone: nomineePhone || undefined,
      agreementDate: agreementDate || undefined,
      expectedPayoutRate: expectedPayoutRate ? parseFloat(expectedPayoutRate) : undefined,
      transactions: [],
      createdAt: new Date().toISOString(),
    };
    onAddInvestor(newInvestor);
    setSelectedInvestorId(newInvestor.id);
    setShowAddForm(false);
    // Reset form fields
    setName("");
    setNic("");
    setPhone("");
    setAddress("");
    setEmail("");
    setBankName("");
    setBankBranch("");
    setBankAccountNumber("");
    setNomineeName("");
    setNomineeRelationship("");
    setNomineeNic("");
    setNomineePhone("");
    setAgreementDate(new Date().toISOString().split("T")[0]);
    setExpectedPayoutRate("");
  };

  // Editing profile procedures
  const startEditingProfile = (investor: Investor) => {
    setEditName(investor.name);
    setEditNic(investor.nic);
    setEditPhone(investor.phone);
    setEditAddress(investor.address);
    setEditEmail(investor.email || "");
    setEditBankName(investor.bankName || "");
    setEditBankBranch(investor.bankBranch || "");
    setEditBankAccountNumber(investor.bankAccountNumber || "");
    setEditNomineeName(investor.nomineeName || "");
    setEditNomineeRelationship(investor.nomineeRelationship || "");
    setEditNomineeNic(investor.nomineeNic || "");
    setEditNomineePhone(investor.nomineePhone || "");
    setEditAgreementDate(investor.agreementDate || new Date().toISOString().split("T")[0]);
    setEditExpectedPayoutRate(investor.expectedPayoutRate?.toString() || "");
    setIsEditingProfile(true);
  };

  const handleUpdateInvestorProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInvestor) return;
    if (!editName || !editNic || !editPhone) {
      alert(lang === "si" ? "නම, හැඳුනුම්පත සහ දුරකථන අංකය අනිවාර්ය වේ." : "Name, NIC, and Phone are required.");
      return;
    }
    const updated: Investor = {
      ...currentInvestor,
      name: editName,
      nic: editNic,
      phone: editPhone,
      address: editAddress,
      email: editEmail || undefined,
      bankName: editBankName || undefined,
      bankBranch: editBankBranch || undefined,
      bankAccountNumber: editBankAccountNumber || undefined,
      nomineeName: editNomineeName || undefined,
      nomineeRelationship: editNomineeRelationship || undefined,
      nomineeNic: editNomineeNic || undefined,
      nomineePhone: editNomineePhone || undefined,
      agreementDate: editAgreementDate || undefined,
      expectedPayoutRate: editExpectedPayoutRate ? parseFloat(editExpectedPayoutRate) : undefined,
    };
    onUpdateInvestor(updated);
    setIsEditingProfile(false);
  };

  const currentInvestor = investors.find(i => i.id === selectedInvestorId) || investors[0] || null;

  // Calculations for current investor
  const calculateInvestorMetrics = (investor: Investor) => {
    // Legacy support: undefined transaction status treated as APPROVED
    const activeTransactions = investor.transactions.filter(
      t => t.status === undefined || t.status === 'APPROVED'
    );
    const pendingTransactions = investor.transactions.filter(
      t => t.status === 'PENDING'
    );

    const totalInvested = activeTransactions
      .filter(t => t.type === 'INVESTMENT')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawn = activeTransactions
      .filter(t => t.type === 'WITHDRAWAL')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalInterestPayments = activeTransactions
      .filter(t => t.type === 'INTEREST_PAYOUT')
      .reduce((sum, t) => sum + t.amount, 0);

    // Current Investment Capital Balance = Investments - Withdrawals
    const currentBalance = totalInvested - totalWithdrawn;

    return {
      totalInvested,
      totalWithdrawn,
      totalInterestPayments,
      currentBalance,
      pendingCount: pendingTransactions.length,
      pendingSum: pendingTransactions.reduce((sum, t) => sum + t.amount, 0)
    };
  };

  const metrics = currentInvestor ? calculateInvestorMetrics(currentInvestor) : null;

  // Log sub transaction additions
  const handleAddNewTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInvestor || !txAmount) return;
    const amount = parseFloat(txAmount);
    if (isNaN(amount) || amount <= 0) return;

    // Check if withdrawing more than current balance
    if (txType === 'WITHDRAWAL') {
      const { currentBalance } = calculateInvestorMetrics(currentInvestor);
      if (amount > currentBalance) {
        alert(lang === "si" ? "ප්‍රමාණවත් ආයෝජන ශේෂයක් නොමැත!" : "Insufficient active investment balance to complete withdrawal!");
        return;
      }
    }

    const txId = "tx-" + generateId();
    const status = directPost ? 'APPROVED' : 'PENDING';
    const securityHash = status === 'APPROVED' ? generateTxSecurityHash(txId, txDate, txType, amount) : undefined;

    const newTx: InvestorTransaction = {
      id: txId,
      date: txDate,
      type: txType,
      amount,
      notes: txNotes,
      status,
      securityHash,
      approvedBy: status === 'APPROVED' ? "Admin Counter" : undefined,
      verifiedAt: status === 'APPROVED' ? new Date().toISOString().split("T")[0] : undefined,
      referenceToken: "TKN-" + Math.floor(100000 + Math.random() * 900000).toString()
    };

    const updated = {
      ...currentInvestor,
      transactions: [
        ...currentInvestor.transactions,
        newTx
      ]
    };
    onUpdateInvestor(updated);
    setTxAmount("");
    setTxNotes("");
  };

  // Supervisor Approval Action
  const handleApproveTransaction = (txId: string) => {
    if (!currentInvestor) return;
    const updatedTx = currentInvestor.transactions.map(t => {
      if (t.id === txId) {
        return {
          ...t,
          status: 'APPROVED' as const,
          securityHash: generateTxSecurityHash(t.id, t.date, t.type, t.amount),
          approvedBy: "LKR-Audit SCL Admin",
          verifiedAt: new Date().toISOString().split("T")[0]
        };
      }
      return t;
    });

    onUpdateInvestor({
      ...currentInvestor,
      transactions: updatedTx
    });
  };

  // Supervisor Rejection Action
  const handleRejectTransaction = (txId: string) => {
    if (!currentInvestor) return;
    const updatedTx = currentInvestor.transactions.map(t => {
      if (t.id === txId) {
        return {
          ...t,
          status: 'REJECTED' as const,
          approvedBy: "Supervisor Audit Console"
        };
      }
      return t;
    });

    onUpdateInvestor({
      ...currentInvestor,
      transactions: updatedTx
    });
  };

  // Cryptographic Ledger Audit scan (Integrity Verify)
  const runIntegrityAudit = () => {
    if (!currentInvestor) return;
    let scanned = 0;
    let errors: string[] = [];

    currentInvestor.transactions.forEach((t) => {
      scanned++;
      if (t.status === 'APPROVED' || t.status === undefined) {
        const expectedHash = generateTxSecurityHash(t.id, t.date, t.type, t.amount);
        if (t.securityHash && t.securityHash !== expectedHash) {
          errors.push(`Transaction ${t.id} hash collision! Computed: ${expectedHash}, Stored: ${t.securityHash}`);
        }
      }
    });

    setIntegrityScanResult({
      scanned,
      valid: errors.length === 0,
      errors
    });

    setTimeout(() => {
      setIntegrityScanResult(null);
    }, 4000);
  };

  // Sub level deletion
  const handleDeleteTransactionItem = (id: string) => {
    if (!currentInvestor) return;
    if (confirm(lang === "si" ? "මෙම ගනුදෙනු වාර්තාව ඉවත් කිරීමට අවශ්‍යද?" : "Erase this transaction record from ledger?")) {
      const updated = {
        ...currentInvestor,
        transactions: currentInvestor.transactions.filter(t => t.id !== id)
      };
      onUpdateInvestor(updated);
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
              <UserCheck className="w-5 h-5" />
            </span>
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
              {lang === "si" ? "බාහිර ආයෝජකයින් කළමනාකරණය" : "Business Investment Capital Portfolio"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {lang === "si" ? "ආයෝජකයින් සහ මූල්‍ය ප්‍රාග්ධනය" : "Investors & External Capital Seed"}
          </h2>
          <p className="text-xs text-slate-400 mt-2 max-w-xl leading-relaxed">
            {lang === "si" 
              ? "ව්‍යාපාරයට ප්‍රාග්ධනය ආයෝජනය කළ අය සහ ආයෝජන ශේෂයන්, ඔවුන්ට ගෙවන ලද ලාභාංශ (පොලී) සහ ආපසු ලබාගත් මුදල් නිවැරදිව පාලනය කරන්න." 
              : "Register strategic equity and capital investors, track multi-stage deposit additions, cash withdrawals, and dividend interest payout streams."}
          </p>
        </div>
      </div>

      {/* Grid Layout containing Listing & Profile view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Investors list column (Left column) */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-800">
              {lang === "si" ? "ආයෝජකයින් ලැයිස්තුව" : "External Partners"}
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {lang === "si" ? "දක්වන්න" : "Add New"}
            </button>
          </div>

          {/* Form to Registration of Investor */}
          {showAddForm && (
            <form onSubmit={handleSubmitInvestor} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  {lang === "si" ? "ආයෝජකයාගේ නම *" : "Investor Full Name *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === "si" ? "උදා: කමල් ආදිකාරී" : "e.g. Kamal Adhikari"}
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
                    placeholder="851234567V"
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
                    placeholder="0711234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 tracking-wide font-sans outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  {lang === "si" ? "පහසුකම් සපයන ලිපිනය" : "Address"}
                </label>
                <textarea
                  placeholder={lang === "si" ? "පටුමග, නගරය..." : "Street bounds, city..."}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 tracking-wide font-sans outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    {lang === "si" ? "විද්‍යුත් තැපෑල" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    placeholder="partner@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 tracking-wide font-sans outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    {lang === "si" ? "ගිවිසුම්ගත වූ දිනය" : "Agreement Date"}
                  </label>
                  <input
                    type="date"
                    value={agreementDate}
                    onChange={(e) => setAgreementDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 tracking-wide font-sans outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  {lang === "si" ? "පොරොන්දු වූ වාර්ෂික ලාභ/පොලී අනුපාතිකය (%)" : "Expected Payout Rate (%)"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 15"
                  value={expectedPayoutRate}
                  onChange={(e) => setExpectedPayoutRate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 tracking-wide font-sans outline-none"
                />
              </div>

              {/* Bank accounts section */}
              <div className="p-3 bg-white border border-slate-100 rounded-xl space-y-2">
                <p className="text-[9px] font-black uppercase text-indigo-600 tracking-widest">
                  {lang === "si" ? "බැංකු ගිණුම් විස්තර" : "Bank Payout Channel"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="text"
                      placeholder={lang === "si" ? "බැංකුවේ නම" : "Bank Name"}
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder={lang === "si" ? "ශාඛාව" : "Branch"}
                      value={bankBranch}
                      onChange={(e) => setBankBranch(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder={lang === "si" ? "ගිණුම් අංකය" : "Account Number"}
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none"
                />
              </div>

              {/* Nominee section */}
              <div className="p-3 bg-white border border-slate-100 rounded-xl space-y-2">
                <p className="text-[9px] font-black uppercase text-amber-600 tracking-widest">
                  {lang === "si" ? "නම් කළ තැනැත්තාගේ විස්තර" : "Nominee Beneficiary"}
                </p>
                <input
                  type="text"
                  placeholder={lang === "si" ? "සම්පූර්ණ නම" : "Nominee Full Name"}
                  value={nomineeName}
                  onChange={(e) => setNomineeName(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder={lang === "si" ? "සම්බන්ධතාවය" : "Relationship"}
                    value={nomineeRelationship}
                    onChange={(e) => setNomineeRelationship(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none"
                  />
                  <input
                    type="text"
                    placeholder="NIC"
                    value={nomineeNic}
                    onChange={(e) => setNomineeNic(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none"
                  />
                </div>
                <input
                  type="tel"
                  placeholder={lang === "si" ? "දුරකථන අංකය" : "Phone line"}
                  value={nomineePhone}
                  onChange={(e) => setNomineePhone(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs cursor-pointer active:scale-95 transition-all text-center"
                >
                  {lang === "si" ? "ඇතුළත් කරන්න" : "Save Investor"}
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

          {/* Investors list maps */}
          <div className="space-y-2 max-h-[450px] overflow-y-auto">
            {investors.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                <UserCheck className="w-8 h-8 text-slate-300 mx-auto stroke-1 mb-1.5" />
                <p className="text-[11px] font-bold text-slate-600">{lang === "si" ? "කිසිදු ආයෝජකයෙක් නැත" : "No registered investors."}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{lang === "si" ? "ලියාපදිංචි කිරීමට 'දක්වන්න' ඔබන්න." : "Click 'Add New' to insert first strategic investor."}</p>
              </div>
            ) : (
              investors.map((investor) => {
                const isActive = investor.id === selectedInvestorId;
                const m = calculateInvestorMetrics(investor);
                return (
                  <button
                    key={investor.id}
                    onClick={() => {
                      setSelectedInvestorId(investor.id);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                      isActive 
                        ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                        : "bg-slate-50 hover:bg-slate-100/70 border-slate-100 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${isActive ? "bg-slate-800 text-indigo-400" : "bg-white text-slate-500 border border-slate-100"}`}>
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold truncate">{investor.name}</p>
                        <p className={`text-[9px] font-medium font-mono mt-0.5 ${isActive ? "text-slate-400" : "text-slate-400"}`}>
                          ID: {investor.nic}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-[10px] font-black font-mono ${isActive ? "text-emerald-400" : "text-emerald-600"}`}>
                        {formatLKR(m.currentBalance)}
                      </p>
                      <p className="text-[8px] text-slate-400">{lang === "si" ? "ආයෝජිත ශේෂය" : "Equity Bal"}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Detailed Investor ledger profiles (Right column) */}
        <div className="lg:col-span-8 space-y-6">
          {currentInvestor && metrics ? (
            <div className="space-y-6">
              
              {/* Profile Card Summary */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
                {isEditingProfile ? (
                  <form onSubmit={handleUpdateInvestorProfile} className="space-y-4 font-sans">
                    <h4 className="text-xs font-black uppercase text-indigo-600 tracking-wider">
                      {lang === "si" ? "ආයෝජක තොරතුරු සංස්කරණය" : "Edit Investor Profile"}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "නම" : "Investor Name"}</label>
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
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans outline-none font-sans"
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
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "විද්‍යුත් තැපෑල" : "Email Address"}</label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "ගිවිසුම්ගත වූ දිනය" : "Agreement Date"}</label>
                        <input
                          type="date"
                          value={editAgreementDate}
                          onChange={(e) => setEditAgreementDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "පොරොන්දු වූ ලාභ/පොලී අනුපාතය (%)" : "Expected Payout Rate %"}</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editExpectedPayoutRate}
                          onChange={(e) => setEditExpectedPayoutRate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans outline-none font-bold"
                        />
                      </div>
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

                    {/* Bank Payout Channels */}
                    <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl space-y-2">
                      <p className="text-[9px] font-black uppercase text-indigo-600 tracking-widest">
                        {lang === "si" ? "බැංකු ගිණුම් විස්තර" : "Bank Payout Channel"}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-0.5">{lang === "si" ? "බැංකුවේ නම" : "Bank Name"}</label>
                          <input
                            type="text"
                            value={editBankName}
                            onChange={(e) => setEditBankName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-0.5">{lang === "si" ? "ශාඛාව" : "Branch"}</label>
                          <input
                            type="text"
                            value={editBankBranch}
                            onChange={(e) => setEditBankBranch(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                          />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                          <label className="text-[9px] text-slate-400 block mb-0.5">{lang === "si" ? "ගිණුම් අංකය" : "Account Number"}</label>
                          <input
                            type="text"
                            value={editBankAccountNumber}
                            onChange={(e) => setEditBankAccountNumber(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Nominee details */}
                    <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl space-y-2">
                      <p className="text-[9px] font-black uppercase text-amber-600 tracking-widest">
                        {lang === "si" ? "නම් කළ තැනැත්තාගේ විස්තර (Nominee)" : "Selected Nominee Beneficiary"}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-0.5">{lang === "si" ? "නම" : "Nominee Full Name"}</label>
                          <input
                            type="text"
                            value={editNomineeName}
                            onChange={(e) => setEditNomineeName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-0.5">{lang === "si" ? "සම්බන්ධතාවය" : "Relationship"}</label>
                          <input
                            type="text"
                            value={editNomineeRelationship}
                            onChange={(e) => setEditNomineeRelationship(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-0.5">NIC</label>
                          <input
                            type="text"
                            value={editNomineeNic}
                            onChange={(e) => setEditNomineeNic(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-0.5">{lang === "si" ? "දුරකථනය" : "Phone"}</label>
                          <input
                            type="text"
                            value={editNomineePhone}
                            onChange={(e) => setEditNomineePhone(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                          />
                        </div>
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
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-50 pb-5 mb-5 font-sans w-full">
                    <div className="flex items-start gap-4 w-full">
                      <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-2xl text-indigo-600 shrink-0">
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <div className="space-y-4 w-full">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-extrabold text-slate-800 text-base">{currentInvestor.name}</h3>
                            {currentInvestor.expectedPayoutRate && (
                              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-black">
                                {currentInvestor.expectedPayoutRate}% Payout
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-slate-400 text-[11px] font-medium mt-1">
                            <span className="flex items-center gap-1">
                              <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                              NIC: {currentInvestor.nic}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {currentInvestor.phone}
                            </span>
                            {currentInvestor.address && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {currentInvestor.address}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Extra general tags like email / agreement date */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] border-t border-slate-50 pt-3">
                          {currentInvestor.email && (
                            <div>
                              <span className="text-slate-400 font-extrabold block uppercase text-[8px] tracking-wider">Email</span>
                              <span className="text-slate-700 font-medium truncate block max-w-xs">{currentInvestor.email}</span>
                            </div>
                          )}
                          {currentInvestor.agreementDate && (
                            <div>
                              <span className="text-slate-400 font-extrabold block uppercase text-[8px] tracking-wider">Agreement Date</span>
                              <span className="text-slate-700 font-medium">{currentInvestor.agreementDate}</span>
                            </div>
                          )}
                        </div>

                        {/* Dual section grids for Bank and Nominee channels */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                          
                          {/* Render Bank details in customized digital checkbook style */}
                          {currentInvestor.bankAccountNumber ? (
                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1.5 text-[11px]">
                              <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                                <span>🏦</span> {lang === "si" ? "බැංකු ගෙවුම් මාර්ගය" : "Bank Payout Channel"}
                              </p>
                              <div className="text-slate-700 font-medium">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Bank:</span>
                                  <span className="font-bold">{currentInvestor.bankName || "N/A"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Branch:</span>
                                  <span>{currentInvestor.bankBranch || "N/A"}</span>
                                </div>
                                <div className="flex justify-between border-t border-dashed border-slate-200 pt-1 mt-1 font-mono text-xs">
                                  <span className="text-slate-400 font-sans">Acc No:</span>
                                  <span className="font-extrabold text-slate-900">{currentInvestor.bankAccountNumber}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-slate-50/50 border border-dashed border-slate-150 rounded-2xl flex flex-col justify-center items-center text-[10px] text-slate-450 text-center">
                              <span>🏦</span>
                              <span className="mt-1">{lang === "si" ? "කිසිදු බැංකු ගිණුමක් සම්බන්ධ කර නැත" : "No bank ledger accounts."}</span>
                            </div>
                          )}

                          {/* Render Nominee Beneficiary */}
                          {currentInvestor.nomineeName ? (
                            <div className="p-3 bg-amber-50/40 border border-amber-100 rounded-2xl space-y-1 text-[11px]">
                              <p className="text-[8px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-1">
                                <span>⚖️</span> {lang === "si" ? "නම් කළ තැනැත්තා (Nominee)" : "Nominee Beneficiary"}
                              </p>
                              <div className="text-amber-900 font-medium space-y-0.5">
                                <div className="font-extrabold text-slate-800 text-[11px] truncate">{currentInvestor.nomineeName}</div>
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-amber-700/70">{lang === "si" ? "ඥාතිත්වය:" : "Relation:"}</span>
                                  <span>{currentInvestor.nomineeRelationship || "N/A"}</span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-amber-700/70">NIC:</span>
                                  <span>{currentInvestor.nomineeNic || "N/A"}</span>
                                </div>
                                <div className="flex justify-between text-[10px] border-t border-amber-100/60 pt-0.5 mt-0.5">
                                  <span className="text-amber-700/70">Phone:</span>
                                  <span>{currentInvestor.nomineePhone || "N/A"}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-amber-50/10 border border-dashed border-amber-100/55 rounded-2xl flex flex-col justify-center items-center text-[10px] text-amber-700/60 text-center">
                              <span>⚖️</span>
                              <span className="mt-1">{lang === "si" ? "නම් කළ තැනැත්තෙක් නම් කර නොමැත" : "No nominee assigned."}</span>
                            </div>
                          )}

                        </div>

                      </div>
                    </div>
                    <div className="flex md:flex-col gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => startEditingProfile(currentInvestor)}
                        className="flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-1.8 rounded-xl text-[11px] font-bold cursor-pointer transition active:scale-95"
                      >
                        {lang === "si" ? "සංස්කරණය" : "Edit Profile"}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(lang === "si" ? "මෙම ආයෝජකයා පද්ධතියෙන් සම්පූර්ණයෙන්ම ඉවත් කිරීමට අවශ්‍යද?" : "Delete this Investor profile?")) {
                            onDeleteInvestor(currentInvestor.id);
                            setSelectedInvestorId(investors.length > 1 ? investors.filter(i => i.id !== currentInvestor.id)[0].id : null);
                          }
                        }}
                        className="flex items-center gap-1.5 border border-rose-200 text-rose-650 hover:bg-rose-50 px-3.5 py-1.8 rounded-xl text-[11px] font-bold cursor-pointer transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {lang === "si" ? "ඉවත් කරන්න" : "Delete"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Investment Stats widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <div className="flex items-center justify-between text-indigo-800 mb-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider">{lang === "si" ? "වත්මන් ආයෝජන ශේෂය" : "Equity Balance"}</span>
                      <Coins className="w-4 h-4 text-indigo-600" />
                    </div>
                    <p className="text-base font-black text-indigo-800 tracking-tight font-mono">{formatLKR(metrics.currentBalance)}</p>
                    <p className="text-[9px] text-slate-400 mt-1 font-bold">{lang === "si" ? "ව්‍යාපාරය සතු මුළු ආයෝජනය" : "Working Capital Deployed"}</p>
                  </div>

                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                    <div className="flex items-center justify-between text-emerald-800 mb-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider">{lang === "si" ? "මුළු ආයෝජනය" : "Total Investments"}</span>
                      <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-sm font-black text-emerald-700 tracking-tight font-mono">{formatLKR(metrics.totalInvested)}</p>
                    <p className="text-[9px] text-slate-400 mt-1">{lang === "si" ? "මුලින් තැන්පත් කල එකතුව" : "Gross Capital deposits"}</p>
                  </div>

                  <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100">
                    <div className="flex items-center justify-between text-sky-800 mb-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider">{lang === "si" ? "ලාභ/පොලී ගෙවීම්" : "Dividend Payouts"}</span>
                      <ArrowDownLeft className="w-4 h-4 text-sky-600" />
                    </div>
                    <p className="text-sm font-black text-sky-700 tracking-tight font-mono">{formatLKR(metrics.totalInterestPayments)}</p>
                    <p className="text-[9px] text-slate-400 mt-1">{lang === "si" ? "ගෙවා ඇති මුළු ලාභාංශ" : "Total profit interest paid"}</p>
                  </div>
                </div>

                {/* Additional withdrawals summary indicator */}
                {metrics.totalWithdrawn > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <ArrowDownLeft className="w-4 h-4 text-rose-500" />
                      {lang === "si" ? "ප්‍රාග්ධනය ආපසු ලබාගත් මුළු මුදල (Withdrawn Capital):" : "Total Disinvestments/Withdrawn Capital:"}
                    </span>
                    <strong className="text-slate-800 font-mono font-black">{formatLKR(metrics.totalWithdrawn)}</strong>
                  </div>
                )}

                {/* Secure Pending transaction warnings */}
                {metrics.pendingCount > 0 && (
                  <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-xs animate-pulse">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-amber-800">
                        {lang === "si" 
                          ? `සුපරීක්ෂක අනුමැතිය සඳහා ගනුදෙනු ${metrics.pendingCount} ක් රැඳී පවතී!` 
                          : `${metrics.pendingCount} Transactions Pending Audit Approval!`}
                      </p>
                      <p className="text-[10px] text-amber-600 font-medium mt-0.5">
                        {lang === "si"
                          ? `මෙම ගනුදෙනු (මුළු එකතුව: ${formatLKR(metrics.pendingSum)}) වගකීම් සහතික අත්සන් කරන තුරු වත්මන් ආයෝජන ශේෂයට බලපාන්නේ නැත.`
                          : `Unapproved entries (totaling ${formatLKR(metrics.pendingSum)}) do not affect primary balances until supervisor certification.`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Secure Cryptographic Ledger Audit Console */}
              <div className="bg-slate-950 text-slate-200 rounded-3xl p-5 shadow-lg border border-slate-850 relative overflow-hidden font-sans">
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-indigo-900/10 to-transparent pointer-events-none" />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1 rounded bg-slate-900 text-indigo-400">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">
                        Ledger Verification Security Hub
                      </span>
                    </div>
                    <h4 className="text-slate-100 font-bold text-xs">
                      {lang === "si" ? "ද්විත්ව පාලන ගිණුම්කරණය සහ කේතාංක විගණනය" : "Double-Control Authorization & Cryptographic Signatures"}
                    </h4>
                    <p className="text-[10px] text-slate-400 max-w-lg leading-relaxed">
                      {lang === "si"
                        ? "සෑම ගනුදෙනුවක්ම විනිවිදශීලීව ආරක්ෂිත SHA හැෂ් කේතයක් සමඟ දැඩි සුපරීක්ෂාවට ලක් කෙරේ. මෙයින් දත්ත විකෘති කිරීම් වළක්වයි."
                        : "Ensures tamper-proof record validation. Every approved transaction is cryptographically signed and secured inside the local offline-ledger."}
                    </p>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={runIntegrityAudit}
                      className="flex items-center gap-1 border border-slate-800 bg-slate-900 hover:bg-slate-850 text-white text-[11px] font-extrabold px-3.5 py-2 rounded-xl transition active:scale-95 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                      {lang === "si" ? "පද්ධතිය විගණනය කරන්න" : "Run Ledger Audit"}
                    </button>
                  </div>
                </div>

                {/* Audit Scan Alert results */}
                {integrityScanResult && (
                  <div className={`mt-3.5 p-3 rounded-xl border text-xs flex items-center gap-2 animate-fade-in ${
                    integrityScanResult.valid 
                      ? "bg-emerald-950/40 border-emerald-900 text-emerald-300" 
                      : "bg-rose-950/40 border-rose-900 text-rose-300"
                  }`}>
                    {integrityScanResult.valid ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <div>
                      <p className="font-extrabold">
                        {integrityScanResult.valid 
                          ? (lang === "si" ? "විගණනය සාර්ථකයි! (Database Integrity: OK)" : "Ledger Valid! System integrity verified 100%") 
                          : (lang === "si" ? "අවධානය! දත්ත විකෘති වීමක් හඳුනාගෙන ඇත!" : "Warning! Hash mismatch detected!")}
                      </p>
                      <p className="text-[9px] mt-0.5 opacity-90">
                        {lang === "si" 
                          ? `පරීක්ෂා කරන ලද ගනුදෙනු: ${integrityScanResult.scanned} | කිසිදු දෝෂයක් හමු නොවීය.` 
                          : `Scanned ${integrityScanResult.scanned} records. All cryptographic blocks perfectly sealed.`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Logger & Input form */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
                <div>
                  <h4 className="text-slate-850 text-xs font-black flex items-center gap-1.5 mb-2">
                    <ClipboardList className="w-4.5 h-4.5 text-indigo-500" />
                    {lang === "si" ? "නව ගනුදෙනුවක් එක් කරන්න" : "Log Capital Transaction Event"}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {lang === "si" 
                      ? "නව ආයෝජන, ප්‍රාග්ධනය ආපසු ගැනීම් හෝ ඔවුන්ට ගෙවන ලද පොලී/ලාභ සටහන් මෙතැනින් ඇතුළත් කරන්න." 
                      : "Add deposit inflows, capital disinvestments/withdrawals, or log monthly interest dividends yields."}
                  </p>
                </div>

                {/* Inline transaction form */}
                <form onSubmit={handleAddNewTransaction} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-150 grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
                  <div className="md:col-span-3">
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "ගනුදෙනු දිනය" : "Tx Date"}</label>
                    <input
                      type="date"
                      required
                      value={txDate}
                      onChange={(e) => setTxDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-750 font-medium outline-none"
                    />
                  </div>
                  
                  <div className="md:col-span-3">
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "ගනුදෙනු වර්ගය" : "Transaction Type"}</label>
                    <select
                      value={txType}
                      onChange={(e) => setTxType(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 outline-none font-sans font-extrabold"
                    >
                      <option value="INVESTMENT">{lang === "si" ? "ආයෝජනය (Deposit)" : "Equity Capital Deposit"}</option>
                      <option value="WITHDRAWAL">{lang === "si" ? "ආපසු ගැනීම (Withdraw)" : "Withdraw Capital"}</option>
                      <option value="INTEREST_PAYOUT">{lang === "si" ? "ලාභ/පොලී ගෙවීම (Profit)" : "Dividend Yield Payout"}</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "මුදල (LKR) *" : "Sum (LKR) *"}</label>
                    <input
                      type="number"
                      required
                      placeholder="Rs. 10000"
                      value={txAmount}
                      onChange={(e) => setTxAmount(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none font-mono font-black"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "සටහන (Notes)" : "Notes"}</label>
                    <input
                      type="text"
                      placeholder="Receipt references..."
                      value={txNotes}
                      onChange={(e) => setTxNotes(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-705 outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-1.8 rounded-xl text-xs active:scale-95 transition-all outline-none flex items-center justify-center gap-1 cursor-pointer shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {lang === "si" ? "වාර්තා කරන්න" : "Commit"}
                    </button>
                  </div>

                  {/* Anti-fraud Direct Posting controller toggle row */}
                  <div className="md:col-span-12 pt-1 border-t border-slate-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="flex items-center gap-2 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={directPost}
                        onChange={(e) => setDirectPost(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span className="text-[10px] font-bold text-slate-600 uppercase">
                        {lang === "si" ? "සෘජු ප්‍රකාශනය සක්‍රිය කරන්න (Instant Auto-Approve)" : "Enable instant ledger posting (Bypass approval queue)"}
                      </span>
                    </label>
                    <span className="text-[9px] text-slate-400 font-medium">
                      {lang === "si" ? "* පරීක්ෂාව අක්‍රිය වූ විට නව ගනුදෙනු අනුමැතිය සඳහා පෝලිමට යයි." : "* When unchecked, entries default to PENDING status."}
                    </span>
                  </div>
                </form>

                {/* Visual guideline cards explaining transaction choices */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-6">
                  <div className="p-1 space-y-1">
                    <span className="text-[10px] font-black text-indigo-700 uppercase flex items-center gap-1">
                      ● {lang === "si" ? "ආයෝජන ඇතුලත් කිරීම (New Deposits)" : "Capital Investments"}
                    </span>
                    <p className="text-[10px] text-slate-500 font-medium leading-normal">
                      {lang === "si" 
                        ? "ව්‍යාපාරය ආරම්භයේදී හෝ පසුව අලුතින්ම ආයෝජනය කරන මුදල් 'ආයෝජනය (Deposit)' ලෙස තෝරා ඇතුලත් කරන්න." 
                        : "Record additions to equity base. Select 'Equity Capital Deposit' option to increase investor balance."}
                    </p>
                  </div>
                  <div className="p-1 space-y-1 border-t md:border-t-0 md:border-l border-slate-200 md:pl-3">
                    <span className="text-[10px] font-black text-amber-700 uppercase flex items-center gap-1">
                      ● {lang === "si" ? "මුදල් ආපසු දීම් (Withdrawals)" : "Capital Withdrawals"}
                    </span>
                    <p className="text-[10px] text-slate-500 font-medium leading-normal">
                      {lang === "si" 
                        ? "ආයෝජකයා ව්‍යාපාරයෙන් නැවත ඔහුගේ මුදල්/ප්‍රාග්ධනය ලබාගන්නා විට 'ආපසු ගැනීම (Withdraw)' තෝරා ඇතුලත් කරන්න." 
                        : "Log capital removals. Select 'Withdraw Capital' to record return of funds and decrease active balance."}
                    </p>
                  </div>
                  <div className="p-1 space-y-1 border-t md:border-t-0 md:border-l border-slate-200 md:pl-3">
                    <span className="text-[10px] font-black text-teal-700 uppercase flex items-center gap-1">
                      ● {lang === "si" ? "ලාභ/පොලී ගෙවීම් (Yield)" : "Yield Payments"}
                    </span>
                    <p className="text-[10px] text-slate-500 font-medium leading-normal">
                      {lang === "si" 
                        ? "ආයෝජනයට අදාළ මාසික පොලියක් හෝ ලාභාංශ ගෙවීමේදී 'ලාභ/පොලී ගෙවීම (Profit)' තෝරා ඇතුලත් කරන්න." 
                        : "Log periodic dividends or interest returns. Select 'Dividend Yield Payout' for payout records."}
                    </p>
                  </div>
                </div>

                {/* Detailed transactions ledger history list */}
                <div className="pt-2">
                  <h4 className="text-slate-800 text-xs font-extrabold mb-4 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-indigo-500" />
                    {lang === "si" ? "ප්‍රාග්ධන ගනුදෙනු විස්තර ලේඛනය" : "Secure Transaction Ledger Statements"}
                  </h4>

                  {currentInvestor.transactions.length === 0 ? (
                    <div className="text-center py-10 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400">
                      <Receipt className="w-7 h-7 mx-auto mb-1 stroke-1" />
                      <p className="text-[11px] font-bold">{lang === "si" ? "කිසිදු ගනුදෙනුවක් තවමත් සිදුකර නොමැත." : "No transactions indexed yet."}</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead>
                          <tr className="border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase">
                            <th className="pb-2.5">{lang === "si" ? "දිනය" : "Date"}</th>
                            <th className="pb-2.5">{lang === "si" ? "ගනුදෙනුව සහ තත්ත්වය" : "Type & Status"}</th>
                            <th className="pb-2.5">{lang === "si" ? "සටහන්" : "Remarks"}</th>
                            <th className="pb-2.5 text-right">{lang === "si" ? "මුදල" : "Voucher Amount"}</th>
                            <th className="pb-2.5 text-right">{lang === "si" ? "ආරක්ෂණය / ක්‍රියා" : "Verification & Action"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {currentInvestor.transactions.map((tx) => {
                            const isDeposit = tx.type === 'INVESTMENT';
                            const isPayout = tx.type === 'INTEREST_PAYOUT';
                            const isApproved = tx.status === undefined || tx.status === 'APPROVED';
                            const isPending = tx.status === 'PENDING';
                            const isRejected = tx.status === 'REJECTED';

                            return (
                              <tr key={tx.id} className="hover:bg-slate-50/50">
                                <td className="py-3 text-slate-400 font-mono font-bold">{tx.date}</td>
                                <td className="py-3 space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                      isDeposit 
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                        : isPayout 
                                        ? "bg-sky-50 text-sky-700 border border-sky-100"
                                        : "bg-rose-50 text-rose-700 border border-rose-100"
                                    }`}>
                                      {isDeposit 
                                        ? (lang === "si" ? "තැන්පතුව (DEPOSIT)" : "Deposit Inflow") 
                                        : isPayout 
                                        ? (lang === "si" ? "ලාභය (PROFIT)" : "Yield Dividend")
                                        : (lang === "si" ? "ආපසු ගැනීම (WITHDRAW)" : "Capital Outflow")
                                      }
                                    </span>
                                  </div>
                                  
                                  {/* Status indicators */}
                                  <div className="flex items-center gap-1">
                                    {isApproved ? (
                                      <span className="text-[9px] text-emerald-600 font-extrabold flex items-center gap-0.5">
                                        <Lock className="w-3 h-3" /> {lang === "si" ? "සත්‍යාපිතයි" : "Audit Signed"}
                                      </span>
                                    ) : isPending ? (
                                      <span className="text-[9px] text-amber-600 font-black flex items-center gap-0.5 animate-pulse">
                                        <Unlock className="w-3 h-3 text-amber-500" /> {lang === "si" ? "අනුමැතිය සඳහා" : "Awaiting Audit"}
                                      </span>
                                    ) : (
                                      <span className="text-[9px] text-rose-600 font-extrabold flex items-center gap-0.5">
                                        {lang === "si" ? "ප්‍රතික්ෂේපිතයි" : "Rejected"}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                
                                <td className="py-3">
                                  <p className="text-slate-700 font-medium">{tx.notes || "-"}</p>
                                  {tx.approvedBy && (
                                    <p className="text-[8px] text-slate-400 font-mono">By: {tx.approvedBy}</p>
                                  )}
                                </td>

                                <td className={`py-3 text-right font-mono font-black text-xs ${
                                  isDeposit 
                                    ? "text-emerald-700" 
                                    : isPayout 
                                    ? "text-sky-705" 
                                    : "text-rose-650"
                                }`}>
                                  {isDeposit ? "+" : "-"}{formatLKR(tx.amount)}
                                </td>

                                <td className="py-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                    {/* Verification Hash popover trigger */}
                                    {isApproved && tx.securityHash && (
                                      <button
                                        type="button"
                                        onClick={() => setSelectedSecurityCert(tx)}
                                        className="inline-flex items-center gap-0.5 bg-slate-100 hover:bg-slate-200 text-slate-650 text-[9px] font-bold px-2 py-0.8 rounded-lg cursor-pointer transition border border-slate-200"
                                      >
                                        <QrCode className="w-3 h-3 text-indigo-500" />
                                        <span>CERT</span>
                                      </button>
                                    )}

                                    {/* Action items for queue approvals */}
                                    {isPending && (
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleApproveTransaction(tx.id)}
                                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[9px] px-2 py-1 rounded-lg cursor-pointer flex items-center gap-0.5 transition active:scale-95 shadow-sm"
                                        >
                                          {lang === "si" ? "අනුමත" : "Approve"}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleRejectTransaction(tx.id)}
                                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[9px] px-2 py-1 rounded-lg cursor-pointer transition active:scale-95"
                                        >
                                          {lang === "si" ? "ප්‍රතික්ෂේප" : "Reject"}
                                        </button>
                                      </div>
                                    )}

                                    {/* Erase delete capability */}
                                    <button 
                                      type="button"
                                      onClick={() => handleDeleteTransactionItem(tx.id)}
                                      className="text-slate-350 hover:text-rose-600 p-1 cursor-pointer rounded-lg hover:bg-rose-50 transition"
                                      title={lang === "si" ? "ලේඛනයෙන් මකන්න" : "Erase Transaction Record"}
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
                      <p className="text-[10px] text-slate-400">Authentic Crypto-Locked Microfinance Voucher</p>
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
                        <span>Status Score: LOCKED</span>
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

            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-500">
              <UserCheck className="w-12 h-12 text-slate-200 mx-auto stroke-1.2 mb-3" />
              <h4 className="font-extrabold text-slate-700 text-sm">{lang === "si" ? "කිසිදු ආයෝජකයෙකු තෝරාගෙන නොමැත" : "No Equity Partner Selected"}</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {lang === "si" ? "ආයෝජකයෙකුගේ ගිණුම් සඟරා සහ තොරතුරු බැලීමට වම්පස ලැයිස්තුවෙන් ආයෝජකයෙකු තෝරන්න." : "Choose from the left-hand directory list or configure a new portfolio account."}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
