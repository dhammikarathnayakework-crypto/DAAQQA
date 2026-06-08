/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from "react";
import { Download, Upload, AlertCircle, CheckCircle, Database } from "lucide-react";
import { Loan } from "../types";

interface BackupManagerProps {
  loans: Loan[];
  onRestore: (restoredLoans: Loan[]) => void;
}

export default function BackupManager({ loans, onRestore }: BackupManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(loans, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const timestamp = new Date().toISOString().slice(0, 10);
      const exportFileDefaultName = `seth_capital_loans_backup_${timestamp}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      setStatus({
        type: "success",
        message: "දත්ත සාර්ථකව පරිගණකයට බාගත කරන ලදී! Data exported successfully!",
      });
      setTimeout(() => setStatus({ type: null, message: "" }), 5000);
    } catch {
      setStatus({
        type: "error",
        message: "බාගත කිරීමේදී දෝෂයක් සිදු විය. Failed to export database.",
      });
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;

    if (!files || files.length === 0) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          // A basic validation check for schema
          const isValid = parsed.every((item) => item.id && item.applicant && item.officeUse);
          if (isValid) {
            onRestore(parsed);
            setStatus({
              type: "success",
              message: "දත්ත සාර්ථකව ප්‍රතිස්ථාපනය කරන ලදී! Database restored successfully!",
            });
            setTimeout(() => setStatus({ type: null, message: "" }), 5000);
          } else {
            throw new Error("Invalid structure");
          }
        } else {
          throw new Error("Not an array");
        }
      } catch {
        setStatus({
          type: "error",
          message: "වළංගු නොවන බැකප් ගොනුවකි. කරුණාකර නිවැරදි ගොනුවක් තෝරන්න. Invalid backup file format.",
        });
      }
    };

    fileReader.readAsText(files[0]);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
      <div className="flex items-center gap-3 mb-4">
        <Database className="w-5 h-5 text-emerald-400" />
        <h3 className="font-semibold text-lg text-slate-100 font-sans">
          දත්ත උපස්ථය සහ ප්‍රතිස්ථාපනය (Database Backup & Restore)
        </h3>
      </div>
      
      <p className="text-slate-400 text-sm mb-6 leading-relaxed">
        ඔබගේ සියලුම ණය තොරතුරු සහ ගෙවීම් සටහන් ආරක්ෂිතව තබා ගැනීමට උපස්ථ ගොනුවක් (Backup) සාදා බාගත කරගන්න. අවශ්‍ය විටකදී එම ගොනුව නැවත ඇතුළත් කිරීමෙන් පෙර දත්ත ප්‍රතිස්ථාපනය කළ හැකිය.
      </p>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2.5 rounded-xl transition duration-200 shadow-lg shadow-emerald-905/30 text-sm cursor-pointer"
        >
          <Download className="w-4 h-4" />
          දත්ත බාගත කරන්න (Backup Database JSON)
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-medium px-5 py-2.5 rounded-xl transition duration-200 text-sm cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          වෙතින් දත්ත ඇතුළු කරන්න (Upload Backup)
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImport}
          accept=".json"
          className="hidden"
        />
      </div>

      {status.type && (
        <div
          className={`mt-4 p-4 rounded-xl flex items-start gap-3 border ${
            status.type === "success"
              ? "bg-slate-900/50 border-emerald-500/30 text-emerald-400"
              : "bg-slate-900/50 border-rose-500/30 text-rose-400"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm font-medium">{status.message}</span>
        </div>
      )}
    </div>
  );
}
