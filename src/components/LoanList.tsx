/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  Activity,
  CheckCircle,
  AlertTriangle,
  ArrowUpDown,
  FileSpreadsheet
} from "lucide-react";
import { Loan } from "../types";
import { formatLKR } from "../utils";
import { translations, Language } from "../translations";

interface LoanListProps {
  loans: Loan[];
  onSelectLoan: (loanId: string) => void;
  onEditLoan: (loan: Loan) => void;
  onDeleteLoan: (loanId: string) => void;
  lang: Language;
}

export default function LoanList({ loans, onSelectLoan, onEditLoan, onDeleteLoan, lang }: LoanListProps) {
  const t = translations[lang];
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortAsc, setSortAsc] = useState(false);

  // Filter & Search Logic
  const filteredLoans = loans
    .filter((loan) => {
      const query = search.toLowerCase();
      const matchSearch =
        loan.applicant.fullName.toLowerCase().includes(query) ||
        loan.applicant.nic.toLowerCase().includes(query) ||
        loan.applicant.phone.includes(query) ||
        loan.officeUse.applicationNumber.toLowerCase().includes(query);

      const matchStatus =
        statusFilter === "ALL" || loan.status === statusFilter;

      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === "date") {
        comparison = new Date(a.officeUse.loanDate).getTime() - new Date(b.officeUse.loanDate).getTime();
      } else if (sortField === "amount") {
        comparison = a.officeUse.approvedAmount - b.officeUse.approvedAmount;
      }
      return sortAsc ? comparison : -comparison;
    });

  const toggleSort = (field: "date" | "amount") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const getStatusBadge = (status: Loan["status"]) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-650 px-2.5 py-1 rounded-full text-xs font-bold border border-blue-100">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> {t.active}
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-650 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-100">
            <CheckCircle className="w-3.5 h-3.5" /> {t.completed}
          </span>
        );
      case "OVERDUE":
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-650 px-2.5 py-1 rounded-full text-xs font-bold border border-rose-100">
            <AlertTriangle className="w-3.5 h-3.5" /> {t.overdue}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-650 px-2.5 py-1 rounded-full text-xs font-bold border border-slate-100">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 select-none animate-fade-in">
      {/* Title block */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 font-display mb-1 leading-tight flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
          {t.listTitle}
        </h2>
        <p className="text-slate-500 text-sm font-sans">
          {t.listDesc}
        </p>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4.5 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search Field */}
        <div className="relative md:col-span-5">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-slate-500" />
          </span>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold border border-slate-200 hover:border-slate-350 bg-slate-50/10 rounded-xl focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 text-slate-750 transition"
          />
        </div>

        {/* Status Dropdown */}
        <div className="relative md:col-span-3">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Filter className="w-4 h-4 text-slate-500" />
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 text-xs font-bold border border-slate-200 hover:border-slate-350 bg-white text-slate-755 rounded-xl focus:outline-hidden focus:focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 transition cursor-pointer appearance-none"
          >
            <option value="ALL">{t.filterAll}</option>
            <option value="ACTIVE">{t.filterActive}</option>
            <option value="OVERDUE">{t.filterOverdue}</option>
            <option value="COMPLETED">{t.filterCompleted}</option>
          </select>
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-[9px]">▼</span>
        </div>

        {/* Quick Sorting Toggles */}
        <div className="flex md:col-span-4 justify-end gap-2 text-[11px] font-bold">
          <button
            onClick={() => toggleSort("date")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border rounded-xl transition cursor-pointer select-none ${
              sortField === "date" 
                ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {lang === "si" ? "දිනය" : "Grant Date"}
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={() => toggleSort("amount")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border rounded-xl transition cursor-pointer select-none ${
              sortField === "amount" 
                ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {lang === "si" ? "මුදල" : "Principal Value"}
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table & List View */}
      {filteredLoans.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center text-slate-400">
          <FileSpreadsheet className="w-12 h-12 mx-auto stroke-1 mb-3 text-slate-300" />
          <p className="text-base font-bold text-slate-700 font-sans mb-1">
            {t.noLoansFound}
          </p>
          <p className="text-xs text-slate-400">
            {t.noLoansSub}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                  <th className="py-4 px-6">{t.lhLoanId}</th>
                  <th className="py-4 px-6">{t.lhApplicant}</th>
                  <th className="py-4 px-6">{lang === "si" ? "දිනය" : "Date"}</th>
                  <th className="py-4 px-6 text-right">{t.lhAmount}</th>
                  <th className="py-4 px-6 text-right">{t.colTotal}</th>
                  <th className="py-4 px-6 text-right font-black text-rose-600">{t.colBalance}</th>
                  <th className="py-4 px-6 text-center">{t.lhStatus}</th>
                  <th className="py-4 px-6 text-center">{t.lhActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLoans.map((loan) => {
                  const approved = loan.officeUse.approvedAmount;
                  const totalWithInt = approved + (approved * (loan.officeUse.interestRate / 100));
                  const paid = loan.collections.reduce((sum, coll) => sum + coll.amount, 0);
                  const outstanding = totalWithInt - paid;

                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6 font-mono text-xs font-bold text-indigo-600">
                        {loan.officeUse.applicationNumber}
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-slate-700 font-sans leading-none">{loan.applicant.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-bold font-mono">NIC: {loan.applicant.nic} | TEL: {loan.applicant.phone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[11px] text-slate-505 font-mono font-bold">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {loan.officeUse.loanDate}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-xs font-black text-slate-700">
                        {formatLKR(approved)}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-xs font-semibold text-slate-500">
                        {formatLKR(totalWithInt)}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-xs font-black text-rose-600">
                        {formatLKR(outstanding)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {getStatusBadge(loan.status)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectLoan(loan.id)}
                            title={t.actionView}
                            className="p-2 text-indigo-605 bg-indigo-50/50 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditLoan(loan)}
                            title={t.actionEdit}
                            className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(lang === "si" ? "මෙම ණය අයදුම්පත සම්පූර්ණයෙන්ම පද්ධතියෙන් ඉවත් කිරීමට අවශ්‍යද?" : "Erase this active loan from system directory permanently?")) {
                                onDeleteLoan(loan.id);
                              }
                            }}
                            title={t.actionDelete}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Grid/Card View (Better UX on small screens) */}
          <div className="lg:hidden divide-y divide-slate-100">
            {filteredLoans.map((loan) => {
              const approved = loan.officeUse.approvedAmount;
              const totalWithInt = approved + (approved * (loan.officeUse.interestRate / 100));
              const paid = loan.collections.reduce((sum, coll) => sum + coll.amount, 0);
              const outstanding = totalWithInt - paid;

              return (
                <div key={loan.id} className="p-5 hover:bg-slate-50/50 transition space-y-4 font-sans">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded">
                      {loan.officeUse.applicationNumber}
                    </span>
                    {getStatusBadge(loan.status)}
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-800 leading-none">{loan.applicant.fullName}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">NIC: {loan.applicant.nic} | TEL: {loan.applicant.phone}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Approved on {loan.officeUse.loanDate}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-y border-slate-50 py-3 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">{lang === "si" ? "ප්‍රාග්ධනය" : "Principal"}</span>
                      <span className="font-mono text-[10px] font-bold text-slate-700">{formatLKR(approved).replace("Rs.", "Rs")}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">{lang === "si" ? "පොලිය සමඟ" : "Total Term"}</span>
                      <span className="font-mono text-[10px] font-medium text-slate-500">{formatLKR(totalWithInt).replace("Rs.", "Rs")}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase text-rose-500">{lang === "si" ? "හිඟය" : "Due Bal"}</span>
                      <span className="font-mono text-[10px] font-bold text-rose-600">{formatLKR(outstanding).replace("Rs.", "Rs")}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      Paid: <b className="font-mono text-slate-700">{formatLKR(paid)}</b>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectLoan(loan.id)}
                        className="flex items-center gap-1 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition cursor-pointer shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" /> Statement
                      </button>
                      <button
                        onClick={() => onEditLoan(loan)}
                        className="p-1.5 border border-slate-200 text-slate-600 rounded-lg bg-white cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(lang === "si" ? "මෙම ණය අයදුම්පත පද්ධතියෙන් ඉවත් කිරීමට අවශ්‍යද?" : "Erase asset record?")) {
                            onDeleteLoan(loan.id);
                          }
                        }}
                        className="p-1.5 border border-rose-200 text-rose-500 rounded-lg bg-white cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
