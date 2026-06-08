/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  PieChart as PieIcon, 
  ArrowUpRight, 
  AlertCircle, 
  Calendar,
  CheckCircle,
  TrendingDown,
  BarChart3,
  Activity,
  Layers,
  HelpCircle,
  Clock,
  Briefcase
} from "lucide-react";
import { Loan } from "../types";
import { formatLKR, getLoanStats } from "../utils";
import { translations, Language } from "../translations";

interface DashboardProps {
  loans: Loan[];
  onSelectLoan: (loanId: string) => void;
  lang: Language;
}

export default function Dashboard({ loans, onSelectLoan, lang }: DashboardProps) {
  const t = translations[lang];
  const stats = getLoanStats(loans);
  
  const [activeChartTab, setActiveChartTab] = useState<"COMPARISON" | "PURPOSE">("COMPARISON");
  const [hoveredLoanId, setHoveredLoanId] = useState<string | null>(null);

  // Math for main progress circle
  const collectionProgress = stats.totalToPay > 0 
    ? (stats.totalPaid / stats.totalToPay) * 100 
    : 0;

  // Recent Collections
  const recentCollections = loans
    .flatMap((l) => l.collections.map((c) => ({ ...c, loanApplicant: l.applicant.fullName, loanId: l.id })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const activeLoansCount = loans.filter(l => l.status === "ACTIVE").length;
  const overdueLoansCount = loans.filter(l => l.status === "OVERDUE").length;
  const completedLoansCount = loans.filter(l => l.status === "COMPLETED").length;

  // Chart data calculations
  const chartMaxAmount = Math.max(...loans.map(l => l.officeUse.approvedAmount + (l.officeUse.approvedAmount * (l.officeUse.interestRate / 100))), 15000);

  // Purpose extraction and aggregation
  const purposeMap = loans.reduce((acc, loan) => {
    // Simplify purpose text for visual labels
    let category = lang === "si" ? "ව්‍යාපාරික (Business)" : "Commercial Focus";
    const raw = loan.loanDetails.purpose.toLowerCase();
    
    if (raw.includes("cultivation") || raw.includes("wiga") || raw.includes("paddy") || raw.includes("කුකුළු") || raw.includes("farm") || raw.includes("vaga")) {
      category = lang === "si" ? "කෘෂිකාර්මික & සත්ත්ව" : "Agri & Poultry";
    } else if (raw.includes("salon") || raw.includes("රූපලාවන්‍ය")) {
      category = lang === "si" ? "සේවා අංශයේ" : "Service & Salon";
    } else if (raw.includes("tea") || raw.includes("කඩයක්") || raw.includes("stall") || raw.includes("shop")) {
      category = lang === "si" ? "ආහාර & වෙළෙඳ" : "Retail & Food";
    } else if (raw.includes("small") || raw.includes("ව්‍යාපාරික") || raw.includes("business")) {
      category = lang === "si" ? "කුඩා ව්‍යාපාර" : "Micro Enterprise";
    }

    if (!acc[category]) {
      acc[category] = { count: 0, approved: 0, repaid: 0 };
    }
    acc[category].count += 1;
    acc[category].approved += loan.officeUse.approvedAmount;
    acc[category].repaid += loan.collections.reduce((sum, c) => sum + c.amount, 0);
    return acc;
  }, {} as Record<string, { count: number; approved: number; repaid: number }>);

  const purposeList = Object.entries(purposeMap).map(([category, value]) => ({
    category,
    ...value,
    progress: value.approved > 0 ? (value.repaid / (value.approved * 1.25)) * 100 : 0
  }));

  return (
    <div className="space-y-8 select-none animate-fade-in">
      {/* Visual greeting and stats grid */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display mb-1 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600 stroke-2.5 animate-pulse" />
            {t.overviewTitle}
          </h2>
          <p className="text-slate-500 text-sm font-sans">
            {t.overviewDesc}
          </p>
        </div>
        <div className="bg-indigo-50/50 border border-indigo-100/80 rounded-2xl px-4 py-2 flex items-center gap-2 text-xs text-indigo-700 font-bold font-sans">
          <Clock className="w-4 h-4 text-indigo-500" />
          <span>Real-time Financial Year {new Date().getFullYear()}</span>
        </div>
      </div>

      {/* Grid of stats with soft card design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Portfolio value Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex items-start justify-between hover:shadow-sm hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-200">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase font-display">
              {t.portfolioPrincipal}
            </span>
            <div className="text-2xl font-bold text-slate-900 font-display">
              {formatLKR(stats.totalApprovedValue)}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {t.totalLoans} <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-bold">{stats.totalLoans}</span>
            </p>
          </div>
          <span className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-indigo-100/10 shadow-md">
            <DollarSign className="w-5 h-5 stroke-2" />
          </span>
        </div>

        {/* Total target to get repayment card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex items-start justify-between hover:shadow-sm hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-200">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase font-display">
              {t.totalRepayable}
            </span>
            <div className="text-2xl font-bold text-slate-900 font-display">
              {formatLKR(stats.totalToPay)}
            </div>
            <p className="text-xs text-slate-500">
              <span className="text-emerald-600 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded">+{formatLKR(stats.totalInterest)}</span> {t.interestIncome}
            </p>
          </div>
          <span className="p-3 bg-purple-50 text-purple-600 rounded-2xl shadow-purple-100/10 shadow-md">
            <TrendingUp className="w-5 h-5 stroke-2" />
          </span>
        </div>

        {/* Total Collected card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex items-start justify-between hover:shadow-sm hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-200">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase font-display">
              {t.totalCollections}
            </span>
            <div className="text-2xl font-bold text-slate-900 font-display">
              {formatLKR(stats.totalPaid)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${Math.min(100, collectionProgress)}%` }} 
                />
              </div>
              <span className="text-[10px] font-mono font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                {collectionProgress.toFixed(1)}%
              </span>
            </div>
          </div>
          <span className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-emerald-100/10 shadow-md">
            <CheckCircle className="w-5 h-5 stroke-2" />
          </span>
        </div>

        {/* Outstanding Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex items-start justify-between hover:shadow-sm hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-200">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase font-display">
              {t.outstandingBalance}
            </span>
            <div className="text-2xl font-bold text-rose-600 font-display">
              {formatLKR(stats.outstandingBalance)}
            </div>
            <p className="text-xs text-slate-500">
              {lang === "si" ? "නැවත එකතු කරගත යුතු හිඟ මුදල" : "Remaining Portfolio Risk Value"}
            </p>
          </div>
          <span className="p-3 bg-rose-50 text-rose-600 rounded-2xl shadow-rose-100/10 shadow-md">
            <TrendingDown className="w-5 h-5 stroke-2" />
          </span>
        </div>
      </div>

      {/* Advanced Chart Workspace Panel */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs hover:shadow-xs transition duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <h3 className="font-bold text-slate-900 font-display text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              {lang === "si" ? "උසස් මූල්‍ය ප්‍රස්ථාර විශ්ලේෂණය" : "Advanced Financial Analytics Workspace"}
            </h3>
            <p className="text-slate-400 text-xs mt-0.5 font-sans">
              {lang === "si" ? "ප්‍රාග්ධන ව්‍යාප්තිය සහ ආපසු ගෙවීම් සංසන්දනාත්මක විශ්ලේෂණය" : "Interactive comparative visualizations for capital flow and asset classes"}
            </p>
          </div>

          {/* Toggle buttons for chart categories with sleek pill tab control */}
          <div className="flex bg-slate-100 p-1.2 rounded-xl self-start border border-slate-200/45">
            <button
              onClick={() => setActiveChartTab("COMPARISON")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer select-none ${
                activeChartTab === "COMPARISON"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {lang === "si" ? "ණය ප්‍රාග්ධනය vs ගෙවීම්" : "Disbursement vs Repaid"}
            </button>
            <button
              onClick={() => setActiveChartTab("PURPOSE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer select-none ${
                activeChartTab === "PURPOSE"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {lang === "si" ? "ණය ලබාගත් අරමුණු" : "Sector Allocation"}
            </button>
          </div>
        </div>

        {/* Render Selected Chart View */}
        {activeChartTab === "COMPARISON" ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border">
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                  <span className="w-3.5 h-3.5 bg-indigo-600 rounded-sm inline-block" />
                  {lang === "si" ? "අනුමත මුල් මුදල" : "Approved Amount"}
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                  <span className="w-3.5 h-3.5 bg-emerald-500 rounded-sm inline-block" />
                  {lang === "si" ? "මෙතෙක් ලැබුණු ගෙවීම්" : "Collected Repayments"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans italic">
                {lang === "si" ? "* ප්‍රස්ථාරයේ ඇති තීරුවක් මතින් Mouse එක ගෙනයන්න" : "* Hover over columns to preview granular ratios"}
              </p>
            </div>

            {/* Custom Interactive SVG Comparative Bar Graph */}
            <div className="relative pt-6">
              {loans.length === 0 ? (
                <div className="py-20 text-center text-slate-400 border border-dashed border-slate-100 rounded-2xl">
                  <AlertCircle className="w-10 h-10 mx-auto opacity-40 mb-2" />
                  No loans registered to render chart analytics.
                </div>
              ) : (
                <div className="relative w-full h-80">
                  {/* Outer grid boundaries */}
                  <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none select-none">
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => (
                      <div key={idx} className="flex items-center w-full">
                        <span className="w-14 text-[9px] font-mono text-slate-400 font-semibold text-right pr-3.5">
                          {formatLKR(chartMaxAmount * ratio).replace("Rs.", "Rs")}
                        </span>
                        <div className="flex-1 border-t border-slate-100 border-dashed" />
                      </div>
                    ))}
                  </div>

                  {/* Interacting bar container */}
                  <div className="absolute left-14 right-0 top-0 bottom-6 flex items-end justify-around px-2">
                    {loans.map((loan, idx) => {
                      const approvedWithInt = loan.officeUse.approvedAmount * (1 + loan.officeUse.interestRate/100);
                      const totalPaidForLoan = loan.collections.reduce((sum, c) => sum + c.amount, 0);

                      // Calculate absolute heights
                      const heightFactorApproved = (loan.officeUse.approvedAmount / chartMaxAmount) * 100;
                      const heightFactorPaid = (totalPaidForLoan / chartMaxAmount) * 100;
                      const isHovered = hoveredLoanId === loan.id;

                      return (
                        <div 
                          key={loan.id} 
                          className="flex flex-col items-center group relative cursor-pointer"
                          style={{ width: `${80 / loans.length}%` }}
                          onMouseEnter={() => setHoveredLoanId(loan.id)}
                          onMouseLeave={() => setHoveredLoanId(null)}
                          onClick={() => onSelectLoan(loan.id)}
                        >
                          <div className="flex items-end gap-1.5 w-full justify-center max-w-[90px] h-60">
                            {/* Approved Bar */}
                            <div 
                              className={`w-6 sm:w-8 rounded-t-lg transition-all duration-300 relative ${
                                isHovered ? "bg-indigo-700 shadow-lg shadow-indigo-600/30" : "bg-indigo-600"
                              }`}
                              style={{ height: `${Math.max(5, heightFactorApproved)}%` }}
                            />
                            {/* Paid Bar */}
                            <div 
                              className={`w-6 sm:w-8 rounded-t-lg transition-all duration-300 relative ${
                                isHovered ? "bg-emerald-600 shadow-lg shadow-emerald-500/35 animate-none" : "bg-emerald-500"
                              }`}
                              style={{ height: `${Math.max(5, heightFactorPaid)}%` }}
                            />
                          </div>

                          {/* Float hovering dynamic label info panel */}
                          {isHovered && (
                            <div className="absolute bottom-64 z-20 bg-slate-900 text-white text-[11px] p-4 rounded-2xl shadow-xl border border-slate-800 w-52 text-left pointer-events-none space-y-2">
                              <p className="font-bold border-b border-slate-850 pb-1.5 font-sans truncate">{loan.applicant.fullName}</p>
                              <div className="space-y-1 font-mono text-[10px]">
                                <p className="flex justify-between">
                                  <span>Approved:</span>
                                  <span className="font-semibold text-indigo-300">{formatLKR(loan.officeUse.approvedAmount)}</span>
                                </p>
                                <p className="flex justify-between">
                                  <span>Interest:</span>
                                  <span className="font-semibold text-purple-300">+{loan.officeUse.interestRate}%</span>
                                </p>
                                <p className="flex justify-between">
                                  <span>Collected:</span>
                                  <span className="font-semibold text-emerald-450">{formatLKR(totalPaidForLoan)}</span>
                                </p>
                                <p className="flex justify-between font-bold border-t border-slate-800 pt-1 text-xs text-rose-455">
                                  <span>Outstanding:</span>
                                  <span>{formatLKR(approvedWithInt - totalPaidForLoan)}</span>
                                </p>
                              </div>
                              <p className="text-[9px] text-indigo-400 font-semibold text-center pt-1 font-sans">
                                {lang === "si" ? "විස්තර පිටුවට යාමට ක්ලික් කරන්න" : "Click to View Details Statement"}
                              </p>
                            </div>
                          )}

                          {/* Base Ref Codes under Columns */}
                          <div className="absolute top-[102%] mt-1 text-[9px] sm:text-[10px] font-bold text-slate-500 font-mono text-center truncate w-full">
                            {loan.officeUse.applicationNumber}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Legend interactive indicator bar */}
            {hoveredLoanId && (
              <div className="bg-indigo-950/40 border border-indigo-900/10 p-3 rounded-2xl flex items-center justify-between text-xs text-indigo-900 animate-pulse transition">
                <span className="font-medium">
                  {lang === "si" ? "ප්‍රස්ථාරයෙන් තෝරාගත් අයදුම්පත:" : "Focused Application in Ledger:"} <strong>{loans.find(l => l.id === hoveredLoanId)?.applicant.fullName}</strong>
                </span>
                <span className="font-bold font-mono text-xs text-indigo-950">
                  {loans.find(l => l.id === hoveredLoanId)?.officeUse.applicationNumber}
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Sector Purpose category distributions */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">
                {lang === "si" ? "අංශ අනුව ණය ප්‍රාග්ධනය බෙදී යාම" : "Portfolio Distribution by Commercial Sector"}
              </h4>
              
              {purposeList.length === 0 ? (
                <p className="text-xs text-slate-400">No data to display sector distributions.</p>
              ) : (
                <div className="space-y-4">
                  {purposeList.map((item, idx) => (
                    <div key={idx} className="space-y-1 pb-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700 flex items-center gap-1.5 font-sans">
                          <span className="w-2.5 h-2.5 bg-indigo-605 rounded-full inline-block" />
                          {item.category}
                        </span>
                        <span className="text-slate-500 font-mono">{item.count} {lang === "si" ? "ණයක්" : "loans"} ({formatLKR(item.approved)})</span>
                      </div>
                      
                      {/* Interactive Visual Stacked Progress Bar */}
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden relative group">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-700" 
                          style={{ width: `${Math.min(100, (item.approved / stats.totalApprovedValue) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick analytic gauges and risk evaluation */}
            <div className="bg-slate-900/5 px-6 py-6 rounded-3xl border border-slate-100 space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5 font-sans mb-1.5">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  {lang === "si" ? "ණය පලදායීතා දර්ශකය" : "Risk Exposure Index"}
                </h4>
                <p className="text-[11px] text-slate-400 italic">
                  {lang === "si" ? "අනුමත මුළු ප්‍රාග්ධනයෙන් පද්ධතියට ලැබුණු ආපසු ගෙවීම් වේගය" : "Overall speed coefficient of liquid assets return"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white border p-4.5 rounded-2xl shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    {lang === "si" ? "ප්‍රාග්ධන වෙළඳපල" : "Active Capital"}
                  </span>
                  <span className="text-lg font-extrabold text-slate-800 font-mono">
                    {formatLKR(stats.totalApprovedValue).replace("Rs.", "Rs")}
                  </span>
                </div>
                <div className="bg-white border p-4.5 rounded-2xl shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    {lang === "si" ? "ලබාගත් පොලී අගය" : "Aggregated Interest"}
                  </span>
                  <span className="text-lg font-extrabold text-emerald-600 font-mono">
                    {formatLKR(stats.totalInterest).replace("Rs.", "Rs")}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 leading-relaxed font-sans bg-white p-3 border rounded-xl flex items-center gap-2">
                <span className="p-1.5 bg-emerald-50 rounded-full text-emerald-600 font-bold text-xs">✓</span>
                <span>
                  {lang === "si" 
                    ? "ශිරි ලංකා කුඩා පරිමාණ මූල්‍ය නිර්දේශයන්ට අනුව ණය එකතු කිරීම් සියල්ල සතුටුදායක තත්වයේ පවතී."
                    : "The aggregate portfolio is performing soundly on current liquid collection ratios."
                  }
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Two-Column Insights Area: Progress Circle & Recent Collections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Circular Progress & Distribution */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xs lg:col-span-5 flex flex-col items-center justify-between min-h-[400px]">
          <div className="w-full text-left">
            <h3 className="font-bold text-slate-900 font-display mb-1 text-sm md:text-base">
              {t.collectedRatio}
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              {t.ratioSub}
            </p>
          </div>

          <div className="relative flex items-center justify-center my-6">
            {/* SVG Progress Circle */}
            <svg className="w-48 h-48 transform -rotate-90">
              {/* Background ring */}
              <circle
                cx="96"
                cy="96"
                r="78"
                className="stroke-slate-100"
                strokeWidth="14"
                fill="transparent"
              />
              {/* Animated progress ring */}
              <circle
                cx="96"
                cy="96"
                r="78"
                className="stroke-emerald-500 transition-all duration-1000 ease-out"
                strokeWidth="14"
                strokeDasharray={2 * Math.PI * 78}
                strokeDashoffset={2 * Math.PI * 78 * (1 - collectionProgress / 100)}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            
            {/* Inner text metric */}
            <div className="absolute text-center">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {collectionProgress.toFixed(1)}%
              </span>
              <p className="text-[10px] text-slate-400 font-bold tracking-wide uppercase mt-1">
                {t.collectedBadgeText}
              </p>
            </div>
          </div>

          {/* Quick status breakdown block */}
          <div className="w-full grid grid-cols-3 gap-2 text-center border-t border-slate-100 pt-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 block">{t.activeLoans}</span>
              <span className="text-lg font-bold text-indigo-600 font-mono">{activeLoansCount}</span>
            </div>
            <div className="space-y-1 border-x border-slate-100">
              <span className="text-xs font-semibold text-slate-400 block">{t.overdueLoans}</span>
              <span className="text-lg font-bold text-rose-500 font-mono">{overdueLoansCount}</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 block">{t.completedLoans}</span>
              <span className="text-lg font-bold text-emerald-500 font-mono">{completedLoansCount}</span>
            </div>
          </div>
        </div>

        {/* Recent Collection Updates Feed */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xs lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 font-display mb-1 text-sm md:text-base">
                {t.recentCollections}
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                {t.recentCollectionsSub}
              </p>
            </div>
            <span className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-600 cursor-pointer">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>

          {recentCollections.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-100 rounded-2xl p-6">
              <AlertCircle className="w-10 h-10 mb-2 stroke-1" />
              <p className="text-sm">{t.noRecentCollections}</p>
              <p className="text-xs text-slate-400 mt-1">{t.noRecentSub}</p>
            </div>
          ) : (
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-slate-100">
                {recentCollections.map((collection, index) => (
                  <li 
                    key={collection.id || index} 
                    className="py-4 hover:bg-slate-50/50 px-3 -mx-3 rounded-2xl transition duration-150 cursor-pointer flex items-center justify-between"
                    onClick={() => onSelectLoan(collection.loanId)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-750 font-sans line-clamp-1">
                          {collection.loanApplicant}
                        </p>
                        <p className="text-[11px] text-slate-400 flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="font-mono text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-semibold">
                            {collection.receiptNumber}
                          </span>
                          <span className="flex items-center gap-1 font-semibold">
                            <Calendar className="w-3.5 h-3.5" />
                            {collection.date}
                          </span>
                          <span>•</span>
                          <span className="bg-indigo-50/50 px-1 py-0.2 rounded text-indigo-600 font-bold text-[10px]">{collection.monthOfCollection}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-sm font-black text-emerald-600 font-mono">
                        +{formatLKR(collection.amount)}
                      </span>
                      {collection.notes && (
                        <p className="text-[10px] text-slate-400 italic line-clamp-1">
                          {collection.notes}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
