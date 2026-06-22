/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ArrowLeft, 
  Printer, 
  Plus, 
  Calendar, 
  DollarSign, 
  Phone, 
  User, 
  FileText, 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  Trash2, 
  X,
  FileCheck,
  Building,
  UserCheck,
  Send,
  MessageSquare,
  FileSpreadsheet,
  Download,
  NotebookTabs
} from "lucide-react";
import { Loan, PaymentCollection, FieldOfficer } from "../types";
import { formatLKR, generateId, checkNicStatus } from "../utils";
import { translations, Language } from "../translations";

interface LoanDetailsProps {
  loan: Loan;
  onBack: () => void;
  onAddCollection: (loanId: string, collection: PaymentCollection) => void;
  onDeleteCollection: (loanId: string, collectionId: string) => void;
  onChangeStatus: (loanId: string, status: Loan["status"]) => void;
  lang: Language;
  officers?: FieldOfficer[];
  hasApprovalAuthority?: boolean;
  loans?: Loan[];
}

export default function LoanDetails({ 
  loan, 
  onBack, 
  onAddCollection, 
  onDeleteCollection, 
  onChangeStatus,
  lang,
  officers = [],
  hasApprovalAuthority = true,
  loans = []
}: LoanDetailsProps) {
  const t = translations[lang];

  const [showAddModal, setShowAddModal] = useState(false);
  const [printDocumentType, setPrintDocumentType] = useState<"STATEMENT" | "LEGAL_CONTRACT" | "THERMAL_RECEIPT">("STATEMENT");
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<PaymentCollection | null>(null);

  // New Collection Form state
  const [amount, setAmount] = useState<number>(500); 
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [monthOfCollection, setMonthOfCollection] = useState<string>(() => {
    const monthsSi = [
      "ජනවාරි (January)", "පෙබරවාරි (February)", "මාර්තු (March)", "අප්‍රේල් (April)",
      "මැයි (May)", "ජුනි (June)", "ජූලි (July)", "අගෝස්තු (August)",
      "සැප්තැම්බර් (September)", "ඔක්තෝබර් (October)", "නොවැම්බර් (November)", "දෙසැම්බර් (December)"
    ];
    return `${monthsSi[new Date().getMonth()]} ${new Date().getFullYear()}`;
  });
  const [receiptNumber, setReceiptNumber] = useState<string>(() => `REC-${Math.floor(100000 + Math.random() * 900000)}`);
  const [notes, setNotes] = useState("");
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>("");

  // SMS & WhatsApp Alerts State
  const [alertType, setAlertType] = useState<"CONFIRM" | "REMINDER" | "OVERDUE">("CONFIRM");
  const [customMessage, setCustomMessage] = useState("");
  const [activeReceiptForAlert, setActiveReceiptForAlert] = useState<PaymentCollection | null>(
    loan.collections.length > 0 ? loan.collections[loan.collections.length - 1] : null
  );

  const approved = loan.officeUse.approvedAmount;
  const rate = loan.officeUse.interestRate;
  const interest = approved * (rate / 100);
  const totalToPay = approved + interest;
  const totalPaid = loan.collections.reduce((sum, c) => sum + c.amount, 0);
  const outstanding = totalToPay - totalPaid;

  const handleAddCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const newColl: PaymentCollection = {
      id: `coll-${generateId()}`,
      amount,
      date,
      monthOfCollection,
      receiptNumber: receiptNumber || `REC-${Math.floor(100000 + Math.random() * 900000)}`,
      notes,
      officerId: selectedOfficerId || undefined
    };

    onAddCollection(loan.id, newColl);
    setShowAddModal(false);
    setActiveReceiptForAlert(newColl);

    // Reset Form
    setAmount(500);
    setReceiptNumber(`REC-${Math.floor(100000 + Math.random() * 900500)}`);
    setNotes("");
    setSelectedOfficerId("");
  };

  // Compose dynamic message template
  React.useEffect(() => {
    const borrowerName = loan.applicant.fullName.split(" (")[0]; // sanitize the readable name
    const loanRef = loan.officeUse.applicationNumber;
    const nextDue = loan.officeUse.monthlyInstallment;
    
    let template = "";
    if (alertType === "CONFIRM") {
      const collAmount = activeReceiptForAlert ? activeReceiptForAlert.amount : 500;
      const collRef = activeReceiptForAlert ? activeReceiptForAlert.receiptNumber : "REC-NEW";
      const remainingVal = outstanding - (activeReceiptForAlert ? 0 : 0);
      
      template = lang === "si" 
        ? `ආයුබෝවන්, ${borrowerName}.\n\nශෙත් කැපිටල් (Seth Capital) වෙත ඔබ විසින් සිදු කල Rs. ${collAmount} ක ණය වාරික ගෙවීම සාර්ථකව ලැබුණි.\n• රිසිට් අංකය: ${collRef}\n• ණය අංකය: ${loanRef}\n• ඉතිරි මුළු හිඟ මුදල: Rs. ${formatLKR(remainingVal).replace("Rs.", "").trim()}\n\nස්තූතියි, Seth Capital.`
        : `Hello ${borrowerName}.\n\nSeth Capital has successfully received your payment of Rs. ${collAmount}.\n• Receipt: ${collRef}\n• Loan Ref: ${loanRef}\n• Remaining Outstanding: Rs. ${formatLKR(remainingVal).replace("Rs.", "").trim()}\n\nThank you, Seth Capital Management.`;
    } else if (alertType === "REMINDER") {
      template = lang === "si"
        ? `හිතවත් ${borrowerName},\n\nශෙත් කැපිටල් (Seth Capital) වෙතින් ලබාගත් ණය අංක ${loanRef} සඳහා ඊළඟ වාරිකය වන Rs. ${nextDue} ගෙවීමට මතක් කරමු.\n• ඔබගේ මුළු හිඟ මුදල: Rs. ${formatLKR(outstanding).replace("Rs.", "").trim()}\n\nකරුණාකර කලට වේලාවට ගෙවීම් පියවා තැබීමෙන් පාරිභෝගික ශ්‍රේණිගත කිරීම ආරක්ෂා කරගන්න.\n\nස්තූතියි, Seth Capital.`
        : `Dear ${borrowerName},\n\nFriendly reminder from Seth Capital regarding your active loan portfolio: ${loanRef}.\n• Next Installment Due: Rs. ${nextDue}\n• Total Outstanding capital: Rs. ${formatLKR(outstanding).replace("Rs.", "").trim()}\n\nPlease settle to keep your credit scores clean.\n\nBest regards, Seth Capital.`;
    } else if (alertType === "OVERDUE") {
      template = lang === "si"
        ? `අතිශය හදිසි දැනුම්දීමයි, ${borrowerName}.\n\nශෙත් කැපිටල් ණය ගිණුම් ක්‍රමයට අනුව ඔබගේ ණය අංක ${loanRef} හි වාරික දැනට ප්‍රමාද වී ඇත.\n• මුළු හිඟ මුදල: Rs. ${formatLKR(outstanding).replace("Rs.", "").trim()}\n\nඇපකරුවන් වෙත අදාළ නීතිමය පියවර ගැනීමට පෙර, වහාම අප කාර්යාලය හා සම්බන්ධ වී මෙය නිරාකරණය කරගන්න.\n\nස්තූතියි, Seth Capital.`
        : `CRITICAL OVERDUE NOTICE: Dear ${borrowerName}.\n\nYour repayment cycles for Seth Capital loan ref: ${loanRef} are currently overdue.\n• Exposure Balance: Rs. ${formatLKR(outstanding).replace("Rs.", "").trim()}\n\nPlease settle immediately to avoid collateral triggers or guarantor legal actions.\n\nContact SCL Office, Seth Capital.`;
    }
    setCustomMessage(template);
  }, [alertType, activeReceiptForAlert, outstanding, loan, lang]);

  // Handle Dispatchers
  const handleOpenWhatsApp = () => {
    const rawPhone = loan.applicant.phone;
    let cleanPhone = rawPhone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "94" + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith("94")) {
      cleanPhone = "94" + cleanPhone; // Fallback to Sri Lanka country code
    }
    
    const encodedText = encodeURIComponent(customMessage);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    window.open(waUrl, "_blank");
  };

  const handleOpenSMS = () => {
    const rawPhone = loan.applicant.phone;
    const encodedText = encodeURIComponent(customMessage);
    const smsUrl = `sms:${rawPhone}?body=${encodedText}`;
    window.open(smsUrl, "_blank");
  };

  const triggerSystemPrint = () => {
    window.print();
  };

  const otherLoans = loans.filter((l) => l.id !== loan.id);
  const applicantStatus = checkNicStatus(loan.applicant.nic, otherLoans);
  const borderHighlightClass = applicantStatus.hasActiveLoan 
    ? "border-rose-450 border-2 shadow-rose-500/10 ring-4 ring-rose-100/50 bg-rose-50/5" 
    : applicantStatus.isActiveGuarantor 
      ? "border-amber-450 border-2 shadow-amber-500/10 ring-4 ring-amber-100/50 bg-amber-50/5" 
      : "border-slate-100";

  return (
    <div className="space-y-8 select-none">
      
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 no-print">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs leading-none transition cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-600" />
          {t.backToLoans}
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Changer */}
          <div className="flex items-center gap-1.5 border border-slate-200 bg-white rounded-xl px-3 py-1.5 text-xs text-slate-500 font-bold shadow-xs">
            <span>{t.statusLabel}:</span>
            <select
              value={loan.status}
              disabled={!hasApprovalAuthority}
              onChange={(e) => onChangeStatus(loan.id, e.target.value as Loan["status"])}
              className={`font-bold text-slate-850 bg-transparent focus:outline-hidden cursor-pointer ${!hasApprovalAuthority ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="PENDING">{lang === 'si' ? 'අනුමැතිය අපේක්ෂිත (Pending)' : 'Pending Approval'}</option>
              <option value="ACTIVE">{t.active}</option>
              <option value="COMPLETED">{t.completed}</option>
              <option value="OVERDUE">{t.overdue}</option>
            </select>
            {!hasApprovalAuthority && (
              <span className="text-[9px] text-rose-500 font-extrabold bg-rose-50 px-2 py-0.5 rounded border border-rose-100 ml-1">
                {lang === 'si' ? 'අනුමැතිය සඳහා අවසර නැත' : 'No Approval Permission'}
              </span>
            )}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            disabled={outstanding <= 0}
            className={`flex items-center gap-2 text-white text-xs px-4.5 py-2 rounded-xl font-bold transition cursor-pointer shadow-md select-none ${
              outstanding <= 0 
                ? "bg-slate-305 shadow-none cursor-not-allowed text-slate-400" 
                : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/10"
            }`}
          >
            <Plus className="w-4.5 h-4.5" />
            {t.addPaymentBtn}
          </button>

          <button
            onClick={triggerSystemPrint}
            className="flex items-center gap-2 bg-indigo-950 hover:bg-slate-900 text-white text-xs px-4.5 py-2 rounded-xl font-bold transition cursor-pointer shadow-md shadow-indigo-950/10"
          >
            <Printer className="w-4.5 h-4.5 text-indigo-400" />
            {lang === "si" ? "වාර්තාව මුද්‍රණය කරන්න (Print / PDF)" : "Generate PDF / Print Statement"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">

        {/* Left Column: Output Preview Document Selection */}
        <div className="bg-white border rounded-3xl p-6 shadow-xs lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 mb-4">
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 font-sans">
                <FileCheck className="w-5 h-5 text-indigo-600" />
                {lang === "si" ? "ලේඛන සහ සහතිකකරණ ස්ටුඩියෝව" : "Document & PDF Export Studio"}
              </h4>
              <p className="text-slate-400 text-xs mt-0.5">
                {lang === "si" ? "ණය ගිවිසුම්, ගෙවීම් රිසිට්පත් සහ සහතික පත්ර මෙතැනින් මුද්‍රණය කරගන්න" : "Generate certified PDF paper copies, micro-thermal slips, and commercial contracts"}
              </p>
            </div>

            {/* Print Selection Hub */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setPrintDocumentType("STATEMENT")}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer select-none ${
                  printDocumentType === "STATEMENT" ? "bg-slate-900 text-white shadow-xs" : "text-slate-500"
                }`}
              >
                {lang === "si" ? "වාර්තාව" : "Statement"}
              </button>
              <button
                onClick={() => setPrintDocumentType("LEGAL_CONTRACT")}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer select-none ${
                  printDocumentType === "LEGAL_CONTRACT" ? "bg-slate-900 text-white shadow-xs" : "text-slate-500"
                }`}
              >
                {lang === "si" ? "නිල ගිවිසුම් පත්‍රය" : "Legal Contract"}
              </button>
              <button
                onClick={() => {
                  setPrintDocumentType("THERMAL_RECEIPT");
                  if (loan.collections.length > 0 && !selectedReceiptForPrint) {
                    setSelectedReceiptForPrint(loan.collections[loan.collections.length - 1]);
                  }
                }}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer select-none ${
                  printDocumentType === "THERMAL_RECEIPT" ? "bg-slate-900 text-white shadow-xs" : "text-slate-500"
                }`}
              >
                {lang === "si" ? "රිසිට්පත" : "Thermal Slip"}
              </button>
            </div>
          </div>

          {/* DOCUMENT PREVIEW CONTAINER */}
          <div className="bg-slate-50 border rounded-2xl p-4 md:p-8 overflow-y-auto max-h-[500px]">
            {printDocumentType === "STATEMENT" && (
              <div className="bg-white border rounded-2xl p-6 md:p-8 space-y-6 shadow-xs font-sans text-xs">
                {/* Brand */}
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h5 className="font-extrabold text-[#111] tracking-wide text-xs">SETH CAPITAL LEDGER</h5>
                    <p className="text-[10px] text-slate-400">Microfinance Audit Statement</p>
                  </div>
                  <span className="font-mono text-[9px] bg-slate-905 bg-slate-900 text-white px-2 py-0.5 rounded font-bold">
                    REF: {loan.officeUse.applicationNumber}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[11px]">
                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px]">{t.lhApplicant}</p>
                    <p className="font-extrabold text-slate-805 mt-0.5">{loan.applicant.fullName}</p>
                    <p className="text-slate-500 mt-1 font-mono">NIC: {loan.applicant.nic}</p>
                    <p className="text-slate-500 font-mono">TEL: {loan.applicant.phone}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px]">{lang === "si" ? "ණය තක්සේරුව" : "Terms Breakdown"}</p>
                    <p className="font-extrabold text-slate-805 mt-0.5">Approved: {formatLKR(approved)}</p>
                    <p className="text-slate-500 mt-1">Installment: Rs. {loan.officeUse.monthlyInstallment}</p>
                    <p className="text-slate-500">Rate: {loan.officeUse.interestRate}% ({loan.officeUse.installmentsCount} Cycles)</p>
                  </div>
                </div>

                <div className="border border-slate-100 rounded-xl overflow-hidden mt-4">
                  <table className="w-full text-[10px] font-sans">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b">
                        <th className="p-2 text-left">{t.tableDate}</th>
                        <th className="p-2 text-left">{t.tableReceipt}</th>
                        <th className="p-2 text-left">{t.tableMonth}</th>
                        <th className="p-2 text-right">{t.tableAmount}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {loan.collections.map(c => (
                        <tr key={c.id}>
                          <td className="p-2 font-mono">{c.date}</td>
                          <td className="p-2"><span className="text-slate-500 font-mono text-[9px] bg-slate-100 px-1 py-0.2 rounded font-semibold">{c.receiptNumber}</span></td>
                          <td className="p-2">{c.monthOfCollection}</td>
                          <td className="p-2 text-right font-bold text-emerald-600">{formatLKR(c.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center font-bold text-slate-850 pt-4 border-t text-sm font-mono bg-slate-52 bg-slate-50/50 p-3 rounded-lg">
                  <span className="text-xs font-sans text-slate-500">Remaining Balance:</span>
                  <span className="text-rose-600">{formatLKR(outstanding)}</span>
                </div>
              </div>
            )}

            {printDocumentType === "LEGAL_CONTRACT" && (
              <div className="bg-white border rounded-2xl p-8 space-y-6 shadow-xs font-serif text-slate-850 text-xs leading-relaxed max-w-[800px] border-slate-300">
                <div className="text-center space-y-2 border-b-2 border-slate-800 pb-4">
                  <span className="text-[10px] tracking-widest font-sans font-black bg-stone-900 text-stone-100 px-3 py-1 rounded block w-56 mx-auto">
                    OFFICIAL DEED NOTE
                  </span>
                  <h4 className="font-extrabold text-base tracking-normal uppercase text-stone-900 font-serif">
                    {lang === "si" ? "කුඩා පරිමාණ ණය ගිවිසුම් එකඟතා පත්‍රය" : "Promissory Note & Legally Binding Agreement"}
                  </h4>
                  <p className="text-[10px] text-stone-500 font-sans italic">
                    Issued under the National Finance Regulations & Mutual Microcredit Directives of Sri Lanka
                  </p>
                </div>

                <div className="space-y-4 text-stone-800 font-serif">
                  <p className="indent-8 text-justify">
                    {lang === "si"
                      ? `මෙම ගිවිසුම අද දින ${loan.officeUse.loanDate} වන දින ශෙත් කැපිටල් (මීට පසුව 'ණය දෙන්නා' ලෙස හඳුන්වනු ලබන) සහ ලියාපදිංචි අංක ${loan.officeUse.applicationNumber} දරන අයදුම්කරු වන ${loan.applicant.fullName} (NIC: ${loan.applicant.nic}) (මීට පසුව 'ණයකරු' ලෙස හඳුන්වනු ලබන) අතර ඇති කරගන්නා ලදී.`
                      : `Be it resolved that this legal financial contract is drafted on this date of ${loan.officeUse.loanDate}, between SETH CAPITAL (hereinafter called "The Lender"), and the qualified underwritten applicant ${loan.applicant.fullName} bearing National ID Number: ${loan.applicant.nic} (hereinafter called "The Borrower").`
                    }
                  </p>

                  <div className="bg-stone-50 p-4 border border-stone-250 rounded-xl space-y-2 font-mono text-[10px] text-stone-700">
                    <p className="font-bold border-b border-stone-200 pb-1 text-stone-850">COVENANT CALCULATIONS (ණය කොන්දේසි):</p>
                    <p>• Principal Disbursed Amount: {formatLKR(approved)}</p>
                    <p>• Agreed Interest Yield: {loan.officeUse.interestRate}% per annum flat</p>
                    <p>• Expected Recovery Repayments: {formatLKR(totalToPay)}</p>
                    <p>• Installments Scheduled: {loan.officeUse.installmentsCount} Cycles (Rs. {loan.officeUse.monthlyInstallment} each)</p>
                  </div>

                  <p className="indent-8 text-justify">
                    {lang === "si"
                      ? `මෙම ණය මුදල සඳහා ඇපකරුවන් ලෙස පහත සඳහන් දෙදෙනා වගකීමට බැඳී සිටිති: 1 වන ඇපකරු ${loan.guarantor1.name} (ID: ${loan.guarantor1.nic}) පදිංචි ${loan.guarantor1.address} සහ 2 වන ඇපකරු ${loan.guarantor2.name} (ID: ${loan.guarantor2.nic}) පදිංචි ${loan.guarantor2.address} යන අයයි.`
                      : `The Joint-Severe co-guarantors bound under penalty of asset forfeiture for recovery actions are: Guarantor (1) ${loan.guarantor1.name} (NIC: ${loan.guarantor1.nic || "N/A"}) and Guarantor (2) ${loan.guarantor2.name} (NIC: ${loan.guarantor2.nic || "N/A"}).`
                    }
                  </p>

                  <p className="text-[10px] font-sans text-stone-500 border-l-4 border-stone-300 pl-4 italic">
                    {lang === "si"
                      ? "* ණයකරු කිසියම් අවස්ථාවක ගෙවීම් පැහැර හරිනු ලැබුවහොත්, ඇපකරුවන් දෙදෙනාම ණය මුදල පියවීමට නීත්‍යනුකූලව බැඳී සිටිති. මෙයට උසාවි ක්‍රියාමාර්ග ඇතුළත් වේ."
                      : "* Failure to clear amortizations as scheduled exposes both Borrower and Guarantors to severe collateral liquidations, legal court actions, and personal credit reporting damage."
                    }
                  </p>
                </div>

                {/* Stamp block & sigs preview */}
                <div className="grid grid-cols-3 gap-6 pt-10 text-center font-sans text-[10px] font-bold">
                  <div className="space-y-8">
                    <div className="w-16 h-16 border-2 border-stone-305 border-dashed mx-auto flex items-center justify-center text-[8px] text-stone-400 bg-stone-50">
                      stamp Rs 100
                    </div>
                    <p className="text-stone-600">Borrower Signature</p>
                  </div>
                  <div className="space-y-8 pt-8">
                    <div className="w-24 border-b border-stone-500 mx-auto" />
                    <p className="text-stone-650">Guarantors Joint Signatures</p>
                  </div>
                  <div className="space-y-8 pt-8">
                    <div className="w-24 border-b border-stone-500 mx-auto" />
                    <p className="text-stone-650">Authorized SCL Officer</p>
                  </div>
                </div>
              </div>
            )}

            {printDocumentType === "THERMAL_RECEIPT" && (
              <div className="bg-white border text-black font-mono text-[11px] p-4.5 rounded-2xl w-full max-w-[280px] mx-auto space-y-4 shadow-sm border-slate-350">
                <div className="text-center space-y-1 pb-2 border-b border-dashed border-slate-400">
                  <span className="font-sans font-black text-xs block text-slate-850">SETH CAPITAL</span>
                  <p className="text-[9px] text-slate-500">OFFICIAL TRANSACTION RECEIPT</p>
                  <p className="text-[8px] font-semibold text-slate-400">Piliyandala Branch, SL</p>
                </div>

                {loan.collections.length === 0 ? (
                  <p className="text-[10px] text-slate-400 text-center italic py-4">No collections standard to slip.</p>
                ) : (
                  <div className="space-y-2 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-450">RECEIPT NO:</span>
                      <span className="font-bold text-slate-800">{(selectedReceiptForPrint || loan.collections[loan.collections.length - 1]).receiptNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">DATE TIME:</span>
                      <span className="font-bold text-slate-850">{(selectedReceiptForPrint || loan.collections[loan.collections.length - 1]).date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">BORROWER:</span>
                      <span className="font-bold shrink truncate max-w-[130px]">{loan.applicant.fullName.split(" (")[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">APPLICATION:</span>
                      <span className="font-bold">{loan.officeUse.applicationNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">SET CYCLE:</span>
                      <span>{(selectedReceiptForPrint || loan.collections[loan.collections.length - 1]).monthOfCollection}</span>
                    </div>
                    {((selectedReceiptForPrint || loan.collections[loan.collections.length - 1]).notes) && (
                      <div className="flex justify-between italic">
                        <span className="text-slate-450">MEMO:</span>
                        <span>{(selectedReceiptForPrint || loan.collections[loan.collections.length - 1]).notes}</span>
                      </div>
                    )}
                    
                    <div className="pt-2 border-t border-dashed border-slate-400 flex justify-between font-bold text-xs">
                      <span>CASH PAID:</span>
                      <span className="text-emerald-600">Rs. {(selectedReceiptForPrint || loan.collections[loan.collections.length - 1]).amount.toLocaleString()}</span>
                    </div>

                    <div className="pt-1.5 flex justify-between text-[9px] text-slate-500 font-semibold">
                      <span>Remaining Bal:</span>
                      <span>Rs. {outstanding.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div className="text-center pt-3 border-t border-dashed border-slate-400 text-[8px] text-slate-400 space-y-1">
                  <p>Developed with Enterprise Credit Tracker Codes</p>
                  <p className="font-bold">Thank You! / ස්තූතියි!</p>
                </div>

                {/* Selector for other collections in the slip */}
                {loan.collections.length > 1 && (
                  <div className="pt-4 border-t mt-4 border-slate-100 no-print flex flex-col gap-1 text-[9px] font-sans">
                    <span className="text-slate-500 font-bold mb-1">Select receipt entry to preview:</span>
                    <select 
                      className="p-1 px-2 border rounded bg-slate-50"
                      value={selectedReceiptForPrint?.id || ""} 
                      onChange={(e) => {
                        const found = loan.collections.find(c => c.id === e.target.value);
                        if (found) setSelectedReceiptForPrint(found);
                      }}
                    >
                      {loan.collections.map(c => (
                        <option key={c.id} value={c.id}>{c.receiptNumber} - {c.date} (Rs. {c.amount})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AUTOMATED ALERTS HUB CONTAINER */}
        <div className="bg-indigo-950 border border-indigo-900 rounded-3xl p-6.5 text-indigo-100 lg:col-span-4 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase flex items-center gap-1.5 font-sans">
              <Send className="w-4 h-4 text-emerald-400" />
              03. Automated Reminders Hub (SCL Messenger)
            </span>
            <div>
              <h4 className="font-black text-white text-base">📲 {lang === "si" ? "ස්වයංක්‍රීය දැනුම්දීම් පද්ධතිය" : "Alert Templates Builder"}</h4>
              <p className="text-indigo-250 text-xs mt-0.5 leading-normal">
                {lang === "si" ? "SMS හෝ WhatsApp මඟින් ණයකරුට වහාම මතක් කිරීම් පණිවිඩ යවන්න" : "Draft customized pre-compiled payment notifications in one click"}
              </p>
            </div>

            {/* Select templates of notifications to send directly */}
            <div className="space-y-1 pb-2">
              <label className="text-[10px] font-bold text-indigo-305 uppercase tracking-wide block">{lang === "si" ? "පණිවිඩ වර්ගය (Select template)" : "Alert Blueprint Template"}</label>
              <div className="grid grid-cols-3 gap-1.5 bg-indigo-990 bg-indigo-900/50 p-1.5 rounded-xl border border-indigo-900/30">
                <button
                  onClick={() => setAlertType("CONFIRM")}
                  className={`py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    alertType === "CONFIRM" ? "bg-indigo-600 text-white" : "text-indigo-400 hover:text-indigo-100"
                  }`}
                >
                  {lang === "si" ? "ලදුපත" : "Received"}
                </button>
                <button
                  onClick={() => setAlertType("REMINDER")}
                  className={`py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    alertType === "REMINDER" ? "bg-indigo-600 text-white" : "text-indigo-400 hover:text-indigo-100"
                  }`}
                >
                  {lang === "si" ? "මතක් කිරීම්" : "Reminder"}
                </button>
                <button
                  onClick={() => setAlertType("OVERDUE")}
                  className={`py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    alertType === "OVERDUE" ? "bg-indigo-600 text-white animate-none" : "text-indigo-400 hover:text-indigo-100"
                  }`}
                >
                  {lang === "si" ? "හිඟ වාරික" : "Overdue"}
                </button>
              </div>
            </div>

            {/* Show dynamic text summary representation */}
            <div className="space-y-1 pb-2">
              <label className="text-[10px] font-bold text-indigo-300 uppercase block">{lang === "si" ? "පණිවිඩ පෙරදසුන (Review draft content)" : "Compiled Dispatch Copy"}</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={7}
                className="w-full text-[11px] font-sans p-3 bg-indigo-995/80 bg-indigo-950/70 border border-indigo-900 focus:border-indigo-600 rounded-xl text-indigo-100 leading-normal focus:outline-hidden resize-none"
              />
            </div>
          </div>

          {/* CTAs Trigger keys */}
          <div className="space-y-3 pt-4 border-t border-indigo-900/40">
            <button
              onClick={handleOpenWhatsApp}
              className="w-full select-none flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer transition shadow-lg shadow-[#25D366]/10"
            >
              <MessageSquare className="w-4.5 h-4.5" />
              {lang === "si" ? "WhatsApp මඟින් යවන්න" : "Dispatch via WhatsApp Desktop/Web"}
            </button>
            <button
              onClick={handleOpenSMS}
              className="w-full select-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 border border-indigo-501 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer transition shadow-lg shadow-indigo-600/10"
            >
              <Phone className="w-4.5 h-4.5 text-indigo-200" />
              {lang === "si" ? "සාමාන්‍ය SMS මඟින් යවන්න" : "Dispatch via Mobile Network (SMS)"}
            </button>
            
            <p className="text-[9px] text-indigo-400 text-center font-semibold italic">
              {lang === "si" ? "* පණිවිඩය යැවීමට ඉහත බොත්තමක් ක්‍රියාත්මක කරන්න" : "* Links natively anchor secure local app clients on both desktops & phones"}
            </p>
          </div>
        </div>

      </div>

      {/* Screen container: MAIN STATEMENT SECTION (Hides on specific media contract prints but standard for normal views) */}
      <div className={`bg-white rounded-3xl p-6 md:p-8 shadow-xs space-y-6 screen-container no-print ${borderHighlightClass}`}>
        
        {/* Header containing brand */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-dashed pb-5 text-center sm:text-left gap-4">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-lg">S</span>
              <span className="font-extrabold text-xl tracking-wider text-slate-800 font-sans">SETH CAPITAL</span>
            </div>
            <p className="text-[10px] text-slate-450 font-bold">{t.microSclNotes}</p>
          </div>
          <div className="sm:text-right space-y-1">
            <span className="text-[10px] font-mono font-bold bg-slate-900 text-white px-3 py-1 rounded text-center block sm:inline-block">
              {lang === "si" ? "ණය අයදුම්පත් අංකය:" : "Loan ID:"} {loan.officeUse.applicationNumber}
            </span>
            <p className="text-[11px] text-slate-400">{t.printedOn}: {new Date().toLocaleDateString("en-US")} {new Date().toLocaleTimeString("en-US", {hour: '2-digit', minute:'2-digit'})}</p>
          </div>
        </div>

        {/* Credit Risk Warnings Block */}
        {(() => {
          const g1Status = loan.guarantor1?.nic ? checkNicStatus(loan.guarantor1.nic, otherLoans) : null;
          const g2Status = loan.guarantor2?.nic ? checkNicStatus(loan.guarantor2.nic, otherLoans) : null;
          const hasRisk = applicantStatus.hasActiveLoan || applicantStatus.isActiveGuarantor ||
                          g1Status?.hasActiveLoan || g1Status?.isActiveGuarantor ||
                          g2Status?.hasActiveLoan || g2Status?.isActiveGuarantor;

          if (!hasRisk) return null;

          return (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-205/65 space-y-3 no-print">
              <span className="text-[9.5px] font-black uppercase text-rose-500 tracking-wider block">
                {lang === "si" ? "අනුමැතිය සඳහා පද්ධති අනතුරු ඇඟවීම් (Double-funding Risk Warnings)" : "Underwriting System Warnings"}
              </span>

              {/* Applicant is Borrower on active loan */}
              {applicantStatus.hasActiveLoan && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-100/50 border-l-4 border-red-500 text-xs">
                  <div className="w-2 h-2 rounded-full bg-red-650 mt-1 shrink-0 animate-pulse" />
                  <div>
                    <h5 className="font-extrabold text-red-900">
                      {lang === "si" ? "අයදුම්කරුට දැනටමත් සක්‍රීය ණය මුදලක් පවතී!" : "Applicant currently has a running active loan!"}
                    </h5>
                    <p className="text-red-750 mt-0.5">
                      {lang === "si" 
                        ? `හැඳුනුම්පත් අංකය (${loan.applicant.nic}) හිමිකරුට මෙම පද්ධතියේ දැනටමත් සක්‍රීය ${applicantStatus.activeLoanRef} ණය ගිණුමක් ඇත.`
                        : `Applicant with identification ${loan.applicant.nic} is applicant on active loan ${applicantStatus.activeLoanRef}.`}
                    </p>
                  </div>
                </div>
              )}

              {/* Applicant is Guarantor on active loan */}
              {applicantStatus.isActiveGuarantor && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-100/50 border-l-4 border-amber-500 text-xs">
                  <div className="w-2 h-2 rounded-full bg-amber-600 mt-1 shrink-0" />
                  <div>
                    <h5 className="font-extrabold text-amber-900">
                      {lang === "si" ? "අයදුම්කරු දැනට වෙනත් සක්‍රීය ණයක ඇපකරුවෙකි!" : "Applicant is currently guarantor on active loan!"}
                    </h5>
                    <p className="text-amber-750 mt-0.5">
                      {lang === "si" 
                        ? `මෙම අයදුම්කරු (NIC: ${loan.applicant.nic}) දැනට ${applicantStatus.guarantorLoanBorrowerName} ගේ ${applicantStatus.guarantorLoanRef} ණය ගිණුමට ඇපකරුවෙකි.`
                        : `Applicant is guarantor on loan ${applicantStatus.guarantorLoanRef} for borrower ${applicantStatus.guarantorLoanBorrowerName}.`}
                    </p>
                  </div>
                </div>
              )}

              {/* G1 & G2 warnings */}
              {g1Status?.hasActiveLoan && (
                <p className="text-[10px] font-bold text-red-600 bg-red-50/50 p-2 rounded-lg border border-red-100">
                  ⚠️ {lang === "si" 
                    ? `පළමු ඇපකරු ${loan.guarantor1?.name} ට දැනට පවතින සක්‍රීය ණයක් ඇත! (${g1Status.activeLoanRef})` 
                    : `Guarantor 1 (${loan.guarantor1?.name}) has an active loan! (${g1Status.activeLoanRef})`}
                </p>
              )}
              {g2Status?.hasActiveLoan && (
                <p className="text-[10px] font-bold text-red-600 bg-red-50/50 p-2 rounded-lg border border-red-100">
                  ⚠️ {lang === "si" 
                    ? `දෙවන ඇපකරු ${loan.guarantor2?.name} ට දැනට පවතින සක්‍රීය ණයක් ඇත! (${g2Status.activeLoanRef})` 
                    : `Guarantor 2 (${loan.guarantor2?.name}) has an active loan! (${g2Status.activeLoanRef})`}
                </p>
              )}
            </div>
          );
        })()}

        {/* 1. Borrower Profiling Bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-50 pb-8">
          {/* Main Borrower profile */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1.5 font-sans">
              <User className="w-4 h-4" /> {t.borrowerProfile}
            </h3>
             <div className="space-y-4 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-slate-800 font-extrabold text-base font-sans">{loan.applicant.fullName}</p>
                {loan.applicant.memberNumber && (
                  <span className="bg-indigo-600 text-white font-mono font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse shadow-md shadow-indigo-100">
                    ID: {loan.applicant.memberNumber}
                  </span>
                )}
                {loan.officeUse.loanNumber && (
                  <span className="bg-emerald-600 text-white font-mono font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                    LOAN NO: {loan.officeUse.loanNumber}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-505">
                <span className="font-bold text-slate-400">{t.nic}:</span>
                <span className="font-bold text-slate-700 font-mono">{loan.applicant.nic}</span>
                <span className="font-bold text-slate-400">{t.phone}:</span>
                <span className="font-bold text-slate-755 font-mono">{loan.applicant.phone}</span>

                {loan.applicant.additionalIncome !== undefined && (
                  <>
                    <span className="font-bold text-slate-400">{lang === 'si' ? 'අතිරේක ආදායම:' : 'Additional Income:'}</span>
                    <span className="font-bold font-mono text-slate-700">{formatLKR(loan.applicant.additionalIncome || 0)}</span>
                  </>
                )}

                {loan.applicant.earnings !== undefined && (
                  <>
                    <span className="font-bold text-slate-400">{lang === 'si' ? 'පෞද්ගලික ඉපැයීම්:' : 'Earnings:'}</span>
                    <span className="font-bold font-mono text-slate-700">{formatLKR(loan.applicant.earnings || 0)}</span>
                  </>
                )}

                <span className="font-bold text-slate-400">{t.address}:</span>
                <span className="font-bold text-slate-700 leading-relaxed col-span-2 mt-1 bg-slate-50 p-2.5 rounded-xl border">{loan.applicant.address}</span>
              </div>

              {/* Borrower Documents Previews */}
              {(loan.applicant.idFront || loan.applicant.idBack || loan.applicant.signedDoc) && (
                <div className="mt-4 border-t border-slate-100 pt-4 space-y-2 no-print">
                  <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase block">
                    {lang === "si" ? "අමුණා ඇති ලිපිලේඛන" : "Attached Borrower Documents"}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {loan.applicant.idFront && (
                      <div 
                        className="border rounded-xl overflow-hidden bg-slate-100 relative group cursor-pointer aspect-video" 
                        onClick={() => {
                          const w = window.open();
                          w?.document.write(`<html><head><title>Borrower ID Front</title></head><body style="margin:0; background:#0f172a; display:flex; align-items:center; justify-content:center; min-height:100vh;"><img src="${loan.applicant.idFront}" style="max-width:90%; max-height:90vh; border-radius:12px; shadow: 2xl;" /></body></html>`);
                        }}
                      >
                        <img src={loan.applicant.idFront} alt="ID Front" className="w-full h-full object-cover group-hover:scale-105 transition" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[9px] font-sans font-bold">
                          {lang === "si" ? "විවෘත කරන්න" : "View"}
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-slate-950/50 backdrop-blur-xs py-0.5 text-center text-[8px] text-white font-sans font-black uppercase tracking-wider">
                          {lang === "si" ? "ID ඉදිරිපස" : "ID Front"}
                        </div>
                      </div>
                    )}
                    {loan.applicant.idBack && (
                      <div 
                        className="border rounded-xl overflow-hidden bg-slate-100 relative group cursor-pointer aspect-video" 
                        onClick={() => {
                          const w = window.open();
                          w?.document.write(`<html><head><title>Borrower ID Back</title></head><body style="margin:0; background:#0f172a; display:flex; align-items:center; justify-content:center; min-height:100vh;"><img src="${loan.applicant.idBack}" style="max-width:90%; max-height:90vh; border-radius:12px;" /></body></html>`);
                        }}
                      >
                        <img src={loan.applicant.idBack} alt="ID Back" className="w-full h-full object-cover group-hover:scale-105 transition" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[9px] font-sans font-bold">
                          {lang === "si" ? "විවෘත කරන්න" : "View"}
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-slate-950/50 backdrop-blur-xs py-0.5 text-center text-[8px] text-white font-sans font-black uppercase tracking-wider">
                          {lang === "si" ? "ID පසුපස" : "ID Back"}
                        </div>
                      </div>
                    )}
                    {loan.applicant.signedDoc && (
                      <div 
                        className="border rounded-xl overflow-hidden bg-slate-100 relative group cursor-pointer aspect-video" 
                        onClick={() => {
                          const w = window.open();
                          w?.document.write(`<html><head><title>Signed Application</title></head><body style="margin:0; background:#0f172a; display:flex; align-items:center; justify-content:center; min-height:100vh;"><img src="${loan.applicant.signedDoc}" style="max-width:90%; max-height:90vh; border-radius:12px;" /></body></html>`);
                        }}
                      >
                        <img src={loan.applicant.signedDoc} alt="Signed Doc" className="w-full h-full object-cover group-hover:scale-105 transition" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[9px] font-sans font-bold">
                          {lang === "si" ? "විවෘත කරන්න" : "View"}
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-slate-950/50 backdrop-blur-xs py-0.5 text-center text-[8px] text-white font-sans font-black uppercase tracking-wider overflow-hidden text-ellipsis whitespace-nowrap px-1">
                          {lang === "si" ? "අත්සන් කළ අයදුම්පත" : "Signed Doc"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Guarantors & Relative Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5 font-sans">
              <UserCheck className="w-4 h-4" /> {t.guarantorsAndRelatives}
            </h3>
            <div className="space-y-3 text-xs bg-slate-50 border p-4 rounded-2xl">
              {loan.relative.name && (
                <div>
                  <p className="font-bold text-slate-450 uppercase text-[9px] mb-1">{t.relative}:</p>
                  <p className="text-slate-800 font-bold font-sans">{loan.relative.name} ({loan.relative.relationship}) - <span className="font-mono text-[10px] text-slate-500">{loan.relative.phone}</span></p>
                  
                  {/* Relative ID Photos */}
                  {(loan.relative.idFront || loan.relative.idBack) && (
                    <div className="mt-2 flex items-center gap-2 no-print">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{lang === "si" ? "හැඳුනුම්පත් ඡායාරූප (ඥාති):" : "ID Documents:"}</span>
                      <div className="flex gap-2">
                        {loan.relative.idFront && (
                          <button 
                            type="button"
                            onClick={() => {
                              const w = window.open();
                              w?.document.write(`<html><head><title>Relative ID Front</title></head><body style="margin:0; background:#0f172a; display:flex; align-items:center; justify-content:center; min-height:100vh;"><img src="${loan.relative.idFront}" style="max-width:90%; max-height:90vh; border-radius:12px; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);" /></body></html>`);
                            }}
                            className="px-2 py-0.5 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-indigo-750 font-black rounded-md text-[9px] font-sans transition"
                          >
                            {lang === "si" ? "ඉදිරිපස (Front)" : "Front"}
                          </button>
                        )}
                        {loan.relative.idBack && (
                          <button 
                            type="button"
                            onClick={() => {
                              const w = window.open();
                              w?.document.write(`<html><head><title>Relative ID Back</title></head><body style="margin:0; background:#0f172a; display:flex; align-items:center; justify-content:center; min-height:100vh;"><img src="${loan.relative.idBack}" style="max-width:90%; max-height:90vh; border-radius:12px; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);" /></body></html>`);
                            }}
                            className="px-2 py-0.5 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-indigo-750 font-black rounded-md text-[9px] font-sans transition"
                          >
                            {lang === "si" ? "පසුපස (Back)" : "Back"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {loan.guarantor1.name && (
                <div className="border-t pt-2.5">
                  <p className="font-bold text-slate-450 uppercase text-[9px] mb-1">{t.guarantor1}:</p>
                  <p className="text-slate-800 font-bold font-sans">{loan.guarantor1.name} (ID: <span className="font-mono text-[10px] text-slate-500">{loan.guarantor1.nic || "N/A"}</span>) - <span className="font-mono text-[10px] text-slate-500">{loan.guarantor1.phone}</span></p>
                  
                  {/* Guarantor 1 ID Photos */}
                  {(loan.guarantor1.idFront || loan.guarantor1.idBack) && (
                    <div className="mt-2 flex items-center gap-2 no-print">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{lang === "si" ? "හැඳුනුම්පත් ඡායාරූප:" : "ID Documents:"}</span>
                      <div className="flex gap-2">
                        {loan.guarantor1.idFront && (
                          <button 
                            type="button"
                            onClick={() => {
                              const w = window.open();
                              w?.document.write(`<html><head><title>Guarantor 1 ID Front</title></head><body style="margin:0; background:#0f172a; display:flex; align-items:center; justify-content:center; min-height:100vh;"><img src="${loan.guarantor1.idFront}" style="max-width:90%; max-height:90vh; border-radius:12px; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);" /></body></html>`);
                            }}
                            className="px-2 py-0.5 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-indigo-750 font-black rounded-md text-[9px] font-sans transition"
                          >
                            {lang === "si" ? "ඉදිරිපස (Front)" : "Front"}
                          </button>
                        )}
                        {loan.guarantor1.idBack && (
                          <button 
                            type="button"
                            onClick={() => {
                              const w = window.open();
                              w?.document.write(`<html><head><title>Guarantor 1 ID Back</title></head><body style="margin:0; background:#0f172a; display:flex; align-items:center; justify-content:center; min-height:100vh;"><img src="${loan.guarantor1.idBack}" style="max-width:90%; max-height:90vh; border-radius:12px; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);" /></body></html>`);
                            }}
                            className="px-2 py-0.5 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-indigo-750 font-black rounded-md text-[9px] font-sans transition"
                          >
                            {lang === "si" ? "පසුපස (Back)" : "Back"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {loan.guarantor2.name && (
                <div className="border-t pt-2.5">
                  <p className="font-bold text-slate-450 uppercase text-[9px] mb-1">{t.guarantor2}:</p>
                  <p className="text-slate-800 font-bold font-sans">{loan.guarantor2.name} (ID: <span className="font-mono text-[10px] text-slate-500">{loan.guarantor2.nic || "N/A"}</span>) - <span className="font-mono text-[10px] text-slate-500">{loan.guarantor2.phone}</span></p>
                  
                  {/* Guarantor 2 ID Photos */}
                  {(loan.guarantor2.idFront || loan.guarantor2.idBack) && (
                    <div className="mt-2 flex items-center gap-2 no-print">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{lang === "si" ? "හැඳුනුම්පත් ඡායාරූප:" : "ID Documents:"}</span>
                      <div className="flex gap-2">
                        {loan.guarantor2.idFront && (
                          <button 
                            type="button"
                            onClick={() => {
                              const w = window.open();
                              w?.document.write(`<html><head><title>Guarantor 2 ID Front</title></head><body style="margin:0; background:#0f172a; display:flex; align-items:center; justify-content:center; min-height:100vh;"><img src="${loan.guarantor2.idFront}" style="max-width:90%; max-height:90vh; border-radius:12px; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);" /></body></html>`);
                            }}
                            className="px-2 py-0.5 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-indigo-750 font-black rounded-md text-[9px] font-sans transition"
                          >
                            {lang === "si" ? "ඉදිරිපස (Front)" : "Front"}
                          </button>
                        )}
                        {loan.guarantor2.idBack && (
                          <button 
                            type="button"
                            onClick={() => {
                              const w = window.open();
                              w?.document.write(`<html><head><title>Guarantor 2 ID Back</title></head><body style="margin:0; background:#0f172a; display:flex; align-items:center; justify-content:center; min-height:100vh;"><img src="${loan.guarantor2.idBack}" style="max-width:90%; max-height:90vh; border-radius:12px; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);" /></body></html>`);
                            }}
                            className="px-2 py-0.5 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-indigo-750 font-black rounded-md text-[9px] font-sans transition"
                          >
                            {lang === "si" ? "පසුපස (Back)" : "Back"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Interactive Calculation and collection spreadsheet table matching screenshot! */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-indigo-650 uppercase tracking-widest flex items-center gap-1.5 font-sans">
              <FileSpreadsheet className="w-4 h-4" /> {t.calculationLedgerTitle}
            </h3>
            <span className="text-[10px] text-slate-400 italic">*{t.matchingSpreadsheet}</span>
          </div>

          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b font-sans text-slate-500 font-bold">
                  <th className="p-3 border-r text-center">{lang === "si" ? "ණය අංකය" : "Loan Code"}</th>
                  <th className="p-3 border-r text-right">{t.colApproved}</th>
                  <th className="p-3 border-r text-center">{t.colRate}%</th>
                  <th className="p-3 border-r text-right">{t.colInterest}</th>
                  <th className="p-3 border-r text-right">{t.colTotal}</th>
                  <th className="p-3 border-r text-center">{t.colInstallment}</th>
                  <th className="p-3 border-r text-right">{t.colCollected}</th>
                  <th className="p-3 border-r text-right">{t.colPaidMonths}</th>
                  <th className="p-3 text-right font-black text-rose-600">{t.colBalance}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="hover:bg-slate-50/20 transition">
                  <td className="p-3 border-r text-center font-sans font-extrabold text-slate-800">
                    SCL-{loan.officeUse.applicationNumber}
                  </td>
                  <td className="p-3 border-r text-right font-bold text-slate-800">
                    {formatLKR(approved).replace("Rs.", "")}
                  </td>
                  <td className="p-3 border-r text-center font-bold text-slate-800">
                    {rate}%
                  </td>
                  <td className="p-3 border-r text-right font-medium text-slate-500">
                    {formatLKR(interest).replace("Rs.", "")}
                  </td>
                  <td className="p-3 border-r text-right font-bold text-slate-800">
                    {formatLKR(totalToPay).replace("Rs.", "")}
                  </td>
                  <td className="p-3 border-r text-center text-indigo-600 font-bold">
                    Rs. {loan.officeUse.monthlyInstallment}
                  </td>
                  <td className="p-3 border-r text-right text-emerald-600 font-bold">
                    {formatLKR(totalPaid).replace("Rs.", "")}
                  </td>
                  <td className="p-3 border-r text-left font-sans text-[10px] max-w-[150px] line-clamp-1 whitespace-nowrap">
                    {loan.collections.length > 0 
                      ? Array.from(new Set(loan.collections.map(c => c.monthOfCollection.split(" ")[0]))).join(", ") 
                      : "-"}
                  </td>
                  <td className="p-3 text-right font-black text-rose-600">
                    {formatLKR(outstanding).replace("Rs.", "")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Settlement timeline status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border p-4 rounded-2xl text-xs font-sans">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <span className="block text-slate-400 font-extrabold text-[9px] uppercase tracking-wider">
                {lang === "si" ? "පියවූ දිනය (Settled Date)" : "Settled Date (Closure mark)"}
              </span>
              <span className="font-mono font-black text-slate-750 text-xs">
                {loan.officeUse.settledDate ? loan.officeUse.settledDate : (loan.status === 'COMPLETED' ? 'Marked complete on update' : 'Active / Pending clearance')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
            <div>
              <span className="block text-slate-400 font-extrabold text-[9px] uppercase tracking-wider">
                {lang === "si" ? "ණය පියවිය යුතු අවසන් දිනය (Final Due Date)" : "Final date to be settled"}
              </span>
              <span className="font-mono font-black text-slate-750 text-xs text-indigo-700">
                {loan.officeUse.finalSettlementDate ? loan.officeUse.finalSettlementDate : 'N/A (Repayment run ongoing)'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Transaction collections ledger ledger */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5 font-sans">
            <NotebookTabs className="w-4.5 h-4.5 text-indigo-400" />
            {t.repaymentHistoryTitle}
          </h3>

          {loan.collections.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-2xl text-slate-400 text-xs font-sans">
              {t.noRepaymentsText}
              <p className="text-[10px] text-slate-400 mt-1">{t.noRepaymentsSub}</p>
            </div>
          ) : (
            <div className="border rounded-2xl overflow-hidden select-none">
              <table className="w-full text-xs font-sans">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-400 font-bold">
                    <th className="py-2.5 px-4 text-left">{t.tableDate}</th>
                    <th className="py-2.5 px-4 text-left">{t.tableMonth}</th>
                    <th className="py-2.5 px-4 text-left">{t.tableReceipt}</th>
                    <th className="py-2.5 px-4 text-left">{t.tableNotes}</th>
                    <th className="py-2.5 px-4 text-right">{t.tableAmount}</th>
                    <th className="py-2.5 px-4 text-center w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y font-mono">
                  {loan.collections.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((coll) => (
                    <tr key={coll.id} className="hover:bg-slate-50/40 text-slate-700">
                      <td className="py-2.5 px-4 font-bold text-[11px] font-mono text-slate-500">{coll.date}</td>
                      <td className="py-2.5 px-4 font-bold font-sans text-slate-655 text-slate-600">{coll.monthOfCollection}</td>
                      <td className="py-2.5 px-4">
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold">{coll.receiptNumber}</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 font-sans italic text-[11px]">
                        <div>{coll.notes || "-"}</div>
                        {coll.officerId && (
                          <div className="text-[9px] font-bold text-indigo-650 mt-0.5 not-italic">
                            👤 {officers?.find((o) => o.id === coll.officerId)?.name || (lang === "si" ? "ක්ෂේත්‍ර නිලධාරියා" : "Representative")}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right text-emerald-600 font-bold">{formatLKR(coll.amount)}</td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={() => {
                            if (confirm(t.recordsDeletePrompt)) {
                              onDeleteCollection(loan.id, coll.id);
                            }
                          }}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* DUAL COVENANT PRINT MEDIA SHEETS (ONLY VISIBLE ON LEGAL PRINTER AND COPIERS) */}
      <div className="hidden print:block space-y-8 text-black print-document">
        {printDocumentType === "STATEMENT" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b-2 pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight">SETH CAPITAL</h2>
                <p className="text-xs text-slate-500">ණය සහ ගෙවීම් කළමනාකරණ පරිගණක පද්ධතිය</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-mono font-bold bg-black text-white px-3 py-1 rounded">
                  {loan.officeUse.applicationNumber}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Printed: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 text-xs">
              <div>
                <h4 className="font-bold border-b pb-1 mb-2">BORROWER STATEMENT</h4>
                <p><strong>Name:</strong> {loan.applicant.fullName}</p>
                <p><strong>NIC:</strong> {loan.applicant.nic}</p>
                <p><strong>Phone:</strong> {loan.applicant.phone}</p>
                <p><strong>Address:</strong> {loan.applicant.address}</p>
              </div>
              <div>
                <h4 className="font-bold border-b pb-1 mb-2">CREDIT TERM MATRIX</h4>
                <p><strong>Approved Principal:</strong> {formatLKR(approved)}</p>
                <p><strong>Interest Rate Yield:</strong> {rate}% flat</p>
                <p><strong>Repayment Term:</strong> {loan.officeUse.installmentsCount} Cycles</p>
                <p><strong>Paid Capital:</strong> {formatLKR(totalPaid)}</p>
              </div>
            </div>

            <div className="border-2 rounded-xl overflow-hidden mt-6 text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="p-3">Reference</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Audit Cycle</th>
                    <th className="p-3 text-right">Inflow Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {loan.collections.map(c => (
                    <tr key={c.id} className="border-b">
                      <td className="p-3 font-mono">{c.receiptNumber}</td>
                      <td className="p-3 font-mono">{c.date}</td>
                      <td className="p-3">{c.monthOfCollection}</td>
                      <td className="p-3 text-right font-bold">{formatLKR(c.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center font-bold border-t pt-4 text-sm font-mono">
              <span>OUTSTANDING EXPOSURE BALANCE DUE:</span>
              <span className="text-rose-600">{formatLKR(outstanding)}</span>
            </div>

            <div className="grid grid-cols-2 gap-12 pt-16 text-center text-xs">
              <div className="space-y-12">
                <div className="w-48 border-b-2 border-stone-400 mx-auto" />
                <p>{t.officerSignature}</p>
              </div>
              <div className="space-y-12">
                <div className="w-48 border-b-2 border-stone-400 mx-auto" />
                <p>{t.borrowerSignature}</p>
              </div>
            </div>
          </div>
        )}

        {printDocumentType === "LEGAL_CONTRACT" && (
          <div className="space-y-6">
            <div className="text-center space-y-2 border-b-4 border-double pb-4">
              <h2 className="text-2xl font-black">{lang === "si" ? "ණය ගිවිසුම් පත්‍රිකාව" : "DEED OF PROMISSORY CREDIT CONTRACT"}</h2>
              <p className="text-xs uppercase tracking-widest">{t.microSclNotes}</p>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-justify font-serif">
              <p className="indent-8">
                {lang === "si"
                  ? `මෙම ණය අයදුම්පත් ගිවිසුම අද දින ${loan.officeUse.loanDate} වන දින ශෙත් කැපිටල් වන ණය දෙන්නා සහ සහතිකකරු වන ${loan.applicant.fullName} දරන ජාතික හැඳුනුම්පත් අංකය ${loan.applicant.nic} අතර අත්සන් තබන ලදී.`
                  : `This Promissory binding agreement is signed on ${loan.officeUse.loanDate}, between the Underwriter Lender SETH CAPITAL, and primary Borrower ${loan.applicant.fullName} under registration serial: ${loan.officeUse.applicationNumber}.`
                }
              </p>

              <div className="bg-slate-50 border p-4 font-mono text-[10px] rounded-xl">
                <p className="font-bold mb-1 uppercase">Contract Capital Allocation Parameters:</p>
                <div className="grid grid-cols-2 gap-2">
                  <span>Disbursed Base: {formatLKR(approved)}</span>
                  <span>Yield Interest: {rate}% flat rates</span>
                  <span>Maturity Term: {loan.officeUse.installmentsCount} Cycles</span>
                  <span>Assigned Installment: Rs. {loan.officeUse.monthlyInstallment}</span>
                </div>
              </div>

              <p className="indent-8">
                {lang === "si"
                  ? `ඇපකරුවන් ලෙස බැඳී සිටින පළමු ඇපකරු වන ${loan.guarantor1.name} (ID: ${loan.guarantor1.nic || "N/A"}) සහ දෙවන ඇපකරු වන ${loan.guarantor2.name} (ID: ${loan.guarantor2.nic || "N/A"}) සියලු හිඟ මුදල් පියවීමට ඔවුන්ගේ පෞද්ගලික වත්කම් අනුව නීත්‍යනුකූලව වගකිව යුතුය.`
                  : `We, the co-guarantors (1) ${loan.guarantor1.name} (NIC: ${loan.guarantor1.nic || "N/A"}) and (2) ${loan.guarantor2.name} (NIC: ${loan.guarantor2.nic || "N/A"}), agree in severalty and in whole, to settle any unpaid arrears under recovery operations.`
                }
              </p>
            </div>

            <div className="grid grid-cols-3 gap-12 pt-20 text-center text-xs">
              <div className="space-y-12">
                <div className="w-16 h-16 border-2 border-dashed border-stone-400 mx-auto bg-stone-50 flex items-center justify-center text-[9px] text-stone-400">Rs. 100 Stamp</div>
                <p>Borrower Signature</p>
              </div>
              <div className="space-y-12 pt-[44px]">
                <div className="w-40 border-b border-black mx-auto" />
                <p>Guarantor Signatures</p>
              </div>
              <div className="space-y-12 pt-[44px]">
                <div className="w-40 border-b border-black mx-auto" />
                <p>Authorized Officer Stamp</p>
              </div>
            </div>
          </div>
        )}

        {printDocumentType === "THERMAL_RECEIPT" && (
          <div className="font-mono text-[11px] space-y-4 max-w-[280px] p-2">
            <div className="text-center font-bold">
              <h3>SETH CAPITAL</h3>
              <p className="text-[9px]">OFFICIAL TRANSACTION RECEIPT</p>
            </div>
            {loan.collections.length > 0 && (
              <div className="space-y-1 text-[10px]">
                <p>RECEIPT: {(selectedReceiptForPrint || loan.collections[loan.collections.length - 1]).receiptNumber}</p>
                <p>DATE: {(selectedReceiptForPrint || loan.collections[loan.collections.length - 1]).date}</p>
                <p>BORROWER: {loan.applicant.fullName.split(" (")[0]}</p>
                <p>LOAN REF: {loan.officeUse.applicationNumber}</p>
                <p>CYCLE: {(selectedReceiptForPrint || loan.collections[loan.collections.length - 1]).monthOfCollection}</p>
                <p className="font-bold border-t pt-1">CASH RECEIVED: Rs. {(selectedReceiptForPrint || loan.collections[loan.collections.length - 1]).amount.toLocaleString()}</p>
                <p className="border-t border-dashed mt-1 pt-1 text-[9px]">Outstanding: Rs. {outstanding.toLocaleString()}</p>
              </div>
            )}
            <p className="text-[8px] text-center pt-2">Thank You! / ස්තූතියි!</p>
          </div>
        )}
      </div>

      {/* Model Dialog for recording collection */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h4 className="font-black text-slate-800 text-sm font-sans">{t.modalTitle}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{t.modalDesc}</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleAddCollectionSubmit} className="space-y-4 font-sans">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase">{t.modalAmountLabel}</label>
                <input
                  type="number"
                  required
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl font-mono text-xs focus:border-indigo-500 focus:outline-hidden"
                />
                <div className="flex gap-1.5 pt-1">
                  {[250, 500, 1000, 2000, 5000].map(p => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setAmount(p)}
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 border rounded cursor-pointer ${
                        amount === p ? "bg-indigo-600 border-indigo-650 text-white" : "bg-white text-slate-500"
                      }`}
                    >
                      +{p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase">{t.modalDateLabel}</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase">{t.modalMonthLabel}</label>
                <input
                  type="text"
                  required
                  placeholder="උදා: ජූනි (June) 2026"
                  value={monthOfCollection}
                  onChange={(e) => setMonthOfCollection(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase">{t.modalReceiptLabel}</label>
                <input
                  type="text"
                  required
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-mono text-xs focus:border-indigo-500 focus:outline-hidden bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase">{t.modalNotesLabel}</label>
                <input
                  type="text"
                  placeholder="වාරික ගෙවීම..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              {officers && officers.length > 0 && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">
                    {lang === "si" ? "එකතු කළ නිලධාරියා (Collection Rep) *" : "Collected By (Officer) *"}
                  </label>
                  <select
                    value={selectedOfficerId}
                    onChange={(e) => setSelectedOfficerId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs focus:border-indigo-500 focus:outline-hidden bg-white text-slate-700 font-medium"
                  >
                    <option value="">{lang === "si" ? "-- ප්‍රධාන කාර්යාලය (Main Office) --" : "-- SCL Office Counter --"}</option>
                    {officers.map((off) => (
                      <option key={off.id} value={off.id}>
                        {off.name} (NIC: {off.nic})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/10 cursor-pointer text-center"
              >
                {t.modalSaveBtn}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
