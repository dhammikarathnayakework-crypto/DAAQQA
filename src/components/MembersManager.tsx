import React, { useState, useMemo } from "react";
import { 
  Users, 
  Search, 
  ChevronRight, 
  Phone, 
  MapPin, 
  User, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  SearchCode,
  FileSpreadsheet,
  Printer,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  Heart,
  ShieldCheck,
  Building2,
  CircleDot
} from "lucide-react";
import { Loan, PaymentCollection } from "../types";
import { formatLKR } from "../utils";
import { Language } from "../translations";

interface MembersManagerProps {
  loans: Loan[];
  lang: Language;
  onSelectLoan: (id: string) => void;
  setActiveTab: (tab: any) => void;
}

export default function MembersManager({ 
  loans, 
  lang,
  onSelectLoan,
  setActiveTab
}: MembersManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNic, setSelectedNic] = useState<string>("");

  // Aggregate and extract unique members based on national identity NIC number
  const uniqueMembers = useMemo(() => {
    const map = new Map<string, {
      fullName: string;
      nic: string;
      phone: string;
      address: string;
      memberNumber?: string;
      idFront?: string;
      idBack?: string;
      signedDoc?: string;
      earnings?: number;
      additionalIncome?: number;
      loans: Loan[];
    }>();

    loans.forEach(loan => {
      const nicKey = loan.applicant.nic.trim().toUpperCase();
      if (!nicKey) return;
      
      const existing = map.get(nicKey);
      if (!existing) {
        map.set(nicKey, {
          fullName: loan.applicant.fullName,
          nic: loan.applicant.nic.trim().toUpperCase(),
          phone: loan.applicant.phone,
          address: loan.applicant.address,
          memberNumber: loan.applicant.memberNumber,
          idFront: loan.applicant.idFront,
          idBack: loan.applicant.idBack,
          signedDoc: loan.applicant.signedDoc,
          earnings: loan.applicant.earnings,
          additionalIncome: loan.applicant.additionalIncome,
          loans: [loan]
        });
      } else {
        existing.loans.push(loan);
        // Bind latest valid values
        if (loan.applicant.memberNumber && !existing.memberNumber) {
          existing.memberNumber = loan.applicant.memberNumber;
        }
        if (loan.applicant.idFront && !existing.idFront) {
          existing.idFront = loan.applicant.idFront;
        }
        if (loan.applicant.idBack && !existing.idBack) {
          existing.idBack = loan.applicant.idBack;
        }
        if (loan.applicant.signedDoc && !existing.signedDoc) {
          existing.signedDoc = loan.applicant.signedDoc;
        }
      }
    });

    return Array.from(map.values());
  }, [loans]);

  // Handle active selected member to always default first if none selected
  const activeMember = useMemo(() => {
    if (uniqueMembers.length === 0) return null;
    const found = uniqueMembers.find(m => m.nic === selectedNic);
    return found || uniqueMembers[0];
  }, [uniqueMembers, selectedNic]);

  // Set default selection
  React.useEffect(() => {
    if (activeMember && !selectedNic) {
      setSelectedNic(activeMember.nic);
    }
  }, [activeMember, selectedNic]);

  // Filter members on screen based on query
  const filteredMembers = useMemo(() => {
    return uniqueMembers.filter(m => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return (
        m.fullName.toLowerCase().includes(query) ||
        m.nic.toLowerCase().includes(query) ||
        (m.memberNumber && m.memberNumber.toLowerCase().includes(query)) ||
        m.phone.includes(query)
      );
    });
  }, [uniqueMembers, searchQuery]);

  // Compute summary stats across all unique members
  const memberStats = useMemo(() => {
    const totalCount = uniqueMembers.length;
    let withActiveCount = 0;
    let completedAllCount = 0;
    let totalPaidAll = 0;
    let totalApprovedAll = 0;

    uniqueMembers.forEach(m => {
      const hasActive = m.loans.some(l => l.status === "ACTIVE" || l.status === "OVERDUE");
      const hasOnlyCompleted = m.loans.length > 0 && m.loans.every(l => l.status === "COMPLETED");

      if (hasActive) withActiveCount++;
      if (hasOnlyCompleted) completedAllCount++;

      m.loans.forEach(l => {
        totalApprovedAll += l.officeUse.approvedAmount;
        l.collections.forEach(c => {
          totalPaidAll += c.amount;
        });
      });
    });

    return {
      totalCount,
      withActiveCount,
      completedAllCount,
      totalPaidAll,
      totalApprovedAll
    };
  }, [uniqueMembers]);

  // Calculate stats for the selected specific member profile
  const selectedMemberStats = useMemo(() => {
    if (!activeMember) return null;
    let approvedPrincipal = 0;
    let interestRateAmount = 0;
    let totalCollectionsPaid = 0;
    let activeCount = 0;
    let overdueCount = 0;
    let completedCount = 0;
    let pendingCount = 0;
    
    const paymentHistory: {
      collection: PaymentCollection;
      loanAppNo: string;
    }[] = [];

    activeMember.loans.forEach(l => {
      approvedPrincipal += l.officeUse.approvedAmount;
      interestRateAmount += l.officeUse.approvedAmount * (l.officeUse.interestRate / 100);
      
      const loanPaid = l.collections.reduce((sum, c) => sum + c.amount, 0);
      totalCollectionsPaid += loanPaid;

      if (l.status === "ACTIVE") activeCount++;
      else if (l.status === "OVERDUE") overdueCount++;
      else if (l.status === "COMPLETED") completedCount++;
      else if (l.status === "PENDING") pendingCount++;

      l.collections.forEach(c => {
        paymentHistory.push({
          collection: c,
          loanAppNo: l.officeUse.applicationNumber
        });
      });
    });

    // Sort complete transactions by date descending
    paymentHistory.sort((a, b) => new Date(b.collection.date).getTime() - new Date(a.collection.date).getTime());

    const totalDueWithInterest = approvedPrincipal + interestRateAmount;
    const remainingOutstanding = Math.max(0, totalDueWithInterest - totalCollectionsPaid);

    return {
      approvedPrincipal,
      interestRateAmount,
      totalDueWithInterest,
      totalCollectionsPaid,
      remainingOutstanding,
      activeCount,
      overdueCount,
      completedCount,
      pendingCount,
      paymentHistory
    };
  }, [activeMember]);

  // Handle immediate window-native printing of member transaction report ledger
  const handlePrintMemberLedger = () => {
    if (!activeMember || !selectedMemberStats) return;
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to generate print layouts.");
      return;
    }

    const titleEn = `Member Ledger Profile: ${activeMember.fullName}`;
    const titleSi = `සාමාජික ණය ගිණුම් වාර්තාව: ${activeMember.fullName}`;

    const rowsHtml = selectedMemberStats.paymentHistory.map(item => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
        <td style="padding: 10px; font-family: monospace;">${item.collection.date}</td>
        <td style="padding: 10px; font-weight: bold; font-family: monospace;">${item.collection.receiptNumber}</td>
        <td style="padding: 10px; font-family: monospace; color: #4338ca;">#${item.loanAppNo}</td>
        <td style="padding: 10px; font-weight: 500;">${item.collection.monthOfCollection || "Installment"}</td>
        <td style="padding: 10px; font-weight: bold; text-align: right; font-family: monospace; color: #0f766e;">Rs. ${item.collection.amount.toLocaleString()}</td>
      </tr>
    `).join("");

    const loansHtml = activeMember.loans.map(l => {
      const paid = l.collections.reduce((s, c) => s + c.amount, 0);
      const totalDue = l.officeUse.approvedAmount + (l.officeUse.approvedAmount * (l.officeUse.interestRate / 100));
      const balance = totalDue - paid;
      return `
        <tr style="border-bottom: 1px solid #edf2f7; font-size: 11px;">
          <td style="padding: 8px; font-weight: bold; font-family: monospace; color: #4f46e5;">#${l.officeUse.applicationNumber}</td>
          <td style="padding: 8px; font-weight: bold; font-family: monospace;">Rs. ${l.officeUse.approvedAmount.toLocaleString()}</td>
          <td style="padding: 8px; font-family: monospace;">${l.officeUse.interestRate}%</td>
          <td style="padding: 8px; font-weight: bold; font-family: monospace;">Rs. ${totalDue.toLocaleString()}</td>
          <td style="padding: 8px; font-weight: bold; font-family: monospace; color: #0d9488;">Rs. ${paid.toLocaleString()}</td>
          <td style="padding: 8px; font-weight: bold; font-family: monospace; color: #e11d48;">Rs. ${balance.toLocaleString()}</td>
          <td style="padding: 8px; font-weight: 900; color: ${l.status === 'COMPLETED' ? '#10b981' : l.status === 'ACTIVE' ? '#2563eb' : '#f59e0b'}">${l.status}</td>
        </tr>
      `;
    }).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>${lang === "si" ? titleSi : titleEn}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; color: #1e293b; padding: 40px; }
            .header { border-bottom: 3px double #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .meta-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px; background-color: #fafbfb; padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9; }
            .stats-bar { display: grid; grid-template-cols: 1fr 1fr 1fr; gap: 15px; margin-bottom: 35px; }
            .stat-box { border: 1px solid #e2e8f0; padding: 15px; border-radius: 10px; background-color: #ffffff; text-align: center; }
            .table-heading { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; margin-bottom: 15px; border-left: 4px solid #4f46e5; padding-left: 8px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background-color: #f8fafc; color: #475569; font-weight: bold; text-transform: uppercase; font-size: 10px; padding: 10px; border-bottom: 2px solid #cbd5e1; text-align: left; }
            .footer { border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 10px; color: #94a3b8; font-weight: bold; margin-top: 50px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2 style="margin: 0; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 850;">Seth Capital Micro Ledger</h2>
              <h1 style="margin: 5px 0 0 0; font-size: 22px; color: #0f172a; font-weight: 900;">${lang === "si" ? "සාමාජික මූල්‍ය කාඩ්පත" : "Member Financial Profile"}</h1>
            </div>
            <div style="text-align: right;">
              <span style="font-family: monospace; font-size: 11px; font-weight: bold; background: #0f172a; color: white; padding: 5px 12px; border-radius: 6px;">
                ${activeMember.memberNumber || "N/A"}
              </span>
              <p style="font-size: 10px; color: #94a3b8; margin: 5px 0 0 0; font-weight: bold; font-family: monospace;">PRINTED: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
            </div>
          </div>

          <div class="meta-grid">
            <div>
              <p style="margin: 0; font-size: 10px; color: #94a3b8; font-weight: bold;">MEMBER NAME / සාමාජිකයාගේ නම</p>
              <h3 style="margin: 4px 0 12px 0; font-size: 14px; font-weight: 800; color: #0f172a;">${activeMember.fullName}</h3>
              
              <p style="margin: 0; font-size: 10px; color: #94a3b8; font-weight: bold;">ADDRESS / ස්ථිර ලිපිනය</p>
              <p style="margin: 4px 0 0 0; font-size: 11px; font-weight: 500; font-family: system-ui; line-height: 1.4;">${activeMember.address}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 10px; color: #94a3b8; font-weight: bold;">NIC NUMBER / හැඳුනුම්පත් අංකය</p>
              <h3 style="margin: 4px 0 12px 0; font-size: 13px; font-weight: 800; font-family: monospace; color: #4338ca;">${activeMember.nic}</h3>
              
              <p style="margin: 0; font-size: 10px; color: #94a3b8; font-weight: bold;">TELEPHONE / දුරකථන අංකය</p>
              <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: 700; font-family: monospace; color: #0d9488;">${activeMember.phone}</p>
            </div>
          </div>

          <div class="stats-bar">
            <div class="stat-box">
              <span style="display: block; font-size: 9px; color: #64748b; font-weight: bold; text-transform: uppercase;">Total Capital Disbursed</span>
              <span style="font-size: 15px; font-weight: 900; font-family: monospace; color: #1e1b4b; display: block; margin-top: 5px;">Rs. ${selectedMemberStats.approvedPrincipal.toLocaleString()}</span>
            </div>
            <div class="stat-box">
              <span style="display: block; font-size: 9px; color: #64748b; font-weight: bold; text-transform: uppercase;">Total Repaid Cash</span>
              <span style="font-size: 15px; font-weight: 900; font-family: monospace; color: #065f46; display: block; margin-top: 5px;">Rs. ${selectedMemberStats.totalCollectionsPaid.toLocaleString()}</span>
            </div>
            <div class="stat-box" style="background-color: #fff1f2; border-color: #fecdd3;">
              <span style="display: block; font-size: 9px; color: #991b1b; font-weight: bold; text-transform: uppercase;">Remaining Outstanding</span>
              <span style="font-size: 15px; font-weight: 900; font-family: monospace; color: #9f1239; display: block; margin-top: 5px;">Rs. ${selectedMemberStats.remainingOutstanding.toLocaleString()}</span>
            </div>
          </div>

          <div class="table-heading">${lang === "si" ? "ලබාගත් ණය ප්‍රමාදයන් ලේඛනය" : "Loans Portfolio Record Book"}</div>
          <table>
            <thead>
              <tr>
                <th>App App No</th>
                <th>Principal Approved</th>
                <th>Interest Rate</th>
                <th>Total Bill Due</th>
                <th>Total Paid Back</th>
                <th>Outstanding</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${loansHtml}
            </tbody>
          </table>

          <div class="table-heading">${lang === "si" ? "දක්වා සිදු කරන ලද ගෙවීම් සම්බන්ධ කාල රේඛාව" : "Historical Collection Timeline Repayments"}</div>
          <table>
            <thead>
              <tr>
                <th>Date Paid</th>
                <th>Receipt Number</th>
                <th>Loan Reference</th>
                <th>Installment Target</th>
                <th style="text-align: right;">Collected Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #94a3b8; font-weight: bold;">No payment records logged in system.</td></tr>`}
            </tbody>
          </table>

          <div style="margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div style="text-align: center; width: 200px;">
              <div style="border-bottom: 1px solid #1e293b; height: 40px; margin-bottom: 6px;"></div>
              <span style="font-size: 10px; font-weight: bold; color: #475569;">Member Signature / සාමාජික අත්සන</span>
            </div>
            <div style="text-align: center; width: 200px;">
              <div style="border-bottom: 1px solid #1e293b; height: 40px; margin-bottom: 6px;"></div>
              <span style="font-size: 10px; font-weight: bold; color: #475569;">Officer Signature / නිලධාරී අත්සන</span>
            </div>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} Seth Capital microfinance management system. Integrity verified secure records. Page 1/1</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 450);
  };

  return (
    <div className="space-y-6 font-sans select-none animate-fade-in" id="members-explorer-root">
      
      {/* 1. Global Member Metrics Top Dashboard Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="members-stats-header">
        <div className="bg-white border border-slate-150 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[9.5px] text-slate-400 font-extrabold block uppercase tracking-wider">
              {lang === "si" ? "මුළු ලියාපදිංචි සාමාජිකයන්" : "Total Unique Members"}
            </span>
            <span className="text-sm font-black text-slate-800 font-mono">
              {memberStats.totalCount} {lang === "si" ? "පිරිසක්" : "Registered"}
            </span>
          </div>
          <span className="p-2 bg-slate-100 text-slate-600 rounded-xl">
            <Users className="w-5 h-5 shrink-0" />
          </span>
        </div>

        <div className="bg-white border border-slate-150 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[9.5px] text-slate-400 font-extrabold block uppercase tracking-wider">
              {lang === "si" ? "සක්‍රීය බලාත්මක ණය හිමියන්" : "Active Borrowers"}
            </span>
            <span className="text-sm font-black text-indigo-700 font-mono">
              {memberStats.withActiveCount} {lang === "si" ? "දෙනෙක්" : "Entities"}
            </span>
          </div>
          <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <TrendingUp className="w-5 h-5 shrink-0" />
          </span>
        </div>

        <div className="bg-white border border-slate-150 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[9.5px] text-slate-400 font-extrabold block uppercase tracking-wider">
              {lang === "si" ? "සියලුම ණය පියවා අවසන් කල" : "Debt-Free Members"}
            </span>
            <span className="text-sm font-black text-teal-650 font-mono">
              {memberStats.completedAllCount} {lang === "si" ? "දෙනෙක්" : "Cleared"}
            </span>
          </div>
          <span className="p-2 bg-teal-50 text-teal-600 rounded-xl">
            <Award className="w-5 h-5 shrink-0" />
          </span>
        </div>

        <div className="bg-white border border-slate-150 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[9.5px] text-slate-400 font-extrabold block uppercase tracking-wider">
              {lang === "si" ? "එකතුකළ මුළු මුදල් ප්‍රමාණය" : "Aggregate Recoveries"}
            </span>
            <span className="text-sm font-black text-emerald-600 font-mono">
              {formatLKR(memberStats.totalPaidAll)}
            </span>
          </div>
          <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-5 h-5 shrink-0" />
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="members-workbench">
        
        {/* 2. Left Side: Searchable Roster of Members */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-xs space-y-4">
            
            {/* Search Input Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={lang === "si" ? "නම, හැඳුනුම්පත් හෝ සාමාජික අංකය..." : "Search name, NIC, or Member ID..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 font-medium outline-hidden transition duration-150"
              />
            </div>

            {/* List scroll container */}
            {filteredMembers.length === 0 ? (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-400 font-bold block text-[11px]">
                {lang === "si" ? "පිරික්සුමට අදාළ කිසිදු සාමාජිකයෙක් හමුනොවිණි." : "No registered members match criteria."}
              </div>
            ) : (
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {filteredMembers.map((member) => {
                  const hasOverdue = member.loans.some(l => l.status === "OVERDUE");
                  const hasActive = member.loans.some(l => l.status === "ACTIVE");
                  const onlyCompleted = member.loans.length > 0 && member.loans.every(l => l.status === "COMPLETED");
                  const totalBorrowed = member.loans.reduce((sum, l) => sum + l.officeUse.approvedAmount, 0);

                  return (
                    <button
                      key={member.nic}
                      onClick={() => setSelectedNic(member.nic)}
                      className={`w-full text-left p-3.5 border rounded-2xl flex items-center justify-between transition cursor-pointer select-none active:scale-[0.99] ${
                        member.nic === activeMember?.nic 
                          ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10" 
                          : "bg-white hover:bg-slate-50 border-slate-150 text-slate-700 hover:border-slate-250"
                      }`}
                    >
                      <div className="space-y-1 truncate pr-2">
                        <p className="font-extrabold text-[12px] truncate leading-tight">{member.fullName}</p>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold">
                          <span className={`font-mono ${member.nic === activeMember?.nic ? "text-slate-300" : "text-slate-400"}`}>
                            NIC: {member.nic}
                          </span>
                          {member.memberNumber && (
                            <>
                              <span className={member.nic === activeMember?.nic ? "text-slate-600" : "text-slate-200"}>|</span>
                              <span className={`font-mono ${member.nic === activeMember?.nic ? "text-indigo-400" : "text-indigo-600"}`}>
                                {member.memberNumber}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-right space-y-1 shrink-0">
                        <span className="font-mono text-[11px] font-black block leading-none">
                          {formatLKR(totalBorrowed)}
                        </span>
                        
                        {/* Member microbadge status indicators */}
                        {hasOverdue ? (
                          <span className="font-mono text-[8px] font-extrabold bg-rose-500 text-white px-1.5 py-0.2 rounded inline-block uppercase tracking-wider scale-90">
                            Overdue
                          </span>
                        ) : hasActive ? (
                          <span className="font-mono text-[8px] font-extrabold bg-indigo-500 text-white px-1.5 py-0.2 rounded inline-block uppercase tracking-wider scale-90">
                            {member.loans.filter(l => l.status === "ACTIVE").length} Active
                          </span>
                        ) : onlyCompleted ? (
                          <span className="font-mono text-[8px] font-extrabold bg-teal-550 text-white px-1.5 py-0.2 rounded inline-block uppercase tracking-wider scale-90">
                            Paid Out
                          </span>
                        ) : (
                          <span className="font-mono text-[8px] font-extrabold bg-slate-300 text-slate-700 px-1.5 py-0.2 rounded inline-block uppercase tracking-wider scale-90">
                            Draft
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            
          </div>
        </div>

        {/* 3. Right Side: Interactive Profile Folder view */}
        <div className="lg:col-span-8">
          {activeMember && selectedMemberStats ? (
            <div className="space-y-6">
              
              {/* Member Core Profile Information Block */}
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-xs space-y-6">
                
                {/* ID Header card row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 text-indigo-700 font-mono text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {activeMember.memberNumber || "NEW APPLICANT"}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-slate-800 tracking-tight pt-1">
                      {activeMember.fullName}
                    </h3>
                  </div>

                  {/* Print / Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handlePrintMemberLedger}
                      className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-905 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs transition cursor-pointer hover:shadow-md active:scale-95"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{lang === "si" ? "ප්‍රින්ට් (Financial Card)" : "Print Ledger Booklet"}</span>
                    </button>
                  </div>
                </div>

                {/* Grid Demographic Specs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* NIC & Phone spec */}
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[9.5px] font-extrabold text-indigo-700 block uppercase tracking-wider">
                      {lang === "si" ? "හැඳුනුම්පත සහ දුරකථන" : "Identity & Phone info"}
                    </span>
                    <div className="space-y-2">
                      <div>
                        <span className="text-[8.5px] text-slate-400 block font-bold uppercase">National NIC</span>
                        <span className="font-mono text-[12px] font-bold text-slate-800">{activeMember.nic}</span>
                      </div>
                      <div>
                        <span className="text-[8.5px] text-slate-400 block font-bold uppercase">Mobile Number</span>
                        <span className="font-mono text-[12px] font-bold text-slate-800 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                          {activeMember.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Address spec */}
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[9.5px] font-extrabold text-indigo-700 block uppercase tracking-wider">
                      {lang === "si" ? "ස්ථිර පදිංචි ලිපිනය" : "Permanent Residency"}
                    </span>
                    <div className="space-y-1">
                      <span className="text-[8.5px] text-slate-400 block font-bold uppercase">Address Directory</span>
                      <p className="text-xs font-bold text-slate-700 leading-normal flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        {activeMember.address}
                      </p>
                    </div>
                  </div>

                  {/* Income Specs */}
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[9.5px] font-extrabold text-indigo-700 block uppercase tracking-wider">
                      {lang === "si" ? "ආදායම් විස්තර" : "Employment & Earnings"}
                    </span>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Monthly Wages:</span>
                        <span className="font-mono font-bold text-slate-800">{activeMember.earnings ? formatLKR(activeMember.earnings) : "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Side Income:</span>
                        <span className="font-mono font-bold text-slate-800">{activeMember.additionalIncome ? formatLKR(activeMember.additionalIncome) : "N/A"}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Sub-demographics on Close Relatives and Guarantor directories aggregated */}
                <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-indigo-500" />
                    <span>Aggregated Emergency Relatives & Guarantors Book</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                    {/* Relatives list from loans */}
                    <div className="space-y-2 border-r border-slate-200/50 pr-4">
                      <span className="text-[8.5px] text-indigo-900 font-extrabold uppercase block tracking-wider">
                        {lang === "si" ? "ලියාපදිංචි ඥාතීන්" : "Primary Declared Relatives"}
                      </span>
                      {activeMember.loans.map((l, idx) => {
                        if (!l.relative || !l.relative.name) return null;
                        return (
                          <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-150 space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-slate-850 leading-tight">{l.relative.name}</span>
                              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md uppercase text-[7.5px]">{l.relative.relationship}</span>
                            </div>
                            <div className="text-[9px] text-slate-400 font-medium font-mono">
                              NIC: {l.relative.nic} | Phone: {l.relative.phone}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Guarantor listing */}
                    <div className="space-y-2">
                      <span className="text-[8.5px] text-indigo-900 font-extrabold uppercase block tracking-wider">
                        {lang === "si" ? "ලියාපදිංචි ඇපකරුවන්" : "Cosigners & Guarantor Bounds"}
                      </span>
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                        {activeMember.loans.flatMap((l, lIdx) => {
                          const list = [];
                          if (l.guarantor1?.name) list.push({ g: l.guarantor1, loan: l.officeUse.applicationNumber });
                          if (l.guarantor2?.name) list.push({ g: l.guarantor2, loan: l.officeUse.applicationNumber });
                          return list;
                        }).map((item, idx) => (
                          <div key={idx} className="p-2 rounded-xl bg-white border border-slate-150 text-[9.5px]">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-slate-800">{item.g.name}</span>
                              <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded uppercase text-[7.5px]">L: #{item.loan}</span>
                            </div>
                            <div className="text-[9px] text-slate-400 font-medium font-mono mt-0.5">
                              ID: {item.g.nic} | TEL: {item.g.phone}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Members complete portfolio records */}
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-xs space-y-4">
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>{lang === "si" ? "ක්‍රියාත්මක වූ සියලුම ණය ගිණුම්" : "Active & Completed Credit Portfolio Books"}</span>
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <th className="py-2.5 px-3">Loan App No</th>
                        <th className="py-2.5 px-3">Approved Principal</th>
                        <th className="py-2.5 px-3">Interest %</th>
                        <th className="py-2.5 px-3">Total Due</th>
                        <th className="py-2.5 px-3">Amount Repaid</th>
                        <th className="py-2.5 px-3">Outstanding</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {activeMember.loans.map((l) => {
                        const paid = l.collections.reduce((sum, c) => sum + c.amount, 0);
                        const totalDue = l.officeUse.approvedAmount + (l.officeUse.approvedAmount * (l.officeUse.interestRate / 100));
                        const balance = Math.max(0, totalDue - paid);

                        return (
                          <tr key={l.id} className="hover:bg-slate-50/40 transition">
                            <td className="py-3 px-3 font-bold font-mono text-indigo-600">#{l.officeUse.applicationNumber}</td>
                            <td className="py-3 px-3 font-black text-slate-850 font-mono">{formatLKR(l.officeUse.approvedAmount)}</td>
                            <td className="py-3 px-3 font-semibold text-slate-500 font-mono">{l.officeUse.interestRate}%</td>
                            <td className="py-3 px-3 font-bold text-slate-700 font-mono">{formatLKR(totalDue)}</td>
                            <td className="py-3 px-3 font-bold text-emerald-600 font-mono">{formatLKR(paid)}</td>
                            <td className={`py-3 px-3 font-black font-mono ${balance > 0 ? "text-rose-500" : "text-slate-400"}`}>
                              {formatLKR(balance)}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`inline-flex items-center gap-1 font-mono text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                                l.status === "COMPLETED" 
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                  : l.status === "ACTIVE"
                                  ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                  : l.status === "OVERDUE"
                                  ? "bg-rose-50 text-rose-700 border border-rose-100 animate-pulse"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}>
                                {l.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => {
                                  onSelectLoan(l.id);
                                  setActiveTab("LOAN_DETAILS");
                                }}
                                className="text-xs font-bold text-slate-700 hover:text-indigo-600 cursor-pointer active:scale-95 transition-all outline-hidden inline-flex items-center gap-0.5"
                              >
                                View 
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Members Unified Payment History Collection ledger */}
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-xs space-y-4">
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>{lang === "si" ? "සිදුකල සියලුම ගෙවීම් සම්බන්ධ ඉතිහාසය" : "Chronological Repayments Collection Log Pipeline"}</span>
                </h4>

                {selectedMemberStats.paymentHistory.length === 0 ? (
                  <div className="text-center py-10 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto stroke-1" />
                    <p className="text-[11px] font-bold text-slate-500 mt-1">No collections post for this member recorded yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider">
                          <th className="py-2.5 px-3">Date Collected</th>
                          <th className="py-2.5 px-3">Receipt Number</th>
                          <th className="py-2.5 px-3">Loan Target</th>
                          <th className="py-2.5 px-3">Installment Target</th>
                          <th className="py-2.5 px-3">Memo notes</th>
                          <th className="py-2.5 px-3 text-right">Amount Collected</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {selectedMemberStats.paymentHistory.map((item) => (
                          <tr key={item.collection.id} className="hover:bg-slate-50/40 transition">
                            <td className="py-3 px-3 font-semibold font-mono text-slate-500">{item.collection.date}</td>
                            <td className="py-3 px-3 font-bold font-mono text-indigo-950 uppercase tracking-wide">
                              {item.collection.receiptNumber}
                            </td>
                            <td className="py-3 px-3 font-bold text-slate-700 font-mono">
                              #{item.loanAppNo}
                            </td>
                            <td className="py-3 px-3 font-medium text-slate-650">
                              {item.collection.monthOfCollection || "General"}
                            </td>
                            <td className="py-3 px-3 font-medium text-slate-400 italic">
                              {item.collection.notes || "-"}
                            </td>
                            <td className="py-3 px-3 text-right font-black text-emerald-600 font-mono">
                              +{formatLKR(item.collection.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center text-slate-400 font-bold block">
              Please select a registered member to view their microfinance portfolio and comprehensive ledger history.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
