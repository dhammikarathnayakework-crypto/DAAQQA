/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { 
  Receipt, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  AlertCircle,
  TrendingDown,
  Activity,
  UserCheck,
  Zap,
  Droplet,
  Home,
  BookOpen,
  Wifi,
  Wrench,
  Users,
  Briefcase,
  Layers,
  Upload,
  Camera
} from "lucide-react";
import { OfficeExpenseItem } from "../types";
import { formatLKR, generateId } from "../utils";
import { Language } from "../translations";

interface OfficeExpensesManagerProps {
  expenses: OfficeExpenseItem[];
  onAddExpense: (expense: OfficeExpenseItem) => void;
  onUpdateExpenseStatus: (id: string, status: 'APPROVED' | 'REJECTED', approvedBy: string) => void;
  onDeleteExpense: (id: string) => void;
  lang: Language;
  hasApprovalAuthority: boolean;
  loggedOfficerName?: string;
  loggedOfficerId?: string;
}

export default function OfficeExpensesManager({
  expenses = [],
  onAddExpense,
  onUpdateExpenseStatus,
  onDeleteExpense,
  lang,
  hasApprovalAuthority,
  loggedOfficerName = "System user",
  loggedOfficerId = ""
}: OfficeExpensesManagerProps) {
  // Form states
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState<OfficeExpenseItem['category']>("OTHER");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [billImage, setBillImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter states
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Drag and drop state
  const [dragActive, setDragActive] = useState(false);

  // Clean form
  const resetForm = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setCategory("OTHER");
    setDescription("");
    setAmount("");
    setNotes("");
    setBillImage("");
  };

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    // Automatic approval based on authority
    const status: 'APPROVED' | 'PENDING' = hasApprovalAuthority ? 'APPROVED' : 'PENDING';

    const newExpense: OfficeExpenseItem = {
      id: "OEXP-" + generateId().toUpperCase(),
      date,
      category,
      description: description.trim(),
      amount: numAmount,
      notes: notes.trim() || undefined,
      status,
      loggedByOfficerId: loggedOfficerId || "ADMIN",
      loggedByOfficerName: loggedOfficerName,
      approvedBy: status === 'APPROVED' ? loggedOfficerName : undefined,
      verifiedAt: status === 'APPROVED' ? new Date().toISOString().split("T")[0] : undefined,
      billImage: billImage || undefined
    };

    onAddExpense(newExpense);
    resetForm();
  };

  // Image Upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBillImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag handers
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

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBillImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Statistics
  const approvedExpenses = expenses.filter(e => e.status === 'APPROVED');
  const totalApprovedSum = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'PENDING');
  const totalPendingSum = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Category mapping helper
  const getCategoryIcon = (cat: OfficeExpenseItem['category']) => {
    switch (cat) {
      case 'ELECTRICITY': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'WATER': return <Droplet className="w-4 h-4 text-sky-500" />;
      case 'RENT': return <Home className="w-4 h-4 text-rose-500" />;
      case 'STATIONERY': return <BookOpen className="w-4 h-4 text-indigo-500" />;
      case 'INTERNET': return <Wifi className="w-4 h-4 text-teal-500" />;
      case 'MAINTENANCE': return <Wrench className="w-4 h-4 text-orange-500" />;
      case 'SALARY': return <Users className="w-4 h-4 text-violet-500" />;
      default: return <Receipt className="w-4 h-4 text-slate-500" />;
    }
  };

  const getCategoryLabel = (cat: OfficeExpenseItem['category']) => {
    if (lang === "si") {
      switch (cat) {
        case 'ELECTRICITY': return "විදුලි බිල (Electricity)";
        case 'WATER': return "වතුර බිල (Water Bill)";
        case 'RENT': return "කුලී වියදම් (Office Rent)";
        case 'STATIONERY': return "ලිපිද්‍රව්‍ය (Stationery)";
        case 'INTERNET': return "අන්තර්ජාලය / පෝන් බිල්";
        case 'MAINTENANCE': return "නඩත්තු කටයුතු (Maintenance)";
        case 'SALARY': return "කාර්යාල වැටුප් (Salaries)";
        default: return "වෙනත් කාර්යාලීය වියදම්";
      }
    } else {
      switch (cat) {
        case 'ELECTRICITY': return "Electricity";
        case 'WATER': return "Water Bill";
        case 'RENT': return "Office Rent";
        case 'STATIONERY': return "Stationery";
        case 'INTERNET': return "Internet & Comm";
        case 'MAINTENANCE': return "Maintenance";
        case 'SALARY': return "Salaries / Wages";
        default: return "Other Overheads";
      }
    }
  };

  // Filtered list
  const filteredList = expenses.filter(e => {
    const matchesCat = filterCategory === "ALL" || e.category === filterCategory;
    const matchesStat = filterStatus === "ALL" || e.status === filterStatus;
    return matchesCat && matchesStat;
  });

  return (
    <div className="space-y-6 font-sans animate-fade-in select-none" id="office-expenses-root">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span className="p-2 bg-slate-100 text-slate-800 rounded-2xl">
              <Receipt className="w-6 h-6 shrink-0" />
            </span>
            {lang === "si" ? "කාර්යාලීය වියදම් කළමනාකරණය" : "Office Overhead & Expenditures"}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {lang === "si" 
              ? "නිලධාරීන්ගෙන් බැහැරව සිදුවන විදුලිය, ජලය, කුලී සහ අනෙකුත් පොදු කාර්යාලීය වියදම් වාර්තා කිරීම."
              : "Track electricity, water, rent, stationery, and other corporate overheads separate from field officer accounts."}
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Total Approved */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[135px]">
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10"></div>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {lang === "si" ? "අනුමත සමස්ත කාර්යාලීය වියදම්" : "Corporate Logged Expenditures"}
              </span>
              <h3 className="text-xl md:text-2xl font-black text-emerald-450 font-mono tracking-tight mt-1">
                {formatLKR(totalApprovedSum)}
              </h3>
            </div>
            <span className="p-2.5 bg-slate-800 text-emerald-400 rounded-2xl border border-slate-700">
              <TrendingDown className="w-5 h-5 shrink-0" />
            </span>
          </div>
          <p className="text-[9px] text-slate-400 font-bold border-t border-slate-800 pt-3">
            <span className="text-emerald-400">{approvedExpenses.length}</span> {lang === "si" ? "අනුමත කරන ලද වියදම් සටහන්" : "vetted office overhead logs"}
          </p>
        </div>

        {/* Metric 2: Pending Expenses */}
        <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[135px]">
          <div className="absolute right-0 top-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10"></div>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {lang === "si" ? "අනුමැතිය අපේක්ෂිත වියදම්" : "Awaiting Audit Approvation"}
              </span>
              <h3 className="text-xl md:text-2xl font-black text-amber-600 font-mono tracking-tight mt-1">
                {formatLKR(totalPendingSum)}
              </h3>
            </div>
            <span className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
              <Activity className="w-5 h-5 shrink-0" />
            </span>
          </div>
          <p className="text-[9px] text-slate-400 font-bold border-t border-slate-100 pt-3">
            <span className="text-amber-500">{pendingExpenses.length}</span> {lang === "si" ? "අනුමැතිය සඳහා රඳවා ඇති වියදම් ප්‍රමාණය" : "claims pending managerial clearance"}
          </p>
        </div>

        {/* Metric 3: System Status Indicator */}
        <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-[135px]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider block">
                {lang === "si" ? "වර්තමාන සත්‍යාපන මට්ටම" : "Current Logged Identity"}
              </span>
              <p className="text-sm font-black text-slate-800 font-sans tracking-tight leading-snug mt-1 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                {loggedOfficerName} 
              </p>
              <span className="text-[9px] bg-slate-100 text-slate-600 font-black px-1.5 py-0.5 rounded uppercase font-mono tracking-wider inline-block">
                {hasApprovalAuthority ? (lang === "si" ? "ඇපෘ බලය ඇත" : "Approver Authority") : (lang === "si" ? "නැරඹුම් ප්‍රවේශය" : "Representative")}
              </span>
            </div>
            <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
              <UserCheck className="w-5 h-5 shrink-0" />
            </span>
          </div>
          <p className="text-[9px] text-slate-400 font-bold border-t border-slate-100 pt-3">
            {hasApprovalAuthority 
              ? (lang === "si" ? "ඔබ ඇතුළත් කරන වියදම් ස්වයංක්‍රීයව අනුමත වේ." : "Vetted directly. Your overhead recordings skip queue.")
              : (lang === "si" ? "ඔබ ඇතුළත් කරන වියදම් අනුමත කිරීම අනිවාර්ය වේ." : "Pending flags apply. Overhead logs require counter clearance.")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form to log office expenses */}
        <div className="lg:col-span-4" id="overhead-expense-form-container">
          <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-850 tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-slate-500" />
              {lang === "si" ? "කාර්යාලීය වියදම් සටහන් කිරීම" : "File Corporate Overhead"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                  {lang === "si" ? "දිනය" : "Date"}
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.8 text-xs text-slate-800 outline-none focus:border-indigo-400"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                  {lang === "si" ? "වියදම් කාණ්ඩය" : "Expense Category"}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.8 text-xs text-slate-800 outline-none font-bold"
                >
                  <option value="ELECTRICITY">{lang === "si" ? "විදුලි බිල (Electricity)" : "Electricity Bill"}</option>
                  <option value="WATER">{lang === "si" ? "වතුර බිල (Water)" : "Water Bill"}</option>
                  <option value="RENT">{lang === "si" ? "කාර්යාල කුලිය (Rent)" : "Office Space Rent"}</option>
                  <option value="STATIONERY">{lang === "si" ? "ලිපිද්‍රව්‍ය (Stationery)" : "Papers & Stationery"}</option>
                  <option value="INTERNET">{lang === "si" ? "අන්තර්ජාලය / පෝන් බිල්" : "Internet & Telephone"}</option>
                  <option value="MAINTENANCE">{lang === "si" ? "කාර්යාල නඩත්තු (Maintenance)" : "Maintenance & Utility"}</option>
                  <option value="SALARY">{lang === "si" ? "කාර්යාල වැටුප් (Office Salary)" : "Salaries & Pocket Cash"}</option>
                  <option value="OTHER">{lang === "si" ? "වෙනත් වියදම් (Other)" : "Other Miscellaneous"}</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                  {lang === "si" ? "වියදම් මුදල (LKR) *" : "Expense Amount (LKR) *"}
                </label>
                <input
                  type="number"
                  required
                  placeholder="Rs. 1500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.8 text-xs font-mono font-black text-slate-800 outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                  {lang === "si" ? "වියදම් විස්තරය *" : "Expense Description *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === "si" ? "උදා: මැයි මාසයේ විදුලි බිල ගෙවීම..." : "e.g., Water bill for May 2026..."}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.8 text-xs text-slate-800 outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                  {lang === "si" ? "අමතර සටහන් (Optional)" : "Optional Notes"}
                </label>
                <textarea
                  rows={2}
                  placeholder={lang === "si" ? "වෙනත් විස්තර..." : "Add voucher references or notes..."}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.8 text-xs text-slate-700 outline-none resize-none focus:border-indigo-400"
                ></textarea>
              </div>

              {/* Bill Attachment Upload Block */}
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                  {lang === "si" ? "බිල්පත / ලදුපත ඇමුණුම" : "Attach Receipt Voucher (Optional)"}
                </span>

                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border border-dashed rounded-xl p-3.5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ${
                    dragActive 
                      ? "border-indigo-500 bg-indigo-50/50" 
                      : billImage 
                        ? "border-emerald-300 bg-emerald-50/30" 
                        : "border-slate-200 hover:bg-slate-50 bg-slate-50/30"
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  {billImage ? (
                    <div className="space-y-1">
                      <div className="w-12 h-12 bg-slate-200 rounded-lg overflow-hidden mx-auto border border-emerald-200 relative">
                        <img src={billImage} alt="bill receipt" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setBillImage("");
                          }} 
                          className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-rose-450 font-black text-[9px] transition"
                        >
                          REMOVE
                        </button>
                      </div>
                      <p className="text-[9px] font-bold text-emerald-700">{lang === "si" ? "පින්තූරය ඇතුලත් කර ඇත" : "Voucher image linked!"}</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-[9px] font-bold text-slate-600 leading-none">{lang === "si" ? "මවුසයෙන් ඇද මෙතනට දමන්න (Drag)" : "Drag & Drop Image Here"}</p>
                        <p className="text-[8px] text-slate-400 mt-0.5 leading-none">{lang === "si" ? "නැතහොත් ක්ලික් කර පින්තූරයක් තෝරන්න" : "or click to tap gallery roll"}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Status indicator on submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-xl text-xs active:scale-95 transition-all outline-none flex items-center justify-center gap-1 cursor-pointer shadow-sm shadow-slate-900/10"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  {lang === "si" ? "වියදම ඇතුළත් කරන්න" : "Save Office Expense"}
                </button>
                
                {hasApprovalAuthority ? (
                  <p className="text-[8px] font-bold text-emerald-600 text-center mt-1.5 flex items-center justify-center gap-0.5" id="auto-approve-notice">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {lang === "si" ? "අනුමත බලය ඇත - ස්වයංක්‍රීය අනුමැතිය ලැබෙනු ඇත" : "Direct entry: Auto-approved immediately"}
                  </p>
                ) : (
                  <p className="text-[8px] font-bold text-amber-600 text-center mt-1.5 flex items-center justify-center gap-0.5" id="awaiting-approve-notice">
                    <AlertCircle className="w-2.5 h-2.5 inline" />
                    {lang === "si" ? "අවධානයයි - ඇතුළත් කල පසු අනුමැතිය අවශ්‍යයි" : "Attention: Overhead logs require supervisor signoff"}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Expenditures Directory Ledger Table */}
        <div className="lg:col-span-8 space-y-4" id="overhead-expense-ledger-table-container">
          <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-xs space-y-4 min-h-[400px] flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black uppercase text-slate-850 tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-slate-500" />
                  {lang === "si" ? "කාර්යාලීය වියදම් ලේඛන" : "Expenditures ledger logs"}
                </h3>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold outline-none text-slate-700"
                  >
                    <option value="ALL">{lang === "si" ? "සියලුම කාණ්ඩ" : "All Categories"}</option>
                    <option value="ELECTRICITY">{lang === "si" ? "විදුලි බිල (Electricity)" : "Electricity"}</option>
                    <option value="WATER">{lang === "si" ? "වතුර බිල (Water)" : "Water"}</option>
                    <option value="RENT">{lang === "si" ? "කුලිය (Rent)" : "Office Space Rent"}</option>
                    <option value="STATIONERY">{lang === "si" ? "ලිපිද්‍රව්‍ය (Stationery)" : "Papers & Stationery"}</option>
                    <option value="INTERNET">{lang === "si" ? "අන්තර්ජාලය / පෝන්" : "Internet & Telephone"}</option>
                    <option value="MAINTENANCE">{lang === "si" ? "නඩත්තු (Maintenance)" : "Maintenance"}</option>
                    <option value="SALARY">{lang === "si" ? "කාර්යාල වැටුප් (Office Salary)" : "Salaries"}</option>
                    <option value="OTHER">{lang === "si" ? "වෙනත් (Other)" : "Other Miscellaneous"}</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold outline-none text-slate-700"
                  >
                    <option value="ALL">{lang === "si" ? "සියලුම තත්වයන්" : "All Clearance status"}</option>
                    <option value="APPROVED">{lang === "si" ? "අනුමත කළ (Approved)" : "Approved"}</option>
                    <option value="PENDING">{lang === "si" ? "අනුමැතියේ රැඳි (Pending)" : "Pending Admin Audit"}</option>
                    <option value="REJECTED">{lang === "si" ? "ප්‍රතික්ෂේපිත (Rejected)" : "Audit Rejected"}</option>
                  </select>
                </div>
              </div>

              {/* Table Ledger area */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 w-28">{lang === "si" ? "දිනය" : "Date"}</th>
                      <th className="pb-3 w-28">{lang === "si" ? "කාණ්ඩය" : "Category"}</th>
                      <th className="pb-3">{lang === "si" ? "ස්වභාවය සහ වාර්තාකරු" : "Description & Filer"}</th>
                      <th className="pb-3">{lang === "si" ? "තත්ත්වය" : "Approval Status"}</th>
                      <th className="pb-3 text-right w-28">{lang === "si" ? "වියදම් මුදල" : "Expense Sum"}</th>
                      <th className="pb-3 text-center w-24">{lang === "si" ? "ක්‍රියා" : "Desk controls"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-55">
                    {filteredList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 font-medium font-mono">
                          {lang === "si" ? "කිසිදු කාර්යාලීය වියදම් වාර්තා හමු නොවිණි." : "No registered office expenditures catalogued."}
                        </td>
                      </tr>
                    ) : (
                      filteredList.map((e) => {
                        const isApproved = e.status === "APPROVED";
                        const isPending = e.status === "PENDING";
                        const isRejected = e.status === "REJECTED";

                        return (
                          <tr key={e.id} className="hover:bg-slate-50/50 transition">
                            {/* Date & Ref */}
                            <td className="py-3 font-mono">
                              <span className="text-slate-500 font-bold block">{e.date}</span>
                              <span className="text-[8px] text-slate-400 font-black tracking-wider block">{e.id}</span>
                            </td>

                            {/* Category with icon */}
                            <td className="py-3">
                              <div className="flex items-center gap-1.5">
                                <span className="p-1 bg-slate-50 border border-slate-100 rounded-md">
                                  {getCategoryIcon(e.category)}
                                </span>
                                <span className="font-bold text-[10px] uppercase text-slate-700 whitespace-nowrap">
                                  {getCategoryLabel(e.category).split(" ")[0]}
                                </span>
                              </div>
                            </td>

                            {/* Description, nodes, submitter */}
                            <td className="py-3 max-w-[180px]">
                              <p className="text-slate-800 font-extrabold truncate">{e.description}</p>
                              {e.notes && <p className="text-[9px] text-slate-400 font-semibold truncate">Notes: {e.notes}</p>}
                              <p className="text-[9px] text-slate-400 mt-1 leading-none font-bold">
                                {lang === "si" ? "වාර්තාකරු: " : "Filer: "}
                                <span className="text-slate-500 font-bold underline decoration-dotted">{e.loggedByOfficerName || "SCL staff"}</span>
                              </p>
                            </td>

                            {/* Status label / Approver info */}
                            <td className="py-3 whitespace-nowrap">
                              {isApproved ? (
                                <div className="space-y-0.5">
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black rounded-lg uppercase tracking-wider block w-fit">
                                    APPROVED
                                  </span>
                                  {e.approvedBy && (
                                    <span className="text-[7.5px] text-slate-400 font-bold block">
                                      By: {e.approvedBy}
                                    </span>
                                  )}
                                </div>
                              ) : isPending ? (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-black rounded-lg uppercase tracking-wider block w-fit animate-pulse">
                                  PENDING
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-black rounded-lg uppercase tracking-wider block w-fit">
                                  REJECTED
                                </span>
                              )}
                            </td>

                            {/* Expense amount */}
                            <td className="py-3 text-right font-mono font-black text-rose-650 text-xs">
                              {formatLKR(e.amount)}
                            </td>

                            {/* Action desk buttons */}
                            <td className="py-3">
                              <div className="flex items-center justify-center gap-2">
                                {/* Bill icon if image available */}
                                {e.billImage && (
                                  <a 
                                    href={e.billImage} 
                                    target="_blank" 
                                    rel="noreferrer referrerPolicy"
                                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md border border-slate-200 transition"
                                    title={lang === "si" ? "ලදුපත නරඹන්න" : "View receipt attachment"}
                                  >
                                    <Camera className="w-3.5 h-3.5" />
                                  </a>
                                )}

                                {/* Supervisor Actions: Approve / Reject / Delete */}
                                {hasApprovalAuthority && isPending && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => onUpdateExpenseStatus(e.id, 'APPROVED', loggedOfficerName)}
                                      className="p-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-md font-bold text-[9px] cursor-pointer"
                                      title={lang === "si" ? "අනුමත කරන්න" : "Approve overhead"}
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={() => onUpdateExpenseStatus(e.id, 'REJECTED', loggedOfficerName)}
                                      className="p-1 bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 rounded-md font-bold text-[9px] cursor-pointer"
                                      title={lang === "si" ? "ප්‍රතික්ෂේප කරන්න" : "Reject overhead"}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                )}

                                {/* Admin Deletion */}
                                {hasApprovalAuthority && (
                                  <button
                                    onClick={() => {
                                      if (confirm(lang === "si" ? "මෙම කාර්යාලීය වියදම ලේඛනයෙන් සම්පූර්ණයෙන්ම ඉවත් කිරීමට අවශ්‍යද?" : "Are you sure you want to permanently delete this corporate expense log?")) {
                                        onDeleteExpense(e.id);
                                      }
                                    }}
                                    className="p-1 hover:text-rose-500 rounded-md hover:bg-rose-50 transition text-slate-350 cursor-pointer"
                                    title={lang === "si" ? "මකන්න" : "Delete log"}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Total balance notes */}
            <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-bold font-mono">
              <div>Total catalogued records: <span className="text-slate-650">{filteredList.length} items</span></div>
              <div>Filtered Sum: <span className="text-rose-650">{formatLKR(filteredList.filter(e => e.status === 'APPROVED').reduce((sum, e) => sum + e.amount, 0))}</span></div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
