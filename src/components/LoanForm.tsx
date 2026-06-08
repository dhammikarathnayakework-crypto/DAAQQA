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
  Calculator
} from "lucide-react";
import { Loan, ApplicantInfo, RelativeInfo, GuarantorInfo, LoanDetailsType, OfficeUseInfo, FieldOfficer } from "../types";
import { generateId, formatLKR } from "../utils";
import { translations, Language } from "../translations";

interface LoanFormProps {
  onSave: (loan: Loan) => void;
  onCancel: () => void;
  initialLoan?: Loan;
  fieldOfficers: FieldOfficer[];
  lang: Language;
}

export default function LoanForm({ onSave, onCancel, initialLoan, fieldOfficers, lang }: LoanFormProps) {
  const t = translations[lang];
  const isEditMode = !!initialLoan;

  // Applicant State
  const [applicant, setApplicant] = useState<ApplicantInfo>(
    initialLoan?.applicant || { fullName: "", nic: "", address: "", phone: "" }
  );

  // Relative State
  const [relative, setRelative] = useState<RelativeInfo>(
    initialLoan?.relative || { name: "", relationship: "", nic: "", address: "", phone: "", workAddress: "" }
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

  // Office Use State
  const [officeUse, setOfficeUse] = useState<OfficeUseInfo>({
    applicationNumber: initialLoan?.officeUse.applicationNumber || `SCL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    approvedAmount: initialLoan?.officeUse.approvedAmount || 0,
    interestRate: initialLoan?.officeUse.interestRate || 25, 
    installmentsCount: initialLoan?.officeUse.installmentsCount || 12,
    monthlyInstallment: initialLoan?.officeUse.monthlyInstallment || 0,
    specialNotes: initialLoan?.officeUse.specialNotes || "",
    loanDate: initialLoan?.officeUse.loanDate || new Date().toISOString().slice(0, 10),
  });

  const [fixedInstallmentAmount, setFixedInstallmentAmount] = useState<number>(500); 

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
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
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
      )}

      {/* Section 1: Applicant Info */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-55 border-slate-100 pb-3">
          <span className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600">
            <User className="w-4 h-4" />
          </span>
          <h3 className="font-extrabold text-slate-750 text-sm">
            {t.secApplicantTitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              className="w-full px-4 py-2.5 rounded-xl border border-slate-250 focus:outline-hidden focus:border-indigo-600 bg-slate-50/50 text-slate-755 text-xs font-mono font-bold focus:bg-white transition"
            />
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
              className="w-full px-4 py-2.5 rounded-xl border border-slate-250 focus:outline-hidden focus:border-indigo-600 bg-slate-50/50 text-slate-755 text-xs font-mono font-bold focus:bg-white transition"
            />
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
                <input
                  type="text"
                  placeholder="NIC Code"
                  value={guarantor1.nic}
                  onChange={(e) => setGuarantor1({ ...guarantor1, nic: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-bold placeholder-slate-400 rounded-xl border border-slate-250 font-mono bg-white"
                />
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
                <input
                  type="text"
                  placeholder="NIC Code"
                  value={guarantor2.nic}
                  onChange={(e) => setGuarantor2({ ...guarantor2, nic: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs font-bold placeholder-slate-400 rounded-xl border border-slate-250 font-mono bg-white"
                />
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
