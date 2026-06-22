import React from "react";
import { 
  PiggyBank, 
  Coins, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Percent, 
  ChevronRight,
  TrendingUp,
  CreditCard,
  UserCheck
} from "lucide-react";
import { Loan, FieldOfficer, Investor, OfficeExpenseItem } from "../types";
import { getLoanStats, formatLKR } from "../utils";
import { translations, Language } from "../translations";

interface DashboardProps {
  loans: Loan[];
  fieldOfficers: FieldOfficer[];
  investors: Investor[];
  officeExpenses?: OfficeExpenseItem[];
  onSelectLoan: (id: string) => void;
  lang: Language;
}

export default function Dashboard({ loans, fieldOfficers, investors, officeExpenses = [], onSelectLoan, lang }: DashboardProps) {
  const t = translations[lang] || translations.en;
  const stats = getLoanStats(loans);

  // Status counters
  const activeCount = loans.filter((l) => l.status === "ACTIVE").length;
  const overdueCount = loans.filter((l) => l.status === "OVERDUE").length;
  const completedCount = loans.filter((l) => l.status === "COMPLETED").length;
  const pendingCount = loans.filter((l) => l.status === "PENDING").length;

  // Collection aggregate across all loans
  const allCollections = loans.flatMap((l) => {
    return (l.collections || []).map((c) => {
      const officer = fieldOfficers.find((o) => o.id === c.officerId);
      const officerName = officer ? officer.name : (lang === "si" ? "ප්‍රධාන කාර්යාලය" : "Head Office");
      return {
        ...c,
        loanId: l.id,
        borrowerName: l.applicant.fullName,
        nic: l.applicant.nic,
        officerName
      };
    });
  });

  // Sort by date desc
  const sortedCollections = [...allCollections].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const recentCollections = sortedCollections.slice(0, 5);

  const collectionRatio = stats.totalToPay > 0 
    ? Math.min(100, Math.round((stats.totalPaid / stats.totalToPay) * 100)) 
    : 0;

  // Investment Amount (combines all active net capital investment values)
  const totalInvestmentAmount = (investors || []).reduce((sum, inv) => {
    const grossInvestment = (inv.transactions || [])
      .filter(t => t.type === 'INVESTMENT')
      .reduce((s, t) => s + t.amount, 0);
    const grossWithdrawals = (inv.transactions || [])
      .filter(t => t.type === 'WITHDRAWAL')
      .reduce((s, t) => s + t.amount, 0);
    return sum + (grossInvestment - grossWithdrawals);
  }, 0);

  // Transfer Amount (overall accepted on-the-road rep-to-rep collections)
  const totalTransferAmount = (fieldOfficers || []).reduce((sum, o) => {
    const acceptedOut = (o.repTransfers || [])
      .filter(t => t.status === 'ACCEPTED')
      .reduce((s, t) => s + t.amount, 0);
    return sum + acceptedOut;
  }, 0);

  // Total Company Expenses
  const totalCompanyExpenses = (fieldOfficers || []).reduce((sum, o) => {
    const activeExps = (o.expenses || [])
      .filter(e => e.status === undefined || e.status === 'APPROVED')
      .reduce((s, e) => s + e.amount, 0);
    return sum + activeExps;
  }, 0) + (officeExpenses || []).filter(e => e.status === 'APPROVED').reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6 font-sans select-none animate-fade-in" id="dashboard-root">
      
      {/* Decorative Brand Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950 rounded-3xl p-6 md:p-8 border border-indigo-800 shadow-xl relative overflow-hidden" id="dashboard-header-card">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-[10px] text-indigo-300 font-extrabold uppercase tracking-widest">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t.version || "v1.5 Premium"}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">
            {t.overviewTitle || "Analytical Intelligence Overview"}
          </h2>
          <p className="text-indigo-200/80 text-xs max-w-2xl font-medium">
            {t.overviewDesc || "Real-time summary dashboard of credit distribution, payment metrics, and active collections."}
          </p>
        </div>
      </div>

      {/* Main 4-Column Financial Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-bento-grid">
        
        {/* Card 1: Principal Distributed */}
        <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-xs hover:shadow-md transition relative overflow-hidden flex flex-col justify-between min-h-[140px]" id="stat-card-approved">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {t.portfolioPrincipal || "Active Portfolio Principal"}
              </span>
              <h3 className="text-xl font-black text-slate-800 font-mono tracking-tight">
                {formatLKR(stats.totalApprovedValue)}
              </h3>
            </div>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-2xl">
              <CreditCard className="w-5 h-5 shrink-0" />
            </span>
          </div>
          <div className="flex items-center gap-1.5 pt-4 text-[10px] text-slate-400 border-t border-slate-100 font-bold">
            <span className="text-indigo-600">{stats.totalLoans}</span>
            <span>{t.totalLoans || "Total Distributed Portfolios"}</span>
          </div>
        </div>

        {/* Card 2: Total Repayable */}
        <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-xs hover:shadow-md transition relative overflow-hidden flex flex-col justify-between min-h-[140px]" id="stat-card-repayable">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {t.totalRepayable || "Total Portfolio Value"}
              </span>
              <h3 className="text-xl font-black text-slate-800 font-mono tracking-tight">
                {formatLKR(stats.totalToPay)}
              </h3>
            </div>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-2xl">
              <PiggyBank className="w-5 h-5 shrink-0" />
            </span>
          </div>
          <div className="flex items-center gap-1.5 pt-4 text-[10px] text-emerald-600 border-t border-slate-100 font-extrabold font-mono">
            <span>+{formatLKR(stats.totalInterest)}</span>
            <span className="text-slate-400 font-sans font-bold">{t.interestIncome || "with 25% Flat Interest"}</span>
          </div>
        </div>

        {/* Card 3: Total Collections */}
        <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-xs hover:shadow-md transition relative overflow-hidden flex flex-col justify-between min-h-[140px]" id="stat-card-collections">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {t.totalCollections || "Total Collections Inflow"}
              </span>
              <h3 className="text-xl font-black text-slate-800 font-mono tracking-tight">
                {formatLKR(stats.totalPaid)}
              </h3>
            </div>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-2xl">
              <Coins className="w-5 h-5 shrink-0" />
            </span>
          </div>
          <div className="pt-4 border-t border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
              <span>{t.collectedRatio || "Inflow Collection Ratio"}</span>
              <span className="font-mono text-emerald-600">{collectionRatio}%</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${collectionRatio}%` }}></div>
            </div>
          </div>
        </div>

        {/* Card 4: Outstanding Balance */}
        <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-xs hover:shadow-md transition relative overflow-hidden flex flex-col justify-between min-h-[140px]" id="stat-card-outstanding">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {t.outstandingBalance || "Outstanding Portfolio Balance"}
              </span>
              <h3 className="text-xl font-black text-rose-600 font-mono tracking-tight">
                {formatLKR(stats.outstandingBalance)}
              </h3>
            </div>
            <span className="p-2 bg-rose-50 text-rose-600 rounded-2xl">
              <Clock className="w-5 h-5 shrink-0" />
            </span>
          </div>
          <div className="pt-4 border-t border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
              <span>Remaining Portfolio</span>
              <span className="font-mono text-rose-500">{100 - collectionRatio}%</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-1 rounded-full" style={{ width: `${100 - collectionRatio}%` }}></div>
            </div>
          </div>
        </div>

      </div>

      {/* Minor Counters Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" id="dashboard-micro-counters">
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3">
          <span className="p-1.5 bg-indigo-500 text-white rounded-lg shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </span>
          <div>
            <span className="text-[9px] text-indigo-900/60 font-bold block uppercase">{t.activeLoans || "Active Accounts"}</span>
            <span className="font-mono font-black text-slate-800 text-xs">{activeCount}</span>
          </div>
        </div>

        <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 flex items-center gap-3">
          <span className="p-1.5 bg-rose-500 text-white rounded-lg shrink-0">
            <AlertCircle className="w-3.5 h-3.5" />
          </span>
          <div>
            <span className="text-[9px] text-rose-900/60 font-bold block uppercase">{t.overdueLoans || "Overdue Alerts"}</span>
            <span className="font-mono font-black text-slate-800 text-xs">{overdueCount}</span>
          </div>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
          <span className="p-1.5 bg-emerald-500 text-white rounded-lg shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </span>
          <div>
            <span className="text-[9px] text-emerald-900/60 font-bold block uppercase">{t.completedLoans || "Settled Accounts"}</span>
            <span className="font-mono font-black text-slate-800 text-xs">{completedCount}</span>
          </div>
        </div>

        <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
          <span className="p-1.5 bg-amber-500 text-white rounded-lg shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </span>
          <div>
            <span className="text-[9px] text-amber-900/60 font-bold block uppercase">Pending Approval</span>
            <span className="font-mono font-black text-slate-800 text-xs">{pendingCount}</span>
          </div>
        </div>
      </div>

      {/* Capital & Operations Desk Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="dashboard-capital-desk">
        {/* Card 1: Investment Amount */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[140px]" id="stat-card-investments">
          <div className="absolute right-0 top-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {lang === "si" ? "ක්‍රියාකාරී ශුද්ධ ආයෝජන ප්‍රාග්ධනය" : "Active Investment Capital"}
              </span>
              <h3 className="text-xl font-black text-indigo-300 font-mono tracking-tight">
                {formatLKR(totalInvestmentAmount)}
              </h3>
            </div>
            <span className="p-2.5 bg-slate-800 text-indigo-400 rounded-2xl border border-slate-700">
              <TrendingUp className="w-5 h-5 shrink-0" />
            </span>
          </div>
          <div className="flex items-center gap-1.5 pt-4 text-[10px] text-slate-400 border-t border-slate-800 font-bold">
            <span className="text-indigo-400">{(investors || []).length}</span>
            <span>{lang === "si" ? "ලියාපදිංචි ආයෝජකයින්ගේ දායකත්වය" : "Registered capital investors pooled"}</span>
          </div>
        </div>

        {/* Card 2: Transfer Amount */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[140px]" id="stat-card-transfers">
          <div className="absolute right-0 top-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {lang === "si" ? "සමස්ත නිලධාරි මාරු කිරීම් එකතුව" : "Aggregate Representative Transfers"}
              </span>
              <h3 className="text-xl font-black text-emerald-350 font-mono tracking-tight">
                {formatLKR(totalTransferAmount)}
              </h3>
            </div>
            <span className="p-2.5 bg-slate-800 text-emerald-400 rounded-2xl border border-slate-700">
              <ArrowUpRight className="w-5 h-5 shrink-0" />
            </span>
          </div>
          <div className="flex items-center gap-1.5 pt-4 text-[10px] text-slate-400 border-t border-slate-800 font-bold">
            <span className="text-emerald-400">
              {fieldOfficers.reduce((acc, o) => acc + (o.repTransfers?.filter(t => t.status === 'ACCEPTED').length || 0), 0)}
            </span>
            <span>{lang === "si" ? "සාර්ථකව තහවුරු කළ මුදල් මාරු කිරීම්" : "Vetted on-the-road cash handoffs"}</span>
          </div>
        </div>

        {/* Card 3: Total Company Expenses */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[140px]" id="stat-card-expenses">
          <div className="absolute right-0 top-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {lang === "si" ? "සමුච්චිත සමාගම් වියදම්" : "Cumulative Operations Expenditures"}
              </span>
              <h3 className="text-xl font-black text-amber-350 font-mono tracking-tight">
                {formatLKR(totalCompanyExpenses)}
              </h3>
            </div>
            <span className="p-2.5 bg-slate-800 text-amber-400 rounded-2xl border border-slate-700">
              <Coins className="w-5 h-5 shrink-0" />
            </span>
          </div>
          <div className="flex items-center gap-1.5 pt-4 text-[10px] text-slate-400 border-t border-slate-800 font-bold">
            <span className="text-amber-400">
              {fieldOfficers.reduce((acc, o) => acc + (o.expenses?.filter(e => e.status === undefined || e.status === 'APPROVED').length || 0), 0)}
            </span>
            <span>{lang === "si" ? "සංවිධානය සඳහා අනුමත වියදම් සඟරා" : "Vetted officer operational logs"}</span>
          </div>
        </div>
      </div>

      {/* Live Streams Section */}
      <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-xs space-y-4" id="dashboard-livestream-panel">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-tight">
              {t.recentCollections || "Live Collection Activity Streams"}
            </h4>
            <p className="text-[10px] text-slate-400 font-medium">
              {t.recentCollectionsSub || "Latest 5 payment collection actions registered in the system ledger."}
            </p>
          </div>
          <span className="px-2.5 py-0.5 text-[9px] font-black bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200 animate-pulse uppercase tracking-wider">
            Live Stream
          </span>
        </div>

        {recentCollections.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-1 bg-slate-50/50 rounded-2xl border border-slate-100">
            <Coins className="w-8 h-8 text-slate-300 mx-auto stroke-1" />
            <h5 className="font-bold text-[11px] text-slate-600">
              {t.noRecentCollections || "No transaction history has been registered yet."}
            </h5>
            <p className="text-[9px] text-slate-400">
              {t.noRecentSub || "Registered collections will populate in real-time."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto" id="dashboard-stream-table">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Receipt No</th>
                  <th className="py-2.5 px-3">Borrower / Client</th>
                  <th className="py-2.5 px-3">Rep Officer</th>
                  <th className="py-2.5 px-3 text-right">Collected Inflow</th>
                  <th className="py-2.5 px-3">Collection Period</th>
                  <th className="py-2.5 px-3 text-right">Ledger Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentCollections.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-3 font-semibold font-mono text-slate-500 text-[11px]">
                      {item.date}
                    </td>
                    <td className="py-3 px-3 font-bold font-mono text-slate-800 text-[11px]">
                      {item.receiptNumber}
                    </td>
                    <td className="py-3 px-3">
                      <div>
                        <p className="font-bold text-slate-800">{item.borrowerName}</p>
                        <p className="text-[9px] text-slate-400 font-mono">{item.nic}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-[10px] text-indigo-600 font-sans font-black uppercase">
                          {item.officerName.charAt(0)}
                        </span>
                        <span className="text-slate-600 font-medium text-[11px]">{item.officerName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-600 font-mono text-[11px]">
                      +{formatLKR(item.amount)}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {item.monthOfCollection}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectLoan(item.loanId)}
                        className="p-1 px-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-[9px] font-extrabold inline-flex items-center gap-0.5 cursor-pointer transition select-none active:scale-95"
                      >
                        <span>Ledger</span>
                        <ChevronRight className="w-3" />
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
  );
}
