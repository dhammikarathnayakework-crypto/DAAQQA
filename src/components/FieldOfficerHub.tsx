import React, { useState } from "react";
import { 
  User, 
  Coins, 
  FilePlus, 
  CheckCircle2, 
  TrendingUp, 
  Smartphone, 
  LogOut, 
  Plus, 
  TrendingDown, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  AlertTriangle,
  UserCheck,
  Search,
  Check,
  Printer,
  ChevronRight,
  Calculator
} from "lucide-react";
import { FieldOfficer, Loan, OfficerAllowance, OfficerExpense, OfficerRemittance, PaymentCollection, OfficerRepTransfer } from "../types";
import { formatLKR, generateId } from "../utils";
import { translations, Language } from "../translations";

interface FieldOfficerHubProps {
  officer: FieldOfficer;
  fieldOfficers: FieldOfficer[];
  loans: Loan[];
  onAddCollection: (loanId: string, collection: PaymentCollection) => void;
  onUpdateAllowanceStatus: (officerId: string, allowanceId: string, status: any, shortageAmount?: number, remarks?: string) => void;
  onAddOfficerExpense: (officerId: string, expense: OfficerExpense) => void;
  onAddOfficerRemittance: (officerId: string, remittance: OfficerRemittance) => void;
  onAddRepTransfer: (fromOfficerId: string, transfer: OfficerRepTransfer) => void;
  onUpdateRepTransfer: (fromOfficerId: string, transferId: string, status: 'ACCEPTED'|'REJECTED') => void;
  onAddLoan: (loan: Loan) => void;
  onLogout: () => void;
  lang: Language;
}

export default function FieldOfficerHub({
  officer,
  fieldOfficers,
  loans,
  onAddCollection,
  onUpdateAllowanceStatus,
  onAddOfficerExpense,
  onAddOfficerRemittance,
  onAddRepTransfer,
  onUpdateRepTransfer,
  onAddLoan,
  onLogout,
  lang
}: FieldOfficerHubProps) {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'WORKSPACE' | 'NEW_CLIENT' | 'COLLECT' | 'EXPENSE_REMIT' | 'EOD'>('WORKSPACE');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split("T")[0]);

  // Counting Approval Modals / Select states
  const [confirmingAllowance, setConfirmingAllowance] = useState<OfficerAllowance | null>(null);
  const [confirmingTransfer, setConfirmingTransfer] = useState<OfficerRepTransfer | null>(null);

  // Installment collection states
  const [selectedLoanId, setSelectedLoanId] = useState<string>("");
  const [collectAmount, setCollectAmount] = useState<string>("");
  const [collectNotes, setCollectNotes] = useState<string>("");
  const [lastCollectionReceipt, setLastCollectionReceipt] = useState<{
    msg: string;
    targetPhone: string;
    waText: string;
  } | null>(null);

  // Expense states
  const [expAmount, setExpAmount] = useState("");
  const [expDesc, setExpDesc] = useState("");
  
  // Remittance states
  const [remAmount, setRemAmount] = useState("");
  const [remNotes, setRemNotes] = useState("");

  // New Client / Loan underwriting states on Rep side
  const [custName, setCustName] = useState("");
  const [custNic, setCustNic] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [custRequested, setCustRequested] = useState("");
  const [custPurpose, setCustPurpose] = useState("");
  const [custInterRate, setCustInterRate] = useState("25");
  const [custDuration, setCustDuration] = useState("12");

  // Relative Sponsor
  const [relName, setRelName] = useState("");
  const [relRelationship, setRelRelationship] = useState("");
  const [relNic, setRelNic] = useState("");
  const [relPhone, setRelPhone] = useState("");
  const [relAddress, setRelAddress] = useState("");

  // Guarantor Check
  const [g1Name, setG1Name] = useState("");
  const [g1Nic, setG1Nic] = useState("");
  const [g1Phone, setG1Phone] = useState("");
  const [g1Address, setG1Address] = useState("");

  const [loanSuccess, setLoanSuccess] = useState<string>("");

  // Filter loans that belong to this officer
  const officerLoans = loans.filter(l => l.officeUse.specialNotes.includes(officer.id) || l.applicant.fullName.toLowerCase().includes(officer.name.toLowerCase()) || true); // Default true fallback but let's prioritize officer matching if explicit is logged.
  
  // Actually, we can check if payment was received by this officer, or calculate collections made by this officer
  const officerCollections = loans.flatMap(l => 
    l.collections
      .filter(c => c.officerId === officer.id)
      .map(c => ({
        ...c,
        loanId: l.id,
        loanName: l.applicant.fullName,
        loanNic: l.applicant.nic
      }))
  );

  // Current Math for cash desk
  const approvedAllowances = officer.allowances.filter(a => a.status === 'APPROVED' && (a.repStatus === 'ACCEPTED' || !a.repStatus));
  const totalMorningFloats = approvedAllowances.filter(a => a.type === 'FLOAT').reduce((sum, a) => sum + a.amount, 0);
  const totalBattaAllowances = approvedAllowances.filter(a => a.type === 'BATTA' || !a.type).reduce((sum, a) => sum + a.amount, 0);
  const totalOtherAllowances = approvedAllowances.filter(a => a.type === 'OTHER').reduce((sum, a) => sum + a.amount, 0);
  
  const totalCollectionsValue = officerCollections.reduce((sum, c) => sum + c.amount, 0);
  const totalExpensesValue = officer.expenses.filter(e => e.status !== 'REJECTED').reduce((sum, e) => sum + e.amount, 0);
  const totalRemittancesValue = officer.remittances.filter(r => r.status !== 'REJECTED').reduce((sum, r) => sum + r.amount, 0);
  
  // Outstanding disbursed loans (New Client Registration from Rep subtracts from cash-in-hand)
  const disbursedLoansByRep = officerLoans.filter(l => l.officeUse.disbursedByOfficerId === officer.id);
  const totalDisbursedValue = disbursedLoansByRep.reduce((sum, l) => sum + l.officeUse.approvedAmount, 0);

  // Transfers out (sent by this rep and not rejected)
  const transfersOut = officer.repTransfers?.filter(t => t.status !== 'REJECTED').reduce((sum, t) => sum + t.amount, 0) || 0;
  
  // Transfers in (received by this rep from other reps, MUST BE ACCEPTED to count as cash in hand)
  const transfersIn = fieldOfficers.flatMap(o => o.repTransfers || []).filter(t => t.toOfficerId === officer.id && t.status === 'ACCEPTED').reduce((sum, t) => sum + t.amount, 0);

  const totalInflow = totalMorningFloats + totalBattaAllowances + totalOtherAllowances + totalCollectionsValue + transfersIn;
  const totalOutflow = totalExpensesValue + totalRemittancesValue + totalDisbursedValue + transfersOut;
  const currentCashInHand = totalInflow - totalOutflow;

  // Pending Cash allocations waiting for Rep's physical note counting
  const pendingAllowances = officer.allowances.filter(a => a.status === 'APPROVED' && a.repStatus === 'PENDING_APPROVAL');

  // Pending Transfers received waiting for this rep's confirmation
  const pendingTransfersReceived = fieldOfficers.flatMap(o => o.repTransfers || []).filter(t => t.toOfficerId === officer.id && t.status === 'PENDING');

  const handleApproveCashReceipt = (allowance: OfficerAllowance, isShortage: boolean = false, shortageVal: number = 0, remarks: string = "") => {
    // We pass to App.tsx to handle the full update
    onUpdateAllowanceStatus(officer.id, allowance.id, isShortage ? 'SHORTAGE' : 'ACCEPTED', shortageVal, remarks);
    setConfirmingAllowance(null);
  };

  const handlePostCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanId || !collectAmount) return;
    const amount = parseFloat(collectAmount);
    if (isNaN(amount) || amount <= 0) return;

    const processCollection = (locationGeo?: { latitude: number, longitude: number }) => {
      const collectionObj: PaymentCollection = {
        id: `coll-${generateId()}`,
        date: new Date().toISOString().split("T")[0],
        monthOfCollection: new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        receiptNumber: `RCPT-${Math.floor(1000 + Math.random() * 9000)}`,
        amount,
        notes: collectNotes || "Received in Field",
        officerId: officer.id,
        locationGeo
      };

      onAddCollection(selectedLoanId, collectionObj);
      
      const targetLoan = loans.find(l => l.id === selectedLoanId);
      const successMsgStr = lang === "si" 
        ? `රු. ${amount.toLocaleString()} මුදල ${targetLoan?.applicant.fullName} ගෙන් සාර්ථකව අයකර ගන්නා ලදී!` 
        : `Successfully collected LKR ${amount.toLocaleString()} from ${targetLoan?.applicant.fullName}!`;
      
      const receiptMsg = `SETH CAPITAL E-Receipt\nReceipt No: ${collectionObj.receiptNumber}\nDate: ${collectionObj.date}\nAmount: LKR ${amount.toLocaleString()}\nLoan Ref: ${targetLoan?.officeUse?.applicationNumber || "N/A"}\nReceived with thanks!`;

      setLastCollectionReceipt({
        msg: successMsgStr,
        targetPhone: targetLoan?.applicant?.phone || "",
        waText: encodeURIComponent(receiptMsg)
      });
      
      setCollectAmount("");
      setCollectNotes("");
      setTimeout(() => setLastCollectionReceipt(null), 10000);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          processCollection({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        },
        () => {
          processCollection(); // Fallback if denied
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      processCollection();
    }
  };

  const handlePostExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount || !expDesc) return;
    const amount = parseFloat(expAmount);
    if (isNaN(amount) || amount <= 0) return;

    const expObj: OfficerExpense = {
      id: `field-exp-${generateId()}`,
      date: new Date().toISOString().split("T")[0],
      amount,
      description: expDesc,
      status: 'APPROVED' // Rep saves direct expenses in field
    };

    onAddOfficerExpense(officer.id, expObj);
    setExpAmount("");
    setExpDesc("");
    alert(lang === "si" ? "වියදම සාර්ථකව සටහන් විය!" : "Expense logged successfully!");
  };

  const handlePostRemittance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remAmount) return;
    const amount = parseFloat(remAmount);
    if (isNaN(amount) || amount <= 0) return;

    const expectedAmount = currentCashInHand;
    const shortageAmount = expectedAmount > amount ? expectedAmount - amount : 0;

    const remObj: OfficerRemittance = {
      id: `field-rem-${generateId()}`,
      date: new Date().toISOString().split("T")[0],
      amount,
      expectedAmount,
      shortageAmount,
      notes: remNotes || "Field Handover Cash",
      status: 'PENDING' // Office must approve remittances after receiving
    };

    onAddOfficerRemittance(officer.id, remObj);
    setRemAmount("");
    setRemNotes("");
    alert(lang === "si" ? "කාර්යාලයට භාරදුන් මුදල සටහන් විය. කළමනාකරු විසින් තහවුරු කල පසු එය සමතුලිත වේ." : "Remittance logged as PENDING. Once approved by Office Manager, it balances.");
  };

  const [transferAmount, setTransferAmount] = useState("");
  const [transferTargetId, setTransferTargetId] = useState("");
  const [transferNotes, setTransferNotes] = useState("");

  const handlePostRepTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAmount || !transferTargetId) return;
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    if (amount > currentCashInHand) {
      alert("Insufficient cash in hand to make this transfer.");
      return;
    }

    const tObj: OfficerRepTransfer = {
      id: `field-trans-${generateId()}`,
      date: new Date().toISOString().split("T")[0],
      amount,
      fromOfficerId: officer.id,
      toOfficerId: transferTargetId,
      status: 'PENDING',
      notes: transferNotes || "Rep-to-Rep transfer"
    };

    onAddRepTransfer(officer.id, tObj);
    setTransferAmount("");
    setTransferTargetId("");
    setTransferNotes("");
    alert(lang === "si" ? "වෙනත් නිලධාරියෙකුට මුදල් යැවීම සටහන් විය. අනෙක් නිලධාරියා එය පිළිගත යුතුයි." : "Cash transfer to another Rep logged. Waiting for their confirmation.");
  };

  const handleRegisterClientLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custNic || !custRequested) return;

    const amt = parseFloat(custRequested);
    if (isNaN(amt) || amt <= 0) return;

    const rate = parseFloat(custInterRate);
    const instCount = parseInt(custDuration);
    const interest = amt * (rate / 100);
    const total = amt + interest;
    const monthlyInst = Math.round(total / instCount);

    const newLoanObj: Loan = {
      id: `loan-${generateId()}`,
      status: "ACTIVE",
      applicant: {
        fullName: custName,
        nic: custNic,
        phone: custPhone || "N/A",
        address: custAddress || "Field Client"
      },
      relative: {
        relationship: relRelationship || "Relative",
        name: relName || "Sponsor",
        nic: relNic || "N/A",
        phone: relPhone || "N/A",
        address: relAddress || "Same Address",
        workAddress: "N/A"
      },
      loanDetails: {
        requestedAmount: amt,
        purpose: custPurpose || "Microfinance Business Loan"
      },
      guarantor1: {
        name: g1Name || "Asset Guarantor",
        nic: g1Nic || "N/A",
        phone: g1Phone || "N/A",
        address: g1Address || "N/A",
        isAgreed: true
      },
      guarantor2: {
        name: "Field Verification Officer",
        nic: officer.nic,
        phone: officer.phone,
        address: officer.address,
        isAgreed: true
      },
      officeUse: {
        applicationNumber: `SCL-FLD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        approvedAmount: amt,
        interestRate: rate,
        installmentsCount: instCount,
        monthlyInstallment: monthlyInst,
        specialNotes: `Assigned Field Representative: ${officer.name} (${officer.id})`,
        loanDate: new Date().toISOString().split("T")[0]
      },
      collections: [],
      createdAt: new Date().toISOString()
    };

    onAddLoan(newLoanObj);

    setLoanSuccess(lang === "si" 
      ? `ණය අයදුම්කරු ${custName} සාර්ථකව පද්ධතියට ඇතුලත් කල අතර ණය මුදල් නිකුත් කෙරුණි!` 
      : `Applicant ${custName} registered successfully. Core loan ledger is active!`);
    
    // Clear inputs
    setCustName("");
    setCustNic("");
    setCustPhone("");
    setCustAddress("");
    setCustRequested("");
    setCustPurpose("");
    setRelName("");
    setRelRelationship("");
    setRelNic("");
    setRelPhone("");
    setRelAddress("");
    setG1Name("");
    setG1Nic("");
    setG1Phone("");
    setG1Address("");

    setTimeout(() => setLoanSuccess(""), 5000);
  };

  return (
    <div className="space-y-6">
      
      {/* Officer Personal Welcome Dashboard Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-slate-800 to-transparent opacity-60 pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-10 relative">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl border border-indigo-400/30 text-white shadow-inner">
              <UserCheck className="w-8 h-8 text-emerald-350 animate-pulse" />
            </div>
            <div>
              <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-900 rounded-full text-[9px] font-black uppercase tracking-wider">
                {lang === "si" ? "ක්ෂේත්‍ර නිලධාරී පර්යන්තය" : "Representative field desk"}
              </span>
              <h2 className="text-xl font-black font-display text-slate-100 tracking-tight mt-1">{officer.name}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-xs mt-1 font-mono font-medium">
                <span>ID: {officer.employeeId || officer.id}</span>
                <span>NIC: {officer.nic}</span>
                <span>Mob: {officer.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-[10px] text-slate-400 font-bold bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-850">
              {lang === "si" ? "ශාඛාව: කොළඹ 03" : "Branch: Colombo 03"}
            </span>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-900 text-rose-300 font-black px-4 py-2 rounded-xl text-xs cursor-pointer active:scale-95 transition-all"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>{lang === "si" ? "පිටවීම" : "Switch User"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* WARNING POPUP: Office transferred Morning starting floats awaiting verification */}
      {pendingAllowances.length > 0 && (
        <div className="p-5 bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-3xl animate-fade-in flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs shrink-0 self-start mt-0.5 animate-bounce">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-amber-900 text-xs uppercase tracking-wider">
                {lang === "si" ? "කාර්යාලයෙන් මුදල් ලැබීම් තහවුරු කිරීමට ඇත!" : "Awaiting starting cash confirmation!"}
              </h4>
              <p className="text-amber-800 text-xs leading-normal mt-1 font-medium">
                {lang === "si" 
                  ? "කාර්යාලයට මුදල් භාරදීමට පෙර, එදින උදෑසන ඔබට ලැබුණු අත්මුදල් හෝ අනෙකුත් දීමනා පද්ධතිය තුළ නිල වශයෙන් ගණන් කර පිළිගත යුතුය." 
                  : "Please count your morning starting float notes and finalize confirmation. Pending floats must be acknowledged below."}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {pendingAllowances.map(a => (
                  <div key={a.id} className="bg-white border border-amber-200 rounded-xl px-3 py-1.5 shadow-xs flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700 text-xs">
                      {a.type === 'FLOAT' ? "Morning Float" : a.type === 'BATTA' ? "Daily Batta" : "Other Allocation"}
                    </span>
                    <span className="font-mono font-black text-emerald-600 text-xs">
                      {formatLKR(a.amount)}
                    </span>
                    <button
                      onClick={() => setConfirmingAllowance(a)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider active:scale-95 transition cursor-pointer"
                    >
                      {lang === "si" ? "පිළිගන්න" : "Verify Cash"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WARNING POPUP: Rep-to-Rep transfers awaiting verification */}
      {pendingTransfersReceived.length > 0 && (
        <div className="p-5 bg-gradient-to-r from-teal-50 to-teal-100/50 border border-teal-200 rounded-3xl animate-fade-in flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-3">
            <div className="p-2 bg-teal-500 text-white rounded-xl shadow-xs shrink-0 self-start mt-0.5 animate-pulse">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-teal-900 text-xs uppercase tracking-wider">
                {lang === "si" ? "වෙනත් නිලධාරියෙකුගෙන් ලැබුණු මුදල් ඇත!" : "Awaiting rep-to-rep transfer confirmation!"}
              </h4>
              <p className="text-teal-800 text-xs leading-normal mt-1 font-medium">
                {lang === "si" 
                  ? "වෙනත් ක්ෂේත්‍ර නිලධාරියෙකු ඔබට මුදල් යවා ඇත. එය පිළිගන්නා තුරු ඔබේ ගිණුම සමතුලිත නොවේ." 
                  : "Another field officer has transferred cash to you. Please confirm receipt below."}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {pendingTransfersReceived.map(tObj => (
                  <div key={tObj.id} className="bg-white border border-teal-200 rounded-xl px-3 py-1.5 shadow-xs flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700 text-xs">
                      From: {fieldOfficers.find(o => o.id === tObj.fromOfficerId)?.name || "?"}
                    </span>
                    <span className="font-mono font-black text-emerald-600 text-xs text-right">
                      {formatLKR(tObj.amount)}
                    </span>
                    <button
                      onClick={() => setConfirmingTransfer(tObj)}
                      className="bg-teal-600 hover:bg-teal-500 text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider active:scale-95 transition cursor-pointer"
                    >
                      {lang === "si" ? "පරීක්ෂා කර පිළිගන්න" : "Verify & Accept"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Modal for Cash Receipt Counting and Authorization */}
      {confirmingAllowance && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-105 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in font-sans">
            <div className="text-center p-2">
              <Coins className="w-12 h-12 text-teal-600 mx-auto animate-pulse mb-2" />
              <h3 className="font-black text-slate-800 text-sm uppercase">
                {lang === "si" ? "භෞතික මුදල් ගණන් කර පිළිගන්න" : "Verify Physical Banknotes Receipt"}
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                {lang === "si" 
                  ? "මෙම අත්මුදල පද්ධතිය තුල ඔබේ දෛනික ශේෂයට ඇතුලත් කිරීමට පෙර අතැති මුදල් නිවැරදි දැයි තහවුරු කරන්න." 
                  : "Double check whether you have visually counted the physical currency bundles before confirming."}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center text-xs space-y-1">
              <p className="text-slate-400 uppercase font-bold text-[9px]">{lang === "si" ? "කාර්යාලයෙන් දිපු මුදල" : "Allocated Office Cash"}</p>
              <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">{formatLKR(confirmingAllowance.amount)}</p>
              <div className="pt-2 flex justify-between font-mono text-[10px] text-slate-500">
                <span>TYPE: {confirmingAllowance.type || "BATTA"}</span>
                <span>DATE: {confirmingAllowance.date}</span>
              </div>
            </div>
            
            <div className="pt-2 border-t border-slate-100">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                {lang === "si" ? "මුදලේ අඩුවක් ඇත්නම් (Shortage Amount)" : "If shortage, enter amount missing"}
              </label>
              <input
                type="number"
                id="shortage-amount"
                placeholder="e.g. 500"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-rose-400 focus:bg-rose-50"
              />
              <textarea
                id="shortage-notes"
                placeholder={lang === "si" ? "සටහන (Optional)" : "Shortage Remarks (Optional)"}
                className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                rows={2}
              ></textarea>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmingAllowance(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
              >
                {lang === "si" ? "අවලංගු" : "Close"}
              </button>
              <button
                onClick={() => {
                  const shortageInput = (document.getElementById('shortage-amount') as HTMLInputElement).value;
                  const remarksInput = (document.getElementById('shortage-notes') as HTMLTextAreaElement).value;
                  const shortageVal = parseFloat(shortageInput);
                  if (shortageVal > 0) {
                    handleApproveCashReceipt(confirmingAllowance, true, shortageVal, remarksInput || "Physical shortage verified by Rep");
                  } else {
                    handleApproveCashReceipt(confirmingAllowance, false);
                  }
                }}
                className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-black py-2.5 rounded-xl text-xs active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check className="w-4 h-4 text-teal-200" />
                {lang === "si" ? "ගණන් කළා - මුදල් පිළිගන්න" : "Confirm Physical Verification"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Modal for Cash Transfer Counting and Authorization */}
      {confirmingTransfer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-105 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in font-sans">
            <div className="text-center p-2">
              <TrendingUp className="w-12 h-12 text-teal-600 mx-auto animate-pulse mb-2" />
              <h3 className="font-black text-slate-800 text-sm uppercase">
                {lang === "si" ? "වෙනත් නිලධාරියෙකුගෙන් ලැබුණු මුදල්" : "Verify Rep-to-Rep Transfer Receipt"}
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                {lang === "si" 
                  ? "මෙම නිලධාරියා ඔබ වෙත ලබාදුන් මුදල් ප්‍රමාණය නිවැරදි දැයි තහවුරු කරන්න." 
                  : "Please confirm that you have physically received this cash amount from the officer."}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center text-xs space-y-1">
              <p className="text-slate-400 uppercase font-bold text-[9px]">{lang === "si" ? "ලැබුණු මුදල" : "Received Transfer Amount"}</p>
              <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">{formatLKR(confirmingTransfer.amount)}</p>
              <div className="pt-2 flex justify-between font-mono text-[10px] text-slate-500">
                <span>{lang === "si" ? "සිට:" : "FROM:"} {fieldOfficers.find(o => o.id === confirmingTransfer.fromOfficerId)?.name}</span>
                <span>DATE: {confirmingTransfer.date}</span>
              </div>
              {confirmingTransfer.notes && (
                <div className="pt-2 border-t border-slate-200 mt-2 text-[10px] text-slate-500 font-medium">
                  {confirmingTransfer.notes}
                </div>
              )}
            </div>
            
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setConfirmingTransfer(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
              >
                {lang === "si" ? "අවලංගු පසුවට කල්දමමි" : "Close & Defer"}
              </button>
              <button
                onClick={() => {
                  onUpdateRepTransfer(confirmingTransfer.fromOfficerId, confirmingTransfer.id, 'REJECTED');
                  setConfirmingTransfer(null);
                }}
                className="flex-[0.5] bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold py-2.5 rounded-xl text-[10px] cursor-pointer"
              >
                {lang === "si" ? "ප්‍රතික්ෂේප" : "Reject"}
              </button>
              <button
                onClick={() => {
                  onUpdateRepTransfer(confirmingTransfer.fromOfficerId, confirmingTransfer.id, 'ACCEPTED');
                  setConfirmingTransfer(null);
                }}
                className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-black py-2.5 rounded-xl text-xs active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check className="w-4 h-4 text-teal-200" />
                {lang === "si" ? "ඔව්, මුදල් ලැබුණා" : "Confirm Received"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation Bars specifically designed for officer profile */}
      <div className="bg-white border border-slate-100 rounded-3xl p-2 shadow-xs">
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'WORKSPACE', label: lang === "si" ? "අත්මුදල් මේසය" : "Cash Counter", icon: Coins, count: pendingAllowances.length || undefined },
            { id: 'NEW_CLIENT', label: lang === "si" ? "නව ණයකරුවන් (Clients)" : "Loan Application", icon: FilePlus },
            { id: 'COLLECT', label: lang === "si" ? "ණය වාරික අයකර ගැනීම්" : "Collect Instalments", icon: TrendingUp },
            { id: 'EXPENSE_REMIT', label: lang === "si" ? "වියදම් සහ කාර්යාලය" : "Expenses & Handover", icon: TrendingDown },
            { id: 'EOD', label: lang === "si" ? "දෛනික වාර්තාව (EOD)" : "My Daily EOD", icon: Smartphone }
          ].map(t => {
            const Icon = t.icon;
            const isSel = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-black transition-all cursor-pointer relative ${
                  isSel 
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" 
                    : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${isSel ? "text-indigo-400" : "text-slate-400"}`} />
                <span>{t.label}</span>
                {t.count !== undefined && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white animate-pulse">
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container contents driven by tabs */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs min-h-[400px]">
        {activeTab === 'WORKSPACE' && (
          <div className="space-y-6">
            
            {/* Visual Overview of current day balances */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">{lang === "si" ? "ආරම්භක අත්මුදල" : "Morning Float"}</span>
                <span className="text-lg font-black text-emerald-700 font-mono block mt-1">{formatLKR(totalMorningFloats)}</span>
              </div>
              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100">
                <span className="text-[10px] uppercase font-bold text-sky-800 block">{lang === "si" ? "අයකරගත් ණය මුදල්" : "Total Collections"}</span>
                <span className="text-lg font-black text-sky-700 font-mono block mt-1">{formatLKR(totalCollectionsValue)}</span>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">{lang === "si" ? "වියදම් එකතුව" : "Logged Expenses"}</span>
                <span className="text-lg font-black text-amber-700 font-mono block mt-1">{formatLKR(totalExpensesValue)}</span>
              </div>
              <div className="p-4 bg-indigo-950 text-indigo-100 rounded-2xl border border-indigo-900 shadow-md">
                <span className="text-[10px] uppercase font-bold text-indigo-300 block">{lang === "si" ? "වර්තමාන අතැති ශේෂය" : "Current Cash in Hand"}</span>
                <span className="text-xl font-black text-white font-mono block mt-1">{formatLKR(currentCashInHand)}</span>
              </div>
            </div>

            {/* List of ALL Approved Allocations received this period */}
            <div>
              <h4 className="text-xs font-black uppercase text-slate-800 scroll-mb-1 tracking-wider mb-3">
                {lang === "si" ? "පිළිගත් දීමනා සහ අත්මුදල් ලේඛනය" : "Approved allowances & floats history"}
              </h4>
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[9px] border-b border-slate-100">
                    <tr>
                      <th className="p-3">{lang === "si" ? "දිනය" : "Date"}</th>
                      <th className="p-3">{lang === "si" ? "වර්ගය" : "Type"}</th>
                      <th className="p-3">{lang === "si" ? "සටහන්" : "Notes"}</th>
                      <th className="p-3 text-right">{lang === "si" ? "මුදල" : "Amount"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-750">
                    {approvedAllowances.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-400 font-medium font-mono">
                          {lang === "si" ? "කිසිදු අනුමත කල අත්මුදලක් නොමැත." : "No approved starting assets or batta allocs."}
                        </td>
                      </tr>
                    ) : (
                      approvedAllowances.map(a => (
                        <tr key={a.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-mono font-bold text-slate-500">{a.date}</td>
                          <td className="p-3">
                            {a.type === 'FLOAT' ? (
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700 font-black text-[9px] uppercase tracking-wider">
                                FLOAT / අත්මුදල්
                              </span>
                            ) : a.type === 'OTHER' ? (
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-black text-[9px] uppercase tracking-wider">
                                OTHER / වෙනත්
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-md bg-sky-50 border border-sky-100 text-sky-700 font-black text-[9px] uppercase tracking-wider">
                                BATTA / බත්තා
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-medium text-slate-600">{a.notes || "-"}</td>
                          <td className="p-3 text-right font-black font-mono text-slate-800">{formatLKR(a.amount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* List of Recent Field Collections logged */}
            <div>
              <h4 className="text-xs font-black uppercase text-slate-800 scroll-mb-1 tracking-wider mb-3">
                {lang === "si" ? "මෑතදී සිදු කල වාරික එකතු කිරීම්" : "Recent collections made in field"}
              </h4>
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[9px] border-b border-slate-100">
                    <tr>
                      <th className="p-3">{lang === "si" ? "පාරිභෝගිකයා" : "Customer / Client"}</th>
                      <th className="p-3">{lang === "si" ? "දිනය" : "Date"}</th>
                      <th className="p-3">{lang === "si" ? "විස්තරය" : "Notes"}</th>
                      <th className="p-3 text-right">{lang === "si" ? "මුදල" : "Amount"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-750">
                    {officerCollections.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-400 font-medium font-mono">
                          {lang === "si" ? "අයකරගත් කිසිදු වාරිකයක් නොමැත." : "No current collections logged on this representative profile."}
                        </td>
                      </tr>
                    ) : (
                      officerCollections.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <p className="font-bold text-slate-800">{c.loanName}</p>
                            <p className="text-[9px] text-slate-400 font-mono">NIC: {c.loanNic}</p>
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-500">{c.date}</td>
                          <td className="p-3 font-medium text-slate-600">{c.notes || "-"}</td>
                          <td className="p-3 text-right font-black font-mono text-emerald-600">+{formatLKR(c.amount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: REGISTER CLIENTS / DISBURSE LOAN DIRECT IN FIELD */}
        {activeTab === 'NEW_CLIENT' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <FilePlus className="w-5 h-5 text-indigo-500" />
                {lang === "si" ? "නව ණයකරුවෙක් ලියාපදිංචි කිරීම සහ ණය යෝජනාව ඇතුලත් කිරීම" : "Client registration & direct credit application"}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {lang === "si" 
                  ? "නව ගනුදෙනුකරුවෙකුට ණය ලබා දීමේදී ඔවුන්ගේ තොරතුරු, ඇපකරුවන් සහ අවශ්‍ය වාරික ප්‍රමාණය මෙතැනින් එකතු කරන්න." 
                  : "Collect customer applicant sheets, relatives data, asset guarantors, and terms directly from the active field."}
              </p>
            </div>

            {loanSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold font-sans animate-bounce">
                ✓ {loanSuccess}
              </div>
            )}

            <form onSubmit={handleRegisterClientLoan} className="space-y-6">
              
              {/* I. Applicant personal card info */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-slate-400">1. Client Personal Sheet / අයදුම්කරුගේ තොරතුරු</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "සම්පූර්ණ නම *" : "Full Name *"}</label>
                    <input
                      type="text"
                      required
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      placeholder="e.g. Ruwan Kumara"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "හැඳුනුම්පත් අංකය (NIC) *" : "NIC Number *"}</label>
                    <input
                      type="text"
                      required
                      value={custNic}
                      onChange={(e) => setCustNic(e.target.value)}
                      placeholder="e.g. 199015002444 / 901500244V"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "ජංගම දුරකථන අංකය" : "Mobile Phone"}</label>
                    <input
                      type="text"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      placeholder="e.g. 0771234567"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "පදිංචි ලිපිනය" : "Residential Address"}</label>
                    <input
                      type="text"
                      value={custAddress}
                      onChange={(e) => setCustAddress(e.target.value)}
                      placeholder="e.g. No 45, Galle Road, Colombo"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* II. Relative information */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-slate-400">2. Closest Relative Sponsor / පවුලේ ළඟම ඥාතියා</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "ඥාතියාගේ නම" : "Relative Name"}</label>
                    <input
                      type="text"
                      value={relName}
                      onChange={(e) => setRelName(e.target.value)}
                      placeholder="e.g. Sunetha Kumari"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "සම්බන්ධතාවය (Relationship)" : "Relationship"}</label>
                    <input
                      type="text"
                      value={relRelationship}
                      onChange={(e) => setRelRelationship(e.target.value)}
                      placeholder="e.g. Wife / Mother"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "හැඳුනුම්පත (NIC) / දුරකථනය" : "NIC / Phone"}</label>
                    <input
                      type="text"
                      value={relNic}
                      onChange={(e) => setRelNic(e.target.value)}
                      placeholder="NIC: 19854... / Phone"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "ඥාතියාගේ ලිපිනය" : "Address"}</label>
                    <input
                      type="text"
                      value={relAddress}
                      onChange={(e) => setRelAddress(e.target.value)}
                      placeholder="Residential address"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* III. Guarantor details */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-slate-400">3. Collateral Security Guarantor / ඇපකරුගේ තොරතුරු</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "ඇපකරුගේ නම" : "Guarantor Name"}</label>
                    <input
                      type="text"
                      value={g1Name}
                      onChange={(e) => setG1Name(e.target.value)}
                      placeholder="e.g. K. Perera"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "හැඳුනුම්පත (NIC)" : "Guarantor NIC"}</label>
                    <input
                      type="text"
                      value={g1Nic}
                      onChange={(e) => setG1Nic(e.target.value)}
                      placeholder="Guarantor NIC"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "දුරකථන අංකය" : "Guarantor Phone"}</label>
                    <input
                      type="text"
                      value={g1Phone}
                      onChange={(e) => setG1Phone(e.target.value)}
                      placeholder="e.g. 0713344556"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "ඇපකරුගේ ලිපිනය" : "Guarantor Address"}</label>
                    <input
                      type="text"
                      value={g1Address}
                      onChange={(e) => setG1Address(e.target.value)}
                      placeholder="Guarantor Address"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* IV. Loan Capital Terms */}
              <div className="space-y-4 pt-2">
                <h4 className="text-[10px] font-black uppercase text-indigo-700">4. Underwriting Credit Terms & Interest / ණය ගිවිසුම් කොන්දේසි</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-150/40">
                  <div>
                    <label className="text-[9px] font-bold text-indigo-900 uppercase block mb-1">{lang === "si" ? "අනුමත ණය මුදල (LKR) *" : "Approved Loan Capital (LKR) *"}</label>
                    <input
                      type="number"
                      required
                      value={custRequested}
                      onChange={(e) => setCustRequested(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "පොලී අනුපාතිකය (%)" : "Flat Interest Rate (%)"}</label>
                    <input
                      type="number"
                      value={custInterRate}
                      onChange={(e) => setCustInterRate(e.target.value)}
                      placeholder="25"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{lang === "si" ? "වාරික ගණන (දින/සති/මාස)" : "Installments Count"}</label>
                    <input
                      type="number"
                      value={custDuration}
                      onChange={(e) => setCustDuration(e.target.value)}
                      placeholder="12"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-550 uppercase block mb-1">{lang === "si" ? "ණය ලබා ගැනීමට හේතුව" : "Purpose or Trade"}</label>
                    <input
                      type="text"
                      value={custPurpose}
                      onChange={(e) => setCustPurpose(e.target.value)}
                      placeholder="e.g. Retail Shop investment"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                    />
                  </div>
                </div>

                {/* Instant Calculation Preview */}
                {parseFloat(custRequested) > 0 && (
                  <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs select-none">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">CAPITAL AMOUNT</span>
                      <span className="font-extrabold text-[13px]">{formatLKR(parseFloat(custRequested))}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">FLAT INTEREST</span>
                      <span className="font-extrabold text-[13px] text-amber-400">+{formatLKR(parseFloat(custRequested) * (parseFloat(custInterRate) / 100 || 0.25))}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">TOTAL CONTRACTPAY</span>
                      <span className="font-extrabold text-[13px] text-emerald-450">{formatLKR(parseFloat(custRequested) + (parseFloat(custRequested) * (parseFloat(custInterRate) / 100 || 0.25)))}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">INSTALLMENT VALUE</span>
                      <span className="font-extrabold text-[14px] text-teal-350">{formatLKR(Math.round((parseFloat(custRequested) + (parseFloat(custRequested) * (parseFloat(custInterRate) / 100 || 0.25))) / (parseInt(custDuration) || 12)))}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Trigger Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('WORKSPACE')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer transition-all"
                >
                  {lang === "si" ? "පසුපසට" : "Back to Home"}
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4 text-indigo-400" />
                  {lang === "si" ? "නව ණයකරු එකතු කර ණය නිකුත් කරන්න" : "Disburse Credit Asset Application"}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TAB 3: LOAN REPAYMENT / COLLECTIONS REGISTER IN FIELD */}
        {activeTab === 'COLLECT' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-505" />
                {lang === "si" ? "දෛනික ණය වාරික එකතු කිරීමේ පෝරමය" : "Repayment & collection logger"}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {lang === "si" 
                  ? "පාරිභෝගිකයින්ගෙන් අතට එකතු කරගන්නා ණය වාරික, සටහන් සමඟ වහාම මෙතැනින් ඇතුලත් කරන්න." 
                  : "Post new daily collection cash values directly. Select customer and specify collected amount."}
              </p>
            </div>

            {lastCollectionReceipt && (
              <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-2xl text-xs font-bold font-sans flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <span className="flex items-center gap-2">✓ {lastCollectionReceipt.msg}</span>
                <a 
                  href={`https://wa.me/${lastCollectionReceipt.targetPhone.replace(/^0/, '+94')}?text=${lastCollectionReceipt.waText}`}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  {lang === "si" ? "WhatsApp හරහා රිසිට් එක යවන්න" : "Send e-Receipt via WhatsApp"}
                </a>
              </div>
            )}

            <form onSubmit={handlePostCollection} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4">
                <label className="text-[9px] font-bold text-slate-505 uppercase block mb-1">
                  {lang === "si" ? "පාරිභෝගිකයා තෝරන්න *" : "Choose Client *"}
                </label>
                <select
                  required
                  value={selectedLoanId}
                  onChange={(e) => setSelectedLoanId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-810 font-bold outline-none"
                >
                  <option value="">{lang === "si" ? "-- තෝරන්න (Select Customer) --" : "-- Select Active Loan --"}</option>
                  {loans.filter(l => l.status === "ACTIVE").map(l => (
                    <option key={l.id} value={l.id}>
                      {l.applicant.fullName} ({l.applicant.nic})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="text-[9px] font-bold text-slate-505 uppercase block mb-1">
                  {lang === "si" ? "අයකරගත් වාරිකයේ මුදල (LKR) *" : "Collected Inst Amount (LKR) *"}
                </label>
                <input
                  type="number"
                  required
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.8 text-xs font-black font-mono text-slate-800 outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-[9px] font-bold text-slate-505 uppercase block mb-1">
                  {lang === "si" ? "සටහන් / විස්තර (Notes)" : "Notes or remarks"}
                </label>
                <input
                  type="text"
                  value={collectNotes}
                  onChange={(e) => setCollectNotes(e.target.value)}
                  placeholder="e.g. Week 4 paid"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-black py-2 rounded-xl text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  {lang === "si" ? "තුලනය සටහන් කරන්න" : "Post Cash"}
                </button>
              </div>
            </form>

            {/* Active outstanding status files list on representative's desk */}
            <div>
              <h4 className="text-xs font-black uppercase text-slate-800 scroll-mb-1 tracking-wider mb-3">
                {lang === "si" ? "ක්‍රියාකාරී ණය ගිණුම් පිළිබඳ සාරාංශය" : "Quick active loans balance board"}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loans.filter(l => l.status === "ACTIVE").map(l => {
                  const totalPaid = l.collections.reduce((sum, c) => sum + c.amount, 0);
                  const totalWithInt = l.officeUse.approvedAmount + (l.officeUse.approvedAmount * (l.officeUse.interestRate / 100));
                  const remOutstanding = totalWithInt - totalPaid;
                  return (
                    <div key={l.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h5 className="font-bold text-xs text-slate-800">{l.applicant.fullName}</h5>
                          <span className="text-[8px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded uppercase">
                            {formatLKR(l.officeUse.monthlyInstallment)}/inst
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">NIC: {l.applicant.nic} | Phone: {l.applicant.phone}</p>
                      </div>

                      <div className="space-y-1 text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total Contract Value:</span>
                          <span className="font-mono text-slate-700 font-bold">{formatLKR(totalWithInt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total Collections:</span>
                          <span className="font-mono text-emerald-600 font-bold">{formatLKR(totalPaid)}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-200">
                          <span className="text-slate-550 font-bold">Outstanding:</span>
                          <span className="font-mono text-slate-900 font-extrabold">{formatLKR(remOutstanding)}</span>
                        </div>
                      </div>

                      {/* Choose Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLoanId(l.id);
                          // Auto scroll to form
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className="text-center w-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-1.5 rounded-xl text-[10px]"
                      >
                        {lang === "si" ? "මෙම ණයකරු තෝරන්න" : "Select this Client"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: FIELD EXPENSES AND HANDING BACK CASH TO OFFICE */}
        {activeTab === 'EXPENSE_REMIT' && (
          <div className="space-y-8">
            
            {/* Field expense log section */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 text-amber-700">
                  <TrendingDown className="w-5 h-5 text-amber-600" />
                  {lang === "si" ? "1. දෛනික ක්ෂේත්‍ර වියදම් ලොග් කිරීමේ පෝරමය" : "I. Field expenditures log"}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {lang === "si" 
                    ? "ගමන් ගාස්තු, ක්‍රියාන්විත වියදම් ආදිය ඔබේ දෛනික අත්මුදලින් වියදම් වූ සැනින් මෙතැනින් අඩු කරන්න." 
                    : "Declare field expenses like fuel, batta lunches, communication or vehicle repairs directly."}
                </p>
              </div>

              <form onSubmit={handlePostExpense} className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-3">
                  <label className="text-[9px] font-bold text-slate-500 block mb-1">
                    {lang === "si" ? "වියදම් මුදල (LKR) *" : "Expense amount (LKR) *"}
                  </label>
                  <input
                    type="number"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold font-mono outline-none"
                  />
                </div>
                <div className="md:col-span-7">
                  <label className="text-[9px] font-bold text-slate-500 block mb-1">
                    {lang === "si" ? "වියදමට අදාළ විස්තරය *" : "Expense purpose / Description *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    placeholder="e.g. Fuel for motorcycle or service lunches in the field"
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-550 text-white font-black py-1.8 rounded-xl text-xs cursor-pointer active:scale-95 transition-all outline-none"
                  >
                    {lang === "si" ? "වියදම එක්කරන්න" : "Post Expense"}
                  </button>
                </div>
              </form>
            </div>

            {/* Cash Handback to Office (Remittances) */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 text-indigo-700">
                  <Coins className="w-5 h-5 text-indigo-505" />
                  {lang === "si" ? "2. දිනපතා කාර්යාලය වෙත මුදල් භාරදීම" : "II. Remit cash back to Office Headquarters"}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {lang === "si" 
                    ? "ක්ෂේත්‍රයෙන් එකතු කරගත් අතැති මුදල් ප්‍රධාන කළමනාකරු වෙත භාර දෙන විට මෙතැනින් සටහන් කරන්න." 
                    : "Log returns of collections capital back to HQ. Needs verification code audit by office managers."}
                </p>
              </div>

              <form onSubmit={handlePostRemittance} className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-12 mb-1">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white border border-indigo-100 shadow-sm">
                    <span className="text-xs font-bold text-slate-500 uppercase">{lang === "si" ? "ඔබ සතුව තිබිය යුතු මුළු මුදල:" : "Expected Cash in Hand:"}</span>
                    <span className="text-base font-black text-indigo-700 font-mono tracking-tight">{formatLKR(currentCashInHand)}</span>
                  </div>
                </div>
                <div className="md:col-span-3">
                  <label className="text-[9px] font-bold text-slate-500 block mb-1">
                    {lang === "si" ? "භාරදුන් මුදල (LKR) *" : "Actual Remitted Cash (LKR) *"}
                  </label>
                  <input
                    type="number"
                    required
                    value={remAmount}
                    onChange={(e) => setRemAmount(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold font-mono outline-none"
                  />
                </div>
                <div className="md:col-span-7">
                  <label className="text-[9px] font-bold text-slate-500 block mb-1">
                    {lang === "si" ? "කාර්යාලීය ලැබීම් සටහන්" : "HQ Receipts Details / Notes"}
                  </label>
                  <input
                    type="text"
                    value={remNotes}
                    onChange={(e) => setRemNotes(e.target.value)}
                    placeholder="e.g. Wednesday Cash Handover at 5.00 PM counter"
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-1.8 rounded-xl text-xs cursor-pointer active:scale-95 transition-all outline-none"
                  >
                    {lang === "si" ? "මුදල් භාරදෙන්න" : "Post Remit"}
                  </button>
                </div>
              </form>
            </div>

            {/* Rep-to-Rep Transfers */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 text-teal-700">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                  {lang === "si" ? "3. නිලධාරියෙකුගෙන් තවත් නිලධාරියෙකුට මුදල් මාරු කිරීම" : "III. Rep-to-Rep Cash Transfer"}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {lang === "si" 
                    ? "ඔබ සතුව ඇති අත්මුදල් වෙනත් ක්ෂේත්‍ර නිලධාරියෙකුට යැවීමට මෙතැන භාවිතා කරන්න." 
                    : "Transfer your current cash in hand to another field officer."}
                </p>
              </div>

              <form onSubmit={handlePostRepTransfer} className="p-4 bg-teal-50/50 border border-teal-100 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-3">
                  <label className="text-[9px] font-bold text-slate-500 block mb-1">
                    {lang === "si" ? "මාරු කරන මුදල (LKR) *" : "Transfer Amount (LKR) *"}
                  </label>
                  <input
                    type="number"
                    required
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold font-mono outline-none"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="text-[9px] font-bold text-slate-500 block mb-1">
                    {lang === "si" ? "නිලධාරියා තෝරන්න *" : "Target Officer *"}
                  </label>
                  <select
                    required
                    value={transferTargetId}
                    onChange={e => setTransferTargetId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold outline-none"
                  >
                    <option value="" disabled>{lang === "si" ? "-- නිලධාරියෙකු තෝරන්න --" : "-- Select Officer --"}</option>
                    {fieldOfficers.filter(o => o.status !== 'INACTIVE' && o.id !== officer.id).map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="text-[9px] font-bold text-slate-500 block mb-1">
                    {lang === "si" ? "සටහන" : "Remarks / Notes"}
                  </label>
                  <input
                    type="text"
                    value={transferNotes}
                    onChange={(e) => setTransferNotes(e.target.value)}
                    placeholder="Remarks"
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-black py-1.8 rounded-xl text-xs cursor-pointer active:scale-95 transition-all outline-none"
                  >
                    {lang === "si" ? "මුදල් යවන්න" : "Transfer Cash"}
                  </button>
                </div>
              </form>
            </div>

            {/* List of outstanding physical transaction verifications */}
            <div>
              <h4 className="text-xs font-black uppercase text-slate-800 mb-3 tracking-wider">
                {lang === "si" ? "කාර්යාලයට භාරදුන් මුදල් වල තත්ත්වය (Remittances Board)" : "Cash Handover Remittances Audit Trail"}
              </h4>
              <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-slate-50/50">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-extrabold text-[9px] uppercase border-b border-slate-100">
                    <tr>
                      <th className="p-3">{lang === "si" ? "දිනය" : "Date"}</th>
                      <th className="p-3">{lang === "si" ? "විස්තරය" : "Notes"}</th>
                      <th className="p-3">{lang === "si" ? "තත්ත්වය" : "Status"}</th>
                      <th className="p-3 text-right">{lang === "si" ? "මුදල" : "Handover Value"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-750">
                    {officer.remittances.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-400 font-medium font-mono">
                          {lang === "si" ? "කාර්යාලය වෙත කිසිදු මුදල් භාරදීමක් සටහන් වී නොමැත." : "No returned cash logs to Headquarters found."}
                        </td>
                      </tr>
                    ) : (
                      officer.remittances.map(r => (
                        <tr key={r.id}>
                          <td className="p-3 font-mono font-bold text-slate-500">{r.date}</td>
                          <td className="p-3 font-medium text-slate-600">{r.notes || "-"}</td>
                          <td className="p-3">
                            {r.status === 'APPROVED' ? (
                              <span className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-0.5">
                                ✓ APPROVED / තහවුරුයි
                              </span>
                            ) : r.status === 'REJECTED' ? (
                              <span className="text-[10px] font-black text-rose-600 uppercase">
                                ✕ REJECTED
                              </span>
                            ) : (
                              <span className="text-[10px] font-black text-amber-600 flex items-center gap-1 animate-pulse uppercase">
                                ⚠ PENDING OFFICE CONFIRM
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right font-black font-mono text-slate-800">{formatLKR(r.amount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: ON-DEMAND REPRESENTATIVE EOD REPORT SLIP (VOUCHER STYLE) */}
        {activeTab === 'EOD' && (() => {
          const repAllowances = officer.allowances.filter(a => a.status === 'APPROVED' && a.date === reportDate);
          const fV = repAllowances.filter(a => a.type === 'FLOAT').reduce((sum, a) => sum + a.amount, 0);
          const bV = repAllowances.filter(a => a.type === 'BATTA' || !a.type).reduce((sum, a) => sum + a.amount, 0);
          const oV = repAllowances.filter(a => a.type === 'OTHER').reduce((sum, a) => sum + a.amount, 0);
          
          const repColls = officerCollections.filter(c => c.date === reportDate);
          const cV = repColls.reduce((sum, c) => sum + c.amount, 0);
          
          const repExps = officer.expenses.filter(e => e.status !== 'REJECTED' && e.date === reportDate);
          const eV = repExps.reduce((sum, e) => sum + e.amount, 0);
          
          const repRems = officer.remittances.filter(r => r.status !== 'REJECTED' && r.date === reportDate);
          const rV = repRems.reduce((sum, r) => sum + r.amount, 0);
          
          const eodInflow = fV + cV + bV + oV;
          const eodOutflow = eV + rV;
          const eodBalanceValue = eodInflow - eodOutflow;

          return (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                    {lang === "si" ? "මාගේ දෛනික ගනුදෙනු ලේඛන සාරාංශය (My EOD Report)" : "My Daily End-Of-Day Voucher Status"}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {lang === "si" ? "ඕනෑම දවසක ව්‍යාපාරික ශේෂ ඉලක්කම් මෙතැනින් පරීක්ෂා කර මුද්‍රණය කරගන්න." : "Aesthetic automated thermal printer voucher slips compilation."}
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
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl">
                <div className="bg-white border border-slate-200 shadow-md rounded-2xl max-w-sm mx-auto p-5 font-mono text-xs text-slate-800 leading-relaxed space-y-4" id="eod-thermal-slip-rep">
                  <div className="text-center space-y-1">
                    <h3 className="font-extrabold text-[12px] tracking-widest text-slate-900 border-b border-dashed border-slate-300 pb-2">
                      SETH CAPITAL COOPERATIVE
                    </h3>
                    <p className="text-[9px] uppercase font-bold text-slate-400">
                      Representative EOD Ledger Voucher
                    </p>
                  </div>

                  <div className="space-y-1 text-[10px] border-b border-dashed border-slate-250 pb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">REP NAME:</span>
                      <span className="font-bold text-slate-800 truncate max-w-[200px]">{officer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">NIC/ID:</span>
                      <span className="font-bold font-mono text-slate-800">{officer.nic}</span>
                    </div>
                    {officer.employeeId && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">STAFF ID:</span>
                        <span className="font-bold font-mono text-slate-800">{officer.employeeId}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">DATE:</span>
                      <span className="font-bold font-mono text-slate-800">{reportDate}</span>
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
                        <span className="font-bold font-mono text-emerald-600">+{formatLKR(fV)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>- {lang === "si" ? "වාරික එකතු කිරීම්" : "Loan Collections"}</span>
                        <span className="font-bold font-mono text-emerald-600">+{formatLKR(cV)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>- {lang === "si" ? "බත්තා දීමනා" : "Daily Batta"}</span>
                        <span className="font-bold font-mono text-emerald-600">+{formatLKR(bV)}</span>
                      </div>
                      {oV > 0 && (
                        <div className="flex justify-between">
                          <span>- {lang === "si" ? "වෙනත් ගෙවීම්" : "Other Allocation"}</span>
                          <span className="font-bold font-mono text-emerald-600">+{formatLKR(oV)}</span>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-slate-150 pt-1 flex justify-between font-bold text-xs">
                      <span>{lang === "si" ? "මුළු ලැබීම් එකතුව" : "Total Cash Inflow"}</span>
                      <span className="font-mono text-slate-900">{formatLKR(eodInflow)}</span>
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
                        <span className="font-bold font-mono text-rose-500">-{formatLKR(eV)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>- {lang === "si" ? "කාර්යාලයට භාරදුන් මුදල්" : "Remitted Cash"}</span>
                        <span className="font-bold font-mono text-rose-500">-{formatLKR(rV)}</span>
                      </div>
                    </div>
                    <div className="border-t border-slate-150 pt-1 flex justify-between font-bold text-xs">
                      <span>{lang === "si" ? "මුළු වියදම් එකතුව" : "Total Outflow"}</span>
                      <span className="font-mono text-slate-900">{formatLKR(eodOutflow)}</span>
                    </div>
                  </div>

                  {/* Closing Balance position */}
                  <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-200 border-t-2 border-slate-800 text-center space-y-1">
                    <div className="flex justify-between font-black text-xs">
                      <span>{lang === "si" ? "අවසාන අතැති ශේෂය" : "CLOSING CASH HANDOVER"}</span>
                      <span className={`font-mono text-sm ${eodBalanceValue >= 0 ? "text-emerald-700 font-extrabold" : "text-rose-600 font-extrabold"}`}>
                        {formatLKR(eodBalanceValue)}
                      </span>
                    </div>
                    <p className="text-[8px] text-slate-400 font-bold mt-1">
                      {eodBalanceValue === 0 
                        ? (lang === "si" ? "✓ සියලුම ගනුදෙනු තුලනය වී ඇත." : "✓ Balance cleared perfectly.") 
                        : (lang === "si" ? "* මෙම මුදල ප්‍රධාන කාර්යාලය වෙත භාරදිය යුතුය." : "* This cash balance must be given to Headquarters.")}
                    </p>
                  </div>

                  {/* Warning on empty records */}
                  {repColls.length === 0 && fV === 0 && bV === 0 && eV === 0 && rV === 0 && (
                    <div className="p-3 bg-rose-50/50 rounded-xl text-center border border-rose-105">
                      <p className="text-[9px] font-extrabold text-rose-600">
                        {lang === "si" ? "තෝරාගත් දිනයේ කිසිදු ගනුදෙනුවක් සිදු වී නැත." : "NO REGISTERED TRANSACTIONS ON THIS DATE."}
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
                        {lang === "si" ? "කළමනාකරු අත්සන" : "HQ Audited Sign"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Print Actions */}
                <div className="flex justify-center mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      const printContent = document.getElementById("eod-thermal-slip-rep")?.innerHTML;
                      if (printContent) {
                        const win = window.open("", "", "width=500,height=700");
                        if (win) {
                          win.document.write(`
                            <html>
                              <head>
                                <title>EOD - ${officer.name}</title>
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
                    <Printer className="w-4 h-4 text-emerald-400" />
                    {lang === "si" ? "මෙම වාර්තාව මුද්‍රණය කරන්න" : "Print End-Of-Day Slip"}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      </div>

    </div>
  );
}
