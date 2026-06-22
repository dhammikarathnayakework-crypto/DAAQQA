/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  User, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  Building, 
  Save, 
  X, 
  ArrowRight,
  ClipboardCheck,
  Calculator,
  Camera,
  Upload,
  Trash2,
  Eye
} from "lucide-react";
import { Loan, ApplicantInfo, RelativeInfo, GuarantorInfo, LoanDetailsType, OfficeUseInfo, FieldOfficer } from "../types";
import { generateId, formatLKR, checkNicStatus } from "../utils";
import { translations, Language } from "../translations";

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
  const fileInputId = React.useId();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      compressAndLoad(e.target.files[0]);
    }
  };

  const compressAndLoad = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.7);
          onChange(compressed);
        } else {
          onChange(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
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
              onClick={() => {
                const w = window.open();
                if (w) {
                  w.document.write(`<img src="${value}" style="max-width:100%; max-height:100vh; display:block; margin:auto;"/>`);
                }
              }}
              className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-lg transition shrink-0"
              title="View full"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg transition shrink-0"
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
          <Camera className="w-5 h-5 text-slate-400 mb-1" />
          <span className="text-[10px] font-bold text-slate-650 block">
            {lang === "si" ? "පින්තූරය තෝරන්න" : "Choose Photo"}
          </span>
          {subLabel && (
            <span className="text-[8px] text-slate-400 block mt-0.5 leading-tight">
              {subLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface LoanFormProps {
  onSave: (loan: Loan) => void;
  onCancel: () => void;
  initialLoan?: Loan;
  fieldOfficers: FieldOfficer[];
  lang: Language;
  loans?: Loan[];
}

export default function LoanForm({ onSave, onCancel, initialLoan, fieldOfficers, lang, loans = [] }: LoanFormProps) {
  const t = translations[lang];
  const isEditMode = !!initialLoan;

  // Applicant State
  const [applicant, setApplicant] = useState<ApplicantInfo>(
    initialLoan?.applicant || { 
      fullName: "", 
      nic: "", 
      address: "", 
      phone: "",
      memberNumber: `MEM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      additionalIncome: 0,
      earnings: 0
    }
  );

  // Relative State
  const [relative, setRelative] = useState<RelativeInfo>(
    initialLoan?.relative || { name: "", relationship: "", nic: "", address: "", phone: "", workAddress: "", idFront: "", idBack: "" }
  );

  // Loan Details State (Requested)
  const [loanDetails, setLoanDetails] = useState<LoanDetailsType>(
    initialLoan?.loanDetails || { requestedAmount: 0, purpose: "" }
  );

  // Guarantors State
  const [guarantor1, setGuarantor1] = useState<GuarantorInfo>(
    initialLoan?.guarantor1 || { name: "", address: "", nic: "", phone: "", isAgreed: false }
  );
  const [guarantor2, setGuarantor2] = useState<GuarantorInfo>(
    initialLoan?.guarantor2 || { name: "", address: "", nic: "", phone: "", isAgreed: false }
  );

  // Check variables for NIC status (Active loan / Active guarantor)
  const applicantNicCheck = checkNicStatus(applicant.nic, loans);
  const relativeNicCheck = checkNicStatus(relative.nic || "", loans);
  const guarantor1NicCheck = checkNicStatus(guarantor1.nic, loans);
  const guarantor2NicCheck = checkNicStatus(guarantor2.nic, loans);

  // Office Use State
  const [officeUse, setOfficeUse] = useState<OfficeUseInfo>({
    applicationNumber: initialLoan?.officeUse.applicationNumber || `SCL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    loanNumber: initialLoan?.officeUse.loanNumber || `L-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    approvedAmount: initialLoan?.officeUse.approvedAmount || 0,
    interestRate: initialLoan?.officeUse.interestRate || 25, 
    installmentsCount: initialLoan?.officeUse.installmentsCount || 12,
    monthlyInstallment: initialLoan?.officeUse.monthlyInstallment || 0,
    specialNotes: initialLoan?.officeUse.specialNotes || "",
    loanDate: initialLoan?.officeUse.loanDate || new Date().toISOString().slice(0, 10),
    finalSettlementDate: initialLoan?.officeUse.finalSettlementDate || "",
    settledDate: initialLoan?.officeUse.settledDate || ""
  });

  const [fixedInstallmentAmount, setFixedInstallmentAmount] = useState<number>(500); 

  // Look for any existing customer with the typed NIC for auto-filling
  const existingCustomerLoan = applicant.nic.trim().length >= 8 
    ? loans.find(l => l.applicant.nic.toLowerCase().trim() === applicant.nic.toLowerCase().trim() && l.id !== initialLoan?.id)
    : undefined;

  const handleAutofill = () => {
    if (existingCustomerLoan) {
      setApplicant(prev => ({
        ...prev,
        fullName: existingCustomerLoan.applicant.fullName,
        address: existingCustomerLoan.applicant.address,
        phone: existingCustomerLoan.applicant.phone,
        memberNumber: existingCustomerLoan.applicant.memberNumber || prev.memberNumber,
        additionalIncome: existingCustomerLoan.applicant.additionalIncome || 0,
        earnings: existingCustomerLoan.applicant.earnings || 0,
      }));
      if (existingCustomerLoan.relative) {
        setRelative(existingCustomerLoan.relative);
      }
      if (existingCustomerLoan.guarantor1) {
        setGuarantor1(existingCustomerLoan.guarantor1);
      }
      if (existingCustomerLoan.guarantor2) {
        setGuarantor2(existingCustomerLoan.guarantor2);
      }
    }
  }; 

  // Automatically auto-populate as soon as matching NIC is found/typed
  useEffect(() => {
    if (!isEditMode && existingCustomerLoan) {
      handleAutofill();
    }
  }, [existingCustomerLoan, isEditMode]);

  // Calculate calculations in real time
  const calculatedInterest = (Number(officeUse.approvedAmount) * (Number(officeUse.interestRate) / 100)) || 0;
  const calculatedTotal = Number(officeUse.approvedAmount) + calculatedInterest;
  const recommendedInstallmentsCount = fixedInstallmentAmount > 0 
    ? Math.ceil(calculatedTotal / fixedInstallmentAmount) 
    : 0;

  // Sync calculations to officeUse state
  useEffect(() => {
    const monthlyVal = Number(officeUse.installmentsCount) > 0 
      ? Math.round(calculatedTotal / officeUse.installmentsCount) 
      : 0;
    
    setOfficeUse(prev => ({
      ...prev,
      monthlyInstallment: monthlyVal
    }));
  }, [officeUse.approvedAmount, officeUse.interestRate, officeUse.installmentsCount, calculatedTotal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalizedLoan: Loan = {
      id: initialLoan?.id || `loan-${generateId()}`,
      status: initialLoan?.status || "ACTIVE",
      applicant,
      relative,
      loanDetails,
      guarantor1,
      guarantor2,
      officeUse,
      collections: initialLoan?.collections || [],
      createdAt: initialLoan?.createdAt || new Date().toISOString(),
    };

    onSave(finalizedLoan);
  };

  const setSuggestedValues = (principal: number) => {
    setOfficeUse(prev => ({
      ...prev,
      approvedAmount: principal,
      interestRate: 25,
    }));
    setLoanDetails(prev => ({
      ...prev,
      requestedAmount: principal
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto select-none animate-fade-in font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-805 flex items-center gap-2 leading-tight">
            <FileText className="w-6 h-6 text-indigo-600" />
            {isEditMode ? t.formTitleEdit : t.formTitleNew}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t.formDesc}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-xl hover:text-slate-650 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Preset quick buttons */}
      {!isEditMode && (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-3 uppercase tracking-wider">
              {lang === "si" ? "ප්‍රධාන මුදල් තැන්පතු පැකේජ" : "Quick Capital Presets Packages"}
            </span>
            <div className="flex flex-wrap gap-2">
              {[10000, 20000, 40000, 50000, 60000, 70000, 80000, 90000, 100000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setSuggestedValues(amt)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold border transition cursor-pointer select-none ${
                      officeUse.approvedAmount === amt 
                      ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                      : "bg-white border-slate-250 text-slate-600 hover:border-slate-350"
                  }`}
                >
                  {formatLKR(amt)}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-bold text-slate-600 font-sans tracking-wide">
              {lang === "si" ? "වෙනත් කැමති මුදලක් ඇතුළත් කරන්න (LKR):" : "Or Enter Selected Capital Amount (LKR):"}
            </span>
            <div className="relative max-w-64 w-full">
              <input
                type="number"
                placeholder={lang === "si" ? "උදා: 25500" : "e.g. 25500"}
                value={officeUse.approvedAmount || ""}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setOfficeUse(prev => ({ ...prev, approvedAmount: val }));
                  setLoanDetails(prev => ({ ...prev, requestedAmount: val }));
                }}
                className="w-full pl-4 pr-12 py-2 rounded-xl text-sm font-mono font-bold border border-slate-300 focus:outline-hidden focus:border-indigo-500 bg-white text-slate-800 transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-extrabold text-indigo-500">LKR</span>
            </div>
          </div>
        </div>
      )}

      {/* Section 1: Applicant Info */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-55 border-slate-100 pb-3">
          <span className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600">
            <User className="w-4 h-4" />
          </span>
          <h3 className="font-extrabold text-slate-755 text-sm">
            {t.secApplicantTitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Generated responsive fields */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-indigo-50/15 p-4 rounded-2xl border border-indigo-100">
            <div className="space-y-1">
              <label className="text-xs font-black text-indigo-700 uppercase tracking-widest block">
                {lang === "si" ? "නව සාමාජික අංකය (New Member Number) *" : "New Member Number (Unique ID) *"}
              </label>
              <input
                type="text"
                required
                value={applicant.memberNumber || ""}
                onChange={(e) => setApplicant({ ...applicant, memberNumber: e.target.value })}
                className="w-full px-4 py-2 bg-white rounded-xl border border-indigo-200 text-indigo-850 text-xs font-mono font-black tracking-wider focus:outline-hidden"
              />
              <p className="text-[9px] text-indigo-550 font-bold">{lang === "si" ? "සාමාජිකයා ලියාපදිංචි වන විට ලැබෙන නව ID අංකය" : "Assigned permanently once registered."}</p>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-black text-indigo-700 uppercase tracking-widest block">
                {lang === "si" ? "ණය ගිණුම් අංකය (Loan Number) *" : "Loan Number (Specific Credit Ref) *"}
              </label>
              <input
                type="text"
                required
                value={officeUse.loanNumber || ""}
                onChange={(e) => {
                  setOfficeUse({ ...officeUse, loanNumber: e.target.value });
                }}
                className="w-full px-4 py-2 bg-white rounded-xl border border-indigo-200 text-indigo-850 text-xs font-mono font-black tracking-wider focus:outline-hidden"
              />
              <p className="text-[9px] text-indigo-550 font-bold">{lang === "si" ? "මෙම ණය අයදුම්පත සඳහා වෙන්වූ අංකය" : "Assigned specifically for this credit loop."}</p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">{t.formFullName}</label>
            <input
              type="text"
              required
              placeholder={lang === "si" ? "සම්පූර්ණ නම ඇතුළත් කරන්න" : "Type full contractual name"}
              value={applicant.fullName}
              onChange={(e) => setApplicant({ ...applicant, fullName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-250 focus:outline-hidden focus:border-indigo-600 bg-slate-50/50 text-slate-750 text-xs font-semibold focus:bg-white transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">{t.formNIC}</label>
            <input
              type="text"
              required
              placeholder="e.g., 198512345678 / 851234567V"
              value={applicant.nic}
              onChange={(e) => setApplicant({ ...applicant, nic: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border focus:outline-hidden transition text-xs font-mono font-bold focus:bg-white ${
                applicantNicCheck.hasActiveLoan 
                  ? "bg-rose-50/20 border-2 border-rose-500 text-rose-900 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/10 shadow-sm" 
                  : applicantNicCheck.isActiveGuarantor 
                    ? "bg-amber-50/20 border-2 border-amber-500 text-amber-900 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/10 shadow-sm" 
                    : "border-slate-250 focus:border-indigo-600 bg-slate-50/50 text-slate-755"
              }`}
            />
            {existingCustomerLoan && (
              <button
                type="button"
                onClick={handleAutofill}
                className="mt-2 text-left w-full text-[10px] font-black bg-indigo-50 hover:bg-indigo-100 text-indigo-700 p-2.5 rounded-xl border border-indigo-200 cursor-pointer block transition duration-150"
              >
                💡 {lang === "si" 
                  ? "පෙර පාරිභෝගික තොරතුරු සොයා ගන්නා ලදී! තොරතුරු ස්වයංක්‍රීයව පිරවීමට මෙහි ක්ලික් කරන්න." 
                  : "Existing customer profile found! Click here to automatically auto-fill current details."}
              </button>
            )}
            {applicantNicCheck.hasActiveLoan && (
              <p className="text-[9.5px] font-black text-rose-600 mt-1 uppercase tracking-wider">
                ⚠️ {lang === "si" 
                  ? `දැනට සක්‍රීය ණය මුදලක් පවතී! (අංකය: ${applicantNicCheck.activeLoanRef})` 
                  : `Active running loan detects! (Ref: ${applicantNicCheck.activeLoanRef})`}
              </p>
            )}
            {applicantNicCheck.isActiveGuarantor && (
              <p className="text-[9.5px] font-black text-amber-600 mt-1 uppercase tracking-wider">
                ⚠️ {lang === "si" 
                  ? `දැනට ${applicantNicCheck.guarantorLoanBorrowerName} ගේ ණයට ඇපකරුවෙකි! (අංකය: ${applicantNicCheck.guarantorLoanRef})` 
                  : `Registered guarantor for ${applicantNicCheck.guarantorLoanBorrowerName}! (Ref: ${applicantNicCheck.guarantorLoanRef})`}
              </p>
            )}
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-slate-400 uppercase">{t.formAddress}</label>
            <textarea
              required
              rows={2}
              placeholder={lang === "si" ? "ලිපිනය ඇතුළත් කරන්න" : "Permanent residency bounds details"}
              value={applicant.address}
              onChange={(e) => setApplicant({ ...applicant, address: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-250 focus:outline-hidden focus:border-indigo-600 bg-slate-50/50 text-slate-750 text-xs font-semibold focus:bg-white transition resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">{t.formPhone}</label>
            <input
              type="tel"
              required
              placeholder="e.g., 0771234567"
              value={applicant.phone}
              onChange={(e) => setApplicant({ ...applicant, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-250 focus:outline-hidden focus:border-indigo-600 bg-slate-50/50 text-slate-750 text-xs font-mono font-bold focus:bg-white transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">
              {lang === "si" ? "අතිරේක ආදායම (Additional Income)" : "Additional Income"}
            </label>
            <input
              type="number"
              placeholder="e.g., 25000"
              value={applicant.additionalIncome || ""}
              onChange={(e) => setApplicant({ ...applicant, additionalIncome: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-250 focus:outline-hidden focus:border-indigo-600 bg-slate-50/50 text-slate-750 text-xs font-mono font-bold focus:bg-white transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">
              {lang === "si" ? "පෞද්ගලික ඉපැයීම් (Earnings)" : "Earnings"}
            </label>
            <input
              type="number"
              placeholder="e.g., 75050"
              value={applicant.earnings || ""}
              onChange={(e) => setApplicant({ ...applicant, earnings: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-250 focus:outline-hidden focus:border-indigo-600 bg-slate-50/50 text-slate-750 text-xs font-mono font-bold focus:bg-white transition"
            />
          </div>

          {/* Document Uploads Row */}
          <div className="md:col-span-2 border-t border-slate-100 pt-5 mt-2">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5 font-sans">
              <ClipboardCheck className="w-4 h-4 text-indigo-500 animate-pulse" />
              {lang === "si" ? "අවශ්‍ය ලිපි ලේඛන සහ පින්තූර (ණයකරු)" : "Required Photo Identifications & Proofs (Borrower)"}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ImageUploadField
                label={lang === "si" ? "හැඳුනුම්පත ඉදිරිපස" : "Borrower ID Card (Front)"}
                subLabel={lang === "si" ? "ID පතෙහි ඉදිරිපස පැහැදිලි පින්තූරයක්" : "Sharp focus front view of National ID"}
                value={applicant.idFront}
                onChange={(base64) => setApplicant({ ...applicant, idFront: base64 })}
                onClear={() => setApplicant({ ...applicant, idFront: "" })}
                lang={lang}
              />
              <ImageUploadField
                label={lang === "si" ? "හැඳුනුම්පත පසුපස" : "Borrower ID Card (Back)"}
                subLabel={lang === "si" ? "ID පතෙහි පසුපස පැහැදිලි පින්තූරයක්" : "Sharp focus back view of National ID"}
                value={applicant.idBack}
                onChange={(base64) => setApplicant({ ...applicant, idBack: base64 })}
                onClear={() => setApplicant({ ...applicant, idBack: "" })}
                lang={lang}
              />
              <ImageUploadField
                label={lang === "si" ? "අත්සන් කළ ගිවිසුම් පත්‍රය" : "Signed Loan Application / Proof"}
                subLabel={lang === "si" ? "අත්සන තහවුරු කළ මුළු පත්‍රයේ පින්තූරය" : "Signature-verified full application paper copy"}
                value={applicant.signedDoc}
                onChange={(base64) => setApplicant({ ...applicant, signedDoc: base64 })}
                onClear={() => setApplicant({ ...applicant, signedDoc: "" })}
                lang={lang}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Relative Info */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="bg-slate-100 p-1.5 rounded-lg text-slate-600">
            <Users className="w-4 h-4" />
          </span>
          <h3 className="font-extrabold text-slate-750 text-sm">
            {t.secRelativeTitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">{t.formRelName}</label>
            <input
              type="text"
              placeholder={lang === "si" ? "නම" : "Endorser legal name"}
              value={relative.name}
              onChange={(e) => setRelative({ ...relative, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-250 focus:outline-hidden focus:border-indigo-600 bg-slate-50/50 text-slate-750 text-xs font-semibold focus:bg-white transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">{t.formRelType}</label>
            <input
              type="text"
              placeholder={lang === "si" ? "ඥාතිත්වය" : "e.g., Wife/Brother/Parent"}
              value={relative.relationship}
              onChange={(e) => setRelative({ ...relative, relationship: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-250 focus:outline-hidden focus:border-indigo-600 bg-slate-50/50 text-slate-750 text-xs font-semibold focus:bg-white transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">{t.formRelNic}</label>
            <input
              type="text"
              placeholder="NIC Code"
              value={relative.nic}
              onChange={(e) => setRelative({ ...relative, nic: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-xl border focus:outline-hidden transition text-xs font-mono font-bold focus:bg-white ${
                relativeNicCheck.hasActiveLoan 
                  ? "bg-rose-50/20 border-2 border-rose-500 text-rose-900 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/10 shadow-sm" 
                  : relativeNicCheck.isActiveGuarantor 
                    ? "bg-amber-50/20 border-2 border-amber-500 text-amber-900 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/10 shadow-sm" 
                    : "border-slate-250 focus:border-indigo-600 bg-slate-50/50 text-slate-755"
              }`}
            />
            {relativeNicCheck.hasActiveLoan && (
              <p className="text-[9.5px] font-black text-rose-600 mt-1 uppercase tracking-wider">
                ⚠️ {lang === "si" 
                  ? `දැනට සක්‍රීය ණය මුදලක් පවතී! (අංකය: ${relativeNicCheck.activeLoanRef})` 
                  : `Active running loan detects! (Ref: ${relativeNicCheck.activeLoanRef})`}
              </p>
            )}
            {relativeNicCheck.isActiveGuarantor && (
              <p className="text-[9.5px] font-black text-amber-600 mt-1 uppercase tracking-wider">
                ⚠️ {lang === "si" 
                  ? `දැනට ${relativeNicCheck.guarantorLoanBorrowerName} ගේ ණයට ඇපකරුවෙකි! (අංකය: ${relativeNicCheck.guarantorLoanRef})` 
                  : `Registered guarantor for ${relativeNicCheck.guarantorLoanBorrowerName}! (Ref: ${relativeNicCheck.guarantorLoanRef})`}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">{t.formRelPhone}</label>
            <input
              type="tel"
              placeholder="Contact No"
              value={relative.phone}
              onChange={(e) => setRelative({ ...relative, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-250 focus:outline-hidden focus:border-indigo-600 bg-slate-50/50 text-slate-755 text-xs font-mono font-bold focus:bg-white transition"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-slate-400 uppercase">{t.formAddress}</label>
            <input
              type="text"
              placeholder={lang === "si" ? "පදිංචි ලිපිනය" : "Residential address details"}
              value={relative.address}
              onChange={(e) => setRelative({ ...relative, address: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-250 focus:outline-hidden focus:border-indigo-600 bg-slate-50/50 text-slate-750 text-xs font-semibold focus:bg-white transition"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-slate-400 uppercase">{t.formRelWork}</label>
            <input
              type="text"
              placeholder={lang === "si" ? "සේවා ස්ථානයේ ලිපිනය" : "Work or trade location details"}
              value={relative.workAddress}
              onChange={(e) => setRelative({ ...relative, workAddress: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-250 focus:outline-hidden focus:border-indigo-600 bg-slate-50/50 text-slate-750 text-xs font-semibold focus:bg-white transition"
            />
          </div>

          {/* Document Uploads Row for Relative/Endorser */}
          <div className="md:col-span-2 border-t border-slate-105/50 pt-4 mt-1">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 font-sans">
              <Camera className="w-3.5 h-3.5 text-indigo-505" />
              {lang === "si" ? "අවශ්‍ය හැඳුනුම්පත් ඡායාරූප (ඥාතීන් / නිර්දේශකයින්)" : "Required Photo Identifications (Relative / Reference)"}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ImageUploadField
                label={lang === "si" ? "හැඳුනුම්පත ඉදිරිපස (ඥාති)" : "Relative/Ref ID (Front)"}
                value={relative.idFront}
                onChange={(base64) => setRelative({ ...relative, idFront: base64 })}
                onClear={() => setRelative({ ...relative, idFront: "" })}
                lang={lang}
              />
              <ImageUploadField
                label={lang === "si" ? "හැඳුනුම්පත පසුපස (ඥාති)" : "Relative/Ref ID (Back)"}
                value={relative.idBack}
                onChange={(base64) => setRelative({ ...relative, idBack: base64 })}
                onClear={() => setRelative({ ...relative, idBack: "" })}
                lang={lang}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Loan Details */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600">
            <DollarSign className="w-4 h-4" />
          </span>
          <h3 className="font-extrabold text-slate-750 text-sm">
            {t.secLoanRequestTitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">{t.formReqAmount}</label>
            <input
              type="number"
              placeholder="LKR amount"
              value={loanDetails.requestedAmount || ""}
              onChange={(e) => setLoanDetails({ ...loanDetails, requestedAmount: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-250 focus:outline-hidden focus:border-indigo-600 bg-slate-50/50 text-slate-750 font-mono text-xs font-bold focus:bg-white transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">{t.formReqPurpose}</label>
            <input
              type="text"
              placeholder={lang === "si" ? "කුඩා ව්‍යාපාර වැනි අරමුණ ඇතුළත් කරන්න" : "Commercial expansion purpose limits"}
              value={loanDetails.purpose}
              onChange={(e) => setLoanDetails({ ...loanDetails, purpose: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-250 focus:outline-hidden focus:border-indigo-600 bg-slate-50/50 text-slate-750 text-xs font-semibold focus:bg-white transition"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Guarantor Info */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 space-y-8 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="bg-slate-100 p-1.5 rounded-lg text-slate-650">
            <ShieldCheck className="w-4.5 h-4.5" />
          </span>
          <h3 className="font-extrabold text-slate-750 text-sm">
            {t.guarantorsAndRelatives}
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Guarantor 1 */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
            <span className="text-xs font-black text-slate-400 block uppercase tracking-wider">
              {t.guarantor1}
            </span>
            <div className="space-y-3">
              <input
                type="text"
                placeholder={lang === "si" ? "සම්පූර්ණ නම" : "Full legal name"}
                value={guarantor1.name}
                onChange={(e) => setGuarantor1({ ...guarantor1, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-bold placeholder-slate-400 rounded-xl border border-slate-250 bg-white"
              />
              <input
                type="text"
                placeholder={lang === "si" ? "ලිපිනය" : "Address bounds"}
                value={guarantor1.address}
                onChange={(e) => setGuarantor1({ ...guarantor1, address: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-bold placeholder-slate-400 rounded-xl border border-slate-250 bg-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <input
                    type="text"
                    placeholder="NIC Code"
                    value={guarantor1.nic}
                    onChange={(e) => setGuarantor1({ ...guarantor1, nic: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-xs font-mono font-bold placeholder-slate-400 rounded-xl border focus:outline-hidden transition bg-white ${
                      guarantor1NicCheck.hasActiveLoan 
                        ? "border-2 border-rose-500 bg-rose-50/10 text-rose-900 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/10 shadow-sm" 
                        : guarantor1NicCheck.isActiveGuarantor 
                          ? "border-2 border-amber-500 bg-amber-50/10 text-amber-900 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/10 shadow-sm" 
                          : "border-slate-250 text-slate-755"
                    }`}
                  />
                  {guarantor1NicCheck.hasActiveLoan && (
                    <span className="text-[8.5px] font-black text-rose-600 mt-1 uppercase leading-tight">
                      ⚠️ {lang === "si" ? `ණය ඇත! (${guarantor1NicCheck.activeLoanRef})` : `Active loan! (${guarantor1NicCheck.activeLoanRef})`}
                    </span>
                  )}
                  {guarantor1NicCheck.isActiveGuarantor && (
                    <span className="text-[8.5px] font-black text-amber-600 mt-1 uppercase leading-tight">
                      ⚠️ {lang === "si" ? `ඇපකරු! (${guarantor1NicCheck.guarantorLoanRef})` : `Guarantor! (${guarantor1NicCheck.guarantorLoanRef})`}
                    </span>
                  )}
                </div>
                <input
                  type="tel"
                  placeholder="Contact Line"
                  value={guarantor1.phone}
                  onChange={(e) => setGuarantor1({ ...guarantor1, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-bold placeholder-slate-400 rounded-xl border border-slate-250 font-mono bg-white"
                />
              </div>
              <label className="flex items-start gap-2 pt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={guarantor1.isAgreed}
                  onChange={(e) => setGuarantor1({ ...guarantor1, isAgreed: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-[10px] leading-relaxed text-slate-400 italic">
                  {t.formG1Agree}
                </span>
              </label>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-205/50 pt-3">
                <ImageUploadField
                  label={lang === "si" ? "හැඳුනුම්පත ඉදිරිපස" : "Guarantor 1 ID (Front)"}
                  value={guarantor1.idFront}
                  onChange={(base64) => setGuarantor1({ ...guarantor1, idFront: base64 })}
                  onClear={() => setGuarantor1({ ...guarantor1, idFront: "" })}
                  lang={lang}
                />
                <ImageUploadField
                  label={lang === "si" ? "හැඳුනුම්පත පසුපස" : "Guarantor 1 ID (Back)"}
                  value={guarantor1.idBack}
                  onChange={(base64) => setGuarantor1({ ...guarantor1, idBack: base64 })}
                  onClear={() => setGuarantor1({ ...guarantor1, idBack: "" })}
                  lang={lang}
                />
              </div>
            </div>
          </div>

          {/* Guarantor 2 */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
            <span className="text-xs font-black text-slate-400 block uppercase tracking-wider">
              {t.guarantor2}
            </span>
            <div className="space-y-3">
              <input
                type="text"
                placeholder={lang === "si" ? "සම්පූර්ණ නම" : "Full legal name"}
                value={guarantor2.name}
                onChange={(e) => setGuarantor2({ ...guarantor2, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-bold placeholder-slate-400 rounded-xl border border-slate-250 bg-white"
              />
              <input
                type="text"
                placeholder={lang === "si" ? "ලිපිනය" : "Address bounds"}
                value={guarantor2.address}
                onChange={(e) => setGuarantor2({ ...guarantor2, address: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-bold placeholder-slate-400 rounded-xl border border-slate-250 bg-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <input
                    type="text"
                    placeholder="NIC Code"
                    value={guarantor2.nic}
                    onChange={(e) => setGuarantor2({ ...guarantor2, nic: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-xs font-mono font-bold placeholder-slate-400 rounded-xl border focus:outline-hidden transition bg-white ${
                      guarantor2NicCheck.hasActiveLoan 
                        ? "border-2 border-rose-500 bg-rose-50/10 text-rose-900 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/10 shadow-sm" 
                        : guarantor2NicCheck.isActiveGuarantor 
                          ? "border-2 border-amber-500 bg-amber-50/10 text-amber-900 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/10 shadow-sm" 
                          : "border-slate-250 text-slate-755"
                    }`}
                  />
                  {guarantor2NicCheck.hasActiveLoan && (
                    <span className="text-[8.5px] font-black text-rose-600 mt-1 uppercase leading-tight">
                      ⚠️ {lang === "si" ? `ණය ඇත! (${guarantor2NicCheck.activeLoanRef})` : `Active loan! (${guarantor2NicCheck.activeLoanRef})`}
                    </span>
                  )}
                  {guarantor2NicCheck.isActiveGuarantor && (
                    <span className="text-[8.5px] font-black text-amber-600 mt-1 uppercase leading-tight">
                      ⚠️ {lang === "si" ? `ඇපකරු! (${guarantor2NicCheck.guarantorLoanRef})` : `Guarantor! (${guarantor2NicCheck.guarantorLoanRef})`}
                    </span>
                  )}
                </div>
                <input
                  type="tel"
                  placeholder="Contact Line"
                  value={guarantor2.phone}
                  onChange={(e) => setGuarantor2({ ...guarantor2, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-bold placeholder-slate-400 rounded-xl border border-slate-250 font-mono bg-white"
                />
              </div>
              <label className="flex items-start gap-2 pt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={guarantor2.isAgreed}
                  onChange={(e) => setGuarantor2({ ...guarantor2, isAgreed: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-[10px] leading-relaxed text-slate-400 italic">
                  {t.formG2Agree}
                </span>
              </label>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-205/50 pt-3">
                <ImageUploadField
                  label={lang === "si" ? "හැඳුනුම්පත ඉදිරිපස" : "Guarantor 2 ID (Front)"}
                  value={guarantor2.idFront}
                  onChange={(base64) => setGuarantor2({ ...guarantor2, idFront: base64 })}
                  onClear={() => setGuarantor2({ ...guarantor2, idFront: "" })}
                  lang={lang}
                />
                <ImageUploadField
                  label={lang === "si" ? "හැඳුනුම්පත පසුපස" : "Guarantor 2 ID (Back)"}
                  value={guarantor2.idBack}
                  onChange={(base64) => setGuarantor2({ ...guarantor2, idBack: base64 })}
                  onClear={() => setGuarantor2({ ...guarantor2, idBack: "" })}
                  lang={lang}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Office Use Only */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-950 p-2 rounded-xl text-indigo-400 border border-indigo-900/30">
              <Building className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-100 font-sans tracking-tight text-sm">
                {t.secOfficeUseTitle}
              </h3>
              <p className="text-[10px] text-slate-400">
                Seth Capital Internal Credit Term Variables Underwriting
              </p>
            </div>
          </div>
        </div>

        {/* Calculations display bento-grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <div className="space-y-1 p-2">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">{lang === "si" ? "පොලී මුදල (25%)" : "Interest Accumulation (25%)"}</span>
            <p className="text-xl font-extrabold font-mono text-indigo-400">{formatLKR(calculatedInterest)}</p>
            <p className="text-[9px] text-slate-500">Based on approved capital values</p>
          </div>
          <div className="space-y-1 p-2 border-y md:border-y-0 md:border-x border-slate-800">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">{lang === "si" ? "මුළු එකතුව (Total)" : "Aggregate Repayable Debt"}</span>
            <p className="text-xl font-extrabold font-mono text-emerald-400">{formatLKR(calculatedTotal)}</p>
            <p className="text-[9px] text-slate-500">Repayment obligation capital</p>
          </div>
          <div className="space-y-1 p-2 flex flex-col justify-center text-xs">
            <div className="flex items-center gap-1 mb-1">
              <Calculator className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Interactive Amortizer</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-300">Rs</span>
              <input 
                type="number" 
                value={fixedInstallmentAmount} 
                onChange={(e) => setFixedInstallmentAmount(Math.max(1, Number(e.target.value)))}
                className="w-16 px-1.5 py-0.5 rounded border border-slate-700 bg-slate-900 text-[11px] font-bold font-mono text-center text-white focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400">yields</span>
              <span className="text-[11px] font-black font-mono text-white bg-slate-800 px-2 py-0.5 rounded">{recommendedInstallmentsCount}</span>
              <span className="text-[10px] text-slate-400">cycles</span>
            </div>
          </div>
        </div>

        {/* Input Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase">{t.formAppNumber}</label>
            <input
              type="text"
              required
              value={officeUse.applicationNumber}
              onChange={(e) => setOfficeUse({ ...officeUse, applicationNumber: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-hidden focus:border-indigo-500 bg-slate-950 text-white text-xs font-mono font-bold transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase">{t.formApprovedAmount}</label>
            <input
              type="number"
              required
              placeholder="Issued capital"
              value={officeUse.approvedAmount || ""}
              onChange={(e) => setOfficeUse({ ...officeUse, approvedAmount: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-hidden focus:border-indigo-500 bg-slate-950 text-white text-xs font-mono font-bold transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase">{t.formIntRate}</label>
            <input
              type="number"
              required
              value={officeUse.interestRate}
              onChange={(e) => setOfficeUse({ ...officeUse, interestRate: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-hidden focus:border-indigo-500 bg-slate-950 text-white text-xs font-mono font-bold transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase">{t.formInstallments}</label>
            <input
              type="number"
              required
              value={officeUse.installmentsCount}
              onChange={(e) => setOfficeUse({ ...officeUse, installmentsCount: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-hidden focus:border-indigo-500 bg-slate-950 text-white text-xs font-mono font-bold transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase">{t.formMonthlyInst}</label>
            <input
              type="number"
              required
              value={officeUse.monthlyInstallment}
              onChange={(e) => setOfficeUse({ ...officeUse, monthlyInstallment: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-hidden focus:border-indigo-500 bg-slate-950 text-white text-xs font-mono font-bold transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase">{t.formLoanDate}</label>
            <input
              type="date"
              required
              value={officeUse.loanDate}
              onChange={(e) => setOfficeUse({ ...officeUse, loanDate: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-hidden focus:border-indigo-500 bg-slate-950 text-white text-xs font-mono font-bold transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase">{lang === "si" ? "ණය මුදල ලබා දෙන නිලධාරියා" : "Disbursed By (Field Officer)"}</label>
            <select
              required
              value={officeUse.disbursedByOfficerId || ""}
              onChange={(e) => setOfficeUse({ ...officeUse, disbursedByOfficerId: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-hidden focus:border-indigo-500 bg-slate-950 text-white text-xs font-bold transition"
            >
              <option value="" disabled>{lang === "si" ? "-- නිලධාරියා තෝරන්න --" : "-- Select Officer --"}</option>
              <option value="OFFICE">{lang === "si" ? "කාර්යාලයෙන් කෙලින්ම ගෙවීම (Direct Office Payment)" : "Direct Office Payment"}</option>
              {fieldOfficers.filter(o => o.status !== 'INACTIVE').map(o => (
                <option key={o.id} value={o.id}>{o.name} ({o.nic})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-405 text-slate-400 uppercase">
              {lang === "si" ? "පියවූ දිනය (Settled Date)" : "Settled Date (To mark closure)"}
            </label>
            <input
              type="date"
              value={officeUse.settledDate || ""}
              onChange={(e) => setOfficeUse({ ...officeUse, settledDate: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-hidden focus:border-indigo-550 bg-slate-950 text-white text-xs font-mono font-bold transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-405 text-slate-400 uppercase">
              {lang === "si" ? "අවසන් පියවීම් දිනය (Final Due Date)" : "Final date to be settled"}
            </label>
            <input
              type="date"
              value={officeUse.finalSettlementDate || ""}
              onChange={(e) => setOfficeUse({ ...officeUse, finalSettlementDate: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-hidden focus:border-indigo-550 bg-slate-950 text-white text-xs font-mono font-bold transition"
            />
          </div>

          <div className="space-y-1.5 md:col-span-3">
            <label className="text-[11px] font-bold text-slate-400 uppercase">{t.formSpecialNotes}</label>
            <textarea
              rows={2}
              placeholder="Underwriting remarks..."
              value={officeUse.specialNotes}
              onChange={(e) => setOfficeUse({ ...officeUse, specialNotes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-hidden focus:border-indigo-505 bg-slate-950 text-white text-xs font-semibold transition resize-none"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold rounded-xl text-xs transition cursor-pointer"
        >
          {t.formCancel}
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition shadow-lg shadow-indigo-600/10 cursor-pointer"
        >
          <Save className="w-4 h-4 animate-bounce" />
          {t.formSubmitSave}
        </button>
      </div>
    </form>
  );
}
